import { test, expect } from '@playwright/test';
import { ensureAuthenticated } from './helpers/auth';

/**
 * Creates a public recipe via the UI and returns its ID.
 */
async function createPublicRecipe(page: import('@playwright/test').Page): Promise<string> {
  await page.goto('/recipes/new');

  const title = `E2E Public Social Recipe ${Date.now()}`;
  await page.getByLabel('Title').fill(title);

  // Fill the first ingredient and instruction rows
  await page
    .getByPlaceholder('Ingredient (e.g. cups of flour)')
    .first()
    .fill('1 cup test ingredient');
  await page.getByPlaceholder('Step 1').first().fill('Test instruction');

  // Toggle public recipe switch (the control uses role="switch")
  const toggle = page.getByRole('switch', { name: 'Toggle public recipe' });
  await toggle.click();

  // Submit and wait for navigation to the saved recipe page (UUID path)
  await Promise.all([
    page.waitForURL(/\/recipes\/[0-9a-fA-F\-]{36}$/i, { timeout: 15_000 }),
    page.getByRole('button', { name: /save recipe/i }).click(),
  ]);

  const url = page.url();
  const match = url.match(/\/recipes\/(.+)$/);
  if (!match) throw new Error(`Could not determine recipe id from url: ${url}`);
  return match[1];
}

test.describe('Social features — public recipe page', () => {
  let recipeId: string;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await ensureAuthenticated(page);
    recipeId = await createPublicRecipe(page);
    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test('public recipe page renders like button and comment section', async ({ page }) => {
    await page.goto(`/recipes/public/${recipeId}`);

    await expect(page.getByRole('button', { name: /like/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByPlaceholder(/add a comment/i)).toBeVisible();
  });

  test('like button toggles and updates count', async ({ page }) => {
    await page.goto(`/recipes/public/${recipeId}`);

    const likeButton = page.getByRole('button', { name: 'Like recipe' });
    await likeButton.waitFor({ timeout: 10_000 });

    await likeButton.click();

    // Button should reflect the new state (pressed/unpressed)
    await expect(page.getByRole('button', { name: 'Unlike recipe' })).toHaveAttribute(
      'aria-pressed',
      'true',
      { timeout: 10_000 },
    );

    // Unlike to restore state
    await page.getByRole('button', { name: 'Unlike recipe' }).click();
    await expect(page.getByRole('button', { name: 'Like recipe' })).toHaveAttribute(
      'aria-pressed',
      'false',
      { timeout: 10_000 },
    );
  });

  test('can submit a comment and see it appear', async ({ page }) => {
    await page.goto(`/recipes/public/${recipeId}`);

    const commentInput = page.getByPlaceholder(/add a comment/i);
    await commentInput.waitFor({ timeout: 10_000 });

    const uniqueBody = `E2E test comment ${Date.now()}`;
    await commentInput.fill(uniqueBody);

    await page.getByRole('button', { name: /post comment/i }).click();

    await expect(page.getByText(uniqueBody)).toBeVisible({ timeout: 10_000 });
  });

  test('guest sees sign-in prompt instead of comment form', async ({ page }) => {
    // Visit as unauthenticated (no session)
    await page.context().clearCookies();
    await page.goto(`/recipes/public/${recipeId}`);

    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible({ timeout: 10_000 });
  });
});
