/**
 * Tour Location Utilities
 * Shared functions for API calls, data formatting, validation, and parsing
 * Used across admin dashboard and frontend components
 */

import { TourLocation, CreateTourLocationInput, UpdateTourLocationInput } from '@/types/tour-location';

// ============================================
// API Client Functions
// ============================================

/**
 * Fetch a single tour location by ID
 */
export async function fetchTourLocation(id: string): Promise<TourLocation> {
  const response = await fetch(`/api/tour-locations/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch location');
  }
  
  const data = await response.json();
  return data.data;
}

/**
 * Fetch tour locations for a specific tour package
 */
export async function fetchTourLocations(
  tourPackageId: string,
  options?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }
): Promise<{ locations: TourLocation[]; pagination: any }> {
  const params = new URLSearchParams();
  params.append('tourId', tourPackageId);
  if (options?.page) params.append('page', String(options.page));
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.sort) params.append('sort', options.sort);
  if (options?.order) params.append('order', options.order);

  const response = await fetch(`/api/tour-locations?${params.toString()}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch locations');
  }
  
  const data = await response.json();
  return {
    locations: data.data,
    pagination: data.pagination,
  };
}

/**
 * Create a new tour location (admin only)
 */
export async function createTourLocation(input: CreateTourLocationInput): Promise<TourLocation> {
  const response = await fetch('/api/tour-locations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create location');
  }
  
  const data = await response.json();
  return data.data;
}

/**
 * Update an existing tour location (admin only)
 */
export async function updateTourLocation(
  id: string,
  input: UpdateTourLocationInput
): Promise<TourLocation> {
  const response = await fetch(`/api/tour-locations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update location');
  }
  
  const data = await response.json();
  return data.data;
}

/**
 * Delete a tour location (admin only)
 */
export async function deleteTourLocation(id: string): Promise<void> {
  const response = await fetch(`/api/tour-locations/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete location');
  }
}

/**
 * Search tour locations with filters
 */
export async function searchTourLocations(options: {
  query?: string;
  tourPackageId?: string;
  type?: string;
  island?: string;
  skillLevel?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}): Promise<{ locations: TourLocation[]; pagination: any }> {
  const response = await fetch('/api/tour-locations/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to search locations');
  }
  
  const data = await response.json();
  return {
    locations: data.data,
    pagination: data.pagination,
  };
}

/**
 * Fetch SEO metadata for a location
 */
export async function fetchLocationSEO(id: string): Promise<any> {
  const response = await fetch(`/api/tour-locations/${id}/seo`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch SEO data');
  }
  
  const data = await response.json();
  return data.data;
}

/**
 * Fetch map data for a tour package
 */
export async function fetchTourLocationsMapData(tourPackageId: string): Promise<any> {
  const response = await fetch(`/api/tour-packages/${tourPackageId}/locations-map`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch map data');
  }
  
  const data = await response.json();
  return data.data;
}

/**
 * Approve or reject a location (admin only)
 */
export async function approveTourLocation(id: string, approve: boolean, notes?: string): Promise<any> {
  const response = await fetch(`/api/tour-locations/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approve, notes }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update approval status');
  }
  
  const data = await response.json();
  return data.data;
}

/**
 * Batch import locations from CSV data (admin only)
 */
export async function batchImportLocations(
  tourPackageId: string,
  locations: any[]
): Promise<any> {
  const response = await fetch('/api/tour-locations/batch-import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tourPackageId, locations }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to import locations');
  }
  
  const data = await response.json();
  return data.data;
}

/**
 * Find nearby locations
 */
export async function fetchNearbyLocations(
  id: string,
  options?: {
    radius?: number; // kilometers, default 5
    limit?: number; // default 10
  }
): Promise<{ locations: TourLocation[]; metadata: any }> {
  const params = new URLSearchParams();
  if (options?.radius) params.append('radius', String(options.radius));
  if (options?.limit) params.append('limit', String(options.limit));

  const response = await fetch(`/api/tour-locations/${id}/nearby?${params.toString()}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch nearby locations');
  }
  
  const data = await response.json();
  return {
    locations: data.data,
    metadata: data.metadata,
  };
}

/**
 * Fetch location by slug (public endpoint)
 */
export async function fetchTourLocationBySlug(slug: string): Promise<{ location: TourLocation; related: any[] }> {
  const response = await fetch(`/api/tour-locations/by-slug/${slug}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Location not found');
  }
  
  const data = await response.json();
  return {
    location: data.data,
    related: data.data.relatedLocations || [],
  };
}

// ============================================
// Data Formatting Functions
// ============================================

/**
 * Format duration in minutes to readable string
 */
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return 'N/A';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(latitude: number | string, longitude: number | string): string {
  const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
  const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
  
  if (isNaN(lat) || isNaN(lng)) return 'Invalid coordinates';
  
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

/**
 * Generate slug from string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Truncate description with ellipsis
 */
export function truncateDescription(text: string | null, maxLength: number = 160): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Format location type with proper casing
 */
export function formatLocationType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// ============================================
// Validation Functions
// ============================================

/**
 * Validate coordinates
 */
export function validateCoordinates(latitude: number, longitude: number): boolean {
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

/**
 * Validate location input
 */
export function validateLocationInput(input: CreateTourLocationInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.name || input.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!input.type) {
    errors.push('Type is required');
  }

  if (input.sequenceNumber === undefined || input.sequenceNumber === null) {
    errors.push('Sequence number is required');
  }

  if (!validateCoordinates(input.latitude, input.longitude)) {
    errors.push('Invalid coordinates');
  }

  if (input.description && input.description.length < 10) {
    errors.push('Description must be at least 10 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate array fields (like keywords, amenities)
 */
export function validateArrayField(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(v => typeof v === 'string' && v.trim().length > 0);
  if (typeof value === 'string') {
    return value.split(',').map(v => v.trim()).filter(v => v.length > 0);
  }
  return [];
}

// ============================================
// Parsing Functions
// ============================================

/**
 * Parse CSV data for batch import
 */
export function parseCSVData(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const data: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || '';
    });

    // Skip empty rows
    if (Object.values(row).some(v => v !== '')) {
      data.push(row);
    }
  }

  return data;
}

/**
 * Convert location data for API submission
 */
export function prepareLocationForAPI(location: Partial<TourLocation>): any {
  return {
    ...location,
    keywords: Array.isArray(location.keywords) ? location.keywords : validateArrayField(location.keywords),
    seoTags: Array.isArray(location.seoTags) ? location.seoTags : validateArrayField(location.seoTags),
    highlights: Array.isArray(location.highlights) ? location.highlights : validateArrayField(location.highlights),
    amenities: Array.isArray(location.amenities) ? location.amenities : validateArrayField(location.amenities),
    funFacts: Array.isArray(location.funFacts) ? location.funFacts : validateArrayField(location.funFacts),
    tipsFacts: Array.isArray(location.tipsFacts) ? location.tipsFacts : validateArrayField(location.tipsFacts),
    gallery: Array.isArray(location.gallery) ? location.gallery : validateArrayField(location.gallery),
  };
}

// ============================================
// Distance Calculation
// ============================================

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number | string,
  lon1: number | string,
  lat2: number | string,
  lon2: number | string
): number {
  const latitude1 = typeof lat1 === 'string' ? parseFloat(lat1) : lat1;
  const longitude1 = typeof lon1 === 'string' ? parseFloat(lon1) : lon1;
  const latitude2 = typeof lat2 === 'string' ? parseFloat(lat2) : lat2;
  const longitude2 = typeof lon2 === 'string' ? parseFloat(lon2) : lon2;

  if (isNaN(latitude1) || isNaN(longitude1) || isNaN(latitude2) || isNaN(longitude2)) {
    return 0;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = (latitude2 - latitude1) * (Math.PI / 180);
  const dLon = (longitude2 - longitude1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(latitude1 * (Math.PI / 180)) *
      Math.cos(latitude2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
