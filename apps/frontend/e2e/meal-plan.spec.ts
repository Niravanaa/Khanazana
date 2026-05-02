import { test, expect } from '@playwright/test';
import { ensureAuthenticated } from './helpers/auth';

async function createRecipe(page: import('@playwright/test').Page, title: string) {
  await page.goto('/recipes/new');

  await page.getByLabel('Title').fill(title);
  await page.getByLabel('Short Description').fill('Created by meal plan E2E test');
  await page.getByPlaceholder('Ingredient (e.g. cups of flour)').fill('1 cup rice');
  await page.getByPlaceholder('Step 1').fill('Cook the rice');

  await page.getByRole('button', { name: 'Save Recipe' }).click();
  await page.waitForURL(/\/recipes\/[^/]+$/, { timeout: 15_000 });
}

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

  test('nutrition filter updates the url and keeps empty weekend summaries visible', async ({
    page,
  }) => {
    const recipeTitle = `E2E Nutrition Fixture ${Date.now()}`;
    await createRecipe(page, recipeTitle);

    await page.goto('/meal-plan');

    await page.getByRole('link', { name: /next week/i }).click();
    await page.waitForURL(/week=/, { timeout: 5_000 });

    await page.getByRole('button', { name: /add recipe to monday/i }).click();
    await page.getByRole('button', { name: /dinner/i }).click();

    await page.getByLabel(/search recipes/i).fill(recipeTitle);
    await page.getByRole('button', { name: recipeTitle }).click();

    await expect(page.getByRole('heading', { name: /weekly nutrition estimate/i })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole('button', { name: /weekend/i }).click();
    await page.waitForURL(/nutritionFilter=weekend/, { timeout: 5_000 });

    await expect(page.getByRole('heading', { name: /weekly nutrition estimate/i })).toBeVisible();
    await expect(page.getByText('kcal').first()).toBeVisible();
    await expect(
      page.locator('div.rounded-xl.border').filter({ hasText: 'Weekly nutrition estimate' }),
    ).toContainText('0');
  });
});
