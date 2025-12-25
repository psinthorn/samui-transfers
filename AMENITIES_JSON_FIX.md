# Amenities JSON Serialization Fix

## Problem
When updating or creating tour packages with new locations, got this error:
```
Argument `amenities`: Invalid value provided. Expected String, provided ().
```

## Root Cause
The `amenities` field in the Prisma schema is defined as a `String` (JSON array):
```prisma
amenities  String  @default("[]")  // JSON array: ["parking", "toilet", "restaurant", "shop"]
```

When passing `loc.amenities || []` (an array), Prisma expected a JSON string instead.

## Solution Applied
Changed both UPDATE and CREATE operations to serialize `amenities` to JSON, just like `highlights`:

**File**: `app/api/admin/tour-packages/[id]/route.ts`

**Lines 171 & 197** (UPDATE and CREATE operations):
```typescript
// BEFORE
amenities: loc.amenities || [],

// AFTER
amenities: Array.isArray(loc.amenities) ? JSON.stringify(loc.amenities) : (loc.amenities || '[]'),
```

## Changes Made
- **Line 171**: Fixed UPDATE operation for existing locations
- **Line 197**: Fixed CREATE operation for new locations
- Both now properly serialize arrays to JSON strings
- Consistent with how `highlights` is handled

## Build Status
✅ **Build**: PASSING - No TypeScript errors
✅ **Dev Server**: RESTARTED and running (PID 19715)

## Testing
The tour package update endpoint now correctly handles amenities for both:
1. Existing locations (UPDATE)
2. New locations (CREATE)

Try updating a tour package with new/modified locations - should work without the amenities error.

## Files Modified
- `app/api/admin/tour-packages/[id]/route.ts` (lines 171, 197)

## Schema Reference
All fields that need JSON serialization in tour location:
- `amenities`: String (JSON array)
- `highlights`: String (JSON array)
- Other arrays should be checked similarly
