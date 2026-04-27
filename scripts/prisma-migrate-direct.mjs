#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

function loadEnvFile(filePath) {
  const env = {};
  const content = readFileSync(filePath, 'utf-8');

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    env[key] = value;
  }

  return env;
}

const envPath = resolve('.env');
const fileEnv = loadEnvFile(envPath);
const directUrl = fileEnv.DIRECT_URL || fileEnv.DATABASE_URL;

if (!fileEnv.DATABASE_URL) {
  console.error('DATABASE_URL is required for migration commands.');
  process.exit(1);
}

const env = {
  ...process.env,
  ...fileEnv,
  DATABASE_URL: directUrl,
};

const args = process.argv.slice(2);
const child = spawn('pnpm', ['exec', 'prisma', 'migrate', ...args], {
  env,
  stdio: 'inherit',
  shell: true,
});

child.on('close', (code) => process.exit(code ?? 1));
