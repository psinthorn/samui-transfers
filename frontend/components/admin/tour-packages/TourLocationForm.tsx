'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Trash2, Plus, MapPin, Clock, Type } from 'lucide-react';
import { useGooglePlacesAutocomplete, formatGooglePlaceToLocation } from '@/hooks/useGooglePlacesAutocomplete';

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
  activityDuration?: number;
  description?: string;
  imageUrl?: string;
  highlights?: string[];
  amenities?: string[];
}

interface TourLocationFormProps {
  locations: TourLocationData[];
  onLocationsChange: (locations: TourLocationData[]) => void;
  tourPackageId?: string;
}

const LOCATION_TYPES = [
  { value: 'TEMPLE', label: 'Temple' },
  { value: 'BEACH', label: 'Beach' },
  { value: 'PIER', label: 'Pier' },
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'SHOP', label: 'Shop' },
  { value: 'VIEWPOINT', label: 'Viewpoint' },
  { value: 'ISLAND', label: 'Island' },
  { value: 'SNORKEL', label: 'Snorkel Site' },
];

const ISLANDS = [
  { value: 'Koh Samui', label: 'Koh Samui' },
  { value: 'Koh Phangan', label: 'Koh Phangan' },
  { value: 'Koh Tao', label: 'Koh Tao' },
  { value: 'Koh Nang Yuan', label: 'Koh Nang Yuan' },
];

const AMENITIES = [
  { value: 'parking', label: 'Parking' },
  { value: 'toilet', label: 'Toilet' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'shop', label: 'Shop' },
  { value: 'medical', label: 'Medical' },
];

export default function TourLocationForm({
  locations,
  onLocationsChange,
  tourPackageId,
}: TourLocationFormProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<TourLocationData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNewForm, setShowNewForm] = useState(false);

  // Initialize Google Places Autocomplete for location name/address
  const { clearInput, setInputValue } = useGooglePlacesAutocomplete({
    inputId: 'location-autocomplete',
    onPlaceSelected: (place) => {
      if (editFormData) {
        setEditFormData({
          ...editFormData,
          name: place.name || editFormData.name,
          address: place.formattedAddress || editFormData.address,
          latitude: place.latitude || editFormData.latitude,
          longitude: place.longitude || editFormData.longitude,
          island: place.city || editFormData.island,
        });
      }
    },
  });

  const handleAddLocation = () => {
    const newLocation: TourLocationData = {
      id: `temp-${Date.now()}`,
      name: '',
      type: '',
      sequenceNumber: locations.length + 1,
      latitude: 0,
      longitude: 0,
      island: '',
      address: '',
      durationMinutes: 0,
      activity: '',
      activityDuration: 0,
      description: '',
      imageUrl: '',
      highlights: [],
      amenities: [],
    };

    setEditingId(newLocation.id || null);
    setEditFormData(newLocation);
    setShowNewForm(true);
    setExpandedId(newLocation.id || null);
  };

  const handleEditLocation = (location: TourLocationData) => {
    setEditingId(location.id || `temp-${Date.now()}`);
    setEditFormData({ ...location });
    setExpandedId(location.id || null);
  };

  const handleDeleteLocation = (id: string | undefined) => {
    if (id) {
      onLocationsChange(locations.filter(loc => loc.id !== id));
      if (expandedId === id) {
        setExpandedId(null);
      }
    }
  };

  const handleSaveLocation = () => {
    if (!editFormData) return;

    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!editFormData.name.trim()) newErrors.name = 'Location name is required';
    if (!editFormData.type) newErrors.type = 'Location type is required';
    if (editFormData.sequenceNumber < 1) newErrors.sequenceNumber = 'Sequence number must be at least 1';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const existingIndex = locations.findIndex(loc => loc.id === editFormData.id);

    if (existingIndex >= 0) {
      const updated = [...locations];
      updated[existingIndex] = editFormData;
      onLocationsChange(updated);
    } else {
      onLocationsChange([...locations, editFormData]);
    }

    setEditingId(null);
    setEditFormData(null);
    setErrors({});
    setShowNewForm(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditFormData(null);
    setErrors({});
    setShowNewForm(false);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const updated = [...locations];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      // Update sequence numbers
      updated.forEach((loc, idx) => {
        loc.sequenceNumber = idx + 1;
      });
      onLocationsChange(updated);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < locations.length - 1) {
      const updated = [...locations];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      // Update sequence numbers
      updated.forEach((loc, idx) => {
        loc.sequenceNumber = idx + 1;
      });
      onLocationsChange(updated);
    }
  };

  return (
    <div className="border-b pb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Tour Locations</h2>
        <button
          type="button"
          onClick={handleAddLocation}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Add Location
        </button>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MapPin size={32} className="mx-auto mb-2 opacity-50" />
          <p>No locations added yet. Add your first tour location.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {locations.map((location, index) => (
            <div
              key={location.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
            >
              <div
                className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => {
                  if (expandedId === location.id) {
                    // Closing the form
                    setExpandedId(null);
                    setEditingId(null);
                    setEditFormData(null);
                  } else {
                    // Opening the form for editing
                    setExpandedId(location.id || null);
                    handleEditLocation(location);
                  }
                }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-sm font-semibold text-gray-500 w-6 text-center">
                    {location.sequenceNumber}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{location.name}</p>
                    <p className="text-sm text-gray-600">
                      {location.type} {location.island && `• ${location.island}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveUp(index);
                      }}
                      className="p-1 text-gray-600 hover:bg-white rounded transition"
                      title="Move up"
                    >
                      <ChevronUp size={18} />
                    </button>
                  )}

                  {index < locations.length - 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveDown(index);
                      }}
                      className="p-1 text-gray-600 hover:bg-white rounded transition"
                      title="Move down"
                    >
                      <ChevronDown size={18} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLocation(location.id);
                    }}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>

                  {expandedId === location.id ? (
                    <ChevronUp size={18} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </div>
              </div>

              {expandedId === location.id && editFormData && editingId === location.id && (
                <div className="p-4 bg-white border-t border-gray-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Info */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location Name *
                      </label>
                      <input
                        type="text"
                        id="location-autocomplete"
                        value={editFormData.name || ''}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            name: e.target.value,
                          })
                        }
                        onBlur={(e) => {
                          // Sync any changes from Google Places Autocomplete
                          const input = document.getElementById('location-autocomplete') as HTMLInputElement;
                          if (input && input.value !== editFormData.name) {
                            setEditFormData({ ...editFormData, name: input.value });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Big Buddha Temple"
                        autoComplete="off"
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location Type *
                      </label>
                      <select
                        value={editFormData.type || ''}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            type: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a type</option>
                        {LOCATION_TYPES.map(t => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sequence Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sequence Number
                      </label>
                      <input
                        type="number"
                        value={editFormData.sequenceNumber || 1}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            sequenceNumber: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </div>

                    {/* Island */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Island
                      </label>
                      <select
                        value={editFormData.island || ''}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            island: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select an island</option>
                        {ISLANDS.map(i => (
                          <option key={i.value} value={i.value}>
                            {i.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={editFormData.address || ''}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Full address"
                    />
                  </div>

                  {/* Coordinates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="0.00001"
                        value={editFormData.latitude || 0}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            latitude: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.0000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="0.00001"
                        value={editFormData.longitude || 0}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            longitude: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.0000"
                      />
                    </div>
                  </div>

                  {/* Duration and Activity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={editFormData.durationMinutes || 0}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            durationMinutes: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="15"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Activity Type
                      </label>
                      <input
                        type="text"
                        value={editFormData.activity || ''}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            activity: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., TEMPLE_VISIT, BEACH_SWIM"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editFormData.description || ''}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Detailed description of this location"
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={editFormData.imageUrl || ''}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          imageUrl: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>

                  {/* Amenities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenities
                    </label>
                    <div className="space-y-2">
                      {AMENITIES.map(amenity => (
                        <label key={amenity.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editFormData.amenities?.includes(amenity.value) || false}
                            onChange={(e) => {
                              const updatedAmenities = e.target.checked
                                ? [...(editFormData.amenities || []), amenity.value]
                                : (editFormData.amenities || []).filter(a => a !== amenity.value);
                              setEditFormData({
                                ...editFormData,
                                amenities: updatedAmenities,
                              });
                            }}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="ml-2 text-gray-700">{amenity.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Highlights (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={editFormData.highlights?.join(', ') || ''}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          highlights: e.target.value.split(',').map(h => h.trim()).filter(Boolean),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Historic temple, Free entry, Great photos"
                    />
                  </div>

                  {/* Save/Cancel Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleSaveLocation}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      Save Location
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Inline form for adding new location */}
      {showNewForm && editFormData && editingId?.startsWith('temp-') && (
        <div className="mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h3 className="font-semibold mb-4">Add New Location</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name *
                </label>
                <input
                  type="text"
                  id="location-autocomplete"
                  value={editFormData.name || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditFormData({ ...editFormData, name: value });
                  }}
                  onBlur={(e) => {
                    // Sync any changes from Google Places Autocomplete
                    const input = document.getElementById('location-autocomplete') as HTMLInputElement;
                    if (input && input.value !== editFormData.name) {
                      setEditFormData({ ...editFormData, name: input.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Big Buddha Temple"
                  autoComplete="off"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Type *
                </label>
                <select
                  value={editFormData.type}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a type</option>
                  {LOCATION_TYPES.map(t => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveLocation}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Save Location
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
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
