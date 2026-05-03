import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DayOfWeek, MealSlot } from '@prisma/client';

const mockUpsertPlan = vi.hoisted(() => vi.fn());
const mockFindFirstPlan = vi.hoisted(() => vi.fn());
const mockFindUniquePlan = vi.hoisted(() => vi.fn());
const mockUpsertEntry = vi.hoisted(() => vi.fn());
const mockFindFirstEntry = vi.hoisted(() => vi.fn());
const mockDeleteEntry = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mealPlan: {
      upsert: mockUpsertPlan,
      findFirst: mockFindFirstPlan,
      findUnique: mockFindUniquePlan,
    },
    mealPlanEntry: {
      upsert: mockUpsertEntry,
      findFirst: mockFindFirstEntry,
      delete: mockDeleteEntry,
    },
  },
}));

vi.mock('@/lib/recipes', () => ({
  getRecipeImageUrl: (path: string | null) =>
    path ? `/api/images?path=${encodeURIComponent(path)}` : null,
}));

import {
  getWeekStart,
  weekStartParam,
  getOrCreateMealPlan,
  addMealPlanEntry,
  removeMealPlanEntry,
  getWeeklyNutrition,
} from './meal-plan';

const USER_ID = 'user-abc';
const PLAN_ID = 'plan-1';
const RECIPE_ID = 'recipe-xyz';
const ENTRY_ID = 'entry-1';

beforeEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// getWeekStart (pure)
// ---------------------------------------------------------------------------
describe('getWeekStart', () => {
  it('returns Monday for a Wednesday input', () => {
    const wed = new Date('2026-04-29T12:00:00Z'); // Wednesday
    const result = getWeekStart(wed);
    expect(result.toISOString().slice(0, 10)).toBe('2026-04-27'); // Monday
  });

  it('returns the same Monday for a Monday input', () => {
    const mon = new Date('2026-04-27T00:00:00Z');
    expect(getWeekStart(mon).toISOString().slice(0, 10)).toBe('2026-04-27');
  });

  it('returns previous Monday for a Sunday input', () => {
    const sun = new Date('2026-05-03T00:00:00Z'); // Sunday
    expect(getWeekStart(sun).toISOString().slice(0, 10)).toBe('2026-04-27');
  });

  it('returns a date with time zeroed out', () => {
    const d = new Date('2026-04-29T15:45:30Z');
    const result = getWeekStart(d);
    expect(result.getUTCHours()).toBe(0);
    expect(result.getUTCMinutes()).toBe(0);
    expect(result.getUTCSeconds()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// weekStartParam (pure)
// ---------------------------------------------------------------------------
describe('weekStartParam', () => {
  it('returns YYYY-MM-DD string', () => {
    const d = new Date('2026-04-27T00:00:00Z');
    expect(weekStartParam(d)).toBe('2026-04-27');
  });
});

// ---------------------------------------------------------------------------
// getOrCreateMealPlan
// ---------------------------------------------------------------------------
describe('getOrCreateMealPlan', () => {
  it('upserts and returns a structured meal plan', async () => {
    const weekStart = new Date('2026-04-27T00:00:00Z');
    mockUpsertPlan.mockResolvedValue({
      id: PLAN_ID,
      week_start: weekStart,
      entries: [
        {
          id: ENTRY_ID,
          day: 'MONDAY',
          meal_slot: 'LUNCH',
          recipe: { id: RECIPE_ID, title: 'Curry', image_path: 'user/curry.jpg' },
        },
      ],
    });

    const result = await getOrCreateMealPlan(USER_ID, weekStart);

    expect(mockUpsertPlan).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id_week_start: { user_id: USER_ID, week_start: weekStart } },
      }),
    );
    expect(result.id).toBe(PLAN_ID);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]).toEqual({
      id: ENTRY_ID,
      day: 'MONDAY',
      meal_slot: 'LUNCH',
      recipe: {
        id: RECIPE_ID,
        title: 'Curry',
        image_url: '/api/images?path=user%2Fcurry.jpg',
      },
    });
  });

  it('returns an empty entries array when plan has no entries', async () => {
    mockUpsertPlan.mockResolvedValue({ id: PLAN_ID, week_start: new Date(), entries: [] });

    const result = await getOrCreateMealPlan(USER_ID, new Date());
    expect(result.entries).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// addMealPlanEntry
// ---------------------------------------------------------------------------
describe('addMealPlanEntry', () => {
  it('throws when plan not found', async () => {
    mockFindFirstPlan.mockResolvedValue(null);

    await expect(
      addMealPlanEntry(USER_ID, PLAN_ID, RECIPE_ID, 'MONDAY' as DayOfWeek, 'LUNCH' as MealSlot),
    ).rejects.toThrow('Meal plan not found');
    expect(mockUpsertEntry).not.toHaveBeenCalled();
  });

  it('upserts entry when plan belongs to user', async () => {
    mockFindFirstPlan.mockResolvedValue({ id: PLAN_ID, user_id: USER_ID });
    mockUpsertEntry.mockResolvedValue({});

    await addMealPlanEntry(
      USER_ID,
      PLAN_ID,
      RECIPE_ID,
      'TUESDAY' as DayOfWeek,
      'DINNER' as MealSlot,
    );

    expect(mockUpsertEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        create: { plan_id: PLAN_ID, recipe_id: RECIPE_ID, day: 'TUESDAY', meal_slot: 'DINNER' },
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// getWeeklyNutrition
// ---------------------------------------------------------------------------
describe('getWeeklyNutrition', () => {
  const weekStart = new Date('2026-04-27T00:00:00Z');

  it('returns null when no meal plan exists', async () => {
    mockFindUniquePlan.mockResolvedValue(null);
    expect(await getWeeklyNutrition(USER_ID, weekStart)).toBeNull();
  });

  it('returns null when no entries have enrichment data', async () => {
    mockFindUniquePlan.mockResolvedValue({
      entries: [
        { recipe: { ingredients_nutrition: null } },
        { recipe: { ingredients_nutrition: [] } },
      ],
    });
    expect(await getWeeklyNutrition(USER_ID, weekStart)).toBeNull();
  });

  it('sums nutrition across all recipe entries', async () => {
    mockFindUniquePlan.mockResolvedValue({
      entries: [
        {
          recipe: {
            ingredients_nutrition: [
              { calories: 200, protein_g: 20, carbs_g: 10, fat_g: 5 },
              { calories: 100, protein_g: 5, carbs_g: 15, fat_g: 2 },
            ],
          },
        },
        {
          recipe: {
            ingredients_nutrition: [{ calories: 300, protein_g: 25, carbs_g: 20, fat_g: 10 }],
          },
        },
      ],
    });

    const result = await getWeeklyNutrition(USER_ID, weekStart);
    expect(result).toEqual({ calories: 600, protein_g: 50, carbs_g: 45, fat_g: 17 });
  });

  it('skips null nutrient fields without counting them as zero', async () => {
    mockFindUniquePlan.mockResolvedValue({
      entries: [
        {
          recipe: {
            ingredients_nutrition: [{ calories: 150, protein_g: null, carbs_g: 10, fat_g: null }],
          },
        },
      ],
    });

    const result = await getWeeklyNutrition(USER_ID, weekStart);
    expect(result).toEqual({ calories: 150, protein_g: 0, carbs_g: 10, fat_g: 0 });
  });

  it('rounds fractional totals to nearest integer', async () => {
    mockFindUniquePlan.mockResolvedValue({
      entries: [
        {
          recipe: {
            ingredients_nutrition: [{ calories: 100.6, protein_g: 10.4, carbs_g: 5.5, fat_g: 2.9 }],
          },
        },
      ],
    });

    const result = await getWeeklyNutrition(USER_ID, weekStart);
    expect(result).toEqual({ calories: 101, protein_g: 10, carbs_g: 6, fat_g: 3 });
  });
});

// ---------------------------------------------------------------------------
// removeMealPlanEntry
// ---------------------------------------------------------------------------
describe('removeMealPlanEntry', () => {
  it('throws when entry not found', async () => {
    mockFindFirstEntry.mockResolvedValue(null);

    await expect(removeMealPlanEntry(USER_ID, ENTRY_ID)).rejects.toThrow('Entry not found');
    expect(mockDeleteEntry).not.toHaveBeenCalled();
  });

  it('deletes the entry when found', async () => {
    mockFindFirstEntry.mockResolvedValue({ id: ENTRY_ID });
    mockDeleteEntry.mockResolvedValue({});

    await removeMealPlanEntry(USER_ID, ENTRY_ID);

    expect(mockDeleteEntry).toHaveBeenCalledWith({ where: { id: ENTRY_ID } });
  });
});
