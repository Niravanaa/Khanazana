import { NextRequest } from 'next/server';
import { getPublicEnv } from '@/lib/env';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  if (!path) return new Response('Missing path', { status: 400 });

  const { supabaseUrl } = getPublicEnv();
  const upstream = `${supabaseUrl}/storage/v1/object/public/recipe-images/${path}`;

  const res = await fetch(upstream);
  if (!res.ok) return new Response('Not found', { status: 404 });

  const contentType = res.headers.get('content-type') ?? 'application/octet-stream';
  return new Response(res.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
