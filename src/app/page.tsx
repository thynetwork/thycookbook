import Header from '@/components/Header';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import CategorySection from '@/components/CategorySection';
import Footer from '@/components/Footer';

// Category definitions matching the database seed
const categories = [
  {
    id: 'breakfast',
    slug: 'breakfast',
    title: 'World Breakfasts',
    description: 'From Japanese tamago to French croissants and Nigerian akara — discover how the world starts the day.',
    linkText: 'See more breakfast ideas →'
  },
  {
    id: 'brunch',
    slug: 'brunch',
    title: 'Brunch Cultures',
    description: 'Weekend flavors that bring people together — shakshuka, dim sum, chilaquiles, and more.',
    linkText: 'See more brunch ideas →'
  },
  {
    id: 'lunch',
    slug: 'lunch',
    title: 'Lunch Around the Globe',
    description: 'Quick bento, hearty koshari, fresh salads, and street-side classics to power your day.',
    linkText: 'See more lunch ideas →'
  },
  {
    id: 'dinner',
    slug: 'dinner',
    title: 'Dinner Traditions',
    description: 'The heart of family & cultural gatherings — biryani, feijoada, tagine, pozole, and more.',
    linkText: 'See more dinner ideas →'
  },
  {
    id: 'quick-meals',
    slug: 'quick-meals',
    title: 'Quick Meals',
    description: '15–20 minute meals without sacrificing flavor — perfect for busy nights.',
    linkText: 'See more quick meals →'
  },
  {
    id: 'appetizers',
    slug: 'appetizers',
    title: 'Appetizers & Starters',
    description: 'Small plates with big flavor — tapas, bruschetta, dumplings, mezze, ceviche.',
    linkText: 'See more appetizers →'
  },
  {
    id: 'desserts',
    slug: 'desserts',
    title: 'Desserts from Every Culture',
    description: 'Sweet endings from around the world — baklava, mochi, churros, tiramisu, and more.',
    linkText: 'See more desserts →'
  },
  {
    id: 'snacks',
    slug: 'snacks',
    title: 'Snacks & Street Food',
    description: 'Quick bites and street favorites — samosas, empanadas, spring rolls, and tasty treats.',
    linkText: 'See more snacks →'
  }
];

// Fetch recipes by category slug
async function getRecipesByCategory(categorySlug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/recipes?category=${categorySlug}&limit=2&published=true`, {
      next: { revalidate: 60 } // Revalidate every 60 seconds (ISR)
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch recipes for ${categorySlug}:`, response.statusText);
      return [];
    }
    
    const data = await response.json();
    return data.recipes || [];
  } catch (error) {
    console.error(`Error fetching recipes for ${categorySlug}:`, error);
    return [];
  }
}

export default async function Home() {
  // Fetch recipes for each category
  const recipesData = await Promise.all(
    categories.map(async (category) => ({
      category,
      recipes: await getRecipesByCategory(category.slug)
    }))
  );

  return (
    <main id="top" className="flex flex-col flex-1">
      <Header />
      <div className="flex-1">
        <Hero />
        <AboutSection />

        {recipesData.map((data, index) => (
          <CategorySection
            key={data.category.id}
            category={data.category}
            recipes={data.recipes}
            showAd={index === 3} // Show ad after Dinner section
          />
        ))}
      </div>

      <Footer />

      {/* Simple Log anchor target */}
      <div id="log" className="sr-only" aria-hidden="true"></div>
    </main>
  );
}