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
    <div className="group relative overflow-hidden rounded-md" title={entry.recipe.title}>
      {entry.recipe.image_url ? (
        <Image
          src={entry.recipe.image_url}
          alt={entry.recipe.title}
          width={320}
          height={56}
          className="h-14 w-full object-cover"
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
        className="absolute right-0.5 top-0.5 hidden h-4 w-4 items-center justify-center rounded bg-black/60 text-[10px] text-white group-hover:flex"
        aria-label="Remove"
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
        <div className="flex min-w-[640px] gap-2">
          {days.map((day) => {
            const entries = entriesFor(day);
            return (
              <div key={day} className="flex flex-1 flex-col gap-1">
                {/* Day header */}
                <div className="pb-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {day.slice(0, 3)}
                </div>

                {/* Meal cards */}
                <div className="flex flex-1 flex-col gap-1 rounded-lg border border-border bg-card p-1">
                  {entries.map((entry) => (
                    <MealCard
                      key={entry.id}
                      entry={entry}
                      onRemove={() => handleRemove(entry.id)}
                    />
                  ))}
                  <button
                    onClick={() => setPickerDay(day)}
                    className="mt-auto rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
