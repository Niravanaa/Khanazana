'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useRef, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface RecipeFiltersProps {
  initialQuery?: string;
  initialTag?: string;
  initialMaxCookTime?: string;
}

export function RecipeFilters({
  initialQuery,
  initialTag,
  initialMaxCookTime,
}: RecipeFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const updateSearch = useCallback(
    (field: string, value: string | undefined, current: Record<string, string | undefined>) => {
      clearTimeout(timers.current[field]);
      timers.current[field] = setTimeout(() => {
        const merged = { ...current, [field]: value };
        const params = new URLSearchParams();
        if (merged.q) params.set('q', merged.q);
        if (merged.tag) params.set('tag', merged.tag);
        if (merged.maxCookTime) params.set('maxCookTime', merged.maxCookTime);
        startTransition(() => router.push(`${pathname}?${params.toString()}`));
      }, 400);
    },
    [router, pathname],
  );

  const current = { q: initialQuery, tag: initialTag, maxCookTime: initialMaxCookTime };
  const hasFilters = !!(initialQuery || initialTag || initialMaxCookTime);

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="search"
          placeholder="Search by title or description..."
          defaultValue={initialQuery ?? ''}
          className="sm:max-w-xs"
          onChange={(e) => updateSearch('q', e.target.value || undefined, current)}
        />
        <Input
          type="text"
          placeholder="Filter by tag..."
          defaultValue={initialTag ?? ''}
          className="sm:max-w-[160px]"
          onChange={(e) => updateSearch('tag', e.target.value || undefined, current)}
        />
        <Input
          type="number"
          placeholder="Max cook time (min)"
          defaultValue={initialMaxCookTime ?? ''}
          min="1"
          className="sm:max-w-[180px]"
          onChange={(e) => updateSearch('maxCookTime', e.target.value || undefined, current)}
        />
        {hasFilters && (
          <Button
            variant="ghost"
            onClick={() => router.push(pathname)}
            disabled={isPending}
            className="shrink-0"
          >
            Clear
          </Button>
        )}
      </div>
      {isPending && <p className="text-xs text-muted-foreground">Filtering...</p>}
    </div>
  );
}
