'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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

interface VideoCardProps {
  recipe: Recipe;
}

export default function VideoCard({ recipe }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  // Mark when we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Safe thumbnail that NEVER contains S3 URIs (for SSR safety)
  const safeThumbnail = (() => {
    console.log('🛡️ [VideoCard] Computing safeThumbnail for recipe:', recipe.id);
    console.log('📸 [VideoCard] recipe.thumbnail:', recipe.thumbnail);
    console.log('🎬 [VideoCard] recipe.videoEmbedId:', recipe.videoEmbedId);
    
    // If it's a YouTube embed, use YouTube thumbnail
    if (recipe.videoEmbedId) {
      const ytThumb = `https://img.youtube.com/vi/${recipe.videoEmbedId}/hqdefault.jpg`;
      console.log('✅ [VideoCard] safeThumbnail = YouTube:', ytThumb);
      return ytThumb;
    }
    // If thumbnail exists and is NOT an S3 URI/key, use it
    if (recipe.thumbnail && 
        recipe.thumbnail.startsWith('https://') && 
        !recipe.thumbnail.includes('s3://')) {
      console.log('✅ [VideoCard] safeThumbnail = recipe.thumbnail:', recipe.thumbnail);
      return recipe.thumbnail;
    }
    // Default placeholder
    const placeholder = 'https://placehold.co/640x360?text=Recipe+Video';
    console.log('✅ [VideoCard] safeThumbnail = placeholder:', placeholder);
    return placeholder;
  })();

  const handlePlay = () => {
    setIsPlaying(true);
  };

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

  // Check if video is uploaded or embedded (ThyMissing pattern)
  const isUploadedVideo = recipe.videoUrl && !recipe.videoEmbedId && 
    recipe.videoUrl.startsWith('s3://');

  // Build video embed URL (YouTube or Vimeo)
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

  const creatorName = recipe.user.name || recipe.user.username || 'Anonymous Chef';

  return (
    <article className="bg-card rounded-brand shadow-brand overflow-hidden border border-black/[0.06] transition-transform duration-[180ms] ease-in-out hover:-translate-y-0.5">
      <Link href={`/recipes/${recipe.slug}`} className="block">
        <div className="relative aspect-video bg-[#f3f3f3] overflow-hidden">
          {!isClient || mediaLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0fb36a]"></div>
            </div>
          ) : isPlaying ? (
            <>
              {isUploadedVideo && videoUrl ? (
                <video
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                  src={videoUrl}
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
            </>
          ) : (
            <>
              {(() => {
                const thumbSrc = getThumbnail();
                console.log('🖼️ [VideoCard] Final render thumbSrc:', thumbSrc);
                
                // ABSOLUTE safety check: NEVER render Image with S3 URI
                if (!thumbSrc || 
                    thumbSrc.startsWith('s3://') || 
                    thumbSrc.startsWith('thycookbook/') ||
                    !thumbSrc.startsWith('https://')) {
                  console.error('❌ [VideoCard] BLOCKED invalid thumbnail from Image:', thumbSrc);
                  return (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400">Loading image...</span>
                    </div>
                  );
                }
                
                console.log('✅ [VideoCard] Rendering Image with safe src:', thumbSrc);
                return (
                  <Image
                    src={thumbSrc}
                    alt={`${recipe.title} video thumbnail`}
                    width={640}
                    height={360}
                    className="w-full h-full object-cover block"
                    unoptimized={thumbSrc.startsWith('https://img.youtube.com') || thumbSrc.includes('X-Amz-')}
                  />
                );
              })()}
              {(recipe.videoUrl || recipe.videoEmbedId) && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handlePlay();
                  }}
                  aria-label={`Play ${recipe.title}`}
                  className="absolute bottom-3 right-3 bg-[#0fb36a] text-white border-0 rounded-full px-3.5 py-2.5 font-extrabold shadow-brand cursor-pointer focus:outline focus:outline-[3px] focus:outline-brand/25 max-sm:px-3 max-sm:py-2 max-sm:text-sm"
                  disabled={mediaLoading}
                >
                  ▶
                </button>
              )}
            </>
          )}
        </div>
        <div className="p-3 px-3.5 max-sm:p-2.5">
          <h3 className="m-0 mb-1 text-[1.02rem] font-bold max-sm:text-[0.95rem] line-clamp-2">{recipe.title}</h3>
          <p className="m-0 text-muted text-sm max-sm:text-xs">@{creatorName}</p>
        </div>
      </Link>
    </article>
  );
}