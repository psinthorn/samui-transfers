'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  fetchTourLocations,
  deleteTourLocation,
  approveTourLocation,
  searchTourLocations,
} from '@/lib/tour-location';
import LocationTable from '@/components/admin/tour-locations/LocationTable';
import { TourLocation } from '@/types/tour-location';

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  console.log(`[${type.toUpperCase()}] ${message}`);
};

export default function TourLocationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams() as any;
  const tourId = searchParams?.get('tourId') || '';

  const [locations, setLocations] = useState<TourLocation[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    island: '',
    status: 'all', // all, active, inactive
    approval: 'all', // all, pending, approved, rejected
  });

  // Load locations
  useEffect(() => {
    const loadLocations = async () => {
      if (!tourId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let result;

        if (filters.search) {
          // Use search endpoint when there's a search query
          result = await searchTourLocations({
            query: filters.search,
            tourPackageId: tourId,
            type: filters.type || undefined,
            island: filters.island || undefined,
            page,
            limit,
          });
        } else {
          // Use regular list endpoint
          result = await fetchTourLocations(tourId, {
            page,
            limit,
            sort: 'sequenceNumber',
          });
        }

        let filteredLocations = result.locations;

        // Apply client-side filters
        if (filters.status !== 'all') {
          filteredLocations = filteredLocations.filter(
            (loc) => (filters.status === 'active' ? loc.isActive : !loc.isActive)
          );
        }

        if (filters.approval !== 'all') {
          filteredLocations = filteredLocations.filter((loc) => {
            if (filters.approval === 'pending') return loc.contentApproved === null || loc.contentApproved === undefined;
            if (filters.approval === 'approved') return loc.contentApproved === true;
            if (filters.approval === 'rejected') return loc.contentApproved === false;
            return true;
          });
        }

        setLocations(filteredLocations);
        setPagination(result.pagination);
      } catch (error) {
        console.error('Error loading locations:', error);
        showToast('Failed to load locations', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, [tourId, page, limit, filters, filters.search]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filtering
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTourLocation(id);
      showToast('Location deleted successfully');
      setLocations((prev) => prev.filter((loc) => loc.id !== id));
    } catch (error: any) {
      showToast(error.message || 'Failed to delete location', 'error');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveTourLocation(id, true);
      showToast('Location approved');
      setLocations((prev) =>
        prev.map((loc) =>
          loc.id === id ? { ...loc, contentApproved: true } : loc
        )
      );
    } catch (error: any) {
      showToast(error.message || 'Failed to approve location', 'error');
    }
  };

  if (!tourId) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Tour Locations</h1>
        <p className="text-gray-600">Please select a tour package first.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Tour Locations</h1>
        <Link
          href={`/admin/tour-locations/create?tourId=${tourId}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + New Location
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search locations..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="WATER_ACTIVITY">Water Activity</option>
            <option value="LAND_ACTIVITY">Land Activity</option>
            <option value="CULTURAL_SITE">Cultural Site</option>
            <option value="RESTAURANT">Restaurant</option>
            <option value="ACCOMMODATION">Accommodation</option>
            <option value="SCENIC_SPOT">Scenic Spot</option>
            <option value="ADVENTURE">Adventure</option>
          </select>

          {/* Island Filter */}
          <input
            type="text"
            placeholder="Island..."
            value={filters.island}
            onChange={(e) => handleFilterChange('island', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Approval Filter */}
          <select
            value={filters.approval}
            onChange={(e) => handleFilterChange('approval', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Approvals</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Pagination Limit */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Items per page:</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value, 10));
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Loading locations...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <LocationTable
            locations={locations}
            pagination={pagination}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Import Button */}
      <div className="mt-6 flex gap-2">
        <Link
          href={`/admin/tour-locations/import?tourId=${tourId}`}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          📥 Bulk Import
        </Link>
      </div>
    </div>
  );
}
