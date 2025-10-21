'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function AboutSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section id="about" className="container-custom py-[46px] border-t border-dashed border-black/[0.06]">
      <div className="mb-3">
        <h2 className="m-0 mb-3 text-[clamp(1.6rem,2.2vw,2.2rem)] font-bold">About ThyCookbook</h2>
      </div>

      <div className="grid grid-cols-[1.1fr_0.9fr] gap-7 items-start max-[920px]:grid-cols-1">
        {/* Text Content */}
        <div className="text-content">
          <p>
            Part of the <strong>ThyNetwork</strong> ecosystem, ThyCookbook curates vibrant dishes,
            techniques, and food culture. We spotlight creators from every region — from street food
            legends to home-kitchen innovators.
          </p>
          <ul className="list-none pl-0">
            <li className="pl-6 relative mb-2 before:content-['✓'] before:absolute before:left-0 before:text-brand before:font-bold">
              Global voices &amp; authentic recipes
            </li>
            <li className="pl-6 relative mb-2 before:content-['✓'] before:absolute before:left-0 before:text-brand before:font-bold">
              Medium video boxes for quick, visual learning
            </li>
            <li className="pl-6 relative mb-2 before:content-['✓'] before:absolute before:left-0 before:text-brand before:font-bold">
              Colorful, lively browsing experience
            </li>
          </ul>

          {/* AD SLOT #1: About section */}
          <div
            className="mt-[18px] border-2 border-dashed border-black/[0.12] bg-white rounded-[12px] shadow-[0_6px_20px_rgba(0,0,0,0.05)] grid place-items-center min-h-[120px]"
            aria-label="Sponsored"
          >
            <div className="font-extrabold text-[#777] p-[18px] text-center">
              Ad Space — 300×250 / 336×280
            </div>
          </div>
        </div>

        {/* Video Box */}
        <div className="influencer-box">
          <article className="bg-card rounded-brand shadow-brand overflow-hidden border border-black/[0.06] transition-transform duration-[180ms] ease-in-out hover:-translate-y-0.5">
            <div className="relative aspect-video bg-[#f3f3f3] overflow-hidden">
              {isPlaying ? (
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <>
                  <Image
                    src="https://placehold.co/640x360/0fb36a/ffffff?text=About+Video"
                    alt="About ThyCookbook video thumbnail"
                    width={640}
                    height={360}
                    className="w-full h-full object-cover block"
                  />
                  <button
                    onClick={() => setIsPlaying(true)}
                    aria-label="Play video"
                    className="absolute bottom-3 right-3 bg-[#0fb36a] text-white border-0 rounded-full px-3.5 py-2.5 font-extrabold shadow-brand cursor-pointer focus:outline focus:outline-[3px] focus:outline-brand/25"
                  >
                    ▶
                  </button>
                </>
              )}
            </div>
            <div className="p-3 px-3.5">
              <h3 className="m-0 mb-1 text-[1.02rem] font-bold">Welcome to ThyCookbook</h3>
              <p className="m-0 text-muted text-sm">Meet the creators and the mission behind the flavors.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}