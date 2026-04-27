export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface RecipeSummary {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}
