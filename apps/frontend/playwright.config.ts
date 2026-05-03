import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const AUTH_STATE_PATH = path.resolve(__dirname, 'e2e/.auth/user.json');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: '**/global-setup.ts',
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_STATE_PATH,
      },
      dependencies: ['setup'],
      testIgnore: ['**/auth.spec.ts'],
    },
    {
      name: 'auth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/auth.spec.ts',
    },
  ],
  webServer: {
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      E2E_TEST_MODE: 'true',
      E2E_USER_ID: process.env.E2E_USER_ID ?? '11111111-1111-4111-8111-111111111111',
      USDA_FDC_API_KEY: process.env.USDA_FDC_API_KEY ?? 'test-key-e2e',
    },
  },
});
