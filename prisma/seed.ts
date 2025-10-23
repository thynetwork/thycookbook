import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Define enums locally since they're stored as JSON
enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

enum MealType {
  BREAKFAST = 'BREAKFAST',
  BRUNCH = 'BRUNCH',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  SNACK = 'SNACK',
  DESSERT = 'DESSERT',
  APPETIZER = 'APPETIZER',
  QUICK_MEAL = 'QUICK_MEAL',
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.ad.deleteMany();
  await prisma.adSpace.deleteMany();
  await prisma.savedRecipe.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  console.log('👤 Creating users...');
  const hashedPassword = await hash('Password123!', 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'chef@thycookbook.com',
        name: 'Chef Global',
        username: 'chefglobal',
        password: hashedPassword,
        role: 'CREATOR',
        bio: 'World-renowned chef sharing global cuisines',
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'tokyo@thycookbook.com',
        name: 'Tokyo Kitchen',
        username: 'tokyokitchen',
        password: hashedPassword,
        role: 'CREATOR',
        bio: 'Authentic Japanese home cooking',
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'spice@thycookbook.com',
        name: 'Spice Trail',
        username: 'spicetrail',
        password: hashedPassword,
        role: 'CREATOR',
        bio: 'Middle Eastern and Mediterranean flavors',
        emailVerified: new Date(),
      },
    }),
  ]);

  // Create categories
  console.log('📁 Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Breakfast',
        slug: 'breakfast',
        description: 'Start your day with these delicious breakfast recipes',
        icon: '🍳',
        order: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Brunch',
        slug: 'brunch',
        description: 'Weekend brunch favorites from around the world',
        icon: '🥞',
        order: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Lunch',
        slug: 'lunch',
        description: 'Quick and satisfying lunch ideas',
        icon: '🥗',
        order: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Dinner',
        slug: 'dinner',
        description: 'Hearty dinner recipes for family gatherings',
        icon: '🍽️',
        order: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Quick Meals',
        slug: 'quick-meals',
        description: '15-20 minute meals for busy weeknights',
        icon: '⚡',
        order: 5,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Appetizers',
        slug: 'appetizers',
        description: 'Small plates and starters to begin your meal',
        icon: '🍤',
        order: 6,
      },
    }),
  ]);

  // Create recipes
  console.log('🍳 Creating recipes...');
  const recipes = [
    {
      title: 'Fluffy Pancakes',
      slug: 'fluffy-pancakes',
      description: 'Classic American-style pancakes that are light, fluffy, and perfect for breakfast.',
      ingredients: JSON.stringify([
        { item: 'All-purpose flour', amount: '2 cups' },
        { item: 'Baking powder', amount: '2 tbsp' },
        { item: 'Sugar', amount: '2 tbsp' },
        { item: 'Salt', amount: '1 tsp' },
        { item: 'Milk', amount: '1.5 cups' },
        { item: 'Eggs', amount: '2 large' },
        { item: 'Melted butter', amount: '4 tbsp' },
        { item: 'Vanilla extract', amount: '1 tsp' },
      ]),
      instructions: JSON.stringify([
        'Mix dry ingredients in a large bowl',
        'Whisk wet ingredients in a separate bowl',
        'Combine wet and dry ingredients until just mixed',
        'Heat griddle to medium heat and butter lightly',
        'Pour 1/4 cup batter for each pancake',
        'Cook until bubbles form, then flip',
        'Cook until golden brown on both sides',
        'Serve warm with maple syrup',
      ]),
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      difficulty: Difficulty.EASY,
      thumbnail: 'https://placehold.co/640x360/0fb36a/ffffff?text=Fluffy+Pancakes',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoEmbedId: 'dQw4w9WgXcQ',
      cuisine: 'American',
      mealType: JSON.stringify([MealType.BREAKFAST]),
      published: true,
      featured: true,
      userId: users[0].id,
      categoryId: categories[0].id,
    },
    {
      title: 'Tamago Sando',
      slug: 'tamago-sando',
      description: 'Japanese egg sandwich with creamy egg salad filling on soft white bread.',
      ingredients: JSON.stringify([
        { item: 'Eggs', amount: '4' },
        { item: 'Japanese mayonnaise', amount: '3 tbsp' },
        { item: 'Salt', amount: 'to taste' },
        { item: 'White pepper', amount: 'to taste' },
        { item: 'Soft white bread', amount: '4 slices' },
        { item: 'Butter', amount: '2 tbsp' },
      ]),
      instructions: JSON.stringify([
        'Boil eggs for 10 minutes',
        'Cool in ice water, then peel',
        'Mash eggs with mayonnaise',
        'Season with salt and white pepper',
        'Butter the bread slices',
        'Spread egg mixture on bread',
        'Cut off crusts and slice diagonally',
      ]),
      prepTime: 15,
      cookTime: 10,
      servings: 2,
      difficulty: Difficulty.EASY,
      thumbnail: 'https://placehold.co/640x360/ff8a00/ffffff?text=Tamago+Sando',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoEmbedId: 'dQw4w9WgXcQ',
      cuisine: 'Japanese',
      mealType: JSON.stringify([MealType.BREAKFAST, MealType.BRUNCH]),
      published: true,
      userId: users[1].id,
      categoryId: categories[0].id,
    },
    {
      title: 'Shakshuka',
      slug: 'shakshuka',
      description: 'Middle Eastern eggs poached in a spicy tomato sauce with peppers and onions.',
      ingredients: JSON.stringify([
        { item: 'Olive oil', amount: '2 tbsp' },
        { item: 'Onion', amount: '1 large, diced' },
        { item: 'Red bell pepper', amount: '1, diced' },
        { item: 'Garlic cloves', amount: '4, minced' },
        { item: 'Cumin', amount: '1 tsp' },
        { item: 'Paprika', amount: '1 tsp' },
        { item: 'Crushed tomatoes', amount: '28 oz can' },
        { item: 'Eggs', amount: '6' },
        { item: 'Feta cheese', amount: '1/4 cup' },
        { item: 'Fresh parsley', amount: 'for garnish' },
      ]),
      instructions: JSON.stringify([
        'Heat oil in a large skillet',
        'Sauté onion and pepper until soft',
        'Add garlic and spices, cook 1 minute',
        'Add tomatoes and simmer 10 minutes',
        'Make wells in sauce for eggs',
        'Crack eggs into wells',
        'Cover and cook until eggs are set',
        'Top with feta and parsley',
      ]),
      prepTime: 10,
      cookTime: 25,
      servings: 4,
      difficulty: Difficulty.MEDIUM,
      thumbnail: 'https://placehold.co/640x360/e91e63/ffffff?text=Shakshuka',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoEmbedId: 'dQw4w9WgXcQ',
      cuisine: 'Middle Eastern',
      mealType: JSON.stringify([MealType.BRUNCH, MealType.BREAKFAST]),
      dietaryTags: JSON.stringify(['vegetarian']),
      published: true,
      featured: true,
      userId: users[2].id,
      categoryId: categories[1].id,
    },
  ];

  for (const recipeData of recipes) {
    await prisma.recipe.create({ data: recipeData });
  }

  console.log('✅ Seeded 3 recipes');

  // Create Ad Spaces
  console.log('📢 Creating ad spaces...');
  
  const adSpaces = await Promise.all([
    // Ad Space 1: About Section
    prisma.adSpace.create({
      data: {
        name: 'About Section Ad',
        slug: 'about-section',
        description: 'Appears under the "About ThyCookbook" text section',
        location: 'ABOUT_SECTION',
        dimensions: JSON.stringify([
          { width: 300, height: 250 },
          { width: 336, height: 280 }
        ]),
        isActive: true,
        order: 1
      }
    }),
    
    // Ad Space 2: Inline Banner
    prisma.adSpace.create({
      data: {
        name: 'Inline Banner',
        slug: 'inline-banner',
        description: 'Appears between content sections (e.g., between Brunch and Lunch)',
        location: 'INLINE_BANNER',
        dimensions: JSON.stringify([
          { width: 728, height: 90 },
          { width: 970, height: 90 }
        ]),
        isActive: true,
        order: 2
      }
    }),
    
    // Ad Space 3: Footer Banner
    prisma.adSpace.create({
      data: {
        name: 'Footer Banner',
        slug: 'footer-banner',
        description: 'Appears at the top of the footer section',
        location: 'FOOTER_BANNER',
        dimensions: JSON.stringify([
          { width: 970, height: 250 },
          { width: 728, height: 90 }
        ]),
        isActive: true,
        order: 3
      }
    })
  ]);

  console.log('✅ Created 3 ad spaces');

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log('- 3 users (1 admin, 2 creators)');
  console.log('- 6 categories');
  console.log('- 3 recipes');
  console.log('- 3 ad spaces');
  console.log('\n📝 Test user credentials:');
  console.log('Email: chef@thycookbook.com');
  console.log('Password: Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
