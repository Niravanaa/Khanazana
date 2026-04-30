'use client';

import { useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function ClearFiltersButton({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  function handleClear() {
    // navigate to base path (no search params)
    startTransition(() => router.push(pathname));
    // notify any client components to clear their local state
    try {
      window.dispatchEvent(new CustomEvent('clear-recipe-filters'));
    } catch (e) {
      // ignore
    }
  }

  return (
    <Button variant="outline" onClick={handleClear} className={className}>
      Clear filters
    </Button>
  );
}
