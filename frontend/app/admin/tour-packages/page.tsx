'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchTourPackages } from '@/lib/tour-package';
import TourPackageTable from '@/components/admin/tour-packages/TourPackageTable';

export default function TourPackagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams() as any;

  const [packages, setPackages] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(parseInt(searchParams?.get('page') || '1'));
  const [limit] = useState(10);

  const [filters, setFilters] = useState({
    search: searchParams?.get('search') || '',
    status: searchParams?.get('status') || 'all',
    tourType: searchParams?.get('tourType') || '',
  });

  // Load packages
  useEffect(() => {
    const loadPackages = async () => {
      setLoading(true);
      try {
        const result = await fetchTourPackages({
          page,
          limit,
          search: filters.search,
          status: filters.status,
          tourType: filters.tourType,
        });
        setPackages(result.data);
        setPagination(result.pagination);
      } catch (error) {
        console.error('Error loading tour packages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
  }, [page, filters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    setPage(1);
  };

  const handleSearch = (value: string) => {
    handleFilterChange('search', value);
  };

  const handleDelete = (id: string) => {
    setPackages(prev => prev.filter(p => p.id !== id));
  };

  const handleStatusChange = (id: string, isPublished: boolean) => {
    setPackages(prev =>
      prev.map(p =>
        p.id === id ? { ...p, isPublished } : p
      )
    );
  };

  const handleQuickEditSave = (id: string, updatedData: any) => {
    setPackages(prev =>
      prev.map(p =>
        p.id === id ? { ...p, ...updatedData } : p
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tour Packages</h1>
        <Link
          href="/admin/tour-packages/create"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
        >
          + Create New Package
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Tour Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tour Type
            </label>
            <select
              value={filters.tourType}
              onChange={(e) => handleFilterChange('tourType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="ISLAND_HOPPING">Island Hopping</option>
              <option value="CULTURAL">Cultural Tour</option>
              <option value="ADVENTURE">Adventure</option>
              <option value="LUXURY">Luxury Tour</option>
              <option value="THEMED">Themed Tour</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <TourPackageTable
          packages={packages}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onQuickEditSave={handleQuickEditSave}
          isLoading={loading}
        />
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(p => Math.abs(p - page) <= 1 || p === 1 || p === pagination.totalPages)
              .map((p, i, arr) => (
                <div key={p}>
                  {i > 0 && arr[i - 1] !== p - 1 && <span className="px-2">...</span>}
                  <button
                    onClick={() => setPage(p)}
                    className={`px-3 py-2 rounded-md ${
                      page === p
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                </div>
              ))}

            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page === pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
