import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RecipeForm } from '@/components/recipe-form';
import { getCurrentUser, getRecipeByIdForUser } from '@/lib/recipes';
import { updateRecipeAction } from '@/app/recipes/actions';

export const dynamic = 'force-dynamic';

export default async function EditRecipePage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const recipe = await getRecipeByIdForUser(params.id, user.id);
  if (!recipe) {
    notFound();
  }

  const submitAction = updateRecipeAction.bind(null, recipe.id);

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/recipes/${recipe.id}`}
          className="mb-6 inline-flex text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to recipe
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Edit Recipe</CardTitle>
            <CardDescription>Update your recipe details</CardDescription>
          </CardHeader>
          <CardContent>
            <RecipeForm action={submitAction} initialRecipe={recipe} submitLabel="Save Changes" />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
