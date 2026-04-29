import { describe, expect, it } from 'vitest';
import { buildRecipeInput } from './recipe-form';

function makeFormData(fields: {
  title?: string;
  description?: string;
  ingredients?: { qty?: string; name: string; note?: string }[];
  steps?: string[];
  tags?: string;
  cook_time?: string;
}): FormData {
  const fd = new FormData();
  if (fields.title !== undefined) fd.set('title', fields.title);
  if (fields.description !== undefined) fd.set('description', fields.description);
  if (fields.tags !== undefined) fd.set('tags', fields.tags);
  if (fields.cook_time !== undefined) fd.set('cook_time', fields.cook_time);
  for (const ing of fields.ingredients ?? []) {
    fd.append('ingredient_qty', ing.qty ?? '');
    fd.append('ingredient_name', ing.name);
    fd.append('ingredient_note', ing.note ?? '');
  }
  for (const step of fields.steps ?? []) {
    fd.append('instruction_step', step);
  }
  return fd;
}

describe('buildRecipeInput', () => {
  it('parses structured ingredients and instruction steps', () => {
    const fd = makeFormData({
      title: 'Paneer Tikka',
      description: 'Spicy paneer skewers',
      ingredients: [
        { qty: '200g', name: 'Paneer', note: 'cubed' },
        { name: 'Yogurt' },
        { name: 'Spices' },
      ],
      steps: ['Marinate', 'Grill', 'Serve'],
    });

    expect(buildRecipeInput(fd)).toEqual({
      title: 'Paneer Tikka',
      description: 'Spicy paneer skewers',
      ingredients: ['200g Paneer (cubed)', 'Yogurt', 'Spices'],
      instructions: ['Marinate', 'Grill', 'Serve'],
      tags: [],
      cook_time: null,
    });
  });

  it('trims whitespace from title and description', () => {
    const fd = makeFormData({
      title: '  Dal Makhani  ',
      description: '  Rich lentils  ',
      ingredients: [{ name: 'Lentils' }],
      steps: ['Cook'],
    });

    const result = buildRecipeInput(fd);
    expect(result.title).toBe('Dal Makhani');
    expect(result.description).toBe('Rich lentils');
  });

  it('filters blank and whitespace-only ingredient rows', () => {
    const fd = makeFormData({
      title: 'Test',
      description: '',
      ingredients: [{ name: 'Onion' }, { name: '' }, { name: '   ' }, { name: 'Garlic' }],
      steps: ['Chop', 'Cook'],
    });

    const result = buildRecipeInput(fd);
    expect(result.ingredients).toEqual(['Onion', 'Garlic']);
  });

  it('filters blank instruction steps', () => {
    const fd = makeFormData({
      title: 'Test',
      ingredients: [{ name: 'Onion' }],
      steps: ['Chop', '', '   ', 'Cook'],
    });

    expect(buildRecipeInput(fd).instructions).toEqual(['Chop', 'Cook']);
  });

  it('throws when title is missing', () => {
    const fd = makeFormData({
      ingredients: [{ name: 'A' }],
      steps: ['B'],
    });

    expect(() => buildRecipeInput(fd)).toThrow('Recipe title is required.');
  });

  it('throws when ingredients are empty', () => {
    const fd = makeFormData({
      title: 'Test',
      ingredients: [],
      steps: ['Cook'],
    });

    expect(() => buildRecipeInput(fd)).toThrow('At least one ingredient is required.');
  });

  it('throws when instructions are empty', () => {
    const fd = makeFormData({
      title: 'Test',
      ingredients: [{ name: 'Something' }],
      steps: [],
    });

    expect(() => buildRecipeInput(fd)).toThrow('At least one instruction step is required.');
  });

  it('parses comma-separated tags and lowercases them', () => {
    const fd = makeFormData({
      title: 'Curry',
      ingredients: [{ name: 'Spices' }],
      steps: ['Cook'],
      tags: 'Vegetarian, Quick, Indian',
    });

    expect(buildRecipeInput(fd).tags).toEqual(['vegetarian', 'quick', 'indian']);
  });

  it('parses cook_time as integer', () => {
    const fd = makeFormData({
      title: 'Quick Dish',
      ingredients: [{ name: 'Something' }],
      steps: ['Do it'],
      cook_time: '25',
    });

    expect(buildRecipeInput(fd).cook_time).toBe(25);
  });

  it('returns null cook_time when empty', () => {
    const fd = makeFormData({
      title: 'Dish',
      ingredients: [{ name: 'A' }],
      steps: ['B'],
      cook_time: '',
    });

    expect(buildRecipeInput(fd).cook_time).toBeNull();
  });

  it('formats ingredient with qty and note', () => {
    const fd = makeFormData({
      title: 'Dish',
      ingredients: [{ qty: '2', name: 'Eggs', note: 'beaten' }],
      steps: ['Mix'],
    });

    expect(buildRecipeInput(fd).ingredients).toEqual(['2 Eggs (beaten)']);
  });

  it('formats ingredient with qty only', () => {
    const fd = makeFormData({
      title: 'Dish',
      ingredients: [{ qty: '1 cup', name: 'Flour' }],
      steps: ['Mix'],
    });

    expect(buildRecipeInput(fd).ingredients).toEqual(['1 cup Flour']);
  });
});
