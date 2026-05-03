import type { FdcNutrition } from '@/lib/types';

interface RecipeNutritionProps {
  nutrition: FdcNutrition[];
}

export function RecipeNutrition({ nutrition }: RecipeNutritionProps) {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let hasAny = false;

  for (const n of nutrition) {
    if (n.calories != null) {
      calories += n.calories;
      hasAny = true;
    }
    if (n.protein_g != null) {
      protein += n.protein_g;
      hasAny = true;
    }
    if (n.carbs_g != null) {
      carbs += n.carbs_g;
      hasAny = true;
    }
    if (n.fat_g != null) {
      fat += n.fat_g;
      hasAny = true;
    }
  }

  if (!hasAny) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-foreground">Nutritional estimate</h2>
        <span className="text-xs text-muted-foreground">
          per recipe · excludes unmatched ingredients
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-background px-4 py-3 text-center">
          <p className="text-2xl font-bold text-foreground">
            {Math.round(calories).toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">kcal</p>
        </div>
        <div className="rounded-lg bg-background px-4 py-3 text-center">
          <p className="text-2xl font-bold text-foreground">{Math.round(protein)}g</p>
          <p className="mt-0.5 text-xs text-muted-foreground">protein</p>
        </div>
        <div className="rounded-lg bg-background px-4 py-3 text-center">
          <p className="text-2xl font-bold text-foreground">{Math.round(carbs)}g</p>
          <p className="mt-0.5 text-xs text-muted-foreground">carbs</p>
        </div>
        <div className="rounded-lg bg-background px-4 py-3 text-center">
          <p className="text-2xl font-bold text-foreground">{Math.round(fat)}g</p>
          <p className="mt-0.5 text-xs text-muted-foreground">fat</p>
        </div>
      </div>
    </div>
  );
}
