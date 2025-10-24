'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Recipe {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  videoEmbedId: string | null;
  likeCount: number;
  viewCount: number;
  cuisine: string | null;
  difficulty: string;
  prepTime: number | null;
  cookTime: number | null;
  published: boolean;
  createdAt: string;
}

interface UserStats {
  totalRecipes: number;
  totalLikes: number;
  totalViews: number;
  savedRecipes: number;
  followers: number;
  following: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'created' | 'saved'>('created');
  const [createdRecipes, setCreatedRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalRecipes: 0,
    totalLikes: 0,
    totalViews: 0,
    savedRecipes: 0,
    followers: 0,
    following: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get URL search params on mount
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      
      // Set active tab from query param
      const tab = params.get('tab');
      if (tab === 'saved') {
        setActiveTab('saved');
      }
    }

    // Listen for custom event to change to saved tab
    const handleChangeSavedTab = () => {
      setActiveTab('saved');
    };

    window.addEventListener('changeSavedTab', handleChangeSavedTab);

    return () => {
      window.removeEventListener('changeSavedTab', handleChangeSavedTab);
    };
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Please log in to view your profile');
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchProfileData();
    }
  }, [status, router]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      // Fetch user's created recipes
      const createdRes = await fetch('/api/user/recipes');
      if (createdRes.ok) {
        const createdData = await createdRes.json();
        setCreatedRecipes(createdData.recipes || []);
      }

      // Fetch user's saved recipes
      const savedRes = await fetch('/api/user/saved');
      if (savedRes.ok) {
        const savedData = await savedRes.json();
        setSavedRecipes(savedData.recipes || []);
      }

      // Fetch user stats
      const statsRes = await fetch('/api/user/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitial = () => {
    if (session?.user?.name) {
      return session.user.name.charAt(0).toUpperCase();
    }
    if (session?.user?.email) {
      return session.user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getThumbnail = (recipe: Recipe) => {
    if (recipe.thumbnail) return recipe.thumbnail;
    if (recipe.videoEmbedId) {
      return `https://img.youtube.com/vi/${recipe.videoEmbedId}/maxresdefault.jpg`;
    }
    return 'https://placehold.co/400x225?text=Recipe';
  };

  if (status === 'loading' || isLoading) {
    return (
      <main className="flex flex-col min-h-screen">
        <Header />
        <Loading text="Loading profile..." />
        <Footer />
      </main>
    );
  }

  if (!session) return null;

  const currentRecipes = activeTab === 'created' ? createdRecipes : savedRecipes;

  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-1 bg-gradient-to-b from-[#0fb36a]/5 to-transparent py-12 max-sm:py-6">
        <div className="container-custom max-w-5xl">
          {/* Profile Header */}
          <div className="bg-card rounded-brand shadow-brand border border-black/[0.06] p-8 mb-8 max-sm:p-5 max-sm:mb-6">
            <div className="flex items-start gap-6 max-md:flex-col max-md:items-center max-md:text-center">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0fb36a] to-[#0a8c52] text-white font-bold text-4xl flex items-center justify-center border-4 border-white shadow-lg max-sm:w-20 max-sm:h-20 max-sm:text-3xl">
                  {getInitial()}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-ink mb-2 max-sm:text-2xl">
                  {session.user?.name || 'User'}
                </h1>
                <p className="text-muted mb-4 max-sm:text-sm">{session.user?.email}</p>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-3 max-sm:gap-2">
                  <div className="text-center p-3 bg-bg rounded-[10px] max-sm:p-2">
                    <div className="text-2xl font-bold text-[#0fb36a] max-sm:text-xl">{stats.totalRecipes}</div>
                    <div className="text-xs text-muted font-semibold max-sm:text-[10px]">Recipes</div>
                  </div>
                  <div className="text-center p-3 bg-bg rounded-[10px] max-sm:p-2">
                    <div className="text-2xl font-bold text-[#ff8a00] max-sm:text-xl">{stats.totalLikes}</div>
                    <div className="text-xs text-muted font-semibold max-sm:text-[10px]">Likes</div>
                  </div>
                  <div className="text-center p-3 bg-bg rounded-[10px] max-sm:p-2">
                    <div className="text-2xl font-bold text-[#3f51b5] max-sm:text-xl">{stats.totalViews}</div>
                    <div className="text-xs text-muted font-semibold max-sm:text-[10px]">Views</div>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <Link
                href="/profile/edit"
                className="px-6 py-3 bg-bg hover:bg-white border border-black/[0.08] rounded-[10px] font-semibold text-ink transition-all hover:shadow-brand no-underline max-md:w-full max-md:text-center max-sm:text-sm max-sm:px-4 max-sm:py-2"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-card rounded-brand shadow-brand border border-black/[0.06] mb-6 overflow-hidden max-sm:mb-4">
            <div className="flex border-b border-black/[0.06]">
              <button
                onClick={() => setActiveTab('created')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors max-sm:px-4 max-sm:py-3 max-sm:text-sm ${
                  activeTab === 'created'
                    ? 'bg-[#0fb36a] text-white'
                    : 'text-ink hover:bg-bg'
                }`}
              >
                My Recipes ({createdRecipes.length})
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors max-sm:px-4 max-sm:py-3 max-sm:text-sm ${
                  activeTab === 'saved'
                    ? 'bg-[#0fb36a] text-white'
                    : 'text-ink hover:bg-bg'
                }`}
              >
                Saved Recipes ({savedRecipes.length})
              </button>
            </div>
          </div>

          {/* Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-sm:gap-4">
            {currentRecipes.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">
                  {activeTab === 'created' ? '👨‍🍳' : '📚'}
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">
                  {activeTab === 'created' 
                    ? 'No recipes yet' 
                    : 'No saved recipes'}
                </h3>
                <p className="text-muted mb-6">
                  {activeTab === 'created'
                    ? 'Start creating your first recipe!'
                    : 'Save recipes you love to access them later'}
                </p>
                {activeTab === 'created' && (
                  <Link
                    href="/profile/recipes/new"
                    className="inline-block px-6 py-3 bg-[#0fb36a] text-white font-bold rounded-[10px] hover:-translate-y-px transition-transform no-underline"
                  >
                    Create Recipe
                  </Link>
                )}
              </div>
            ) : (
              currentRecipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.slug}`}
                  className="bg-card rounded-brand shadow-brand border border-black/[0.06] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all no-underline"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-bg">
                    <Image
                      src={getThumbnail(recipe)}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                    />
                    {/* Privacy Badge */}
                    {activeTab === 'created' && (
                      <div className="absolute top-2 right-2">
                        {recipe.published ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg">
                            <span>🌍</span> Public
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 text-white text-xs font-semibold rounded-full shadow-lg">
                            <span>🔒</span> Private
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-ink mb-2 line-clamp-2">
                      {recipe.title}
                    </h3>
                    
                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-muted mb-3">
                      {recipe.cuisine && (
                        <span className="px-2 py-1 bg-bg rounded-[6px] font-semibold">
                          {recipe.cuisine}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-bg rounded-[6px] font-semibold">
                        {recipe.difficulty}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted">
                      <div className="flex items-center gap-1">
                        <span>❤️</span>
                        <span>{recipe.likeCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>👁️</span>
                        <span>{recipe.viewCount}</span>
                      </div>
                      {(recipe.prepTime || recipe.cookTime) && (
                        <div className="flex items-center gap-1">
                          <span>⏱️</span>
                          <span>{(recipe.prepTime || 0) + (recipe.cookTime || 0)}m</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Floating Action Button - Always show on "My Recipes" tab */}
          {activeTab === 'created' && (
            <Link
              href="/profile/recipes/new"
              className="fixed bottom-8 right-8 w-16 h-16 bg-[#0fb36a] text-white rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center group no-underline z-50 max-sm:bottom-6 max-sm:right-6 max-sm:w-14 max-sm:h-14"
              title="Create New Recipe"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={3} 
                stroke="currentColor" 
                className="w-8 h-8 group-hover:rotate-90 transition-transform max-sm:w-7 max-sm:h-7"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
