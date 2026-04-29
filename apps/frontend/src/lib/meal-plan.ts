import { prisma } from '@/lib/prisma';
import { getRecipeImageUrl } from '@/lib/recipes';
import type { DayOfWeek, MealSlot } from '@prisma/client';

export type { DayOfWeek, MealSlot };

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

export async function removeMealPlanEntry(userId: string, entryId: string): Promise<void> {
  const entry = await prisma.mealPlanEntry.findFirst({
    where: { id: entryId, plan: { user_id: userId } },
  });
  if (!entry) throw new Error('Entry not found');

  await prisma.mealPlanEntry.delete({ where: { id: entryId } });
}
