'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface WeekPickerProps {
  weeks: string[];
  current: string;
  basePath: string;
}

function formatWeekLabel(weekParam: string): string {
  const d = new Date(weekParam + 'T00:00:00Z');
  const end = new Date(d);
  end.setUTCDate(end.getUTCDate() + 6);
  const fmt = (date: Date) =>
    date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return `${fmt(d)} – ${fmt(end)}`;
}

export function WeekPicker({ weeks, current, basePath }: WeekPickerProps) {
  const router = useRouter();
  const currentIndex = weeks.indexOf(current);
  const inList = currentIndex !== -1;
  const prevWeek = inList && currentIndex < weeks.length - 1 ? weeks[currentIndex + 1] : null;
  const nextWeek = inList && currentIndex > 0 ? weeks[currentIndex - 1] : null;

  return (
    <div className="flex items-center gap-2">
      <Link
        href={prevWeek ? `${basePath}?week=${prevWeek}` : '#'}
        aria-disabled={!prevWeek}
        className={`rounded-md border border-border px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground ${!prevWeek ? 'pointer-events-none opacity-40' : ''}`}
      >
        ←
      </Link>

      <select
        value={inList ? current : ''}
        onChange={(e) => router.push(`${basePath}?week=${e.target.value}`)}
        className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
      >
        {!inList && (
          <option value="" disabled>
            {formatWeekLabel(current)} (no list)
          </option>
        )}
        {weeks.map((w) => (
          <option key={w} value={w}>
            {formatWeekLabel(w)}
          </option>
        ))}
      </select>

      <Link
        href={nextWeek ? `${basePath}?week=${nextWeek}` : '#'}
        aria-disabled={!nextWeek}
        className={`rounded-md border border-border px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground ${!nextWeek ? 'pointer-events-none opacity-40' : ''}`}
      >
        →
      </Link>
    </div>
  );
}
