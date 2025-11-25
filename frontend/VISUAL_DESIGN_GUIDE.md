# Visual Design Guide - Mobile-First Refactor

**Design System:** Samui Transfers CI  
**Updated:** November 25, 2025

---

## 🎨 Color System

### Primary: Ocean Blue (#005B9A)
- **Usage:** Main CTAs, focus states, links, headers
- **Hover:** #003d6b (darker)
- **Light:** #005B9A/10 (ring on focus)

```
Sign In Button:     bg-[#005B9A] hover:bg-[#003d6b]
Focus Ring:         focus:ring-[#005B9A]/10
Link Color:         text-[#005B9A]
```

### Secondary: Sunset Red (#D94141)
- **Usage:** Error alerts, destructive actions, warnings
- **Usage:** Error message left border
- **Contrast:** High visibility for error states

```
Error Border:       border-[#D94141]
Error Background:   bg-red-50
Error Text:         text-red-700
```

### Tertiary: Palm Green (#3AA76D)
- **Usage:** Sign-up page, success states, validation
- **Badge:** Brand identity on signup
- **Checkmarks:** Password requirements met

```
Sign Up Button:     bg-[#3AA76D] hover:bg-[#2d8555]
Success Icon:       text-[#3AA76D]
```

### Neutral Palette
```
Background:         from-slate-50 to-slate-100 (gradient)
Card:              bg-white
Border:            border-slate-200
Text:              text-slate-900
Muted:             text-slate-600
```

---

## 📐 Layout System

### Container Structure
```
Full Screen (100vh)
├─ Gradient Background (from-slate-50 to-slate-100)
└─ Flex Center (items-center justify-center)
   └─ Card Container
      ├─ max-w-sm (max 448px)
      ├─ w-full (responsive)
      └─ px-4 (mobile padding)
```

### Form Card Dimensions
```
Mobile (320px):
  Container:  full width - 32px padding
  Card:       max-w-sm (448px) centered
  Padding:    p-6 (24px internal)
  
Tablet (768px):
  Container:  centered
  Card:       ~500px width
  Padding:    p-7 (28px internal)
  
Desktop (1025px+):
  Container:  centered
  Card:       ~480px width
  Padding:    p-7 (28px internal)
```

### Spacing Scale
```
xs:  4px  (very tight)
sm:  8px  (tight)
md:  16px (normal)
lg:  24px (relaxed)
xl:  32px (spacious)
2xl: 48px (very spacious)

Applied:
  Container padding:    px-4 (16px sides)
  Form gaps:           space-y-5 (20px)
  Card padding:        p-6 md:p-7 (24-28px)
  Margin below header: mb-8 (32px)
  Input height:        min-h-12 (48px)
```

---

## 🎯 Component Styles

### Input Fields
```tsx
className="
  min-h-12 md:min-h-11        // 48px height (mobile)
  rounded-lg                   // 8px radius
  border border-slate-200      // Light border
  bg-white                     // White background
  px-4 py-3                   // Padding
  text-sm                      // Font size 14px
  text-slate-900               // Dark text
  placeholder-slate-500        // Light placeholder
  transition-all               // Smooth transitions
  focus:border-[#005B9A]      // Brand color on focus
  focus:ring-2                 // Ring indicator
  focus:ring-[#005B9A]/10      // Subtle ring
  focus:outline-none           // No default outline
  disabled:bg-slate-50         // Light bg when disabled
  disabled:text-slate-500      // Muted text when disabled
"
```

### Buttons
```tsx
// Primary Button (Sign In - Ocean Blue)
className="
  w-full
  min-h-12
  rounded-lg
  bg-[#005B9A]
  hover:bg-[#003d6b]
  text-white
  font-medium
  text-base
  transition-all
  active:scale-95
  disabled:opacity-70
"

// Secondary Button (Sign Up - White Border)
className="
  w-full
  min-h-11
  rounded-lg
  border-2
  border-slate-200
  bg-white
  text-slate-900
  font-medium
  hover:bg-slate-50
  hover:border-slate-300
  transition-all
  active:scale-95
  text-sm
"

// Sign Up Button (Palm Green)
className="
  w-full
  min-h-12
  rounded-lg
  bg-[#3AA76D]
  hover:bg-[#2d8555]
  text-white
  font-medium
  text-base
  transition-all
  active:scale-95
  disabled:opacity-70
"
```

### Error Messages
```tsx
className="
  p-4                          // Comfortable padding
  rounded-lg                   // Rounded corners
  bg-red-50                    // Light red background
  border-l-4                   // Left accent border
  border-[#D94141]             // Brand secondary color
  text-sm                      // Small text
  text-red-700                 // Dark red text
  space-y-2                    // Gap between items
"
```

### Alert Messages
```tsx
// Warnings (Amber)
className="p-4 rounded-lg bg-amber-50 border-l-4 border-amber-400 text-sm text-amber-700"

// Info (Blue)
className="p-4 rounded-lg bg-blue-50 border-l-4 border-blue-400 text-sm text-blue-700"
```

---

## 🏷️ Typography

### Headlines
```
Title (H1):
  Desktop: text-3xl (30px) font-bold
  Mobile:  text-2xl (24px) font-bold
  Weight:  700 (bold)
  Color:   text-slate-900

Subtitle:
  Size:    text-sm (14px)
  Color:   text-slate-600
  Weight:  400 (normal)
```

### Form Labels
```
Labels:
  Size:    text-sm (14px)
  Weight:  500 (medium)
  Color:   text-slate-700
  Case:    Sentence case
```

### Body Text
```
Error Messages:
  Size:    text-sm (14px)
  Weight:  400 (normal)
  Color:   Varies (red, blue, etc.)

Helper Text:
  Size:    text-xs (12px)
  Weight:  400 (normal)
  Color:   text-slate-500
```

### Links
```
Link Default:
  Color:       text-[#005B9A]
  Decoration:  none
  Hover:       underline + darker shade
  
Link on Dark:
  Color:       text-white/90
  Hover:       text-white
```

---

## 🎭 States & Interactions

### Input States
```
Default:      border-slate-200, bg-white, text-slate-900
Focus:        border-[#005B9A], ring-2, ring-[#005B9A]/10
Error:        border-red-500, text-red-700
Disabled:     bg-slate-50, text-slate-500, cursor-not-allowed
Filled:       border-slate-200, bg-white (same as default)
```

### Button States
```
Default:      bg-[#005B9A], text-white, shadow-sm
Hover:        bg-[#003d6b], cursor-pointer
Active:       scale-95 (pressed animation)
Disabled:     opacity-70, cursor-not-allowed
Loading:      Show spinner, disable interaction
```

### Link States
```
Default:      text-[#005B9A], no underline
Hover:        text-[#005B9A], underline
Focus:        ring-2 ring-[#005B9A]/10
Active:       text-[#003d6b]
```

---

## 🎬 Animations

### Button Press Animation
```css
/* Active state scaling */
active:scale-95  /* Shrinks 5% on press */
transition-all   /* Smooth animation */
```

### Loading Spinner
```tsx
<svg className="h-4 w-4 animate-spin">
  {/* SVG paths for spinner */}
</svg>
/* Rotates continuously while loading */
```

### Focus Ring Animation
```css
focus:ring-2              /* 2px ring */
focus:ring-[#005B9A]/10   /* Brand color with 10% opacity */
transition-all            /* Smooth appearance */
```

### Hover Transitions
```css
transition-all            /* All properties */
duration-200              /* 200ms (default) */
ease-out                  /* Natural easing */
```

---

## 📱 Responsive Typography

### Desktop (1025px+)
```
Title:        text-3xl (30px)
Subtitle:     text-sm (14px)
Labels:       text-sm (14px)
Body:         text-sm (14px)
Helper:       text-xs (12px)
```

### Tablet (641px - 1024px)
```
Title:        text-3xl (30px)
Subtitle:     text-sm (14px)
Labels:       text-sm (14px)
Body:         text-sm (14px)
Helper:       text-xs (12px)
```

### Mobile (320px - 640px)
```
Title:        text-2xl (24px)
Subtitle:     text-sm (14px)
Labels:       text-sm (14px)
Body:         text-sm (14px)
Helper:       text-xs (12px)
```

---

## 🔲 Shadow & Elevation

### Shadow Levels
```
No Shadow:          shadow-none (cards on colored bg)
Subtle:             shadow-sm (light elevation)
Medium:             shadow-md (normal elevation) ← Used
Large:              shadow-lg (high elevation)
```

### Card Elevation
```
Main Card:
  shadow-lg
  border border-slate-200
  rounded-2xl
  
Provides depth without being overwhelming.
```

---

## ⌬ Icon System

### SVG Icons (Inline)
```
Size:         h-4 w-4 or h-5 w-5
Fill:         currentColor (uses text color)
Stroke:       Varies by icon
Animation:    animate-spin (for loading)
```

### Icon Examples
```
Loading Spinner:    Animated circle
Checkmark:          Green (#3AA76D)
Circle Empty:       Slate-400
```

---

## ✨ Polish Details

### Borders
```
Form Cards:       border-slate-200 (light gray)
Error/Alert:      border-l-4 with brand color
Input Focus:      Blue ring indicator
```

### Gradients
```
Background:       from-slate-50 to-slate-100 (subtle)
Brand Badge:      from-[#005B9A] to-[#003d6b] (gradient depth)
Brand Badge (2):  from-[#3AA76D] to-[#2d8555]
```

### Rounded Corners
```
Inputs:           rounded-lg (8px)
Buttons:          rounded-lg (8px)
Cards:            rounded-2xl (16px)
Badges:           rounded-lg (8px)
```

---

## 🎯 Touch-Friendly Sizing

### Minimum Touch Target
```
Standard:         44px (accessibility minimum)
Recommended:      48px (WCAG AAA standard) ← Used
Applied to:       Inputs, buttons, links
```

### Button Heights
```
Large:            min-h-12 (48px) - Primary CTA
Medium:           min-h-11 (44px) - Secondary
Small:            h-9 (36px) - Small buttons
Icon:             h-10 w-10 (40px) - Icon buttons
```

---

## 🌐 Browser Support

### Tested On
- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- Mobile Safari iOS 14+
- Chrome Android 90+

### CSS Features Used
- Flexbox
- CSS Grid (simple)
- CSS Custom Properties (not in use currently)
- Tailwind CSS (primary)
- CSS Transitions
- CSS Gradients

### JavaScript Compatibility
- ES6 (modern)
- React Hooks
- NextAuth hooks
- No older IE support

---

## 🔍 Accessibility (WCAG 2.1 AA)

### Color Contrast
```
Text on Background:     7:1 ratio (AAA)
Link on White:          5.5:1 ratio (AA)
Button Text on Color:   7:1 ratio (AAA)
Error Text on Red:      5:1 ratio (AA)
```

### Focus States
```
Visible focus indicators on:
  - Input fields (2px ring)
  - Buttons (visible press effect)
  - Links (underline on hover)
  
Keyboard navigation works with Tab key
```

### Touch Targets
```
Minimum height:  48px (all inputs/buttons)
Minimum width:   48px (all buttons)
Spacing:         8px between touch targets
```

### Form Accessibility
```
Labels:           Associated with inputs via htmlFor
ARIA:             role="alert" on errors
Descriptions:     aria-describedby for error messages
Status:           aria-busy during loading
```

---

## 📊 Design Tokens Summary

```
Colors:
  primary:      #005B9A
  secondary:    #D94141
  tertiary:     #3AA76D
  bg:           slate-50 to slate-100
  
Typography:
  font-family:  System default (inherits)
  sizes:        12px, 14px, 16px, 24px, 30px
  weights:      400, 500, 600, 700
  
Spacing:
  unit:         4px
  scale:        4, 8, 12, 16, 20, 24, 28, 32px
  
Sizing:
  min-touch:    48px
  card-max:     448px (max-w-sm)
  
Shadows:
  medium:       shadow-md
  large:        shadow-lg
  
Radius:
  buttons:      8px (rounded-lg)
  cards:        16px (rounded-2xl)
```

---

## 🎓 Design Philosophy

### Mobile First
- Start with mobile constraints
- Design for smallest screen first
- Scale up to larger screens
- Results in better responsive design

### Minimal & Clean
- Remove unnecessary elements
- Focus on content
- Use whitespace effectively
- Clear visual hierarchy

### Brand Consistency
- Use CI colors consistently
- Maintain visual language
- Professional appearance
- Build brand recognition

### Accessible by Default
- 48px touch targets
- Visible focus indicators
- Sufficient color contrast
- Semantic HTML structure

### Modern & Professional
- Contemporary design patterns
- Smooth animations (not overwhelming)
- Clear affordances
- Polished interactions

---

**Design Version:** 1.0  
**Last Updated:** November 25, 2025  
**Status:** 🎨 Complete & Implemented
