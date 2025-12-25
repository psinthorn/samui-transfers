# Tour Type & Excluded Services - API Integration Guide

## Overview

The tour package API endpoints automatically handle tour type and excluded services data with proper JSON serialization/deserialization.

## Endpoints

### POST /api/admin/tour-packages (Create)

**Request Body:**
```json
{
  "name": "Island Hopping Adventure",
  "tourType": "ISLAND_HOPPING",
  "duration": 480,
  "maxGroupSize": 20,
  "departureLocation": "Chaweng Beach",
  "excludedServices": "[\"MEALS\", \"ALCOHOL\"]",
  "locations": [...],
  "isPublished": true,
  "isActive": true
}
```

**Response:**
```json
{
  "id": "tour_123",
  "name": "Island Hopping Adventure",
  "tourType": "ISLAND_HOPPING",
  "excludedServices": "[\"MEALS\", \"ALCOHOL\"]",
  "isPublished": true,
  "createdAt": "2025-12-12T10:30:00Z",
  "updatedAt": "2025-12-12T10:30:00Z"
}
```

### PUT /api/admin/tour-packages/[id] (Update)

**Request Body:**
```json
{
  "name": "Island Hopping Adventure - Updated",
  "tourType": "ADVENTURE",
  "excludedServices": "[\"ALCOHOL\", \"INSURANCE\"]",
  "locations": [...],
  "isPublished": true
}
```

**Response:**
```json
{
  "id": "tour_123",
  "name": "Island Hopping Adventure - Updated",
  "tourType": "ADVENTURE",
  "excludedServices": "[\"ALCOHOL\", \"INSURANCE\"]",
  "updatedAt": "2025-12-12T11:00:00Z"
}
```

### GET /api/admin/tour-packages (Fetch List)

**Query Parameters:**
```
GET /api/admin/tour-packages?tourType=ISLAND_HOPPING&page=1&limit=10
```

**Response:**
```json
{
  "data": [
    {
      "id": "tour_123",
      "name": "Island Hopping Adventure",
      "tourType": "ISLAND_HOPPING",
      "excludedServices": "[\"MEALS\", \"ALCOHOL\"]",
      "isPublished": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42
  }
}
```

### GET /api/admin/tour-packages/[id] (Fetch Single)

**Response:**
```json
{
  "id": "tour_123",
  "name": "Island Hopping Adventure",
  "tourType": "ISLAND_HOPPING",
  "excludedServices": "[\"MEALS\", \"ALCOHOL\"]",
  "locations": [...],
  "isPublished": true,
  "createdAt": "2025-12-12T10:30:00Z",
  "updatedAt": "2025-12-12T11:00:00Z"
}
```

## Data Format

### Tour Type Field

**Type**: `String`  
**Values**: One of:
- `ISLAND_HOPPING`
- `CULTURAL`
- `ADVENTURE`
- `LUXURY`
- `THEMED`

**Example**:
```typescript
tourType: "ISLAND_HOPPING"
```

### Excluded Services Field

**Type**: `String` (JSON array)  
**Storage**: Stored as JSON string in database  
**Values**: Array of service strings:
- `MEALS`
- `GUIDE`
- `TRANSPORTATION`
- `SNORKEL_GEAR`
- `INSURANCE`
- `HOTEL_PICKUP`
- `EQUIPMENT_RENTAL`
- `PHOTOSHOOT`
- `ALCOHOL`
- `KIDS_ACTIVITIES`
- `UNDERWATER_CAMERA`
- `LUNCH`
- `BREAKFAST`
- `DINNER`
- `WATER_BOTTLE`
- `SUNSCREEN`

**Format**:
```json
"excludedServices": "[\"MEALS\", \"ALCOHOL\", \"INSURANCE\"]"
```

**Parsing in TypeScript**:
```typescript
// Parse from API response
const services = JSON.parse(tourPackage.excludedServices);
// Result: ["MEALS", "ALCOHOL", "INSURANCE"]

// Serialize for API request
const serialized = JSON.stringify(["MEALS", "ALCOHOL"]);
// Result: "[\"MEALS\", \"ALCOHOL\"]"
```

## Client-Side Implementation

### Using the Hook

```typescript
import { useTourTypeAndServicesManagement } from '@/hooks/useTourTypeAndServicesManagement';

// In your component
const {
  selectedTourType,
  setSelectedTourType,
  excludedServices,
  addExcludedService,
  removeExcludedService,
  clearExcludedServices,
  setExcludedServices,
} = useTourTypeAndServicesManagement(
  initialTourType,
  initialExcludedServices
);

// When saving to API
const payload = {
  tourType: selectedTourType,
  excludedServices: JSON.stringify(excludedServices),
  // ... other fields
};

await updateTourPackage(id, payload);
```

### Parsing Response

```typescript
// Parse the response from API
try {
  const response = await fetchTourPackage(id);
  
  // Tour type is simple string
  const tourType = response.tourType; // "ISLAND_HOPPING"
  
  // Parse excluded services JSON
  const excluded = JSON.parse(response.excludedServices);
  // Result: ["MEALS", "ALCOHOL"]
  
  // Initialize hook with parsed data
  setExcludedServices(excluded);
  setSelectedTourType(tourType);
  
} catch (error) {
  console.error('Error parsing tour data:', error);
  // Handle error
}
```

## Database Schema

### TourPackage Model

```prisma
model TourPackage {
  id                String    @id @default(cuid())
  
  // Tour Type
  tourType          String    // "ISLAND_HOPPING", "CULTURAL", "ADVENTURE", "LUXURY", "THEMED"
  
  // Excluded Services (stored as JSON string)
  excludedServices  String    @default("[]")  // JSON array: ["MEALS", "ALCOHOL", ...]
  
  // ... other fields ...
  
  @@index([tourType])
}
```

## Migration Guide

### For Existing Tours

If you have existing tours with excluded services in a different format:

**Before** (old format):
```
"Meals not included, No alcohol, Limited transportation"
```

**After** (new format):
```json
"[\"MEALS\", \"ALCOHOL\", \"TRANSPORTATION\"]"
```

**Migration Script Example**:
```typescript
// Read existing tour
const tour = await db.tourPackage.findUnique({
  where: { id: tourId }
});

// Parse old text to new format
const excluded = [];
if (tour.excludedServices.includes('Meal')) excluded.push('MEALS');
if (tour.excludedServices.includes('alcohol')) excluded.push('ALCOHOL');
if (tour.excludedServices.includes('transport')) excluded.push('TRANSPORTATION');

// Update to new format
await db.tourPackage.update({
  where: { id: tourId },
  data: {
    excludedServices: JSON.stringify(excluded)
  }
});
```

## Validation

### Tour Type Validation

```typescript
const VALID_TOUR_TYPES = [
  'ISLAND_HOPPING',
  'CULTURAL',
  'ADVENTURE',
  'LUXURY',
  'THEMED'
];

function validateTourType(type: string): boolean {
  return VALID_TOUR_TYPES.includes(type);
}
```

### Excluded Services Validation

```typescript
const VALID_SERVICES = [
  'MEALS', 'GUIDE', 'TRANSPORTATION', 'SNORKEL_GEAR',
  'INSURANCE', 'HOTEL_PICKUP', 'EQUIPMENT_RENTAL',
  'PHOTOSHOOT', 'ALCOHOL', 'KIDS_ACTIVITIES',
  'UNDERWATER_CAMERA', 'LUNCH', 'BREAKFAST',
  'DINNER', 'WATER_BOTTLE', 'SUNSCREEN'
];

function validateExcludedServices(services: string[]): boolean {
  if (!Array.isArray(services)) return false;
  return services.every(service => VALID_SERVICES.includes(service));
}

// Example usage
const services = JSON.parse(tourPackage.excludedServices);
if (!validateExcludedServices(services)) {
  throw new Error('Invalid excluded services');
}
```

## Error Handling

### Common Errors

**Invalid JSON in excludedServices:**
```typescript
try {
  const services = JSON.parse(tourPackage.excludedServices);
} catch (error) {
  console.error('Invalid JSON format:', error);
  // Default to empty array
  const services = [];
}
```

**Invalid tour type:**
```typescript
if (!VALID_TOUR_TYPES.includes(tourPackage.tourType)) {
  throw new Error(`Invalid tour type: ${tourPackage.tourType}`);
}
```

**Missing required field:**
```typescript
if (!tourPackage.tourType) {
  throw new Error('Tour type is required');
}
```

## Best Practices

### 1. Always Validate Input
```typescript
if (!tourType || !VALID_TOUR_TYPES.includes(tourType)) {
  throw new Error('Invalid tour type');
}
```

### 2. Safely Parse JSON
```typescript
let excludedServices = [];
try {
  excludedServices = JSON.parse(data.excludedServices);
} catch {
  excludedServices = [];
}
```

### 3. Provide Defaults
```typescript
const tourType = data.tourType || 'ISLAND_HOPPING';
const excludedServices = data.excludedServices || '[]';
```

### 4. Sanitize User Input
```typescript
const sanitized = selectedServices
  .filter(s => VALID_SERVICES.includes(s))
  .map(s => s.toUpperCase());
```

### 5. Log Changes for Audit Trail
```typescript
console.log('Tour Type Changed', {
  from: oldTour.tourType,
  to: newTour.tourType,
  timestamp: new Date(),
  userId: currentUser.id
});
```

## Testing

### Test Cases

```typescript
describe('Tour Type & Excluded Services API', () => {
  
  test('Create tour with tour type and excluded services', async () => {
    const response = await createTourPackage({
      name: 'Test Tour',
      tourType: 'ISLAND_HOPPING',
      excludedServices: '[\"MEALS\", \"ALCOHOL\"]',
    });
    
    expect(response.tourType).toBe('ISLAND_HOPPING');
    expect(response.excludedServices).toBe('[\"MEALS\", \"ALCOHOL\"]');
  });
  
  test('Update excluded services', async () => {
    const response = await updateTourPackage(tourId, {
      excludedServices: '[\"ALCOHOL\"]',
    });
    
    const services = JSON.parse(response.excludedServices);
    expect(services).toContain('ALCOHOL');
    expect(services).not.toContain('MEALS');
  });
  
  test('Parse excluded services correctly', async () => {
    const tour = await fetchTourPackage(tourId);
    const services = JSON.parse(tour.excludedServices);
    
    expect(Array.isArray(services)).toBe(true);
    services.forEach(service => {
      expect(VALID_SERVICES).toContain(service);
    });
  });
});
```

## Performance Considerations

### Query Optimization
```typescript
// Include related data efficiently
const tour = await db.tourPackage.findUnique({
  where: { id: tourId },
  include: {
    locations: true,
    rates: true,
  }
});
```

### Indexing
```prisma
model TourPackage {
  // ... fields ...
  
  @@index([tourType])           // Fast filtering by type
  @@index([isPublished])
  @@index([createdAt])
}
```

### Caching
```typescript
// Cache tour type options
const TOUR_TYPES_CACHE = {
  data: ['ISLAND_HOPPING', 'CULTURAL', 'ADVENTURE', 'LUXURY', 'THEMED'],
  lastUpdated: Date.now(),
  ttl: 1000 * 60 * 60 // 1 hour
};
```

---

## Summary

| Aspect | Details |
|--------|---------|
| **Tour Type** | Single string selection, 5 predefined options |
| **Excluded Services** | JSON array of service strings, up to 16 options |
| **Storage** | Both stored as String fields in database |
| **Validation** | Client-side in hook, server-side in API |
| **Serialization** | JSON.stringify/parse for excluded services |
| **Filtering** | tourType can be used in query filters |
| **Sorting** | Can sort by tourType |
| **Audit Trail** | Track changes for compliance |

**Version**: 1.0.0  
**Last Updated**: December 12, 2025
