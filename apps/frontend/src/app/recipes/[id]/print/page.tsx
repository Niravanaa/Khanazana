import { notFound, redirect } from 'next/navigation';
import { getCurrentUser, getRecipeByIdForUser } from '@/lib/recipes';
import { PrintButton } from '@/components/print-button';

export const dynamic = 'force-dynamic';

export default async function RecipePrintPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const recipe = await getRecipeByIdForUser(params.id, user.id);
  if (!recipe) notFound();

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white; color: black; }
        }
      `,
        }}
      />

      <div className="no-print mb-6 flex items-center gap-4 border-b border-border bg-background p-4 print:hidden">
        <PrintButton />
        <a
          href={`/recipes/${recipe.id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to recipe
        </a>
      </div>

      <main className="mx-auto max-w-2xl px-8 pb-16 pt-4 text-foreground print:max-w-none print:px-0 print:pt-0">
        <h1 className="mb-1 text-3xl font-bold">{recipe.title}</h1>

        {recipe.description && <p className="mb-4 text-muted-foreground">{recipe.description}</p>}

        <div className="mb-6 flex flex-wrap gap-3 text-sm">
          {recipe.cook_time && <span>⏱ {recipe.cook_time} min</span>}
          {recipe.servings && <span>🍽 {recipe.servings} servings</span>}
          {recipe.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-xs">
              {tag}
            </span>
          ))}
        </div>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">Ingredients</h2>
          <ul className="space-y-1.5">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient} className="flex items-start">
                <span className="mr-3 shrink-0 text-muted-foreground">•</span>
                {ingredient}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">Instructions</h2>
          <ol className="space-y-3">
            {recipe.instructions.map((step, index) => (
              <li key={step} className="flex items-start">
                <span className="mr-3 w-6 shrink-0 font-semibold text-muted-foreground">
                  {index + 1}.
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  );
}
