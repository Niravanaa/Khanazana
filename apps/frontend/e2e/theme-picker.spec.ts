import { test, expect } from '@playwright/test';
import { ensureAuthenticated } from './helpers/auth';

test.describe('Color theme picker', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
    await page.evaluate(() => localStorage.removeItem('color-theme'));
    await page.goto('/recipes');
  });

  test('Color theme button is visible in the sidebar', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Pick color theme' })).toBeVisible();
  });

  test('clicking the button reveals all 8 swatches', async ({ page }) => {
    await page.getByRole('button', { name: 'Pick color theme' }).click();

    for (const label of ['Sage', 'Rose', 'Lavender', 'Peach', 'Sky', 'Teal', 'Amber', 'Sand']) {
      await expect(page.getByRole('button', { name: label })).toBeVisible();
    }
  });

  test('selecting a theme applies its class to <html>', async ({ page }) => {
    await page.getByRole('button', { name: 'Pick color theme' }).click();
    await page.getByRole('button', { name: 'Rose' }).click();

    const hasClass = await page.evaluate(() =>
      document.documentElement.classList.contains('theme-rose'),
    );
    expect(hasClass).toBe(true);
  });

  test('selected theme persists after reload', async ({ page }) => {
    await page.getByRole('button', { name: 'Pick color theme' }).click();
    await page.getByRole('button', { name: 'Teal' }).click();

    await page.reload();

    const hasClass = await page.evaluate(() =>
      document.documentElement.classList.contains('theme-teal'),
    );
    expect(hasClass).toBe(true);
  });

  test('switching theme removes the previous theme class', async ({ page }) => {
    await page.getByRole('button', { name: 'Pick color theme' }).click();
    await page.getByRole('button', { name: 'Rose' }).click();

    await page.getByRole('button', { name: 'Pick color theme' }).click();
    await page.getByRole('button', { name: 'Sky' }).click();

    const classList = await page.evaluate(() => document.documentElement.className);
    expect(classList).not.toContain('theme-rose');
    expect(classList).toContain('theme-sky');
  });

  test('selecting Sage removes all theme classes', async ({ page }) => {
    // First apply a non-default theme
    await page.getByRole('button', { name: 'Pick color theme' }).click();
    await page.getByRole('button', { name: 'Lavender' }).click();

    // Switch back to Sage
    await page.getByRole('button', { name: 'Pick color theme' }).click();
    await page.getByRole('button', { name: 'Sage' }).click();

    const classList = await page.evaluate(() => document.documentElement.className);
    expect(classList).not.toContain('theme-');
  });
});
