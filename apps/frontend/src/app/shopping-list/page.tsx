import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/recipes';
import { getShoppingList, getShoppingListWeeks } from '@/lib/shopping-list';
import { getWeekStart, weekStartParam } from '@/lib/meal-plan';
import { ShoppingListClient } from '@/components/shopping-list-client';
import { WeekPicker } from '@/components/week-picker';

function parseWeekStart(param: string | undefined): Date {
  if (param) {
    const d = new Date(param + 'T00:00:00Z');
    if (!isNaN(d.getTime())) return d;
  }
  return getWeekStart(new Date());
}

function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setUTCDate(end.getUTCDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return `${fmt(weekStart)} – ${fmt(end)}`;
}

interface ShoppingListPageProps {
  searchParams: { week?: string };
}

export default async function ShoppingListPage({ searchParams }: ShoppingListPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const weekStart = parseWeekStart(searchParams.week);
  const week = weekStartParam(weekStart);
  const [items, allWeeks] = await Promise.all([
    getShoppingList(user.id, weekStart),
    getShoppingListWeeks(user.id),
  ]);

  const exportUrl = `/api/shopping-list/export?week=${week}`;

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Shopping List</h1>
            <p className="mt-1 text-muted-foreground">{formatWeekRange(weekStart)}</p>
          </div>
          <Link
            href={`/meal-plan?week=${week}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Meal plan
          </Link>
        </div>

        {allWeeks.length > 0 && (
          <div className="mb-6">
            <WeekPicker weeks={allWeeks} current={week} basePath="/shopping-list" />
          </div>
        )}

        <ShoppingListClient items={items} week={week} exportUrl={exportUrl} />
      </div>
    </main>
  );
}
