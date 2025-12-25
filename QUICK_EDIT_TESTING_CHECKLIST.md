# Quick Edit Testing Checklist

**Date:** December 23, 2025  
**Feature:** Tour Package Quick Edit Modal  
**Status:** Ready for QA Testing  

---

## Pre-Test Setup

- [ ] Dev server is running: `npm run dev`
- [ ] Frontend compiles without errors: `npm run build` ✅
- [ ] Database is accessible and has tour packages
- [ ] Browser dev tools open (F12) for error checking
- [ ] Navigate to: `http://localhost:3000/admin/tour-packages`

---

## Section 1: Modal Opens Correctly

### Test 1.1: Quick Edit Button Appears
```
Location: /admin/tour-packages page
Steps:
  1. Look at tour packages table
  2. Find "Quick Edit" button (purple) in Actions column
  
Expected: ✅ Purple button visible before Edit/Delete buttons
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 1.2: Modal Opens on Click
```
Steps:
  1. Click "Quick Edit" button on first tour package
  2. Check if modal appears

Expected: ✅ Modal appears centered on screen with overlay
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 1.3: Modal Shows Correct Package Name
```
Steps:
  1. With modal open, check the subtitle
  
Expected: ✅ Shows correct package name (from table row)
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 1.4: Modal Has Three Tabs
```
Steps:
  1. Check modal header
  
Expected: ✅ Three tabs visible:
         - Tour Type
         - Included Services
         - Excluded Services
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

---

## Section 2: Tour Type Tab

### Test 2.1: Current Tour Type Selected
```
Steps:
  1. Click "Tour Type" tab
  2. Check which type is highlighted

Expected: ✅ Current tour type has blue background/border
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 2.2: Tour Type Options Display
```
Steps:
  1. In Tour Type tab, count the type buttons

Expected: ✅ All 5 types visible:
         - Island Hopping
         - Cultural Tour
         - Adventure
         - Luxury Tour
         - Themed Tour
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 2.3: Can Select Different Tour Type
```
Steps:
  1. Click a different tour type (not current)
  2. Check if it gets highlighted

Expected: ✅ Selected type highlights in blue
         ✅ Previous type unhighlights
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 2.4: Change Preview Shows
```
Steps:
  1. With different type selected
  2. Look for change message

Expected: ✅ Shows: "✓ Tour type will change from X to Y"
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 2.5: Can Change Back
```
Steps:
  1. Select original tour type again
  2. Check message

Expected: ✅ Message disappears when back to original
         ✅ Save button disables if no change
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

---

## Section 3: Included Services Tab

### Test 3.1: Tab Opens Correctly
```
Steps:
  1. Click "Included Services" tab
  2. Wait for content to load

Expected: ✅ Tab shows checkboxes for services
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 3.2: All Service Options Display
```
Steps:
  1. Count the service options

Expected: ✅ All 8 services visible:
         - Meals Included
         - Professional Guide
         - Transportation
         - Snorkel Gear
         - Insurance
         - Equipment
         - Activities
         - Accommodation
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 3.3: Current Selections Show as Checked
```
Steps:
  1. Check which services are pre-checked
  2. Compare with original package data

Expected: ✅ Matches current package included services
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 3.4: Can Check Services
```
Steps:
  1. Click checkbox for unchecked service
  2. Service should check

Expected: ✅ Checkbox becomes checked
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 3.5: Can Uncheck Services
```
Steps:
  1. Click checkbox for checked service
  2. Service should uncheck

Expected: ✅ Checkbox becomes unchecked
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 3.6: Service Count Updates
```
Steps:
  1. Check/uncheck services
  2. Watch the count at bottom

Expected: ✅ Shows "X service(s) selected"
         ✅ Updates when you check/uncheck
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 3.7: Changes Don't Save Yet
```
Steps:
  1. Check/uncheck some services
  2. Close modal without clicking Save
  3. Reopen modal

Expected: ✅ Services show original state
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

---

## Section 4: Excluded Services Tab

### Test 4.1: Tab Opens Correctly
```
Steps:
  1. Click "Excluded Services" tab
  2. Wait for content to load

Expected: ✅ Tab shows checkboxes for services
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 4.2: All Service Options Display
```
Steps:
  1. Count the service options

Expected: ✅ All 8 services visible (same as included)
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 4.3: Current Exclusions Show as Checked
```
Steps:
  1. Check which services are pre-checked
  2. Compare with original package data

Expected: ✅ Matches current package excluded services
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 4.4: Can Check Services
```
Steps:
  1. Click checkbox for unchecked service
  2. Service should check

Expected: ✅ Checkbox becomes checked
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 4.5: Can Uncheck Services
```
Steps:
  1. Click checkbox for checked service
  2. Service should uncheck

Expected: ✅ Checkbox becomes unchecked
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 4.6: Service Count Updates
```
Steps:
  1. Check/uncheck services
  2. Watch the count at bottom

Expected: ✅ Shows "X service(s) excluded"
         ✅ Updates when you check/uncheck
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

---

## Section 5: Tab Navigation

### Test 5.1: Tab Switch Preserves State
```
Steps:
  1. Go to "Included Services" tab
  2. Check some services
  3. Click "Excluded Services" tab
  4. Go back to "Included Services"

Expected: ✅ Checked services still checked
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 5.2: Multiple Tab Changes
```
Steps:
  1. Switch between all three tabs multiple times
  2. Make changes on each tab

Expected: ✅ No data loss when switching
         ✅ All changes retained
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

---

## Section 6: Save Button Behavior

### Test 6.1: Save Disabled When No Changes
```
Steps:
  1. Open modal
  2. Don't make any changes
  3. Look at Save button

Expected: ✅ "Save Changes" button is disabled (grayed out)
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 6.2: Save Enabled After Change
```
Steps:
  1. Make any change (tour type, service, etc.)
  2. Look at Save button

Expected: ✅ Button becomes enabled (blue, clickable)
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 6.3: Save Disables When Change Undone
```
Steps:
  1. Make change (e.g., select different tour type)
  2. Undo change (select original tour type back)
  3. Look at Save button

Expected: ✅ Button disables again
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 6.4: Save Shows Loading State
```
Steps:
  1. Make a change
  2. Click "Save Changes"
  3. Watch button immediately

Expected: ✅ Button shows "Saving..." text
         ✅ Button becomes disabled during save
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

---

## Section 7: Saving Changes

### Test 7.1: Tour Type Change Saves
```
Steps:
  1. Open modal
  2. Change tour type
  3. Click "Save Changes"
  4. Wait for modal to close
  5. Look at table

Expected: ✅ Modal closes automatically
         ✅ Table shows new tour type in Type column
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 7.2: Included Services Change Saves
```
Steps:
  1. Open modal
  2. Go to "Included Services" tab
  3. Check/uncheck services
  4. Click "Save Changes"
  5. Wait for modal to close

Expected: ✅ Modal closes automatically
         ✅ Database updated with new services
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 7.3: Excluded Services Change Saves
```
Steps:
  1. Open modal
  2. Go to "Excluded Services" tab
  3. Check/uncheck services
  4. Click "Save Changes"
  5. Wait for modal to close

Expected: ✅ Modal closes automatically
         ✅ Database updated with new exclusions
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 7.4: Multiple Changes Save Together
```
Steps:
  1. Open modal
  2. Change tour type
  3. Go to "Included Services" and change
  4. Go to "Excluded Services" and change
  5. Click "Save Changes"

Expected: ✅ All changes save together
         ✅ No conflicts or errors
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

---

## Section 8: Data Persistence

### Test 8.1: Refresh Shows Saved Changes
```
Steps:
  1. Save changes
  2. Press F5 to refresh page
  3. Check tour package data

Expected: ✅ Changes persist after refresh
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 8.2: Reopen Modal Shows Updated Data
```
Steps:
  1. Save changes
  2. Click "Quick Edit" again
  3. Check current selections

Expected: ✅ Modal shows updated current values
         ✅ Previously selected items now show as current
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 8.3: Edit Full Form Shows Changes
```
Steps:
  1. Save changes via quick edit
  2. Click "Edit" button to go to full form
  3. Check if changes are reflected

Expected: ✅ Full form shows updated values
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

---

## Section 9: Cancel Button

### Test 9.1: Cancel Closes Modal
```
Steps:
  1. Open modal
  2. Make changes
  3. Click "Cancel" button

Expected: ✅ Modal closes immediately
         ✅ No changes are saved
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 9.2: X Button Closes Modal
```
Steps:
  1. Open modal
  2. Make changes
  3. Click X button (top right)

Expected: ✅ Modal closes immediately
         ✅ No changes are saved
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 9.3: Changes Discarded on Cancel
```
Steps:
  1. Open modal
  2. Make changes
  3. Click "Cancel"
  4. Open modal again

Expected: ✅ Original selections showing
         ✅ Changes from step 2 are gone
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

---

## Section 10: Error Handling

### Test 10.1: Network Error Handling
```
Steps:
  1. Disconnect internet (or use DevTools to simulate)
  2. Open modal and try to save

Expected: ✅ Error message appears
         ✅ Modal stays open
         ✅ Can retry or cancel
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 10.2: Check Console for Errors
```
Steps:
  1. Open browser console (F12)
  2. Perform normal operations
  3. Make changes and save

Expected: ✅ No JavaScript errors in console
         ✅ API requests show in Network tab
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

---

## Section 11: Multiple Packages

### Test 11.1: Different Package Same Modal
```
Steps:
  1. Click "Quick Edit" on first package
  2. Close modal
  3. Click "Quick Edit" on second package
  4. Verify name and data

Expected: ✅ Modal shows second package's data
         ✅ Name is correct
         ✅ Services are correct
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 11.2: Edit Multiple Packages in Sequence
```
Steps:
  1. Edit package A (save changes)
  2. Edit package B (save changes)
  3. Edit package C (save changes)
  4. Check all three in table

Expected: ✅ All three packages updated correctly
         ✅ No mixing of data between packages
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

---

## Section 12: Edge Cases

### Test 12.1: No Included Services
```
Steps:
  1. Find/create a package with no included services
  2. Open quick edit
  3. Verify Included tab shows nothing checked

Expected: ✅ No services checked
         ✅ Count shows "0 service(s) selected"
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 12.2: All Services Excluded
```
Steps:
  1. Find/create a package with all services excluded
  2. Open quick edit
  3. Go to Excluded tab

Expected: ✅ All services shown as checked
         ✅ Count shows "8 service(s) excluded"
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 12.3: Empty Changes
```
Steps:
  1. Open modal
  2. Make a change
  3. Undo the change (back to original)
  4. Try to save

Expected: ✅ Save button disabled
         ✅ Cannot save empty changes
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

---

## Section 13: UI/UX Polish

### Test 13.1: Modal Centered on Screen
```
Expected: ✅ Modal appears centered horizontally and vertically
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 13.2: Dark Overlay Behind Modal
```
Expected: ✅ Dark overlay/background visible behind modal
         ✅ Overlay covers entire screen
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 13.3: Modal Has Proper Spacing
```
Expected: ✅ Content has proper margins/padding
         ✅ Tabs are well-spaced
         ✅ Buttons have proper spacing
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 13.4: Responsive on Mobile
```
Steps:
  1. Open DevTools (F12)
  2. Switch to mobile view
  3. Open quick edit modal

Expected: ✅ Modal fits on small screen
         ✅ Content is readable
         ✅ Buttons are clickable
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

---

## Section 14: Accessibility

### Test 14.1: Keyboard Navigation
```
Steps:
  1. Open modal
  2. Press Tab to navigate between elements
  3. Try pressing Enter on buttons

Expected: ✅ Can navigate with keyboard
         ✅ Focus is visible
         ✅ Can activate buttons with Enter
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

### Test 14.2: Checkbox Labels Clickable
```
Steps:
  1. Go to services tab
  2. Click on the service label (not just checkbox)

Expected: ✅ Checkbox toggles when label clicked
Result: [ ] PASS [ ] FAIL
Notes: _________________________________
```

---

## Final Summary

### Tests Passed: ___ / ___

### Critical Issues Found:
```
_____________________________________________
_____________________________________________
_____________________________________________
```

### Minor Issues Found:
```
_____________________________________________
_____________________________________________
_____________________________________________
```

### Suggestions for Improvement:
```
_____________________________________________
_____________________________________________
_____________________________________________
```

### Overall Assessment:
- [ ] READY FOR PRODUCTION
- [ ] NEEDS MINOR FIXES
- [ ] NEEDS MAJOR FIXES
- [ ] NEEDS REDESIGN

**Tester Name:** ________________  
**Date:** ________________  
**Signature:** ________________

---

**Save this checklist and share results when complete!**
