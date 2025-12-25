# Phase 2: Admin Dashboard Implementation Checklist

**Target Duration:** 4-6 hours  
**Prerequisites:** Phase 1 Complete ✅  
**Dependencies:** All API endpoints, utility module, types

---

## 📋 Pre-Implementation Setup

### Files to Create
- [ ] `/frontend/app/admin/tour-locations/page.tsx` - Main list/management page
- [ ] `/frontend/app/admin/tour-locations/create/page.tsx` - Create form page
- [ ] `/frontend/app/admin/tour-locations/[id]/edit/page.tsx` - Edit form page
- [ ] `/frontend/app/admin/tour-locations/import/page.tsx` - Bulk import page
- [ ] `/frontend/components/admin/tour-locations/LocationForm.tsx` - Reusable form
- [ ] `/frontend/components/admin/tour-locations/LocationTable.tsx` - Data table
- [ ] `/frontend/components/admin/tour-locations/ImageGallery.tsx` - Image manager
- [ ] `/frontend/components/admin/tour-locations/ApprovalStatus.tsx` - Status badge
- [ ] `/frontend/components/admin/tour-locations/SEOPreview.tsx` - SEO preview
- [ ] `/frontend/components/admin/tour-locations/ImportDialog.tsx` - CSV import
- [ ] `/frontend/hooks/useTourLocation.ts` - Custom hook for location logic
- [ ] `/frontend/hooks/useTourLocationForm.ts` - Form state hook

### Imports Available
```typescript
// API functions (all pre-built)
import {
  fetchTourLocation, fetchTourLocations, createTourLocation,
  updateTourLocation, deleteTourLocation, searchTourLocations,
  approveTourLocation, batchImportLocations, parseCSVData
} from '@/lib/tour-location';

// Type definitions
import {
  TourLocation, CreateTourLocationInput, UpdateTourLocationInput,
  LocationType, SkillLevel, ContentVisibility
} from '@/types/tour-location';

// Formatting/validation
import {
  formatDuration, formatCoordinates, generateSlug,
  truncateDescription, validateLocationInput, validateCoordinates,
  calculateDistance, prepareLocationForAPI
} from '@/lib/tour-location';
```

---

## 📄 Page: Tour Locations List `/admin/tour-locations`

### Features
- [ ] Data table with columns:
  - [ ] Sequence number
  - [ ] Location name
  - [ ] Type (Activity, etc.)
  - [ ] Island
  - [ ] Status (Active/Inactive)
  - [ ] Approval (Approved/Pending/Rejected)
  - [ ] Created date
  - [ ] Actions (View, Edit, Delete, Approve)

### Functionality
- [ ] Sort by any column
- [ ] Filter by:
  - [ ] Tour package
  - [ ] Type
  - [ ] Island
  - [ ] Approval status
  - [ ] Active/Inactive
- [ ] Search by name/keywords
- [ ] Pagination (20, 50, 100 items per page)
- [ ] Bulk actions:
  - [ ] Select multiple
  - [ ] Approve selected
  - [ ] Activate/Deactivate selected
  - [ ] Delete selected
- [ ] Quick edit inline (name, status)
- [ ] Create button → `/create`
- [ ] Edit button → `/[id]/edit`
- [ ] View button → opens detail modal or page
- [ ] Delete with confirmation
- [ ] Loading states & error handling

### Code Example Structure
```typescript
// frontend/app/admin/tour-locations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { fetchTourLocations, deleteTourLocation } from '@/lib/tour-location';
import LocationTable from '@/components/admin/tour-locations/LocationTable';
import { TourLocation } from '@/types/tour-location';

export default function TourLocationsPage() {
  const [locations, setLocations] = useState<TourLocation[]>([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ tourPackageId: '', type: '', island: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch locations with filters and pagination
  }, [filters, page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this location?')) return;
    try {
      await deleteTourLocation(id);
      // Refresh list
    } catch (error) {
      // Show error
    }
  };

  return (
    <div className="space-y-4">
      <h1>Tour Locations</h1>
      {/* Filter bar */}
      {/* Create button */}
      <LocationTable
        locations={locations}
        pagination={pagination}
        onDelete={handleDelete}
        // ...
      />
    </div>
  );
}
```

---

## 🆕 Page: Create Location `/admin/tour-locations/create`

### Features
- [ ] Form with all 47 fields organized in sections:
  - **Basic Info** (name, type, sequenceNumber, island)
  - **Coordinates** (latitude, longitude with map picker)
  - **Timing** (durationMinutes, arrivalTime, departureTime)
  - **Content** (title, description, shortDescription, imageUrl)
  - **Gallery** (multiple image uploader)
  - **Marketing** (keywords, seoTags, highlights, funFacts, tipsFacts)
  - **SEO** (metaDescription, bestTimeToVisit)
  - **Amenities** (wheelchairAccessible, parkingAvailable, toiletsAvailable, amenities[])
  - **Admin** (visibility, isFeatured, activity, skillLevel)

### Components
- [ ] Text inputs (name, title, island, address)
- [ ] Textarea (description, shortDescription)
- [ ] Number inputs (sequenceNumber, durationMinutes, latitude, longitude)
- [ ] Time inputs (arrivalTime, departureTime)
- [ ] Select dropdowns (type, visibility, skillLevel)
- [ ] Checkboxes (wheelchairAccessible, parkingAvailable, etc.)
- [ ] Image uploader (imageUrl, gallery[])
- [ ] Array inputs (keywords, seoTags, highlights, etc.)
- [ ] Map picker (for coordinates)
- [ ] Auto-slug generation (from name)

### Functionality
- [ ] Real-time slug generation
- [ ] Form validation with error display
- [ ] Tour package selection (required)
- [ ] Image preview
- [ ] Drag-and-drop for gallery
- [ ] Add/remove array fields dynamically
- [ ] Save as draft (visibility: DRAFT)
- [ ] Publish (visibility: PUBLIC)
- [ ] Cancel/back button
- [ ] Loading state on submit
- [ ] Success/error notifications

### Code Example Structure
```typescript
// frontend/components/admin/tour-locations/LocationForm.tsx
'use client';

import { useCallback, useState } from 'react';
import { createTourLocation, validateLocationInput } from '@/lib/tour-location';
import { CreateTourLocationInput } from '@/types/tour-location';

export default function LocationForm({ tourPackageId, onSuccess }) {
  const [formData, setFormData] = useState<CreateTourLocationInput>({
    tourPackageId,
    name: '',
    type: '',
    sequenceNumber: 0,
    latitude: 0,
    longitude: 0,
    // ... all other fields
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const { valid, errors: validationErrors } = validateLocationInput(formData);
    if (!valid) {
      setErrors(Object.fromEntries(validationErrors.map(e => [e, e])));
      return;
    }

    // Submit
    setLoading(true);
    try {
      const created = await createTourLocation(formData);
      onSuccess(created);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Form sections and fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Location'}
      </button>
    </form>
  );
}
```

---

## ✏️ Page: Edit Location `/admin/tour-locations/[id]/edit`

### Features
- [ ] Same form as create page
- [ ] Pre-fill all current values
- [ ] Mark required fields (tourPackageId, name, type, sequence, coordinates)
- [ ] Save button instead of Create
- [ ] Delete button
- [ ] Approval section (show current approval status)
- [ ] Change history/audit log

### Differences from Create
- [ ] Pre-loaded data from `fetchTourLocation(id)`
- [ ] Use `updateTourLocation(id, data)` instead of create
- [ ] Preserve unchanged fields (null-coalescing on API)
- [ ] Show current approval status with approve/reject buttons
- [ ] Ability to revert to DRAFT state for re-editing
- [ ] Last edited info (date, user)

### Code Example Structure
```typescript
// frontend/app/admin/tour-locations/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { fetchTourLocation, updateTourLocation } from '@/lib/tour-location';
import LocationForm from '@/components/admin/tour-locations/LocationForm';

export default function EditLocationPage({ params }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchTourLocation(params.id);
        setLocation(data);
      } catch (error) {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  const handleUpdate = async (data) => {
    const updated = await updateTourLocation(params.id, data);
    // Success notification and redirect
  };

  if (loading) return <div>Loading...</div>;
  if (!location) return <div>Not found</div>;

  return (
    <LocationForm
      initialData={location}
      onSuccess={handleUpdate}
      isEdit={true}
    />
  );
}
```

---

## 📸 Component: Image Gallery `/components/admin/tour-locations/ImageGallery.tsx`

### Features
- [ ] Display current images as thumbnails
- [ ] Drag-and-drop upload area
- [ ] File input with accept="image/*"
- [ ] Image preview before upload
- [ ] Remove image button (X on hover)
- [ ] Reorder gallery (drag to reorder)
- [ ] Set primary image (first in gallery)
- [ ] Upload to temporary URL (or direct to S3)
- [ ] Show upload progress
- [ ] Handle errors gracefully

### Functionality
- [ ] Max 20 images per location
- [ ] Max 5MB per image
- [ ] Auto-compress/resize on upload
- [ ] Display image dimensions
- [ ] Alt text input for each image
- [ ] Integration with form (update imageUrl, gallery[])

### Code Example Structure
```typescript
// frontend/components/admin/tour-locations/ImageGallery.tsx
'use client';

import { useState } from 'react';

export default function ImageGallery({ 
  images = [], 
  onImagesChange,
  mainImageUrl 
}) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      // Upload to storage (S3, Cloudinary, etc.)
      const url = await uploadImage(file);
      onImagesChange([...images, url]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3>Gallery Images</h3>
      
      {/* Upload area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            Array.from(e.target.files || []).forEach(handleImageUpload);
          }}
        />
      </div>

      {/* Thumbnail grid */}
      <div className="grid grid-cols-4 gap-4">
        {images.map((url, idx) => (
          <div key={idx} className="relative group">
            <img src={url} alt="" className="w-full h-24 object-cover rounded" />
            <button
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
              onClick={() => onImagesChange(images.filter((_, i) => i !== idx))}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## ✅ Component: Approval Status

### Features
- [ ] Status badge (Approved, Pending, Rejected)
- [ ] Color coding (Green, Yellow, Red)
- [ ] Show approver name and date
- [ ] Approve/Reject buttons (if pending)
- [ ] Notes/comments from approver
- [ ] History of approval actions

### Code Example
```typescript
// frontend/components/admin/tour-locations/ApprovalStatus.tsx
export default function ApprovalStatus({ location, onApprove, onReject }) {
  const statusColors = {
    true: 'bg-green-100 text-green-800',
    false: 'bg-red-100 text-red-800',
    null: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="space-y-2">
      <div className={`inline-block px-3 py-1 rounded ${statusColors[location.contentApproved]}`}>
        {location.contentApproved === true && 'Approved'}
        {location.contentApproved === false && 'Rejected'}
        {location.contentApproved === null && 'Pending'}
      </div>

      {location.contentApproved === true && (
        <p className="text-sm text-gray-600">
          Approved by {location.approvedBy} on {new Date(location.approvedAt).toLocaleDateString()}
        </p>
      )}

      {location.contentApproved !== true && (
        <div className="space-x-2">
          <button onClick={() => onApprove()}>Approve</button>
          <button onClick={() => onReject()}>Reject</button>
        </div>
      )}
    </div>
  );
}
```

---

## 🔍 Component: SEO Preview `/components/admin/tour-locations/SEOPreview.tsx`

### Features
- [ ] SEO score (0-100)
- [ ] Meta title preview (60 chars max)
- [ ] Meta description preview (160 chars max)
- [ ] Keyword analysis (show which keywords are used)
- [ ] Mobile preview
- [ ] Suggestions for improvement
- [ ] Real-time update as user types
- [ ] Schema.org preview

### Scoring Logic
- [ ] +10: Has meta title (≤60 chars)
- [ ] +10: Has meta description (100-160 chars)
- [ ] +10: Has keywords (3+)
- [ ] +10: Has image
- [ ] +10: Has internal links
- [ ] +10: Mobile friendly
- [ ] +10: Readability (not all caps, proper sentence structure)
- [ ] +10: Keyword density (appears 2-4 times)
- [ ] +10: Has structured data (JSON-LD)
- [ ] +10: URL friendly slug

### Code Example Structure
```typescript
// frontend/components/admin/tour-locations/SEOPreview.tsx
export default function SEOPreview({ location }) {
  const score = calculateSEOScore(location);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3>SEO Score</h3>
        <div className={`text-2xl font-bold ${score >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
          {score}/100
        </div>
      </div>

      {/* Previews and suggestions */}
    </div>
  );
}
```

---

## 📤 Page: Bulk Import `/admin/tour-locations/import`

### Features
- [ ] CSV file upload
- [ ] Data preview table
- [ ] Field mapping interface
- [ ] Validation feedback (rows with errors highlighted)
- [ ] Import progress indicator
- [ ] Success/failure summary
- [ ] Export template button
- [ ] Sample CSV with headers

### Steps
1. [ ] Upload CSV file
2. [ ] Preview data (first 10 rows)
3. [ ] Map columns to location fields
4. [ ] Validate data (show errors)
5. [ ] Select tour package
6. [ ] Confirm and import
7. [ ] Show results summary

### CSV Format
```csv
name,type,sequenceNumber,latitude,longitude,island,title,description,keywords,seoTags
Koh Tao Snorkeling,WATER_ACTIVITY,1,10.3915,99.8317,Koh Tao,Beautiful Snorkeling,Explore coral reefs...,snorkel;fish;coral,water;activity;diving
```

### Code Example
```typescript
// frontend/app/admin/tour-locations/import/page.tsx
'use client';

import { useState } from 'react';
import { parseCSVData, batchImportLocations } from '@/lib/tour-location';

export default function ImportPage() {
  const [csvData, setCsvData] = useState(null);
  const [results, setResults] = useState(null);

  const handleImport = async (tourPackageId: string) => {
    if (!csvData) return;
    const result = await batchImportLocations(tourPackageId, csvData);
    setResults(result);
  };

  return (
    <div className="space-y-4">
      <h1>Import Locations</h1>
      
      {/* File upload */}
      <input
        type="file"
        accept=".csv"
        onChange={(e) => {
          const text = await e.target.files[0].text();
          setCsvData(parseCSVData(text));
        }}
      />

      {/* Preview and import */}
      {csvData && <ImportPreview data={csvData} onImport={handleImport} />}

      {/* Results */}
      {results && <ImportResults results={results} />}
    </div>
  );
}
```

---

## 🎣 Hook: useTourLocationForm

### Purpose
Manage form state, validation, and submission

### Features
- [ ] Form state management
- [ ] Field change handlers
- [ ] Array field manipulation (add/remove)
- [ ] Auto-save to localStorage (draft)
- [ ] Validation on submit
- [ ] Error handling
- [ ] Loading state

### Code Example
```typescript
// frontend/hooks/useTourLocationForm.ts
export function useTourLocationForm(initialData = null) {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayAdd = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), item]
    }));
  };

  const handleArrayRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleArrayAdd,
    handleArrayRemove,
    setLoading,
    setErrors
  };
}
```

---

## 🧪 Testing Checklist

- [ ] Create location form loads
- [ ] All 47 fields save correctly
- [ ] Validation errors display
- [ ] Image upload works
- [ ] Slug auto-generates from name
- [ ] Coordinates validation (range check)
- [ ] Slug uniqueness check
- [ ] Admin-only access enforced
- [ ] Edit location pre-fills data
- [ ] Update location preserves unchanged fields
- [ ] Delete with confirmation works
- [ ] Approval workflow works
- [ ] CSV import parses correctly
- [ ] Pagination loads next page
- [ ] Search filters results
- [ ] Sort by column works
- [ ] SEO preview updates in real-time
- [ ] Error messages display correctly
- [ ] Loading states show/hide
- [ ] Success notifications appear

---

## 📊 UI/UX Guidelines

### Colors
- Success: Green (#10b981)
- Error: Red (#ef4444)
- Warning: Yellow (#f59e0b)
- Info: Blue (#3b82f6)
- Approval: Green for approved, Yellow for pending, Red for rejected

### Spacing
- Section padding: 16px (1rem)
- Field padding: 8px (0.5rem)
- Button radius: 6px
- Form gap: 16px (1rem)

### Validation Feedback
- Inline error messages under fields
- Red border on input errors
- Toast notification on submit success/failure
- Disabled submit button while loading

---

## 🚀 Deployment Checklist

Before going live:
- [ ] All endpoints tested
- [ ] Error handling works
- [ ] Auth/permissions enforced
- [ ] Loading states visible
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Performance acceptable
- [ ] SEO meta tags correct
- [ ] Images optimize properly
- [ ] CSV import handles edge cases

---

## 📚 Related Documentation

- **API Reference:** `TOUR_LOCATION_API_QUICK_REFERENCE.md`
- **Phase 1 Delivery:** `TOUR_LOCATION_PHASE_1_DELIVERY.md`
- **Type Definitions:** `frontend/types/tour-location.ts`
- **Utility Functions:** `frontend/lib/tour-location.ts`

---

**Start Time:** [To be filled]  
**Estimated Duration:** 4-6 hours  
**Status:** Ready to begin ✅
