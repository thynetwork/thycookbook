'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Recipe } from '@/data/mockData';

interface VideoCardProps {
  recipe: Recipe;
}

export default function VideoCard({ recipe }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <article className="bg-card rounded-brand shadow-brand overflow-hidden border border-black/[0.06] transition-transform duration-[180ms] ease-in-out hover:-translate-y-0.5">
      <div className="relative aspect-video bg-[#f3f3f3] overflow-hidden">
        {isPlaying ? (
          <iframe
            width="100%"
            height="100%"
            src={`${recipe.videoUrl}?autoplay=1`}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <>
            <Image
              src={recipe.thumbnail}
              alt={`${recipe.title} video thumbnail`}
              width={640}
              height={360}
              className="w-full h-full object-cover block"
            />
            <button
              onClick={handlePlay}
              aria-label={`Play ${recipe.title}`}
              className="absolute bottom-3 right-3 bg-[#0fb36a] text-white border-0 rounded-full px-3.5 py-2.5 font-extrabold shadow-brand cursor-pointer focus:outline focus:outline-[3px] focus:outline-brand/25"
            >
              ▶
            </button>
          </>
        )}
      </div>
      <div className="p-3 px-3.5">
        <h3 className="m-0 mb-1 text-[1.02rem] font-bold">{recipe.title}</h3>
        <p className="m-0 text-muted text-sm">{recipe.creator}</p>
      </div>
    </article>
  );
}