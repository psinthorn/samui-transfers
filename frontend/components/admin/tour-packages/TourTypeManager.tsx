'use client';

import { useState } from 'react';
import { TOUR_TYPES } from '@/hooks/useTourTypeAndServicesManagement';

interface TourTypeManagerProps {
  selectedTourType: string;
  onSelectTourType: (type: string) => void;
}

export default function TourTypeManager({
  selectedTourType,
  onSelectTourType,
}: TourTypeManagerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const tourTypeDescriptions: Record<string, string> = {
    ISLAND_HOPPING: 'Visit multiple islands in one day with water activities and snorkeling',
    CULTURAL: 'Experience local temples, traditions, and historical sites',
    ADVENTURE: 'Exciting activities like hiking, rock climbing, zip-lining, and water sports',
    LUXURY: 'Premium experience with fine dining, exclusive access, and personalized service',
    THEMED: 'Special interest tours like photography, wildlife, food, or wellness',
  };

  const tourTypeIcons: Record<string, string> = {
    ISLAND_HOPPING: '🏝️',
    CULTURAL: '🏛️',
    ADVENTURE: '🧗',
    LUXURY: '✨',
    THEMED: '🎯',
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Tour Type</h3>
        <span className="text-sm text-gray-500">Select one</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {TOUR_TYPES.map((tourType) => (
          <div
            key={tourType}
            onClick={() => {
              onSelectTourType(tourType);
              setExpandedId(expandedId === tourType ? null : tourType);
            }}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedTourType === tourType
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tourTypeIcons[tourType]}</span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {tourType.replace(/_/g, ' ')}
                    </p>
                    {expandedId === tourType && (
                      <p className="text-sm text-gray-600 mt-1">
                        {tourTypeDescriptions[tourType]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {selectedTourType === tourType && (
                <div className="ml-2 mt-1">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedTourType && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Selected:</strong> {selectedTourType.replace(/_/g, ' ')}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {tourTypeDescriptions[selectedTourType]}
          </p>
        </div>
      )}
    </div>
  );
}
