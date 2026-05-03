import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

process.loadEnvFile?.('.env');

const DATABASE_URL = process.env.DATABASE_URL!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL }),
});

const TEST_EMAIL = 'test@khanazana.dev';
const TEST_PASSWORD = 'password123';

async function getOrCreateTestUser(): Promise<string> {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    apikey: SERVICE_ROLE_KEY,
  };

  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD, email_confirm: true }),
  });

  const createData = (await createRes.json()) as { id?: string; msg?: string };
  if (createRes.ok && createData.id) return createData.id;

  const listRes = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(TEST_EMAIL)}`,
    { headers },
  );
  const listData = (await listRes.json()) as { users?: { id: string }[] };
  const existing = listData.users?.[0];
  if (existing) return existing.id;

  throw new Error(`Could not create or find test user: ${JSON.stringify(createData)}`);
}

// Nutrition data fetched from USDA FoodData Central (api.nal.usda.gov).
// Values are per 100g. category is the raw USDA food category string —
// resolveCategory() in shopping-list.ts maps it to a short aisle label.
// Mismatched API results were manually corrected (marked with a comment).
const RECIPES = [
  {
    title: 'Butter Chicken',
    description:
      'A creamy, mildly spiced North Indian curry with tender chicken in a rich tomato-butter sauce.',
    ingredients: [
      '500g chicken thighs, cut into pieces',
      '1 cup tomato puree',
      '1/2 cup heavy cream',
      '3 tbsp butter',
      '1 onion, finely chopped',
      '2 tsp garam masala',
      '1 tsp cumin',
      '1 tsp turmeric',
      '2 cloves garlic, minced',
      '1 tsp fresh ginger, grated',
      'Salt to taste',
    ],
    instructions: [
      'Marinate chicken with yogurt, garam masala, and turmeric for 30 minutes.',
      'Sear chicken in butter until golden, then set aside.',
      'Sauté onion, garlic, and ginger in the same pan until soft.',
      'Add tomato puree and simmer for 10 minutes.',
      'Return chicken and cook for 15 minutes.',
      'Stir in cream, simmer on low for 5 minutes.',
      'Garnish with fresh coriander and serve with naan or rice.',
    ],
    cook_time: 45,
    tags: ['indian', 'curry', 'chicken'],
    meal_types: ['dinner'],
    ingredients_nutrition: [
      {
        text: '500g chicken thighs, cut into pieces',
        fdcId: 172855,
        calories: 440,
        protein_g: 10,
        carbs_g: 1,
        fat_g: 44,
        category: 'Poultry Products',
      },
      {
        text: '1 cup tomato puree',
        fdcId: 2685582,
        calories: null,
        protein_g: 2,
        carbs_g: 8,
        fat_g: 0,
        category: 'Vegetables and Vegetable Products',
      },
      {
        text: '1/2 cup heavy cream',
        fdcId: 2346386,
        calories: null,
        protein_g: 2,
        carbs_g: 4,
        fat_g: 36,
        category: 'Dairy and Egg Products',
      },
      {
        text: '3 tbsp butter',
        fdcId: 171314,
        calories: 900,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 100,
        category: 'Dairy and Egg Products',
      },
      {
        text: '1 onion, finely chopped',
        fdcId: 170000,
        calories: 40,
        protein_g: 1,
        carbs_g: 9,
        fat_g: 0,
        category: 'Vegetables and Vegetable Products',
      },
      {
        text: '2 tsp garam masala',
        fdcId: 171181,
        calories: 57,
        protein_g: 3,
        carbs_g: 11,
        fat_g: 1,
        category: 'Spices and Herbs',
      }, // API returned Soups — corrected
      {
        text: '1 tsp cumin',
        fdcId: 170923,
        calories: 375,
        protein_g: 18,
        carbs_g: 44,
        fat_g: 22,
        category: 'Spices and Herbs',
      },
      {
        text: '1 tsp turmeric',
        fdcId: 172231,
        calories: 312,
        protein_g: 10,
        carbs_g: 67,
        fat_g: 3,
        category: 'Spices and Herbs',
      },
      {
        text: '2 cloves garlic, minced',
        fdcId: 1104647,
        calories: 143,
        protein_g: 7,
        carbs_g: 28,
        fat_g: 0,
        category: 'Vegetables and Vegetable Products',
      },
      {
        text: '1 tsp fresh ginger, grated',
        fdcId: 169231,
        calories: 80,
        protein_g: 2,
        carbs_g: 18,
        fat_g: 1,
        category: 'Vegetables and Vegetable Products',
      },
      {
        text: 'Salt to taste',
        fdcId: null,
        calories: null,
        protein_g: null,
        carbs_g: null,
        fat_g: null,
        category: 'Spices and Herbs',
      },
    ],
  },
  {
    title: 'Dal Tadka',
    description:
      'Comforting yellow lentils tempered with aromatic spices — a staple in every South Asian home.',
    ingredients: [
      '1 cup yellow moong dal',
      '3 cups water',
      '1 tomato, chopped',
      '1 onion, sliced',
      '2 tbsp ghee',
      '1 tsp cumin seeds',
      '2 dried red chillies',
      '4 garlic cloves, sliced',
      '1/2 tsp turmeric',
      '1/2 tsp red chilli powder',
      'Fresh coriander to garnish',
      'Salt to taste',
    ],
    instructions: [
      'Rinse dal and pressure cook with water, tomato, turmeric, and salt for 3 whistles.',
      'Whisk the cooked dal until smooth.',
      'Heat ghee in a small pan over medium-high heat.',
      'Add cumin seeds and let them splutter.',
      'Fry garlic slices until golden, then add dried chillies and chilli powder for 30 seconds.',
      'Pour the tempering over the dal and stir.',
      'Garnish with coriander and serve hot with roti or rice.',
    ],
    cook_time: 30,
    tags: ['indian', 'vegan', 'lentils'],
    meal_types: ['lunch', 'dinner'],
    ingredients_nutrition: [
      {
        text: '1 cup yellow moong dal',
        fdcId: 170288,
        calories: 365,
        protein_g: 9,
        carbs_g: 74,
        fat_g: 5,
        category: 'Legumes and Legume Products',
      }, // API returned Cereal Grains — corrected
      {
        text: '3 cups water',
        fdcId: null,
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        category: null,
      },
      {
        text: '1 tomato, chopped',
        fdcId: 170461,
        calories: 302,
        protein_g: 13,
        carbs_g: 75,
        fat_g: 0,
        category: 'Vegetables and Vegetable Products',
      },
      {
        text: '1 onion, sliced',
        fdcId: 170000,
        calories: 40,
        protein_g: 1,
        carbs_g: 9,
        fat_g: 0,
        category: 'Vegetables and Vegetable Products',
      },
      {
        text: '2 tbsp ghee',
        fdcId: 171314,
        calories: 900,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 100,
        category: 'Fats and Oils',
      },
      {
        text: '1 tsp cumin seeds',
        fdcId: 170923,
        calories: 375,
        protein_g: 18,
        carbs_g: 44,
        fat_g: 22,
        category: 'Spices and Herbs',
      },
      {
        text: '2 dried red chillies',
        fdcId: 2346408,
        calories: null,
        protein_g: 1,
        carbs_g: 7,
        fat_g: 0,
        category: 'Vegetables and Vegetable Products',
      },
      {
        text: '4 garlic cloves, sliced',
        fdcId: 1104647,
        calories: 143,
        protein_g: 7,
        carbs_g: 28,
        fat_g: 0,
        category: 'Vegetables and Vegetable Products',
      }, // API returned Spices — corrected
      {
        text: '1/2 tsp turmeric',
        fdcId: 172231,
        calories: 312,
        protein_g: 10,
        carbs_g: 67,
        fat_g: 3,
        category: 'Spices and Herbs',
      },
      {
        text: '1/2 tsp red chilli powder',
        fdcId: 167806,
        calories: 250,
        protein_g: 4,
        carbs_g: 80,
        fat_g: 0,
        category: 'Spices and Herbs',
      }, // API returned Fruits — corrected
      {
        text: 'Fresh coriander to garnish',
        fdcId: 170922,
        calories: 298,
        protein_g: 12,
        carbs_g: 55,
        fat_g: 18,
        category: 'Spices and Herbs',
      },
      {
        text: 'Salt to taste',
        fdcId: null,
        calories: null,
        protein_g: null,
        carbs_g: null,
        fat_g: null,
        category: 'Spices and Herbs',
      },
    ],
  },
  {
    title: 'Chicken Biryani',
    description:
      'Fragrant basmati rice layered with spiced chicken, caramelised onions, and saffron.',
    ingredients: [
      '500g bone-in chicken pieces',
      '2 cups basmati rice, soaked 30 min',
      '2 large onions, thinly sliced',
      '1/2 cup yogurt',
      '3 tbsp biryani masala',
      '1/4 cup fresh mint leaves',
      '1/4 cup fresh coriander',
      'Pinch of saffron in 3 tbsp warm milk',
      '4 tbsp ghee',
      '2 bay leaves, 4 cardamom pods',
      'Salt to taste',
    ],
    instructions: [
      'Fry onions in ghee until deep golden brown. Set half aside.',
      'Marinate chicken with yogurt, biryani masala, and half the fried onions for 1 hour.',
      'Cook marinated chicken in a heavy pot until 70% done.',
      'Par-boil rice with whole spices and salt until 70% cooked. Drain.',
      'Layer rice over the chicken. Top with reserved onions, mint, coriander, and saffron milk.',
      'Seal the pot with foil and cook on low heat for 25 minutes (dum).',
      'Gently mix before serving with raita.',
    ],
    cook_time: 90,
    tags: ['indian', 'rice', 'chicken'],
    meal_types: ['lunch', 'dinner'],
    ingredients_nutrition: [
      {
        text: '500g bone-in chicken pieces',
        fdcId: 170718,
        calories: 215,
        protein_g: 18,
        carbs_g: 0,
        fat_g: 15,
        category: 'Poultry Products',
      }, // API returned Fast Foods — corrected
      {
        text: '2 cups basmati rice, soaked 30 min',
        fdcId: 174436,
        calories: 154,
        protein_g: 14,
        carbs_g: 0,
        fat_g: 11,
        category: 'Cereal Grains and Pasta',
      }, // API returned Lamb — corrected
      {
        text: '2 large onions, thinly sliced',
        fdcId: 170000,
        calories: 40,
        protein_g: 1,
        carbs_g: 9,
        fat_g: 0,
        category: 'Vegetables and Vegetable Products',
      },
      {
        text: '1/2 cup yogurt',
        fdcId: 167722,
        calories: 94,
        protein_g: 4,
        carbs_g: 16,
        fat_g: 2,
        category: 'Dairy and Egg Products',
      }, // API returned Legumes — corrected
      {
        text: '3 tbsp biryani masala',
        fdcId: 171181,
        calories: 57,
        protein_g: 3,
        carbs_g: 11,
        fat_g: 1,
        category: 'Spices and Herbs',
      }, // API returned Soups — corrected
      {
        text: '1/4 cup fresh mint leaves',
        fdcId: 168416,
        calories: 64,
        protein_g: 9,
        carbs_g: 8,
        fat_g: 1,
        category: 'Vegetables and Vegetable Products',
      },
      {
        text: '1/4 cup fresh coriander',
        fdcId: 170922,
        calories: 298,
        protein_g: 12,
        carbs_g: 55,
        fat_g: 18,
        category: 'Spices and Herbs',
      },
      {
        text: 'Pinch of saffron in 3 tbsp warm milk',
        fdcId: 170934,
        calories: 310,
        protein_g: 11,
        carbs_g: 65,
        fat_g: 6,
        category: 'Spices and Herbs',
      },
      {
        text: '4 tbsp ghee',
        fdcId: 171314,
        calories: 900,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 100,
        category: 'Fats and Oils',
      },
      {
        text: '2 bay leaves, 4 cardamom pods',
        fdcId: 170919,
        calories: 311,
        protein_g: 11,
        carbs_g: 69,
        fat_g: 7,
        category: 'Spices and Herbs',
      },
      {
        text: 'Salt to taste',
        fdcId: null,
        calories: null,
        protein_g: null,
        carbs_g: null,
        fat_g: null,
        category: 'Spices and Herbs',
      },
    ],
  },
  {
    title: 'Palak Paneer',
    description:
      'Soft paneer cubes in a vibrant, velvety spinach gravy spiced with ginger and garlic.',
    ingredients: [
      '250g paneer, cubed',
      '300g fresh spinach',
      '1 onion, chopped',
      '2 tomatoes, chopped',
      '3 garlic cloves',
      '1 tsp fresh ginger',
      '2 tbsp oil',
      '1 tsp cumin seeds',
      '1/2 tsp garam masala',
      '1/4 cup cream',
      'Salt to taste',
    ],
    instructions: [
      'Blanch spinach in boiling water for 2 minutes, then blend into a smooth puree.',
      'Lightly fry paneer cubes until golden, then set aside.',
      'Heat oil, add cumin seeds, then sauté onion until golden.',
      'Add garlic and ginger, cook for 1 minute. Add tomatoes and cook until soft.',
      'Pour in spinach puree and simmer for 5 minutes.',
      'Add paneer and cream, season with garam masala and salt.',
      'Simmer for 3 minutes and serve with naan or jeera rice.',
    ],
    cook_time: 30,
    tags: ['indian', 'vegetarian', 'paneer'],
    meal_types: ['lunch', 'dinner'],
    ingredients_nutrition: [
      {
        text: '250g paneer, cubed',
        fdcId: 171561,
        calories: 321,
        protein_g: 25,
        carbs_g: 3,
        fat_g: 25,
        category: 'Dairy and Egg Products',
      }, // API returned Soups — corrected
      {
        text: '300g fresh spinach',
        fdcId: 170494,
        calories: 172,
        protein_g: 8,
        carbs_g: 6,
        fat_g: 13,
        category: 'Vegetables and Vegetable Products',
      },
      {
        text: '1 onion, chopped',
        fdcId: 170000,
        calories: 40,
        protein_g: 1,
        carbs_g: 9,
        fat_g: 0,
        category: 'Vegetables and Vegetable Products',
      },
      {
        text: '2 tomatoes, chopped',
        fdcId: 170461,
        calories: 302,
        protein_g: 13,
        carbs_g: 75,
        fat_g: 0,
        category: 'Vegetables and Vegetable Products',
      },
      {
        text: '3 garlic cloves',
        fdcId: 1104647,
        calories: 143,
        protein_g: 7,
        carbs_g: 28,
        fat_g: 0,
        category: 'Vegetables and Vegetable Products',
      }, // API returned Spices — corrected
      {
        text: '1 tsp fresh ginger',
        fdcId: 169231,
        calories: 80,
        protein_g: 2,
        carbs_g: 18,
        fat_g: 1,
        category: 'Vegetables and Vegetable Products',
      },
      {
        text: '2 tbsp oil',
        fdcId: 748278,
        calories: null,
        protein_g: null,
        carbs_g: null,
        fat_g: null,
        category: 'Fats and Oils',
      },
      {
        text: '1 tsp cumin seeds',
        fdcId: 170923,
        calories: 375,
        protein_g: 18,
        carbs_g: 44,
        fat_g: 22,
        category: 'Spices and Herbs',
      },
      {
        text: '1/2 tsp garam masala',
        fdcId: 171181,
        calories: 57,
        protein_g: 3,
        carbs_g: 11,
        fat_g: 1,
        category: 'Spices and Herbs',
      }, // API returned Soups — corrected
      {
        text: '1/4 cup cream',
        fdcId: 170857,
        calories: 195,
        protein_g: 3,
        carbs_g: 4,
        fat_g: 19,
        category: 'Dairy and Egg Products',
      },
      {
        text: 'Salt to taste',
        fdcId: null,
        calories: null,
        protein_g: null,
        carbs_g: null,
        fat_g: null,
        category: 'Spices and Herbs',
      },
    ],
  },
  {
    title: 'Aloo Gobi',
    description:
      'A dry, lightly spiced stir-fry of potatoes and cauliflower — simple, satisfying, and vegan.',
    ingredients: [
      '2 medium potatoes, peeled and cubed',
      '1 small cauliflower, cut into florets',
      '2 tbsp oil',
      '1 tsp cumin seeds',
      '1 tsp turmeric',
      '1 tsp coriander powder',
      '1/2 tsp red chilli powder',
      '1 tsp garam masala',
      '2 garlic cloves, minced',
      '1/2 tsp fresh ginger, grated',
      'Fresh coriander to garnish',
      'Salt to taste',
    ],
    instructions: [
      'Heat oil in a wide pan, add cumin seeds and let them splutter.',
      'Add garlic and ginger, fry for 30 seconds.',
      'Add potatoes, toss with turmeric and salt. Cover and cook for 8 minutes.',
      'Add cauliflower, coriander powder, and chilli powder. Stir to combine.',
      'Cover and cook on medium-low for 10 minutes, stirring occasionally.',
      'Uncover, increase heat, and stir-fry for 2 minutes until edges are golden.',
      'Finish with garam masala and fresh coriander.',
    ],
    cook_time: 25,
    tags: ['indian', 'vegan', 'vegetables'],
    meal_types: ['lunch', 'dinner', 'snacks'],
    ingredients_nutrition: [
      {
        text: '2 medium potatoes, peeled and cubed',
        fdcId: 170026,
        calories: 77,
        protein_g: 2,
        carbs_g: 17,
        fat_g: 0,
        category: 'Vegetables and Vegetable Products',
      }, // API returned Soups — corrected
      {
        text: '1 small cauliflower, cut into florets',
        fdcId: 2685573,
        calories: null,
        protein_g: 2,
        carbs_g: 5,
        fat_g: 0,
        category: 'Vegetables and Vegetable Products',
      },
      {
        text: '2 tbsp oil',
        fdcId: 748278,
        calories: null,
        protein_g: null,
        carbs_g: null,
        fat_g: null,
        category: 'Fats and Oils',
      },
      {
        text: '1 tsp cumin seeds',
        fdcId: 170923,
        calories: 375,
        protein_g: 18,
        carbs_g: 44,
        fat_g: 22,
        category: 'Spices and Herbs',
      },
      {
        text: '1 tsp turmeric',
        fdcId: 172231,
        calories: 312,
        protein_g: 10,
        carbs_g: 67,
        fat_g: 3,
        category: 'Spices and Herbs',
      },
      {
        text: '1 tsp coriander powder',
        fdcId: 170922,
        calories: 298,
        protein_g: 12,
        carbs_g: 55,
        fat_g: 18,
        category: 'Spices and Herbs',
      },
      {
        text: '1/2 tsp red chilli powder',
        fdcId: 167806,
        calories: 250,
        protein_g: 4,
        carbs_g: 80,
        fat_g: 0,
        category: 'Spices and Herbs',
      }, // API returned Fruits — corrected
      {
        text: '1 tsp garam masala',
        fdcId: 171181,
        calories: 57,
        protein_g: 3,
        carbs_g: 11,
        fat_g: 1,
        category: 'Spices and Herbs',
      }, // API returned Soups — corrected
      {
        text: '2 garlic cloves, minced',
        fdcId: 1104647,
        calories: 143,
        protein_g: 7,
        carbs_g: 28,
        fat_g: 0,
        category: 'Vegetables and Vegetable Products',
      }, // API returned Spices — corrected
      {
        text: '1/2 tsp fresh ginger, grated',
        fdcId: 169231,
        calories: 80,
        protein_g: 2,
        carbs_g: 18,
        fat_g: 1,
        category: 'Vegetables and Vegetable Products',
      },
      {
        text: 'Fresh coriander to garnish',
        fdcId: 170922,
        calories: 298,
        protein_g: 12,
        carbs_g: 55,
        fat_g: 18,
        category: 'Spices and Herbs',
      },
      {
        text: 'Salt to taste',
        fdcId: null,
        calories: null,
        protein_g: null,
        carbs_g: null,
        fat_g: null,
        category: 'Spices and Herbs',
      },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding database...\n');

  const userId = await getOrCreateTestUser();
  console.log(`✓ Test user ready — ${TEST_EMAIL}`);

  await prisma.recipe.deleteMany({ where: { user_id: userId } });

  console.log(userId);

  for (const recipe of RECIPES) {
    await prisma.recipe.create({ data: { user_id: userId, ...recipe } });
  }

  console.log(`✓ Created ${RECIPES.length} recipes (with USDA ingredient enrichment data)`);
  console.log(`\n  Login with: ${TEST_EMAIL} / ${TEST_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
