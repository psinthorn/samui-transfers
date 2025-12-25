# 🗺️ Tour Packages Admin - Quick Reference

## Quick Access Links

- **Admin Dashboard:** http://localhost:3000/admin
- **Tour Packages List:** http://localhost:3000/admin/tour-packages
- **Create New:** http://localhost:3000/admin/tour-packages/create
- **Edit Package:** http://localhost:3000/admin/tour-packages/[ID]/edit

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/tour-packages` | List all packages |
| GET | `/api/admin/tour-packages/:id` | Get single package |
| POST | `/api/admin/tour-packages` | Create package |
| PUT | `/api/admin/tour-packages/:id` | Update package |
| DELETE | `/api/admin/tour-packages/:id` | Delete package |

---

## Files Overview

### Components
- `TourPackageForm.tsx` - Create/edit form (380 lines)
- `TourPackageTable.tsx` - Display table (120 lines)

### Pages
- `/admin/tour-packages/page.tsx` - List & filter
- `/admin/tour-packages/create/page.tsx` - Create
- `/admin/tour-packages/[id]/edit/page.tsx` - Edit

### API Routes
- `/api/admin/tour-packages/route.ts` - GET, POST
- `/api/admin/tour-packages/[id]/route.ts` - GET, PUT, DELETE

### Helpers
- `lib/tour-package.ts` - API functions & constants

---

## Key Features

✅ Full CRUD (Create, Read, Update, Delete)
✅ Advanced filtering & search
✅ Pagination support
✅ Form validation
✅ Admin-only access
✅ Responsive design
✅ Real-time updates

---

## Usage Examples

### Create Package
```typescript
const data = await createTourPackage({
  name: "Island Hopping",
  slug: "island-hopping",
  tourType: "ISLAND_HOPPING",
  duration: 480,
  maxGroupSize: 20,
  departureLocation: "Chaweng Beach",
  departureTime: "08:00",
  returnTime: "17:00"
});
```

### Update Package
```typescript
const updated = await updateTourPackage(packageId, {
  maxGroupSize: 25,
  isActive: false
});
```

### Delete Package
```typescript
await deleteTourPackage(packageId);
```

---

## Tour Types
- ISLAND_HOPPING
- CULTURAL
- ADVENTURE
- LUXURY
- THEMED

## Services
- MEALS
- GUIDE
- TRANSPORTATION
- SNORKEL_GEAR
- INSURANCE
- EQUIPMENT
- ACTIVITIES
- ACCOMMODATION

## Islands
- Koh Samui
- Koh Phangan
- Koh Tao
- Koh Matsum
- Ang Thong

---

## Form Sections

1. **Basic Information**
   - Name, Slug, Description, Summary
   - Tour Type, Duration (min)

2. **Group Size & Locations**
   - Min/Max/Default group sizes
   - Islands covered
   - Departure/Return locations

3. **Schedule & Availability**
   - Departure/Return times
   - Available days
   - Seasonal availability

4. **Services**
   - Included services (checkboxes)
   - Excluded services text

5. **Status**
   - Published toggle
   - Active toggle

---

## Error Messages

| Error | Meaning |
|-------|---------|
| Missing required fields | Fill all * fields |
| Slug already exists | Change slug or use existing |
| Unauthorized | Must be logged in as Admin |
| Tour package not found | Package deleted or wrong ID |

---

## Keyboard Shortcuts

- `Ctrl/Cmd + Enter` - Submit form
- `Escape` - Cancel/Close

---

## Troubleshooting

**Form not submitting?**
- Check all required fields marked with *
- Verify slug is unique

**Package not appearing?**
- Refresh the page
- Check filters aren't hiding it
- Verify isPublished=true

**Getting 401 error?**
- Must be logged in as ADMIN
- Check user role in database

---

## Performance Tips

- Filters run client-side for snappiness
- Pagination loads 10 items at a time
- Use search for large datasets (100+ packages)
- Slug must be URL-friendly (no spaces/special chars)

---

## Admin Dashboard

Tour Packages card added with:
- Icon: 🗺️ (map)
- Color: Teal/Cyan gradient
- Position: After Services Management

---

**Last Updated:** December 10, 2025
**Status:** ✅ Complete
