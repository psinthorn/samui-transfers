'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import LocationForm from '@/components/admin/tour-locations/LocationForm';

export default function CreateLocationPage() {
  const searchParams = useSearchParams() as any;
  const router = useRouter();
  const tourId = searchParams?.get('tourId') || '';

  if (!tourId) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Create Location</h1>
        <p className="text-gray-600">Tour package is required. Please go back and select one.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ← Back
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6">Create New Location</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <LocationForm
          tourPackageId={tourId}
          onSuccess={() => {
            router.push(`/admin/tour-locations?tourId=${tourId}`);
          }}
        />
      </div>
    </div>
  );
}
