# Tour Locations Form - Quick Reference Guide

## 🎯 For Admin Users

### Adding a Tour Location

1. **Navigate to Tour Package**
   - Go to Admin → Tour Packages
   - Click "Create" or "Edit" on a tour package

2. **Add Location**
   - Scroll to "Tour Locations" section
   - Click blue "+ Add Location" button
   - A new location form will appear

3. **Fill in Location Details**
   - **Name** (required): Type or use Google autocomplete
   - **Type** (required): Select from dropdown (Temple, Beach, Pier, etc.)
   - **Island**: Select from dropdown
   - **Address**: Auto-populated from Google Places

4. **Optional Details**
   - Duration: How many minutes at this location
   - Activity Type: What visitors will do
   - Description: Marketing description
   - Image URL: Link to location image
   - Highlights: Key attractions (comma-separated)
   - Amenities: Check available facilities

5. **Coordinates** (Optional but Recommended)
   - Latitude: Auto-populated from Google Places
   - Longitude: Auto-populated from Google Places
   - Can be edited manually if needed

6. **Save**
   - Click "Save Location" button
   - Location appears in list with sequence number

### Editing a Location

1. Click on any location card to expand it
2. All fields become editable
3. Make your changes
4. Click "Save Location"
5. Location updates immediately

### Deleting a Location

1. Expand the location (click on it)
2. Click the red trash icon in the header
3. Location is removed
4. Other locations reorder automatically

### Reordering Locations

1. Expand the location (click on it)
2. Use up/down arrow buttons to reorder
3. Sequence numbers auto-update
4. Changes apply immediately

### Using Google Places Autocomplete

1. Click in the "Location Name" field
2. Start typing a location (e.g., "Big Buddha", "Chaweng")
3. Google suggestions appear
4. Click on a suggestion
5. Address and coordinates auto-populate
6. Adjust other fields as needed

---

## 👨‍💻 For Developers

### Import Components

```typescript
import TourLocationForm from '@/components/admin/tour-packages/TourLocationForm';
import { useTourLocationForm } from '@/hooks/useTourLocationForm';
import { useGooglePlacesAutocomplete } from '@/hooks/useGooglePlacesAutocomplete';
```

### Use in Component

```typescript
import { useState } from 'react';
import TourLocationForm from '@/components/admin/tour-packages/TourLocationForm';

export default function MyTourForm() {
  const [locations, setLocations] = useState([
    {
      id: '1',
      name: 'Big Buddha Temple',
      type: 'TEMPLE',
      sequenceNumber: 1,
      latitude: 8.0883,
      longitude: 100.7845,
      island: 'Koh Samui',
      address: 'Koh Samui, Thailand',
      durationMinutes: 45,
      highlights: ['Historic', 'Great views'],
    }
  ]);

  return (
    <form>
      <TourLocationForm
        locations={locations}
        onLocationsChange={setLocations}
        tourPackageId="tour-123"
      />
      <button type="submit">Save Package</button>
    </form>
  );
}
```

### Use the Hook

```typescript
import { useTourLocationForm } from '@/hooks/useTourLocationForm';

export default function LocationManager() {
  const {
    locations,
    addLocation,
    updateLocation,
    deleteLocation,
    reorderLocation,
    validateLocation,
    errors
  } = useTourLocationForm();

  // Add location with validation
  const handleAdd = (newLocation) => {
    const validationErrors = validateLocation(newLocation);
    if (Object.keys(validationErrors).length === 0) {
      addLocation(newLocation);
    } else {
      console.error('Validation failed:', validationErrors);
    }
  };

  return (
    <div>
      {locations.map((location, index) => (
        <div key={location.id}>
          <h3>{location.name}</h3>
          <button onClick={() => deleteLocation(location.id)}>Delete</button>
          <button onClick={() => reorderLocation(index, index - 1)}>Move Up</button>
        </div>
      ))}
    </div>
  );
}
```

### Use Google Places Hook

```typescript
import { useGooglePlacesAutocomplete } from '@/hooks/useGooglePlacesAutocomplete';

export default function LocationInput() {
  const { clearInput, setInputValue } = useGooglePlacesAutocomplete({
    inputId: 'location-autocomplete',
    onPlaceSelected: (place) => {
      console.log('Selected:', place.name, place.formattedAddress);
      console.log('Coordinates:', place.latitude, place.longitude);
    }
  });

  return (
    <input
      id="location-autocomplete"
      type="text"
      placeholder="Enter location..."
    />
  );
}
```

---

## 🔧 Configuration

### Required: Google Maps API Key

Add to your HTML (usually in `layout.tsx` or `_document.tsx`):

```html
<script
  src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"
  async
  defer
></script>
```

Or add to `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Optional: Customize Autocomplete

```typescript
useGooglePlacesAutocomplete({
  inputId: 'location-autocomplete',
  options: {
    componentRestrictions: { country: ['th', 'my'] },
    types: ['point_of_interest', 'establishment'],
    language: 'en',
  },
  onPlaceSelected: (place) => {
    // Handle selected place
  }
})
```

---

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npm test tour-location-form.integration.test.tsx
```

### Run with Coverage

```bash
npm test -- --coverage --collectCoverageFrom='components/admin/tour-packages/**'
```

### Example Test

```typescript
it('should add a new location', async () => {
  const { result } = renderHook(() => useTourLocationForm());
  
  act(() => {
    result.current.addLocation({
      id: 'new',
      name: 'New Beach',
      type: 'BEACH',
      sequenceNumber: 1,
      latitude: 8.5,
      longitude: 100.5,
    });
  });

  expect(result.current.locations).toHaveLength(1);
  expect(result.current.locations[0].name).toBe('New Beach');
});
```

---

## 🐛 Troubleshooting

### Google Places Not Working

**Issue**: Autocomplete doesn't show suggestions
**Solution**:
1. Verify API key is correct in HTML/env
2. Check browser console for errors
3. Ensure Google Maps API is loaded
4. Try refreshing the page

### Coordinates Not Populating

**Issue**: Latitude/longitude empty after selection
**Solution**:
1. Verify Google Places returns geometry data
2. Check place object in hook onPlaceSelected
3. Ensure coordinates are in valid range
4. Try different location search

### Form Validation Errors

**Issue**: Can't save location with validation errors
**Solution**:
1. Check error messages on form
2. Ensure required fields are filled
3. Verify coordinates are in valid range
4. Check sequence number is positive

### Performance Issues

**Issue**: Form slow with many locations
**Solution**:
1. Reduce number of locations on current page
2. Implement pagination
3. Check browser performance tab
4. Optimize Google Places API usage

---

## 📊 Data Structure

### Location Object

```typescript
interface TourLocationData {
  id?: string;                    // Unique identifier
  name: string;                   // Location name (required)
  type: string;                   // Type: TEMPLE, BEACH, etc.
  sequenceNumber: number;         // Order (1, 2, 3...)
  latitude: number;               // GPS latitude
  longitude: number;              // GPS longitude
  island?: string;                // Island name
  address?: string;               // Full address
  durationMinutes?: number;       // Minutes to spend
  activity?: string;              // Activity type
  activityDuration?: number;      // Activity duration
  description?: string;           // Marketing description
  imageUrl?: string;              // Image URL
  highlights?: string[];          // Key highlights
  amenities?: string[];           // Available amenities
}
```

### API Response

```json
{
  "id": "loc-123",
  "tourPackageId": "tour-456",
  "name": "Big Buddha Temple",
  "type": "TEMPLE",
  "sequenceNumber": 1,
  "latitude": 8.0883,
  "longitude": 100.7845,
  "island": "Koh Samui",
  "address": "Koh Samui, Thailand",
  "durationMinutes": 45,
  "highlights": ["Historic temple", "360° views"],
  "amenities": ["parking", "toilet", "shop"]
}
```

---

## ✨ Pro Tips

1. **Use Google Autocomplete**: Always use the address input to auto-populate coordinates
2. **Check Coordinates**: Verify coordinates are in Thailand bounds
3. **Order Matters**: Arrange locations in logical tour order
4. **Add Descriptions**: Rich descriptions help with SEO and marketing
5. **Use Highlights**: 3-5 key highlights work best
6. **Check Amenities**: Select relevant facilities for each location

---

## 🚀 Common Use Cases

### Case 1: Island Hopping Tour

```javascript
const locations = [
  { name: 'Nathon Pier', type: 'PIER', island: 'Koh Samui', sequenceNumber: 1 },
  { name: 'Koh Nang Yuan', type: 'ISLAND', sequenceNumber: 2 },
  { name: 'Koh Tao Beach', type: 'BEACH', island: 'Koh Tao', sequenceNumber: 3 },
  { name: 'Chalk Cliffs', type: 'VIEWPOINT', sequenceNumber: 4 },
];
```

### Case 2: Cultural Tour

```javascript
const locations = [
  { name: 'Big Buddha Temple', type: 'TEMPLE', sequenceNumber: 1 },
  { name: 'Samui Museum', type: 'SHOP', sequenceNumber: 2 },
  { name: 'Traditional Fishing Village', type: 'VIEWPOINT', sequenceNumber: 3 },
  { name: 'Local Restaurant', type: 'RESTAURANT', sequenceNumber: 4 },
];
```

### Case 3: Adventure Tour

```javascript
const locations = [
  { name: 'Jungle Trek Start', type: 'VIEWPOINT', sequenceNumber: 1 },
  { name: 'Waterfall Swimming', type: 'BEACH', sequenceNumber: 2 },
  { name: 'Rock Climbing Area', type: 'VIEWPOINT', sequenceNumber: 3 },
  { name: 'Riverside Lunch', type: 'RESTAURANT', sequenceNumber: 4 },
];
```

---

## 📚 Documentation Links

- [Full Implementation Guide](./TOUR_LOCATIONS_FORM_IMPLEMENTATION_COMPLETE.md)
- [Delivery Summary](./TOUR_LOCATIONS_FORM_DELIVERY_SUMMARY.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Tour Packages Documentation](./TOUR_PACKAGES_DOCUMENTATION_INDEX.md)

---

## 💬 Quick Help

| Question | Answer |
|----------|--------|
| How to add a location? | Click "+ Add Location" button in Tour Locations section |
| How to edit a location? | Click on location card to expand, edit fields, click Save |
| How to delete a location? | Expand location, click red trash icon |
| How to reorder locations? | Use up/down arrow buttons to move location |
| How to use Google autocomplete? | Type in location name field, select from suggestions |
| How to add coordinates? | Auto-populated from Google Places or enter manually |
| Can I have duplicate locations? | Yes, if needed for different tour runs |
| What's a sequence number? | The order of locations in the tour (1, 2, 3, etc.) |
| Can I edit locations after creating tour? | Yes, from Tour Package edit page |
| Do coordinates need to be in Thailand? | Recommended but not required by system |

---

**Last Updated**: January 7, 2025
**Version**: 1.0
**Status**: Ready for Production Use

For more help, see [Full Implementation Guide](./TOUR_LOCATIONS_FORM_IMPLEMENTATION_COMPLETE.md)
