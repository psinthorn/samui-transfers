# Tour Package Update Error - Troubleshooting Guide

## Issue: "Failed to update tour package"

This document helps identify and fix the tour package update error.

---

## Step 1: Check the Error in Browser Console

1. Open your browser's Developer Tools (F12 or Cmd+Option+I)
2. Go to the "Console" tab
3. Try to update a tour package
4. Look for error messages with the format:
   ```
   Error saving tour package: ...
   Full error details: ...
   ```

5. Take note of the exact error message and share it

---

## Step 2: Check What Data Is Being Sent

In the console, you should see:
```
Submitting tour package data: { ... }
```

This shows exactly what data is being sent to the API. Common issues:
- **excludedServices**: Should be a JSON string like `"[]"` or `"[\"MEALS\",\"GUIDE\"]"`
- **gallery**: Should be a JSON string like `"[]"`
- **locations**: Should be an array of location objects
- **tourType**: Should be one of: `ISLAND_HOPPING`, `CULTURAL`, `ADVENTURE`, `LUXURY`, `THEMED`

---

## Step 3: Check Network Request

1. In Developer Tools, go to "Network" tab
2. Try to update a tour package
3. Look for the request to `/api/admin/tour-packages/[id]`
4. Click on it to see:
   - **Request**: What was sent (check the "Payload" tab)
   - **Response**: What the server returned (check the "Response" tab)

5. If you see an error in the Response, note the exact message

---

## Step 4: Check Server Logs

The dev server should show error logs when you try to update. Look for:
```
Error updating tour package:
Error details: { message: "...", stack: "..." }
```

This tells us what went wrong on the server side.

---

## Common Issues & Solutions

### Issue 1: excludedServices Format
**Symptom**: Error mentions "excludedServices"  
**Solution**: The field must be a JSON string, not an array

### Issue 2: Invalid Tour Type
**Symptom**: Error mentions "tourType"  
**Solution**: Make sure you selected one of the 5 tour types

### Issue 3: Missing Required Fields
**Symptom**: Error mentions a missing field  
**Solution**: Fill in all required fields before submitting

### Issue 4: Location Data Invalid
**Symptom**: Error mentions "locations"  
**Solution**: Check that all locations have required fields (name, type, coordinates)

### Issue 5: Database Error
**Symptom**: Error mentions "Prisma" or "database"  
**Solution**: Check that you have the latest database migrations

---

## How to Report the Error

Please provide:

1. **Exact error message** from browser console
2. **What you were trying to do** (create or edit)
3. **What fields you changed**
4. **The submitted data** (from console log)
5. **Server error message** (from dev server logs)

---

## Steps to Take Now

1. ✅ Added detailed console logging
2. ✅ Added API error logging
3. ✅ Added network error details

**Next**: Try to update a tour package again and check the console for the error details.

