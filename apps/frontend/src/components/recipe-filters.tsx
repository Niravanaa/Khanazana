'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useRef, useTransition, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface RecipeFiltersProps {
  initialQuery?: string;
  initialTag?: string;
  initialMaxCookTime?: string;
  initialIngredients?: string;
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
}: RecipeFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const ingredientInputRef = useRef<HTMLInputElement>(null);

  const [q, setQ] = useState(initialQuery ?? '');
  const [tag, setTag] = useState(initialTag ?? '');
  const [maxCookTime, setMaxCookTime] = useState(initialMaxCookTime ?? '');
  const [ingredientTags, setIngredientTags] = useState<string[]>(() =>
    parseTags(initialIngredients),
  );
  const [ingredientInput, setIngredientInput] = useState('');

  // refs to avoid stale closures inside timeout
  const qRef = useRef(q);
  const tagRef = useRef(tag);
  const maxCookTimeRef = useRef(maxCookTime);
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
    ingredientsRef.current = ingredientTags.join(',');
  }, [ingredientTags]);

  const buildParams = useCallback((overrides: Record<string, string | undefined> = {}) => {
    const merged: Record<string, string | undefined> = {
      q: qRef.current,
      tag: tagRef.current,
      maxCookTime: maxCookTimeRef.current,
      ingredients: ingredientsRef.current || undefined,
      ...overrides,
    };
    const params = new URLSearchParams();
    if (merged.q) params.set('q', merged.q);
    if (merged.tag) params.set('tag', merged.tag);
    if (merged.maxCookTime) params.set('maxCookTime', merged.maxCookTime);
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
    setIngredientTags(parseTags(initialIngredients));
    setIngredientInput('');
  }, [initialQuery, initialTag, initialMaxCookTime, initialIngredients]);

  // listen for global clear event
  useEffect(() => {
    function onClear() {
      setQ('');
      setTag('');
      setMaxCookTime('');
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

  const hasFilters = !!(q || tag || maxCookTime || ingredientTags.length > 0);

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
              setIngredientTags([]);
              setIngredientInput('');
              startTransition(() => router.push(pathname));
            }}
            disabled={isPending}
            className="shrink-0"
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
