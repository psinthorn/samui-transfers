'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageGallery from './ImageGallery';
import SEOPreview from './SEOPreview';
import {
  createTourLocation,
  updateTourLocation,
  validateLocationInput,
  generateSlug,
  validateCoordinates,
} from '@/lib/tour-location';
import { CreateTourLocationInput, UpdateTourLocationInput } from '@/types/tour-location';

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  console.log(`[${type.toUpperCase()}] ${message}`);
};

interface LocationFormProps {
  tourPackageId: string;
  initialData?: any;
  isEdit?: boolean;
  onSuccess?: (location: any) => void;
}

export default function LocationForm({
  tourPackageId,
  initialData,
  isEdit = false,
  onSuccess,
}: LocationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(
    initialData || {
      tourPackageId,
      name: '',
      slug: '',
      type: '',
      sequenceNumber: 0,
      latitude: 0,
      longitude: 0,
      island: '',
      address: '',
      durationMinutes: 0,
      arrivalTime: '',
      departureTime: '',
      activity: '',
      activityDuration: '',
      skillLevel: '',
      title: '',
      description: '',
      shortDescription: '',
      imageUrl: '',
      imageAlt: '',
      gallery: [],
      keywords: [],
      seoTags: [],
      metaDescription: '',
      highlights: [],
      bestTimeToVisit: '',
      funFacts: [],
      tipsFacts: [],
      wheelchairAccessible: false,
      parkingAvailable: false,
      toiletsAvailable: false,
      amenities: [],
      isActive: true,
      isFeatured: false,
      visibility: 'DRAFT',
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Auto-generate slug from name
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev: any) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
    // Clear name error if exists
    if (errors.name) {
      setErrors(prev => { const { name, ...rest } = prev; return rest; });
    }
  }, [errors]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    // Clear field error if exists
    if (errors[field]) {
      setErrors((prev: any) => { const { [field]: _, ...rest } = prev; return rest; });
    }
  }, [errors]);

  const handleArrayFieldChange = useCallback((field: string, index: number, value: string) => {
    setFormData((prev: any) => {
      const array = [...(prev[field] || [])];
      array[index] = value;
      return { ...prev, [field]: array };
    });
  }, []);

  const handleArrayFieldAdd = useCallback((field: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: [...(prev[field] || []), ''],
    }));
  }, []);

  const handleArrayFieldRemove = useCallback((field: string, index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index),
    }));
  }, []);

  const handleCheckboxChange = useCallback((field: string, checked: boolean) => {
    setFormData((prev: any) => ({ ...prev, [field]: checked }));
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.type) {
      newErrors.type = 'Type is required';
    }
    if (formData.sequenceNumber === undefined || formData.sequenceNumber === null) {
      newErrors.sequenceNumber = 'Sequence number is required';
    }
    if (!validateCoordinates(parseFloat(formData.latitude), parseFloat(formData.longitude))) {
      newErrors.coordinates = 'Invalid coordinates (lat: -90 to 90, lng: -180 to 180)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix the errors before submitting', 'error');
      return;
    }

    setLoading(true);
    try {
      let result;
      const submitData = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        sequenceNumber: parseInt(String(formData.sequenceNumber), 10),
        durationMinutes: formData.durationMinutes ? parseInt(String(formData.durationMinutes), 10) : null,
      };

      if (isEdit) {
        result = await updateTourLocation(initialData.id, submitData);
        showToast('Location updated successfully');
      } else {
        result = await createTourLocation(submitData);
        showToast('Location created successfully');
      }

      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push(`/admin/tour-locations?tourId=${tourPackageId}`);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to save location';
      showToast(errorMessage, 'error');
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'content', label: 'Content & Media' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'marketing', label: 'Marketing & SEO' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'admin', label: 'Admin Settings' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Basic Info Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Location name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug (Auto-generated)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                placeholder="auto-generated-slug"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select type</option>
                <option value="WATER_ACTIVITY">Water Activity</option>
                <option value="LAND_ACTIVITY">Land Activity</option>
                <option value="CULTURAL_SITE">Cultural Site</option>
                <option value="RESTAURANT">Restaurant</option>
                <option value="ACCOMMODATION">Accommodation</option>
                <option value="SCENIC_SPOT">Scenic Spot</option>
                <option value="ADVENTURE">Adventure</option>
              </select>
              {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
            </div>

            {/* Sequence Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sequence Number *
              </label>
              <input
                type="number"
                value={formData.sequenceNumber}
                onChange={(e) => handleInputChange('sequenceNumber', parseInt(e.target.value, 10))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.sequenceNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.sequenceNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.sequenceNumber}</p>
              )}
            </div>

            {/* Latitude */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude *
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.coordinates ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="-90 to 90"
              />
            </div>

            {/* Longitude */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude *
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.coordinates ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="-180 to 180"
              />
            </div>

            {/* Island */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Island
              </label>
              <input
                type="text"
                value={formData.island}
                onChange={(e) => handleInputChange('island', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Koh Tao"
              />
            </div>

            {/* Address */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Physical address"
              />
            </div>
          </div>

          {/* Timing */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-4">Timing</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.durationMinutes || ''}
                  onChange={(e) => handleInputChange('durationMinutes', e.target.value ? parseInt(e.target.value, 10) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arrival Time
                </label>
                <input
                  type="time"
                  value={formData.arrivalTime}
                  onChange={(e) => handleInputChange('arrivalTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departure Time
                </label>
                <input
                  type="time"
                  value={formData.departureTime}
                  onChange={(e) => handleInputChange('departureTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Activity Info */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-4">Activity Information</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity
                </label>
                <input
                  type="text"
                  value={formData.activity}
                  onChange={(e) => handleInputChange('activity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Snorkeling"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Duration
                </label>
                <input
                  type="text"
                  value={formData.activityDuration}
                  onChange={(e) => handleInputChange('activityDuration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2 hours"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Level
                </label>
                <select
                  value={formData.skillLevel}
                  onChange={(e) => handleInputChange('skillLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select level</option>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {errors.coordinates && (
            <p className="text-red-500 text-sm mt-4">{errors.coordinates}</p>
          )}
        </div>
      )}

      {/* Content & Media Tab */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Content & Media</h3>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Location title for display"
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Description
            </label>
            <textarea
              value={formData.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description (used in lists)"
            />
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Detailed description of the location"
            />
          </div>

          {/* Primary Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Image URL
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-sm text-gray-500 mt-1">Primary image displayed in listings</p>
          </div>

          {/* Image Alt Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Alt Text
            </label>
            <input
              type="text"
              value={formData.imageAlt}
              onChange={(e) => handleInputChange('imageAlt', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Alt text for primary image (SEO)"
            />
          </div>
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Image Gallery</h3>
          <p className="text-sm text-gray-600">Upload and manage images for this location</p>

          {/* Image Gallery Component */}
          <ImageGallery
            images={formData.gallery || []}
            onImagesChange={(images) => handleInputChange('gallery', images)}
            maxImages={20}
          />
        </div>
      )}

      {/* Marketing & SEO Tab */}
      {activeTab === 'marketing' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Marketing & SEO</h3>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Keywords (for search)
            </label>
            <div className="space-y-2">
              {(formData.keywords || []).map((keyword: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => handleArrayFieldChange('keywords', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Keyword"
                  />
                  <button
                    type="button"
                    onClick={() => handleArrayFieldRemove('keywords', index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleArrayFieldAdd('keywords')}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Add Keyword
              </button>
            </div>
          </div>

          {/* SEO Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              SEO Tags
            </label>
            <div className="space-y-2">
              {(formData.seoTags || []).map((tag: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => handleArrayFieldChange('seoTags', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="SEO tag"
                  />
                  <button
                    type="button"
                    onClick={() => handleArrayFieldRemove('seoTags', index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleArrayFieldAdd('seoTags')}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Add SEO Tag
              </button>
            </div>
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description (for search results)
            </label>
            <textarea
              value={formData.metaDescription}
              onChange={(e) => handleInputChange('metaDescription', e.target.value)}
              rows={2}
              maxLength={160}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Description for search engine results (max 160 chars)"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.metaDescription?.length || 0}/160 characters
            </p>
          </div>

          {/* Highlights */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Highlights
            </label>
            <div className="space-y-2">
              {(formData.highlights || []).map((highlight: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => handleArrayFieldChange('highlights', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Highlight"
                  />
                  <button
                    type="button"
                    onClick={() => handleArrayFieldRemove('highlights', index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleArrayFieldAdd('highlights')}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Add Highlight
              </button>
            </div>
          </div>

          {/* Best Time to Visit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Best Time to Visit
            </label>
            <input
              type="text"
              value={formData.bestTimeToVisit}
              onChange={(e) => handleInputChange('bestTimeToVisit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., November to April"
            />
          </div>

          {/* Fun Facts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Fun Facts
            </label>
            <div className="space-y-2">
              {(formData.funFacts || []).map((fact: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={fact}
                    onChange={(e) => handleArrayFieldChange('funFacts', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Fun fact"
                  />
                  <button
                    type="button"
                    onClick={() => handleArrayFieldRemove('funFacts', index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleArrayFieldAdd('funFacts')}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Add Fun Fact
              </button>
            </div>
          </div>

          {/* Tips & Facts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tips & Facts
            </label>
            <div className="space-y-2">
              {(formData.tipsFacts || []).map((tip: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={tip}
                    onChange={(e) => handleArrayFieldChange('tipsFacts', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tip or fact"
                  />
                  <button
                    type="button"
                    onClick={() => handleArrayFieldRemove('tipsFacts', index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleArrayFieldAdd('tipsFacts')}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Add Tip
              </button>
            </div>
          </div>

          {/* SEO Preview */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">SEO Preview</h3>
            <SEOPreview
              title={formData.title}
              slug={formData.slug}
              description={formData.metaDescription}
              keywords={formData.keywords}
            />
          </div>
        </div>
      )}

      {/* Amenities Tab */}
      {activeTab === 'amenities' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Amenities & Accessibility</h3>

          {/* Accessibility Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.wheelchairAccessible}
                onChange={(e) => handleCheckboxChange('wheelchairAccessible', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-gray-700">Wheelchair Accessible</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.parkingAvailable}
                onChange={(e) => handleCheckboxChange('parkingAvailable', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-gray-700">Parking Available</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.toiletsAvailable}
                onChange={(e) => handleCheckboxChange('toiletsAvailable', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-gray-700">Toilets Available</span>
            </label>
          </div>

          {/* Amenities List */}
          <div className="mt-6 pt-6 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Additional Amenities
            </label>
            <div className="space-y-2">
              {(formData.amenities || []).map((amenity: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={amenity}
                    onChange={(e) => handleArrayFieldChange('amenities', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Restaurant, WiFi, First Aid"
                  />
                  <button
                    type="button"
                    onClick={() => handleArrayFieldRemove('amenities', index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleArrayFieldAdd('amenities')}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Add Amenity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Settings Tab */}
      {activeTab === 'admin' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Admin Settings</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.visibility}
                onChange={(e) => handleInputChange('visibility', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="DRAFT">Draft (not visible)</option>
                <option value="PUBLIC">Published (visible to all)</option>
                <option value="PRIVATE">Private (hidden)</option>
              </select>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleCheckboxChange('isActive', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-gray-700">Active</span>
              </label>
            </div>
          </div>

          {/* Featured */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => handleCheckboxChange('isFeatured', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-gray-700 font-medium">Featured Location</span>
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Featured locations appear first in listings
            </p>
          </div>
        </div>
      )}

      {/* Submit Error */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-2 pt-6 border-t">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Location' : 'Create Location'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
