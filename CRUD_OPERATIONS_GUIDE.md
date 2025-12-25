# 🔧 CRUD Operations Guide - Samui Transfers API

**Status:** Complete | **Last Updated:** December 9, 2025 | **API Version:** 2.0

---

## Overview

This guide documents the standard CRUD (Create, Read, Update, Delete) patterns used throughout the Samui Transfers API. All operations follow RESTful conventions with consistent error handling, validation, and response formats.

## Table of Contents

1. [Standard Response Format](#standard-response-format)
2. [Vehicles API](#vehicles-api-complete-crud)
3. [Speedboat Rates API](#speedboat-rates-api-complete-crud)
4. [Tour Rates API](#tour-rates-api-complete-crud)
5. [Event Rates API](#event-rates-api-complete-crud)
6. [Service Rates API](#service-rates-api-complete-crud)
7. [Error Handling](#error-handling)
8. [Validation Patterns](#validation-patterns)
9. [Soft Delete Strategy](#soft-delete-strategy)
10. [Pagination & Filtering](#pagination--filtering)

---

## Standard Response Format

All API responses follow a consistent envelope format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response payload here
  },
  "message": "Operation successful"
}
```

**Status Codes:**
- `200 OK` - GET, PUT operations
- `201 Created` - POST operations
- `204 No Content` - DELETE operations (when no data returned)

### Error Response

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "statusCode": 400
}
```

**Status Codes:**
- `400 Bad Request` - Invalid input/validation failure
- `401 Unauthorized` - Missing authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Duplicate key or state conflict
- `500 Internal Server Error` - Unexpected server error

---

## Vehicles API (Complete CRUD)

### Resource: Vehicle

**Base URL:** `/api/vehicles`

A vehicle represents a transportation asset (minibus, SUV, sedan, etc.) available for TRANSFER service bookings.

#### CREATE: POST /api/vehicles

**Request:**

```http
POST /api/vehicles
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Minibus A",
  "vehicleType": "minibus",
  "capacity": 8,
  "homePort": "Koh Samui Town",
  "registrationNumber": "กข-1234",
  "color": "white",
  "yearOfManufacture": 2022,
  "status": "AVAILABLE",
  "isActive": true,
  "fuelType": "Diesel",
  "fuelCapacity": 60
}
```

**Required Fields:**
- `name` (string) - Vehicle identifier
- `vehicleType` (string) - Type: minibus, suv, sedan, pickup, van, bus, truck, other
- `capacity` (integer) - Passenger capacity (must be > 0)
- `homePort` (string) - Base location

**Optional Fields:**
- `registrationNumber` (string, unique) - License plate
- `color` (string) - Vehicle color
- `yearOfManufacture` (integer) - Year 1900-current year
- `status` (string) - AVAILABLE, MAINTENANCE, RETIRED, OUT_OF_SERVICE
- `isActive` (boolean) - Active status (default: true)
- `fuelType` (string) - Petrol, Diesel, Electric, Hybrid
- `fuelCapacity` (decimal) - Tank size in liters

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "clgj7x5m90000qz08r5x8y9ab",
    "name": "Minibus A",
    "vehicleType": "minibus",
    "capacity": 8,
    "homePort": "Koh Samui Town",
    "registrationNumber": "กข-1234",
    "color": "white",
    "yearOfManufacture": 2022,
    "status": "AVAILABLE",
    "isActive": true,
    "currentLocation": null,
    "fuelType": "Diesel",
    "fuelCapacity": 60,
    "mileage": 0,
    "lastMaintenanceDate": null,
    "nextMaintenanceDate": null,
    "createdAt": "2025-12-09T10:30:00Z",
    "updatedAt": "2025-12-09T10:30:00Z"
  },
  "message": "Vehicle created successfully"
}
```

**Validation Errors:**

```json
{
  "success": false,
  "error": "Capacity must be a positive integer",
  "statusCode": 400
}
```

---

#### READ: GET /api/vehicles

**List all vehicles with optional filters:**

```http
GET /api/vehicles?vehicleType=minibus&status=AVAILABLE&homePort=Koh%20Samui&isActive=true&page=1&limit=20
Authorization: Bearer {token}
```

**Query Parameters:**
- `vehicleType` - Filter by type (minibus, suv, sedan, etc.)
- `status` - Filter by status
- `homePort` - Filter by location
- `isActive` - Filter by active status (true/false)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response:**

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "clgj7x5m90000qz08r5x8y9ab",
        "name": "Minibus A",
        "vehicleType": "minibus",
        "capacity": 8,
        "homePort": "Koh Samui Town",
        "status": "AVAILABLE",
        "isActive": true,
        "createdAt": "2025-12-09T10:30:00Z",
        "updatedAt": "2025-12-09T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  },
  "message": "Vehicles retrieved successfully"
}
```

---

#### READ: GET /api/vehicles/{id}

**Retrieve a single vehicle:**

```http
GET /api/vehicles/clgj7x5m90000qz08r5x8y9ab
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "clgj7x5m90000qz08r5x8y9ab",
    "name": "Minibus A",
    "vehicleType": "minibus",
    "capacity": 8,
    "homePort": "Koh Samui Town",
    "registrationNumber": "กข-1234",
    "color": "white",
    "yearOfManufacture": 2022,
    "status": "AVAILABLE",
    "isActive": true,
    "currentLocation": "Airport",
    "fuelType": "Diesel",
    "fuelCapacity": 60,
    "mileage": 12500,
    "lastMaintenanceDate": "2025-11-15T08:00:00Z",
    "nextMaintenanceDate": "2026-02-15T08:00:00Z",
    "safetyInspectionDate": "2025-11-15T08:00:00Z",
    "insuranceExpiry": "2026-06-30T23:59:59Z",
    "createdAt": "2025-12-09T10:30:00Z",
    "updatedAt": "2025-12-09T14:45:00Z"
  },
  "message": "Vehicle retrieved successfully"
}
```

---

#### UPDATE: PUT /api/vehicles/{id}

**Update vehicle details (partial update supported):**

```http
PUT /api/vehicles/clgj7x5m90000qz08r5x8y9ab
Content-Type: application/json
Authorization: Bearer {token}

{
  "currentLocation": "Airport",
  "status": "MAINTENANCE",
  "maintenanceUntil": "2025-12-20T23:59:59Z",
  "mileage": 12500,
  "nextMaintenanceDate": "2026-02-15"
}
```

**Updateable Fields:**
- `name`, `vehicleType`, `capacity`, `homePort`
- `registrationNumber`, `color`, `yearOfManufacture`
- `status`, `isActive`
- `currentLocation`, `maintenanceUntil`
- `lastMaintenanceDate`, `nextMaintenanceDate`, `maintenanceNotes`
- `safetyInspectionDate`, `safetyInspectionValid`, `insuranceExpiry`
- `fuelType`, `fuelCapacity`, `fuelConsumption`, `mileage`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "clgj7x5m90000qz08r5x8y9ab",
    "status": "MAINTENANCE",
    "currentLocation": "Airport",
    "maintenanceUntil": "2025-12-20T23:59:59Z",
    "mileage": 12500,
    "updatedAt": "2025-12-09T15:00:00Z"
  },
  "message": "Vehicle updated successfully"
}
```

---

#### DELETE: DELETE /api/vehicles/{id}

**Soft delete a vehicle (marks as inactive):**

```http
DELETE /api/vehicles/clgj7x5m90000qz08r5x8y9ab
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "clgj7x5m90000qz08r5x8y9ab",
    "isActive": false,
    "status": "RETIRED",
    "maintenanceUntil": "2025-12-09T15:00:00Z"
  },
  "message": "Vehicle deleted successfully"
}
```

**Note:** Soft delete sets `isActive: false` and `status: RETIRED`. The record remains in the database for audit purposes.

---

## Speedboat Rates API (Complete CRUD)

### Resource: SpeedboatRate

**Base URL:** `/api/speedboat-rates`

Pricing rates for speedboat services (day trips, island hopping, etc.) with support for seasonal variations and capacity-based pricing.

#### CREATE: POST /api/speedboat-rates

```http
POST /api/speedboat-rates
Content-Type: application/json

{
  "speedboatId": "clgj7x5m90000qz08r5x8y9ab",
  "serviceType": "DAY_TRIP",
  "basePrice": 5000,
  "pricePerPerson": 500,
  "duration": 480,
  "minCapacity": 4,
  "maxCapacity": 12,
  "fuelSurcharge": 1000,
  "crewCost": 1500,
  "capacityDiscount": 5,
  "isSeasonalRate": true,
  "seasonStart": 12,
  "seasonEnd": 2,
  "seasonMultiplier": 1.5,
  "validFrom": "2025-12-09",
  "validUntil": "2026-12-08"
}
```

**Required Fields:**
- `speedboatId` (string) - ID of the speedboat
- `serviceType` (string) - DAY_TRIP, ISLAND_HOPPING, SUNSET_CRUISE, etc.
- `basePrice` (decimal) - Base price in currency units
- `duration` (integer) - Trip duration in minutes
- `minCapacity` (integer) - Minimum passengers
- `maxCapacity` (integer) - Maximum passengers

**Optional Fields:**
- `pricePerPerson` (decimal) - Per-person pricing
- `fuelSurcharge` (decimal) - Fuel cost surcharge
- `crewCost` (decimal) - Crew cost
- `capacityDiscount` (decimal) - Discount percentage for full capacity
- `isSeasonalRate` (boolean) - Seasonal variation flag
- `seasonStart` (integer) - Month 1-12
- `seasonEnd` (integer) - Month 1-12
- `seasonMultiplier` (decimal) - Seasonal price multiplier
- `validFrom` (date) - Rate effective date
- `validUntil` (date) - Rate expiration date

**Response:** Created SpeedboatRate object with speedboat relation

---

#### READ: GET /api/speedboat-rates

```http
GET /api/speedboat-rates?speedboatId=clgj7x5m90000qz08r5x8y9ab&serviceType=DAY_TRIP
```

**Query Parameters:**
- `speedboatId` - Filter by speedboat ID
- `serviceType` - Filter by service type

**Response:** Array of SpeedboatRate objects

---

#### READ: GET /api/speedboat-rates/{id}

```http
GET /api/speedboat-rates/clgj7x5m90000qz08r5x8y9ab
```

**Response:** Single SpeedboatRate object with speedboat relation

---

#### UPDATE: PUT /api/speedboat-rates/{id}

```http
PUT /api/speedboat-rates/clgj7x5m90000qz08r5x8y9ab
Content-Type: application/json

{
  "basePrice": 5500,
  "seasonMultiplier": 1.6,
  "validUntil": "2026-12-31"
}
```

**Updateable Fields:**
- All rate pricing fields: `basePrice`, `pricePerPerson`, `fuelSurcharge`, `crewCost`, `capacityDiscount`, `seasonMultiplier`
- Capacity: `minCapacity`, `maxCapacity`
- Seasonal: `isSeasonalRate`, `seasonStart`, `seasonEnd`
- Validity: `validFrom`, `validUntil`
- Service: `serviceType`, `duration`

**Response:** Updated SpeedboatRate object

---

#### DELETE: DELETE /api/speedboat-rates/{id}

```http
DELETE /api/speedboat-rates/clgj7x5m90000qz08r5x8y9ab
```

**Response:** Deleted SpeedboatRate object with `validUntil` set to today

**Soft Delete Strategy:** Sets `validUntil` to today, effectively expiring the rate. Queries should filter `validUntil >= today` to get active rates.

---

## Tour Rates API (Complete CRUD)

### Resource: TourRate

**Base URL:** `/api/tour-rates`

Group size-based pricing for tour packages.

#### CREATE: POST /api/tour-rates

```http
POST /api/tour-rates
Content-Type: application/json

{
  "tourPackageId": "clgj7x5m90000qz08r5x8y9ab",
  "minGroupSize": 1,
  "maxGroupSize": 4,
  "pricePerPerson": 2500,
  "minimumGroupPrice": 8000,
  "isSeasonalRate": true,
  "seasonStart": 12,
  "seasonEnd": 2,
  "seasonMultiplier": 1.3
}
```

**Required Fields:**
- `tourPackageId` (string)
- `minGroupSize` (integer) - Minimum group size for this tier
- `maxGroupSize` (integer) - Maximum group size for this tier
- `pricePerPerson` (decimal)

**Optional Fields:**
- `minimumGroupPrice` (decimal) - Minimum total price
- `isSeasonalRate` (boolean)
- `seasonStart`, `seasonEnd` (integer) - Months 1-12
- `seasonMultiplier` (decimal)

**Response:** Created TourRate object

---

#### READ: GET /api/tour-rates

```http
GET /api/tour-rates?tourPackageId=clgj7x5m90000qz08r5x8y9ab
```

**Query Parameters:**
- `tourPackageId` - Filter by tour package ID
- `minGroupSize` - Filter by group size

**Response:** Array of TourRate objects sorted by minGroupSize

---

#### READ: GET /api/tour-rates/{id}

```http
GET /api/tour-rates/clgj7x5m90000qz08r5x8y9ab
```

**Response:** Single TourRate object with tourPackage relation

---

#### UPDATE: PUT /api/tour-rates/{id}

```http
PUT /api/tour-rates/clgj7x5m90000qz08r5x8y9ab
Content-Type: application/json

{
  "pricePerPerson": 2800,
  "seasonMultiplier": 1.4
}
```

**Updateable Fields:**
- `minGroupSize`, `maxGroupSize`
- `pricePerPerson`, `minimumGroupPrice`
- `isSeasonalRate`, `seasonStart`, `seasonEnd`, `seasonMultiplier`

**Response:** Updated TourRate object

---

#### DELETE: DELETE /api/tour-rates/{id}

```http
DELETE /api/tour-rates/clgj7x5m90000qz08r5x8y9ab
```

**Response:** Deleted TourRate object with `validUntil` set to today

---

## Event Rates API (Complete CRUD)

### Resource: EventRate

**Base URL:** `/api/event-rates`

Tier-based pricing for events with different price tiers by booking timing or group characteristics.

#### CREATE: POST /api/event-rates

```http
POST /api/event-rates
Content-Type: application/json

{
  "eventId": "clgj7x5m90000qz08r5x8y9ab",
  "tierName": "Early Bird",
  "description": "Early booking discount",
  "validFrom": "2025-12-09",
  "validUntil": "2025-12-31",
  "pricePerPerson": 1500,
  "minimumPartySize": 10,
  "isActive": true
}
```

**Required Fields:**
- `eventId` (string)
- `tierName` (string) - Tier identifier
- `validFrom` (date)
- `validUntil` (date)
- `pricePerPerson` (decimal)

**Optional Fields:**
- `description` (string)
- `minimumPartySize` (integer, default: 1)
- `isActive` (boolean, default: true)

**Response:** Created EventRate object

---

#### READ: GET /api/event-rates

```http
GET /api/event-rates?eventId=clgj7x5m90000qz08r5x8y9ab
```

**Query Parameters:**
- `eventId` - Filter by event ID

**Response:** Array of EventRate objects sorted by tierName

---

#### READ: GET /api/event-rates/{id}

```http
GET /api/event-rates/clgj7x5m90000qz08r5x8y9ab
```

**Response:** Single EventRate object with event relation

---

#### UPDATE: PUT /api/event-rates/{id}

```http
PUT /api/event-rates/clgj7x5m90000qz08r5x8y9ab
Content-Type: application/json

{
  "pricePerPerson": 1800,
  "validUntil": "2026-01-15"
}
```

**Updateable Fields:**
- `tierName`, `description`
- `pricePerPerson`, `minimumPartySize`
- `validFrom`, `validUntil`
- `isActive`

**Response:** Updated EventRate object

---

#### DELETE: DELETE /api/event-rates/{id}

```http
DELETE /api/event-rates/clgj7x5m90000qz08r5x8y9ab
```

**Response:** Deleted EventRate object with `isActive: false` and `validUntil` set to today

---

## Service Rates API (Complete CRUD)

### Resource: ServiceRate

**Base URL:** `/api/service-rates`

Generic distance-based pricing rates for all service types (TRANSFER, BOAT, TOUR, EVENT).

#### CREATE: POST /api/service-rates

```http
POST /api/service-rates
Content-Type: application/json

{
  "serviceType": "TRANSFER",
  "vehicleType": "minibus",
  "basePrice": 1000,
  "distanceRate": 50,
  "minDistance": 0,
  "maxDistance": 100,
  "description": "Minibus transfer rate",
  "isActive": true
}
```

**Required Fields:**
- `serviceType` (enum) - TRANSFER, BOAT, TOUR, EVENT, PACKAGE
- `vehicleType` (string) - minibus, suv, sedan, speedboat_6person, etc.
- `basePrice` (decimal) - Base price (must be >= 0)
- `distanceRate` (decimal) - Price per km (must be >= 0)

**Optional Fields:**
- `minDistance` (integer) - Minimum distance threshold
- `maxDistance` (integer) - Maximum distance threshold
- `description` (string) - Rate description
- `isActive` (boolean, default: true)

**Response:** Created ServiceRate object

---

#### READ: GET /api/service-rates

```http
GET /api/service-rates?serviceType=TRANSFER&vehicleType=minibus&isActive=true&page=1&limit=20
```

**Query Parameters:**
- `serviceType` - Filter by service type
- `vehicleType` - Filter by vehicle type
- `isActive` - Filter by active status (true/false)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response:** ServiceRate objects with pagination metadata

---

#### READ: GET /api/service-rates/{id}

```http
GET /api/service-rates/clgj7x5m90000qz08r5x8y9ab
```

**Response:** Single ServiceRate object

---

#### UPDATE: PUT /api/service-rates/{id}

```http
PUT /api/service-rates/clgj7x5m90000qz08r5x8y9ab
Content-Type: application/json

{
  "basePrice": 1200,
  "distanceRate": 55
}
```

**Updateable Fields:**
- `serviceType`, `vehicleType`
- `basePrice`, `distanceRate` (must be positive)
- `minDistance`, `maxDistance`
- `description`
- `isActive`

**Response:** Updated ServiceRate object

---

#### DELETE: DELETE /api/service-rates/{id}

```http
DELETE /api/service-rates/clgj7x5m90000qz08r5x8y9ab
```

**Response:** Deleted ServiceRate object with `isActive: false`

---

## Error Handling

### Common Error Responses

#### Validation Error (400)

```json
{
  "success": false,
  "error": "Capacity must be a positive integer",
  "statusCode": 400
}
```

#### Not Found (404)

```json
{
  "success": false,
  "error": "Vehicle not found",
  "statusCode": 404
}
```

#### Conflict (409)

```json
{
  "success": false,
  "error": "A vehicle with this registration number already exists",
  "statusCode": 409
}
```

#### Unauthorized (401)

```json
{
  "success": false,
  "error": "Missing or invalid authentication",
  "statusCode": 401
}
```

#### Forbidden (403)

```json
{
  "success": false,
  "error": "Insufficient permissions for this operation",
  "statusCode": 403
}
```

---

## Validation Patterns

### Common Validation Rules

#### Numeric Validation

```typescript
// Positive integers
capacity >= 1 && Number.isInteger(capacity)

// Decimal prices (positive)
price >= 0 && typeof price === 'number'

// Year validation
yearOfManufacture >= 1900 && yearOfManufacture <= currentYear
```

#### Date Validation

```typescript
// Date range validation
validFrom < validUntil

// Future dates
inspectionDate <= today
maintenanceDate >= today (optional, future allowed)
```

#### Enum Validation

```typescript
// Vehicle types
validTypes = ['minibus', 'suv', 'sedan', 'pickup', 'van', 'bus', 'truck', 'other']

// Service types
validServices = ['TRANSFER', 'BOAT', 'TOUR', 'EVENT', 'PACKAGE']

// Status types
validStatus = ['AVAILABLE', 'MAINTENANCE', 'RETIRED', 'OUT_OF_SERVICE']
```

#### Capacity Validation

```typescript
// Capacity constraints
minCapacity < maxCapacity
minCapacity >= 1
maxCapacity >= minCapacity
```

---

## Soft Delete Strategy

### Why Soft Deletes?

1. **Audit Trail:** Keep historical records for compliance
2. **Data Integrity:** Don't break foreign key relationships
3. **Recovery:** Ability to reactivate inactive records
4. **Reporting:** Generate historical reports

### Implementation

#### For Date-Based Resources (Rates)

```typescript
// Soft delete by expiring the rate
UPDATE speedboatRate 
SET validUntil = TODAY 
WHERE id = ?

// Query active rates
WHERE validUntil >= TODAY
```

#### For Status-Based Resources (Vehicles)

```typescript
// Soft delete by marking inactive
UPDATE vehicle 
SET isActive = false, status = 'RETIRED' 
WHERE id = ?

// Query active vehicles
WHERE isActive = true
```

#### For Boolean Flag Resources (ServiceRate)

```typescript
// Soft delete by deactivating
UPDATE serviceRate 
SET isActive = false 
WHERE id = ?

// Query active rates
WHERE isActive = true
```

### Filtering Active Records

Always filter out soft-deleted records in GET queries:

```typescript
// GET requests
const where = {
  isActive: true,        // For vehicles, service rates
  validUntil: { gte: today } // For speedboat, tour, event rates
}
```

---

## Pagination & Filtering

### Pagination Parameters

All list endpoints support standard pagination:

```http
GET /api/resources?page=1&limit=20
```

**Parameters:**
- `page` - Page number (1-indexed, default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response Structure:**

```json
{
  "success": true,
  "data": {
    "data": [ /* array of items */ ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### Filtering Examples

#### Vehicles by Type and Status

```http
GET /api/vehicles?vehicleType=minibus&status=AVAILABLE&isActive=true
```

#### Rates by Service and Vehicle

```http
GET /api/service-rates?serviceType=TRANSFER&vehicleType=minibus&isActive=true
```

#### Rates by Date Range

Rates are filtered by `validUntil >= today` automatically in queries.

---

## Code Implementation Patterns

### Create Handler Pattern

```typescript
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // 1. Validate required fields
    requireFields(body, ['field1', 'field2'])
    
    // 2. Validate field values
    if (field < 0) return errorResponse('Must be positive', 400)
    
    // 3. Check constraints (uniqueness, relationships)
    const existing = await prisma.model.findUnique({...})
    if (existing) return errorResponse('Duplicate', 409)
    
    // 4. Create record
    const created = await prisma.model.create({...})
    
    // 5. Return success with 201
    return successResponse(created, 'Created', 201)
  } catch (error) {
    return handleApiError(error)
  }
}
```

### Update Handler Pattern

```typescript
export async function PUT(req: NextRequest, { params }) {
  try {
    const { id } = params
    const body = await req.json()
    
    // 1. Validate ID
    validateId(id, 'resource')
    
    // 2. Check exists
    const existing = await prisma.model.findUnique({...})
    if (!existing) throw new ApiError(404, 'Not found')
    
    // 3. Build update data (only provided fields)
    const updateData: any = {}
    if (body.field !== undefined) updateData.field = body.field
    
    // 4. Validate update data
    if (updateData.price < 0) return errorResponse('Invalid', 400)
    
    // 5. Update record
    const updated = await prisma.model.update({...})
    
    // 6. Return success
    return successResponse(updated, 'Updated')
  } catch (error) {
    return handleApiError(error)
  }
}
```

### Delete Handler Pattern

```typescript
export async function DELETE(req: NextRequest, { params }) {
  try {
    const { id } = params
    
    // 1. Validate ID
    validateId(id, 'resource')
    
    // 2. Check exists
    const existing = await prisma.model.findUnique({...})
    if (!existing) throw new ApiError(404, 'Not found')
    
    // 3. Soft delete (mark as inactive/expired)
    const deleted = await prisma.model.update({
      where: { id },
      data: {
        isActive: false,
        validUntil: new Date(), // or similar
      }
    })
    
    // 4. Return deleted record
    return successResponse(deleted, 'Deleted')
  } catch (error) {
    return handleApiError(error)
  }
}
```

---

## Testing CRUD Operations

### Using curl

```bash
# Create
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Vehicle",
    "vehicleType": "minibus",
    "capacity": 8,
    "homePort": "Samui"
  }'

# Read List
curl http://localhost:3000/api/vehicles?page=1&limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Read Single
curl http://localhost:3000/api/vehicles/{id} \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update
curl -X PUT http://localhost:3000/api/vehicles/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "MAINTENANCE"}'

# Delete
curl -X DELETE http://localhost:3000/api/vehicles/{id} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Import the API collection
2. Set `{{baseUrl}}` to `http://localhost:3000`
3. Set `{{token}}` in Auth tab
4. Follow CRUD sequence per endpoint

---

## API Endpoints Summary

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/api/vehicles` | List vehicles | ✅ |
| POST | `/api/vehicles` | Create vehicle | ✅ |
| GET | `/api/vehicles/{id}` | Get vehicle | ✅ |
| PUT | `/api/vehicles/{id}` | Update vehicle | ✅ |
| DELETE | `/api/vehicles/{id}` | Delete vehicle | ✅ |
| GET | `/api/speedboat-rates` | List rates | ✅ |
| POST | `/api/speedboat-rates` | Create rate | ✅ |
| GET | `/api/speedboat-rates/{id}` | Get rate | ✅ |
| PUT | `/api/speedboat-rates/{id}` | Update rate | ✅ |
| DELETE | `/api/speedboat-rates/{id}` | Delete rate | ✅ |
| GET | `/api/tour-rates` | List rates | ✅ |
| POST | `/api/tour-rates` | Create rate | ✅ |
| GET | `/api/tour-rates/{id}` | Get rate | ✅ |
| PUT | `/api/tour-rates/{id}` | Update rate | ✅ |
| DELETE | `/api/tour-rates/{id}` | Delete rate | ✅ |
| GET | `/api/event-rates` | List rates | ✅ |
| POST | `/api/event-rates` | Create rate | ✅ |
| GET | `/api/event-rates/{id}` | Get rate | ✅ |
| PUT | `/api/event-rates/{id}` | Update rate | ✅ |
| DELETE | `/api/event-rates/{id}` | Delete rate | ✅ |
| GET | `/api/service-rates` | List rates | ✅ |
| POST | `/api/service-rates` | Create rate | ✅ |
| GET | `/api/service-rates/{id}` | Get rate | ✅ |
| PUT | `/api/service-rates/{id}` | Update rate | ✅ |
| DELETE | `/api/service-rates/{id}` | Delete rate | ✅ |

---

## Status: Complete ✅

- ✅ Vehicles CRUD API (5/5 operations)
- ✅ Speedboat Rates CRUD (5/5 operations)
- ✅ Tour Rates CRUD (5/5 operations)
- ✅ Event Rates CRUD (5/5 operations)
- ✅ Service Rates CRUD (5/5 operations)
- ✅ Standard validation patterns
- ✅ Error handling
- ✅ Soft delete strategy
- ✅ Pagination & filtering

**Total Operations:** 25/25 ✅
**Total Endpoints:** 30 ✅

