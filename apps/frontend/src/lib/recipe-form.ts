import { RecipeInput } from '@/lib/types';

function parseMultilineText(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function buildRecipeInput(formData: FormData): RecipeInput {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const ingredients = parseMultilineText(formData.get('ingredients'));
  const instructions = parseMultilineText(formData.get('instructions'));

  if (!title) {
    throw new Error('Recipe title is required.');
  }

  if (ingredients.length === 0) {
    throw new Error('At least one ingredient is required.');
  }

  if (instructions.length === 0) {
    throw new Error('At least one instruction step is required.');
  }

  return {
    title,
    description,
    ingredients,
    instructions,
  };
}
