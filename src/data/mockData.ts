export interface Recipe {
  id: string;
  title: string;
  creator: string;
  thumbnail: string;
  videoUrl: string;
  category: string;
}

export const mockRecipes: Recipe[] = [
  // Breakfast
  {
    id: 'b1',
    title: 'Fluffy Pancakes',
    creator: '@ChefGlobal',
    thumbnail: 'https://placehold.co/640x360/0fb36a/ffffff?text=Fluffy+Pancakes',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'breakfast'
  },
  {
    id: 'b2',
    title: 'Tamago Sando',
    creator: '@TokyoKitchen',
    thumbnail: 'https://placehold.co/640x360/ff8a00/ffffff?text=Tamago+Sando',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'breakfast'
  },
  // Brunch
  {
    id: 'br1',
    title: 'Shakshuka',
    creator: '@SpiceTrail',
    thumbnail: 'https://placehold.co/640x360/e91e63/ffffff?text=Shakshuka',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'brunch'
  },
  {
    id: 'br2',
    title: 'Dim Sum At Home',
    creator: '@CantoneseCravings',
    thumbnail: 'https://placehold.co/640x360/3f51b5/ffffff?text=Dim+Sum',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'brunch'
  },
  // Lunch
  {
    id: 'l1',
    title: 'Egyptian Koshari',
    creator: '@CairoKitchen',
    thumbnail: 'https://placehold.co/640x360/0fb36a/ffffff?text=Egyptian+Koshari',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'lunch'
  },
  {
    id: 'l2',
    title: 'Bento 3 Ways',
    creator: '@NoriNotes',
    thumbnail: 'https://placehold.co/640x360/ff8a00/ffffff?text=Bento+3+Ways',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'lunch'
  },
  // Dinner
  {
    id: 'd1',
    title: 'Lamb Tagine',
    creator: '@CasablancaPlates',
    thumbnail: 'https://placehold.co/640x360/e91e63/ffffff?text=Lamb+Tagine',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'dinner'
  },
  {
    id: 'd2',
    title: 'Chicken Biryani',
    creator: '@HyderabadiHearts',
    thumbnail: 'https://placehold.co/640x360/3f51b5/ffffff?text=Chicken+Biryani',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'dinner'
  },
  // Quick Meals
  {
    id: 'q1',
    title: 'Garlic Butter Shrimp',
    creator: '@PanToPlate',
    thumbnail: 'https://placehold.co/640x360/0fb36a/ffffff?text=Garlic+Butter+Shrimp',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'quick-meals'
  },
  {
    id: 'q2',
    title: 'Veggie Stir-Fry',
    creator: '@WokThisWay',
    thumbnail: 'https://placehold.co/640x360/ff8a00/ffffff?text=Veggie+Stir+Fry',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'quick-meals'
  },
  // Appetizers
  {
    id: 'a1',
    title: 'Spanish Tapas',
    creator: '@SevilleBites',
    thumbnail: 'https://placehold.co/640x360/e91e63/ffffff?text=Spanish+Tapas',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'appetizers'
  },
  {
    id: 'a2',
    title: 'Dumpling Trio',
    creator: '@FoldAndSteam',
    thumbnail: 'https://placehold.co/640x360/3f51b5/ffffff?text=Dumpling+Trio',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'appetizers'
  },
];

export interface CategorySection {
  id: string;
  title: string;
  description: string;
  linkText: string;
}

export const categorySections: CategorySection[] = [
  {
    id: 'breakfast',
    title: 'World Breakfasts',
    description: 'From Japanese tamago to French croissants and Nigerian akara — discover how the world starts the day.',
    linkText: 'See more breakfast ideas →'
  },
  {
    id: 'brunch',
    title: 'Brunch Cultures',
    description: 'Weekend flavors that bring people together — shakshuka, dim sum, chilaquiles, and more.',
    linkText: 'See more brunch ideas →'
  },
  {
    id: 'lunch',
    title: 'Lunch Around the Globe',
    description: 'Quick bento, hearty koshari, fresh salads, and street-side classics to power your day.',
    linkText: 'See more lunch ideas →'
  },
  {
    id: 'dinner',
    title: 'Dinner Traditions',
    description: 'The heart of family & cultural gatherings — biryani, feijoada, tagine, pozole, and more.',
    linkText: 'See more dinner ideas →'
  },
  {
    id: 'quick-meals',
    title: 'Quick Meals',
    description: '15–20 minute meals without sacrificing flavor — perfect for busy nights.',
    linkText: 'See more quick meals →'
  },
  {
    id: 'appetizers',
    title: 'Appetizers & Starters',
    description: 'Small plates with big flavor — tapas, bruschetta, dumplings, mezze, ceviche.',
    linkText: 'See more appetizers →'
  },
];

export const getRecipesByCategory = (category: string): Recipe[] => {
  return mockRecipes.filter(recipe => recipe.category === category);
};