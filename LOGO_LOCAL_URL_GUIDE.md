# Logo Management Guide - Local URL References

## Current Setup

Your logo has been moved to the local uploads folder for better performance and management.

### Current Logo Location
- **File**: `public/uploads/logo-samui-transfers.png`
- **Local URL**: `/uploads/logo-samui-transfers.png`
- **Size**: 8.4 KB
- **Format**: PNG with transparency

### Where It's Used

#### Header Component
```javascript
// components/layout/Header.js (line 74)
const logoUrl = theme?.logoUrl || StRec;

// Renders as:
{typeof logoUrl === 'string' ? (
  <img src={logoUrl} alt={`${brandName} Logo`} width={40} height={40} />
) : (
  <Image src={logoUrl} alt={`${brandName} Logo`} width={40} height={40} />
)}

// Current: logoUrl = "/uploads/logo-samui-transfers.png"
```

#### Footer Component
```javascript
// components/layout/Footer.js (line 6)
import StLogoLong from '@/public/ci/ST_Branding_V1-03.png'

// Currently using: ST_Branding_V1-03.png from /ci folder
// Can be updated to use theme-managed logo like Header
```

---

## How to Reference Local URLs in Theme

### 1. **Absolute Local Path** (Recommended for Consistency)

```
/uploads/logo-samui-transfers.png
```

**Benefits**:
- ✅ Always served from your domain
- ✅ Consistent loading across all environments
- ✅ Easy to version with timestamps
- ✅ No external dependencies
- ✅ Better performance

**Example in Admin Theme**:
```
Admin → /admin/theme → Link to URL tab
Enter: /uploads/logo-samui-transfers.png
Click Save
```

### 2. **Relative Path from Public Folder**

```
uploads/logo-samui-transfers.png
```

**Note**: This also works but absolute paths are more reliable.

### 3. **External URL** (For CDN or External Hosting)

```
https://cdn.example.com/images/logo.png
https://assets.example.com/branding/logo.png
```

**Benefits**:
- ✅ Offload bandwidth to CDN
- ✅ Faster delivery globally
- ✅ Separate from main app

**Drawbacks**:
- ❌ External dependency
- ❌ Requires CORS if needed
- ❌ Need to manage separate hosting

---

## How to Upload New Logos to Uploads Folder

### Option 1: Via Admin Panel (Easiest)

1. Go to `/admin/theme`
2. Select **"Upload File"** tab under Logo section
3. Click file picker and select your logo (PNG, JPG, WebP, GIF)
4. File auto-uploads to `/public/uploads/`
5. URL auto-populates: `/uploads/logo-{timestamp}-{random}.png`
6. Preview updates
7. Click **"Save Branding"**

**Result**: Your logo is now hosted locally and referenced in the theme!

### Option 2: Manual File Copy

1. Copy your logo file to `public/uploads/`
2. Update the theme via admin panel with URL: `/uploads/your-logo.png`
3. Or update database seed file directly

---

## Complete File Structure

```
frontend/
├── public/
│   ├── uploads/                           ← NEW: All uploaded logos here
│   │   ├── logo-samui-transfers.png      ← Current branding logo
│   │   ├── logo-1703502400-abc123.png    ← Example: uploaded via admin
│   │   └── logo-1703502401-def456.png    ← Example: another upload
│   │
│   ├── ci/                                ← Static branding assets
│   │   ├── restlogopngv1/
│   │   │   └── ST_Branding_V1-07.png     ← Original location
│   │   ├── ST_Branding_V1-03.png         ← Long logo variant
│   │   └── ...
│   │
│   └── (other public assets)
│
├── components/
│   └── layout/
│       ├── Header.js                      ← Uses theme?.logoUrl
│       └── Footer.js                      ← Could use theme?.logoUrl
│
├── app/
│   ├── api/admin/theme/route.ts          ← Saves logo URLs
│   └── api/admin/upload/route.ts         ← Handles file uploads
│
└── prisma/
    ├── seed.ts                            ← Default theme config
    └── seed.cjs                           ← Default theme config
```

---

## URL Reference Examples

### Current Setup

```javascript
// Default theme (from seed)
{
  websiteName: "Samui Transfers",
  logoUrl: "/uploads/logo-samui-transfers.png",  // LOCAL
  faviconUrl: "/ci/restlogopngv1/ST_Branding_V1-07.png",  // ASSET
}
```

### What Each URL Type Means

| URL Type | Example | Source | Best For |
|----------|---------|--------|----------|
| **Local Upload** | `/uploads/logo-samui-transfers.png` | `public/uploads/` | Admin-uploaded files |
| **Asset Path** | `/ci/restlogopngv1/ST_Branding_V1-07.png` | `public/ci/` | Static bundled files |
| **External CDN** | `https://cdn.example.com/logo.png` | Remote server | Large assets, global delivery |
| **Next Image** | Dynamic import | `import Logo from '...'` | Optimized images in JSX |

---

## How Theme Logo is Fetched & Displayed

### 1. **Database Stores URL**
```
ThemeConfig.logoUrl = "/uploads/logo-samui-transfers.png"
```

### 2. **API Returns URL**
```
GET /api/admin/theme
Response: {
  ...,
  logoUrl: "/uploads/logo-samui-transfers.png",
  ...
}
```

### 3. **ThemeContext Provides Data**
```typescript
// context/ThemeContext.tsx
const fetchTheme = async () => {
  const response = await fetch('/api/admin/theme')
  const data = await response.json()
  setTheme(data)  // theme.logoUrl now available
}

export function useTheme() {
  return theme  // Returns: { ..., logoUrl: "/uploads/..." }
}
```

### 4. **Components Use Theme**
```javascript
// Header.js
const { theme } = useTheme()
const logoUrl = theme?.logoUrl || StRec

<img src={logoUrl} alt="Logo" />
// Renders: <img src="/uploads/logo-samui-transfers.png" alt="Logo" />
```

### 5. **Browser Loads Image**
```
GET /uploads/logo-samui-transfers.png
→ Served by Next.js from public folder
→ Displays in header
```

---

## Admin Panel How-To: Change Logo

### Step-by-Step

1. **Open Admin Theme Page**
   ```
   URL: http://localhost:3000/admin/theme
   ```

2. **Choose Upload Method**
   - **Link to URL**: Paste an external URL or local path
   - **Upload File**: Select image from computer

3. **Local URL Method** (Recommended)
   ```
   Click: "Link to URL" tab
   Enter: /uploads/logo-samui-transfers.png
   See preview update
   Click: "Save Branding"
   ```

4. **Upload Method** (Auto-uploads)
   ```
   Click: "Upload File" tab
   Select: PNG/JPEG/WebP file from your computer
   File uploads automatically
   URL auto-fills: /uploads/logo-{timestamp}-{random}.png
   See preview update
   Click: "Save Branding"
   ```

5. **Site Updates**
   - Header shows new logo
   - Footer shows new logo (if connected)
   - Theme persists in database
   - Survives page refreshes

---

## Common Local URL Patterns

### Pattern 1: Simple Name (Manual Upload)
```
/uploads/logo.png
/uploads/logo-main.png
/uploads/logo-samui-transfers.png
```

**Use when**: You manually copy files or prefer consistent naming

### Pattern 2: Timestamped (Auto-Upload via Admin)
```
/uploads/logo-1703502400-abc123.png
/uploads/logo-1703502401-def456.png
/uploads/logo-1703502402-xyz789.png
```

**Use when**: Using admin panel file upload (auto-generated names)

### Pattern 3: Mix Both
```
/uploads/logo-main.png              ← Primary logo (static name)
/uploads/logo-alt.png               ← Alternate logo (static name)
/uploads/logo-backup-20240101.png   ← Backup with date (manual)
```

---

## Current Logo Info

### File Details
- **Filename**: `logo-samui-transfers.png`
- **Full Path**: `public/uploads/logo-samui-transfers.png`
- **URL Reference**: `/uploads/logo-samui-transfers.png`
- **Size**: 8.4 KB
- **Format**: PNG (transparent background)
- **Display Size**: 40×40px (header), scalable

### Original Source
- **Previous Location**: `/ci/restlogopngv1/ST_Branding_V1-07.png`
- **Now Copied To**: `/uploads/logo-samui-transfers.png`
- **Why**: Better management, clearer organization, upload folder consistency

---

## Troubleshooting

### Logo Not Showing?

**Check 1: URL Path**
```javascript
// Verify in admin panel
Go to /admin/theme
Check if URL matches one of:
✅ /uploads/logo-samui-transfers.png
✅ /ci/restlogopngv1/ST_Branding_V1-07.png
✅ https://example.com/logo.png
```

**Check 2: File Exists**
```bash
# Terminal check
ls -la frontend/public/uploads/
# Should show: logo-samui-transfers.png
```

**Check 3: Browser Console**
```
Open browser DevTools (F12)
Check Console tab for errors
Check Network tab - image request should be 200 OK
```

**Check 4: Hard Refresh**
```
Mac: Cmd + Shift + R
Windows: Ctrl + Shift + R
Clears cache and reloads
```

---

## Best Practices

### ✅ Do's

- **Use local URLs** for assets you control (`/uploads/...`)
- **Test on admin panel** before committing changes
- **Use meaningful names**: `logo-samui-transfers.png` vs `logo.png`
- **Keep backups**: Save old logos before deleting
- **Use relative paths** within your domain

### ❌ Don'ts

- **Don't use full URLs** in seed files: `https://example.com/logo.png` can break if domain changes
- **Don't mix upload methods** without tracking: Keep a spreadsheet of what's where
- **Don't delete original files** until you're sure new ones work
- **Don't hardcode logos** in components: Always use theme context

---

## Summary

| Aspect | Details |
|--------|---------|
| **Current Logo File** | `public/uploads/logo-samui-transfers.png` |
| **How To Reference** | `/uploads/logo-samui-transfers.png` |
| **Where Used** | Header, potentially Footer |
| **How To Change** | Admin panel: `/admin/theme` → Logo section |
| **Upload Method** | Click "Upload File" or "Link to URL" |
| **Best Practice** | Use local URLs (`/uploads/...`) for consistency |

The logo system is now **fully functional** with local hosting! You can upload new logos, reference them by URL, and all components automatically display the current theme logo. 🎯
