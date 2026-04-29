'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import type { DayOfWeek, MealSlot } from '@/lib/meal-plan';

interface Recipe {
  id: string;
  title: string;
  image_url: string | null;
  tags: string[];
  cook_time: number | null;
}

interface RecipePickerProps {
  day: DayOfWeek;
  onSelect: (recipeId: string, slot: MealSlot) => void;
  onClose: () => void;
}

type View = 'list' | 'card';

const SLOTS: { value: MealSlot; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snacks', label: 'Snacks' },
];

function getInitials(title: string): string {
  return title
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 3)
    .join('');
}

export function RecipePicker({ day, onSelect, onClose }: RecipePickerProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('list');
  const [slot, setSlot] = useState<MealSlot | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, true>>({});
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/recipes')
      .then((r) => r.json())
      .then((data) => setRecipes(data.recipes ?? data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const filtered = recipes.filter((r) => r.title.toLowerCase().includes(query.toLowerCase()));

  function hasImage(recipe: Recipe): boolean {
    return Boolean(recipe.image_url) && !failedImages[recipe.id];
  }

  function handleSelect(recipeId: string) {
    if (!slot) return;
    onSelect(recipeId, slot);
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="flex w-full max-w-lg flex-col rounded-xl border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold capitalize text-foreground">Add to {day}</h2>
          <div className="flex items-center gap-2">
            <div className="flex overflow-hidden rounded-md border border-border text-xs">
              <button
                onClick={() => setView('list')}
                className={`px-2.5 py-1 transition-colors ${view === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label="List view"
              >
                ☰
              </button>
              <button
                onClick={() => setView('card')}
                className={`px-2.5 py-1 transition-colors ${view === 'card' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label="Card view"
              >
                ⊞
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Slot selector */}
        <div className="flex gap-1.5 border-b border-border px-4 py-3">
          {SLOTS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSlot(s.value)}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                slot === s.value
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <Input
            autoFocus
            placeholder="Search recipes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto px-4 pb-4">
          {!slot && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Select a meal type above first.
            </p>
          )}

          {slot && loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {slot && !loading && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">No recipes found.</p>
          )}

          {slot && view === 'list' && (
            <ul className="space-y-1">
              {filtered.map((recipe) => (
                <li key={recipe.id}>
                  <button
                    onClick={() => handleSelect(recipe.id)}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                  >
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded bg-secondary">
                      {hasImage(recipe) ? (
                        <Image
                          src={recipe.image_url as string}
                          alt=""
                          fill
                          sizes="32px"
                          className="object-cover"
                          onError={() =>
                            setFailedImages((prev) => ({
                              ...prev,
                              [recipe.id]: true,
                            }))
                          }
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-secondary-foreground">
                          {getInitials(recipe.title)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">{recipe.title}</p>
                      {recipe.cook_time && (
                        <p className="text-xs text-muted-foreground">{recipe.cook_time} min</p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {slot && view === 'card' && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {filtered.map((recipe) => {
                const imgUrl = hasImage(recipe) ? recipe.image_url : null;
                return (
                  <button
                    key={recipe.id}
                    onClick={() => handleSelect(recipe.id)}
                    className="group flex flex-col overflow-hidden rounded-lg border border-border bg-background text-left transition-all hover:border-primary hover:shadow-sm"
                  >
                    <div className="relative h-24 w-full shrink-0 overflow-hidden bg-secondary">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 50vw, 160px"
                          className="object-cover transition-transform group-hover:scale-105"
                          onError={() =>
                            setFailedImages((prev) => ({
                              ...prev,
                              [recipe.id]: true,
                            }))
                          }
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-secondary-foreground">
                          {getInitials(recipe.title)}
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="line-clamp-2 text-xs font-medium leading-tight text-foreground">
                        {recipe.title}
                      </p>
                      {recipe.cook_time && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {recipe.cook_time} min
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
