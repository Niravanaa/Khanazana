import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicRecipeById, getRecipeImageUrl, getCurrentUser } from '@/lib/recipes';
// Simple UUID validation to avoid passing non-UUIDs (eg. "new") into Prisma queries
function isValidUuid(id: string) {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    id,
  );
}
import { getLikeCount, getUserHasLiked, getComments } from '@/lib/social';
import { LikeButton } from '@/components/like-button';
import { CommentSection } from '@/components/comment-section';
import { RecipeNutrition } from '@/components/recipe-nutrition';
import { ScalableIngredients } from '@/components/scalable-ingredients';

export default async function PublicRecipePage({ params }: { params: { id: string } }) {
  if (!isValidUuid(params.id)) {
    notFound();
  }

  const [recipe, user] = await Promise.all([getPublicRecipeById(params.id), getCurrentUser()]);

  if (!recipe) notFound();

  const [likeCount, userHasLiked, comments] = await Promise.all([
    getLikeCount(recipe.id),
    user ? getUserHasLiked(recipe.id, user.id) : Promise.resolve(false),
    getComments(recipe.id),
  ]);

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
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-foreground">{recipe.title}</h1>
              <LikeButton
                recipeId={recipe.id}
                initialCount={likeCount}
                initialLiked={userHasLiked}
                isLoggedIn={!!user}
              />
            </div>

            {recipe.description && (
              <p className="mt-2 text-muted-foreground">{recipe.description}</p>
            )}

            {(recipe.cook_time || recipe.servings || recipe.tags.length > 0) && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
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

            <div className="mt-8">
              <ScalableIngredients
                ingredients={recipe.ingredients}
                defaultServings={recipe.servings ?? 1}
              />
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

            {recipe.ingredients_nutrition && recipe.ingredients_nutrition.length > 0 && (
              <div className="mt-8">
                <RecipeNutrition nutrition={recipe.ingredients_nutrition} />
              </div>
            )}

            <div className="mt-10 border-t border-border pt-8">
              <CommentSection
                recipeId={recipe.id}
                initialComments={comments}
                isLoggedIn={!!user}
                currentUserId={user?.id ?? null}
                recipeOwnerId={recipe.user_id}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
