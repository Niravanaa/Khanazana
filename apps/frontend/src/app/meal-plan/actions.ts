'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/recipes';
import { addMealPlanEntry, removeMealPlanEntry } from '@/lib/meal-plan';
import type { DayOfWeek, MealSlot } from '@/lib/meal-plan';
import { generateShoppingList } from '@/lib/shopping-list';

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function addEntryAction(
  planId: string,
  recipeId: string,
  day: DayOfWeek,
  mealSlot: MealSlot,
) {
  const user = await requireUser();
  await addMealPlanEntry(user.id, planId, recipeId, day, mealSlot);
  revalidatePath('/meal-plan');
}

export async function removeEntryAction(entryId: string) {
  const user = await requireUser();
  await removeMealPlanEntry(user.id, entryId);
  revalidatePath('/meal-plan');
}

export async function generateShoppingListAction(weekStart: string) {
  const user = await requireUser();
  const date = new Date(weekStart + 'T00:00:00Z');
  await generateShoppingList(user.id, date);
  revalidatePath('/shopping-list');
  redirect(`/shopping-list?week=${weekStart}&generated=1`);
}
