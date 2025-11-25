# Admin Dashboard - Visual Design Patterns & Component Library

**Date:** November 25, 2025  
**Purpose:** Component reference and reusable patterns  
**Status:** Complete

---

## 🎨 Reusable Component Patterns

### 1. Navigation Card Component

**Purpose:** Interactive navigation to admin modules  
**Usage:** Repeated 6 times in grid layout  
**Responsive:** Full width → 2 cols → 3 cols

**Component Structure:**
```tsx
<Link href="/admin/section">
  <div className="group relative h-full min-h-40 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-slate-300">
    {/* Gradient Accent Bar */}
    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#005B9A] to-[#003d6b] rounded-t-2xl" />
    
    {/* Icon */}
    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg">
      📅
    </div>
    
    {/* Title */}
    <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-[#005B9A] transition-colors">
      Manage Bookings
    </h3>
    
    {/* Description */}
    <p className="text-sm text-slate-600 leading-relaxed">
      View, confirm, and manage all customer bookings and reservations
    </p>
    
    {/* Arrow Indicator */}
    <div className="absolute bottom-4 right-4 text-slate-400 group-hover:text-[#005B9A] transition-colors">
      →
    </div>
  </div>
</Link>
```

**Customization Points:**
- Icon: Change emoji or SVG
- Title: Update heading text
- Description: Update description
- href: Change navigation link
- Color: All cards use same colors (no customization needed)

**States:**
- **Default:** shadow-sm, border-slate-200
- **Hover:** shadow-lg, border-slate-300, text-blue, arrow blue
- **Active:** Link pressed state (browser default)

---

### 2. Admin Info Card

**Purpose:** Display admin details and quick actions  
**Usage:** Once in welcome section  
**Responsive:** Stacked mobile → side-by-side desktop

**Component Structure:**
```tsx
<div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-slate-50 p-6 md:p-7">
  {/* Main Content */}
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    {/* Role Section */}
    <div className="space-y-1">
      <p className="text-sm font-medium text-slate-600">Administrator</p>
      <p className="text-lg font-semibold text-slate-900">admin@admin.com</p>
    </div>
    
    {/* Action Buttons */}
    <div className="flex gap-2 w-full sm:w-auto">
      <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-[#005B9A] bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-200">
        Profile
      </button>
      <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-[#005B9A] rounded-lg hover:bg-[#004080] transition-colors duration-200">
        Settings
      </button>
    </div>
  </div>

  {/* Divider */}
  <div className="border-t border-slate-200 mt-4" />

  {/* Info Grid */}
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</p>
      <p className="text-sm font-semibold text-green-600 mt-1">🟢 Active</p>
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Access Level</p>
      <p className="text-sm font-semibold text-slate-900 mt-1">Full Access</p>
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Module Count</p>
      <p className="text-sm font-semibold text-slate-900 mt-1">6</p>
    </div>
  </div>
</div>
```

**Customization Points:**
- Role text: Change "Administrator"
- Email: Change admin email
- Info grid items: Add/remove/edit stat rows
- Button colors: Primary button is blue, secondary is blue

---

### 3. Header with Breadcrumb

**Purpose:** Navigation context and status  
**Usage:** Sticky at top of page  
**Responsive:** Hidden breadcrumb on very small screens

**Component Structure:**
```tsx
<div className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
  <div className="page-gutter flex items-center justify-between h-16 md:h-20">
    {/* Breadcrumb Navigation */}
    <div className="flex items-center gap-2 text-sm">
      <Link href="/" className="text-slate-500 hover:text-slate-700 transition-colors">
        Home
      </Link>
      <span className="text-slate-300">/</span>
      <span className="font-medium text-slate-900">
        Admin Dashboard
      </span>
    </div>
    
    {/* Admin Badge */}
    <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
      <div className="h-2 w-2 rounded-full bg-green-500" />
      <span className="text-xs font-medium text-blue-700">Admin Panel</span>
    </div>
  </div>
</div>
```

**Customization Points:**
- Breadcrumb links: Update href values
- Breadcrumb labels: Change text
- Badge color: Primary blue used (no customization)
- Height: h-16 (64px) mobile, md:h-20 (80px) desktop

---

### 4. Brand Badge

**Purpose:** Company branding in welcome section  
**Usage:** Once at top of welcome section  
**Responsive:** Full size everywhere (inline-flex)

**Component Structure:**
```tsx
<div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-[#005B9A] to-[#003d6b] text-white">
  <div className="h-8 w-8 rounded-md bg-white/20 flex items-center justify-center text-sm font-bold">
    ST
  </div>
  <span className="text-sm font-semibold">Samui Transfers</span>
</div>
```

**Customization Points:**
- Logo (ST): Change to initials or icon
- Company name: Change text
- Background gradient: Uses brand colors (not customizable)

---

### 5. Pro Tip Section

**Purpose:** Helpful guidance for users  
**Usage:** Once below admin info card  
**Responsive:** Full width everywhere

**Component Structure:**
```tsx
<div className="rounded-lg border border-amber-200 bg-amber-50 p-4 md:p-5">
  <div className="flex gap-3">
    <div className="text-2xl flex-shrink-0">💡</div>
    <div>
      <p className="text-sm font-medium text-amber-900">Pro Tip</p>
      <p className="text-sm text-amber-800 mt-1">
        Click on any navigation card below to access that admin module. Hover to see more details.
      </p>
    </div>
  </div>
</div>
```

**Customization Points:**
- Icon: Change emoji
- Title: Change "Pro Tip"
- Message: Update helpful text
- Colors: Amber palette (warning/info color)

---

### 6. Gradient Accent Bar

**Purpose:** Visual branding element on cards  
**Usage:** Top of each navigation card  
**Style:** Subtle gradient from primary to dark blue

**Component Structure:**
```tsx
<div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#005B9A] to-[#003d6b] rounded-t-2xl" />
```

**Properties:**
- **Height:** h-1 (4px)
- **Width:** inset-x-0 (full width)
- **Gradient:** from-blue to-dark-blue
- **Position:** absolute, top of rounded card
- **Rounded:** rounded-t-2xl (matches card corners)

---

## 🎯 Layout Patterns

### Grid System

**Mobile (< 640px):**
```tsx
<div className="grid grid-cols-1 gap-4">
  {/* 1 column */}
</div>
```

**Tablet (640px - 1024px):**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {/* 2 columns */}
</div>
```

**Desktop (> 1024px):**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {/* 3 columns */}
</div>
```

---

### Spacing Patterns

**Section Gaps:**
```tsx
<div className="space-y-8 md:space-y-10">
  {/* 32px gap mobile, 40px gap desktop */}
</div>
```

**Container Padding:**
```tsx
<div className="page-gutter">
  {/* Responsive padding (16px mobile → 24px+ desktop) */}
</div>
```

**Card Padding:**
```tsx
<div className="p-6 md:p-7">
  {/* 24px padding mobile, 28px desktop */}
</div>
```

---

### Responsive Text Sizes

**Large Heading:**
```tsx
<h1 className="text-3xl md:text-4xl font-bold">
  {/* 30px mobile, 36px desktop */}
</h1>
```

**Card Title:**
```tsx
<h3 className="text-lg font-semibold">
  {/* 18px everywhere */}
</h3>
```

**Body Text:**
```tsx
<p className="text-sm text-slate-600">
  {/* 14px everywhere */}
</p>
```

---

## 🎨 Color Application Guide

### Primary Blue (#005B9A) Usage
- Card gradient start: `from-[#005B9A]`
- Hover text color: `hover:text-[#005B9A]`
- Focus ring: `ring-blue-500`
- Button background: `bg-[#005B9A]`
- Button hover: `hover:bg-[#004080]` (darker shade)

### Dark Blue (#003d6b) Usage
- Gradient end: `to-[#003d6b]`
- Accent bar bottom: `to-[#003d6b]`
- Deep shadow effect: Use with transparency

### Slate Palette
- **50:** Light backgrounds
- **100:** Secondary backgrounds
- **200:** Borders, subtle dividers
- **600:** Body text (good contrast)
- **900:** Headings, strong text

### Alert/Status Colors
- **Green:** Active, success (status badge)
- **Amber:** Tips, warnings (pro tip section)
- **Red:** Errors, alerts (future use)

---

## 🎭 Hover & Interaction States

### Card Hover
```tsx
<div className="transition-all duration-200 hover:shadow-lg hover:border-slate-300">
  {/* Smooth 200ms transition */}
  {/* Shadow increases */}
  {/* Border color brightens */}
</div>
```

### Text Hover
```tsx
<h3 className="group-hover:text-[#005B9A] transition-colors">
  {/* Color changes to blue on hover */}
  {/* Smooth color transition */}
</h3>
```

### Button Hover
```tsx
<button className="hover:bg-slate-50 transition-colors duration-200">
  {/* Background color changes */}
  {/* 200ms smooth transition */}
</button>
```

---

## 📐 Sizing Guidelines

### Touch Target Sizes
```
Minimum: 48px (WCAG AAA)
Cards:   min-h-40 (160px)
Icons:   h-10 w-10 (40px)
Buttons: h-12 (48px minimum)
```

### Spacing Scale
```
xs: 4px   (gap-1, h-1)
sm: 8px   (gap-2)
md: 16px  (p-4, gap-4)
lg: 24px  (p-6, gap-6)
xl: 32px  (space-y-8)
```

---

## 🌐 i18n Integration

### Using i18n in Components
```tsx
import { useLanguage } from "@/context/LanguageContext"
import { pick } from "@/data/i18n/core"
import { adminText } from "@/data/content/admin"

export default function Component() {
  const { lang } = useLanguage()
  
  return (
    <h1>{pick(lang, adminText.title)}</h1>
    // Returns English or Thai based on selected language
  )
}
```

### i18n Key Structure
```typescript
// Each key has both languages
{
  en: "English text",
  th: "ข้อความไทย"
}
```

---

## ♿ Accessibility Patterns

### Touch Target
```tsx
// Minimum 48px height for tappable elements
<button className="min-h-12 px-4 py-3">
  {/* At least 48x48 pixels */}
</button>
```

### Focus Ring
```tsx
// Visible focus indicator for keyboard navigation
<button className="focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
  {/* Blue ring around button when focused */}
</button>
```

### Color Contrast
```
Text/Background must have 4.5:1 ratio
- Dark text (#1F2937) on light (#F8FAFC) ✓
- Light text (#FFFFFF) on dark (#005B9A) ✓
- Gray text (#6B7280) on white (#FFFFFF) ✓
```

---

## 🚀 Copy-Paste Ready Components

### Minimal Navigation Card
```tsx
<Link href="/admin/new">
  <div className="group relative h-full min-h-40 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-slate-300">
    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#005B9A] to-[#003d6b] rounded-t-2xl" />
    <div className="mb-4 text-lg">🆕</div>
    <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-[#005B9A] transition-colors">New Section</h3>
    <p className="text-sm text-slate-600">Description</p>
    <div className="absolute bottom-4 right-4 text-slate-400 group-hover:text-[#005B9A] transition-colors">→</div>
  </div>
</Link>
```

### Quick Action Button
```tsx
<Link href="/path">
  <button className="px-4 py-2 text-sm font-medium text-[#005B9A] bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-200">
    Action
  </button>
</Link>
```

### Info Grid Item
```tsx
<div>
  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Label</p>
  <p className="text-sm font-semibold text-slate-900 mt-1">Value</p>
</div>
```

---

## 📊 Component Hierarchy

```
AdminLayout
├── Header (sticky)
│   ├── Breadcrumb
│   └── Admin Badge
│
├── Page Title & Subtitle
│
├── AdminClient (Welcome Section)
│   ├── Brand Badge
│   ├── Welcome Heading
│   ├── Admin Info Card
│   │   ├── Role/Email
│   │   ├── Action Buttons
│   │   └── Info Grid
│   └── Pro Tip Section
│
└── Navigation Grid (Main Page)
    ├── Card 1 (Bookings)
    ├── Card 2 (Users)
    ├── Card 3 (Vehicles)
    ├── Card 4 (AI Agent)
    ├── Card 5 (Content)
    └── Card 6 (Documentation)
```

---

## 🔧 Customization Examples

### Add a 7th Navigation Card
1. Copy navigation card component
2. Change href to new route
3. Change icon emoji
4. Update title and description
5. Update grid to `lg:grid-cols-4` if needed

### Change Brand Colors
1. Find all `#005B9A` and replace with new primary
2. Find all `#003d6b` and replace with new dark
3. Update focus ring colors if needed
4. Test contrast ratios

### Update i18n Keys
1. Edit `/data/content/admin.ts`
2. Add/update keys with English and Thai
3. Use `pick(lang, adminText.keyName)` in components
4. Export type updates if needed

---

## 📚 Reference Links

**Related Files:**
- Full implementation: `/ADMIN_UX_IMPLEMENTATION.md`
- Quick reference: `/ADMIN_QUICK_REFERENCE.md`
- Before/after: `/ADMIN_BEFORE_AFTER.md`

**Design Assets:**
- Colors: Samui Transfers CI (#005B9A primary)
- Typography: System fonts (inherited from Tailwind)
- Icons: Unicode emoji (scalable, no dependencies)

---

**Version:** 1.0  
**Last Updated:** November 25, 2025  
**Status:** ✅ Complete and Ready for Use

