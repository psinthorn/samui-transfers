// Tour Package helper functions for API calls

export interface TourLocationData {
  id?: string;
  name: string;
  slug?: string;
  type: string;
  sequenceNumber: number;
  latitude: number;
  longitude: number;
  island?: string;
  address?: string;
  durationMinutes?: number;
  arrivalTime?: string;
  departureTime?: string;
  activity?: string;
  activityDuration?: number;
  title?: string;
  description?: string;
  shortDescription?: string;
  imageUrl?: string;
  imageAlt?: string;
  amenities?: string[];
  highlights?: string[] | string; // Can be array from form or JSON string from DB
  notes?: string;
}

interface TourPackageCreateInput {
  name: string;
  slug: string;
  description?: string;
  summary?: string;
  tourType: string;
  duration: number;
  durationDays?: number;
  minGroupSize?: number;
  maxGroupSize: number;
  defaultGroupSize?: number;
  islandsCovered?: string[];
  departureLocation: string;
  returnLocation?: string;
  availableDays?: string[];
  departureTime: string;
  returnTime: string;
  seasonalAvailability?: boolean;
  seasonStart?: number;
  seasonEnd?: number;
  offSeasonAvailable?: boolean;
  includedServices?: string[];
  excludedServices?: string;
  imageUrl?: string;
  gallery?: string;
  isPublished?: boolean;
  isActive?: boolean;
  locations?: TourLocationData[];
}

interface TourPackageUpdateInput extends Partial<TourPackageCreateInput> {}

interface FetchOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  tourType?: string;
}

/**
 * Fetch tour packages with filters and pagination
 */
export async function fetchTourPackages(options: FetchOptions = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = 'all',
    tourType = '',
  } = options;

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search) params.append('search', search);
  if (status !== 'all') params.append('status', status);
  if (tourType) params.append('tourType', tourType);

  const response = await fetch(`/api/admin/tour-packages?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tour packages');
  }

  return response.json();
}

/**
 * Fetch single tour package by ID
 */
export async function fetchTourPackage(id: string) {
  const response = await fetch(`/api/admin/tour-packages/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tour package');
  }

  return response.json();
}

/**
 * Create a new tour package
 */
export async function createTourPackage(data: TourPackageCreateInput) {
  const response = await fetch('/api/admin/tour-packages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create tour package');
  }

  return response.json();
}

/**
 * Update an existing tour package
 */
export async function updateTourPackage(
  id: string,
  data: TourPackageUpdateInput
) {
  try {
    const response = await fetch(`/api/admin/tour-packages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        error,
        data,
      });
      throw new Error(error.error || 'Failed to update tour package');
    }

    return response.json();
  } catch (error) {
    console.error('Error in updateTourPackage:', error);
    throw error;
  }
}

/**
 * Delete a tour package
 */
export async function deleteTourPackage(id: string) {
  const response = await fetch(`/api/admin/tour-packages/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete tour package');
  }

  return response.json();
}

/**
 * Publish/unpublish a tour package
 */
export async function togglePublishTourPackage(id: string, isPublished: boolean) {
  return updateTourPackage(id, { isPublished });
}

/**
 * Activate/deactivate a tour package
 */
export async function toggleActiveTourPackage(id: string, isActive: boolean) {
  return updateTourPackage(id, { isActive });
}

/**
 * Generate slug from name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Tour type options
 */
export const TOUR_TYPES = [
  { value: 'ISLAND_HOPPING', label: 'Island Hopping' },
  { value: 'CULTURAL', label: 'Cultural Tour' },
  { value: 'ADVENTURE', label: 'Adventure' },
  { value: 'LUXURY', label: 'Luxury Tour' },
  { value: 'THEMED', label: 'Themed Tour' },
];

/**
 * Service options
 */
export const SERVICE_OPTIONS = [
  { value: 'MEALS', label: 'Meals Included' },
  { value: 'GUIDE', label: 'Professional Guide' },
  { value: 'TRANSPORTATION', label: 'Transportation' },
  { value: 'SNORKEL_GEAR', label: 'Snorkel Gear' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'ACTIVITIES', label: 'Activities' },
  { value: 'ACCOMMODATION', label: 'Accommodation' },
];

/**
 * Island options
 */
export const ISLANDS = [
  { value: 'Koh Samui', label: 'Koh Samui' },
  { value: 'Koh Phangan', label: 'Koh Phangan' },
  { value: 'Koh Tao', label: 'Koh Tao' },
  { value: 'Koh Matsum', label: 'Koh Matsum' },
  { value: 'Ang Thong', label: 'Ang Thong' },
];

/**
 * Available days
 */
export const AVAILABLE_DAYS = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' },
  { value: 'DAILY', label: 'Daily' },
];

/**
 * Quick update tour package (tour type, included/excluded services only)
 */
export async function quickUpdateTourPackage(
  id: string,
  data: {
    tourType?: string;
    includedServices?: string[];
    excludedServices?: string[];
  }
) {
  try {
    const response = await fetch(`/api/admin/tour-packages/${id}/quick-update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update tour package');
    }

    return response.json();
  } catch (error) {
    console.error('Quick update error:', error);
    throw error;
  }
}
