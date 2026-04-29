export interface RecipeInput {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  image_path?: string | null;
  tags?: string[];
  cook_time?: number | null;
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
  created_at: Date;
  updated_at: Date;
}

export interface RecipeSearchParams {
  query?: string;
  tag?: string;
  maxCookTime?: number;
}
