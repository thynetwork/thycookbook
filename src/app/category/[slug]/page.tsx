'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VideoCard from '@/components/VideoCard';
import Loading from '@/components/Loading';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  videoUrl: string | null;
  videoEmbedId: string | null;
  user: {
    name: string | null;
    username: string | null;
  };
}

// Category mapping
const categoryConfig: Record<string, { title: string; description: string; emoji: string }> = {
  breakfast: {
    title: 'Breakfast Recipes',
    description: 'Start your day right with delicious breakfast recipes from around the world',
    emoji: '🌅',
  },
  brunch: {
    title: 'Brunch Recipes',
    description: 'Perfect dishes for lazy weekend mornings',
    emoji: '🥐',
  },
  lunch: {
    title: 'Lunch Recipes',
    description: 'Satisfying midday meals to fuel your afternoon',
    emoji: '🍱',
  },
  dinner: {
    title: 'Dinner Recipes',
    description: 'Hearty evening meals to bring everyone together',
    emoji: '🍽️',
  },
  'quick-meals': {
    title: 'Quick Meals',
    description: 'Fast and easy recipes for busy schedules',
    emoji: '⚡',
  },
  appetizers: {
    title: 'Appetizers',
    description: 'Perfect starters to begin your meal',
    emoji: '🥗',
  },
  desserts: {
    title: 'Desserts',
    description: 'Sweet treats to satisfy your cravings',
    emoji: '🍰',
  },
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const category = categoryConfig[slug] || {
    title: 'Recipes',
    description: 'Discover amazing recipes',
    emoji: '🍳',
  };

  const fetchRecipes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/recipes?mealType=${slug.toUpperCase().replace('-', '_')}&page=${page}&limit=12`);
      
      if (response.ok) {
        const data = await response.json();
        setRecipes(data.recipes || []);
        setHasMore(data.pagination?.page < data.pagination?.totalPages);
      } else {
        toast.error('Failed to load recipes');
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast.error('An error occurred while loading recipes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, page]);

  const loadMore = () => {
    setPage(page + 1);
  };

  if (isLoading) {
    return (
      <main className="flex flex-col min-h-screen">
        <Header />
        <Loading text="Loading recipes..." />
        <Footer />
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-1 bg-gradient-to-b from-[#0fb36a]/5 to-transparent py-12 max-sm:py-6">
        <div className="container-custom">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-6 text-ink font-semibold px-4 py-2.5 rounded-[10px] bg-card border border-black/[0.08] hover:bg-white hover:shadow-brand transition-all group no-underline max-sm:mb-4 max-sm:text-sm"
          >
            <svg 
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform max-sm:w-4 max-sm:h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>

          {/* Page Header */}
          <div className="text-center mb-8 max-sm:mb-6">
            <div className="text-6xl mb-4 max-sm:text-5xl">{category.emoji}</div>
            <h1 className="text-4xl font-bold text-ink mb-3 max-sm:text-2xl">{category.title}</h1>
            <p className="text-muted text-lg max-w-2xl mx-auto max-sm:text-base">{category.description}</p>
          </div>

          {/* Recipe Grid */}
          {recipes.length === 0 ? (
            <div className="text-center py-12 max-sm:py-8">
              <div className="text-6xl mb-4 max-sm:text-5xl">🔍</div>
              <h3 className="text-xl font-bold text-ink mb-2 max-sm:text-lg">No recipes found</h3>
              <p className="text-muted mb-6">Check back soon for new recipes in this category!</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-[#0fb36a] text-white font-bold rounded-[10px] hover:-translate-y-px transition-transform no-underline"
              >
                Explore Other Categories
              </Link>
            </div>
          ) : (
            <>
              {/* 4-column grid: 4 on desktop, 3 on large tablet, 2 on tablet, 1 on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-sm:gap-4">
                {recipes.map((recipe) => (
                  <VideoCard key={recipe.id} recipe={recipe} />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-12 max-sm:mt-8">
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="px-8 py-3 bg-[#0fb36a] text-white font-bold rounded-[10px] hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed max-sm:px-6 max-sm:text-sm"
                  >
                    {isLoading ? 'Loading...' : 'Load More Recipes'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
