import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';

// Prisma 7 does not auto-load .env; skip gracefully in CI where the file won't exist
if (existsSync('.env')) process.loadEnvFile?.('.env');

const url = process.env.DATABASE_URL ?? '';

export default defineConfig({
  datasource: {
    url,
    adapter: () => new PrismaPg({ connectionString: url }),
  },
});
