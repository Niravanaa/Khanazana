import { Page } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_EMAIL ?? 'e2e@khanazana.local';
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'KhanazanaE2E123!';

export async function ensureAuthenticated(page: Page) {
  await page.goto('/login');

  const loginResult = await page.evaluate(
    async ({ email, password }) => {
      const response = await fetch('/api/e2e-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json().catch(() => null);
      return { ok: response.ok, status: response.status, payload };
    },
    { email: E2E_EMAIL, password: E2E_PASSWORD },
  );

  if (!loginResult.ok) {
    throw new Error(
      `ensureAuthenticated failed (${loginResult.status}): ${JSON.stringify(loginResult.payload)}`,
    );
  }
}
