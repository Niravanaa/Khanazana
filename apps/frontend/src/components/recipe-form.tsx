'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { RecipeRecord } from '@/lib/types';

interface IngredientRow {
  qty: string;
  name: string;
  note: string;
}

interface RecipeFormProps {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  initialRecipe?: RecipeRecord;
}

function parseIngredientString(s: string): IngredientRow {
  const match = s.match(/^(\d+\.?\d*(?:\/\d+)?)\s+(.+?)(?:\s+\((.+)\))?$/);
  if (match) {
    return { qty: match[1], name: match[2], note: match[3] ?? '' };
  }
  return { qty: '', name: s, note: '' };
}

function emptyIngredient(): IngredientRow {
  return { qty: '', name: '', note: '' };
}

export function RecipeForm({ action, submitLabel, initialRecipe }: RecipeFormProps) {
  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    initialRecipe?.ingredients?.length
      ? initialRecipe.ingredients.map(parseIngredientString)
      : [emptyIngredient()],
  );

  const [instructions, setInstructions] = useState<string[]>(
    initialRecipe?.instructions?.length ? initialRecipe.instructions : [''],
  );

  function updateIngredient(index: number, field: keyof IngredientRow, value: string) {
    setIngredients((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  function updateInstruction(index: number, value: string) {
    setInstructions((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function removeInstruction(index: number) {
    setInstructions((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  return (
    <form action={action} className="space-y-6">
      {/* Title */}
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

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Short Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initialRecipe?.description ?? ''}
          placeholder="A brief description of your recipe"
          rows={2}
        />
      </div>

      {/* Cook time + Tags */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cook_time">Cook Time (minutes)</Label>
          <Input
            id="cook_time"
            name="cook_time"
            type="number"
            min="1"
            defaultValue={initialRecipe?.cook_time ?? ''}
            placeholder="e.g. 30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            name="tags"
            defaultValue={initialRecipe?.tags?.join(', ') ?? ''}
            placeholder="e.g. vegetarian, quick"
          />
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-2">
        <Label>Ingredients</Label>
        <div className="space-y-2">
          {ingredients.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              {/* Hidden inputs so FormData carries the values */}
              <input type="hidden" name="ingredient_qty" value={row.qty} />
              <input type="hidden" name="ingredient_name" value={row.name} />
              <input type="hidden" name="ingredient_note" value={row.note} />

              <Input
                className="w-16 shrink-0"
                placeholder="Qty"
                value={row.qty}
                onChange={(e) => updateIngredient(i, 'qty', e.target.value)}
              />
              <Input
                className="flex-1"
                placeholder="Ingredient (e.g. cups of flour)"
                value={row.name}
                onChange={(e) => updateIngredient(i, 'name', e.target.value)}
              />
              <Input
                className="w-32 shrink-0"
                placeholder="Note (e.g. cubed)"
                value={row.note}
                onChange={(e) => updateIngredient(i, 'note', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeIngredient(i)}
                className="shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
                disabled={ingredients.length === 1}
                aria-label="Remove ingredient"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIngredients((prev) => [...prev, emptyIngredient()])}
        >
          + Add ingredient
        </Button>
      </div>

      {/* Instructions */}
      <div className="space-y-2">
        <Label>Instructions</Label>
        <div className="space-y-2">
          {instructions.map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <input type="hidden" name="instruction_step" value={step} />

              <span className="mt-2.5 w-6 shrink-0 text-right text-xs text-muted-foreground">
                {i + 1}.
              </span>
              <Input
                className="flex-1"
                placeholder={`Step ${i + 1}`}
                value={step}
                onChange={(e) => updateInstruction(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeInstruction(i)}
                className="mt-2 shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
                disabled={instructions.length === 1}
                aria-label="Remove step"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setInstructions((prev) => [...prev, ''])}
        >
          + Add step
        </Button>
      </div>

      {/* Image */}
      <div className="space-y-2">
        <Label htmlFor="image">Recipe Image (optional)</Label>
        <Input id="image" name="image" type="file" accept="image/*" />
      </div>

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
