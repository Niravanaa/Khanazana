'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';

interface ImageCropModalProps {
  src: string;
  onDone: (blob: Blob) => void;
  onCancel: () => void;
}

async function cropImageToBlob(src: string, pixelCrop: Area): Promise<Blob> {
  const image = new Image();
  image.src = src;
  await new Promise<void>((res, rej) => {
    image.onload = () => res();
    image.onerror = () => rej(new Error('Image load failed'));
  });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas crop failed'))),
      'image/jpeg',
      0.85,
    ),
  );
}

export function ImageCropModal({ src, onDone, onCancel }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleDone() {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const blob = await cropImageToBlob(src, croppedAreaPixels);
      onDone(blob);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Crop image"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div className="flex w-full max-w-lg flex-col gap-4 rounded-lg bg-background p-4 shadow-xl">
        <p className="text-sm font-semibold text-foreground">Crop image (2:1 ratio)</p>

        <div className="relative h-64 w-full overflow-hidden rounded-md bg-black">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={2}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
            aria-label="Zoom"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
          <Button type="button" onClick={handleDone} disabled={isProcessing}>
            {isProcessing ? 'Processing…' : 'Crop & Use'}
          </Button>
        </div>
      </div>
    </div>
  );
}
