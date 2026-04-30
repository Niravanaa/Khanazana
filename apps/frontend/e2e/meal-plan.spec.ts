import { test, expect } from '@playwright/test';
import { ensureAuthenticated } from './helpers/auth';

test.describe('Meal plan', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test('meal plan page loads', async ({ page }) => {
    await page.goto('/meal-plan');
    await expect(page.getByRole('heading', { name: 'Meal Planner' })).toBeVisible();
  });

  test('shows day columns', async ({ page }) => {
    await page.goto('/meal-plan');
    await expect(page.getByRole('button', { name: /add recipe to monday/i })).toBeVisible();
  });

  test('week navigation moves to next week', async ({ page }) => {
    await page.goto('/meal-plan');
    const heading = page.locator('span[aria-live="polite"]').first();
    const before = await heading.textContent();
    await page.getByRole('link', { name: /next week/i }).click();
    await page.waitForURL(/week=/, { timeout: 5_000 });
    const after = await heading.textContent();
    expect(after).not.toBe(before);
  });

  test('opens recipe picker when Add is clicked', async ({ page }) => {
    await page.goto('/meal-plan');
    await page
      .getByRole('button', { name: /add recipe to/i })
      .first()
      .click();
    await expect(page.getByRole('heading', { name: /add to/i })).toBeVisible();
    // Close it
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: /add to/i })).not.toBeVisible();
  });

  test('generate shopping list button exists', async ({ page }) => {
    await page.goto('/meal-plan');
    await expect(page.getByRole('button', { name: /generate shopping list/i })).toBeVisible();
  });

  test('generate shopping list redirects to shopping list page', async ({ page }) => {
    await page.goto('/meal-plan');
    await page.getByRole('button', { name: /generate shopping list/i }).click();
    await expect(page).toHaveURL(/\/shopping-list/, { timeout: 10_000 });
  });
});
