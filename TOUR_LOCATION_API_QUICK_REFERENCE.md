# Tour Location API - Quick Reference

## Base URL
```
http://localhost:3000/api
```

---

## Public Endpoints (No Auth Required)

### 1. GET Single Location
```
GET /tour-locations/:id

Response:
{
  success: true,
  data: { /* 47-field location object */ }
}
```

### 2. GET Locations List
```
GET /tour-locations?tourId=:id&page=1&limit=50&sort=sequenceNumber&order=asc

Query Parameters:
- tourId (required): Tour package ID
- page: Page number (default: 1)
- limit: Items per page (default: 20, max: 100)
- sort: Field to sort by (default: sequenceNumber)
- order: asc or desc (default: asc)

Response:
{
  success: true,
  data: [ /* array of locations */ ],
  pagination: { total, page, limit, pages }
}
```

### 3. GET SEO Data
```
GET /tour-locations/:id/seo

Response:
{
  success: true,
  data: {
    title, description, og: {}, twitter: {},
    keywords: [], breadcrumb: [], structuredData: {},
    canonical, metadata: {}
  }
}
```

### 4. GET Map Data
```
GET /tour-packages/:packageId/locations-map

Response:
{
  success: true,
  data: {
    packageId, packageName, packageSlug,
    locations: [ { id, name, coordinates, distance } ],
    stats: { totalLocations, totalDistance, bounds }
  }
}
```

### 5. GET Nearby Locations
```
GET /tour-locations/:id/nearby?radius=5&limit=10

Query Parameters:
- radius: Search radius in km (1-50, default: 5)
- limit: Max results (1-20, default: 10)

Response:
{
  success: true,
  data: [ /* locations with distance field */ ],
  metadata: { referenceLocation, searchRadius, found }
}
```

### 6. GET Location by Slug
```
GET /tour-locations/by-slug/:slug

Response:
{
  success: true,
  data: {
    /* location object */,
    relatedLocations: [ /* nearby in same tour */ ]
  }
}
```

### 7. POST Search
```
POST /tour-locations/search

Body:
{
  query: "string",           // Optional: search term
  tourPackageId: "string",   // Optional: filter by tour
  type: "string",            // Optional: WATER_ACTIVITY, etc.
  island: "string",          // Optional: Koh Tao, etc.
  skillLevel: "string",      // Optional: BEGINNER, INTERMEDIATE, ADVANCED
  page: 1,
  limit: 20,
  sort: "sequenceNumber",
  order: "asc"
}

Response:
{
  success: true,
  data: [ /* locations */ ],
  pagination: { total, page, limit, pages, hasMore },
  meta: { query, sort, order }
}
```

---

## Admin Endpoints (Requires Authentication & ADMIN Role)

### 1. POST Create Location
```
POST /tour-locations

Body:
{
  tourPackageId: "string",  // Required
  name: "string",           // Required
  type: "string",           // Required
  sequenceNumber: number,   // Required
  latitude: number,         // Required (-90 to 90)
  longitude: number,        // Required (-180 to 180)
  island: "string",
  address: "string",
  title: "string",
  description: "string",
  shortDescription: "string",
  imageUrl: "string",
  imageAlt: "string",
  gallery: ["url1", "url2"],
  keywords: ["keyword1", "keyword2"],
  seoTags: ["tag1", "tag2"],
  metaDescription: "string",
  highlights: ["highlight1", "highlight2"],
  bestTimeToVisit: "string",
  funFacts: ["fact1", "fact2"],
  tipsFacts: ["tip1", "tip2"],
  wheelchairAccessible: boolean,
  parkingAvailable: boolean,
  toiletsAvailable: boolean,
  amenities: ["amenity1", "amenity2"],
  durationMinutes: number,
  arrivalTime: "string",
  departureTime: "string",
  activity: "string",
  activityDuration: "string",
  skillLevel: "string",
  isFeatured: boolean,
  visibility: "PUBLIC" | "DRAFT" | "PRIVATE"
}

Response: 201 Created
{
  success: true,
  data: { /* created location with all 47 fields */ }
}
```

### 2. PUT Update Location
```
PUT /tour-locations/:id

Body: Any subset of the create fields
(Only provided fields are updated, others preserved)

Response: 200 OK
{
  success: true,
  data: { /* updated location */ }
}
```

### 3. DELETE Location
```
DELETE /tour-locations/:id

Response: 200 OK
{
  success: true,
  message: "Location deleted successfully"
}
```

### 4. POST Approve Location
```
POST /tour-locations/:id/approve

Body:
{
  approve: boolean,       // true to approve, false to reject
  notes: "string"         // Optional approval notes
}

Response: 200 OK
{
  success: true,
  message: "Location approved/rejected successfully",
  data: {
    id, name, contentApproved, approvedBy, approvedAt,
    tourPackage: { id, name }
  }
}
```

### 5. POST Batch Import
```
POST /tour-locations/batch-import

Body:
{
  tourPackageId: "string",
  locations: [
    {
      name: "string",          // Required
      type: "string",          // Required
      sequenceNumber: number,  // Required
      latitude: number,        // Required
      longitude: number,       // Required
      island: "string",
      address: "string",
      title: "string",
      description: "string",
      shortDescription: "string",
      imageUrl: "string",
      keywords: "comma,separated,keywords",    // Comma-separated
      seoTags: "comma,separated,tags",         // Comma-separated
      highlights: "comma,separated,highlights", // Comma-separated
      skillLevel: "string",
      durationMinutes: number,
      arrivalTime: "string",
      departureTime: "string"
    }
    // ... up to 100 items
  ]
}

Response: 200 OK (even if some fail)
{
  success: false | true,  // true only if ALL succeed
  message: "Import completed: X successful, Y failed",
  data: {
    tourPackageId, totalProcessed, successCount, failureCount,
    results: [
      {
        index: 1,
        name: "string",
        success: boolean,
        id: "string" | undefined,
        error: "string" | undefined
      }
    ]
  }
}
```

---

## Error Responses

All endpoints return error format:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable message"
}
```

### Common Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| INVALID_ID | 400 | ID format is invalid |
| INVALID_COORDINATES | 400 | Latitude/longitude out of range |
| INVALID_DATA | 400 | Required fields missing |
| UNAUTHORIZED | 401 | No auth session or not admin |
| ACCESS_DENIED | 403 | Location not accessible (not PUBLIC) |
| LOCATION_NOT_FOUND | 404 | Location doesn't exist |
| DUPLICATE_SLUG | 409 | Slug already exists for this tour |
| DATABASE_ERROR | 500 | Database operation failed |

---

## TypeScript Types

```typescript
// Import from @/types/tour-location
interface TourLocation {
  // All 47 fields with proper types
  id: string;
  tourPackageId: string;
  name: string;
  latitude: string;
  longitude: string;
  keywords: string[];
  seoTags: string[];
  // ... all other fields
}

interface CreateTourLocationInput {
  // Required and optional fields
}

interface UpdateTourLocationInput {
  // All fields optional
}
```

---

## Utility Functions

```typescript
// Import from @/lib/tour-location

// Fetch functions
fetchTourLocation(id)
fetchTourLocations(tourId, options)
createTourLocation(input)
updateTourLocation(id, input)
deleteTourLocation(id)
searchTourLocations(options)
fetchLocationSEO(id)
fetchTourLocationsMapData(tourId)
approveTourLocation(id, approve, notes)
batchImportLocations(tourId, locations)
fetchNearbyLocations(id, options)
fetchTourLocationBySlug(slug)

// Formatting functions
formatDuration(minutes)        // "2h 30m"
formatCoordinates(lat, lng)    // "10.3915°N, 99.8317°E"
generateSlug(text)             // "koh-tao-snorkeling"
truncateDescription(text, 160) // "Text with..."
formatLocationType(type)       // "Water Activity"

// Validation functions
validateCoordinates(lat, lng)
validateLocationInput(input)
validateArrayField(value)

// Parsing functions
parseCSVData(csvText)
prepareLocationForAPI(location)

// Utility functions
calculateDistance(lat1, lon1, lat2, lon2) // km
```

---

## Common Usage Examples

### List locations for a tour
```typescript
import { fetchTourLocations } from '@/lib/tour-location';

const { locations, pagination } = await fetchTourLocations('tour-id-123', {
  page: 1,
  limit: 50,
  sort: 'sequenceNumber'
});
```

### Create a location
```typescript
import { createTourLocation, formatDuration } from '@/lib/tour-location';

const location = await createTourLocation({
  tourPackageId: 'tour-id-123',
  name: 'Koh Tao Snorkeling',
  type: 'WATER_ACTIVITY',
  sequenceNumber: 1,
  latitude: 10.3915,
  longitude: 99.8317,
  island: 'Koh Tao',
  durationMinutes: 120,
  keywords: ['snorkel', 'fish', 'coral']
});

console.log(formatDuration(location.durationMinutes)); // "2h"
```

### Search locations
```typescript
import { searchTourLocations } from '@/lib/tour-location';

const { locations, pagination } = await searchTourLocations({
  query: 'snorkel',
  island: 'Koh Tao',
  page: 1,
  limit: 20
});
```

### Get SEO data
```typescript
import { fetchLocationSEO } from '@/lib/tour-location';

const seoData = await fetchLocationSEO('location-id-123');
// Use for meta tags: seoData.title, seoData.description, seoData.og
```

### Find nearby locations
```typescript
import { fetchNearbyLocations } from '@/lib/tour-location';

const { locations, metadata } = await fetchNearbyLocations('location-id-123', {
  radius: 5, // km
  limit: 10
});
```

### Batch import from CSV
```typescript
import { parseCSVData, batchImportLocations } from '@/lib/tour-location';

const csvData = parseCSVData(csvText); // Parse CSV
const result = await batchImportLocations('tour-id-123', csvData);

console.log(`${result.successCount} created, ${result.failureCount} failed`);
result.results.forEach(r => {
  if (!r.success) console.error(r.name, r.error);
});
```

---

## Authentication

All admin endpoints require:
1. Valid NextAuth session (JWT token)
2. User role = 'ADMIN'
3. Session checked via: `const session = await auth();`

---

## Rate Limiting

Currently no rate limiting. Consider adding for production:
- 100 requests per minute for public endpoints
- 50 requests per minute for admin endpoints

---

**Last Updated:** December 10, 2025  
**API Version:** v1  
**Status:** Production Ready ✅
