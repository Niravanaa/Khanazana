'use client';

import type { Recipe } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RecipeFormProps {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  initialRecipe?: Recipe;
}

function toTextareaValue(lines: unknown) {
  if (!Array.isArray(lines) || lines.length === 0) return '';
  return (lines as string[]).join('\n');
}

export function RecipeForm({ action, submitLabel, initialRecipe }: RecipeFormProps) {
  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={initialRecipe?.title ?? ''}
          placeholder="Recipe title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Short Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initialRecipe?.description ?? ''}
          placeholder="A brief description of your recipe"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ingredients">Ingredients (one per line)</Label>
        <Textarea
          id="ingredients"
          name="ingredients"
          defaultValue={toTextareaValue(initialRecipe?.ingredients)}
          placeholder="Enter each ingredient on a new line"
          rows={6}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions (one step per line)</Label>
        <Textarea
          id="instructions"
          name="instructions"
          defaultValue={toTextareaValue(initialRecipe?.instructions)}
          placeholder="Enter each step on a new line"
          rows={6}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Recipe Image (optional)</Label>
        <Input id="image" name="image" type="file" accept="image/*" />
      </div>

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
