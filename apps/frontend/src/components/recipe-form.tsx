'use client';

import { useState, useRef } from 'react';
import { track } from '@vercel/analytics';
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

const MEAL_TYPE_OPTIONS = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snacks', label: 'Snacks' },
] as const;

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
  const [isPublic, setIsPublic] = useState(initialRecipe?.is_public ?? false);
  const [mealTypes, setMealTypes] = useState<string[]>(initialRecipe?.meal_types ?? []);
  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    initialRecipe?.ingredients?.length
      ? initialRecipe.ingredients.map(parseIngredientString)
      : [emptyIngredient()],
  );

  const [instructions, setInstructions] = useState<string[]>(
    initialRecipe?.instructions?.length ? initialRecipe.instructions : [''],
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    <form action={action} className="space-y-6" onSubmit={() => track('recipe_saved')}>
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

      {/* Cook time + Servings + Tags */}
      <div className="grid gap-4 sm:grid-cols-3">
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
          <Label htmlFor="servings">Servings</Label>
          <Input
            id="servings"
            name="servings"
            type="number"
            min="1"
            defaultValue={initialRecipe?.servings ?? ''}
            placeholder="e.g. 4"
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

      {/* Meal types */}
      <div className="space-y-2">
        <Label>Meal type</Label>
        <div className="flex flex-wrap gap-3">
          {MEAL_TYPE_OPTIONS.map((opt) => {
            const checked = mealTypes.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  checked
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                <input
                  type="checkbox"
                  name="meal_types"
                  value={opt.value}
                  checked={checked}
                  onChange={(e) =>
                    setMealTypes((prev) =>
                      e.target.checked ? [...prev, opt.value] : prev.filter((v) => v !== opt.value),
                    )
                  }
                  className="sr-only"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">Select all that apply.</p>
      </div>

      {/* Visibility */}
      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Public recipe</p>
          <p className="text-xs text-muted-foreground">Anyone with the link can view this recipe</p>
        </div>
        <input type="hidden" name="is_public" value={String(isPublic)} />
        <button
          type="button"
          role="switch"
          aria-label="Toggle public recipe"
          aria-checked={isPublic}
          onClick={() => setIsPublic((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${isPublic ? 'bg-primary' : 'bg-input'}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
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
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          ref={fileInputRef as any}
          onChange={async (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (!files || files.length === 0) return;
            const file = files[0];
            if (!file.type.startsWith('image/')) return;

            // Compress image using canvas
            try {
              const imgBitmap = await createImageBitmap(file);
              const MAX_WIDTH = 1600;
              const scale = Math.min(1, MAX_WIDTH / imgBitmap.width);
              const cw = Math.round(imgBitmap.width * scale);
              const ch = Math.round(imgBitmap.height * scale);
              const canvas = document.createElement('canvas');
              canvas.width = cw;
              canvas.height = ch;
              const ctx = canvas.getContext('2d');
              if (ctx) ctx.drawImage(imgBitmap, 0, 0, cw, ch);
              const blob: Blob | null = await new Promise((resolve) =>
                canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.8),
              );
              if (blob) {
                const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                  type: 'image/jpeg',
                });
                // Replace the input FileList with the compressed file
                const dt = new DataTransfer();
                dt.items.add(compressed);
                (e.target as HTMLInputElement).files = dt.files;
              }
            } catch (err) {
              // If compression fails, leave original file
              // console.warn('Image compression failed', err);
            }
          }}
        />
      </div>

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
