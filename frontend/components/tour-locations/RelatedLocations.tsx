'use client';

import { useState, useEffect } from 'react';
import TourLocationCard from '@/components/tour-locations/TourLocationCard';
import { TourLocation } from '@/types/tour-location';

interface RelatedLocationsProps {
  currentLocationId: string;
  limit?: number;
  title?: string;
}

export default function RelatedLocations({
  currentLocationId,
  limit = 3,
  title = 'Related Locations',
}: RelatedLocationsProps) {
  const [locations, setLocations] = useState<TourLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedLocations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/tour-locations/${currentLocationId}/nearby?limit=${limit}`
        );

        if (!response.ok) {
          throw new Error('Failed to load related locations');
        }

        const data = await response.json();
        setLocations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load locations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedLocations();
  }, [currentLocationId, limit]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || locations.length === 0) {
    return null; // Don't show section if no locations
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <TourLocationCard
            key={location.id}
            location={location}
            showApprovalBadge={false}
          />
        ))}
      </div>
    </div>
  );
}
