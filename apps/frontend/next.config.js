/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');
const fs = require('fs');
const path = require('path');

// Load root .env into process.env so Next.js can access it
function loadRootEnv() {
  try {
    const envPath = path.resolve(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split(/\r?\n/);

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const idx = trimmed.indexOf('=');
        if (idx === -1) return;
        const key = trimmed.slice(0, idx).trim();
        let value = trimmed.slice(idx + 1).trim();

        // Remove quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        // Decode URL-encoded characters in connection strings
        if (key === 'DATABASE_URL' || key === 'DIRECT_URL') {
          value = decodeURIComponent(value);
        }

        // ALWAYS set these keys from .env to ensure correct values
        if (['DATABASE_URL', 'DIRECT_URL', 'SUPABASE_SERVICE_ROLE_KEY'].includes(key)) {
          process.env[key] = value;
        } else if (process.env[key] === undefined) {
          // For other keys, only set if not already in process.env
          process.env[key] = value;
        }
      });
    }
  } catch (e) {
    // Intentionally ignore .env loading errors in config bootstrap.
  }
}

loadRootEnv();
const nextDistDir = process.env.NEXT_DIST_DIR?.trim();

const nextConfig = {
  ...(nextDistDir ? { distDir: nextDistDir } : {}),
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
  },
  images: {
    remotePatterns: [
      // Local Supabase
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '54331',
        pathname: '/storage/v1/object/public/**',
      },
      // Hosted Supabase (*.supabase.co)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
});
