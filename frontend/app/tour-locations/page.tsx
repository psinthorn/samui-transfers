'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TourLocationCard from '@/components/tour-locations/TourLocationCard';
import { TourLocation } from '@/types/tour-location';

export default function TourLocationsPage() {
  const [locations, setLocations] = useState<TourLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [islandFilter, setIslandFilter] = useState('all');
  const [islands, setIslands] = useState<string[]>([]);
  const pageSize = 12;

  // Fetch all locations initially to get unique islands
  useEffect(() => {
    const fetchAllLocations = async () => {
      try {
        const response = await fetch('/api/tour-locations?limit=1000');
        if (response.ok) {
          const data = await response.json();
          const uniqueIslands = [
            ...new Set(data.data.map((loc: TourLocation) => loc.island).filter(Boolean)),
          ].sort();
          setIslands(uniqueIslands as string[]);
        }
      } catch (err) {
        console.error('Failed to fetch islands:', err);
      }
    };

    fetchAllLocations();
  }, []);

  // Fetch filtered locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        let url = `/api/tour-locations?page=${page}&limit=${pageSize}`;

        if (searchQuery) {
          url = `/api/tour-locations/search?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=${pageSize}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to load locations');
        }

        const data = await response.json();

        // Filter in client for type and island (API doesn't support these filters yet)
        let filtered = data.data || data;
        if (typeFilter !== 'all') {
          filtered = filtered.filter((loc: TourLocation) => loc.type === typeFilter);
        }
        if (islandFilter !== 'all') {
          filtered = filtered.filter((loc: TourLocation) => loc.island === islandFilter);
        }

        setLocations(filtered);
        setTotal(data.total || filtered.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load locations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, [page, searchQuery, typeFilter, islandFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Explore Tour Locations
          </h1>
          <p className="text-gray-600">
            Discover the most beautiful and exciting destinations in Koh Samui
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Search</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search locations..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>
              </form>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Location Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="beach">Beach</option>
                  <option value="waterfall">Waterfall</option>
                  <option value="temple">Temple</option>
                  <option value="viewpoint">Viewpoint</option>
                  <option value="market">Market</option>
                  <option value="restaurant">Restaurant</option>
                </select>
              </div>

              {/* Island Filter */}
              {islands.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Island
                  </label>
                  <select
                    value={islandFilter}
                    onChange={(e) => {
                      setIslandFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Islands</option>
                    {islands.map((island) => (
                      <option key={island} value={island}>
                        {island}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reset Filters */}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setIslandFilter('all');
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Reset Filters
              </button>

              {/* Location Stats */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Found <span className="font-semibold text-gray-900">{total}</span> location{total !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(pageSize)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse" />
                ))}
              </div>
            ) : locations.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {locations.map((location) => (
                    <Link
                      key={location.id}
                      href={`/tour-locations/${location.slug}`}
                    >
                      <TourLocationCard location={location} />
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pb-8">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Previous
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                          page === i + 1
                            ? 'bg-blue-500 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No locations found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('all');
                    setIslandFilter('all');
                    setPage(1);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
