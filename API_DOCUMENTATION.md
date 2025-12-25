# API Documentation - Samui Transfers

**Generated:** December 8, 2025  
**Version:** 1.0.0  
**Base URL:** `/api`

## Overview

The Samui Transfers API provides complete endpoints for managing:
- 🚤 **Speedboat Services** - Transfers and island hopping tours
- 🎫 **Tour Packages** - Multi-day cultural and adventure tours
- 🎉 **Special Events** - Private events and celebrations
- 📅 **Bookings** - Single and multi-service reservations
- 👨‍✈️ **Drivers/Captains** - Staff management and assignments
- 💰 **Pricing & Rates** - Dynamic rate management

## Authentication

All endpoints except public listings require authentication.

**Header-based Authentication (Current):**
```bash
Authorization: Bearer <token>
X-User-Id: <user-id>
X-User-Email: <email>
X-User-Role: <ADMIN|STAFF|USER>
```

**Integration with Auth.js (Coming):**
Uses NextAuth.js v5-beta for session management and JWT tokens.

## Response Format

All endpoints return responses in this format:

**Success Response (2xx):**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation description",
  "timestamp": "2025-12-08T12:34:56.789Z"
}
```

**Error Response (4xx/5xx):**
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2025-12-08T12:34:56.789Z"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": {
    "data": [ /* array of items */ ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  },
  "timestamp": "2025-12-08T12:34:56.789Z"
}
```

## Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions for resource |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists or conflict detected |
| 500 | Server Error | Internal server error |

## API Endpoints

### Speedboats

#### GET /speedboats
List all speedboats with filtering and pagination.

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 20) - Items per page
- `location` (string) - Filter by location
- `minCapacity` (integer) - Minimum passenger capacity

**Example Request:**
```bash
curl "http://localhost:3001/api/speedboats?page=1&limit=10&location=Koh%20Samui"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "cuid123",
        "name": "Ocean Explorer",
        "registrationNumber": "KS-001",
        "capacity": 8,
        "basePrice": 2500,
        "location": "Koh Samui",
        "isActive": true,
        "createdAt": "2025-12-08T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### POST /speedboats
Create a new speedboat (Admin only).

**Request Body:**
```json
{
  "name": "Ocean Explorer",
  "registrationNumber": "KS-001",
  "capacity": 8,
  "location": "Koh Samui",
  "basePrice": 2500
}
```

**Requirements:**
- Authorization: Admin role required
- name (string, required)
- registrationNumber (string, required, unique)
- capacity (integer, required)

#### GET /speedboats/{id}
Get details of a specific speedboat.

**Path Parameters:**
- `id` (string, required) - Speedboat ID

#### PUT /speedboats/{id}
Update speedboat information (Admin only).

**Request Body:**
Any fields can be updated:
```json
{
  "name": "Updated Name",
  "basePrice": 3000,
  "isActive": true
}
```

#### DELETE /speedboats/{id}
Soft delete a speedboat (Admin only).

---

### Drivers

#### GET /drivers
List all drivers with filtering.

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20)
- `status` (string) - Filter by status (available, busy, offline, deleted)
- `isBoatOperator` (boolean) - Filter by boat operator capability
- `isTourGuide` (boolean) - Filter by tour guide capability

**Example:**
```bash
curl "http://localhost:3001/api/drivers?isBoatOperator=true&status=available"
```

#### POST /drivers
Register a new driver (Admin only).

**Request Body:**
```json
{
  "userId": "user-123",
  "licenseNumber": "DL-789456",
  "licenseExpiry": "2026-12-31",
  "isBoatOperator": true,
  "isTourGuide": false,
  "certifications": {
    "boatLicense": "BL-12345",
    "safetyTraining": "completed"
  }
}
```

#### GET /drivers/{id}
Get driver details with assignment history.

#### PATCH /drivers/{id}
Update driver information (Admin only).

**Request Body:**
```json
{
  "status": "available",
  "acceptingRides": true,
  "licenseExpiry": "2027-12-31",
  "certifications": {
    "safetyTraining": "completed"
  }
}
```

#### DELETE /drivers/{id}
Soft delete a driver (Admin only).

---

### Captain Assignments

#### GET /speedboat-captains
List captain assignments.

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20)
- `speedboatId` (string) - Filter by speedboat
- `captainId` (string) - Filter by captain
- `status` (string) - Filter by status (ACTIVE, ON_LEAVE, RETIRED)

#### POST /speedboat-captains
Assign a captain to a speedboat.

**Request Body:**
```json
{
  "speedboatId": "boat-123",
  "captainId": "driver-456",
  "boatOperatorLicense": true,
  "licenseExpiry": "2026-12-31",
  "safetyTraining": true,
  "safetyTrainingExpiry": "2025-12-31",
  "status": "ACTIVE"
}
```

#### GET /speedboat-captains/{id}
Get captain assignment details.

#### PATCH /speedboat-captains/{id}
Update captain assignment.

**Request Body:**
```json
{
  "status": "ON_LEAVE",
  "boatOperatorLicense": true,
  "licenseExpiry": "2027-12-31"
}
```

#### DELETE /speedboat-captains/{id}
Remove captain assignment.

---

### Bookings - Multi-Service Bundles

#### GET /bookings/bundle
List multi-service booking bundles.

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20)
- `userId` (string) - Filter by user
- `status` (string) - Filter by status

#### POST /bookings/bundle
Create a multi-service booking bundle.

**Request Body:**
```json
{
  "userId": "user-123",
  "services": [
    {
      "serviceType": "BOAT",
      "serviceBookingId": "boat-booking-456"
    },
    {
      "serviceType": "TOUR",
      "serviceBookingId": "tour-booking-789"
    }
  ],
  "bundleDiscount": 10,
  "details": {
    "specialRequests": "No dietary restrictions"
  }
}
```

**Requirements:**
- Minimum 2 services required
- All service bookings must exist
- Bundle discount 0-100%

#### GET /bookings/bundle/{id}
Get bundle booking details with all child services.

#### PATCH /bookings/bundle/{id}
Update bundle booking (status, pricing, details).

**Request Body:**
```json
{
  "status": "CONFIRMED",
  "paymentStatus": "COMPLETED",
  "bundleDiscount": 15
}
```

#### DELETE /bookings/bundle/{id}
Cancel a bundle booking (cancels all child services).

**Request Body:**
```json
{
  "cancellationReason": "Customer requested"
}
```

---

### Service Rates

#### GET /service-rates
List all service rates.

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20)
- `serviceType` (string) - TRANSFER, BOAT, TOUR, EVENT, PACKAGE
- `vehicleType` (string) - Filter by vehicle type
- `isActive` (boolean) - Filter by active status

#### POST /service-rates
Create a service rate (Admin only).

**Request Body:**
```json
{
  "serviceType": "BOAT",
  "vehicleType": "speedboat_6person",
  "basePrice": 2500,
  "distanceRate": 50,
  "minDistance": 1,
  "maxDistance": 100,
  "description": "6-person speedboat hourly rate",
  "isActive": true
}
```

#### GET /service-rates/{id}
Get service rate details.

#### PUT /service-rates/{id}
Update service rate (Admin only).

**Request Body:**
```json
{
  "basePrice": 2800,
  "distanceRate": 55,
  "isActive": true
}
```

#### DELETE /service-rates/{id}
Delete service rate (marks as inactive).

---

## Common Query Patterns

### Pagination
All list endpoints support pagination:
```bash
GET /api/speedboats?page=2&limit=50
```

### Filtering
Filter by any indexed field:
```bash
GET /api/drivers?status=available&isBoatOperator=true
GET /api/bookings/bundle?userId=user-123&status=CONFIRMED
```

### Sorting
Most endpoints sort by `createdAt: 'desc'` by default.

---

## Rate Limiting

**Current:** No rate limiting implemented  
**Planned:** User-based rate limits (Phase 3)
- 100 requests/minute for authenticated users
- 20 requests/minute for public endpoints

---

## OpenAPI/Swagger Specification

Full OpenAPI 3.0 specification available at:
```
GET /api/docs/openapi
```

Use with Swagger UI or other OpenAPI tools:
```bash
# View in Swagger UI
https://editor.swagger.io/?url=/api/docs/openapi
```

---

## Integration Examples

### JavaScript/Fetch
```javascript
const response = await fetch('/api/speedboats', {
  headers: {
    'Authorization': 'Bearer token123',
    'X-User-Id': 'user-456',
    'X-User-Email': 'user@example.com',
    'X-User-Role': 'STAFF'
  }
})
const data = await response.json()
```

### cURL
```bash
curl -X POST http://localhost:3001/api/drivers \
  -H "Authorization: Bearer token123" \
  -H "X-User-Id: user-456" \
  -H "X-User-Email: admin@example.com" \
  -H "X-User-Role: ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-789",
    "licenseNumber": "DL-654321"
  }'
```

### TypeScript with Axios
```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Authorization': 'Bearer ' + token,
    'X-User-Id': userId,
    'X-User-Email': email,
    'X-User-Role': role
  }
})

const speedboats = await api.get('/speedboats')
```

---

## Changelog

### v1.0.0 (December 8, 2025)
- Initial API release
- 40+ endpoints implemented
- Full CRUD operations for all services
- Multi-service booking bundles
- Captain and driver management
- Dynamic pricing and rates
- Authentication middleware

---

## Support

For API issues or questions:
- 📧 Email: api-support@samui-transfers.com
- 🐛 Report bugs: https://github.com/psinthorn/samui-transfers/issues
- 📚 Documentation: https://samui-transfers.com/api/docs
