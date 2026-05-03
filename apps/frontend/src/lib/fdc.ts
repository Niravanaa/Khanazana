const FDC_BASE = 'https://api.nal.usda.gov/fdc/v1';

export interface FdcNutrition {
  text: string;
  fdcId: number | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  category: string | null;
}

const UNITS = new Set([
  'cup',
  'cups',
  'tbsp',
  'tsp',
  'tablespoon',
  'tablespoons',
  'teaspoon',
  'teaspoons',
  'g',
  'kg',
  'mg',
  'ml',
  'l',
  'oz',
  'lb',
  'lbs',
  'pound',
  'pounds',
  'gram',
  'grams',
  'kilogram',
  'kilograms',
  'litre',
  'litres',
  'liter',
  'liters',
  'millilitre',
  'milliliter',
  'piece',
  'pieces',
  'slice',
  'slices',
  'clove',
  'cloves',
  'handful',
  'handfuls',
  'pinch',
  'dash',
  'bunch',
  'head',
  'can',
  'tin',
  'packet',
  'sprig',
  'sprigs',
  'stalk',
  'stalks',
]);

const DESCRIPTORS = new Set([
  'fresh',
  'dried',
  'frozen',
  'raw',
  'cooked',
  'chopped',
  'diced',
  'sliced',
  'minced',
  'grated',
  'peeled',
  'shredded',
  'crushed',
  'ground',
  'whole',
  'large',
  'medium',
  'small',
  'finely',
  'roughly',
  'freshly',
  'lightly',
  'thinly',
  'thickly',
  'plain',
  'pure',
  'boneless',
  'skinless',
  'lean',
  'extra',
  'ripe',
  'soft',
  'firm',
  'hot',
  'cold',
]);

export function normaliseName(ingredientString: string): string {
  let s = ingredientString
    .replace(/\(.*?\)/g, '') // strip (notes)
    .trim();

  // Strip leading number — integer, decimal, or fraction (e.g. 1/2, 2.5)
  s = s.replace(/^\d+\.?\d*(?:\/\d+)?\s*/, '');

  const words = s.split(/\s+/).filter(Boolean);

  // Drop a leading unit word (e.g. "cups plain flour" → "plain flour")
  if (words.length > 1 && UNITS.has(words[0].toLowerCase())) {
    words.shift();
  }

  // Drop descriptor adjectives
  const result = words.filter((w) => !DESCRIPTORS.has(w.toLowerCase()));

  return result.join(' ').trim().toLowerCase();
}

// Nutrient IDs used by USDA FoodData Central
const NUTRIENT_ENERGY = 1008;
const NUTRIENT_PROTEIN = 1003;
const NUTRIENT_CARBS = 1005;
const NUTRIENT_FAT = 1004;

function findNutrient(
  nutrients: Array<{ nutrientId: number; value: number }>,
  id: number,
): number | null {
  const match = nutrients.find((n) => n.nutrientId === id);
  return match != null ? Math.round(match.value) : null;
}

export async function lookupIngredient(name: string, apiKey: string): Promise<FdcNutrition | null> {
  if (!name.trim()) return null;

  try {
    const url =
      `${FDC_BASE}/foods/search` +
      `?query=${encodeURIComponent(name)}` +
      `&dataType=Foundation,SR%20Legacy` +
      `&pageSize=1` +
      `&api_key=${apiKey}`;

    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;

    const data = await res.json();
    const food = data?.foods?.[0];
    if (!food) return null;

    const nutrients: Array<{ nutrientId: number; value: number }> = food.foodNutrients ?? [];

    return {
      text: name,
      fdcId: food.fdcId ?? null,
      calories: findNutrient(nutrients, NUTRIENT_ENERGY),
      protein_g: findNutrient(nutrients, NUTRIENT_PROTEIN),
      carbs_g: findNutrient(nutrients, NUTRIENT_CARBS),
      fat_g: findNutrient(nutrients, NUTRIENT_FAT),
      category: food.foodCategory ?? null,
    };
  } catch {
    return null;
  }
}

const NULL_ENTRY = (text: string): FdcNutrition => ({
  text,
  fdcId: null,
  calories: null,
  protein_g: null,
  carbs_g: null,
  fat_g: null,
  category: null,
});

export async function enrichIngredients(
  ingredients: string[],
  apiKey: string,
): Promise<FdcNutrition[]> {
  // Deduplicate by normalised name within this batch to avoid redundant API calls
  const nameCache = new Map<string, Promise<FdcNutrition | null>>();

  return Promise.all(
    ingredients.map((text) => {
      const name = normaliseName(text);
      if (!name) return Promise.resolve(NULL_ENTRY(text));

      if (!nameCache.has(name)) {
        nameCache.set(name, lookupIngredient(name, apiKey));
      }

      return nameCache
        .get(name)!
        .then((result) => (result ? { ...result, text } : NULL_ENTRY(text)));
    }),
  );
}
