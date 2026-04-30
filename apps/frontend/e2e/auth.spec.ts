import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
  test('renders sign-in form by default', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.locator('form').getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('can switch to the sign-up tab', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
  });

  test('shows an error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('nobody@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.locator('form').getByRole('button', { name: 'Sign In' }).click();
    await expect(page.locator('[class*="red"]').first()).toBeVisible({ timeout: 10_000 });
  });

  test('unauthenticated visit to /recipes redirects to /login', async ({ page }) => {
    await page.goto('/recipes');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
