# Phase 1: Testing & Validation - Quick Start Guide

**Status**: Dev server running on `http://localhost:3000`  
**Last Updated**: December 26, 2025

---

## 🚀 Quick Testing Checklist

### ✅ Code-Level Verification (Complete)

All implementation code has been verified:

**Form State** ✓
```typescript
// app/admin/theme/page.tsx
const [headerLogoUrl, setHeaderLogoUrl] = useState(theme?.headerLogoUrl || '')
const [footerLogoUrl, setFooterLogoUrl] = useState(theme?.footerLogoUrl || '')
const [headerLogoMethod, setHeaderLogoMethod] = useState<'url' | 'upload'>('url')
const [footerLogoMethod, setFooterLogoMethod] = useState<'url' | 'upload'>('url')
```

**API Handlers** ✓
```typescript
// app/api/admin/theme/route.ts
// PUT endpoint extracts both:
headerLogoUrl: headerLogoUrl !== undefined ? headerLogoUrl : theme.headerLogoUrl,
footerLogoUrl: footerLogoUrl !== undefined ? footerLogoUrl : theme.footerLogoUrl,
```

**Component Usage** ✓
```javascript
// components/layout/Header.js
const logoUrl = theme?.headerLogoUrl || theme?.logoUrl || StRec;

// components/layout/Footer.js
const footerLogoUrl = theme?.footerLogoUrl || theme?.headerLogoUrl || null;
```

**Database** ✓
- All 3 theme migrations applied
- `headerLogoUrl` and `footerLogoUrl` columns exist
- 52 records seeded with default values

---

## 🧪 User Acceptance Tests

### Test 1: Access Admin Theme Form
1. Go to `http://localhost:3000/admin`
2. Look for Settings section (should be expanded)
3. Click "Theme Settings"
4. Form should load showing:
   - Website Name field
   - Header Logo section (with two tabs: "Link to URL" and "Upload File")
   - Footer Logo section (with two tabs: "Link to URL" and "Upload File")
   - Company Email & Phone
   - Footer Text
   - Developer Company fields

**Expected**: All fields visible, no errors in console

---

### Test 2: Verify Current Values Load
1. Admin Theme form open
2. Scroll to Header Logo section
3. "Link to URL" tab should show: `/uploads/logo-samui-transfers.png`
4. Scroll to Footer Logo section
5. "Link to URL" tab should show: `/uploads/footer-logo-samui-transfers.png`
6. Preview boxes should display both logos

**Expected**: Both logos visible in preview boxes

---

### Test 3: Update Header Logo via URL
1. Admin Theme form open
2. Header Logo section → "Link to URL" tab
3. Clear current URL, enter: `/uploads/header-new.png`
4. Preview should update (or show not found)
5. Scroll down and click "Save Branding"
6. Alert should say "Branding updated successfully!"
7. Refresh the page
8. Header Logo URL should still be `/uploads/header-new.png`

**Expected**: Change persists after save and refresh

---

### Test 4: Update Footer Logo via Upload
1. Admin Theme form open
2. Footer Logo section → "Upload File" tab
3. Click file input, select any image (PNG/JPG/WebP/GIF under 5MB)
4. File should upload (shows "Uploading...")
5. Alert appears: "Footer logo uploaded successfully!"
6. Preview updates to show new image
7. Click "Save Branding"
8. Check `public/uploads/` folder - new file should exist

**Expected**: File uploaded and saved successfully

---

### Test 5: Check Header Component
1. Go to home page `http://localhost:3000/`
2. Look at top-left header
3. Should see logo from `headerLogoUrl`
4. Logo should be clickable (links to home)
5. Website name should appear next to logo
6. No broken image icons

**Expected**: Header displays correctly with logo

---

### Test 6: Check Footer Component
1. Scroll to bottom of any page
2. Should see footer logo from `footerLogoUrl`
3. Logo should display correctly
4. Company info, links, and content visible
5. No broken image icons

**Expected**: Footer displays correctly with logo

---

### Test 7: Test Invalid File Upload
1. Admin Theme form open
2. Header Logo → "Upload File"
3. Try to upload a `.txt` or `.pdf` file
4. Should see error: "Upload failed: Invalid file type"

**Expected**: Only image files accepted

---

### Test 8: Sidebar Navigation
1. Go to `/admin`
2. Look at sidebar
3. Should see "Settings" group (expanded)
4. Under Settings should see two options:
   - 🎨 Theme Settings
   - ⚙️ General Settings
5. Click "Theme Settings" - should navigate to `/admin/theme`

**Expected**: Sidebar menu properly organized

---

## 📊 Test Results Template

```
Test ID:  [1-8]
Result:   [ ] PASS  [ ] FAIL  [ ] SKIP
Notes:    [Any observations or errors]
Console:  [Any console errors/warnings]
```

---

## 🔧 Debugging Tips

### If theme form doesn't load:
```bash
# Check browser console for errors
# Check Network tab for failed requests
# Verify auth token in cookies
curl -b "sessionToken=your_token" http://localhost:3000/api/admin/theme
```

### If logos don't display:
```bash
# Check if files exist
ls -la public/uploads/

# Check database values
psql "connection_string" -c "SELECT headerLogoUrl, footerLogoUrl FROM \"ThemeConfig\" WHERE \"isActive\" = true;"
```

### If upload fails:
```bash
# Test upload endpoint directly
curl -F "file=@/path/to/image.png" http://localhost:3000/api/admin/upload
```

---

## ✨ Success Criteria

System is **READY FOR PRODUCTION** when:
- [x] Code implementation verified (all 100%)
- [ ] All 8 user tests pass
- [ ] No console errors in browser
- [ ] Database values persist correctly
- [ ] Both logos display on frontend
- [ ] Admin form saves all fields
- [ ] File uploads work with validation

---

## 📝 Next Phase

Once all tests pass:
- Commit test results
- Move to **Phase 2: Dynamic Favicon Implementation**
- Create favicon upload in admin form
- Add favicon loading to layout

---

**Server Status**: ✅ Running on `http://localhost:3000`  
**Test Start Time**: December 26, 2025, 12:XX AM  
**Estimated Duration**: 15-20 minutes
