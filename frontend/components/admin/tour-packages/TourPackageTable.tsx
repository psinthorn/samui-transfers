'use client';

import { useState, useEffect } from 'react';
import { TourPackage } from '@prisma/client';
import Link from 'next/link';
import { deleteTourPackage, togglePublishTourPackage, quickUpdateTourPackage } from '@/lib/tour-package';
import TourPackageQuickEditModal from './TourPackageQuickEditModal';

interface TourPackageTableProps {
  packages: any[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, isPublished: boolean) => void;
  onQuickEditSave?: (id: string, updatedData: any) => void;
  isLoading?: boolean;
}

export default function TourPackageTable({
  packages,
  onDelete,
  onStatusChange,
  onQuickEditSave,
  isLoading = false,
}: TourPackageTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPackage, setEditingPackage] = useState<any>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tour package?')) {
      setDeleting(id);
      try {
        await deleteTourPackage(id);
        onDelete(id);
      } catch (error) {
        console.error('Error deleting tour package:', error);
        alert('Failed to delete tour package');
      } finally {
        setDeleting(null);
      }
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await togglePublishTourPackage(id, !currentStatus);
      onStatusChange(id, !currentStatus);
    } catch (error) {
      console.error('Error updating tour package status:', error);
      alert('Failed to update tour package status');
    }
  };

  const handleOpenQuickEdit = (pkg: any) => {
    setEditingPackage(pkg);
    setEditingId(pkg.id);
  };

  const handleQuickEditSave = async (updateData: any) => {
    if (!editingId) return;
    
    try {
      const result = await quickUpdateTourPackage(editingId, updateData);
      
      console.log('Quick edit saved successfully:', result);
      
      // Call the callback to update the packages list in the parent
      if (onQuickEditSave) {
        onQuickEditSave(editingId, result.data);
      }
    } catch (error) {
      console.error('Error saving quick edit:', error);
      throw error;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading tour packages...</div>;
  }

  if (packages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tour packages found. Create one to get started!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100 border-b-2 border-gray-300">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Duration</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Group Size</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Bookings</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {packages.map((pkg) => (
            <tr key={pkg.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <Link href={`/admin/tour-packages/${pkg.id}/edit`} className="text-blue-600 hover:underline">
                  {pkg.name}
                </Link>
              </td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {pkg.tourType}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-gray-700">
                  {pkg.duration} min
                  {pkg.durationDays > 1 && ` / ${pkg.durationDays} days`}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-gray-700">
                  {pkg.minGroupSize}-{pkg.maxGroupSize}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="font-semibold text-gray-700">
                  {pkg._count?.tourBookings || 0}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTogglePublish(pkg.id, pkg.isPublished)}
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      pkg.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {pkg.isPublished ? 'Published' : 'Draft'}
                  </button>
                  {!pkg.isActive && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                      Inactive
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenQuickEdit(pkg)}
                    className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                    title="Quick edit tour type and services"
                  >
                    Quick Edit
                  </button>
                  <Link
                    href={`/admin/tour-packages/${pkg.id}/edit`}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    disabled={deleting === pkg.id}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    {deleting === pkg.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Quick Edit Modal */}
      {editingPackage && editingId && (
        <TourPackageQuickEditModal
          packageId={editingId}
          packageName={editingPackage.name}
          currentTourType={editingPackage.tourType}
          currentIncludedServices={
            typeof editingPackage.includedServices === 'string'
              ? JSON.parse(editingPackage.includedServices || '[]')
              : Array.isArray(editingPackage.includedServices) ? editingPackage.includedServices : []
          }
          currentExcludedServices={
            typeof editingPackage.excludedServices === 'string'
              ? JSON.parse(editingPackage.excludedServices || '[]')
              : Array.isArray(editingPackage.excludedServices) ? editingPackage.excludedServices : []
          }
          onClose={() => {
            setEditingId(null);
            setEditingPackage(null);
          }}
          onSave={handleQuickEditSave}
        />
      )}
    </div>
  );
}
