import type { FdcNutrition } from '@/lib/fdc';

export type { FdcNutrition };

export interface RecipeInput {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  image_path?: string | null;
  tags?: string[];
  cook_time?: number | null;
  is_public?: boolean;
  servings?: number | null;
  meal_types?: string[];
}

export interface RecipeRecord {
  id: string;
  user_id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  image_path: string | null;
  tags: string[];
  cook_time: number | null;
  is_public: boolean;
  servings: number | null;
  meal_types: string[];
  ingredients_nutrition: FdcNutrition[] | null;
  created_at: Date;
  updated_at: Date;
}

export interface RecipeSearchParams {
  query?: string;
  tag?: string;
  maxCookTime?: number;
  ingredients?: string[];
  mealType?: string;
}
