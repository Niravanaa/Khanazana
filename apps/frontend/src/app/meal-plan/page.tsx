import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/recipes';
import {
  getOrCreateMealPlan,
  getWeeklyNutrition,
  getWeekStart,
  weekStartParam,
  type NutritionFilterType,
} from '@/lib/meal-plan';
import { MealPlanGrid } from '@/components/meal-plan-grid';
import { NutritionFilter } from '@/components/nutrition-filter';
import { generateShoppingListAction } from '@/app/meal-plan/actions';

export const dynamic = 'force-dynamic';

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;
const SLOTS = ['breakfast', 'lunch', 'dinner', 'snacks'] as const;

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

interface MealPlanPageProps {
  searchParams: { week?: string; nutritionFilter?: string };
}

export default async function MealPlanPage({ searchParams }: MealPlanPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const weekStart = parseWeekStart(searchParams.week);
  const nutritionFilter = (searchParams.nutritionFilter || 'all') as NutritionFilterType;
  const [plan, nutrition] = await Promise.all([
    getOrCreateMealPlan(user.id, weekStart),
    getWeeklyNutrition(user.id, weekStart, nutritionFilter),
  ]);

  const prevWeek = new Date(weekStart);
  prevWeek.setUTCDate(prevWeek.getUTCDate() - 7);
  const nextWeek = new Date(weekStart);
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meal Planner</h1>
            <p className="mt-1 text-muted-foreground">Plan your week, one meal at a time</p>
          </div>
          <Link
            href={`/shopping-list?week=${weekStartParam(weekStart)}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Shopping list →
          </Link>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/meal-plan?week=${weekStartParam(prevWeek)}`}
            className="rounded-md border border-border px-3 py-2.5 text-sm text-foreground hover:bg-accent"
            aria-label="Previous week"
          >
            ← Prev week
          </Link>
          <span className="text-sm font-medium text-foreground" aria-live="polite">
            {formatWeekRange(weekStart)}
          </span>
          <Link
            href={`/meal-plan?week=${weekStartParam(nextWeek)}`}
            className="rounded-md border border-border px-3 py-2.5 text-sm text-foreground hover:bg-accent"
            aria-label="Next week"
          >
            Next week →
          </Link>
        </div>

        <div className="mb-6 flex justify-end">
          <form action={generateShoppingListAction.bind(null, weekStartParam(weekStart))}>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Generate shopping list
            </button>
          </form>
        </div>

        <MealPlanGrid plan={plan} userId={user.id} days={DAYS} slots={SLOTS as any} />

        {nutrition && (
          <div className="mt-8 rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-foreground">Weekly nutrition estimate</h2>
              <span className="text-xs text-muted-foreground">excludes unmatched ingredients</span>
            </div>

            <div className="mb-5">
              <NutritionFilter week={weekStartParam(weekStart)} />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-background px-4 py-3 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {nutrition.calories.toLocaleString()}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">kcal</p>
              </div>
              <div className="rounded-lg bg-background px-4 py-3 text-center">
                <p className="text-2xl font-bold text-foreground">{nutrition.protein_g}g</p>
                <p className="mt-0.5 text-xs text-muted-foreground">protein</p>
              </div>
              <div className="rounded-lg bg-background px-4 py-3 text-center">
                <p className="text-2xl font-bold text-foreground">{nutrition.carbs_g}g</p>
                <p className="mt-0.5 text-xs text-muted-foreground">carbs</p>
              </div>
              <div className="rounded-lg bg-background px-4 py-3 text-center">
                <p className="text-2xl font-bold text-foreground">{nutrition.fat_g}g</p>
                <p className="mt-0.5 text-xs text-muted-foreground">fat</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
