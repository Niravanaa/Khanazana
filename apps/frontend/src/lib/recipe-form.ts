import { RecipeInput } from '@/lib/types';

function parseCommaSeparated(value: FormDataEntryValue | null): string[] {
  if (typeof value !== 'string') return [];
  return value
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function formatIngredient(qty: string, name: string, note: string): string {
  const parts = [qty.trim(), name.trim()].filter(Boolean).join(' ');
  const notePart = note.trim() ? ` (${note.trim()})` : '';
  return parts + notePart;
}

export function buildRecipeInput(formData: FormData): RecipeInput {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const tags = parseCommaSeparated(formData.get('tags'));
  const cookTimeRaw = String(formData.get('cook_time') ?? '').trim();
  const cook_time = cookTimeRaw ? parseInt(cookTimeRaw, 10) || null : null;

  // Structured ingredients
  const qtys = formData.getAll('ingredient_qty') as string[];
  const names = formData.getAll('ingredient_name') as string[];
  const notes = formData.getAll('ingredient_note') as string[];

  const ingredients = names
    .map((name, i) => formatIngredient(qtys[i] ?? '', name, notes[i] ?? ''))
    .filter(Boolean);

  // Instruction steps
  const instructions = (formData.getAll('instruction_step') as string[])
    .map((s) => s.trim())
    .filter(Boolean);

  if (!title) throw new Error('Recipe title is required.');
  if (ingredients.length === 0) throw new Error('At least one ingredient is required.');
  if (instructions.length === 0) throw new Error('At least one instruction step is required.');

  return { title, description, ingredients, instructions, tags, cook_time };
}
