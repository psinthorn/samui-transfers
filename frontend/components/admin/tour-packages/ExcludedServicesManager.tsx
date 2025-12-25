'use client';

import { useState, useEffect } from 'react';
import { AVAILABLE_SERVICES } from '@/hooks/useTourTypeAndServicesManagement';

interface ExcludedServicesManagerProps {
  excludedServices: string[];
  onAddExcludedService: (service: string) => void;
  onRemoveExcludedService: (service: string) => void;
  onClearExcludedServices: () => void;
}

export default function ExcludedServicesManager({
  excludedServices,
  onAddExcludedService,
  onRemoveExcludedService,
  onClearExcludedServices,
}: ExcludedServicesManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Debug: Log when excludedServices changes
  useEffect(() => {
    console.log('Excluded Services Updated:', excludedServices, 'Count:', excludedServices.length);
  }, [excludedServices]);

  const serviceIcons: Record<string, string> = {
    MEALS: '🍽️',
    GUIDE: '👨‍🏫',
    TRANSPORTATION: '🚌',
    SNORKEL_GEAR: '🤿',
    INSURANCE: '🛡️',
    HOTEL_PICKUP: '🚐',
    EQUIPMENT_RENTAL: '⛺',
    PHOTOSHOOT: '📸',
    ALCOHOL: '🍷',
    KIDS_ACTIVITIES: '🎨',
    UNDERWATER_CAMERA: '📷',
    LUNCH: '🥗',
    BREAKFAST: '🥞',
    DINNER: '🍲',
    WATER_BOTTLE: '💧',
    SUNSCREEN: '☀️',
  };

  const serviceDescriptions: Record<string, string> = {
    MEALS: 'Lunch and refreshments included',
    GUIDE: 'Professional tour guide provided',
    TRANSPORTATION: 'Round-trip transportation',
    SNORKEL_GEAR: 'Snorkeling equipment',
    INSURANCE: 'Trip insurance coverage',
    HOTEL_PICKUP: 'Hotel pickup and drop-off',
    EQUIPMENT_RENTAL: 'Equipment rental services',
    PHOTOSHOOT: 'Professional photography',
    ALCOHOL: 'Alcoholic beverages',
    KIDS_ACTIVITIES: 'Children activities included',
    UNDERWATER_CAMERA: 'Underwater camera rental',
    LUNCH: 'Lunch provided',
    BREAKFAST: 'Breakfast provided',
    DINNER: 'Dinner provided',
    WATER_BOTTLE: 'Drinking water provided',
    SUNSCREEN: 'Sunscreen provided',
  };

  const filteredServices = AVAILABLE_SERVICES.filter(
    service =>
      service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceDescriptions[service]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayServices = showAll ? filteredServices : filteredServices.slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Excluded Services
        </h3>
        <span className="inline-block text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {excludedServices.length} excluded
        </span>
      </div>

      {/* Selected Excluded Services */}
      {excludedServices.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <p className="font-medium text-red-900">Services Not Included:</p>
            <button
              onClick={onClearExcludedServices}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {excludedServices.map((service) => (
              <div
                key={service}
                className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-2 rounded-full text-sm"
              >
                <span>{serviceIcons[service] || '❌'}</span>
                <span>{service.replace(/_/g, ' ')}</span>
                <button
                  type="button"
                  onClick={() => onRemoveExcludedService(service)}
                  className="ml-1 text-red-600 hover:text-red-700 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Available Services Grid */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600 font-medium">
          Click to exclude from tour:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {displayServices.map((service) => (
            <button
              type="button"
              key={service}
              onClick={() => {
                if (excludedServices.includes(service)) {
                  console.log(`Removing service: ${service}`);
                  onRemoveExcludedService(service);
                } else {
                  console.log(`Adding service: ${service}`);
                  onAddExcludedService(service);
                }
              }}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                excludedServices.includes(service)
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{serviceIcons[service] || '❌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">
                    {service.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {serviceDescriptions[service]}
                  </p>
                </div>
                {excludedServices.includes(service) && (
                  <div className="mt-0.5">
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {filteredServices.length > 6 && !showAll && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="w-full mt-2 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Show {filteredServices.length - 6} more services
          </button>
        )}

        {showAll && filteredServices.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className="w-full mt-2 py-2 text-gray-600 hover:text-gray-700 font-medium text-sm"
          >
            Show fewer services
          </button>
        )}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No services match your search</p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          <strong>💡 Tip:</strong> Mark services that are NOT included in this tour.
          Other services are considered included by default.
        </p>
      </div>
    </div>
  );
}
