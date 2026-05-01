'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/recipes';
import { toggleLike, addComment } from '@/lib/social';

async function requireUser(recipeId: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login`);
  return user;
}

export async function toggleLikeAction(recipeId: string) {
  const user = await requireUser(recipeId);
  await toggleLike(recipeId, user.id);
  revalidatePath(`/recipes/public/${recipeId}`);
}

export async function addCommentAction(recipeId: string, formData: FormData) {
  const user = await requireUser(recipeId);
  const body = (formData.get('body') as string | null)?.trim() ?? '';
  if (!body || body.length > 500) return;
  await addComment(recipeId, user.id, body);
  revalidatePath(`/recipes/public/${recipeId}`);
}
