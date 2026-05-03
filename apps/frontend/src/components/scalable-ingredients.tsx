'use client';

import { useState } from 'react';

interface ScalableIngredientsProps {
  ingredients: string[];
  defaultServings: number;
}

function parseQty(s: string): { qty: number; rest: string } | null {
  const m = s.match(/^(\d+\.?\d*(?:\/\d+)?)\s+([\s\S]+)$/);
  if (!m) return null;
  const raw = m[1];
  const num = raw.includes('/')
    ? raw
        .split('/')
        .reduce((a: number, b: string) => a / parseFloat(b), parseFloat(raw.split('/')[0]))
    : parseFloat(raw);
  return isNaN(num) ? null : { qty: num, rest: m[2] };
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return String(n);
  const rounded = Math.round(n * 100) / 100;
  // Attempt a simple fraction display for common values
  const fractions: [number, string][] = [
    [0.25, '¼'],
    [0.33, '⅓'],
    [0.5, '½'],
    [0.67, '⅔'],
    [0.75, '¾'],
  ];
  const whole = Math.floor(rounded);
  const frac = rounded - whole;
  for (const [val, sym] of fractions) {
    if (Math.abs(frac - val) < 0.04) {
      return whole > 0 ? `${whole}${sym}` : sym;
    }
  }
  return rounded.toFixed(2).replace(/\.?0+$/, '');
}

function scaleIngredient(ingredient: string, factor: number): string {
  const parsed = parseQty(ingredient);
  if (!parsed) return ingredient;
  return `${formatNum(parsed.qty * factor)} ${parsed.rest}`;
}

export function ScalableIngredients({ ingredients, defaultServings }: ScalableIngredientsProps) {
  const [servings, setServings] = useState(defaultServings);
  const factor = servings / defaultServings;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Ingredients</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Servings:</span>
          <button
            type="button"
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-foreground hover:bg-accent disabled:opacity-40"
            disabled={servings <= 1}
            aria-label="Decrease servings"
          >
            −
          </button>
          <span className="w-6 text-center text-sm font-medium text-foreground">{servings}</span>
          <button
            type="button"
            onClick={() => setServings((s) => s + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-foreground hover:bg-accent"
            aria-label="Increase servings"
          >
            +
          </button>
        </div>
      </div>
      <ul className="space-y-2">
        {ingredients.map((ingredient, i) => (
          <li key={i} className="flex items-start">
            <span className="mr-3 flex-shrink-0 text-muted-foreground">•</span>
            <span className="text-foreground">{scaleIngredient(ingredient, factor)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
