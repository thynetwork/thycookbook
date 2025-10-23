// Ad Space Types
export interface AdDimension {
  width: number;
  height: number;
}

export enum AdLocation {
  ABOUT_SECTION = 'ABOUT_SECTION',
  INLINE_BANNER = 'INLINE_BANNER',
  FOOTER_BANNER = 'FOOTER_BANNER'
}

export interface AdSpace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  location: AdLocation;
  dimensions: string; // JSON string of AdDimension[]
  currentAdId: string | null;
  currentAd?: Ad | null;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ad {
  id: string;
  name: string;
  imageUrl: string | null;
  htmlContent: string | null;
  linkUrl: string | null;
  altText: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  adSpaceId: string;
  impressions: number;
  clicks: number;
  advertiserName: string | null;
  advertiserEmail: string | null;
  campaignId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Parsed dimensions helper
export interface ParsedAdSpace extends Omit<AdSpace, 'dimensions'> {
  dimensions: AdDimension[];
}

// Helper function to parse dimensions
export function parseAdDimensions(dimensionsJson: string): AdDimension[] {
  try {
    return JSON.parse(dimensionsJson);
  } catch (error) {
    console.error('Failed to parse ad dimensions:', error);
    return [];
  }
}

// Helper function to check if ad is currently active
export function isAdActive(ad: Ad): boolean {
  if (!ad.isActive) return false;
  
  const now = new Date();
  
  if (ad.startDate && new Date(ad.startDate) > now) {
    return false;
  }
  
  if (ad.endDate && new Date(ad.endDate) < now) {
    return false;
  }
  
  return true;
}
