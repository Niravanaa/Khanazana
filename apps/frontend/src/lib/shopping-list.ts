import { prisma } from '@/lib/prisma';
import { weekStartParam } from '@/lib/meal-plan';

export interface ShoppingListItemRecord {
  id: string;
  ingredient: string;
  bought: boolean;
  category: string | null;
}

// Maps verbose USDA food category strings to short aisle labels.
const USDA_CATEGORY_MAP: Record<string, string> = {
  'Vegetables and Vegetable Products': 'Produce',
  'Fruits and Fruit Juices': 'Produce',
  'Dairy and Egg Products': 'Dairy & Eggs',
  'Poultry Products': 'Meat & Fish',
  'Beef Products': 'Meat & Fish',
  'Pork Products': 'Meat & Fish',
  'Lamb, Veal, and Game Products': 'Meat & Fish',
  'Finfish and Shellfish Products': 'Meat & Fish',
  'Sausages and Luncheon Meats': 'Meat & Fish',
  'Baked Products': 'Bakery',
  'Cereal Grains and Pasta': 'Pantry',
  'Legumes and Legume Products': 'Pantry',
  'Nut and Seed Products': 'Pantry',
  'Spices and Herbs': 'Pantry',
  'Fats and Oils': 'Pantry',
  'Soups, Sauces, and Gravies': 'Pantry',
  Sweets: 'Pantry',
  Snacks: 'Pantry',
  Beverages: 'Drinks',
};

function resolveCategory(usdaCategory: string | null): string | null {
  if (!usdaCategory) return null;
  return USDA_CATEGORY_MAP[usdaCategory] ?? null;
}

interface FdcEntry {
  text: string;
  category: string | null;
}

export async function generateShoppingList(userId: string, weekStart: Date): Promise<void> {
  const plan = await prisma.mealPlan.findUnique({
    where: { user_id_week_start: { user_id: userId, week_start: weekStart } },
    include: {
      entries: {
        include: {
          recipe: { select: { ingredients: true, ingredients_nutrition: true } },
        },
      },
    },
  });

  const seen = new Set<string>();
  const items: { ingredient: string; category: string | null }[] = [];

  if (plan) {
    for (const entry of plan.entries) {
      // Build a text → display-category map from this recipe's enrichment data
      const categoryMap = new Map<string, string | null>();
      const rawNutrition = entry.recipe.ingredients_nutrition;
      if (Array.isArray(rawNutrition)) {
        for (const n of rawNutrition as unknown as FdcEntry[]) {
          if (n?.text) categoryMap.set(n.text, resolveCategory(n.category));
        }
      }

      const list = Array.isArray(entry.recipe.ingredients) ? entry.recipe.ingredients : [];
      for (const item of list) {
        if (typeof item !== 'string') continue;
        const normalized = item.trim();
        if (!normalized) continue;
        const key = normalized.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          items.push({
            ingredient: normalized,
            category: categoryMap.get(normalized) ?? null,
          });
        }
      }
    }
  }

  await prisma.$transaction([
    prisma.shoppingListItem.deleteMany({ where: { user_id: userId, week_start: weekStart } }),
    ...(items.length > 0
      ? [
          prisma.shoppingListItem.createMany({
            data: items.map(({ ingredient, category }) => ({
              user_id: userId,
              week_start: weekStart,
              ingredient,
              category,
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
  return items.map((i) => ({
    id: i.id,
    ingredient: i.ingredient,
    bought: i.bought,
    category: i.category ?? null,
  }));
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
