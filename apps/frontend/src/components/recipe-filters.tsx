'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useRef, useTransition, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const MEAL_TYPE_OPTIONS = ['breakfast', 'lunch', 'dinner', 'snacks'] as const;

interface RecipeFiltersProps {
  initialQuery?: string;
  initialTag?: string;
  initialMaxCookTime?: string;
  initialIngredients?: string;
  initialMealType?: string;
}

function parseTags(csv: string | undefined): string[] {
  if (!csv) return [];
  return csv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function RecipeFilters({
  initialQuery,
  initialTag,
  initialMaxCookTime,
  initialIngredients,
  initialMealType,
}: RecipeFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const ingredientInputRef = useRef<HTMLInputElement>(null);

  const [q, setQ] = useState(initialQuery ?? '');
  const [tag, setTag] = useState(initialTag ?? '');
  const [maxCookTime, setMaxCookTime] = useState(initialMaxCookTime ?? '');
  const [mealType, setMealType] = useState(initialMealType ?? '');
  const [ingredientTags, setIngredientTags] = useState<string[]>(() =>
    parseTags(initialIngredients),
  );
  const [ingredientInput, setIngredientInput] = useState('');

  // refs to avoid stale closures inside timeout
  const qRef = useRef(q);
  const tagRef = useRef(tag);
  const maxCookTimeRef = useRef(maxCookTime);
  const mealTypeRef = useRef(mealType);
  const ingredientsRef = useRef(ingredientTags.join(','));

  useEffect(() => {
    qRef.current = q;
  }, [q]);
  useEffect(() => {
    tagRef.current = tag;
  }, [tag]);
  useEffect(() => {
    maxCookTimeRef.current = maxCookTime;
  }, [maxCookTime]);
  useEffect(() => {
    mealTypeRef.current = mealType;
  }, [mealType]);
  useEffect(() => {
    ingredientsRef.current = ingredientTags.join(',');
  }, [ingredientTags]);

  const buildParams = useCallback((overrides: Record<string, string | undefined> = {}) => {
    const merged: Record<string, string | undefined> = {
      q: qRef.current,
      tag: tagRef.current,
      maxCookTime: maxCookTimeRef.current,
      mealType: mealTypeRef.current || undefined,
      ingredients: ingredientsRef.current || undefined,
      ...overrides,
    };
    const params = new URLSearchParams();
    if (merged.q) params.set('q', merged.q);
    if (merged.tag) params.set('tag', merged.tag);
    if (merged.maxCookTime) params.set('maxCookTime', merged.maxCookTime);
    if (merged.mealType) params.set('mealType', merged.mealType);
    if (merged.ingredients) params.set('ingredients', merged.ingredients);
    return params;
  }, []);

  const updateSearch = useCallback(
    (field: string, value: string | undefined) => {
      clearTimeout(timers.current[field]);
      timers.current[field] = setTimeout(() => {
        const params = buildParams({ [field]: value });
        startTransition(() => router.push(`${pathname}?${params.toString()}`));
      }, 400);
    },
    [router, pathname, buildParams],
  );

  const navigateNow = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = buildParams(overrides);
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [router, pathname, buildParams],
  );

  // sync local state when server-provided initial props change (e.g., navigation)
  useEffect(() => {
    setQ(initialQuery ?? '');
    setTag(initialTag ?? '');
    setMaxCookTime(initialMaxCookTime ?? '');
    setMealType(initialMealType ?? '');
    setIngredientTags(parseTags(initialIngredients));
    setIngredientInput('');
  }, [initialQuery, initialTag, initialMaxCookTime, initialMealType, initialIngredients]);

  // listen for global clear event
  useEffect(() => {
    function onClear() {
      setQ('');
      setTag('');
      setMaxCookTime('');
      setMealType('');
      setIngredientTags([]);
      setIngredientInput('');
    }
    window.addEventListener('clear-recipe-filters', onClear as EventListener);
    return () => window.removeEventListener('clear-recipe-filters', onClear as EventListener);
  }, []);

  function addIngredientTag(value: string) {
    const trimmed = value.trim();
    if (!trimmed || ingredientTags.includes(trimmed)) return;
    const next = [...ingredientTags, trimmed];
    setIngredientTags(next);
    setIngredientInput('');
    navigateNow({ ingredients: next.join(',') });
  }

  function removeIngredientTag(t: string) {
    const next = ingredientTags.filter((x) => x !== t);
    setIngredientTags(next);
    navigateNow({ ingredients: next.join(',') || undefined });
  }

  function handleIngredientKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === ' ') {
      e.preventDefault();
      addIngredientTag(ingredientInput);
    } else if (e.key === 'Backspace' && ingredientInput === '' && ingredientTags.length > 0) {
      removeIngredientTag(ingredientTags[ingredientTags.length - 1]);
    }
  }

  const hasFilters = !!(q || tag || maxCookTime || mealType || ingredientTags.length > 0);
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6 space-y-2">
      {/* Mobile toggle */}
      <div className="flex items-center gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground"
          aria-expanded={open}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="14" y2="12" />
            <line x1="4" y1="18" x2="10" y2="18" />
          </svg>
          Filters
          {hasFilters && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {[q, tag, maxCookTime, mealType, ...ingredientTags].filter(Boolean).length}
            </span>
          )}
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQ('');
              setTag('');
              setMaxCookTime('');
              setMealType('');
              setIngredientTags([]);
              setIngredientInput('');
              startTransition(() => router.push(pathname));
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      <div className={`flex flex-wrap items-center gap-3 ${open ? 'flex' : 'hidden'} sm:flex`}>
        <Input
          type="search"
          placeholder="Search by title or description..."
          aria-label="Search recipes by title or description"
          value={q}
          className="w-full sm:max-w-xs"
          onChange={(e) => {
            setQ(e.target.value);
            updateSearch('q', e.target.value || undefined);
          }}
        />
        <Input
          type="text"
          placeholder="Filter by tag..."
          aria-label="Filter by tag"
          value={tag}
          className="w-full sm:max-w-[160px]"
          onChange={(e) => {
            setTag(e.target.value);
            updateSearch('tag', e.target.value || undefined);
          }}
        />
        <Input
          type="number"
          placeholder="Max cook time (min)"
          aria-label="Maximum cook time in minutes"
          value={maxCookTime}
          min="1"
          className="w-full sm:max-w-[180px]"
          onChange={(e) => {
            setMaxCookTime(e.target.value);
            updateSearch('maxCookTime', e.target.value || undefined);
          }}
        />

        {/* Meal type dropdown */}
        <select
          aria-label="Filter by meal type"
          value={mealType}
          onChange={(e) => {
            setMealType(e.target.value);
            navigateNow({ mealType: e.target.value || undefined });
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All meal types</option>
          {MEAL_TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt} className="capitalize">
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>

        {/* Ingredient tag input */}
        <div
          role="group"
          aria-label="Filter by ingredients"
          className="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 sm:max-w-sm"
        >
          {ingredientTags.map((t) => (
            <span
              key={t}
              className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              {t}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeIngredientTag(t);
                }}
                className="leading-none text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${t}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            ref={ingredientInputRef}
            type="text"
            placeholder={ingredientTags.length === 0 ? 'Filter by ingredient...' : ''}
            aria-label="Add ingredient filter — press Space to confirm"
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyDown={handleIngredientKeyDown}
            className="min-w-[80px] flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            onClick={() => {
              setQ('');
              setTag('');
              setMaxCookTime('');
              setMealType('');
              setIngredientTags([]);
              setIngredientInput('');
              startTransition(() => router.push(pathname));
            }}
            disabled={isPending}
            className="hidden shrink-0 sm:inline-flex"
            aria-label="Clear all filters"
          >
            Clear
          </Button>
        )}
      </div>

      {isPending && <p className="text-xs text-muted-foreground">Filtering...</p>}
    </div>
  );
}
