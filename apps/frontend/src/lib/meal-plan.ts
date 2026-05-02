import { prisma } from '@/lib/prisma';
import { getRecipeImageUrl } from '@/lib/recipes';
import type { DayOfWeek, MealSlot } from '@prisma/client';

export interface NutritionTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface FdcEntry {
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
}

export type { DayOfWeek, MealSlot };

export type NutritionFilterType =
  | 'all'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'
  | 'weekdays'
  | 'weekend';

export interface MealPlanEntryWithRecipe {
  id: string;
  day: DayOfWeek;
  meal_slot: MealSlot;
  recipe: {
    id: string;
    title: string;
    image_url: string | null;
  };
}

export interface WeeklyMealPlan {
  id: string;
  week_start: Date;
  entries: MealPlanEntryWithRecipe[];
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  // Monday = start of week
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function weekStartParam(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getOrCreateMealPlan(
  userId: string,
  weekStart: Date,
): Promise<WeeklyMealPlan> {
  const plan = await prisma.mealPlan.upsert({
    where: { user_id_week_start: { user_id: userId, week_start: weekStart } },
    create: { user_id: userId, week_start: weekStart },
    update: {},
    include: {
      entries: {
        include: { recipe: { select: { id: true, title: true, image_path: true } } },
        orderBy: [{ day: 'asc' }, { meal_slot: 'asc' }],
      },
    },
  });

  return {
    id: plan.id,
    week_start: plan.week_start,
    entries: plan.entries.map((e) => ({
      id: e.id,
      day: e.day,
      meal_slot: e.meal_slot,
      recipe: {
        id: e.recipe.id,
        title: e.recipe.title,
        image_url: getRecipeImageUrl(e.recipe.image_path),
      },
    })),
  };
}

export async function addMealPlanEntry(
  userId: string,
  planId: string,
  recipeId: string,
  day: DayOfWeek,
  mealSlot: MealSlot,
): Promise<void> {
  // Verify plan belongs to user
  const plan = await prisma.mealPlan.findFirst({ where: { id: planId, user_id: userId } });
  if (!plan) throw new Error('Meal plan not found');

  await prisma.mealPlanEntry.upsert({
    where: {
      plan_id_day_meal_slot_recipe_id: {
        plan_id: planId,
        day,
        meal_slot: mealSlot,
        recipe_id: recipeId,
      },
    },
    create: { plan_id: planId, recipe_id: recipeId, day, meal_slot: mealSlot },
    update: {},
  });
}

function getDaysForFilter(filter: NutritionFilterType): DayOfWeek[] {
  const allDays: DayOfWeek[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  if (filter === 'all') {
    return allDays;
  }

  if (filter === 'weekdays') {
    return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  }

  if (filter === 'weekend') {
    return ['saturday', 'sunday'];
  }

  // Specific day
  return [filter as DayOfWeek];
}

export async function getWeeklyNutrition(
  userId: string,
  weekStart: Date,
  filter: NutritionFilterType = 'all',
): Promise<NutritionTotals | null> {
  const plan = await prisma.mealPlan.findUnique({
    where: { user_id_week_start: { user_id: userId, week_start: weekStart } },
    include: {
      entries: {
        include: { recipe: { select: { ingredients_nutrition: true } } },
      },
    },
  });

  if (!plan) return null;

  const daysToInclude = getDaysForFilter(filter);

  let hasAny = false;
  let calories = 0,
    protein_g = 0,
    carbs_g = 0,
    fat_g = 0;

  for (const entry of plan.entries) {
    // Some tests/mocks omit `day` (e.g. unit tests) — treat missing day as included
    if (entry.day !== undefined && !daysToInclude.includes(entry.day)) continue;

    const nutrition = entry.recipe.ingredients_nutrition;
    if (!Array.isArray(nutrition)) continue;
    for (const n of nutrition as unknown as FdcEntry[]) {
      if (n.calories != null) {
        calories += n.calories;
        hasAny = true;
      }
      if (n.protein_g != null) protein_g += n.protein_g;
      if (n.carbs_g != null) carbs_g += n.carbs_g;
      if (n.fat_g != null) fat_g += n.fat_g;
    }
  }

  // Return null only if viewing full week with no nutrition data
  // For filtered views, always return the totals (even if 0)
  if (!hasAny && filter === 'all') return null;

  return {
    calories: Math.round(calories),
    protein_g: Math.round(protein_g),
    carbs_g: Math.round(carbs_g),
    fat_g: Math.round(fat_g),
  };
}

export async function removeMealPlanEntry(userId: string, entryId: string): Promise<void> {
  const entry = await prisma.mealPlanEntry.findFirst({
    where: { id: entryId, plan: { user_id: userId } },
  });
  if (!entry) throw new Error('Entry not found');

  await prisma.mealPlanEntry.delete({ where: { id: entryId } });
}
