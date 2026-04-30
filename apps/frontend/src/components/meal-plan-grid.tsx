'use client';

import Image from 'next/image';
import { useState, useTransition } from 'react';
import { addEntryAction, removeEntryAction } from '@/app/meal-plan/actions';
import type { WeeklyMealPlan, DayOfWeek, MealSlot, MealPlanEntryWithRecipe } from '@/lib/meal-plan';
import { RecipePicker } from '@/components/recipe-picker';

interface MealPlanGridProps {
  plan: WeeklyMealPlan;
  userId: string;
  days: readonly DayOfWeek[];
  slots: readonly MealSlot[];
}

const SLOT_ORDER: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

function getInitials(title: string): string {
  return title
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 3)
    .join('');
}

function MealCard({ entry, onRemove }: { entry: MealPlanEntryWithRecipe; onRemove: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-md" title={entry.recipe.title}>
      {entry.recipe.image_url ? (
        <Image
          src={entry.recipe.image_url}
          alt={entry.recipe.title}
          width={320}
          height={56}
          className="h-14 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-14 w-full items-center justify-center bg-secondary text-xs font-semibold text-secondary-foreground">
          {getInitials(entry.recipe.title)}
        </div>
      )}
      {/* Slot badge */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 text-center text-[9px] capitalize leading-tight text-white">
        {entry.meal_slot}
      </div>
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded bg-black/60 text-sm text-white"
        aria-label={`Remove ${entry.recipe.title}`}
      >
        ×
      </button>
    </div>
  );
}

export function MealPlanGrid({ plan, days }: MealPlanGridProps) {
  const [pickerDay, setPickerDay] = useState<DayOfWeek | null>(null);
  const [, startTransition] = useTransition();

  function entriesFor(day: DayOfWeek): MealPlanEntryWithRecipe[] {
    return plan.entries
      .filter((e) => e.day === day)
      .sort((a, b) => SLOT_ORDER.indexOf(a.meal_slot) - SLOT_ORDER.indexOf(b.meal_slot));
  }

  function handleRemove(entryId: string) {
    startTransition(() => removeEntryAction(entryId));
  }

  function handleAdd(recipeId: string, slot: MealSlot) {
    if (!pickerDay) return;
    startTransition(() => addEntryAction(plan.id, recipeId, pickerDay, slot));
    setPickerDay(null);
  }

  return (
    <>
      <div className="overflow-x-auto">
        <div className="flex flex-col sm:flex-row gap-2">
          {days.map((day) => {
            const entries = entriesFor(day);
            return (
              <div key={day} className="w-full sm:flex-1 flex flex-col gap-1 min-w-0">
                {/* Day header */}
                <div className="pb-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <span className="sm:hidden capitalize">{day}</span>
                  <span className="hidden sm:inline">{day.slice(0, 3)}</span>
                </div>

                {/* Meal cards */}
                <div className="flex flex-1 flex-col gap-1 rounded-lg border border-border bg-card p-2">
                  {entries.map((entry) => (
                    <MealCard
                      key={entry.id}
                      entry={entry}
                      onRemove={() => handleRemove(entry.id)}
                    />
                  ))}
                  <button
                    onClick={() => setPickerDay(day)}
                    className="mt-2 w-full rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground sm:mt-auto"
                    aria-label={`Add recipe to ${day}`}
                  >
                    + Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {pickerDay && (
        <RecipePicker day={pickerDay} onSelect={handleAdd} onClose={() => setPickerDay(null)} />
      )}
    </>
  );
}
