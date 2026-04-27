'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { buildRecipeInput } from '@/lib/recipe-form';
import {
  createRecipeForUser,
  deleteRecipeForUser,
  getCurrentUser,
  updateRecipeForUser,
  uploadRecipeImage,
} from '@/lib/recipes';

async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

export async function createRecipeAction(formData: FormData) {
  const user = await requireCurrentUser();
  const input = buildRecipeInput(formData);

  const recipe = await createRecipeForUser(user.id, input);

  const image = formData.get('image');
  if (image instanceof File && image.size > 0) {
    const imagePath = await uploadRecipeImage(user.id, recipe.id, image);
    await updateRecipeForUser(recipe.id, user.id, { image_path: imagePath });
  }

  revalidatePath('/recipes');
  redirect(`/recipes/${recipe.id}`);
}

export async function updateRecipeAction(recipeId: string, formData: FormData) {
  const user = await requireCurrentUser();
  const input = buildRecipeInput(formData);

  const image = formData.get('image');
  if (image instanceof File && image.size > 0) {
    input.image_path = await uploadRecipeImage(user.id, recipeId, image);
  }

  await updateRecipeForUser(recipeId, user.id, input);

  revalidatePath('/recipes');
  revalidatePath(`/recipes/${recipeId}`);
  redirect(`/recipes/${recipeId}`);
}

export async function deleteRecipeAction(recipeId: string) {
  const user = await requireCurrentUser();

  await deleteRecipeForUser(recipeId, user.id);

  revalidatePath('/recipes');
  redirect('/recipes');
}
