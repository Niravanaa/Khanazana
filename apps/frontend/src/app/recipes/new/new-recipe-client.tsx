'use client';

import { useState } from 'react';
import { RecipeForm } from '@/components/recipe-form';
import { RecipeImportButton } from '@/components/recipe-import-button';
import type { RecipeInput } from '@/lib/types';

interface NewRecipeClientProps {
  action: (formData: FormData) => Promise<void>;
}

export function NewRecipeClient({ action }: NewRecipeClientProps) {
  const [importedRecipe, setImportedRecipe] = useState<RecipeInput | undefined>(undefined);
  const [importKey, setImportKey] = useState(0);

  function handleImport(recipe: RecipeInput) {
    setImportedRecipe(recipe);
    setImportKey((k) => k + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <RecipeImportButton onImport={handleImport} />
      </div>
      <RecipeForm
        key={importKey}
        action={action}
        submitLabel="Save Recipe"
        initialRecipe={importedRecipe}
      />
    </div>
  );
}
