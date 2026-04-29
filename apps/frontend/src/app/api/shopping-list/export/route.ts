import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/recipes';
import { getShoppingList } from '@/lib/shopping-list';
import { getWeekStart, weekStartParam } from '@/lib/meal-plan';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const weekParam = searchParams.get('week');

  let weekStart: Date;
  if (weekParam) {
    const d = new Date(weekParam + 'T00:00:00Z');
    weekStart = isNaN(d.getTime()) ? getWeekStart(new Date()) : d;
  } else {
    weekStart = getWeekStart(new Date());
  }

  const items = await getShoppingList(user.id, weekStart);

  const rows = [
    'Ingredient,Bought',
    ...items.map((i) => `"${i.ingredient.replace(/"/g, '""')}",${i.bought ? 'yes' : 'no'}`),
  ];
  const csv = rows.join('\r\n');

  const filename = `shopping-list-${weekStartParam(weekStart)}.csv`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
