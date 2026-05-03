import { Page } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_EMAIL ?? 'e2e@khanazana.local';
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'KhanazanaE2E123!';

export async function ensureAuthenticated(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(E2E_EMAIL);
  await page.getByLabel('Password').fill(E2E_PASSWORD);

  await Promise.all([
    page.waitForURL('**/recipes', { timeout: 15_000 }),
    page.locator('form').getByRole('button', { name: 'Sign In' }).click(),
  ]);
}
