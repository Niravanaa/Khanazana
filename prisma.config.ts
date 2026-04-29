import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';

const configDir = dirname(fileURLToPath(import.meta.url));

// Prisma 7 does not auto-load .env; skip gracefully in CI where the file won't exist
if (existsSync(resolve(configDir, '.env'))) {
  const envPath = resolve(configDir, '.env');
  const envContent = readFileSync(envPath, 'utf-8');

  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const url = process.env.DATABASE_URL ?? '';
const directUrl = process.env.DIRECT_URL ?? url;

export default defineConfig({
  datasource: {
    url,
    directUrl,
    adapter: () => new PrismaPg({ connectionString: directUrl }),
  },
});
