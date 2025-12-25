# Logo Upload Feature - Complete Guide

## Overview

The theme system now supports **two methods** for managing website logos:

1. **URL Link Method** - Link to external or internal image URLs
2. **File Upload Method** - Upload logo files directly to the website

Both methods are seamlessly integrated into the admin theme panel, allowing admins to choose their preferred approach.

---

## Architecture

### Components & Files

#### 1. **Upload API Endpoint**
- **File**: `app/api/admin/upload/route.ts`
- **Purpose**: Handle image file uploads with validation
- **Method**: `POST /api/admin/upload`
- **Features**:
  - Secure authentication (requires logged-in user)
  - File type validation (JPEG, PNG, WebP, GIF)
  - File size validation (5MB max)
  - Unique filename generation with timestamps
  - Automatic directory creation (`public/uploads`)
  - Returns JSON with URL path for use in theme

#### 2. **Admin Theme Form**
- **File**: `app/admin/theme/page.tsx`
- **Purpose**: Admin interface for managing logos
- **New Features**:
  - Toggle buttons to switch between URL and Upload methods
  - URL input field for linking to images
  - File input field for uploading images
  - Live logo preview with error handling
  - Upload status feedback (uploading/completed)
  - Single Save button for all branding changes

#### 3. **Theme Context**
- **File**: `context/ThemeContext.tsx` (existing)
- **Usage**: Automatically fetches and provides theme data with logos
- **Behavior**: Components reading theme automatically get latest logo URL

---

## How It Works

### Method 1: URL Link

**Steps**:
1. Admin navigates to `/admin/theme`
2. Selects "Link to URL" tab
3. Enters URL path (e.g., `/ci/restlogopngv1/ST_Branding_V1-07.png` or `https://example.com/logo.png`)
4. Preview displays the logo image
5. Clicks "Save Branding"
6. Logo URL stored in database
7. Header/Footer components display logo from URL

**Best For**:
- External CDN-hosted images
- URLs to images already on your website
- Logos stored in remote services

---

### Method 2: File Upload

**Steps**:
1. Admin navigates to `/admin/theme`
2. Selects "Upload File" tab
3. Clicks file input and selects image file (JPEG, PNG, WebP, or GIF)
4. File automatically uploads to `/api/admin/upload`
5. API validates file (type & size)
6. API stores file in `public/uploads/` with unique name
7. API returns URL path (e.g., `/uploads/logo-1703502400-abc123.png`)
8. URL is automatically populated in the logo field
9. Preview displays uploaded logo
10. Admin clicks "Save Branding" to persist to database

**Best For**:
- Direct file uploads from filesystem
- Quick logo changes without external URLs
- Keeping all assets on your website

**File Validation**:
- **Allowed Types**: JPEG, PNG, WebP, GIF
- **Max Size**: 5MB
- **Error Handling**: User-friendly error messages if validation fails

---

## Database Integration

### ThemeConfig Model (Prisma)

```prisma
model ThemeConfig {
  // ... existing fields ...
  
  // Logo field (can store either URL or upload path)
  logoUrl     String?
  
  // Logo file can be:
  // - Absolute URL: https://example.com/logo.png
  // - Relative path: /uploads/logo-1703502400-abc123.png
  // - Asset path: /ci/restlogopngv1/ST_Branding_V1-07.png
}
```

The `logoUrl` field is flexible and accepts any of the above formats. The frontend components handle all cases automatically.

---

## Upload Storage

### Directory Structure

```
frontend/
├── public/
│   ├── uploads/                      # All uploaded logos stored here
│   │   ├── logo-1703502400-abc123.png
│   │   ├── logo-1703502401-def456.png
│   │   └── ...
│   ├── ci/
│   ├── icons/
│   └── ... (other public assets)
```

### Filename Format

Uploaded files follow this naming pattern:
```
logo-{timestamp}-{randomString}.{extension}

Examples:
- logo-1703502400000-a7k9j.png
- logo-1703502401000-m2p4x.jpg
- logo-1703502402000-q8z3b.webp
```

**Why**:
- Prevents filename conflicts
- Easy to identify upload time
- Allows multiple versions if needed
- Files accessible via `/uploads/filename`

---

## Admin UI Flow

### Logo Section in Admin Theme Page

```
┌─────────────────────────────────────────┐
│  Logo                                   │
├─────────────────────────────────────────┤
│  [Link to URL]  [Upload File]           │  ← Toggle buttons
├─────────────────────────────────────────┤
│                                         │
│  If "Link to URL" selected:             │
│  ┌─────────────────────────────────────┐│
│  │ /ci/restlogopngv1/ST_...png         ││  ← URL input
│  └─────────────────────────────────────┘│
│  Enter a URL path or external URL       │
│                                         │
│  OR if "Upload File" selected:          │
│  ┌─────────────────────────────────────┐│
│  │ [Choose File] (max 5MB)             ││  ← File picker
│  └─────────────────────────────────────┘│
│  Max size: 5MB (JPEG, PNG, WebP, GIF)  │
│                                         │
│  Logo Preview:                          │
│  ┌─────────────────────────────────────┐│
│  │ [Logo Image]                        ││  ← Live preview
│  │ /uploads/logo-1703502400-abc123.png ││
│  └─────────────────────────────────────┘│
│                                         │
│  [Save Branding]                        │  ← Single save button
└─────────────────────────────────────────┘
```

---

## Frontend Component Integration

### Header Component

```typescript
// components/layout/Header.js

const { theme } = useTheme()
const logoUrl = theme?.logoUrl || StRec

// Handles both URL types:
// - /uploads/logo-1703502400-abc123.png (uploaded file)
// - /ci/restlogopngv1/ST_Branding_V1-07.png (asset path)
// - https://example.com/logo.png (external URL)

if (typeof logoUrl === 'string') {
  // Render as <img> tag for URL strings
  <img src={logoUrl} alt={brandName} />
} else {
  // Render as <Image> component for static imports
  <Image src={logoUrl} alt={brandName} />
}
```

### Footer Component

```typescript
// components/layout/Footer.js

const { theme } = useTheme()
// Logo also available here if needed
const logoUrl = theme?.logoUrl
```

---

## API Reference

### POST /api/admin/upload

**Purpose**: Upload an image file for use as website logo

**Authentication**: Required (logged-in user)

**Request**:
```javascript
const formData = new FormData()
formData.append('file', imageFile)

const response = await fetch('/api/admin/upload', {
  method: 'POST',
  body: formData,
})
```

**Response (Success)**:
```json
{
  "success": true,
  "url": "/uploads/logo-1703502400-abc123.png",
  "fileName": "logo-1703502400-abc123.png",
  "message": "File uploaded successfully"
}
```

**Response (Error)**:
```json
{
  "error": "Invalid file type. Allowed: JPEG, PNG, WebP, GIF"
}
```

**Errors**:
- `401 Unauthorized` - Not logged in
- `400 Bad Request` - No file, wrong type, or too large
- `500 Internal Error` - Server upload failure

---

## Usage Examples

### Example 1: Switch from URL to Upload

```
1. Admin navigates to /admin/theme
2. Currently using URL: /ci/restlogopngv1/ST_Branding_V1-07.png
3. Wants to switch to uploaded file
4. Clicks "Upload File" tab
5. Selects new-logo.png from filesystem
6. File uploads to /uploads/logo-1703502400-abc123.png
7. URL field updates automatically
8. Preview shows new logo
9. Clicks "Save Branding"
10. All pages display new logo
```

### Example 2: Update Logo from External URL

```
1. Admin navigates to /admin/theme
2. Clicks "Link to URL" tab
3. Enters https://cdn.example.com/logos/brand-v2.png
4. Preview loads from external URL
5. Clicks "Save Branding"
6. Site displays external URL logo
```

### Example 3: Rollback to Previous Logo

```
1. Admin uploads new logo (url gets /uploads/logo-1703502400-abc123.png)
2. Decides to revert to old logo
3. Goes back to /admin/theme
4. Changes URL to /ci/restlogopngv1/ST_Branding_V1-07.png
5. Clicks "Save Branding"
6. Old logo displayed again
```

---

## Best Practices

### 1. **Logo Size**
- Recommended: Keep logos under 500KB
- Format: PNG or WebP for transparency, JPEG for photos
- Aspect ratio: 2:1 or 3:1 (landscape)

### 2. **Naming Convention**
- Manual uploads: Use descriptive names
- System generates unique names automatically
- Keep track of URLs you use

### 3. **Backups**
- Keep copies of important logo files
- Note working URLs for quick rollback
- Take screenshots of settings before changes

### 4. **File Organization**
- Uploaded files in: `public/uploads/`
- Asset files in: `public/ci/` or similar
- External URLs: Store in theme or documentation

### 5. **Error Handling**
- If upload fails: Check file size (max 5MB)
- If file type error: Ensure JPEG, PNG, WebP, or GIF
- If URL doesn't load: Verify path is correct

---

## Troubleshooting

### Logo Not Displaying

**Check**:
1. Is the URL correct?
   - Relative: `/uploads/logo-1703502400-abc123.png`
   - External: `https://example.com/logo.png`
2. Does the file exist at that path?
3. Is the image file valid (not corrupted)?

**Solution**:
- Use browser dev tools to check image URL in network tab
- Try uploading file again
- Use different image file if current one is corrupted

### Upload Fails

**Check**:
1. File size (max 5MB)
2. File type (JPEG, PNG, WebP, GIF only)
3. User is logged in as admin
4. Disk space available on server

**Solution**:
- Reduce file size (compress image)
- Convert to supported format
- Check authentication status
- Check server disk space

### Changes Not Appearing

**Check**:
1. Did you click "Save Branding"?
2. Any JavaScript errors in browser console?
3. Is page refreshed after save?

**Solution**:
- Click "Save Branding" button
- Check browser console for errors
- Hard refresh page (Cmd+Shift+R / Ctrl+Shift+R)
- Check theme context is loading correctly

---

## Technical Implementation Details

### File Upload Flow

```
User selects file
    ↓
onChange fires on input
    ↓
handleLogoUpload() called
    ↓
Create FormData with file
    ↓
POST to /api/admin/upload
    ↓
API validates file
    ↓
API stores in public/uploads/
    ↓
API returns /uploads/filename
    ↓
setLogoUrl(response.url)
    ↓
Preview updates immediately
    ↓
Admin clicks "Save Branding"
    ↓
updateTheme({ logoUrl })
    ↓
Theme saved to database
    ↓
All components get new logo
```

### URL Input Flow

```
User enters URL
    ↓
onChange updates logoUrl state
    ↓
Preview reloads with new URL
    ↓
Admin clicks "Save Branding"
    ↓
updateTheme({ logoUrl })
    ↓
Theme saved to database
    ↓
All components get new logo
```

---

## File Manifest

### Created Files

1. **`app/api/admin/upload/route.ts`**
   - Upload API endpoint
   - File validation and storage
   - 80 lines

### Modified Files

1. **`app/admin/theme/page.tsx`**
   - Added logoMethod state (url | upload)
   - Added uploading state for progress
   - Added handleLogoUpload() function
   - Updated logo form section with tabs
   - Enhanced preview display
   - Lines changed: ~100+

---

## Testing Checklist

- [ ] Navigate to `/admin/theme`
- [ ] Click "Link to URL" tab
- [ ] Enter a URL and see preview update
- [ ] Click "Save Branding"
- [ ] Verify URL saved in database
- [ ] Click "Upload File" tab
- [ ] Select a PNG/JPEG file (< 5MB)
- [ ] See file upload to server
- [ ] See preview update with uploaded image
- [ ] Click "Save Branding"
- [ ] Verify URL saved in database
- [ ] Check Header displays logo correctly
- [ ] Check Footer displays logo correctly
- [ ] Try uploading file > 5MB (should fail)
- [ ] Try uploading unsupported file type (should fail)
- [ ] Try switching between URL and Upload methods
- [ ] Verify changes persist after page refresh

---

## Summary

The dual logo upload system provides flexibility:

| Aspect | URL Method | Upload Method |
|--------|-----------|----------------|
| **Setup** | Paste URL | Select file |
| **Storage** | External or asset path | Server (public/uploads/) |
| **Speed** | Instant | ~1-2 seconds |
| **Management** | Manual tracking | Auto-generated names |
| **Rollback** | Change URL string | Upload previous file |
| **External CDN** | ✅ Supported | ✗ N/A |

Both methods are fully integrated with the theme system and work seamlessly with Header and Footer components!
