/**
 * Image Optimization Utilities
 * Handles image optimization configuration and utilities for better performance
 */

/**
 * Get optimized image configuration for different use cases
 */
export const imageOptimizationConfig = {
  // Card images in listings
  card: {
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    quality: 80,
    priority: false,
    loading: 'lazy' as const,
  },
  
  // Hero/banner images
  hero: {
    sizes: '100vw',
    quality: 85,
    priority: true,
    loading: 'eager' as const,
  },
  
  // Thumbnail images
  thumbnail: {
    sizes: '(max-width: 640px) 80px, 120px',
    quality: 75,
    priority: false,
    loading: 'lazy' as const,
  },
  
  // Gallery images
  gallery: {
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 800px',
    quality: 85,
    priority: false,
    loading: 'lazy' as const,
  },
  
  // Small icons/logos
  icon: {
    sizes: '48px',
    quality: 75,
    priority: false,
    loading: 'lazy' as const,
  },
};

/**
 * Generate responsive image sizes based on breakpoints
 */
export function getResponsiveSizes(breakpoints: Record<string, string>): string {
  return Object.entries(breakpoints)
    .map(([media, size]) => `(${media}) ${size}`)
    .join(', ');
}

/**
 * Get placeholder blur data URL (optional, can be generated at build time)
 */
export function getBlurPlaceholder(): string {
  // Return a minimal base64 encoded placeholder
  // This is a 1x1 transparent PNG - can be replaced with actual blur hashes
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
}

/**
 * Validate image URL and provide fallback if needed
 */
export function getImageUrl(
  url: string | null | undefined,
  fallback: string = '/images/placeholder-location.jpg'
): string {
  if (!url) return fallback;
  
  // Basic validation - ensure it's a valid URL
  try {
    new URL(url);
    return url;
  } catch {
    return fallback;
  }
}

/**
 * Get image dimensions based on aspect ratio
 */
export const imageDimensions = {
  card: {
    width: 400,
    height: 300, // 4:3 aspect ratio
  },
  hero: {
    width: 1200,
    height: 400, // 3:1 aspect ratio
  },
  thumbnail: {
    width: 120,
    height: 120, // 1:1 aspect ratio
  },
  gallery: {
    width: 800,
    height: 600, // 4:3 aspect ratio
  },
};

/**
 * Calculate image dimensions maintaining aspect ratio
 */
export function calculateImageDimensions(
  containerWidth: number,
  aspectRatio: number = 4 / 3
): { width: number; height: number } {
  return {
    width: containerWidth,
    height: Math.round(containerWidth / aspectRatio),
  };
}

/**
 * Preload critical images for better perceived performance
 */
export function preloadImage(src: string): void {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  }
}

/**
 * Image format support detection (could be used with dynamic imports)
 */
export const supportedFormats = {
  modern: ['image/avif', 'image/webp'],
  fallback: ['image/jpeg', 'image/png'],
};

/**
 * Configuration for image CDN (if using external CDN)
 */
export const cdnConfig = {
  enabled: process.env.NEXT_PUBLIC_CDN_ENABLED === 'true',
  url: process.env.NEXT_PUBLIC_CDN_URL || '',
  quality: process.env.NEXT_PUBLIC_CDN_QUALITY || '80',
  autoOptimize: true,
};
