import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Hoist mock fns so they're available inside vi.mock() factory closures
const mockGetUser = vi.hoisted(() => vi.fn());
const mockUpload = vi.hoisted(() => vi.fn());
const mockFindMany = vi.hoisted(() => vi.fn());
const mockFindFirst = vi.hoisted(() => vi.fn());
const mockCreate = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());
const mockDeleteMany = vi.hoisted(() => vi.fn());
const mockEnrichIngredients = vi.hoisted(() => vi.fn());
const mockGetFdcApiKey = vi.hoisted(() => vi.fn());

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: () => ({
    auth: { getUser: mockGetUser },
    storage: { from: () => ({ upload: mockUpload }) },
  }),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    recipe: {
      findMany: mockFindMany,
      findFirst: mockFindFirst,
      create: mockCreate,
      update: mockUpdate,
      deleteMany: mockDeleteMany,
    },
  },
}));

vi.mock('@/lib/fdc', () => ({ enrichIngredients: mockEnrichIngredients }));
vi.mock('@/lib/env', () => ({ getFdcApiKey: mockGetFdcApiKey }));

import {
  createRecipeForUser,
  deleteRecipeForUser,
  getCurrentUser,
  getRecipeByIdForUser,
  getRecipeImageUrl,
  listPublicRecipes,
  listRecipesForUser,
  updateRecipeForUser,
  uploadRecipeImage,
} from './recipes';

const USER_ID = 'user-abc';
const RECIPE_ID = 'recipe-xyz';
const MOCK_RECIPE = {
  id: RECIPE_ID,
  user_id: USER_ID,
  title: 'Butter Chicken',
  description: 'Creamy curry',
  ingredients: ['chicken', 'cream'],
  instructions: ['cook'],
  image_path: null,
  tags: [],
  cook_time: null,
  is_public: false,
  servings: null,
  meal_types: [],
  ingredients_nutrition: null,
  created_at: new Date(),
  updated_at: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  // Default: no FDC API key → enrichment is skipped (existing tests unaffected)
  mockGetFdcApiKey.mockReturnValue(undefined);
});

// ---------------------------------------------------------------------------
// getCurrentUser
// ---------------------------------------------------------------------------
describe('getCurrentUser', () => {
  it('returns the user when authenticated', async () => {
    const user = { id: USER_ID, email: 'u@test.com' };
    mockGetUser.mockResolvedValue({ data: { user }, error: null });

    expect(await getCurrentUser()).toEqual(user);
  });

  it('returns null when auth returns an error', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth session missing!' },
    });

    expect(await getCurrentUser()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// listRecipesForUser
// ---------------------------------------------------------------------------
describe('listRecipesForUser', () => {
  it('returns recipes ordered by created_at desc', async () => {
    mockFindMany.mockResolvedValue([MOCK_RECIPE]);

    const result = await listRecipesForUser(USER_ID);

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { user_id: USER_ID },
      orderBy: { created_at: 'desc' },
    });
    expect(result).toEqual([MOCK_RECIPE]);
  });

  it('applies query search filter', async () => {
    mockFindMany.mockResolvedValue([]);

    await listRecipesForUser(USER_ID, { query: 'chicken' });

    const call = mockFindMany.mock.calls[0][0] as { where: Record<string, unknown> };
    expect(call.where).toHaveProperty('OR');
  });

  it('applies tag filter lowercased', async () => {
    mockFindMany.mockResolvedValue([]);

    await listRecipesForUser(USER_ID, { tag: 'Indian' });

    const call = mockFindMany.mock.calls[0][0] as { where: Record<string, unknown> };
    expect(call.where).toHaveProperty('tags', { has: 'indian' });
  });

  it('applies maxCookTime filter', async () => {
    mockFindMany.mockResolvedValue([]);

    await listRecipesForUser(USER_ID, { maxCookTime: 30 });

    const call = mockFindMany.mock.calls[0][0] as { where: Record<string, unknown> };
    expect(call.where).toHaveProperty('cook_time', { lte: 30, not: null });
  });
});

// ---------------------------------------------------------------------------
// getRecipeByIdForUser
// ---------------------------------------------------------------------------
describe('getRecipeByIdForUser', () => {
  it('returns the recipe when found', async () => {
    mockFindFirst.mockResolvedValue(MOCK_RECIPE);

    const result = await getRecipeByIdForUser(RECIPE_ID, USER_ID);

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { id: RECIPE_ID, user_id: USER_ID },
    });
    expect(result).toEqual(MOCK_RECIPE);
  });

  it('returns null when the recipe is not found', async () => {
    mockFindFirst.mockResolvedValue(null);

    expect(await getRecipeByIdForUser(RECIPE_ID, USER_ID)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// createRecipeForUser
// ---------------------------------------------------------------------------
describe('createRecipeForUser', () => {
  it('creates and returns the new recipe', async () => {
    mockCreate.mockResolvedValue(MOCK_RECIPE);

    const input = {
      title: 'Butter Chicken',
      description: 'Creamy curry',
      ingredients: ['chicken', 'cream'],
      instructions: ['cook'],
    };
    const result = await createRecipeForUser(USER_ID, input);

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        user_id: USER_ID,
        title: input.title,
        description: input.description,
        ingredients: input.ingredients,
        instructions: input.instructions,
        image_path: null,
        tags: [],
        cook_time: null,
        is_public: false,
        servings: null,
        meal_types: [],
      },
    });
    expect(result).toEqual(MOCK_RECIPE);
  });

  it('stores the image_path when provided', async () => {
    mockCreate.mockResolvedValue(MOCK_RECIPE);

    await createRecipeForUser(USER_ID, {
      title: 'Test',
      description: '',
      ingredients: ['a'],
      instructions: ['b'],
      image_path: 'user/recipe.jpg',
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ image_path: 'user/recipe.jpg' }),
      }),
    );
  });

  it('includes tags and cook_time when provided', async () => {
    mockCreate.mockResolvedValue(MOCK_RECIPE);

    await createRecipeForUser(USER_ID, {
      title: 'Test',
      description: '',
      ingredients: ['a'],
      instructions: ['b'],
      tags: ['vegetarian'],
      cook_time: 30,
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tags: ['vegetarian'], cook_time: 30 }),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// updateRecipeForUser
// ---------------------------------------------------------------------------
describe('updateRecipeForUser', () => {
  it('returns null when the recipe does not belong to the user', async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await updateRecipeForUser(RECIPE_ID, USER_ID, { title: 'New' });

    expect(result).toBeNull();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('updates only the supplied fields', async () => {
    mockFindFirst.mockResolvedValue(MOCK_RECIPE);
    const updated = { ...MOCK_RECIPE, title: 'Updated' };
    mockUpdate.mockResolvedValue(updated);

    const result = await updateRecipeForUser(RECIPE_ID, USER_ID, { title: 'Updated' });

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: RECIPE_ID },
      data: { title: 'Updated' },
    });
    expect(result).toEqual(updated);
  });

  it('omits undefined fields from the update payload', async () => {
    mockFindFirst.mockResolvedValue(MOCK_RECIPE);
    mockUpdate.mockResolvedValue(MOCK_RECIPE);

    await updateRecipeForUser(RECIPE_ID, USER_ID, { description: 'New desc' });

    const callArg = mockUpdate.mock.calls[0][0] as { data: Record<string, unknown> };
    expect(callArg.data).not.toHaveProperty('title');
    expect(callArg.data).toHaveProperty('description', 'New desc');
  });
});

// ---------------------------------------------------------------------------
// deleteRecipeForUser
// ---------------------------------------------------------------------------
describe('deleteRecipeForUser', () => {
  it('deletes with the correct where clause', async () => {
    mockDeleteMany.mockResolvedValue({ count: 1 });

    await deleteRecipeForUser(RECIPE_ID, USER_ID);

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { id: RECIPE_ID, user_id: USER_ID },
    });
  });
});

// ---------------------------------------------------------------------------
// uploadRecipeImage
// ---------------------------------------------------------------------------
describe('uploadRecipeImage', () => {
  it('uploads and returns a path matching user/recipeId-timestamp.ext', async () => {
    mockUpload.mockResolvedValue({ error: null });

    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
    const path = await uploadRecipeImage(USER_ID, RECIPE_ID, file);

    expect(path).toMatch(new RegExp(`^${USER_ID}/${RECIPE_ID}-\\d+\\.jpg$`));
  });

  it('throws when the storage upload fails', async () => {
    mockUpload.mockResolvedValue({ error: { message: 'Upload failed' } });

    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    await expect(uploadRecipeImage(USER_ID, RECIPE_ID, file)).rejects.toThrow('Upload failed');
  });
});

// ---------------------------------------------------------------------------
// getRecipeImageUrl
// ---------------------------------------------------------------------------
describe('getRecipeImageUrl', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('returns null for a null imagePath', () => {
    expect(getRecipeImageUrl(null)).toBeNull();
  });

  it('returns a proxy URL for a given path', () => {
    expect(getRecipeImageUrl('user/recipe.jpg')).toBe('/api/images?path=user%2Frecipe.jpg');
  });

  it('encodes special characters in the path', () => {
    expect(getRecipeImageUrl('user/my recipe.jpg')).toBe('/api/images?path=user%2Fmy%20recipe.jpg');
  });
});

// ---------------------------------------------------------------------------
// Ingredient enrichment (runEnrichment via createRecipeForUser / updateRecipeForUser)
// ---------------------------------------------------------------------------
describe('ingredient enrichment', () => {
  const INPUT = {
    title: 'Test',
    description: '',
    ingredients: ['chicken breast', '2 cups milk'],
    instructions: ['cook'],
  };

  const NUTRITION = [
    {
      text: 'chicken breast',
      fdcId: 1,
      calories: 165,
      protein_g: 31,
      carbs_g: 0,
      fat_g: 4,
      category: 'Poultry Products',
    },
    {
      text: '2 cups milk',
      fdcId: 2,
      calories: 61,
      protein_g: 3,
      carbs_g: 5,
      fat_g: 3,
      category: 'Dairy and Egg Products',
    },
  ];

  it('calls enrichIngredients and stores results when API key is present', async () => {
    mockGetFdcApiKey.mockReturnValue('my-key');
    mockCreate.mockResolvedValue(MOCK_RECIPE);
    mockEnrichIngredients.mockResolvedValue(NUTRITION);
    mockUpdate.mockResolvedValue({ ...MOCK_RECIPE, ingredients_nutrition: NUTRITION });

    await createRecipeForUser(USER_ID, INPUT);

    expect(mockEnrichIngredients).toHaveBeenCalledWith(INPUT.ingredients, 'my-key');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: RECIPE_ID },
        data: { ingredients_nutrition: NUTRITION },
      }),
    );
  });

  it('skips enrichment when no API key is configured', async () => {
    mockGetFdcApiKey.mockReturnValue(undefined);
    mockCreate.mockResolvedValue(MOCK_RECIPE);

    await createRecipeForUser(USER_ID, INPUT);

    expect(mockEnrichIngredients).not.toHaveBeenCalled();
  });

  it('does not throw if enrichment fails', async () => {
    mockGetFdcApiKey.mockReturnValue('my-key');
    mockCreate.mockResolvedValue(MOCK_RECIPE);
    mockEnrichIngredients.mockRejectedValue(new Error('FDC unavailable'));

    await expect(createRecipeForUser(USER_ID, INPUT)).resolves.toBeDefined();
  });

  it('re-enriches on update when ingredients change', async () => {
    mockGetFdcApiKey.mockReturnValue('my-key');
    mockFindFirst.mockResolvedValue(MOCK_RECIPE);
    mockUpdate.mockResolvedValue(MOCK_RECIPE);
    mockEnrichIngredients.mockResolvedValue(NUTRITION);

    await updateRecipeForUser(RECIPE_ID, USER_ID, { ingredients: ['garlic'] });

    expect(mockEnrichIngredients).toHaveBeenCalledWith(['garlic'], 'my-key');
  });

  it('skips enrichment on update when ingredients are not in the payload', async () => {
    mockGetFdcApiKey.mockReturnValue('my-key');
    mockFindFirst.mockResolvedValue(MOCK_RECIPE);
    mockUpdate.mockResolvedValue(MOCK_RECIPE);

    await updateRecipeForUser(RECIPE_ID, USER_ID, { title: 'New Title' });

    expect(mockEnrichIngredients).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// listPublicRecipes
// ---------------------------------------------------------------------------
describe('listPublicRecipes', () => {
  const PUBLIC_RECIPE = { ...MOCK_RECIPE, is_public: true };

  it('queries only public recipes ordered by created_at desc', async () => {
    mockFindMany.mockResolvedValue([PUBLIC_RECIPE]);

    const result = await listPublicRecipes();

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { is_public: true },
      orderBy: { created_at: 'desc' },
    });
    expect(result).toHaveLength(1);
    expect(result[0].is_public).toBe(true);
  });

  it('applies title/description text search when query provided', async () => {
    mockFindMany.mockResolvedValue([]);

    await listPublicRecipes({ query: 'chicken' });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          is_public: true,
          OR: [
            { title: { contains: 'chicken', mode: 'insensitive' } },
            { description: { contains: 'chicken', mode: 'insensitive' } },
          ],
        }),
      }),
    );
  });

  it('applies tag filter when tag provided', async () => {
    mockFindMany.mockResolvedValue([]);

    await listPublicRecipes({ tag: 'Vegan' });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          is_public: true,
          tags: { has: 'vegan' },
        }),
      }),
    );
  });

  it('returns empty array when no public recipes exist', async () => {
    mockFindMany.mockResolvedValue([]);
    expect(await listPublicRecipes()).toEqual([]);
  });
});
