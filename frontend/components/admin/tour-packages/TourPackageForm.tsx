'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createTourPackage, updateTourPackage, generateSlug, TOUR_TYPES, SERVICE_OPTIONS, ISLANDS, AVAILABLE_DAYS } from '@/lib/tour-package';
import TourLocationForm from './TourLocationForm';
import TourTypeManager from './TourTypeManager';
import TourTypeDropdown from './TourTypeDropdown';
import ExcludedServicesManager from './ExcludedServicesManager';
import { useTourTypeAndServicesManagement } from '@/hooks/useTourTypeAndServicesManagement';

interface TourLocationData {
  id?: string;
  name: string;
  type: string;
  sequenceNumber: number;
  latitude: number;
  longitude: number;
  island?: string;
  address?: string;
  durationMinutes?: number;
  activity?: string;
  description?: string;
  imageUrl?: string;
  highlights?: string[];
  amenities?: string[];
}

interface TourPackageFormProps {
  initialData?: any;
  onSuccess?: (data: any) => void;
}

export default function TourPackageForm({
  initialData,
  onSuccess,
}: TourPackageFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Parse excluded services from JSON string if needed
  let parsedExcludedServices: string[] = [];
  if (initialData?.excludedServices) {
    try {
      if (typeof initialData.excludedServices === 'string') {
        parsedExcludedServices = JSON.parse(initialData.excludedServices);
      } else if (Array.isArray(initialData.excludedServices)) {
        parsedExcludedServices = initialData.excludedServices;
      }
    } catch (e) {
      parsedExcludedServices = [];
    }
  }

  const {
    selectedTourType,
    setSelectedTourType,
    excludedServices,
    addExcludedService,
    removeExcludedService,
    clearExcludedServices,
    setExcludedServices,
  } = useTourTypeAndServicesManagement(
    initialData?.tourType || '',
    parsedExcludedServices
  );

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    summary: initialData?.summary || '',
    tourType: initialData?.tourType || 'ISLAND_HOPPING',
    duration: initialData?.duration || 480,
    durationDays: initialData?.durationDays || 1,
    minGroupSize: initialData?.minGroupSize || 1,
    maxGroupSize: initialData?.maxGroupSize || 20,
    defaultGroupSize: initialData?.defaultGroupSize || 10,
    islandsCovered: initialData?.islandsCovered || [],
    departureLocation: initialData?.departureLocation || '',
    returnLocation: initialData?.returnLocation || '',
    availableDays: initialData?.availableDays || ['DAILY'],
    departureTime: initialData?.departureTime || '08:00',
    returnTime: initialData?.returnTime || '17:00',
    seasonalAvailability: initialData?.seasonalAvailability ?? true,
    seasonStart: initialData?.seasonStart || null,
    seasonEnd: initialData?.seasonEnd || null,
    offSeasonAvailable: initialData?.offSeasonAvailable ?? false,
    includedServices: initialData?.includedServices || [],
    excludedServices: initialData?.excludedServices || '[]',
    imageUrl: initialData?.imageUrl || '',
    gallery: initialData?.gallery || '[]',
    isPublished: initialData?.isPublished ?? true,
    isActive: initialData?.isActive ?? true,
  });

  const [locations, setLocations] = useState<TourLocationData[]>(
    initialData?.locations || []
  );

  // Update tourType in formData when selectedTourType changes (only on form load)
  useEffect(() => {
    if (selectedTourType && selectedTourType !== formData.tourType) {
      setFormData(prev => ({
        ...prev,
        tourType: selectedTourType,
      }));
    }
  }, []); // Empty dependency array - only on mount

  // No useEffect needed for excludedServices - handled in submit

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug if name changed and slug is empty or matches old name
    if (field === 'name' && (!formData.slug || formData.slug === generateSlug(initialData?.name || ''))) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleIslandToggle = (island: string) => {
    setFormData(prev => ({
      ...prev,
      islandsCovered: prev.islandsCovered.includes(island)
        ? prev.islandsCovered.filter((i: string) => i !== island)
        : [...prev.islandsCovered, island],
    }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      includedServices: prev.includedServices.includes(service)
        ? prev.includedServices.filter((s: string) => s !== service)
        : [...prev.includedServices, service],
    }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d: string) => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.tourType) newErrors.tourType = 'Tour type is required';
    if (!formData.duration) newErrors.duration = 'Duration is required';
    if (!formData.maxGroupSize) newErrors.maxGroupSize = 'Max group size is required';
    if (!formData.departureLocation.trim()) newErrors.departureLocation = 'Departure location is required';
    if (!formData.departureTime) newErrors.departureTime = 'Departure time is required';
    if (!formData.returnTime) newErrors.returnTime = 'Return time is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        // Always use latest values from state
        tourType: selectedTourType || formData.tourType,
        gallery: typeof formData.gallery === 'string' ? formData.gallery : JSON.stringify(formData.gallery || []),
        // Use excludedServices from hook state, not formData
        excludedServices: JSON.stringify(excludedServices || []),
        locations: locations,
      };

      console.log('Submitting tour package data:', submitData);
      console.log('Selected Tour Type:', submitData.tourType);
      console.log('Excluded Services:', excludedServices);

      let result;
      if (initialData?.id) {
        result = await updateTourPackage(initialData.id, submitData);
      } else {
        result = await createTourPackage(submitData);
      }

      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push('/admin/tour-packages');
      }
    } catch (error: any) {
      console.error('Error saving tour package:', error);
      const errorMessage = error.message || 'Failed to save tour package';
      console.error('Full error details:', { error, errorMessage });
      setErrors({
        submit: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="border-b pb-6">
        <h2 className="text-xl font-bold mb-4">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tour Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Island Hopping Adventure"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., island-hopping-adventure"
            />
            {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
          </div>

          {/* Tour Type - Hybrid UI: Cards for Create, Dropdown for Edit */}
          <div className="md:col-span-1">
            {initialData?.id ? (
              // Edit Mode: Use Dropdown for efficiency
              <TourTypeDropdown
                selectedTourType={selectedTourType || formData.tourType}
                onSelectTourType={setSelectedTourType}
                showViewExamples={true}
              />
            ) : (
              // Create Mode: Use Cards for learning
              <TourTypeManager
                selectedTourType={selectedTourType || formData.tourType}
                onSelectTourType={setSelectedTourType}
              />
            )}
            {errors.tourType && <p className="text-red-500 text-sm mt-2">{errors.tourType}</p>}
          </div>

          {/* Duration (minutes) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes) *
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => handleChange('duration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="30"
              step="30"
            />
            {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Summary
          </label>
          <textarea
            value={formData.summary}
            onChange={(e) => handleChange('summary', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="Brief description of the tour"
          />
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
            placeholder="Detailed description of the tour, itinerary, and highlights"
          />
        </div>
      </div>

      {/* Group Size and Locations */}
      <div className="border-b pb-6">
        <h2 className="text-xl font-bold mb-4">Group Size & Locations</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Min Group Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Group Size
            </label>
            <input
              type="number"
              value={formData.minGroupSize}
              onChange={(e) => handleChange('minGroupSize', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          {/* Max Group Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Group Size *
            </label>
            <input
              type="number"
              value={formData.maxGroupSize}
              onChange={(e) => handleChange('maxGroupSize', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
            {errors.maxGroupSize && <p className="text-red-500 text-sm mt-1">{errors.maxGroupSize}</p>}
          </div>

          {/* Default Group Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recommended Group Size
            </label>
            <input
              type="number"
              value={formData.defaultGroupSize}
              onChange={(e) => handleChange('defaultGroupSize', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>
        </div>

        {/* Islands Covered */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Islands Covered
          </label>
          <div className="space-y-2">
            {ISLANDS.map(island => (
              <label key={island.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.islandsCovered.includes(island.value)}
                  onChange={() => handleIslandToggle(island.value)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-gray-700">{island.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departure Location *
            </label>
            <input
              type="text"
              value={formData.departureLocation}
              onChange={(e) => handleChange('departureLocation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Chaweng Beach"
            />
            {errors.departureLocation && <p className="text-red-500 text-sm mt-1">{errors.departureLocation}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Return Location
            </label>
            <input
              type="text"
              value={formData.returnLocation}
              onChange={(e) => handleChange('returnLocation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Leave blank if same as departure"
            />
          </div>
        </div>
      </div>

      {/* Tour Locations */}
      <TourLocationForm
        locations={locations}
        onLocationsChange={setLocations}
        tourPackageId={initialData?.id}
      />

      {/* Schedule & Availability */}
      <div className="border-b pb-6">
        <h2 className="text-xl font-bold mb-4">Schedule & Availability</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Departure Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departure Time *
            </label>
            <input
              type="time"
              value={formData.departureTime}
              onChange={(e) => handleChange('departureTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.departureTime && <p className="text-red-500 text-sm mt-1">{errors.departureTime}</p>}
          </div>

          {/* Return Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Return Time *
            </label>
            <input
              type="time"
              value={formData.returnTime}
              onChange={(e) => handleChange('returnTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.returnTime && <p className="text-red-500 text-sm mt-1">{errors.returnTime}</p>}
          </div>

          {/* Duration Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (Days)
            </label>
            <input
              type="number"
              value={formData.durationDays}
              onChange={(e) => handleChange('durationDays', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>
        </div>

        {/* Available Days */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Days
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {AVAILABLE_DAYS.map(day => (
              <label key={day.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.availableDays.includes(day.value)}
                  onChange={() => handleDayToggle(day.value)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{day.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Seasonal Availability */}
        <div className="bg-gray-50 p-4 rounded-md">
          <label className="flex items-center mb-3">
            <input
              type="checkbox"
              checked={formData.seasonalAvailability}
              onChange={(e) => handleChange('seasonalAvailability', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="ml-2 font-medium text-gray-700">Seasonal Availability</span>
          </label>

          {formData.seasonalAvailability && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Season Start (Month)
                </label>
                <input
                  type="number"
                  value={formData.seasonStart || ''}
                  onChange={(e) => handleChange('seasonStart', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="12"
                  placeholder="1-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Season End (Month)
                </label>
                <input
                  type="number"
                  value={formData.seasonEnd || ''}
                  onChange={(e) => handleChange('seasonEnd', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="12"
                  placeholder="1-12"
                />
              </div>

              <div>
                <label className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    checked={formData.offSeasonAvailable}
                    onChange={(e) => handleChange('offSeasonAvailable', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Available Off-Season</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Services & Pricing */}
      <div className="border-b pb-6">
        <h2 className="text-xl font-bold mb-4">Services Included & Excluded</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {SERVICE_OPTIONS.map(service => (
            <label key={service.value} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.includedServices.includes(service.value)}
                onChange={() => handleServiceToggle(service.value)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-gray-700">{service.label}</span>
            </label>
          ))}
        </div>

        <div className="border-t pt-6">
          <ExcludedServicesManager
            excludedServices={excludedServices}
            onAddExcludedService={addExcludedService}
            onRemoveExcludedService={removeExcludedService}
            onClearExcludedServices={clearExcludedServices}
          />
        </div>
      </div>

      {/* Status */}
      <div className="border-b pb-6">
        <h2 className="text-xl font-bold mb-4">Status</h2>

        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => handleChange('isPublished', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="ml-2 text-gray-700">Published</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="ml-2 text-gray-700">Active</span>
          </label>
        </div>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{errors.submit}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Saving...' : initialData?.id ? 'Update Tour Package' : 'Create Tour Package'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
