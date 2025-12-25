'use client';

import Link from 'next/link';
import { TourLocation } from '@/types/tour-location';
import { formatDuration, truncateDescription, formatLocationType } from '@/lib/tour-location';

interface LocationTableProps {
  locations: TourLocation[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  onDelete: (id: string) => void;
  onApprove?: (id: string) => void;
  onEdit?: (location: TourLocation) => void;
  onPageChange?: (page: number) => void;
}

export default function LocationTable({
  locations,
  pagination,
  onDelete,
  onApprove,
  onEdit,
  onPageChange,
}: LocationTableProps) {
  const handleDeleteClick = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Seq</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Island</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Approval</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No locations found
                </td>
              </tr>
            ) : (
              locations.map((location) => (
                <tr key={location.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {location.sequenceNumber}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{location.name}</div>
                    <div className="text-xs text-gray-500">
                      {location.slug}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatLocationType(location.type)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {location.island || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDuration(location.durationMinutes)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        location.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {location.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        location.contentApproved === true
                          ? 'bg-green-100 text-green-800'
                          : location.contentApproved === false
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {location.contentApproved === true
                        ? 'Approved'
                        : location.contentApproved === false
                          ? 'Rejected'
                          : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(location.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/tour-locations/${location.id}/edit`}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                      >
                        Edit
                      </Link>
                      {location.contentApproved !== true && onApprove && (
                        <button
                          onClick={() => onApprove(location.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(location.id, location.name)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex gap-2">
            <button
              disabled={pagination.page === 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
            >
              Previous
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => onPageChange?.(p)}
                className={`px-3 py-1 rounded ${
                  pagination.page === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={pagination.page === pagination.pages}
              onClick={() => onPageChange?.(pagination.page + 1)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
