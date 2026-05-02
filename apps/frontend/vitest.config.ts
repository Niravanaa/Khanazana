import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    exclude: ['e2e/**', '**/node_modules/**'],
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'src/lib/utils.ts',
        'src/lib/recipe-form.ts',
        'src/lib/env.ts',
        'src/lib/recipes.ts',
        'src/lib/meal-plan.ts',
        'src/lib/shopping-list.ts',
        'src/lib/social.ts',
        'src/lib/fdc.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
