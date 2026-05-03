import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { normaliseName, lookupIngredient, enrichIngredients } from './fdc';

const API_KEY = 'test-api-key';

// ---------------------------------------------------------------------------
// normaliseName
// ---------------------------------------------------------------------------
describe('normaliseName', () => {
  it('strips parenthetical notes', () => {
    expect(normaliseName('plain flour (sifted)')).toBe('flour');
  });

  it('strips a leading integer quantity', () => {
    expect(normaliseName('2 chicken breast')).toBe('chicken breast');
  });

  it('strips a leading decimal quantity', () => {
    expect(normaliseName('1.5 olive oil')).toBe('olive oil');
  });

  it('strips a leading fraction quantity', () => {
    expect(normaliseName('1/2 lemon')).toBe('lemon');
  });

  it('strips a leading unit word after the number', () => {
    expect(normaliseName('2 cups plain flour')).toBe('flour');
  });

  it('strips descriptor adjectives', () => {
    expect(normaliseName('fresh basil')).toBe('basil');
  });

  it('handles an ingredient with no quantity', () => {
    expect(normaliseName('olive oil')).toBe('olive oil');
  });

  it('lowercases the result', () => {
    expect(normaliseName('Garlic')).toBe('garlic');
  });

  it('returns empty string for blank input', () => {
    expect(normaliseName('  ')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// lookupIngredient
// ---------------------------------------------------------------------------
describe('lookupIngredient', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function fdcResponse(food: object) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ foods: [food] }),
    });
  }

  it('returns mapped nutrition for a matching food', async () => {
    mockFetch.mockReturnValue(
      fdcResponse({
        fdcId: 123,
        foodCategory: 'Poultry Products',
        foodNutrients: [
          { nutrientId: 1008, value: 165 },
          { nutrientId: 1003, value: 31.0 },
          { nutrientId: 1005, value: 0 },
          { nutrientId: 1004, value: 3.6 },
        ],
      }),
    );

    const result = await lookupIngredient('chicken breast', API_KEY);

    expect(result).toEqual({
      text: 'chicken breast',
      fdcId: 123,
      calories: 165,
      protein_g: 31,
      carbs_g: 0,
      fat_g: 4,
      category: 'Poultry Products',
    });
  });

  it('returns null when no foods match', async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({ ok: true, json: () => Promise.resolve({ foods: [] }) }),
    );
    expect(await lookupIngredient('xyzzy', API_KEY)).toBeNull();
  });

  it('returns null on a non-ok HTTP response', async () => {
    mockFetch.mockReturnValue(Promise.resolve({ ok: false }));
    expect(await lookupIngredient('flour', API_KEY)).toBeNull();
  });

  it('returns null on a fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('network error'));
    expect(await lookupIngredient('flour', API_KEY)).toBeNull();
  });

  it('returns null for a blank name', async () => {
    expect(await lookupIngredient('', API_KEY)).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('stores null for nutrients missing from the response', async () => {
    mockFetch.mockReturnValue(
      fdcResponse({ fdcId: 999, foodCategory: 'Vegetables', foodNutrients: [] }),
    );

    const result = await lookupIngredient('spinach', API_KEY);
    expect(result?.calories).toBeNull();
    expect(result?.protein_g).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// enrichIngredients
// ---------------------------------------------------------------------------
describe('enrichIngredients', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('enriches a list and deduplicates identical normalised names', async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            foods: [
              {
                fdcId: 1,
                foodCategory: 'Dairy',
                foodNutrients: [{ nutrientId: 1008, value: 61 }],
              },
            ],
          }),
      }),
    );

    // "milk" and "1 cup milk" both normalise to "milk" — only one API call
    const results = await enrichIngredients(['milk', '1 cup milk'], API_KEY);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(results).toHaveLength(2);
    expect(results[0].text).toBe('milk');
    expect(results[1].text).toBe('1 cup milk');
    expect(results[0].calories).toBe(61);
    expect(results[1].calories).toBe(61);
  });

  it('returns null-entry for ingredients that produce no match', async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({ ok: true, json: () => Promise.resolve({ foods: [] }) }),
    );

    const results = await enrichIngredients(['mystery ingredient'], API_KEY);

    expect(results[0]).toEqual({
      text: 'mystery ingredient',
      fdcId: null,
      calories: null,
      protein_g: null,
      carbs_g: null,
      fat_g: null,
      category: null,
    });
  });

  it('returns an empty array for empty input', async () => {
    const results = await enrichIngredients([], API_KEY);
    expect(results).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
