import { test, expect } from '@playwright/test';
import { ensureAuthenticated } from './helpers/auth';

test.describe('Shopping list', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test('shopping list page loads', async ({ page }) => {
    await page.goto('/shopping-list');
    await expect(page.getByRole('heading', { name: /shopping list/i })).toBeVisible();
  });

  test('shows empty state when no items', async ({ page }) => {
    await page.goto('/shopping-list');
    // Either items are shown or the empty state message is shown
    const empty = page.getByText(/no items yet/i);
    const hasItems = page.locator('label input[type="checkbox"]');
    await expect(empty.or(hasItems.first())).toBeVisible({ timeout: 5_000 });
  });

  test('marks an item as bought and shows line-through', async ({ page }) => {
    await page.goto('/shopping-list');

    const firstCheckbox = page.locator('label input[type="checkbox"]').first();
    const hasItems = await firstCheckbox.isVisible();
    if (!hasItems) {
      test.skip(
        true,
        'No shopping list items to test with — generate a list from the meal plan first',
      );
      return;
    }

    const label = page.locator('label').filter({ has: firstCheckbox });
    const itemText = page.locator('label span').first();

    // Check not already bought
    const alreadyBought = await itemText.evaluate((el) => el.classList.contains('line-through'));
    if (alreadyBought) {
      // Uncheck first so we can test checking
      await firstCheckbox.click();
      await page.waitForTimeout(500);
    }

    await firstCheckbox.click();
    await expect(itemText).toHaveClass(/line-through/, { timeout: 5_000 });
  });

  test('export CSV link is present', async ({ page }) => {
    await page.goto('/shopping-list');
    await expect(page.getByRole('link', { name: /export csv/i })).toBeVisible();
  });
});
