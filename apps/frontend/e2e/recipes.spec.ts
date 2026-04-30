import { test, expect } from '@playwright/test';
import { ensureAuthenticated } from './helpers/auth';

// Serial so create → view → edit run in order and share state via the title.
test.describe('Recipes', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  const title = `E2E Recipe`;

  test('recipes page loads', async ({ page }) => {
    await page.goto('/recipes');
    await expect(page.getByRole('heading', { name: 'My Recipes' })).toBeVisible();
  });

  test('creates a new recipe', async ({ page }) => {
    await page.goto('/recipes/new');

    await page.getByLabel('Title').fill(title);
    await page.getByLabel('Short Description').fill('Created by Playwright E2E test');
    await page.getByPlaceholder('Ingredient (e.g. cups of flour)').fill('Test ingredient');
    await page.getByPlaceholder('Step 1').fill('Test step one');

    await page.getByRole('button', { name: 'Save Recipe' }).click();
    await page.waitForURL(/\/recipes\/[^/]+$/, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/recipes\/[^/]+$/);
  });

  test('recipe appears in the list', async ({ page }) => {
    await page.goto('/recipes');
    await expect(page.locator('a[href^="/recipes/"]').first()).toBeVisible();
  });
});
