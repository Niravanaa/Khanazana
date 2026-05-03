import { prisma } from '@/lib/prisma';

export interface CommentRecord {
  id: string;
  user_id: string;
  body: string;
  created_at: Date;
}

export async function getLikeCount(recipeId: string): Promise<number> {
  return prisma.recipeLike.count({ where: { recipe_id: recipeId } });
}

export async function getUserHasLiked(recipeId: string, userId: string): Promise<boolean> {
  const like = await prisma.recipeLike.findUnique({
    where: { user_id_recipe_id: { user_id: userId, recipe_id: recipeId } },
  });
  return !!like;
}

export async function toggleLike(recipeId: string, userId: string): Promise<void> {
  const existing = await prisma.recipeLike.findUnique({
    where: { user_id_recipe_id: { user_id: userId, recipe_id: recipeId } },
  });
  if (existing) {
    await prisma.recipeLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.recipeLike.create({ data: { user_id: userId, recipe_id: recipeId } });
  }
}

export async function getComments(recipeId: string): Promise<CommentRecord[]> {
  const comments = await prisma.recipeComment.findMany({
    where: { recipe_id: recipeId },
    orderBy: { created_at: 'asc' },
  });
  return comments.map((c) => ({
    id: c.id,
    user_id: c.user_id,
    body: c.body,
    created_at: c.created_at,
  }));
}

export async function addComment(
  recipeId: string,
  userId: string,
  body: string,
): Promise<CommentRecord> {
  const comment = await prisma.recipeComment.create({
    data: { recipe_id: recipeId, user_id: userId, body: body.trim() },
  });
  return {
    id: comment.id,
    user_id: comment.user_id,
    body: comment.body,
    created_at: comment.created_at,
  };
}

export async function deleteComment(
  commentId: string,
  requestingUserId: string,
  recipeOwnerId: string,
): Promise<void> {
  const comment = await prisma.recipeComment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error('Comment not found');
  if (comment.user_id !== requestingUserId && requestingUserId !== recipeOwnerId) {
    throw new Error('Not authorised');
  }
  await prisma.recipeComment.delete({ where: { id: commentId } });
}
