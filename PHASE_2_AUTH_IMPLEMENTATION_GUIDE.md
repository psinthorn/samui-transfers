# Phase 2.18: Authentication & Authorization Implementation Guide

**Status:** Middleware implemented and ready for integration  
**Date:** December 8, 2025

## Overview

The authentication & authorization middleware has been created in `app/api/middleware/auth.ts`. This provides:

1. **Authentication Context** - Extracts user info from request headers
2. **Role-Based Access Control (RBAC)** - Three roles: ADMIN, STAFF, USER
3. **Middleware Wrappers** - Easy integration with API endpoints
4. **Error Handling** - Proper 401/403 responses

## Current Implementation

### Auth Context Structure
```typescript
interface AuthContext {
  userId: string
  email: string
  role: string
  isAdmin: boolean
  isStaff: boolean
  isUser: boolean
}
```

### How Authentication Works (Currently)

The middleware extracts user info from request headers:
- `Authorization: Bearer <token>` - Required for all protected endpoints
- `X-User-Id` - User ID header
- `X-User-Email` - User email header
- `X-User-Role` - User role header (ADMIN, STAFF, USER)

**Note:** In production, integrate with:
- Auth.js v5-beta (already in your stack)
- JWT token validation
- Session cookies
- NextAuth callbacks

## Integration with Auth.js (TODO)

Update middleware to use Auth.js session:

```typescript
import { auth } from '@/auth'

export async function getAuthContext(req: NextRequest): Promise<AuthContext | null> {
  const session = await auth()
  
  if (!session?.user) {
    return null
  }

  return {
    userId: session.user.id,
    email: session.user.email,
    role: session.user.role || 'USER',
    isAdmin: session.user.role === 'ADMIN',
    isStaff: session.user.role === 'ADMIN' || session.user.role === 'STAFF',
    isUser: true,
  }
}
```

## Usage Examples

### Example 1: Require Admin Role
```typescript
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/app/api/utils/api-response'
import { withAuth, AuthContext } from '@/app/api/middleware/auth'

async function handler(
  req: NextRequest,
  context: any,
  auth: AuthContext
) {
  if (req.method === 'GET') {
    // Only admins can list all users
    const users = await prisma.user.findMany()
    return successResponse(users)
  }
}

// Wrap with admin requirement
export const GET = withAuth(handler, 'ADMIN')
```

### Example 2: Require Staff Role
```typescript
async function handler(
  req: NextRequest,
  context: any,
  auth: AuthContext
) {
  // Staff can view all bookings
  const bookings = await prisma.booking.findMany()
  return successResponse(bookings)
}

export const GET = withAuth(handler, 'STAFF')
```

### Example 3: Any Authenticated User
```typescript
async function handler(
  req: NextRequest,
  context: any,
  auth: AuthContext
) {
  if (req.method === 'GET') {
    // Get own bookings
    const bookings = await prisma.booking.findMany({
      where: { userId: auth.userId }
    })
    return successResponse(bookings)
  }
}

export const GET = withAuth(handler) // No role specified = any auth user
```

### Example 4: Optional Authentication
```typescript
import { withOptionalAuth } from '@/app/api/middleware/auth'

async function handler(
  req: NextRequest,
  context: any,
  auth: AuthContext | null
) {
  // Works for both authenticated and anonymous users
  const tours = await prisma.tourPackage.findMany({
    where: { isPublished: true }
  })
  
  if (auth) {
    // If authenticated, include user-specific data
    return successResponse({ tours, currentUser: auth.userId })
  }
  
  // If not authenticated, just return tours
  return successResponse({ tours })
}

export const GET = withOptionalAuth(handler)
```

### Example 5: Check Ownership
```typescript
import { requireOwnershipOrAdmin } from '@/app/api/middleware/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await requireAuth(req)
    
    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id }
    })
    
    if (!booking) {
      return errorResponse('Booking not found', 404)
    }
    
    // Check ownership
    await requireOwnershipOrAdmin(req, booking.userId)
    
    return successResponse(booking)
  } catch (error: any) {
    if (error.message === 'Forbidden') {
      return errorResponse('You can only view your own bookings', 403)
    }
    throw error
  }
}
```

## Protected Endpoints (Ready to Implement)

These endpoints should require authentication:

### Admin-Only Endpoints:
- POST /api/service-rates (create rates)
- PUT /api/service-rates/[id] (modify rates)
- DELETE /api/service-rates/[id] (delete rates)
- POST /api/drivers (register driver)
- PATCH /api/drivers/[id] (update driver)
- DELETE /api/drivers/[id] (delete driver)
- GET /api/users (list all users)

### Staff Endpoints:
- GET /api/bookings (view all bookings)
- PATCH /api/speedboat-bookings/[id] (manage bookings)
- GET /api/speedboat-captains (list captains)
- POST /api/speedboat-captains (assign captain)

### User Endpoints:
- POST /api/speedboats/booking (create own booking)
- GET /api/user/bookings (view own bookings)
- PATCH /api/user/bookings/[id] (update own booking)
- GET /api/bookings/bundle (view own bundles)

## Implementation Checklist

- [x] Auth middleware created
- [ ] Integrate with Auth.js session
- [ ] Add auth to admin endpoints (service-rates, drivers)
- [ ] Add auth to staff endpoints (bookings, captains)
- [ ] Add auth to user endpoints (personal bookings)
- [ ] Test role-based access
- [ ] Add logging for auth failures
- [ ] Create auth error documentation
- [ ] Implement rate limiting per user
- [ ] Add audit logging

## Testing Auth Locally

To test protected endpoints locally, include headers:

```bash
# Test with admin role
curl -X GET http://localhost:3001/api/drivers \
  -H "Authorization: Bearer test-token" \
  -H "X-User-Id: user-123" \
  -H "X-User-Email: admin@example.com" \
  -H "X-User-Role: ADMIN"

# Test with user role
curl -X GET http://localhost:3001/api/drivers \
  -H "Authorization: Bearer test-token" \
  -H "X-User-Id: user-456" \
  -H "X-User-Email: user@example.com" \
  -H "X-User-Role: USER"

# Should get 403 Forbidden
curl -X POST http://localhost:3001/api/service-rates \
  -H "Authorization: Bearer test-token" \
  -H "X-User-Id: user-456" \
  -H "X-User-Email: user@example.com" \
  -H "X-User-Role: USER" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

## Next Steps

1. **Phase 2.19:** Create Swagger/OpenAPI documentation
   - Document auth requirements for each endpoint
   - Include example requests/responses
   - Define error responses

2. **Phase 2.20:** Create API testing suite
   - Test auth success cases
   - Test auth failure cases
   - Test role-based access

3. **Phase 3+:** Frontend integration
   - Use auth context in API calls
   - Handle 401/403 errors
   - Redirect to login on auth failure

## File References

- **Middleware:** `app/api/middleware/auth.ts`
- **Response Utilities:** `app/api/utils/api-response.ts`
- **Validation:** `app/api/utils/validation.ts`

## Important Notes

⚠️ **Current Implementation:**
- Uses header-based auth for simplicity
- Suitable for testing and demo
- NOT production-ready without Auth.js integration

🔒 **Production Requirements:**
- Integrate with Auth.js v5-beta
- Validate JWT tokens or session cookies
- Implement refresh token rotation
- Add rate limiting per user/IP
- Log all auth attempts
- Use HTTPS only
- Implement CORS properly
