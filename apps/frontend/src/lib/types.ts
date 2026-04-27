export interface RecipeInput {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  image_path?: string | null;
}
