import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser, getRecipeImageUrl, listRecipesForUser } from '@/lib/recipes';
import { RecipeFilters } from '@/components/recipe-filters';

interface RecipesPageProps {
  searchParams: {
    q?: string;
    tag?: string;
    maxCookTime?: string;
  };
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const maxCookTime = searchParams.maxCookTime ? parseInt(searchParams.maxCookTime, 10) : undefined;
  const recipes = await listRecipesForUser(user.id, {
    query: searchParams.q,
    tag: searchParams.tag,
    maxCookTime: isNaN(maxCookTime!) ? undefined : maxCookTime,
  });

  const hasFilters = !!(searchParams.q || searchParams.tag || searchParams.maxCookTime);

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Recipes</h1>
            <p className="mt-2 text-muted-foreground">Manage and organize your recipes</p>
          </div>
          <Link href="/recipes/new">
            <Button>New Recipe</Button>
          </Link>
        </div>

        <RecipeFilters
          initialQuery={searchParams.q}
          initialTag={searchParams.tag}
          initialMaxCookTime={searchParams.maxCookTime}
        />

        {recipes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              {hasFilters ? (
                <>
                  <p className="text-muted-foreground">No recipes match your search.</p>
                  <Link href="/recipes" className="mt-4">
                    <Button variant="outline">Clear filters</Button>
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">
                    No recipes yet. Create your first recipe to get started.
                  </p>
                  <Link href="/recipes/new" className="mt-4">
                    <Button>Create Recipe</Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => {
              const imageUrl = getRecipeImageUrl(recipe.image_path);

              return (
                <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                  <Card className="h-full overflow-hidden transition-all hover:shadow-lg">
                    {imageUrl ? (
                      <div className="relative h-48 w-full bg-muted">
                        <Image
                          src={imageUrl}
                          alt={recipe.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center bg-secondary">
                        <span className="text-3xl font-semibold tracking-wide text-secondary-foreground">
                          {recipe.title
                            .split(' ')
                            .filter(Boolean)
                            .map((w: string) => w[0].toUpperCase())
                            .slice(0, 3)
                            .join('')}
                        </span>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{recipe.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {recipe.description || 'No description'}
                      </CardDescription>
                      {(recipe.tags.length > 0 || recipe.cook_time) && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {recipe.cook_time && (
                            <span className="text-xs text-muted-foreground">
                              ⏱ {recipe.cook_time} min
                            </span>
                          )}
                          {recipe.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
