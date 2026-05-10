'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-3xl">Create Recipe</CardTitle>
            <CardDescription>Add a new recipe to your collection</CardDescription>
          </div>
          <RecipeImportButton onImport={handleImport} />
        </div>
      </CardHeader>
      <CardContent>
        <RecipeForm
          key={importKey}
          action={action}
          submitLabel="Save Recipe"
          initialRecipe={importedRecipe}
        />
      </CardContent>
    </Card>
  );
}
