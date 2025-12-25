# Theme System Implementation Guide

## Overview
The application now uses a **database-driven theme system** that allows complete design customization from the admin panel. All colors, typography, spacing, and other design tokens are managed through a centralized Theme Configuration stored in PostgreSQL.

## Architecture

### 1. **Theme Storage (Database)**
- **Model**: `ThemeConfig` in Prisma
- **Location**: `prisma/schema.prisma`
- **Structure**:
  ```prisma
  model ThemeConfig {
    id        String    @id @default(cuid())
    name      String    @unique
    isActive  Boolean   @default(false)
    colors    Json      // 7 color palettes with 10 shades each
    typography Json    // Font families and sizes
    spacing   Json      // Spacing scale
    borderRadius Json   // Border radius scale
    shadows   Json      // Shadow definitions
    createdAt DateTime  @default(now())
    updatedAt DateTime  @updatedAt
  }
  ```

### 2. **Theme Context Provider**
- **Location**: `context/ThemeContext.tsx`
- **Purpose**: Makes theme accessible throughout the app via `useTheme()` hook
- **Key Methods**:
  - `fetchTheme()`: Loads active theme from database
  - `updateTheme()`: Updates theme in database
  - `refreshTheme()`: Reloads theme to reflect admin changes

### 3. **CSS Variable Injection**
- **Component**: `components/theme/ThemeApplier.tsx`
- **How it Works**:
  - Listens to theme changes via `useTheme()` hook
  - Injects all theme values as CSS variables into document root
  - Variables are applied in real-time without page reload
  
- **Example CSS Variables Applied**:
  ```css
  --color-primary-500: #3b82f6    /* Injected from theme.colors.primary[500] */
  --color-secondary-600: #9333ea  /* Injected from theme.colors.secondary[600] */
  --text-base: 16px               /* Injected from theme.typography.fontSizes */
  --space-4: 16px                 /* Injected from theme.spacing.scales */
  --radius-md: 8px                /* Injected from theme.borderRadius */
  --shadow-lg: 0 10px 15px...     /* Injected from theme.shadows */
  ```

### 4. **CSS Variable Fallbacks**
- **Location**: `app/globals.css`
- **Default Values**: All CSS variables have fallback values defined in `:root`
- **Purpose**: Ensures styling works even if theme fails to load
- **Example**:
  ```css
  :root {
    --color-primary-500: #3b82f6;  /* Default fallback */
    /* ThemeApplier overrides this at runtime */
  }
  ```

### 5. **Tailwind CSS Integration**
- **Location**: `app/globals.css` (component layer)
- **Theme-Aware Classes**: 
  ```css
  .bg-primary {
    background-color: var(--color-primary-600);
  }
  .text-primary {
    color: var(--color-primary-600);
  }
  /* And similar for: secondary, accent, success, danger, warning */
  ```

### 6. **Admin Management UI**
- **Location**: `app/admin/theme/page.tsx`
- **Features**:
  - Color picker for each palette (primary, secondary, accent, etc.)
  - Real-time preview of color changes
  - Save changes to database
  - Create new themes (future)

### 7. **Admin API Routes**
- **Location**: `app/api/admin/theme/route.ts`
- **Endpoints**:
  - `GET /api/admin/theme`: Fetch active theme
  - `PUT /api/admin/theme`: Update active theme colors
  - `POST /api/admin/theme`: Create new theme

## How It Works

### **Step 1: Page Loads**
1. Next.js renders layout with `ThemeProvider` and `ThemeApplier`
2. `ThemeProvider` context initializes
3. `useTheme()` hook triggers `fetchTheme()` to load active theme from database

### **Step 2: Theme Applies**
1. Theme data fetched from database via `/api/admin/theme`
2. `ThemeApplier` component detects theme change
3. `useEffect` hook loops through all theme values
4. CSS variables are set on document root via `setProperty()`

### **Step 3: Styles Apply**
1. Components use theme-aware classes: `bg-primary`, `text-primary`, etc.
2. These classes reference CSS variables: `var(--color-primary-600)`
3. CSS variables now contain database values
4. Browser renders with theme colors

### **Step 4: Admin Changes Theme**
1. Admin visits `/admin/theme`
2. Changes color picker values
3. Submits form → `PUT /api/admin/theme`
4. Database updates ThemeConfig
5. `ThemeApplier` detects change and re-injects CSS variables
6. All pages reflect new colors instantly

## Color Palette Structure

Each theme includes 7 color palettes with 10 shades each:

```typescript
colors: {
  primary: {
    50: "#eff6ff",    // Lightest
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",   // Base color
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a"    // Darkest
  },
  secondary: { /* same structure */ },
  accent: { /* same structure */ },
  success: { /* same structure */ },
  danger: { /* same structure */ },
  warning: { /* same structure */ },
  neutral: { /* same structure */ }
}
```

## Using Theme in Components

### **Via useTheme() Hook**
```tsx
'use client'
import { useTheme } from '@/context/ThemeContext'

export function MyComponent() {
  const { theme } = useTheme()
  
  return (
    <div style={{ color: theme?.colors.primary[500] }}>
      Using inline styles with theme
    </div>
  )
}
```

### **Via Tailwind Classes**
```tsx
<div className="bg-primary text-white p-4">
  Using theme-aware Tailwind classes
</div>
```

### **Via CSS Variables**
```tsx
<div style={{ color: 'var(--color-primary-500)' }}>
  Using CSS variables directly
</div>
```

## Default Theme Values

The system seeds a default theme with these colors:

| Palette | Color | Hex Value |
|---------|-------|-----------|
| Primary | Blue | #3b82f6 |
| Secondary | Purple | #a855f7 |
| Accent | Amber | #f59e0b |
| Success | Green | #22c55e |
| Danger | Red | #ef4444 |
| Warning | Yellow | #f59e0b |
| Neutral | Gray | #64748b |

## File Structure

```
samui-transfers/
├── app/
│   ├── globals.css           # CSS variable declarations
│   ├── layout.tsx            # ThemeProvider + ThemeApplier
│   └── admin/
│       └── theme/
│           └── page.tsx      # Admin theme management UI
├── components/
│   └── theme/
│       └── ThemeApplier.tsx  # CSS variable injection
├── context/
│   └── ThemeContext.tsx      # Theme provider & hook
├── prisma/
│   ├── schema.prisma         # ThemeConfig model
│   └── seed.ts               # Theme seeding
└── app/api/admin/
    └── theme/
        └── route.ts          # Theme API endpoints
```

## Enabling Real-Time Theme Changes

The theme system is **already set up for real-time changes**:

1. Admin changes color in `/admin/theme`
2. Form submits to `PUT /api/admin/theme`
3. Database updates
4. Browser fetches new theme via `useEffect` in ThemeContext
5. `ThemeApplier` re-injects CSS variables
6. **All pages instantly reflect new colors** ✨

No page reload needed!

## Performance Considerations

- **CSS Variables**: Zero runtime cost, pure browser CSS
- **Theme Fetching**: Cached with `cache: 'no-store'` for real-time updates
- **Component Re-renders**: Only when theme actually changes
- **Bundle Size**: Minimal impact, uses native browser CSS variables

## Extending the System

### **Add New Color Palette**
1. Edit `lib/theme-config.ts` default theme
2. Add new palette to ThemeConfig colors object
3. Run `npm run prisma:seed` to update database
4. Use in components: `var(--color-newpalette-500)`

### **Add New Design Token Type**
1. Add field to ThemeConfig in `prisma/schema.prisma`
2. Update `ThemeApplier.tsx` to inject new variables
3. Add CSS variable declarations in `globals.css`
4. Update admin UI in `app/admin/theme/page.tsx`

### **Create New Theme Variant**
1. Use admin UI or directly insert via database
2. Update `isActive` flag to switch between themes
3. System automatically applies new theme

## Debugging

### **Theme Not Applying**
Check browser DevTools Console Elements tab:
```css
/* Should see these on <html> element */
--color-primary-500: #3b82f6
--color-secondary-600: #9333ea
/* etc */
```

### **Verify Theme Loading**
```tsx
const { theme, isLoading } = useTheme()
console.log('Theme loaded:', theme)
console.log('Is loading:', isLoading)
```

### **Test CSS Variables**
```html
<div style="color: var(--color-primary-500)">
  <!-- Should be blue (#3b82f6) -->
</div>
```

## Next Steps

- ✅ Theme system created and integrated
- ✅ Default theme seeded
- ✅ CSS variables implemented
- ✅ Admin management UI built
- ⏳ Create multiple theme presets (dark mode, high contrast, etc.)
- ⏳ Theme export/import functionality
- ⏳ Theme templates for quick customization
- ⏳ A/B testing with different themes

## Summary

The Samui Transfers website now has a **professional, centralized theme management system** that:

✨ **Stores all design tokens in database**  
✨ **Applies them via CSS variables at runtime**  
✨ **Allows instant changes from admin panel**  
✨ **Requires zero code changes for design updates**  
✨ **Provides fallback values for reliability**  
✨ **Integrates seamlessly with Tailwind CSS**

This is the foundation for a **fully customizable design system** that grows with the application! 🎨
