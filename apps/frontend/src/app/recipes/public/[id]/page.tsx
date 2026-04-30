import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicRecipeById, getRecipeImageUrl } from '@/lib/recipes';

export default async function PublicRecipePage({ params }: { params: { id: string } }) {
  const recipe = await getPublicRecipeById(params.id);
  if (!recipe) {
    notFound();
  }

  const imageUrl = getRecipeImageUrl(recipe.image_path);

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Khanazana
          </Link>
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Public recipe
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm">
          {imageUrl && (
            <div className="relative h-64 w-full overflow-hidden rounded-t-xl bg-muted sm:h-80">
              <Image
                src={imageUrl}
                alt={recipe.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 672px"
                priority
              />
            </div>
          )}

          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-foreground">{recipe.title}</h1>
            {recipe.description && (
              <p className="mt-2 text-muted-foreground">{recipe.description}</p>
            )}

            {(recipe.cook_time || recipe.tags.length > 0) && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
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

            <div className="mt-8 space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Ingredients</h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient} className="flex items-start">
                    <span className="mr-3 shrink-0 text-muted-foreground">•</span>
                    <span className="text-foreground">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Instructions</h2>
              <ol className="space-y-3">
                {recipe.instructions.map((step, index) => (
                  <li key={step} className="flex items-start">
                    <span className="mr-3 w-6 shrink-0 font-semibold text-muted-foreground">
                      {index + 1}.
                    </span>
                    <span className="text-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
