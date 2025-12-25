/**
 * Tour Location Types - SEO & Marketing Enhanced
 * Comprehensive TypeScript interfaces for tour location management
 */

// ============================================
// CORE TOUR LOCATION TYPE
// ============================================

export interface TourLocationImage {
  url: string;
  alt: string;
  caption?: string;
  order?: number;
}

export interface TourLocationAmenity {
  name: string;
  available?: boolean;
  description?: string;
}

export interface TourLocation {
  // Identity & Ordering
  id: string;
  tourPackageId: string;
  name: string;
  slug?: string;
  type: LocationType;
  sequenceNumber: number;

  // GPS Coordinates
  latitude: number;
  longitude: number;
  island?: string;
  address?: string;

  // Timing & Schedule
  durationMinutes?: number;
  arrivalTime?: string; // HH:MM format
  departureTime?: string; // HH:MM format

  // Activity & Experience
  activity?: string;
  activityDuration?: number;
  skillLevel?: SkillLevel;

  // Content & Marketing
  title?: string;
  description?: string;
  shortDescription?: string; // 155-160 chars for SEO
  imageUrl?: string;
  imageAlt?: string;

  // Gallery
  gallery: TourLocationImage[];

  // SEO & Keywords
  keywords: string[];
  seoTags: string[];
  metaDescription?: string;

  // Marketing Content
  highlights: string[];
  bestTimeToVisit?: string;
  funFacts: string[];
  tipsFacts: string[];

  // Accessibility & Amenities
  wheelchairAccessible: boolean;
  parkingAvailable: boolean;
  toiletsAvailable: boolean;
  amenities: string[];

  // Status & Visibility
  isActive: boolean;
  isFeatured: boolean;
  visibility: ContentVisibility;

  // Content Management
  contentApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ENUMS & CONSTANTS
// ============================================

export enum LocationType {
  TEMPLE = "TEMPLE",
  BEACH = "BEACH",
  PIER = "PIER",
  RESTAURANT = "RESTAURANT",
  SHOP = "SHOP",
  VIEWPOINT = "VIEWPOINT",
  MARKET = "MARKET",
  WATERFALL = "WATERFALL",
  CAVE = "CAVE",
  GARDEN = "GARDEN",
  HISTORICAL = "HISTORICAL",
  NATURE = "NATURE",
  OTHER = "OTHER"
}

export enum SkillLevel {
  EASY = "EASY",
  MODERATE = "MODERATE",
  CHALLENGING = "CHALLENGING"
}

export enum ContentVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  DRAFT = "DRAFT"
}

// ============================================
// FORM & API TYPES
// ============================================

export interface CreateTourLocationInput {
  tourPackageId: string;
  name: string;
  slug?: string;
  type: LocationType;
  sequenceNumber: number;

  // GPS
  latitude: number;
  longitude: number;
  island?: string;
  address?: string;

  // Schedule
  durationMinutes?: number;
  arrivalTime?: string;
  departureTime?: string;

  // Activity
  activity?: string;
  activityDuration?: number;
  skillLevel?: SkillLevel;

  // Content
  title?: string;
  description?: string;
  shortDescription?: string;
  imageUrl?: string;
  imageAlt?: string;

  // Gallery
  gallery?: TourLocationImage[];

  // SEO
  keywords?: string[];
  seoTags?: string[];
  metaDescription?: string;

  // Marketing
  highlights?: string[];
  bestTimeToVisit?: string;
  funFacts?: string[];
  tipsFacts?: string[];

  // Accessibility
  wheelchairAccessible?: boolean;
  parkingAvailable?: boolean;
  toiletsAvailable?: boolean;
  amenities?: string[];

  // Status
  isActive?: boolean;
  isFeatured?: boolean;
  visibility?: ContentVisibility;
  notes?: string;
}

export interface UpdateTourLocationInput {
  name?: string;
  slug?: string;
  type?: LocationType;
  sequenceNumber?: number;

  // GPS
  latitude?: number;
  longitude?: number;
  island?: string;
  address?: string;

  // Schedule
  durationMinutes?: number;
  arrivalTime?: string;
  departureTime?: string;

  // Activity
  activity?: string;
  activityDuration?: number;
  skillLevel?: SkillLevel;

  // Content
  title?: string;
  description?: string;
  shortDescription?: string;
  imageUrl?: string;
  imageAlt?: string;

  // Gallery
  gallery?: TourLocationImage[];

  // SEO
  keywords?: string[];
  seoTags?: string[];
  metaDescription?: string;

  // Marketing
  highlights?: string[];
  bestTimeToVisit?: string;
  funFacts?: string[];
  tipsFacts?: string[];

  // Accessibility
  wheelchairAccessible?: boolean;
  parkingAvailable?: boolean;
  toiletsAvailable?: boolean;
  amenities?: string[];

  // Status
  isActive?: boolean;
  isFeatured?: boolean;
  visibility?: ContentVisibility;
  notes?: string;
  contentApproved?: boolean;
  approvedBy?: string;
}

// ============================================
// SEO & META TYPES
// ============================================

export interface TourLocationSEO {
  title: string;
  description: string; // shortDescription
  keywords: string[];
  seoTags: string[];
  metaDescription: string;
  ogImage: string; // imageUrl
  ogImageAlt: string; // imageAlt
  canonical: string; // Full URL
}

export interface TourLocationMetaTags {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogImageAlt: string;
  twitterCard: "summary_large_image" | "summary";
  twitterImage: string;
  canonical: string;
}

// ============================================
// MAP & GEO TYPES
// ============================================

export interface TourLocationMapMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: LocationType;
  sequenceNumber: number;
  imageUrl?: string;
  description?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface GeoBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

// ============================================
// DISPLAY & CARD TYPES
// ============================================

export interface TourLocationCardProps {
  location: TourLocation;
  sequenceNumber?: number;
  showImage?: boolean;
  showDescription?: boolean;
  showHighlights?: boolean;
  onEdit?: (location: TourLocation) => void;
  onDelete?: (locationId: string) => void;
  className?: string;
}

export interface TourLocationDetailProps {
  location: TourLocation;
  showGallery?: boolean;
  showMap?: boolean;
  showFunFacts?: boolean;
  showTips?: boolean;
  showAmenities?: boolean;
  showApprovalStatus?: boolean;
}

export interface TourItineraryItem {
  sequence: number;
  location: TourLocation;
  estimatedTime?: string;
  duration?: number;
  nextArrivalTime?: string;
}

// ============================================
// FILTERING & SEARCH TYPES
// ============================================

export interface TourLocationFilter {
  tourPackageId?: string;
  type?: LocationType;
  visibility?: ContentVisibility;
  isActive?: boolean;
  isFeatured?: boolean;
  contentApproved?: boolean;
  keyword?: string;
  island?: string;
  skillLevel?: SkillLevel;
}

export interface TourLocationSearchParams {
  query?: string;
  filters?: TourLocationFilter;
  sort?: "sequence" | "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// ============================================
// VALIDATION TYPES
// ============================================

export interface TourLocationValidationError {
  field: string;
  message: string;
  code: string;
}

export interface SEOValidationResult {
  isValid: boolean;
  score: number; // 0-100
  errors: TourLocationValidationError[];
  warnings: TourLocationValidationError[];
  suggestions: string[];
}

export interface ContentValidationResult {
  isValid: boolean;
  completeness: number; // 0-100
  errors: TourLocationValidationError[];
  warnings: TourLocationValidationError[];
  missingFields: string[];
}

// ============================================
// BATCH & IMPORT TYPES
// ============================================

export interface TourLocationImportData {
  name: string;
  type: string;
  sequenceNumber: number;
  latitude: number;
  longitude: number;
  island?: string;
  address?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  keywords?: string;
  highlights?: string;
  activity?: string;
  durationMinutes?: number;
  bestTimeToVisit?: string;
}

export interface BatchImportResult {
  success: number;
  failed: number;
  errors: Array<{
    rowNumber: number;
    data: TourLocationImportData;
    error: string;
  }>;
}

// ============================================
// ANALYTICS & REPORTING TYPES
// ============================================

export interface TourLocationAnalytics {
  locationId: string;
  name: string;
  views: number;
  clicks: number;
  bookings: number;
  rating?: number;
  reviews: number;
  lastViewed?: Date;
}

export interface TourLocationPerformance {
  location: TourLocation;
  metrics: TourLocationAnalytics;
  seoScore: number;
  contentCompleteness: number;
  bookingRate: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface TourLocationResponse<T = TourLocation> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

export interface TourLocationListResponse {
  success: boolean;
  data: TourLocation[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface TourLocationMapResponse {
  success: boolean;
  data: TourLocationMapMarker[];
}

// ============================================
// UTILITY HELPERS
// ============================================

export namespace TourLocationHelpers {
  /**
   * Check if location has all required SEO fields
   */
  export function isSEOComplete(location: Partial<TourLocation>): boolean {
    return !!(
      location.title &&
      location.shortDescription &&
      location.keywords?.length &&
      location.keywords.length > 0 &&
      location.metaDescription &&
      location.imageUrl &&
      location.imageAlt
    );
  }

  /**
   * Check if location has all required content fields
   */
  export function isContentComplete(location: Partial<TourLocation>): boolean {
    return !!(
      location.name &&
      location.type &&
      location.latitude &&
      location.longitude &&
      location.description &&
      location.highlights?.length &&
      location.highlights.length > 0 &&
      location.imageUrl
    );
  }

  /**
   * Calculate content completeness percentage (0-100)
   */
  export function getCompletenessScore(location: Partial<TourLocation>): number {
    const requiredFields = [
      'name',
      'type',
      'sequenceNumber',
      'latitude',
      'longitude',
      'title',
      'description',
      'shortDescription',
      'imageUrl',
      'imageAlt',
      'keywords',
      'highlights'
    ];

    const filledFields = requiredFields.filter(field => {
      const value = (location as any)[field];
      if (Array.isArray(value)) return value.length > 0;
      return !!value;
    });

    return Math.round((filledFields.length / requiredFields.length) * 100);
  }

  /**
   * Generate slug from name
   */
  export function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * Calculate distance between two geo points (in km)
   */
  export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Format time for display
   */
  export function formatTime(time: string): string {
    // Input: "HH:MM", Output: "9:30 AM"
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  }

  /**
   * Format duration for display
   */
  export function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
}
