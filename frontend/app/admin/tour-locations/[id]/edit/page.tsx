'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchTourLocation, approveTourLocation } from '@/lib/tour-location';
import LocationForm from '@/components/admin/tour-locations/LocationForm';
import { TourLocation } from '@/types/tour-location';

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  console.log(`[${type.toUpperCase()}] ${message}`);
};

export default function EditLocationPage() {
  const params = useParams() as { id?: string } | null;
  const router = useRouter();
  const searchParams = useSearchParams() as any;
  const locationId = (params?.id || '') as string;
  const tourId = (searchParams?.get('tourId') || '') as string;

  const [location, setLocation] = useState<TourLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  useEffect(() => {
    const loadLocation = async () => {
      try {
        const data = await fetchTourLocation(locationId);
        setLocation(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load location');
        showToast('Failed to load location', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (locationId) {
      loadLocation();
    }
  }, [locationId]);

  const handleApprove = async (approve: boolean) => {
    try {
      await approveTourLocation(locationId, approve, approvalNotes);
      showToast(`Location ${approve ? 'approved' : 'rejected'} successfully`);
      // Reload location after approval
      const updated = await fetchTourLocation(locationId);
      setLocation(updated);
      setShowApprovalModal(false);
      setApprovalNotes('');
    } catch (error: any) {
      showToast(error.message || 'Failed to update approval status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-gray-600">Loading location...</p>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Edit Location</h1>
        <p className="text-red-600">{error || 'Location not found'}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ← Back
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6">{location.name}</h1>

      {/* Approval Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Approval Status</h3>
            <div className="mt-2 flex items-center gap-4">
              <span
                className={`inline-block px-3 py-1 text-sm font-semibold rounded ${
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
              {location.approvedBy && (
                <p className="text-sm text-gray-600">
                  by {location.approvedBy} on{' '}
                  {location.approvedAt
                    ? new Date(location.approvedAt).toLocaleDateString()
                    : '-'}
                </p>
              )}
            </div>
          </div>

          {location.contentApproved !== true && (
            <button
              onClick={() => setShowApprovalModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Review & Approve
            </button>
          )}
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <LocationForm
          tourPackageId={location.tourPackageId}
          initialData={location}
          isEdit={true}
          onSuccess={() => {
            router.push(`/admin/tour-locations?tourId=${location.tourPackageId}`);
          }}
        />
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold">Review Location</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add approval notes..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleApprove(true)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleApprove(false)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setApprovalNotes('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
