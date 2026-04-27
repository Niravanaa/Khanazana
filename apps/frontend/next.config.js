/** @type {import('next').NextConfig} */
const fs = require('fs');
const path = require('path');

// Load root .env into process.env so Next.js can access it
function loadRootEnv() {
  try {
    const envPath = path.resolve(__dirname, '../../.env');
    console.log('[next.config.js] Looking for .env at:', envPath);
    if (fs.existsSync(envPath)) {
      console.log('[next.config.js] ✓ Found .env file');
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split(/\r?\n/);
      console.log(`[next.config.js] Total lines in .env: ${lines.length}`);
      
      let loadedCount = 0;
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const idx = trimmed.indexOf('=');
        if (idx === -1) return;
        const key = trimmed.slice(0, idx).trim();
        let value = trimmed.slice(idx + 1).trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        // Decode URL-encoded characters in connection strings
        if (key === 'DATABASE_URL' || key === 'DIRECT_URL') {
          value = decodeURIComponent(value);
          console.log(`[next.config.js] URL-decoded ${key}`);
        }
        
        // ALWAYS set these keys from .env to ensure correct values
        if (['DATABASE_URL', 'DIRECT_URL', 'SUPABASE_SERVICE_ROLE_KEY'].includes(key)) {
          process.env[key] = value;
          console.log(`[next.config.js] ✓ Force-set ${key}`);
          loadedCount++;
        } else if (process.env[key] === undefined) {
          // For other keys, only set if not already in process.env
          process.env[key] = value;
          console.log(`[next.config.js] ✓ Set ${key}`);
          loadedCount++;
        }
      });
      console.log(`[next.config.js] Loaded ${loadedCount} env variables`);
    } else {
      console.log('[next.config.js] ✗ .env file not found');
    }
  } catch (e) {
    console.warn('[next.config.js] Failed to load root .env:', e.message);
  }
}

loadRootEnv();

const nextConfig = {
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

module.exports = nextConfig;
