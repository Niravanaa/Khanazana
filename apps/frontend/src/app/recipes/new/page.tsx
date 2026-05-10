import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/recipes';
import { createRecipeAction } from '@/app/recipes/actions';
import { NewRecipeClient } from './new-recipe-client';

export const dynamic = 'force-dynamic';

export default async function NewRecipePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/recipes"
          className="mb-6 inline-flex text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to recipes
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Create Recipe</CardTitle>
            <CardDescription>Add a new recipe to your collection</CardDescription>
          </CardHeader>
          <CardContent>
            <NewRecipeClient action={createRecipeAction} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
