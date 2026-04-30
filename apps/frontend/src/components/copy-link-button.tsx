'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      variant="outline"
      onClick={handleCopy}
      aria-label={copied ? 'Link copied to clipboard' : 'Copy shareable link to clipboard'}
    >
      {copied ? 'Copied!' : 'Copy link'}
      <span aria-live="polite" className="sr-only">
        {copied ? 'Link copied to clipboard' : ''}
      </span>
    </Button>
  );
}
