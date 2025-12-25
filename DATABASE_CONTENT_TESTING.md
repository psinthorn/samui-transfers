# Testing Content Database Integration

## Quick Test Steps

### 1. Verify Pages are Fetching from Database

**Test URLs:**
- http://localhost:3000/privacy
- http://localhost:3000/terms
- http://localhost:3000/faq
- http://localhost:3000/why-choose-us

### 2. Test Real-Time Updates

1. **Go to Admin Panel:**
   - http://localhost:3000/admin/content

2. **Update Privacy Policy:**
   - Find "Privacy Policy" (slug: privacy-policy)
   - Edit the English or Thai content
   - Save changes

3. **Verify Changes on Frontend:**
   - Go to http://localhost:3000/privacy
   - Content should immediately reflect your changes
   - No page refresh needed

### 3. Test Language Switching

1. **Update content in different language:**
   - Go to admin panel
   - Update content_en for English
   - Update content_th for Thai

2. **Test on frontend:**
   - Switch language in header
   - Content should update without page reload

### 4. Test Each Page

**Privacy Policy (/privacy)**
- [ ] Content loads from database
- [ ] Language switching works
- [ ] CTA button displays correctly
- [ ] Updates when edited in admin

**Terms & Conditions (/terms)**
- [ ] Content loads from database
- [ ] All sections render properly
- [ ] Language switching works
- [ ] Updates when edited in admin

**FAQ (/faq)**
- [ ] Content loads from database
- [ ] Search functionality works
- [ ] FAQ categories display
- [ ] Language switching works
- [ ] Updates when edited in admin

**Why Choose Us (/why-choose-us)**
- [ ] All feature cards display
- [ ] Stats section shows correctly
- [ ] Testimonials render
- [ ] Language switching works

## Troubleshooting

### Content Not Updating?

1. **Check Network Tab:**
   - Open browser DevTools → Network
   - Look for `/api/admin/content?slug=...` requests
   - Verify response contains latest data

2. **Clear Browser Cache:**
   ```bash
   # Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
   ```

3. **Check Database:**
   ```bash
   # In Prisma Studio
   npx prisma studio
   # Navigate to PageContent table
   # Verify content is actually updated
   ```

4. **Check API Response:**
   ```bash
   curl "http://localhost:3000/api/admin/content?slug=privacy-policy"
   ```

### API Returns 401 Unauthorized?

- Make sure you're logged in with ADMIN role
- Check authentication status in browser console

### Content Not Showing at All?

- Check browser console for JavaScript errors
- Verify database is running
- Check that content exists in database

## Cache Busting Implementation

The components now include:
```typescript
cache: 'no-store',
headers: {
  'Cache-Control': 'no-cache'
}
```

This ensures:
- No HTTP cache
- No browser cache
- Always fresh data from database
- Updates appear immediately

## Database Content Sources

Content is stored in `PageContent` table:
- `slug` - URL identifier
- `title_en` / `title_th` - Page titles
- `description_en` / `description_th` - Meta descriptions
- `content_en` / `content_th` - HTML content
- `status` - draft/published
- `publishedAt` - Publication date

## Seeding Database

To reset content to defaults:
```bash
cd frontend
npx tsx scripts/seed-cms-content.ts
```

## Current Status

✅ Privacy Policy - Fetching from database
✅ Terms & Conditions - Fetching from database
✅ FAQ - Fetching from database
✅ Why Choose Us - Using curated content (not CMS)

All pages now support:
- Real-time updates from admin panel
- Bilingual content (English & Thai)
- Language switching without page reload
- Proper error handling
- Cache busting for fresh data
