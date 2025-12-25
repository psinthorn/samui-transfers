'use client';

import { useState, useEffect } from 'react';
import { TOUR_TYPES, SERVICE_OPTIONS } from '@/lib/tour-package';

interface TourPackageQuickEditModalProps {
  packageId: string;
  packageName: string;
  currentTourType: string;
  currentIncludedServices: string[];
  currentExcludedServices: string[];
  onClose: () => void;
  onSave: (data: {
    tourType?: string;
    includedServices?: string[];
    excludedServices?: string[];
  }) => Promise<void>;
  isLoading?: boolean;
}

export default function TourPackageQuickEditModal({
  packageId,
  packageName,
  currentTourType,
  currentIncludedServices = [],
  currentExcludedServices = [],
  onClose,
  onSave,
  isLoading = false,
}: TourPackageQuickEditModalProps) {
  // Debug: Log props on mount
  useEffect(() => {
    console.log('QuickEditModal Props:', {
      packageId,
      packageName,
      currentTourType,
      currentIncludedServices,
      currentExcludedServices,
      includedCount: Array.isArray(currentIncludedServices) ? currentIncludedServices.length : 0,
      excludedCount: Array.isArray(currentExcludedServices) ? currentExcludedServices.length : 0,
    });
  }, [packageId, packageName, currentTourType, currentIncludedServices, currentExcludedServices]);

  const [activeTab, setActiveTab] = useState<'type' | 'included' | 'excluded'>('type');
  const [tourType, setTourType] = useState(currentTourType);
  
  // Ensure currentIncludedServices is an array
  const safeIncludedServices = Array.isArray(currentIncludedServices) ? currentIncludedServices : [];
  // Ensure currentExcludedServices is an array
  const safeExcludedServices = Array.isArray(currentExcludedServices) ? currentExcludedServices : [];
  
  const [includedServices, setIncludedServices] = useState<Set<string>>(
    new Set(safeIncludedServices)
  );
  const [excludedServices, setExcludedServices] = useState<Set<string>>(
    new Set(safeExcludedServices)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug: Log when services change
  useEffect(() => {
    console.log('Included Services Updated:', Array.from(includedServices), 'Count:', includedServices.size);
  }, [includedServices]);

  useEffect(() => {
    console.log('Excluded Services Updated:', Array.from(excludedServices), 'Count:', excludedServices.size);
  }, [excludedServices]);

  const handleToggleIncludedService = (service: string) => {
    setIncludedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(service)) {
        console.log(`Removing included service: ${service}`);
        newSet.delete(service);
      } else {
        console.log(`Adding included service: ${service}`);
        newSet.add(service);
      }
      return newSet;
    });
  };

  const handleToggleExcludedService = (service: string) => {
    setExcludedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(service)) {
        console.log(`Removing excluded service: ${service}`);
        newSet.delete(service);
      } else {
        console.log(`Adding excluded service: ${service}`);
        newSet.add(service);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updateData: any = {};

      if (tourType !== currentTourType) {
        updateData.tourType = tourType;
      }

      // Check if included services changed
      const includedServicesArray = Array.from(includedServices);
      const includedChanged = 
        includedServicesArray.length !== safeIncludedServices.length ||
        !includedServicesArray.every(s => safeIncludedServices.includes(s));
      
      if (includedChanged) {
        updateData.includedServices = includedServicesArray;
      }

      // Check if excluded services changed
      const excludedServicesArray = Array.from(excludedServices);
      const excludedChanged =
        excludedServicesArray.length !== safeExcludedServices.length ||
        !excludedServicesArray.every(s => safeExcludedServices.includes(s));
      
      if (excludedChanged) {
        updateData.excludedServices = excludedServicesArray;
      }

      // Check if there are any updates to make
      if (Object.keys(updateData).length === 0) {
        setError('No changes made');
        setSaving(false);
        return;
      }

      console.log('Sending update data:', updateData);
      console.log('Included Services Array:', includedServicesArray);
      console.log('Excluded Services Array:', excludedServicesArray);
      await onSave(updateData);
      onClose();
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Proper change detection
  const includedServicesArray = Array.from(includedServices);
  const excludedServicesArray = Array.from(excludedServices);
  
  const includedChanged = 
    includedServicesArray.length !== safeIncludedServices.length ||
    !includedServicesArray.every(s => safeIncludedServices.includes(s));
  
  const excludedChanged =
    excludedServicesArray.length !== safeExcludedServices.length ||
    !excludedServicesArray.every(s => safeExcludedServices.includes(s));
  
  const hasChanges =
    tourType !== currentTourType ||
    includedChanged ||
    excludedChanged;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quick Edit Tour Package</h2>
            <p className="text-sm text-gray-600 mt-1">{packageName}</p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('type')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === 'type'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-700 border-transparent hover:text-gray-900'
            }`}
          >
            Tour Type
          </button>
          <button
            onClick={() => setActiveTab('included')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === 'included'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-700 border-transparent hover:text-gray-900'
            }`}
          >
            Included Services
          </button>
          <button
            onClick={() => setActiveTab('excluded')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === 'excluded'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-700 border-transparent hover:text-gray-900'
            }`}
          >
            Excluded Services
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Tour Type Tab */}
          {activeTab === 'type' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Tour Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {TOUR_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setTourType(type.value)}
                      className={`p-4 rounded-lg border-2 transition text-center ${
                        tourType === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-900 font-semibold'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              {tourType !== currentTourType && (
                <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                  ✓ Tour type will change from <strong>{TOUR_TYPES.find(t => t.value === currentTourType)?.label}</strong> to <strong>{TOUR_TYPES.find(t => t.value === tourType)?.label}</strong>
                </p>
              )}
            </div>
          )}

          {/* Included Services Tab */}
          {activeTab === 'included' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Services to Include
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {SERVICE_OPTIONS.map(service => (
                    <label
                      key={service.value}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={includedServices.has(service.value)}
                        onChange={() => handleToggleIncludedService(service.value)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {service.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm text-blue-700">Services included:</span>
                <span className="inline-block text-xs font-semibold bg-blue-600 text-white px-3 py-1 rounded-full">
                  {includedServices.size}
                </span>
              </div>
            </div>
          )}

          {/* Excluded Services Tab */}
          {activeTab === 'excluded' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Services to Exclude
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {SERVICE_OPTIONS.map(service => (
                    <label
                      key={service.value}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={excludedServices.has(service.value)}
                        onChange={() => handleToggleExcludedService(service.value)}
                        className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {service.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-sm text-red-700">Services excluded:</span>
                <span className="inline-block text-xs font-semibold bg-red-600 text-white px-3 py-1 rounded-full">
                  {excludedServices.size}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
