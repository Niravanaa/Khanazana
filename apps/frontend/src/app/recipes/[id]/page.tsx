import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { deleteRecipeAction } from '@/app/recipes/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyLinkButton } from '@/components/copy-link-button';
import { RecipeNutrition } from '@/components/recipe-nutrition';
import { ScalableIngredients } from '@/components/scalable-ingredients';
import { getCurrentUser, getRecipeByIdForUser, getRecipeImageUrl } from '@/lib/recipes';

export const dynamic = 'force-dynamic';

export default async function RecipeDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const recipe = await getRecipeByIdForUser(params.id, user.id);
  if (!recipe) {
    notFound();
  }

  const imageUrl = getRecipeImageUrl(recipe.image_path);
  const deleteAction = deleteRecipeAction.bind(null, recipe.id);

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
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="text-3xl">{recipe.title}</CardTitle>
                <CardDescription>{recipe.description}</CardDescription>
              </div>
              {recipe.is_public && (
                <span className="mt-1 shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Public
                </span>
              )}
            </div>
            {(recipe.cook_time || recipe.servings || recipe.tags.length > 0) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {recipe.cook_time && (
                  <span className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                    ⏱ {recipe.cook_time} min
                  </span>
                )}
                {recipe.servings && (
                  <span className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                    🍽 {recipe.servings} servings
                  </span>
                )}
                {recipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {imageUrl ? (
              <div className="relative h-96 w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={imageUrl}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 600px"
                />
              </div>
            ) : null}

            <ScalableIngredients
              ingredients={recipe.ingredients as string[]}
              defaultServings={recipe.servings ?? 1}
            />

            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Instructions</h2>
              <ol className="space-y-2">
                {(recipe.instructions as string[]).map((step, index) => (
                  <li key={step} className="flex items-start">
                    <span className="mr-3 flex-shrink-0 font-semibold text-muted-foreground">
                      {index + 1}.
                    </span>
                    <span className="text-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {recipe.ingredients_nutrition && recipe.ingredients_nutrition.length > 0 && (
              <RecipeNutrition nutrition={recipe.ingredients_nutrition} />
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/recipes/${recipe.id}/edit`}>
            <Button>Edit Recipe</Button>
          </Link>
          <Link href={`/recipes/${recipe.id}/print`} target="_blank">
            <Button variant="outline">Print</Button>
          </Link>
          {recipe.is_public && <CopyLinkButton path={`/recipes/public/${recipe.id}`} />}
          <form action={deleteAction}>
            <Button type="submit" variant="destructive">
              Delete Recipe
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
