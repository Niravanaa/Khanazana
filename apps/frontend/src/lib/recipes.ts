import { createSupabaseServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { RecipeInput } from '@/lib/types';

export async function getCurrentUser() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) return null;

  return data.user;
}

export async function listRecipesForUser(userId: string) {
  return prisma.recipe.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
  });
}

export async function getRecipeByIdForUser(recipeId: string, userId: string) {
  return prisma.recipe.findFirst({
    where: { id: recipeId, user_id: userId },
  });
}

export async function createRecipeForUser(userId: string, input: RecipeInput) {
  return prisma.recipe.create({
    data: {
      user_id: userId,
      title: input.title,
      description: input.description,
      ingredients: input.ingredients,
      instructions: input.instructions,
      image_path: input.image_path ?? null,
    },
  });
}

export async function updateRecipeForUser(
  recipeId: string,
  userId: string,
  input: Partial<RecipeInput>,
) {
  const existing = await prisma.recipe.findFirst({ where: { id: recipeId, user_id: userId } });
  if (!existing) return null;

  return prisma.recipe.update({
    where: { id: recipeId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.ingredients !== undefined && { ingredients: input.ingredients }),
      ...(input.instructions !== undefined && { instructions: input.instructions }),
      ...(input.image_path !== undefined && { image_path: input.image_path }),
    },
  });
}

export async function deleteRecipeForUser(recipeId: string, userId: string) {
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
  if (!imagePath) {
    return null;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}/storage/v1/object/public/recipe-images/${imagePath}`;
}
