# Admin Dashboard Quick Reference

## Routes & Pages

### Tour Locations Management
```
/admin/tour-locations                    Main list with filters
/admin/tour-locations/create?tourId=X    Create new location
/admin/tour-locations/[id]/edit          Edit & approve location
/admin/tour-locations/import?tourId=X    Bulk CSV import
```

## Component Usage

### LocationForm
```tsx
import LocationForm from '@/components/admin/tour-locations/LocationForm';

<LocationForm 
  tourPackageId="123"
  isEdit={false}
  onSuccess={(location) => console.log(location)}
/>
```
- **Props:** tourPackageId (required), initialData, isEdit, onSuccess
- **Usage:** Create and edit pages
- **Tabs:** Basic Info, Content & Media, Gallery, Marketing & SEO, Amenities, Admin

### LocationTable
```tsx
import LocationTable from '@/components/admin/tour-locations/LocationTable';

<LocationTable
  locations={locations}
  pagination={pagination}
  onDelete={handleDelete}
  onApprove={handleApprove}
  onPageChange={handlePageChange}
/>
```
- **Props:** locations[], pagination, onDelete, onApprove, onPageChange

### ImageGallery
```tsx
import ImageGallery from '@/components/admin/tour-locations/ImageGallery';

<ImageGallery
  images={gallery}
  onImagesChange={setGallery}
  maxImages={20}
/>
```
- **Props:** images[], onImagesChange, maxImages
- **Features:** Drag-drop, preview, reorder, delete

### ApprovalStatus
```tsx
import ApprovalStatus from '@/components/admin/tour-locations/ApprovalStatus';

<ApprovalStatus
  locationId="123"
  contentApproved={true}
  approvedAt={new Date()}
  approvalNotes="Notes..."
  onApprovalChange={(approved) => reload()}
/>
```
- **Props:** locationId (required), contentApproved, approvedAt, approvalNotes, onApprovalChange

### SEOPreview
```tsx
import SEOPreview from '@/components/admin/tour-locations/SEOPreview';

<SEOPreview
  title="Location Title"
  slug="location-slug"
  description="Meta description"
  keywords={['keyword1', 'keyword2']}
/>
```
- **Props:** title, slug, description, keywords[]
- **Real-time:** Updates as user types

---

## API Functions

All from `lib/tour-location.ts`:

### Fetch
```typescript
const locations = await fetchTourLocations(tourId, page, limit, filters);
const location = await fetchTourLocation(id);
const results = await searchTourLocations(query, page, limit);
```

### Mutate
```typescript
const created = await createTourLocation(data);
const updated = await updateTourLocation(id, data);
await deleteTourLocation(id);
await approveTourLocation(id, approve, notes);
const results = await batchImportLocations(tourId, locations);
```

### Validate
```typescript
const errors = validateLocationInput(data);
const isValid = validateCoordinates(lat, lng);
const slug = generateSlug(name);
```

---

## Form Tabs Reference

### Basic Info Tab
- Location name (required)
- Auto-slug (auto-generated)
- Type (required) - WATER_ACTIVITY, LAND_ACTIVITY, CULTURAL_SITE, etc.
- Sequence number (for ordering)
- Coordinates (required) - latitude, longitude
- Island name
- Address
- Activity type
- Duration in minutes

### Content & Media Tab
- Title for display
- Description (short)
- Full description
- Primary image URL
- Image alt text

### Gallery Tab
- ImageGallery component for multi-image upload
- Drag-drop, upload, preview, reorder, delete
- Max 20 images per location

### Marketing & SEO Tab
- Keywords (3-6 optimal)
- SEO tags
- Meta description (120-160 chars optimal)
- Highlights (key selling points)
- Best time to visit
- Fun facts
- Travel tips
- SEO Preview component (real-time score)

### Amenities Tab
- Accessibility features (checkboxes)
- Amenities list

### Admin Settings Tab
- Visibility (public/private)
- Featured flag
- Active status

---

## Filtering & Search

### List Page Filters
1. **Search** - Full-text search across name, title, description
2. **Type** - Location type selector
3. **Island** - Island name filter
4. **Status** - Active/Inactive
5. **Approval** - Pending/Approved/Rejected

### Pagination
- Page size selector: 20, 50, 100 per page
- Prev/Next buttons
- Total count display

---

## CSV Bulk Import

### Column Format
Required: `name`, `type`, `latitude`, `longitude`, `sequenceNumber`

Optional: 
- `slug`, `duration`, `durationMinutes`
- `title`, `description`, `imageUrls`
- `galleryUrls`, `keywords`, `highlights`
- `funFacts`, `tips`, `isActive`, `contentApproved`

### Array Columns
Separate values with semicolons:
- `imageUrls`: `url1;url2;url3`
- `keywords`: `keyword1;keyword2;keyword3`
- `highlights`: `highlight1;highlight2`

### Workflow
1. Download template
2. Fill CSV with data
3. Upload CSV file
4. Preview data (first 10 rows)
5. Confirm import
6. View results and errors

---

## Approval Workflow

### For Pending Locations
1. Open location edit page
2. See "Pending Review" status badge
3. Click "Approve" button
   - Modal appears
   - Click "Approve" to confirm
4. Click "Reject" button
   - Modal appears with notes field
   - Type rejection reason
   - Click "Reject" to confirm

### For Approved Locations
1. Status shows "Approved" with green badge
2. Shows approval date and notes
3. Can click "Revoke Approval" to change status back to pending

---

## Validation Rules

### GPS Coordinates
- Latitude: -90 to 90
- Longitude: -180 to 180

### Slug Format
- Must be lowercase
- Only letters, numbers, hyphens
- Must be unique per tour package

### Image Upload
- Max file size: 5MB per image
- Supported types: PNG, JPG, GIF
- Max quantity: 20 images per location

### SEO Optimization
- Title: 30-60 characters (optimal)
- Meta description: 120-160 characters (optimal)
- Keywords: 3-6 keywords (optimal)

---

## Error Handling

### Common Errors
| Error | Cause | Solution |
|-------|-------|----------|
| "Location not found" | Invalid location ID | Verify ID in URL |
| "Slug already exists" | Duplicate slug | Change slug value |
| "Invalid coordinates" | Out of range lat/lng | Check GPS values |
| "Tour not found" | Invalid tour ID | Verify tour exists |
| "Max images exceeded" | >20 images selected | Remove images first |

### User Feedback
- Toast notifications for success/error
- Inline error messages on form fields
- Error summary at bottom of form
- Modal confirmations for destructive actions

---

## Keyboard Shortcuts (Can Be Added)
| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + S | Save form |
| Esc | Close modal |
| Enter | Submit modal |
| Tab | Navigate form fields |

---

## Performance Tips

- Use pagination for large datasets (50+ items)
- Lazy load images in gallery
- Batch import for >10 locations
- Search before filtering for large lists
- Cache location data when possible

---

## Troubleshooting

### Form Won't Submit
- Check for red validation error messages
- Ensure all required fields filled
- Verify coordinates are valid
- Check that slug is unique

### Images Not Uploading
- Check file size (<5MB)
- Verify file type (PNG, JPG, GIF)
- Check total image count (<20)
- Clear browser cache if stuck

### CSV Import Failing
- Download and use template
- Check required columns present
- Use semicolons for array values
- Verify data format matches examples

### Search Not Working
- Check internet connection
- Try simpler search terms
- Use quotes for exact phrases
- Clear search field and retry

---

## Support & Documentation

- API Reference: See API_DOCUMENTATION.md
- Database Schema: See DATABASE_SCHEMA_REFERENCE.md
- Architecture: See ARCHITECTURE_VISUAL_OVERVIEW.md
- Implementation: See PHASE_2_ADMIN_DASHBOARD_COMPLETE.md
