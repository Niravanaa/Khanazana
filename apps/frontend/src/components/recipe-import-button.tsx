'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { RecipeInput } from '@/lib/types';

const VALID_MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks'];

const EXAMPLE_SCHEMA = `{
  "title": "Pasta Carbonara",
  "description": "A classic Roman pasta dish with eggs, cheese and pancetta.",
  "ingredients": [
    "200g spaghetti",
    "100g pancetta",
    "2 large eggs",
    "50g parmesan, grated",
    "Black pepper to taste"
  ],
  "instructions": [
    "Boil pasta in salted water until al dente.",
    "Fry pancetta until crispy.",
    "Whisk eggs with parmesan.",
    "Drain pasta, remove pan from heat, combine everything quickly.",
    "Season with black pepper and serve immediately."
  ],
  "tags": ["italian", "pasta", "quick"],
  "cook_time": 25,
  "servings": 2,
  "meal_types": ["lunch", "dinner"],
  "is_public": false
}`;

function parseRecipeJson(raw: string): RecipeInput {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON — check for missing commas, brackets, or quotes.');
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Expected a JSON object at the top level.');
  }

  const obj = parsed as Record<string, unknown>;

  if (typeof obj.title !== 'string' || !obj.title.trim()) {
    throw new Error('"title" is required and must be a non-empty string.');
  }

  if (!Array.isArray(obj.ingredients) || obj.ingredients.length === 0) {
    throw new Error('"ingredients" is required and must be a non-empty array of strings.');
  }

  if (!Array.isArray(obj.instructions) || obj.instructions.length === 0) {
    throw new Error('"instructions" is required and must be a non-empty array of strings.');
  }

  const meal_types = Array.isArray(obj.meal_types)
    ? obj.meal_types.map(String).filter((t) => VALID_MEAL_TYPES.includes(t))
    : [];

  return {
    title: obj.title.trim(),
    description: typeof obj.description === 'string' ? obj.description.trim() : '',
    ingredients: obj.ingredients.map(String),
    instructions: obj.instructions.map(String),
    tags: Array.isArray(obj.tags) ? obj.tags.map(String) : [],
    cook_time: typeof obj.cook_time === 'number' ? Math.round(obj.cook_time) : null,
    servings: typeof obj.servings === 'number' ? Math.round(obj.servings) : null,
    meal_types,
    is_public: typeof obj.is_public === 'boolean' ? obj.is_public : false,
  };
}

interface RecipeImportButtonProps {
  onImport: (recipe: RecipeInput) => void;
}

export function RecipeImportButton({ onImport }: RecipeImportButtonProps) {
  const [open, setOpen] = useState(false);
  const [json, setJson] = useState('');
  const [error, setError] = useState('');
  const [showSchema, setShowSchema] = useState(false);

  function handleImport() {
    setError('');
    try {
      const recipe = parseRecipeJson(json);
      onImport(recipe);
      setOpen(false);
      setJson('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse JSON.');
    }
  }

  function handleClose() {
    setOpen(false);
    setJson('');
    setError('');
    setShowSchema(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground border border-border transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Import from JSON
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close dialog"
            className="fixed inset-0 z-50 bg-black/50"
            onClick={handleClose}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-dialog-title"
            className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-lg rounded-lg border border-border bg-card shadow-xl">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 id="import-dialog-title" className="text-base font-semibold text-foreground">
                  Import Recipe from JSON
                </h2>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-4 p-5">
                <p className="text-sm text-muted-foreground">
                  Paste your recipe as JSON below. You can ask an AI to convert any recipe into this
                  format.
                </p>

                <Textarea
                  value={json}
                  onChange={(e) => {
                    setJson(e.target.value);
                    setError('');
                  }}
                  placeholder='{ "title": "My Recipe", "ingredients": [...], "instructions": [...] }'
                  className="h-48 font-mono text-xs"
                  spellCheck={false}
                />

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div>
                  <button
                    type="button"
                    onClick={() => setShowSchema((s) => !s)}
                    className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                  >
                    {showSchema ? 'Hide' : 'Show'} expected format
                  </button>

                  {showSchema && (
                    <pre className="mt-2 max-h-56 overflow-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
                      {EXAMPLE_SCHEMA}
                    </pre>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleImport} disabled={!json.trim()}>
                  Import
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
