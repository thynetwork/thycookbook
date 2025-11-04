'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { parseIngredients, parseInstructions, formatTime, getDifficultyColor } from '@/lib/recipeUtils';

interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  ingredients: string;
  instructions: string;
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
  difficulty: string;
  thumbnail: string | null;
  videoUrl: string | null;
  videoEmbedId: string | null;
  cuisine: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
  category: {
    name: string;
    slug: string;
  } | null;
}

interface RecipeDetailProps {
  recipe: Recipe;
}

export default function RecipeDetail({ recipe }: RecipeDetailProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(recipe.likeCount);
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  // Mark when we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const ingredients = parseIngredients(recipe.ingredients);
  const instructions = parseInstructions(recipe.instructions);
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);


  // Fetch presigned URLs for S3 media (ThyMissing pattern)
  useEffect(() => {
    const fetchMediaUrls = async () => {
      try {
        setMediaLoading(true);

        // Simple S3 detection and presigned URL fetching
        if (recipe.thumbnail && recipe.thumbnail.startsWith('s3://')) {
          try {
            const response = await fetch('/api/media/presigned-url', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: recipe.thumbnail }),
            });
            
            if (response.ok) {
              const data = await response.json();
              setThumbnailUrl(data.presignedUrl);
            }
          } catch (error) {
            console.error('Failed to fetch thumbnail presigned URL:', error);
          }
        }

        if (recipe.videoUrl && recipe.videoUrl.startsWith('s3://') && !recipe.videoEmbedId) {
          try {
            const response = await fetch('/api/media/presigned-url', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: recipe.videoUrl }),
            });
            
            if (response.ok) {
              const data = await response.json();
              setVideoUrl(data.presignedUrl);
            }
          } catch (error) {
            console.error('Failed to fetch video presigned URL:', error);
          }
        }

        setMediaLoading(false);
      } catch (error) {
        console.error('Error fetching media URLs:', error);
        setMediaLoading(false);
      }
    };

    fetchMediaUrls();
  }, [recipe.thumbnail, recipe.videoUrl]);

  const handleLike = async () => {
    if (!session) {
      toast.error('Please log in to like recipes');
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${recipe.id}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLocalLikeCount(data.liked ? localLikeCount + 1 : localLikeCount - 1);
        
        if (data.liked) {
          toast.success('Recipe liked! ❤️');
        } else {
          toast.success('Recipe unliked');
        }
      } else {
        toast.error('Failed to like recipe');
      }
    } catch (error) {
      console.error('Error liking recipe:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!session) {
      toast.error('Please log in to save recipes');
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${recipe.id}/save`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.saved);
        
        if (data.saved) {
          toast.success('Recipe saved to your collection! 📚');
        } else {
          toast.success('Recipe removed from collection');
        }
      } else {
        toast.error('Failed to save recipe');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  // Check if video is uploaded or embedded (ThyMissing pattern)
  const isUploadedVideo = recipe.videoUrl && !recipe.videoEmbedId && 
    recipe.videoUrl.startsWith('s3://');

  const getVideoEmbedUrl = () => {
    if (recipe.videoEmbedId) {
      return `https://www.youtube.com/embed/${recipe.videoEmbedId}`;
    }
    return null;
  };

  // Get thumbnail (ThyMissing pattern)
  const getThumbnail = () => {
    // Use presigned URL if available (fetched from S3)
    if (thumbnailUrl) {
      return thumbnailUrl;
    }
    
    // YouTube thumbnail
    if (recipe.videoEmbedId) {
      return `https://img.youtube.com/vi/${recipe.videoEmbedId}/hqdefault.jpg`;
    }
    
    // External HTTPS URLs (not S3)
    if (recipe.thumbnail && recipe.thumbnail.startsWith('https://') && !recipe.thumbnail.startsWith('s3://')) {
      return recipe.thumbnail;
    }
    
    // Default placeholder
    return 'https://placehold.co/640x360?text=Recipe+Video';
  };

  return (
    <article className="container-custom py-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 mb-6 text-ink font-semibold px-4 py-2.5 rounded-[10px] bg-card border border-black/[0.08] hover:bg-white hover:shadow-brand transition-all group"
      >
        <svg 
          className="w-5 h-5 group-hover:-translate-x-1 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Header */}
      <div className="mb-6">
        {recipe.category && (
          <Link
            href={`/#${recipe.category.slug}`}
            className="text-[#0fb36a] font-semibold text-sm hover:underline"
          >
            {recipe.category.name}
          </Link>
        )}
        <h1 className="text-4xl font-bold mt-2 mb-4">{recipe.title}</h1>
        
        {/* Meta Info */}
        <div className="flex items-center gap-6 text-muted mb-4">
          <div className="flex items-center gap-2">
            {recipe.user.image && (
              <Image
                src={recipe.user.image}
                alt={recipe.user.name || 'Creator'}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <span className="font-semibold">
              @{recipe.user.name || recipe.user.username || 'Anonymous'}
            </span>
          </div>
          <span>👁 {recipe.viewCount} views</span>
          <span>❤️ {localLikeCount} likes</span>
          <span>💬 {recipe.commentCount} comments</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleLike}
            className={`px-6 py-2 rounded-[10px] font-semibold transition-all ${
              isLiked
                ? 'bg-[#e91e63] text-white'
                : 'bg-white border-2 border-[#e91e63] text-[#e91e63] hover:bg-[#e91e63] hover:text-white'
            }`}
          >
            {isLiked ? '❤️ Liked' : '🤍 Like'}
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-2 rounded-[10px] font-semibold transition-all ${
              isSaved
                ? 'bg-[#ff8a00] text-white'
                : 'bg-white border-2 border-[#ff8a00] text-[#ff8a00] hover:bg-[#ff8a00] hover:text-white'
            }`}
          >
            {isSaved ? '📌 Saved' : '🔖 Save'}
          </button>
        </div>
      </div>

      {/* Video/Image */}
      <div className="mb-8 rounded-[14px] overflow-hidden shadow-brand">
        {!isClient || mediaLoading ? (
          <div className="aspect-video bg-[#f3f3f3] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0fb36a] mx-auto mb-2"></div>
              <p className="text-gray-600">Loading media...</p>
            </div>
          </div>
        ) : isPlaying ? (
          <div className="aspect-video">
            {isUploadedVideo && videoUrl && !videoUrl.startsWith('s3://') ? (
              <video
                controls
                autoPlay
                className="w-full h-full object-cover"
                src={videoUrl}
                onError={(e) => {
                  console.error('Video loading error:', e);
                  toast.error('Failed to load video');
                }}
              >
                Your browser does not support the video tag.
              </video>
            ) : getVideoEmbedUrl() ? (
              <iframe
                width="100%"
                height="100%"
                src={`${getVideoEmbedUrl()}?autoplay=1`}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-full"
              />
            ) : null}
          </div>
        ) : (
          <div className="relative aspect-video bg-[#f3f3f3]">
            {(() => {
              const thumbSrc = getThumbnail();
              console.log('🖼️ [RecipeDetail] Final render thumbSrc:', thumbSrc);
              
              // ABSOLUTE safety check: NEVER render Image with S3 URI
              if (!thumbSrc || 
                  thumbSrc.startsWith('s3://') || 
                  thumbSrc.startsWith('thycookbook/') ||
                  !thumbSrc.startsWith('https://')) {
                console.error('❌ [RecipeDetail] BLOCKED invalid thumbnail from Image:', thumbSrc);
                return (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400">Loading image...</span>
                  </div>
                );
              }
              
              console.log('✅ [RecipeDetail] Rendering Image with safe src:', thumbSrc);
              return (
                <Image
                  src={thumbSrc}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                  unoptimized={thumbSrc.includes('youtube.com') || thumbSrc.includes('X-Amz-')}
                  onError={(e) => {
                    console.error('Image loading error:', e);
                    // Set fallback image
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/1200x675?text=Recipe+Image';
                  }}
                />
              );
            })()}
            {(recipe.videoUrl || recipe.videoEmbedId) && (
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                disabled={mediaLoading}
              >
                <div className="w-20 h-20 bg-[#0fb36a] rounded-full flex items-center justify-center text-white text-3xl shadow-brand">
                  ▶
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Recipe Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-6 bg-white rounded-[14px] shadow-brand">
        {recipe.prepTime && (
          <div className="text-center">
            <div className="text-2xl mb-1">⏱️</div>
            <div className="text-sm text-muted">Prep Time</div>
            <div className="font-bold">{formatTime(recipe.prepTime)}</div>
          </div>
        )}
        {recipe.cookTime && (
          <div className="text-center">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-sm text-muted">Cook Time</div>
            <div className="font-bold">{formatTime(recipe.cookTime)}</div>
          </div>
        )}
        {totalTime > 0 && (
          <div className="text-center">
            <div className="text-2xl mb-1">⏰</div>
            <div className="text-sm text-muted">Total Time</div>
            <div className="font-bold">{formatTime(totalTime)}</div>
          </div>
        )}
        {recipe.servings && (
          <div className="text-center">
            <div className="text-2xl mb-1">🍽️</div>
            <div className="text-sm text-muted">Servings</div>
            <div className="font-bold">{recipe.servings}</div>
          </div>
        )}
        <div className="text-center">
          <div className="text-2xl mb-1">📊</div>
          <div className="text-sm text-muted">Difficulty</div>
          <div className={`font-bold ${getDifficultyColor(recipe.difficulty)}`}>
            {recipe.difficulty}
          </div>
        </div>
        {recipe.cuisine && (
          <div className="text-center">
            <div className="text-2xl mb-1">🌍</div>
            <div className="text-sm text-muted">Cuisine</div>
            <div className="font-bold">{recipe.cuisine}</div>
          </div>
        )}
      </div>

      {/* Description */}
      {recipe.description && (
        <div className="mb-8">
          <p className="text-lg leading-relaxed">{recipe.description}</p>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-[1fr_2fr] gap-8">
        {/* Ingredients */}
        <div className="bg-white p-6 rounded-[14px] shadow-brand h-fit">
          <h2 className="text-2xl font-bold mb-4 text-[#0fb36a]">Ingredients</h2>
          {ingredients.length > 0 ? (
            <ul className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#0fb36a] mt-1">✓</span>
                  <span>
                    {ingredient.amount && <strong>{ingredient.amount} </strong>}
                    {ingredient.unit && <span>{ingredient.unit} </span>}
                    {ingredient.item}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No ingredients listed for this recipe.</p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white p-6 rounded-[14px] shadow-brand">
          <h2 className="text-2xl font-bold mb-4 text-[#0fb36a]">Instructions</h2>
          <ol className="space-y-4">
            {instructions.map((instruction, index) => (
              <li key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#0fb36a] text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 pt-1">{instruction}</div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </article>
  );
}
