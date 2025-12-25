import { useState, useCallback } from 'react';

export interface TourLocationData {
  id?: string;
  name: string;
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
  gallery?: any[];
  keywords?: string[];
  seoTags?: string[];
  metaDescription?: string;
  highlights?: string[];
  bestTimeToVisit?: string;
  skillLevel?: string;
  funFacts?: string[];
  tipsFacts?: string[];
  wheelchairAccessible?: boolean;
  parkingAvailable?: boolean;
  toiletsAvailable?: boolean;
  amenities?: string[];
  notes?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  visibility?: string;
  contentApproved?: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

export interface TourLocationFormErrors {
  name?: string;
  type?: string;
  sequenceNumber?: string;
  latitude?: string;
  longitude?: string;
  [key: string]: string | undefined;
}

export interface UseTourLocationFormReturn {
  locations: TourLocationData[];
  addLocation: (location: TourLocationData) => void;
  updateLocation: (id: string | undefined, location: TourLocationData) => void;
  deleteLocation: (id: string | undefined) => void;
  reorderLocation: (fromIndex: number, toIndex: number) => void;
  clearLocations: () => void;
  setLocations: (locations: TourLocationData[]) => void;
  validateLocation: (location: TourLocationData) => TourLocationFormErrors;
  errors: TourLocationFormErrors;
}

export function useTourLocationForm(initialLocations: TourLocationData[] = []): UseTourLocationFormReturn {
  const [locations, setLocations] = useState<TourLocationData[]>(initialLocations);
  const [errors, setErrors] = useState<TourLocationFormErrors>({});

  const validateLocation = useCallback((location: TourLocationData): TourLocationFormErrors => {
    const newErrors: TourLocationFormErrors = {};

    // Validate name
    if (!location.name || !location.name.trim()) {
      newErrors.name = 'Location name is required';
    }

    // Validate type
    if (!location.type || !location.type.trim()) {
      newErrors.type = 'Location type is required';
    }

    // Validate sequence number
    if (location.sequenceNumber < 1) {
      newErrors.sequenceNumber = 'Sequence number must be at least 1';
    }

    // Validate coordinates if provided
    if (location.latitude && (location.latitude < -90 || location.latitude > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    if (location.longitude && (location.longitude < -180 || location.longitude > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    return newErrors;
  }, []);

  const addLocation = useCallback((location: TourLocationData) => {
    const validation = validateLocation(location);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    const newLocation: TourLocationData = {
      ...location,
      id: location.id || `location-${Date.now()}`,
      sequenceNumber: location.sequenceNumber || locations.length + 1,
    };

    setLocations(prev => [...prev, newLocation]);
    setErrors({});
  }, [locations.length, validateLocation]);

  const updateLocation = useCallback((id: string | undefined, updatedLocation: TourLocationData) => {
    if (!id) return;

    const validation = validateLocation(updatedLocation);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setLocations(prev =>
      prev.map(loc => (loc.id === id ? { ...updatedLocation, id } : loc))
    );
    setErrors({});
  }, [validateLocation]);

  const deleteLocation = useCallback((id: string | undefined) => {
    if (!id) return;

    setLocations(prev => {
      const filtered = prev.filter(loc => loc.id !== id);
      // Reorder sequence numbers
      return filtered.map((loc, idx) => ({
        ...loc,
        sequenceNumber: idx + 1,
      }));
    });
    setErrors({});
  }, []);

  const reorderLocation = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || fromIndex >= locations.length || toIndex < 0 || toIndex >= locations.length) {
      return;
    }

    setLocations(prev => {
      const newLocations = [...prev];
      const [movedItem] = newLocations.splice(fromIndex, 1);
      newLocations.splice(toIndex, 0, movedItem);

      // Update sequence numbers
      return newLocations.map((loc, idx) => ({
        ...loc,
        sequenceNumber: idx + 1,
      }));
    });
  }, [locations.length]);

  const clearLocations = useCallback(() => {
    setLocations([]);
    setErrors({});
  }, []);

  const setLocationsData = useCallback((newLocations: TourLocationData[]) => {
    setLocations(newLocations);
  }, []);

  return {
    locations,
    addLocation,
    updateLocation,
    deleteLocation,
    reorderLocation,
    clearLocations,
    setLocations: setLocationsData,
    validateLocation,
    errors,
  };
}
