import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';

// Support env files at repository root when frontend runs from apps/frontend.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  loadDotenv({ path: resolve(process.cwd(), '../../.env.local') });
  loadDotenv({ path: resolve(process.cwd(), '../../.env') });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
