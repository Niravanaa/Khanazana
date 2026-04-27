import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser, getRecipeImageUrl, listRecipesForUser } from '@/lib/recipes';

export default async function RecipesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const recipes = await listRecipesForUser(user.id);

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Recipes</h1>
            <p className="mt-2 text-slate-600">Manage and organize your recipes</p>
          </div>
          <div className="flex gap-3">
            <Link href="/recipes/new">
              <Button>New Recipe</Button>
            </Link>
            <Link href="/auth/logout">
              <Button variant="outline">Sign Out</Button>
            </Link>
          </div>
        </div>

        {recipes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-slate-600">
                No recipes yet. Create your first recipe to get started.
              </p>
              <Link href="/recipes/new" className="mt-4">
                <Button>Create Recipe</Button>
              </Link>
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
                      <div className="relative h-48 w-full bg-slate-200">
                        <Image
                          src={imageUrl}
                          alt={recipe.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="h-48 w-full bg-gradient-to-br from-slate-200 to-slate-300" />
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{recipe.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {recipe.description || 'No description'}
                      </CardDescription>
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
