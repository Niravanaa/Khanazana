import { describe, expect, it } from 'vitest';
import { buildRecipeInput } from './recipe-form';

describe('buildRecipeInput', () => {
  it('parses multiline ingredients and instructions', () => {
    const formData = new FormData();
    formData.set('title', 'Paneer Tikka');
    formData.set('description', 'Spicy paneer skewers');
    formData.set('ingredients', 'Paneer\nYogurt\nSpices');
    formData.set('instructions', 'Marinate\nGrill\nServe');

    expect(buildRecipeInput(formData)).toEqual({
      title: 'Paneer Tikka',
      description: 'Spicy paneer skewers',
      ingredients: ['Paneer', 'Yogurt', 'Spices'],
      instructions: ['Marinate', 'Grill', 'Serve'],
    });
  });

  it('trims whitespace from title and description', () => {
    const formData = new FormData();
    formData.set('title', '  Dal Makhani  ');
    formData.set('description', '  Rich lentils  ');
    formData.set('ingredients', 'Lentils');
    formData.set('instructions', 'Cook');

    const result = buildRecipeInput(formData);
    expect(result.title).toBe('Dal Makhani');
    expect(result.description).toBe('Rich lentils');
  });

  it('filters blank and whitespace-only lines', () => {
    const formData = new FormData();
    formData.set('title', 'Test');
    formData.set('description', '');
    formData.set('ingredients', 'Onion\n\n  \nGarlic');
    formData.set('instructions', 'Chop\n\nCook');

    const result = buildRecipeInput(formData);
    expect(result.ingredients).toEqual(['Onion', 'Garlic']);
    expect(result.instructions).toEqual(['Chop', 'Cook']);
  });

  it('throws when title is missing', () => {
    const formData = new FormData();
    formData.set('ingredients', 'A');
    formData.set('instructions', 'B');

    expect(() => buildRecipeInput(formData)).toThrow('Recipe title is required.');
  });

  it('throws when ingredients are empty', () => {
    const formData = new FormData();
    formData.set('title', 'Test');
    formData.set('ingredients', '   ');
    formData.set('instructions', 'Cook');

    expect(() => buildRecipeInput(formData)).toThrow('At least one ingredient is required.');
  });

  it('throws when instructions are empty', () => {
    const formData = new FormData();
    formData.set('title', 'Test');
    formData.set('ingredients', 'Something');
    formData.set('instructions', '   ');

    expect(() => buildRecipeInput(formData)).toThrow('At least one instruction step is required.');
  });
});
