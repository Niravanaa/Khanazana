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

  // User already exists — look them up
  const listRes = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(TEST_EMAIL)}`,
    { headers },
  );
  const listData = (await listRes.json()) as { users?: { id: string }[] };
  const existing = listData.users?.[0];
  if (existing) return existing.id;

  throw new Error(`Could not create or find test user: ${JSON.stringify(createData)}`);
}

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
  },
];

async function main() {
  console.log('🌱 Seeding database...\n');

  const userId = await getOrCreateTestUser();
  console.log(`✓ Test user ready — ${TEST_EMAIL}`);

  await prisma.recipe.deleteMany({ where: { user_id: userId } });

  for (const recipe of RECIPES) {
    await prisma.recipe.create({ data: { user_id: userId, ...recipe } });
  }

  console.log(`✓ Created ${RECIPES.length} recipes`);
  console.log(`\n  Login with: ${TEST_EMAIL} / ${TEST_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
