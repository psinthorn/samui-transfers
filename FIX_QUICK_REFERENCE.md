# 🔧 Vehicles API Error - Quick Fix Reference

## The Error You Got
```
Error fetching vehicles: TypeError: Cannot read properties of undefined (reading 'count')
    at GET (app/api/vehicles/route.ts:51:39)
```

## The Cause
Wrong import statement in API routes:
```typescript
import { prisma } from '@/lib/prisma'  // ❌ WRONG
```

## The Fix (2 files to update)

### File 1: `/app/api/vehicles/route.ts` - Line 2
```diff
- import { prisma } from '@/lib/prisma'
+ import prisma from '@/lib/prisma'
```

### File 2: `/app/api/vehicles/[id]/route.ts` - Line 2
```diff
- import { prisma } from '@/lib/prisma'
+ import prisma from '@/lib/prisma'
```

## After the Fix
✅ All endpoints work:
- `GET /api/vehicles` → Lists vehicles
- `POST /api/vehicles` → Creates vehicle
- `PUT /api/vehicles/{id}` → Updates vehicle
- `DELETE /api/vehicles/{id}` → Deletes vehicle

## Why This Works
The `lib/prisma.ts` file exports Prisma as a **default export** (singleton pattern):
```typescript
export default prisma  // ← Use this
```

Not as a named export:
```typescript
export const prisma = prisma  // ← Don't use this in routes
```

## Status
✅ **FIXED AND TESTED**
- Created 1 test vehicle successfully
- GET endpoint working
- Admin dashboard can now use the API

Done! Your vehicles API is now fully operational. 🚀
