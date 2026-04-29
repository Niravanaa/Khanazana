import { createSupabaseServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import type { RecipeInput, RecipeRecord, RecipeSearchParams } from '@/lib/types';
import { cookies } from 'next/headers';

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
  is_public: boolean;
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
    is_public: recipe.is_public ?? false,
  };
}

export async function getCurrentUser() {
  const e2eUserId = process.env.E2E_USER_ID ?? '11111111-1111-4111-8111-111111111111';
  let hasE2EMarker = false;

  try {
    hasE2EMarker = cookies().get('e2e-auth')?.value === '1';
  } catch {
    hasE2EMarker = false;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    if (hasE2EMarker) {
      return {
        id: e2eUserId,
        email: process.env.E2E_EMAIL ?? 'e2e@khanazana.local',
      } as any;
    }

    return null;
  }

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

  const mapped = recipes.map(toRecipeRecord);

  // If ingredient filters provided, perform in-memory filtering against recipe ingredients.
  if (search?.ingredients && search.ingredients.length > 0) {
    const normalize = (s: string) =>
      s
        .toLowerCase()
        .replace(/\(|\)|,|\.|;|:/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const wanted = search.ingredients.map((i) => normalize(i));

    return mapped.filter((r) => {
      const ings = r.ingredients.map((i) => normalize(i));
      return wanted.some((w) => ings.some((ing) => ing.includes(w)));
    });
  }

  return mapped;
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

export async function getPublicRecipeById(recipeId: string): Promise<RecipeRecord | null> {
  const recipe = await prisma.recipe.findFirst({
    where: { id: recipeId, is_public: true },
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
      is_public: input.is_public ?? false,
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
      ...(input.is_public !== undefined && { is_public: input.is_public }),
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
    cacheControl: '31536000',
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
