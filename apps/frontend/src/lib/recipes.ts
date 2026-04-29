import { createSupabaseServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import type { RecipeInput, RecipeRecord, RecipeSearchParams } from '@/lib/types';

type RecipeRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  ingredients: unknown;
  instructions: unknown;
  image_path: string | null;
  tags: string[];
  cook_time: number | null;
  created_at: Date;
  updated_at: Date;
};

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function toRecipeRecord(recipe: RecipeRow): RecipeRecord {
  return {
    ...recipe,
    ingredients: toStringArray(recipe.ingredients),
    instructions: toStringArray(recipe.instructions),
    tags: recipe.tags ?? [],
    cook_time: recipe.cook_time ?? null,
  };
}

export async function getCurrentUser() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) return null;

  return data.user;
}

export async function listRecipesForUser(
  userId: string,
  search?: RecipeSearchParams,
): Promise<RecipeRecord[]> {
  const where: Record<string, unknown> = { user_id: userId };

  if (search?.query) {
    const q = search.query;
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (search?.tag) {
    where.tags = { has: search.tag.toLowerCase() };
  }

  if (search?.maxCookTime) {
    where.cook_time = { lte: search.maxCookTime, not: null };
  }

  const recipes = await prisma.recipe.findMany({
    where,
    orderBy: { created_at: 'desc' },
  });

  return recipes.map(toRecipeRecord);
}

export async function getRecipeByIdForUser(
  recipeId: string,
  userId: string,
): Promise<RecipeRecord | null> {
  const recipe = await prisma.recipe.findFirst({
    where: { id: recipeId, user_id: userId },
  });

  return recipe ? toRecipeRecord(recipe) : null;
}

export async function createRecipeForUser(
  userId: string,
  input: RecipeInput,
): Promise<RecipeRecord> {
  const recipe = await prisma.recipe.create({
    data: {
      user_id: userId,
      title: input.title,
      description: input.description,
      ingredients: input.ingredients,
      instructions: input.instructions,
      image_path: input.image_path ?? null,
      tags: input.tags ?? [],
      cook_time: input.cook_time ?? null,
    },
  });

  return toRecipeRecord(recipe);
}

export async function updateRecipeForUser(
  recipeId: string,
  userId: string,
  input: Partial<RecipeInput>,
): Promise<RecipeRecord | null> {
  const existing = await prisma.recipe.findFirst({ where: { id: recipeId, user_id: userId } });
  if (!existing) return null;

  const recipe = await prisma.recipe.update({
    where: { id: recipeId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.ingredients !== undefined && { ingredients: input.ingredients }),
      ...(input.instructions !== undefined && { instructions: input.instructions }),
      ...(input.image_path !== undefined && { image_path: input.image_path }),
      ...(input.tags !== undefined && { tags: input.tags }),
      ...(input.cook_time !== undefined && { cook_time: input.cook_time }),
    },
  });

  return toRecipeRecord(recipe);
}

export async function deleteRecipeForUser(recipeId: string, userId: string): Promise<void> {
  await prisma.recipe.deleteMany({ where: { id: recipeId, user_id: userId } });
}

export async function uploadRecipeImage(userId: string, recipeId: string, image: File) {
  const supabase = createSupabaseServerClient();
  const extension = image.name.split('.').pop() || 'jpg';
  const path = `${userId}/${recipeId}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage.from('recipe-images').upload(path, image, {
    contentType: image.type,
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

export function getRecipeImageUrl(imagePath: string | null) {
  if (!imagePath) return null;
  return `/api/images?path=${encodeURIComponent(imagePath)}`;
}
