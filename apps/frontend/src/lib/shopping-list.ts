import { prisma } from '@/lib/prisma';
import { weekStartParam } from '@/lib/meal-plan';

export interface ShoppingListItemRecord {
  id: string;
  ingredient: string;
  bought: boolean;
}

export async function generateShoppingList(userId: string, weekStart: Date): Promise<void> {
  const plan = await prisma.mealPlan.findUnique({
    where: { user_id_week_start: { user_id: userId, week_start: weekStart } },
    include: {
      entries: {
        include: { recipe: { select: { ingredients: true } } },
      },
    },
  });

  const seen = new Set<string>();
  const ingredients: string[] = [];

  if (plan) {
    for (const entry of plan.entries) {
      const raw = entry.recipe.ingredients;
      const list = Array.isArray(raw) ? raw : [];
      for (const item of list) {
        if (typeof item !== 'string') continue;
        const normalized = item.trim();
        if (!normalized) continue;
        const key = normalized.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          ingredients.push(normalized);
        }
      }
    }
  }

  await prisma.$transaction([
    prisma.shoppingListItem.deleteMany({ where: { user_id: userId, week_start: weekStart } }),
    ...(ingredients.length > 0
      ? [
          prisma.shoppingListItem.createMany({
            data: ingredients.map((ingredient) => ({
              user_id: userId,
              week_start: weekStart,
              ingredient,
            })),
          }),
        ]
      : []),
  ]);
}

export async function getShoppingList(
  userId: string,
  weekStart: Date,
): Promise<ShoppingListItemRecord[]> {
  const items = await prisma.shoppingListItem.findMany({
    where: { user_id: userId, week_start: weekStart },
    orderBy: [{ bought: 'asc' }, { ingredient: 'asc' }],
  });
  return items.map((i) => ({ id: i.id, ingredient: i.ingredient, bought: i.bought }));
}

export async function getShoppingListWeeks(userId: string): Promise<string[]> {
  const rows = await prisma.shoppingListItem.findMany({
    where: { user_id: userId },
    select: { week_start: true },
    distinct: ['week_start'],
    orderBy: { week_start: 'desc' },
  });
  return rows.map((r) => weekStartParam(r.week_start));
}

export async function toggleShoppingItem(userId: string, itemId: string): Promise<void> {
  const item = await prisma.shoppingListItem.findFirst({ where: { id: itemId, user_id: userId } });
  if (!item) throw new Error('Item not found');
  await prisma.shoppingListItem.update({ where: { id: itemId }, data: { bought: !item.bought } });
}

export async function consolidateShoppingItems(
  userId: string,
  keepId: string,
  removeId: string,
  newIngredient: string,
): Promise<void> {
  const [keep, remove] = await Promise.all([
    prisma.shoppingListItem.findFirst({ where: { id: keepId, user_id: userId } }),
    prisma.shoppingListItem.findFirst({ where: { id: removeId, user_id: userId } }),
  ]);
  if (!keep || !remove) throw new Error('Item not found');
  await prisma.$transaction([
    prisma.shoppingListItem.update({
      where: { id: keepId },
      data: { ingredient: newIngredient.trim() },
    }),
    prisma.shoppingListItem.delete({ where: { id: removeId } }),
  ]);
}
