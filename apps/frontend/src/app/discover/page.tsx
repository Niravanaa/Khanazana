import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { listPublicRecipes, getRecipeImageUrl } from '@/lib/recipes';

export const dynamic = 'force-dynamic';

interface DiscoverPageProps {
  searchParams: { q?: string; tag?: string };
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const recipes = await listPublicRecipes({ query: searchParams.q, tag: searchParams.tag });

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Discover Recipes</h1>
          <p className="mt-2 text-muted-foreground">Browse recipes shared by the community</p>
        </div>

        <form className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search recipes…"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            name="tag"
            defaultValue={searchParams.tag}
            placeholder="Filter by tag…"
            className="w-full sm:w-40 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Search
          </button>
          {(searchParams.q || searchParams.tag) && (
            <Link
              href="/discover"
              className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-accent text-center"
            >
              Clear
            </Link>
          )}
        </form>

        {recipes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                {searchParams.q || searchParams.tag
                  ? 'No recipes match your search.'
                  : 'No public recipes yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {recipes.map((recipe) => {
              const imageUrl = getRecipeImageUrl(recipe.image_path);
              return (
                <Link key={recipe.id} href={`/recipes/public/${recipe.id}`}>
                  <Card className="h-full overflow-hidden transition-all hover:shadow-lg">
                    {imageUrl ? (
                      <div className="relative h-36 w-full bg-muted sm:h-48">
                        <Image
                          src={imageUrl}
                          alt={recipe.title}
                          fill
                          className="object-cover"
                          loading="lazy"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="flex h-36 w-full items-center justify-center bg-secondary sm:h-48">
                        <span className="text-3xl font-semibold tracking-wide text-secondary-foreground">
                          {recipe.title
                            .split(' ')
                            .filter(Boolean)
                            .map((w) => w[0].toUpperCase())
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
