import { NextResponse } from 'next/server';
import { createRecipeForUser, getCurrentUser, listRecipesForUser } from '@/lib/recipes';
import { RecipeInput } from '@/lib/types';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recipes = await listRecipesForUser(user.id);
    return NextResponse.json({ recipes });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = (await request.json()) as RecipeInput;
    const recipe = await createRecipeForUser(user.id, payload);

    return NextResponse.json({ recipe }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
