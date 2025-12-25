'use client';

import { useState } from 'react';
import { TOUR_TYPES } from '@/hooks/useTourTypeAndServicesManagement';

interface TourTypeDropdownProps {
  selectedTourType: string;
  onSelectTourType: (type: string) => void;
  showViewExamples?: boolean;
}

export default function TourTypeDropdown({
  selectedTourType,
  onSelectTourType,
  showViewExamples = true,
}: TourTypeDropdownProps) {
  const [showExamples, setShowExamples] = useState(false);

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

  const getDisplayLabel = (type: string) => {
    const icon = tourTypeIcons[type];
    const label = type.replace(/_/g, ' ');
    return `${icon} ${label}`;
  };

  return (
    <div className="space-y-3">
      {/* Dropdown Container */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          Tour Type
        </label>
        
        <select
          value={selectedTourType || ''}
          onChange={(e) => onSelectTourType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
        >
          <option value="">Select a tour type...</option>
          {TOUR_TYPES.map((tourType) => (
            <option key={tourType} value={tourType}>
              {getDisplayLabel(tourType)}
            </option>
          ))}
        </select>
      </div>

      {/* Description for selected type */}
      {selectedTourType && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-900 font-medium">
            {selectedTourType.replace(/_/g, ' ')}
          </p>
          <p className="text-xs text-blue-700 mt-1">
            {tourTypeDescriptions[selectedTourType]}
          </p>
        </div>
      )}

      {/* View Examples Button */}
      {showViewExamples && (
        <button
          type="button"
          onClick={() => setShowExamples(!showExamples)}
          className="w-full px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200 flex items-center justify-center gap-2"
        >
          <span className="text-lg">📖</span>
          {showExamples ? 'Hide Examples' : 'View Examples'}
        </button>
      )}

      {/* Expandable Examples Section */}
      {showViewExamples && showExamples && (
        <div className="space-y-2 pt-3 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-600 px-1">All tour types:</p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {TOUR_TYPES.map((tourType) => (
              <div
                key={tourType}
                onClick={() => onSelectTourType(tourType)}
                className={`p-3 rounded-lg cursor-pointer transition-all border ${
                  selectedTourType === tourType
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{tourTypeIcons[tourType]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">
                      {tourType.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {tourTypeDescriptions[tourType]}
                    </p>
                  </div>
                  {selectedTourType === tourType && (
                    <div className="ml-2 mt-1 flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-blue-500"
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
        </div>
      )}
    </div>
  );
}
