import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ensureAuthenticated } from './helpers/auth';

const PAGES = [
  { name: 'Recipes', path: '/recipes' },
  { name: 'Meal plan', path: '/meal-plan' },
  { name: 'Shopping list', path: '/shopping-list' },
];

test.beforeEach(async ({ page }) => {
  await ensureAuthenticated(page);
});

for (const { name, path } of PAGES) {
  test(`${name} page has no WCAG violations`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(path, { timeout: 10_000 });
    await page.waitForSelector('main', { timeout: 10_000 });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(
      results.violations,
      `WCAG violations on ${name}:\n` +
        results.violations
          .map((v) => `  [${v.impact}] ${v.id}: ${v.description}\n    ${v.helpUrl}`)
          .join('\n'),
    ).toEqual([]);
  });
}

test('Recipe detail page has no WCAG violations', async ({ page }) => {
  // Navigate to recipes list and open the first recipe
  await page.goto('/recipes');
  const firstCard = page.locator('a[href^="/recipes/"]:not([href="/recipes/new"])').first();
  const hasRecipe = await firstCard.isVisible({ timeout: 5_000 }).catch(() => false);
  if (!hasRecipe) {
    test.skip(true, 'No recipes to test — create one first');
    return;
  }

  await firstCard.click();
  await page.waitForSelector('main', { timeout: 10_000 });

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(
    results.violations,
    `WCAG violations on recipe detail:\n` +
      results.violations
        .map((v) => `  [${v.impact}] ${v.id}: ${v.description}\n    ${v.helpUrl}`)
        .join('\n'),
  ).toEqual([]);
});

test('Recipe picker modal has no WCAG violations', async ({ page }) => {
  await page.goto('/meal-plan');
  await page
    .getByRole('button', { name: /add recipe to/i })
    .first()
    .click();
  await page.waitForSelector('[role="dialog"]', { timeout: 5_000 });

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .include('[role="dialog"]')
    .analyze();

  expect(
    results.violations,
    `WCAG violations in recipe picker:\n` +
      results.violations
        .map((v) => `  [${v.impact}] ${v.id}: ${v.description}\n    ${v.helpUrl}`)
        .join('\n'),
  ).toEqual([]);
});
