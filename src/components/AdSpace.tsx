'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Ad, AdSpace as AdSpaceType, parseAdDimensions, isAdActive } from '@/types/ad';

interface AdSpaceProps {
  location: 'ABOUT_SECTION' | 'INLINE_BANNER' | 'FOOTER_BANNER';
  className?: string;
}

export default function AdSpace({ location, className = '' }: AdSpaceProps) {
  const [adSpace, setAdSpace] = useState<AdSpaceType | null>(null);
  const [ad, setAd] = useState<Ad | null>(null);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);

  const fetchAdSpace = async () => {
    try {
      const response = await fetch(`/api/ads?location=${location}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const space = data[0];
          setAdSpace(space);
          
          // Check if there's a current ad and it's active
          if (space.currentAd && isAdActive(space.currentAd)) {
            setAd(space.currentAd);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch ad space:', error);
    }
  };

  const trackImpression = async () => {
    if (!ad) return;
    
    try {
      await fetch(`/api/ads/${ad.id}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'impression' })
      });
    } catch (error) {
      console.error('Failed to track impression:', error);
    }
  };

  const trackClick = async () => {
    if (!ad) return;
    
    try {
      await fetch(`/api/ads/${ad.id}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'click' })
      });
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  };

  useEffect(() => {
    fetchAdSpace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    // Track impression when ad becomes visible
    if (ad && !hasTrackedImpression) {
      trackImpression();
      setHasTrackedImpression(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad, hasTrackedImpression]);

  const handleAdClick = () => {
    trackClick();
    
    // If there's a link URL, open it
    if (ad?.linkUrl) {
      window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // If no ad space or no active ad, don't render anything
  if (!adSpace || !ad) {
    return null;
  }

  const dimensions = parseAdDimensions(adSpace.dimensions);
  const primaryDimension = dimensions[0];

  // Render image ad
  if (ad.imageUrl) {
    return (
      <div 
        className={`ad-slot ${className}`}
        aria-label="Sponsored"
        style={{
          minHeight: primaryDimension ? `${primaryDimension.height}px` : '120px'
        }}
      >
        <div
          onClick={handleAdClick}
          className="cursor-pointer"
          role={ad.linkUrl ? 'button' : 'img'}
          tabIndex={ad.linkUrl ? 0 : undefined}
          onKeyDown={(e) => {
            if (ad.linkUrl && (e.key === 'Enter' || e.key === ' ')) {
              handleAdClick();
            }
          }}
        >
          <Image
            src={ad.imageUrl}
            alt={ad.altText || 'Advertisement'}
            width={primaryDimension?.width || 800}
            height={primaryDimension?.height || 400}
            className="w-full h-auto rounded-[12px]"
            style={{
              maxWidth: primaryDimension ? `${primaryDimension.width}px` : '100%'
            }}
          />
        </div>
      </div>
    );
  }

  // Render HTML/script ad
  if (ad.htmlContent) {
    return (
      <div 
        className={`ad-slot ${className}`}
        aria-label="Sponsored"
        dangerouslySetInnerHTML={{ __html: ad.htmlContent }}
      />
    );
  }

  // Fallback: show placeholder
  return (
    <div 
      className={`ad-slot ${className}`}
      aria-label="Sponsored"
    >
      <div className="ad-inner">
        {adSpace.name} — {dimensions.map(d => `${d.width}×${d.height}`).join(' / ')}
      </div>
    </div>
  );
}
