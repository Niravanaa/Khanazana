'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { NutritionFilterType } from '@/lib/meal-plan';

interface NutritionFilterProps {
  week: string;
}

const FILTER_OPTIONS: { value: NutritionFilterType; label: string; group: 'time' | 'day' }[] = [
  { value: 'all', label: 'All days', group: 'time' },
  { value: 'weekdays', label: 'Weekdays', group: 'time' },
  { value: 'weekend', label: 'Weekend', group: 'time' },
  { value: 'monday', label: 'Monday', group: 'day' },
  { value: 'tuesday', label: 'Tuesday', group: 'day' },
  { value: 'wednesday', label: 'Wednesday', group: 'day' },
  { value: 'thursday', label: 'Thursday', group: 'day' },
  { value: 'friday', label: 'Friday', group: 'day' },
  { value: 'saturday', label: 'Saturday', group: 'day' },
  { value: 'sunday', label: 'Sunday', group: 'day' },
];

export function NutritionFilter({ week }: NutritionFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = (searchParams.get('nutritionFilter') || 'all') as NutritionFilterType;

  const handleFilterChange = useCallback(
    (filter: NutritionFilterType) => {
      const params = new URLSearchParams();
      params.set('week', week);
      params.set('nutritionFilter', filter);
      router.push(`/meal-plan?${params.toString()}`);
    },
    [week, router],
  );

  const timeOptions = FILTER_OPTIONS.filter((opt) => opt.group === 'time');
  const dayOptions = FILTER_OPTIONS.filter((opt) => opt.group === 'day');

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {timeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleFilterChange(opt.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              currentFilter === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-background text-foreground hover:bg-accent'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {dayOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleFilterChange(opt.value)}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              currentFilter === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-background text-foreground hover:bg-accent'
            }`}
          >
            {opt.label.slice(0, 3)}
          </button>
        ))}
      </div>
    </div>
  );
}
