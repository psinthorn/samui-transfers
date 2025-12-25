# Tour Location API Implementation Plan

**Date:** December 10, 2025  
**Status:** Ready for Implementation  
**Base Path:** `/api/tour-locations`

---

## 📋 ENDPOINTS OVERVIEW

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/tour-locations` | Create location | Admin |
| GET | `/api/tour-locations/:id` | Get single location | Public |
| GET | `/api/tour-packages/:tourId/locations` | Get all for tour | Public |
| PUT | `/api/tour-locations/:id` | Update location | Admin |
| DELETE | `/api/tour-locations/:id` | Delete location | Admin |
| GET | `/api/tour-locations/:id/seo` | Get SEO data | Public |
| GET | `/api/tour-packages/:tourId/locations-map` | Get for map | Public |
| POST | `/api/tour-locations/batch-import` | Import CSV | Admin |
| POST | `/api/tour-locations/:id/approve` | Admin approval | Admin |
| GET | `/api/tour-locations/search` | Search locations | Public |

---

## 1️⃣ CREATE LOCATION

### POST `/api/tour-locations`

**Auth:** Admin only  
**Body:** CreateTourLocationInput

```typescript
// Request
{
  "tourPackageId": "tour-123",
  "name": "Big Buddha Temple",
  "slug": "big-buddha-temple",
  "type": "TEMPLE",
  "sequenceNumber": 1,
  "latitude": 8.7245,
  "longitude": 100.7860,
  "island": "Koh Samui",
  "address": "Na Mueang District, Koh Samui 84140",
  "durationMinutes": 45,
  "arrivalTime": "09:30",
  "departureTime": "10:15",
  "activity": "TEMPLE_VISIT",
  "skillLevel": "EASY",
  "title": "Big Buddha Temple Koh Samui - Golden Buddha Statue",
  "description": "Discover the iconic Big Buddha Temple (Wat Big Buddha) in Koh Samui...",
  "shortDescription": "Visit the iconic Big Buddha Temple with 12m golden statue and stunning sea views",
  "imageUrl": "https://cdn.example.com/big-buddha.jpg",
  "imageAlt": "Golden Big Buddha statue with Koh Samui coastline",
  "gallery": [
    {
      "url": "https://cdn.example.com/img1.jpg",
      "alt": "Front view",
      "caption": "Main entrance",
      "order": 1
    }
  ],
  "keywords": ["Big Buddha Temple", "Koh Samui temple", "Buddhist temples"],
  "seoTags": ["temples", "cultural-sites", "must-visit"],
  "metaDescription": "Visit Big Buddha Temple in Koh Samui - see the iconic golden Buddha statue...",
  "highlights": ["12-meter tall golden statue", "360° views", "Historic temple"],
  "bestTimeToVisit": "Early morning 7-10am for fewer crowds",
  "funFacts": ["Built in 1972", "Weighs over 400 tons"],
  "tipsFacts": ["Wear respectful clothing", "Remove shoes in temple areas"],
  "wheelchairAccessible": true,
  "parkingAvailable": true,
  "toiletsAvailable": true,
  "amenities": ["parking", "restrooms", "gift shop", "food stalls"],
  "isActive": true,
  "visibility": "PUBLIC"
}

// Response: 201 Created
{
  "success": true,
  "data": {
    "id": "loc-12345",
    "tourPackageId": "tour-123",
    "name": "Big Buddha Temple",
    // ... all fields
    "createdAt": "2025-12-10T10:30:00Z",
    "updatedAt": "2025-12-10T10:30:00Z"
  }
}

// Errors:
400 Bad Request - Missing required fields
409 Conflict - Duplicate slug in same tour
500 Internal Server Error
```

**Implementation Steps:**
1. Validate input with Zod schema
2. Check tour exists
3. Check slug uniqueness
4. Reorder sequences if needed
5. Auto-uppercase location type
6. Create location in database
7. Log audit trail
8. Return created location

---

## 2️⃣ GET SINGLE LOCATION

### GET `/api/tour-locations/:id`

**Auth:** Public  
**Params:** id (location ID)

```typescript
// Response: 200 OK
{
  "success": true,
  "data": {
    "id": "loc-12345",
    "tourPackageId": "tour-123",
    "name": "Big Buddha Temple",
    // ... all 47 fields
    "createdAt": "2025-12-10T10:30:00Z"
  }
}

// Errors:
404 Not Found
500 Internal Server Error
```

**Implementation:**
1. Find location by ID
2. Check visibility (PUBLIC only for non-admin)
3. Return location with all fields
4. Cache for 1 hour

---

## 3️⃣ GET LOCATIONS FOR TOUR

### GET `/api/tour-packages/:tourId/locations`

**Auth:** Public  
**Params:**
- `tourId` - Tour package ID
- `sort` - Field to sort by (default: sequence)
- `order` - asc/desc (default: asc)

```typescript
// Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "loc-1",
      "name": "Big Buddha Temple",
      "sequenceNumber": 1,
      // ... all fields
    },
    {
      "id": "loc-2",
      "name": "Chaweng Beach",
      "sequenceNumber": 2,
      // ... all fields
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 50,
    "pages": 1
  }
}
```

**Implementation:**
1. Find tour
2. Get all locations sorted by sequenceNumber
3. Filter by visibility (PUBLIC for non-admin)
4. Return ordered list
5. Cache for 1 hour

---

## 4️⃣ UPDATE LOCATION

### PUT `/api/tour-locations/:id`

**Auth:** Admin only  
**Body:** UpdateTourLocationInput (partial fields)

```typescript
// Request (any or all fields can be updated)
{
  "name": "Big Buddha Temple Updated",
  "description": "New description...",
  "imageUrl": "https://cdn.example.com/new-image.jpg"
  // ... any other fields
}

// Response: 200 OK
{
  "success": true,
  "data": { /* updated location */ }
}

// Errors:
404 Not Found
400 Bad Request
409 Conflict (duplicate slug)
500 Internal Server Error
```

**Implementation:**
1. Find location
2. Validate input
3. Check slug uniqueness (if changing)
4. Update fields
5. Clear cache
6. Log audit trail
7. Return updated location

---

## 5️⃣ DELETE LOCATION

### DELETE `/api/tour-locations/:id`

**Auth:** Admin only

```typescript
// Response: 200 OK
{
  "success": true,
  "message": "Location deleted"
}

// Errors:
404 Not Found
409 Conflict (has bookings)
500 Internal Server Error
```

**Implementation:**
1. Find location
2. Check no active bookings reference it
3. Soft delete (update visibility to DELETED)
4. Reorder remaining sequences
5. Clear cache
6. Log audit trail

---

## 6️⃣ GET SEO DATA

### GET `/api/tour-locations/:id/seo`

**Auth:** Public  
**Purpose:** Get SEO-optimized data for meta tags

```typescript
// Response: 200 OK
{
  "success": true,
  "data": {
    "title": "Big Buddha Temple Koh Samui - Golden Buddha Statue",
    "description": "Discover the iconic Big Buddha Temple...",
    "keywords": ["Big Buddha Temple", "Koh Samui"],
    "seoTags": ["temples", "cultural-sites"],
    "metaDescription": "Visit Big Buddha Temple in Koh Samui...",
    "ogImage": "https://cdn.example.com/big-buddha.jpg",
    "ogImageAlt": "Golden Buddha statue",
    "canonical": "https://example.com/tours/full-day-samui/locations/big-buddha-temple"
  }
}
```

**Implementation:**
1. Find location
2. Assemble SEO fields
3. Generate canonical URL
4. Cache for 24 hours
5. Return SEO object

---

## 7️⃣ GET LOCATIONS FOR MAP

### GET `/api/tour-packages/:tourId/locations-map`

**Auth:** Public  
**Purpose:** Get lightweight location data for map display

```typescript
// Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "loc-1",
      "name": "Big Buddha Temple",
      "latitude": 8.7245,
      "longitude": 100.7860,
      "type": "TEMPLE",
      "sequenceNumber": 1,
      "imageUrl": "https://cdn.example.com/thumb.jpg",
      "description": "Short description..."
    },
    // ... more locations
  ]
}
```

**Implementation:**
1. Find tour
2. Get locations with only map-needed fields
3. Return lightweight array
4. Cache for 6 hours

---

## 8️⃣ BATCH IMPORT

### POST `/api/tour-locations/batch-import`

**Auth:** Admin only  
**Body:** FormData with CSV file

```typescript
// CSV Format:
name,type,sequenceNumber,latitude,longitude,island,title,description,imageUrl,keywords
Big Buddha Temple,TEMPLE,1,8.7245,100.7860,Koh Samui,...,...,...,...
Chaweng Beach,BEACH,2,8.6897,100.8295,Koh Samui,...,...,...,...

// Response: 200 OK
{
  "success": true,
  "data": {
    "success": 2,
    "failed": 0,
    "total": 2,
    "errors": []
  }
}

// Response with Errors: 202 Partial Success
{
  "success": false,
  "data": {
    "success": 1,
    "failed": 1,
    "total": 2,
    "errors": [
      {
        "rowNumber": 2,
        "error": "Invalid latitude value"
      }
    ]
  }
}
```

**Implementation:**
1. Parse CSV file
2. Validate each row
3. Create locations for valid rows
4. Return summary with errors
5. Log import audit trail

---

## 9️⃣ APPROVE LOCATION

### POST `/api/tour-locations/:id/approve`

**Auth:** Admin only  
**Body:** { approved: boolean, notes?: string }

```typescript
// Request
{
  "approved": true,
  "notes": "All content looks good"
}

// Response: 200 OK
{
  "success": true,
  "data": {
    "id": "loc-123",
    "contentApproved": true,
    "approvedBy": "admin@example.com",
    "approvedAt": "2025-12-10T10:30:00Z"
  }
}
```

**Implementation:**
1. Find location
2. Validate SEO completeness
3. Update approval status
4. Set approvedBy and approvedAt
5. Send notification to creator
6. Clear cache
7. Log audit trail

---

## 🔟 SEARCH LOCATIONS

### GET `/api/tour-locations/search`

**Auth:** Public  
**Query Params:**
- `q` - Search query
- `tourId` - Filter by tour
- `type` - Filter by location type
- `island` - Filter by island
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)

```typescript
// Request
GET /api/tour-locations/search?q=buddha&tourId=tour-123&page=1&limit=10

// Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "loc-1",
      "name": "Big Buddha Temple",
      "description": "Short description...",
      // ... key fields
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

**Implementation:**
1. Search in name, description, keywords
2. Apply filters
3. Paginate results
4. Return with pagination
5. Cache for 1 hour

---

## ⚠️ ERROR RESPONSES

All endpoints return standard error format:

```typescript
{
  "success": false,
  "error": "LOCATION_NOT_FOUND",
  "message": "The location with ID 'loc-123' was not found",
  "code": 404
}
```

**Common Errors:**
- `LOCATION_NOT_FOUND` (404)
- `TOUR_NOT_FOUND` (404)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `INVALID_INPUT` (400)
- `DUPLICATE_SLUG` (409)
- `DATABASE_ERROR` (500)

---

## 🔒 AUTHORIZATION

**Public Endpoints:**
- GET `/api/tour-locations/:id`
- GET `/api/tour-packages/:tourId/locations`
- GET `/api/tour-locations/:id/seo`
- GET `/api/tour-packages/:tourId/locations-map`
- GET `/api/tour-locations/search`

**Admin Endpoints:**
- POST `/api/tour-locations` (create)
- PUT `/api/tour-locations/:id` (update)
- DELETE `/api/tour-locations/:id` (delete)
- POST `/api/tour-locations/batch-import`
- POST `/api/tour-locations/:id/approve`

---

## 📊 DATABASE QUERIES

### Get all locations for tour (optimized)
```prisma
const locations = await prisma.tourLocation.findMany({
  where: {
    tourPackageId: tourId,
    visibility: "PUBLIC"
  },
  orderBy: { sequenceNumber: "asc" },
  select: {
    // Only needed fields
  }
});
```

### Get locations near coordinates (geo-query)
```prisma
const nearby = await prisma.tourLocation.findMany({
  where: {
    tourPackageId: tourId,
    latitude: { gte: minLat, lte: maxLat },
    longitude: { gte: minLng, lte: maxLng }
  }
});
```

### Search locations
```prisma
const results = await prisma.tourLocation.findMany({
  where: {
    OR: [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { keywords: { contains: query } }
    ]
  }
});
```

---

## 🧪 TEST CASES

### Create Location Tests
- [ ] Create with all fields
- [ ] Create with minimum required fields
- [ ] Create with invalid latitude
- [ ] Create with duplicate slug
- [ ] Create in non-existent tour
- [ ] Create by non-admin (should fail)

### Get Location Tests
- [ ] Get existing location
- [ ] Get non-existent location
- [ ] Get private location (non-admin)
- [ ] Get approved vs pending

### Update Location Tests
- [ ] Update name
- [ ] Update all fields
- [ ] Update to duplicate slug
- [ ] Update in non-existent location

### Delete Location Tests
- [ ] Delete location
- [ ] Delete non-existent location
- [ ] Sequence reordering after delete

### Search Tests
- [ ] Search by name
- [ ] Search by keywords
- [ ] Filter by type
- [ ] Filter by island
- [ ] Pagination

### SEO Tests
- [ ] Generate correct meta tags
- [ ] Handle missing SEO fields
- [ ] Generate canonical URL

### Batch Import Tests
- [ ] Import valid CSV
- [ ] Import with errors
- [ ] Skip invalid rows
- [ ] Validate all fields

---

## 📈 PERFORMANCE CONSIDERATIONS

**Caching Strategy:**
- Public locations: Cache 1 hour
- Map data: Cache 6 hours
- SEO data: Cache 24 hours
- Search results: Cache 1 hour

**Indexes:**
- `tourPackageId` - for finding locations by tour
- `latitude, longitude` - for geo-queries
- `isFeatured` - for featured queries
- `visibility` - for filtering
- `contentApproved` - for approval workflow

**Query Optimization:**
- Select only needed fields
- Use pagination for large result sets
- Cache frequently accessed data
- Use database indexes

---

## 📝 IMPLEMENTATION ORDER

1. **POST** Create location
2. **GET** Single location
3. **GET** Locations for tour
4. **PUT** Update location
5. **DELETE** Delete location
6. **GET** SEO data
7. **GET** Locations for map
8. **POST** Batch import
9. **POST** Approve location
10. **GET** Search locations

**Estimated Time:** 3-4 days for all endpoints

---

## 📚 Related Files

- `frontend/types/tour-location.ts` - TypeScript types
- `TOUR_LOCATION_SEO_MARKETING_GUIDE.md` - Complete guide
- `TOUR_LOCATION_QUICK_REFERENCE.md` - Quick reference
- `frontend/prisma/schema.prisma` - Database schema

---

**Status:** ✅ Ready for implementation  
**Next:** Create API routes and handlers
