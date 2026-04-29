'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/recipes';
import { consolidateShoppingItems, toggleShoppingItem } from '@/lib/shopping-list';

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function toggleItemAction(itemId: string, week: string) {
  const user = await requireUser();
  await toggleShoppingItem(user.id, itemId);
  revalidatePath(`/shopping-list`);
}

export async function consolidateItemsAction(
  keepId: string,
  removeId: string,
  newIngredient: string,
) {
  const user = await requireUser();
  await consolidateShoppingItems(user.id, keepId, removeId, newIngredient);
  revalidatePath('/shopping-list');
}
