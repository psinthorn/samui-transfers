# Quick Error Debugging Checklist

## Get the Error Details

### 1. Open Dev Tools
- **Windows**: F12
- **Mac**: Cmd+Option+I

### 2. Go to Console Tab
- Look for red error messages
- Look for log messages starting with:
  - "Submitting tour package data:"
  - "Error saving tour package:"
  - "Full error details:"

### 3. Copy These:
```
1. Exact error message
2. The submitted data (copy the entire object)
3. Tour Type value shown
4. Excluded Services value shown
```

---

## What Your Error Should Look Like

### Example 1: Invalid Tour Type
```
Submitting tour package data: {
  ...,
  tourType: "",  ❌ EMPTY!
  ...
}
Error: "Tour type is required"
```

### Example 2: Format Issue
```
Submitting tour package data: {
  ...,
  excludedServices: ["MEALS", "GUIDE"],  ❌ ARRAY, not string!
  ...
}
```

### Example 3: Valid Data
```
Submitting tour package data: {
  name: "Koh Samui Island Tour",
  tourType: "ISLAND_HOPPING",  ✅ Correct!
  excludedServices: "[]",  ✅ Correct!
  ...
}
```

---

## Share This Information

When reporting the error, provide:

1. **Console error message** (copy-paste from browser console)
2. **Submitted data object** (from "Submitting tour package data:")
3. **What you did** (e.g., "Edited tour name and clicked Save")
4. **Which form** ("Create new" or "Edit existing")

---

## Quick Checks Before Updating

Make sure you have:

- [ ] ✓ Tour package name filled in
- [ ] ✓ Tour type selected (see cards or dropdown)
- [ ] ✓ Duration entered (e.g., 480 minutes)
- [ ] ✓ Max group size entered (e.g., 20)
- [ ] ✓ Departure location filled in
- [ ] ✓ Departure time selected
- [ ] ✓ Return time selected

---

## Common Fixes

### Problem: Empty/Invalid Tour Type
**Fix**: Click on the tour type dropdown/cards and select one
- 🏝️ Island Hopping
- 🏛️ Cultural
- 🧗 Adventure
- ✨ Luxury
- 🎯 Themed

### Problem: Missing Required Field
**Fix**: Fill in ALL required fields (marked with * or bold)

### Problem: Still Failing?
**Share**: The error message from console + submitted data

---

## File Locations

- 📍 Form: `/admin/tour-packages`
- 📍 Create: `/admin/tour-packages/create`
- 📍 Edit: `/admin/tour-packages/[id]/edit`
- 📍 API: `/api/admin/tour-packages/[id]`

