'use client';

import { useState } from 'react';
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

  const handlePlay = () => {
    setIsPlaying(true);
  };

  // Build video embed URL (YouTube or Vimeo)
  const getVideoEmbedUrl = () => {
    if (recipe.videoEmbedId) {
      // Assume YouTube for now, can be extended for Vimeo
      return `https://www.youtube.com/embed/${recipe.videoEmbedId}`;
    }
    return recipe.videoUrl;
  };

  // Get thumbnail or placeholder
  const getThumbnail = () => {
    if (recipe.thumbnail) {
      return recipe.thumbnail;
    }
    // YouTube thumbnail from video ID
    if (recipe.videoEmbedId) {
      return `https://img.youtube.com/vi/${recipe.videoEmbedId}/hqdefault.jpg`;
    }
    return 'https://placehold.co/640x360?text=Recipe+Video';
  };

  const creatorName = recipe.user.name || recipe.user.username || 'Anonymous Chef';

  return (
    <article className="bg-card rounded-brand shadow-brand overflow-hidden border border-black/[0.06] transition-transform duration-[180ms] ease-in-out hover:-translate-y-0.5">
      <Link href={`/recipes/${recipe.slug}`} className="block">
        <div className="relative aspect-video bg-[#f3f3f3] overflow-hidden">
          {isPlaying && getVideoEmbedUrl() ? (
            <iframe
              width="100%"
              height="100%"
              src={`${getVideoEmbedUrl()}?autoplay=1`}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <>
              <Image
                src={getThumbnail()}
                alt={`${recipe.title} video thumbnail`}
                width={640}
                height={360}
                className="w-full h-full object-cover block"
                unoptimized={getThumbnail().startsWith('https://img.youtube.com')}
              />
              {(recipe.videoUrl || recipe.videoEmbedId) && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handlePlay();
                  }}
                  aria-label={`Play ${recipe.title}`}
                  className="absolute bottom-3 right-3 bg-[#0fb36a] text-white border-0 rounded-full px-3.5 py-2.5 font-extrabold shadow-brand cursor-pointer focus:outline focus:outline-[3px] focus:outline-brand/25 max-sm:px-3 max-sm:py-2 max-sm:text-sm"
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