# Phase 2 Next Steps - Quick Reference

**Status:** Phase 2 is 65% complete (13/20 tasks)  
**Current State:** ✅ Build passing, APIs functional, dev server ready  
**Next Focus:** Complete remaining 7 tasks + authentication + testing

---

## ✅ Pre-Session Verification Checklist

**Start every new session with these checks:**

- [ ] Verify build passes: `npm run build`
- [ ] Start dev server: `npm run dev`
- [ ] Test API endpoint: `curl -s http://localhost:3001/api/speedboats`
- [ ] Review SESSION_BUILD_FIX_FINAL_SUMMARY.md for context
- [ ] Check git status for any uncommitted changes

---

## 📋 Task Breakdown - Remaining 7 Tasks (7-10 hours)

### Task 2.6: Captain Assignment API (30 mins)
**Files to create:**
- `app/api/speedboat-captains/route.ts` (GET list, POST assign)
- `app/api/speedboat-captains/[id]/route.ts` (PATCH update, DELETE unassign)

**Endpoints:**
- `GET /api/speedboat-captains` - List captain assignments
- `POST /api/speedboat-captains` - Assign captain to speedboat
- `PATCH /api/speedboat-captains/[id]` - Update certifications/licenses
- `DELETE /api/speedboat-captains/[id]` - Unassign captain

**Model Reference:** `SpeedboatCaptainAssignment`
- `id`: String (primary key)
- `speedboatId`: String (foreign key)
- `captainId`: String (foreign key)
- `licenseType`: String
- `validFrom`: DateTime
- `validTo`: DateTime
- `createdAt`: DateTime
- `updatedAt`: DateTime

**API Pattern to Follow:** Use existing speedboat routes as template

---

### Task 2.14: Multi-service Booking API (45 mins)
**Files to create:**
- `app/api/bookings/bundle/route.ts` (POST create bundle)
- `app/api/bookings/bundle/[id]/route.ts` (GET detail, PATCH update)

**Endpoints:**
- `POST /api/bookings/bundle` - Create multi-service booking
- `GET /api/bookings/bundle/[id]` - Get bundle details
- `PATCH /api/bookings/bundle/[id]` - Update bundle pricing/dates

**What it does:**
- Combine multiple services (boat + tour, or tour + event)
- Apply bundle discounts
- Manage dependencies and validations
- Calculate total pricing

**Model Reference:** `Booking` (main table for bundled bookings)
- Links to: SpeedboatBooking, TourBooking, EventBooking
- Parent/child relationships

---

### Task 2.15: Driver Management API (30 mins)
**Files to create:**
- `app/api/drivers/route.ts` (GET list, POST create)
- `app/api/drivers/[id]/route.ts` (GET detail, PUT update, DELETE soft)

**Endpoints:**
- `GET /api/drivers` - List drivers with filters
- `POST /api/drivers` - Register new driver
- `GET /api/drivers/[id]` - Get driver details
- `PUT /api/drivers/[id]` - Update driver info
- `DELETE /api/drivers/[id]` - Soft delete driver

**Model Reference:** `Driver` (extends existing model)
- `id`, `name`, `email`, `phone`, `licenseNumber`
- `canOperateBoats`, `canDriveTours` (boolean flags)
- `certifications` (JSON field)
- `deletedAt` (soft delete)

---

### Task 2.16: Service Rates API (30 mins)
**Files to create:**
- `app/api/service-rates/route.ts` (GET list, POST create)
- `app/api/service-rates/[id]/route.ts` (PUT update, DELETE)

**Endpoints:**
- `GET /api/service-rates` - List all service rates
- `POST /api/service-rates` - Create generic rate
- `PUT /api/service-rates/[id]` - Update rate
- `DELETE /api/service-rates/[id]` - Delete rate

**Model Reference:** `ServiceRate` (generic base)
- `id`, `serviceType` (TRANSFER, BOAT, TOUR, EVENT, PACKAGE)
- `name`, `basePrice`, `description`
- Supports seasonal multipliers
- Discount/markup calculations

**Note:** This is generic version; specific rates are in SpeedboatRate, TourRate, EventRate

---

### Task 2.18: Authentication & Authorization (1 hour)
**Files to create/modify:**
- `app/api/middleware/auth.ts` - Auth middleware
- Modify all existing route files to add auth checks

**What to implement:**
1. JWT token validation
2. Role-based access control (ADMIN, STAFF, USER)
3. User context in requests
4. Permission checks per operation

**Pattern:**
```typescript
// Add to top of each route
import { authenticateRequest, requireRole } from '@/app/api/middleware/auth'

export async function GET(req: NextRequest) {
  const { user } = await authenticateRequest(req)
  if (!user) return createErrorResponse('Unauthorized', 401)
  
  await requireRole(user, 'ADMIN')
  // ... rest of function
}
```

**Roles to implement:**
- ADMIN: Full access
- STAFF: Can view/modify bookings, rates
- USER: Can only view own bookings

---

### Task 2.19: API Documentation (45 mins)
**Output format:** Swagger/OpenAPI YAML or JSON

**What to document:**
1. All 30+ endpoints with request/response examples
2. Authentication requirements
3. Error responses and codes
4. Query parameters and filters
5. Pagination information

**File to create:**
- `app/api/docs/openapi.yaml` OR
- `public/api-docs.json`

**Or use Swagger UI:**
- Install: `npm install swagger-ui-react`
- Create: `app/api/docs/route.ts` (Swagger UI endpoint)

**Reference for each endpoint:**
- Method (GET, POST, PATCH, PUT, DELETE)
- Path with parameters
- Request body schema
- Response 200, 400, 401, 404, 500 examples
- Required authentication

---

### Task 2.20: API Testing Suite (1.5 hours)
**Testing framework options:**
1. Jest + Supertest (recommended)
2. Vitest + Supertest
3. Playwright API testing

**Test structure:**
```
__tests__/
  ├── api/
  │   ├── speedboats.test.ts
  │   ├── tours.test.ts
  │   ├── events.test.ts
  │   ├── bookings.test.ts
  │   └── authentication.test.ts
```

**Test coverage targets:**
- Happy path (success cases)
- Validation failures
- Not found errors
- Unauthorized/forbidden
- Business logic (availability, capacity)
- Error handling

**Test template:**
```typescript
describe('GET /api/speedboats', () => {
  it('should return list of speedboats', async () => {
    const response = await request(app)
      .get('/api/speedboats')
      .expect(200)
    
    expect(response.body).toHaveProperty('data')
    expect(response.body).toHaveProperty('pagination')
  })
  
  it('should filter by location', async () => {
    const response = await request(app)
      .get('/api/speedboats?location=Koh+Samui')
      .expect(200)
    
    expect(response.body.data).toBeTruthy()
  })
})
```

---

## 🗂 File Reference Guide

### Schema Reference
- **File:** `prisma/schema.prisma`
- **Use:** Verify field names, relations, enums
- **Pattern:** Always check schema before writing queries

### Response Format Reference
- **File:** `app/api/utils/api-response.ts`
- **Use:** Consistent response formatting
- **Pattern:** Always use `createSuccessResponse()` and `createErrorResponse()`

### Validation Utilities
- **File:** `app/api/utils/validation.ts`
- **Use:** Input validation functions
- **Pattern:** Import and use validators in routes

### Existing API Routes (as template)
- **Speedboat:** `app/api/speedboats/route.ts` (GET list, POST create)
- **Speedboat Detail:** `app/api/speedboats/[id]/route.ts` (GET, PUT, DELETE)
- **Speedboat Rates:** `app/api/speedboat-rates/route.ts` (GET, POST)

---

## 🔄 Standard Implementation Pattern

**For each new API endpoint:**

1. **Create main route file:**
   ```typescript
   import { NextRequest } from 'next/server'
   import { prisma } from '@/lib/prisma'
   import { createSuccessResponse, createErrorResponse } from '@/app/api/utils/api-response'
   
   export async function GET(req: NextRequest) {
     try {
       // Get query params
       const page = req.nextUrl.searchParams.get('page') || '1'
       // Fetch from DB
       // Return response
       return createSuccessResponse(data)
     } catch (error) {
       return createErrorResponse('Error message', 500)
     }
   }
   
   export async function POST(req: NextRequest) {
     try {
       // Validate input
       // Create in DB
       // Return response
       return createSuccessResponse(created, 201)
     } catch (error) {
       return createErrorResponse('Error message', 400)
     }
   }
   ```

2. **Create [id] route file for detail operations:**
   ```typescript
   export async function GET(
     req: NextRequest,
     { params }: { params: Promise<{ id: string }> }
   ) {
     const { id } = await params
     // Implementation
   }
   
   export async function PATCH(
     req: NextRequest,
     { params }: { params: Promise<{ id: string }> }
   ) {
     const { id } = await params
     // Implementation
   }
   
   export async function DELETE(
     req: NextRequest,
     { params }: { params: Promise<{ id: string }> }
   ) {
     const { id } = await params
     // Soft delete: update deletedAt
   }
   ```

3. **Include validation:**
   ```typescript
   const validation = validateInput(body)
   if (!validation.valid) {
     return createErrorResponse(validation.errors, 400)
   }
   ```

4. **Include error handling:**
   - Unique constraint violations
   - Foreign key constraint violations
   - Not found errors
   - Validation errors

---

## 🧠 Important Reminders

**Always:**
- ✅ Check `prisma/schema.prisma` for correct field/relation names
- ✅ Use Promise-based parameters: `params: Promise<{ id: string }>`
- ✅ Await params: `const { id } = await params`
- ✅ Use response utilities for consistency
- ✅ Include proper error handling
- ✅ Test with `npm run build` before committing
- ✅ Test with `npm run dev` to verify runtime

**Never:**
- ❌ Hardcode field names - reference schema
- ❌ Use old parameter syntax
- ❌ Forget to validate input
- ❌ Mix response formats
- ❌ Skip error handling
- ❌ Commit broken builds

---

## 📊 Time Budget

**Remaining Phase 2 work:** 7-10 hours total

| Task | Estimate | Priority |
|------|----------|----------|
| 2.6 Captain API | 30 mins | HIGH |
| 2.14 Bundle API | 45 mins | HIGH |
| 2.15 Driver API | 30 mins | MEDIUM |
| 2.16 Rates API | 30 mins | MEDIUM |
| 2.18 Auth | 1 hour | HIGH |
| 2.19 Docs | 45 mins | MEDIUM |
| 2.20 Tests | 1.5 hours | HIGH |
| **Buffer** | 1-2 hours | - |

**Expected Phase 2 Completion:** December 9-10, 2025

---

## 🚀 Next Session Start Template

```bash
# Verify environment
cd /Volumes/Data/Projects/samui-transfers/frontend

# Check build
npm run build

# Start dev server
npm run dev

# In another terminal, test API
curl -s http://localhost:3001/api/speedboats | jq

# Review context
cat /Volumes/Data/Projects/samui-transfers/SESSION_BUILD_FIX_FINAL_SUMMARY.md

# Begin work on next task...
```

---

**Last Updated:** December 8, 2025, 10:30 PM  
**Status:** Build Passing ✅ | APIs Functional ✅ | Ready to Continue ✅
