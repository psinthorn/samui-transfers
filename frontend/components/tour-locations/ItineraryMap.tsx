'use client';

import { useState, useEffect, useRef } from 'react';
import { TourLocation } from '@/types/tour-location';

interface ItineraryMapProps {
  locations: TourLocation[];
  highlightedIndex?: number;
  onLocationClick?: (index: number, location: TourLocation) => void;
  height?: string;
}

export default function ItineraryMap({
  locations,
  highlightedIndex = -1,
  onLocationClick,
  height = 'h-96',
}: ItineraryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Calculate bounds for all locations
  const calculateBounds = () => {
    if (!locations.length) return null;

    const validLocations = locations.filter((loc) => loc.latitude && loc.longitude);
    if (!validLocations.length) return null;

    const lats = validLocations.map((loc) => loc.latitude!);
    const lons = validLocations.map((loc) => loc.longitude!);

    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLon: Math.min(...lons),
      maxLon: Math.max(...lons),
    };
  };

  // Format GPS coordinates for display
  const formatGPS = (lat: number | null, lon: number | null) => {
    if (!lat || !lon) return 'N/A';
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      if (mapContainer.current && locations.length > 0) {
        setMapReady(true);
        setIsLoading(false);
      } else if (locations.length === 0) {
        setError('No locations to display on map');
        setIsLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [locations]);

  const bounds = calculateBounds();
  const validLocations = locations.filter((loc) => loc.latitude && loc.longitude);

  if (isLoading) {
    return (
      <div className={`${height} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error || !bounds) {
    return (
      <div className={`${height} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <svg
            className="mx-auto h-10 w-10 text-gray-400 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 003 16.382V5.618a1 1 0 011.553-.894L9 7.882m0 0l6-3.6m-6 3.6v13.882m6-13.882l5.447-2.724A1 1 0 0021 5.618v10.764a1 1 0 01-1.553.894L15 12.118m0 0l-6 3.6m6-3.6v-3.6"
            />
          </svg>
          <p className="font-medium">Map Not Available</p>
          <p className="text-sm text-gray-400 mt-1">{error || 'Missing GPS coordinates'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div ref={mapContainer} className={`${height} bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden border border-gray-200 relative`}>
        {mapReady && (
          <>
            {/* Map Header */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/30 to-transparent p-4 z-10">
              <h3 className="text-white font-semibold">Route Map ({validLocations.length} stops)</h3>
            </div>

            {/* Simple Map Visualization */}
            <svg className="w-full h-full" viewBox={`0 0 400 300`}>
              {/* Grid background */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="400" height="300" fill="url(#grid)" />

              {/* Map bounds indicator */}
              <rect
                x="20"
                y="20"
                width="360"
                height="260"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="5,5"
              />

              {/* Routes between locations */}
              {validLocations.length > 1 &&
                validLocations.map((loc, idx) => {
                  if (idx === validLocations.length - 1) return null;

                  const nextLoc = validLocations[idx + 1];
                  const latRange = bounds.maxLat - bounds.minLat;
                  const lonRange = bounds.maxLon - bounds.minLon;

                  const x1 = 20 + ((loc.longitude! - bounds.minLon) / lonRange) * 360;
                  const y1 = 280 - ((loc.latitude! - bounds.minLat) / latRange) * 260;
                  const x2 = 20 + ((nextLoc.longitude! - bounds.minLon) / lonRange) * 360;
                  const y2 = 280 - ((nextLoc.latitude! - bounds.minLat) / latRange) * 260;

                  return (
                    <g key={`route-${idx}`}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#93c5fd"
                        strokeWidth="2"
                        opacity="0.6"
                      />
                      {/* Arrow marker */}
                      <circle
                        cx={(x1 + x2) / 2}
                        cy={(y1 + y2) / 2}
                        r="3"
                        fill="#60a5fa"
                      />
                    </g>
                  );
                })}

              {/* Location markers */}
              {validLocations.map((loc, idx) => {
                const latRange = bounds.maxLat - bounds.minLat;
                const lonRange = bounds.maxLon - bounds.minLon;

                const x = 20 + ((loc.longitude! - bounds.minLon) / lonRange) * 360;
                const y = 280 - ((loc.latitude! - bounds.minLat) / latRange) * 260;
                const isHighlighted = highlightedIndex === idx;

                return (
                  <g
                    key={`marker-${idx}`}
                    onClick={() => onLocationClick?.(idx, loc)}
                    className="cursor-pointer"
                  >
                    {/* Glow effect */}
                    {isHighlighted && (
                      <circle
                        cx={x}
                        cy={y}
                        r="18"
                        fill="#3b82f6"
                        opacity="0.1"
                      />
                    )}

                    {/* Marker circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill={isHighlighted ? '#3b82f6' : '#10b981'}
                      stroke="white"
                      strokeWidth="2"
                    />

                    {/* Sequence number */}
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="font-bold text-xs"
                      fill="white"
                      pointerEvents="none"
                    >
                      {idx + 1}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-3 flex gap-4 text-white text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Location</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span>Highlighted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-300" />
                <span>Route</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Location List with Details */}
      {validLocations.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Itinerary Details</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {validLocations.map((loc, idx) => {
              const isHighlighted = highlightedIndex === idx;
              const nextLoc = idx < validLocations.length - 1 ? validLocations[idx + 1] : null;
              const distance = nextLoc
                ? calculateDistance(loc.latitude!, loc.longitude!, nextLoc.latitude!, nextLoc.longitude!)
                : null;

              return (
                <button
                  key={idx}
                  onClick={() => onLocationClick?.(idx, loc)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    isHighlighted
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Sequence number */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>

                    {/* Location info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{loc.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        📍 {formatGPS(loc.latitude, loc.longitude)}
                      </p>
                      {loc.durationMinutes && (
                        <p className="text-xs text-gray-600 mt-1">
                          ⏱️ Duration: {loc.durationMinutes} min
                        </p>
                      )}
                    </div>

                    {/* Distance to next */}
                    {distance && (
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs font-medium text-blue-600">
                          {distance} km
                        </p>
                        <p className="text-xs text-gray-500">to next</p>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No GPS Data Warning */}
      {locations.length > 0 && validLocations.length < locations.length && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            ⚠️ {locations.length - validLocations.length} location(s) missing GPS coordinates
          </p>
        </div>
      )}
    </div>
  );
}
