# Logo URL References - Quick Visual Guide

## Your Current Logo Setup

```
┌─────────────────────────────────────────────────────┐
│         CURRENT LOGO CONFIGURATION                   │
├─────────────────────────────────────────────────────┤
│                                                       │
│  File Location:  public/uploads/logo-samui-transfers.png
│  Local URL:      /uploads/logo-samui-transfers.png
│  Size:           8.4 KB
│  Format:         PNG with transparency
│  Usage:          Header (40×40px), potentially Footer
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    LOGO DATA FLOW                                │
└──────────────────────────────────────────────────────────────────┘

1. ADMIN PANEL
   ┌─────────────────────────┐
   │  /admin/theme          │
   │  Logo Section:         │
   │  [Link to URL] [Upload]│
   │  Input: /uploads/...   │
   │  [Save Branding]       │
   └────────────┬───────────┘
                │
                │ PUT request with all fields
                ↓
2. API ENDPOINT
   ┌──────────────────────────────┐
   │  PUT /api/admin/theme       │
   │  - Extract logoUrl field     │
   │  - Validate auth             │
   │  - Save to database          │
   └────────────┬─────────────────┘
                │
                │ Save to database
                ↓
3. DATABASE
   ┌──────────────────────────────┐
   │  ThemeConfig.logoUrl         │
   │  = "/uploads/logo-samui-..." │
   └────────────┬─────────────────┘
                │
                │ GET request
                ↓
4. THEME CONTEXT
   ┌──────────────────────────────┐
   │  useTheme() Hook             │
   │  theme.logoUrl =             │
   │  "/uploads/logo-samui-..."   │
   └────────────┬─────────────────┘
                │
                │ Provide to components
                ↓
5. COMPONENTS
   ┌──────────────────────────────┐
   │  Header.js                   │
   │  <img src={logoUrl} />       │
   │                              │
   │  Footer.js (future)          │
   │  <img src={logoUrl} />       │
   └────────────┬─────────────────┘
                │
                │ Render to browser
                ↓
6. BROWSER
   ┌──────────────────────────────┐
   │  GET /uploads/logo-samui-... │
   │  ↓                           │
   │  Display logo in header      │
   │  Display logo in footer      │
   └──────────────────────────────┘
```

---

## URL Types Comparison

```
┌────────────────────────────────────────────────────────────┐
│                    URL TYPE COMPARISON                      │
├────────────────────────────────────────────────────────────┤

1. LOCAL UPLOADS (RECOMMENDED)
   ┌──────────────────────────────────────────────────────┐
   │  /uploads/logo-samui-transfers.png                  │
   │  ✅ Serves from your domain                         │
   │  ✅ Full control over file                          │
   │  ✅ Fast loading (no external dependency)          │
   │  ✅ Works offline/locally                           │
   │  ✅ Easy to version & track                         │
   │  Usage: Primary logos, frequently changed files     │
   └──────────────────────────────────────────────────────┘

2. ASSET PATH (STATIC)
   ┌──────────────────────────────────────────────────────┐
   │  /ci/restlogopngv1/ST_Branding_V1-07.png           │
   │  ✅ Bundled with app                                │
   │  ✅ Never changes                                    │
   │  ✅ Good for branding assets                        │
   │  ❌ Requires code change to swap                    │
   │  Usage: Static brand assets, fallback logos         │
   └──────────────────────────────────────────────────────┘

3. EXTERNAL CDN (REMOTE)
   ┌──────────────────────────────────────────────────────┐
   │  https://cdn.example.com/logo.png                   │
   │  ✅ Offload bandwidth                               │
   │  ✅ Global CDN performance                          │
   │  ❌ External dependency                             │
   │  ❌ May have CORS issues                            │
   │  Usage: Large assets, high-traffic scenarios        │
   └──────────────────────────────────────────────────────┘
```

---

## How to Change Logo - Visual Steps

```
STEP 1: ACCESS ADMIN PANEL
┌─────────────────────────┐
│ Browser URL:            │
│ localhost:3000/admin... │
│ /theme                  │
└─────────────────────────┘
           ↓

STEP 2: FIND LOGO SECTION
┌─────────────────────────────────────────┐
│  Page Content:                          │
│  [Branding & Identity]                  │
│    Website Name field                   │
│    [Link to URL] [Upload File] ← HERE   │
│    Logo preview                         │
│  [Save Branding]                        │
└─────────────────────────────────────────┘
           ↓

STEP 3A: USE LOCAL URL (Easiest for existing files)
┌────────────────────────────────────────────┐
│ Click "Link to URL" tab                    │
│ Enter: /uploads/logo-samui-transfers.png  │
│ See preview update with logo              │
│ Click [Save Branding]                     │
└────────────────────────────────────────────┘
           ↓

STEP 3B: UPLOAD NEW FILE (if different logo)
┌────────────────────────────────────────────┐
│ Click "Upload File" tab                    │
│ [Choose File] → select from computer      │
│ File uploads → URL auto-fills              │
│ See preview with new logo                 │
│ Click [Save Branding]                     │
└────────────────────────────────────────────┘
           ↓

STEP 4: VERIFY SAVE
┌────────────────────────────────────────────┐
│ Success message appears                   │
│ Database updated with new logoUrl         │
│ Header shows new logo                     │
│ Footer shows new logo (when enabled)      │
└────────────────────────────────────────────┘
```

---

## File Organization

```
Your Website Structure
═══════════════════════════════════════════════════════════

frontend/
│
├── public/                    ← Served directly by browser
│   │
│   ├── uploads/              ← Admin-uploaded files (RECOMMENDED)
│   │   ├── logo-samui-transfers.png      ← Current main logo
│   │   ├── logo-1703502400-abc123.png    ← Example: old upload
│   │   └── [other uploads...]
│   │
│   ├── ci/                   ← Static company assets
│   │   ├── restlogopngv1/
│   │   │   └── ST_Branding_V1-07.png     ← Original branding
│   │   ├── ST_Branding_V1-03.png         ← Long logo variant
│   │   └── [other assets...]
│   │
│   └── [other folders...]
│
└── [other app files...]

═══════════════════════════════════════════════════════════
```

---

## URL Pattern Examples

```
UPLOADS FOLDER PATTERNS (Use These!)
════════════════════════════════════════════════════════════

Simple Names (Manual):
  /uploads/logo.png
  /uploads/logo-main.png
  /uploads/logo-samui-transfers.png
  /uploads/logo-alternate.png
  /uploads/logo-backup.png

Timestamped (Auto from Admin):
  /uploads/logo-1703502400-abc123.png
  /uploads/logo-1703502401-def456.png
  /uploads/logo-20240101-xyz789.png

Organized by Type:
  /uploads/logos/logo-main.png
  /uploads/logos/logo-alt.png
  /uploads/logos/favicon.png

With Descriptions:
  /uploads/logo-samui-transfers-light.png
  /uploads/logo-samui-transfers-dark.png
  /uploads/logo-square.png
  /uploads/logo-wide.png
```

---

## Database → Components Flow

```
WHAT HAPPENS WHEN YOU SAVE
═══════════════════════════════════════════════════════════

1. Admin Panel
   User enters: /uploads/logo-samui-transfers.png
   Clicks: [Save Branding]
                │
                ↓
2. API Route (PUT /api/admin/theme)
   Receives all form data
   Extracts: logoUrl: "/uploads/logo-samui-transfers.png"
   Updates database
                │
                ↓
3. Database (Prisma/PostgreSQL)
   Table: ThemeConfig
   Record: { id, name, logoUrl, ... }
   logoUrl = "/uploads/logo-samui-transfers.png"
                │
                ↓
4. Theme Fetched (GET /api/admin/theme)
   Returns: { logoUrl: "/uploads/logo-samui-transfers.png", ... }
                │
                ↓
5. ThemeContext (React Hook)
   const { theme } = useTheme()
   theme.logoUrl = "/uploads/logo-samui-transfers.png"
                │
                ↓
6. Components (Header, Footer, etc.)
   const logoUrl = theme?.logoUrl
   <img src={logoUrl} />
   Renders: <img src="/uploads/logo-samui-transfers.png" />
                │
                ↓
7. Browser
   Request: GET /uploads/logo-samui-transfers.png
   Response: Image file from public/uploads/
   Display: Logo shows in page!
```

---

## Quick Reference Table

```
╔═══════════════════════════════════════════════════════════╗
║            LOGO URL QUICK REFERENCE                       ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Current Logo File:                                      ║
║  public/uploads/logo-samui-transfers.png                ║
║                                                           ║
║  Current Theme URL:                                      ║
║  /uploads/logo-samui-transfers.png                      ║
║                                                           ║
║  How to Change:                                          ║
║  1. Go to http://localhost:3000/admin/theme            ║
║  2. Scroll to "Logo" section                            ║
║  3. Choose "Link to URL" or "Upload File"              ║
║  4. Enter/select: /uploads/logo-samui-transfers.png    ║
║  5. Click [Save Branding]                              ║
║                                                           ║
║  For New Logo:                                           ║
║  1. Use "Upload File" tab                              ║
║  2. Select PNG/JPG from computer                       ║
║  3. URL auto-fills with upload path                    ║
║  4. Click [Save Branding]                              ║
║                                                           ║
║  For External URL:                                       ║
║  1. Use "Link to URL" tab                              ║
║  2. Paste: https://cdn.example.com/logo.png           ║
║  3. Click [Save Branding]                              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## What's Working Now ✅

```
✅ Logo stored in: public/uploads/logo-samui-transfers.png
✅ Referenced as: /uploads/logo-samui-transfers.png
✅ Database stores: /uploads/logo-samui-transfers.png
✅ Header displays: ✓ (uses theme.logoUrl)
✅ Footer ready: ✓ (can use theme.logoUrl)
✅ Admin panel: ✓ (can change via UI)
✅ Auto-upload: ✓ (can upload new files)
✅ Local URLs: ✓ (all local, no external deps)
```

Done! Your logo system is fully functional with local URL hosting! 🎉
