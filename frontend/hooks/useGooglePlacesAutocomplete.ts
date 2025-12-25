import { useEffect, useRef, useCallback } from 'react';

export interface GooglePlace {
  name?: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  types?: string[];
  adrAddress?: string;
  formattedPhoneNumber?: string;
  website?: string;
  vicinity?: string;
  country?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

export interface AutocompleteOptions {
  componentRestrictions?: { country: string | string[] };
  types?: string[];
  bounds?: google.maps.LatLngBounds;
  fields?: string[];
  language?: string;
  region?: string;
  session?: google.maps.places.AutocompleteSessionToken;
}

interface UseGoogleAutocompleteProps {
  inputId: string;
  options?: AutocompleteOptions;
  onPlaceSelected?: (place: GooglePlace) => void;
}

export function useGooglePlacesAutocomplete({
  inputId,
  options = {},
  onPlaceSelected,
}: UseGoogleAutocompleteProps) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const isInitializedRef = useRef(false);

  // Default options for Thailand-focused searches
  const defaultOptions: AutocompleteOptions = {
    componentRestrictions: { country: 'th' },
    types: ['point_of_interest', 'establishment', 'premise'],
    language: 'en',
    ...options,
  };

  const initAutocomplete = useCallback(() => {
    if (typeof window === 'undefined' || !window.google || isInitializedRef.current) {
      return;
    }

    const input = document.getElementById(inputId) as HTMLInputElement;
    if (!input) {
      console.warn(`Input element with id "${inputId}" not found`);
      return;
    }

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(input, {
        componentRestrictions: defaultOptions.componentRestrictions as any,
        types: defaultOptions.types,
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (!place) return;

        const placeData: GooglePlace = {
          name: place.name,
          formattedAddress: place.formatted_address,
          latitude: place.geometry?.location?.lat(),
          longitude: place.geometry?.location?.lng(),
          placeId: place.place_id,
          types: place.types,
          adrAddress: place.adr_address,
          formattedPhoneNumber: place.formatted_phone_number,
          website: place.website,
          vicinity: place.vicinity,
        };

        // Parse address components
        if (place.address_components) {
          place.address_components.forEach(component => {
            if (component.types.includes('country')) {
              placeData.country = component.long_name;
            }
            if (component.types.includes('administrative_area_level_1')) {
              placeData.province = component.long_name;
            }
            if (component.types.includes('locality')) {
              placeData.city = component.long_name;
            }
            if (component.types.includes('postal_code')) {
              placeData.postalCode = component.short_name;
            }
          });
        }

        if (onPlaceSelected) {
          onPlaceSelected(placeData);
        }
      });

      isInitializedRef.current = true;
    } catch (error) {
      console.error('Failed to initialize Google Places Autocomplete:', error);
    }
  }, [inputId, defaultOptions, onPlaceSelected]);

  const clearInput = useCallback(() => {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }, [inputId]);

  const setInputValue = useCallback((value: string) => {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.value = value;
    }
  }, [inputId]);

  const getPlacePredictions = useCallback(
    async (input: string): Promise<any[]> => {
      return new Promise((resolve, reject) => {
        if (!window.google || !autocompleteRef.current) {
          reject(new Error('Google Places API not loaded'));
          return;
        }

        const service = new window.google.maps.places.PlacesService(
          document.createElement('div')
        );

        const request = {
          input,
          componentRestrictions: defaultOptions.componentRestrictions as any,
        };

        // Note: This requires the PlacesService, which is different from Autocomplete
        // For now, we'll just resolve with empty array as we're using Autocomplete directly
        resolve([]);
      });
    },
    [defaultOptions]
  );

  useEffect(() => {
    initAutocomplete();

    return () => {
      // Cleanup if needed
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [initAutocomplete]);

  return {
    autocompleteRef,
    clearInput,
    setInputValue,
    getPlacePredictions,
  };
}

/**
 * Utility function to format Google Place data into tour location format
 */
export function formatGooglePlaceToLocation(place: GooglePlace) {
  return {
    name: place.name || '',
    address: place.formattedAddress || '',
    latitude: place.latitude || 0,
    longitude: place.longitude || 0,
    city: place.city || '',
    postalCode: place.postalCode || '',
    country: place.country || 'Thailand',
  };
}

/**
 * Utility to calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Utility to validate location coordinates for Thailand
 */
export function isValidThailandCoordinates(latitude: number, longitude: number): boolean {
  // Thailand approximate boundaries
  const THAILAND_BOUNDS = {
    minLat: 5.613,
    maxLat: 20.4641,
    minLon: 97.345,
    maxLon: 105.6372,
  };

  return (
    latitude >= THAILAND_BOUNDS.minLat &&
    latitude <= THAILAND_BOUNDS.maxLat &&
    longitude >= THAILAND_BOUNDS.minLon &&
    longitude <= THAILAND_BOUNDS.maxLon
  );
}
