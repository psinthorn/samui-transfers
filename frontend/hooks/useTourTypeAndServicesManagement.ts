import { useState, useCallback } from 'react';

// Predefined tour types
export const TOUR_TYPES = [
  'ISLAND_HOPPING',
  'CULTURAL',
  'ADVENTURE',
  'LUXURY',
  'THEMED',
];

// Predefined services
export const AVAILABLE_SERVICES = [
  'MEALS',
  'GUIDE',
  'TRANSPORTATION',
  'SNORKEL_GEAR',
  'INSURANCE',
  'HOTEL_PICKUP',
  'EQUIPMENT_RENTAL',
  'PHOTOSHOOT',
  'ALCOHOL',
  'KIDS_ACTIVITIES',
  'UNDERWATER_CAMERA',
  'LUNCH',
  'BREAKFAST',
  'DINNER',
  'WATER_BOTTLE',
  'SUNSCREEN',
];

export interface TourTypeManagement {
  tourType: string;
  displayName: string;
  description?: string;
  icon?: string;
}

export interface ServiceManagement {
  serviceId: string;
  name: string;
  displayName: string;
  category?: string;
  description?: string;
}

export interface UseTourTypeAndServicesReturn {
  // Tour Type Management
  tourTypes: string[];
  selectedTourType: string;
  setSelectedTourType: (type: string) => void;
  addTourType: (type: string) => void;
  removeTourType: (type: string) => void;
  
  // Excluded Services Management
  excludedServices: string[];
  addExcludedService: (service: string) => void;
  removeExcludedService: (service: string) => void;
  clearExcludedServices: () => void;
  isServiceExcluded: (service: string) => boolean;
  
  // Bulk Operations
  setExcludedServices: (services: string[]) => void;
}

export function useTourTypeAndServicesManagement(
  initialTourType: string = '',
  initialExcludedServices: string[] = []
): UseTourTypeAndServicesReturn {
  const [tourTypes] = useState<string[]>(TOUR_TYPES);
  const [selectedTourType, setSelectedTourType] = useState(initialTourType);
  const [excludedServices, setExcludedServicesState] = useState<string[]>(initialExcludedServices);

  const addTourType = useCallback((type: string) => {
    if (!tourTypes.includes(type)) {
      // Note: In a real app, you might want to add this to a database
      console.log('Tour type would be added:', type);
    }
  }, [tourTypes]);

  const removeTourType = useCallback((type: string) => {
    if (selectedTourType === type) {
      setSelectedTourType('');
    }
    // Note: In a real app, you'd delete from database
    console.log('Tour type would be removed:', type);
  }, [selectedTourType]);

  const addExcludedService = useCallback((service: string) => {
    setExcludedServicesState(prev => {
      if (prev.includes(service)) return prev;
      return [...prev, service];
    });
  }, []);

  const removeExcludedService = useCallback((service: string) => {
    setExcludedServicesState(prev => prev.filter(s => s !== service));
  }, []);

  const clearExcludedServices = useCallback(() => {
    setExcludedServicesState([]);
  }, []);

  const isServiceExcluded = useCallback((service: string) => {
    return excludedServices.includes(service);
  }, [excludedServices]);

  const setExcludedServices = useCallback((services: string[]) => {
    setExcludedServicesState(services);
  }, []);

  return {
    // Tour Type Management
    tourTypes,
    selectedTourType,
    setSelectedTourType,
    addTourType,
    removeTourType,
    
    // Excluded Services Management
    excludedServices,
    addExcludedService,
    removeExcludedService,
    clearExcludedServices,
    isServiceExcluded,
    setExcludedServices,
  };
}
