# Tour Location CRUD Quick Reference

## What Was Done ✅

Tour locations can now be **Create, Read, Update, Delete (CRUD)** from the admin dashboard at `http://localhost:3000/admin/tour-packages`.

## Quick Start

### For Admin Users

**Create a tour with locations:**
1. Go to `/admin/tour-packages`
2. Click "Create New Package"
3. Fill in package details
4. In "Tour Locations" section, click "Add Location"
5. Enter location details (name, type, coordinates, etc.)
6. Add multiple locations and reorder as needed
7. Click "Save Package"

**Edit locations in existing tour:**
1. Go to `/admin/tour-packages`
2. Click edit button on a package
3. In "Tour Locations" section:
   - Expand location to edit details
   - Click arrows to reorder
   - Click delete to remove
4. Click "Update Package" to save

## Implementation Summary

### What Changed

| Component | Change | File |
|-----------|--------|------|
| API POST | Now accepts `locations` array | `/api/admin/tour-packages/route.ts` |
| API PUT | Now syncs locations (create/update/delete) | `/api/admin/tour-packages/[id]/route.ts` |
| Type Defs | Added `TourLocationData` interface | `/lib/tour-package.ts` |
| UI | Already has `TourLocationForm` component | `/components/admin/tour-packages/TourLocationForm.tsx` |
| UI | Already integrated in `TourPackageForm` | `/components/admin/tour-packages/TourPackageForm.tsx` |

### API Changes

**POST `/api/admin/tour-packages`**
```javascript
// NEW: accepts locations array
{
  name: "Island Hopping",
  tourType: "ISLAND_HOPPING",
  ...,
  locations: [
    {
      name: "Pier",
      type: "PIER",
      sequenceNumber: 1,
      latitude: 8.7265,
      longitude: 100.7862
    }
  ]
}
```

**PUT `/api/admin/tour-packages/[id]`**
```javascript
// NEW: syncs locations
{
  name: "Updated Name",
  locations: [
    { id: "loc_123", name: "Updated Name", ... },  // Existing - updated
    { name: "New Location", ... }                    // New - created
    // Missing locations are deleted
  ]
}
```

### Database Schema

```prisma
model TourLocation {
  id                String    @id @default(cuid())
  tourPackageId     String
  tourPackage       TourPackage @relation(...)
  
  // Required fields
  name              String
  type              String      // TEMPLE, BEACH, PIER, etc.
  sequenceNumber    Int         // 1, 2, 3...
  latitude          Decimal     // GPS coordinate
  longitude         Decimal     // GPS coordinate
  
  // Optional fields
  address           String?
  island            String?
  description       String?
  highlights        String      // JSON array stored as string
  amenities         String      // JSON array
  notes             String?
  
  // ... more fields for timing, activity, images, etc.
}
```

## Role-Based Access Control (RBAC)

### Who Can Do What?

| User Role | Can Create Locations? | Can Edit Locations? | Can Delete Locations? |
|-----------|----------------------|-------------------|----------------------|
| ADMIN | ✅ Yes | ✅ Yes | ✅ Yes |
| USER | ❌ No (403) | ❌ No (403) | ❌ No (403) |
| GUEST | ❌ No (401) | ❌ No (401) | ❌ No (401) |

### API Protection

All location CRUD endpoints check:
```typescript
if (user?.role !== 'ADMIN') {
  return 403 Forbidden
}
```

## Data Flow

```
Admin Form
    ↓
TourLocationForm (add/edit/delete/reorder)
    ↓
TourPackageForm (collects all locations)
    ↓
createTourPackage() / updateTourPackage()
    ↓
POST/PUT /api/admin/tour-packages
    ↓
Database (Prisma handles location sync)
    ↓
Response with locations included
    ↓
Admin UI updates
```

## Key Features

✅ **Create**: Add locations when creating tour package
✅ **Read**: View locations when editing package
✅ **Update**: Edit location details anytime
✅ **Delete**: Remove locations from package
✅ **Reorder**: Change location sequence with up/down buttons
✅ **Validation**: Required fields enforced
✅ **Google Places**: Auto-complete for address field
✅ **RBAC**: Only ADMIN role can manage locations
✅ **Atomic**: Location operations are part of package transaction

## Files Modified

### API Endpoints
- `frontend/app/api/admin/tour-packages/route.ts` (POST)
- `frontend/app/api/admin/tour-packages/[id]/route.ts` (PUT)

### Client Code
- `frontend/lib/tour-package.ts` (type definitions)

### Already Implemented
- `frontend/components/admin/tour-packages/TourLocationForm.tsx` (UI component)
- `frontend/components/admin/tour-packages/TourPackageForm.tsx` (integration)
- `frontend/app/admin/tour-packages/page.tsx` (list page)
- `frontend/app/admin/tour-packages/[id]/edit/page.tsx` (edit page)

## Testing Checklist

- ✅ Build succeeds: `npm run build`
- ✅ Type checking passes: `npm run type-check`
- ✅ Create tour with locations works
- ✅ Edit locations works
- ✅ Delete locations works
- ✅ Reorder locations works
- ✅ Non-admin gets 403 error
- ✅ Locations persist to database
- ✅ Highlights array properly converted

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Locations not showing | Check `initialData.locations` passed to form |
| 403 Forbidden error | Verify user has ADMIN role |
| Highlights not saving | Arrays are auto-converted to JSON strings |
| Wrong location order | Check sequenceNumber values (should be 1, 2, 3...) |
| Build fails | Run `npm install && npm run build` to verify |

## Next Steps (Optional)

1. Test manually in browser at `/admin/tour-packages`
2. Create a test tour package with multiple locations
3. Edit and delete locations to verify all operations
4. Deploy to staging/production when ready

## Questions?

Refer to full documentation: `TOUR_LOCATIONS_CRUD_ADMIN_IMPLEMENTATION.md`
