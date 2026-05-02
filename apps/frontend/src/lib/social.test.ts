import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCount = vi.hoisted(() => vi.fn());
const mockLikeFindUnique = vi.hoisted(() => vi.fn());
const mockLikeDelete = vi.hoisted(() => vi.fn());
const mockLikeCreate = vi.hoisted(() => vi.fn());
const mockCommentFindMany = vi.hoisted(() => vi.fn());
const mockCommentCreate = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({
  prisma: {
    recipeLike: {
      count: mockCount,
      findUnique: mockLikeFindUnique,
      delete: mockLikeDelete,
      create: mockLikeCreate,
    },
    recipeComment: {
      findMany: mockCommentFindMany,
      create: mockCommentCreate,
    },
  },
}));

import { getLikeCount, getUserHasLiked, toggleLike, getComments, addComment } from './social';

const RECIPE_ID = 'recipe-abc';
const USER_ID = 'user-xyz';

beforeEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// getLikeCount
// ---------------------------------------------------------------------------
describe('getLikeCount', () => {
  it('returns the count from prisma', async () => {
    mockCount.mockResolvedValue(5);

    const result = await getLikeCount(RECIPE_ID);

    expect(mockCount).toHaveBeenCalledWith({ where: { recipe_id: RECIPE_ID } });
    expect(result).toBe(5);
  });

  it('returns 0 when no likes', async () => {
    mockCount.mockResolvedValue(0);
    expect(await getLikeCount(RECIPE_ID)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getUserHasLiked
// ---------------------------------------------------------------------------
describe('getUserHasLiked', () => {
  it('returns true when a like record exists', async () => {
    mockLikeFindUnique.mockResolvedValue({ id: 'like-1', user_id: USER_ID, recipe_id: RECIPE_ID });

    const result = await getUserHasLiked(RECIPE_ID, USER_ID);

    expect(mockLikeFindUnique).toHaveBeenCalledWith({
      where: { user_id_recipe_id: { user_id: USER_ID, recipe_id: RECIPE_ID } },
    });
    expect(result).toBe(true);
  });

  it('returns false when no like record exists', async () => {
    mockLikeFindUnique.mockResolvedValue(null);

    expect(await getUserHasLiked(RECIPE_ID, USER_ID)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// toggleLike
// ---------------------------------------------------------------------------
describe('toggleLike', () => {
  it('deletes the like when one already exists (unlike)', async () => {
    const existing = { id: 'like-1', user_id: USER_ID, recipe_id: RECIPE_ID };
    mockLikeFindUnique.mockResolvedValue(existing);
    mockLikeDelete.mockResolvedValue(existing);

    await toggleLike(RECIPE_ID, USER_ID);

    expect(mockLikeDelete).toHaveBeenCalledWith({ where: { id: 'like-1' } });
    expect(mockLikeCreate).not.toHaveBeenCalled();
  });

  it('creates a new like when none exists', async () => {
    mockLikeFindUnique.mockResolvedValue(null);
    mockLikeCreate.mockResolvedValue({ id: 'like-new', user_id: USER_ID, recipe_id: RECIPE_ID });

    await toggleLike(RECIPE_ID, USER_ID);

    expect(mockLikeCreate).toHaveBeenCalledWith({
      data: { user_id: USER_ID, recipe_id: RECIPE_ID },
    });
    expect(mockLikeDelete).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getComments
// ---------------------------------------------------------------------------
describe('getComments', () => {
  it('returns mapped comments ordered by created_at asc', async () => {
    const now = new Date();
    mockCommentFindMany.mockResolvedValue([
      { id: 'c1', user_id: USER_ID, body: 'Great recipe!', created_at: now },
    ]);

    const result = await getComments(RECIPE_ID);

    expect(mockCommentFindMany).toHaveBeenCalledWith({
      where: { recipe_id: RECIPE_ID },
      orderBy: { created_at: 'asc' },
    });
    expect(result).toEqual([
      { id: 'c1', user_id: USER_ID, body: 'Great recipe!', created_at: now },
    ]);
  });

  it('returns empty array when no comments exist', async () => {
    mockCommentFindMany.mockResolvedValue([]);
    expect(await getComments(RECIPE_ID)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// addComment
// ---------------------------------------------------------------------------
describe('addComment', () => {
  it('creates and returns the new comment with trimmed body', async () => {
    const now = new Date();
    mockCommentCreate.mockResolvedValue({
      id: 'c-new',
      user_id: USER_ID,
      body: 'Tasty dish',
      created_at: now,
    });

    const result = await addComment(RECIPE_ID, USER_ID, '  Tasty dish  ');

    expect(mockCommentCreate).toHaveBeenCalledWith({
      data: { recipe_id: RECIPE_ID, user_id: USER_ID, body: 'Tasty dish' },
    });
    expect(result).toEqual({ id: 'c-new', user_id: USER_ID, body: 'Tasty dish', created_at: now });
  });

  it('returns a CommentRecord with all required fields', async () => {
    const now = new Date();
    mockCommentCreate.mockResolvedValue({
      id: 'c-2',
      user_id: USER_ID,
      body: 'Hello',
      created_at: now,
    });

    const result = await addComment(RECIPE_ID, USER_ID, 'Hello');

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('user_id', USER_ID);
    expect(result).toHaveProperty('body', 'Hello');
    expect(result).toHaveProperty('created_at');
  });
});
