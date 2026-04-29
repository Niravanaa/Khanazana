import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { deleteRecipeAction } from '@/app/recipes/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser, getRecipeByIdForUser, getRecipeImageUrl } from '@/lib/recipes';

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
            <CardTitle className="text-3xl">{recipe.title}</CardTitle>
            <CardDescription>{recipe.description}</CardDescription>
            {(recipe.cook_time || recipe.tags.length > 0) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {recipe.cook_time && (
                  <span className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                    ⏱ {recipe.cook_time} min
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
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 600px"
                />
              </div>
            ) : null}

            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Ingredients</h2>
              <ul className="space-y-2">
                {(recipe.ingredients as string[]).map((ingredient) => (
                  <li key={ingredient} className="flex items-start">
                    <span className="mr-3 flex-shrink-0 text-muted-foreground">•</span>
                    <span className="text-foreground">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

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
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-3">
          <Link href={`/recipes/${recipe.id}/edit`}>
            <Button>Edit Recipe</Button>
          </Link>
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
