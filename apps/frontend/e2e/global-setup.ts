import { test as setup } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '.auth/user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env.E2E_EMAIL ?? 'e2e@khanazana.local';
  const password = process.env.E2E_PASSWORD ?? 'KhanazanaE2E123!';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey) {
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: existing, error: listError } = await admin.auth.admin.listUsers();
    const user = !listError ? existing?.users.find((u) => u.email === email) : undefined;
    if (!user) {
      const { error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      // Ignore errors that indicate the user already exists (e.g. DB-level uniqueness).
      if (
        error &&
        !error.message.includes('already') &&
        !error.message.includes('Database error')
      ) {
        throw new Error(`Failed to create e2e test user: ${error.message}`);
      }
    } else {
      const { error } = await admin.auth.admin.updateUserById(user.id, {
        password,
        email_confirm: true,
      });
      if (error) {
        throw new Error(`Failed to update e2e test user password: ${error.message}`);
      }
    }
  }

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  const signIn = async () => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await Promise.all([
      page.waitForURL('**/recipes', { timeout: 15_000 }),
      page.locator('form').getByRole('button', { name: 'Sign In' }).click(),
    ]);
    return page.url().includes('/recipes');
  };

  const signedIn = await signIn();

  if (!signedIn) {
    // Fallback for environments without service-role access: create account via UI.
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await Promise.all([
      page.waitForLoadState('networkidle', { timeout: 15_000 }),
      page.locator('form').getByRole('button', { name: 'Create Account' }).click(),
    ]);

    // If we are still on /login (e.g. existing account or confirmation flow), retry sign in.
    if (!page.url().includes('/recipes')) {
      const secondTry = await signIn();
      if (!secondTry) {
        const errorLocator = page.locator('.bg-red-50, .bg-red-950').first();
        const msg = (await errorLocator.isVisible())
          ? await errorLocator.textContent()
          : 'no error message shown';
        throw new Error(`Login did not reach /recipes (got ${page.url()}): ${msg}`);
      }
    }
  }

  await page.goto('/recipes');
  await page.waitForURL('**/recipes', { timeout: 15_000 });

  await page.context().storageState({ path: AUTH_FILE });
});
