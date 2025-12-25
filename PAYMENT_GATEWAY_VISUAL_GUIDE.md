# Payment Gateway Management System - Visual Walkthrough

## 🎬 Feature Overview

### What Admin Sees

```
┌─────────────────────────────────────────────────────────────────┐
│                    /admin/payment-gateways                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Payment Gateway Settings                                       │
│  Control which payment methods are available to customers       │
│                                                                 │
│  ℹ️ About Payment Gateways                                      │
│  You can enable or disable payment methods, hide them from     │
│  customers, and reorder how they appear on the payment page.   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 💳 Credit Card (Stripe)                                  │  │
│  │                                                          │  │
│  │ Pay with card. Quick & Secure payment processing       │  │
│  │                                                          │  │
│  │ Processing Time: Instant     Fees: 2.9% + ฿5          │  │
│  │                                                          │  │
│  │ [👁️] [✓ Active] [⬆️] [⬇️]  Stripe  [Visible] [Active]  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🅿️ PayPal                                                │  │
│  │                                                          │  │
│  │ Quick and secure payment with PayPal wallet             │  │
│  │                                                          │  │
│  │ Processing Time: Instant     Fees: 3.5% + ฿5          │  │
│  │                                                          │  │
│  │ [👁️] [✓ Active] [⬆️] [⬇️]  paypal  [Visible] [Active]   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🏦 Bank Transfer                                         │  │
│  │                                                          │  │
│  │ Direct bank transfer (1-3 business days)               │  │
│  │                                                          │  │
│  │ Processing Time: 1-3 days    Fees: No fees             │  │
│  │                                                          │  │
│  │ [👁️] [✓ Active] [⬆️] [⬇️]  bank_transfer [Visible]    │  │
│  │                                                          │  │
│  │                                          [Hidden] [Disabled]  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Active Methods: 3 of 3 available to customers                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### What Customers See (Payment Page)

```
CASE 1: All Methods Public & Enabled (Default)

┌─────────────────────────────────────────┐
│      Complete Your Payment              │
├─────────────────────────────────────────┤
│                                         │
│  Booking ID: BK-2025-001234            │
│  Total: ฿500.00                        │
│                                         │
│  Select Payment Method:                 │
│  ┌─────────┬─────────┬─────────┐       │
│  │  💳     │   🅿️    │   🏦    │       │
│  │ Credit  │ PayPal  │ Bank    │       │
│  │ Card    │         │Transfer │       │
│  └─────────┴─────────┴─────────┘       │
│       (Stripe)  (PayPal) (SCB)          │
│                                         │
│  [Selected: Stripe - Payment Form]     │
│                                         │
└─────────────────────────────────────────┘


CASE 2: Admin Hides Bank Transfer

┌─────────────────────────────────────────┐
│      Complete Your Payment              │
├─────────────────────────────────────────┤
│                                         │
│  Select Payment Method:                 │
│  ┌─────────┬─────────┐                 │
│  │  💳     │   🅿️    │                 │
│  │ Credit  │ PayPal  │                 │
│  │ Card    │         │                 │
│  └─────────┴─────────┘                 │
│   (Stripe)  (PayPal)                    │
│                                         │
│  Bank Transfer NOT shown (hidden)       │
│                                         │
└─────────────────────────────────────────┘


CASE 3: Admin Disables PayPal

┌─────────────────────────────────────────┐
│      Complete Your Payment              │
├─────────────────────────────────────────┤
│                                         │
│  Select Payment Method:                 │
│  ┌─────────┬─────────┐                 │
│  │  💳     │   🏦    │                 │
│  │ Credit  │ Bank    │                 │
│  │ Card    │Transfer │                 │
│  └─────────┴─────────┘                 │
│   (Stripe)  (SCB)                       │
│                                         │
│  PayPal NOT shown (disabled)            │
│                                         │
└─────────────────────────────────────────┘
```

## 🎮 Admin Interactions

### Interaction 1: Toggle Public (Eye Icon)

```
BEFORE (Public - Eye Visible)
[👁️] ← Click this button
Status: Shown to customers

AFTER (Private - Eye Closed)
[🙈] ← Changed
Status: Hidden from customers

RESULT: Payment method disappears from customer payment page
```

### Interaction 2: Toggle Active (Status Button)

```
BEFORE (Active)
[✓ Active] ← Click this button
Color: Green

AFTER (Disabled)
[✗ Disabled] ← Changed
Color: Red

RESULT: Customers cannot select this method
```

### Interaction 3: Reorder (Up/Down Arrows)

```
BEFORE:
┌─────┐
│ 💳  │  1st
├─────┤
│ 🅿️  │  2nd  ← Click ⬇️ (move down)
├─────┤
│ 🏦  │  3rd
└─────┘

AFTER:
┌─────┐
│ 🅿️  │  1st
├─────┤
│ 💳  │  2nd
├─────┤
│ 🏦  │  3rd
└─────┘

RESULT: Customers see PayPal first on payment page
```

## 📊 Status Matrix

### Visual Status Indicators

```
┌─────────┬──────────────┬─────────────┐
│ State   │ Visibility   │ Selectable  │
├─────────┼──────────────┼─────────────┤
│ 👁️ ✓   │ ✅ Visible   │ ✅ Yes      │
│ 👁️ ✗   │ ❌ Hidden    │ ❌ No       │
│ 🙈 ✓   │ ❌ Hidden    │ ❌ No       │
│ 🙈 ✗   │ ❌ Hidden    │ ❌ No       │
└─────────┴──────────────┴─────────────┘

Required for Customers to See:
✅ Eye Icon = 👁️ (Public)
✅ Status = ✓ Active (green)

Both conditions MUST be true
```

## 🔄 Update Flow (Real-Time)

```
Admin Makes Change:
│
├─► API Request to /api/admin/payment-gateways
│   {
│     id: "stripe_id",
│     isPublic: false  // Toggle from public to private
│   }
│
├─► Database Updated
│   UPDATE PaymentGateway SET isPublic = false
│
├─► Component State Updates
│   gateways = [...updated data...]
│
└─► UI Re-renders
    Admin sees immediate change

Customer Sees Change (after cache expires or refresh):
│
├─► Refresh payment page
│
├─► Browser fetches /api/payment-gateways
│   Response only includes visible methods
│
└─► PaymentGateway component renders
    New set of options displayed
```

## 🎯 Common Workflows

### Workflow 1: Hide Bank Transfer (Maintenance)

```
Step 1: Click Bank Transfer eye icon (👁️)
        └─► Becomes 🙈

Step 2: System calls API update
        └─► isPublic: false

Step 3: Customers check payment page
        └─► Bank Transfer no longer visible
        └─► Only Stripe + PayPal shown

Step 4: Issue resolved, re-enable
        └─► Click 🙈 again
        └─► Becomes 👁️
        └─► Bank Transfer visible again
```

### Workflow 2: Reorder for New Campaign

```
OLD ORDER:
1. Stripe (Default)
2. PayPal
3. Bank Transfer

GOAL: Promote PayPal (new partnership)

Step 1: Find PayPal card, click ⬆️
        └─► Swaps with Stripe
        └─► PayPal now 1st

Step 2: Click ⬆️ again
        └─► Already at top
        └─► No change

NEW ORDER:
1. PayPal ← First (Most prominent)
2. Stripe
3. Bank Transfer

RESULT: Customers see PayPal first, more likely to select
```

### Workflow 3: Disable & Later Re-enable

```
Step 1: Stripe payment processor down
        └─► Click "✓ Active" button
        └─► Changes to "✗ Disabled"

Step 2: Customers try payment page
        └─► See: PayPal + Bank Transfer only
        └─► Stripe completely unavailable

Step 3: Issue fixed
        └─► Click "✗ Disabled" button
        └─► Changes to "✓ Active"

Step 4: Customers refresh page
        └─► Stripe available again
```

## 📱 Mobile Responsiveness

### Desktop View (3 columns)
```
┌──────────┬──────────┬──────────┐
│ 💳 Stripe│ 🅿️ PayPal│ 🏦 Bank  │
└──────────┴──────────┴──────────┘
```

### Tablet View (2 columns)
```
┌──────────┬──────────┐
│ 💳 Stripe│ 🅿️ PayPal│
├──────────┴──────────┤
│     🏦 Bank         │
└─────────────────────┘
```

### Mobile View (1 column)
```
┌──────────┐
│ 💳 Stripe│
├──────────┤
│🅿️ PayPal │
├──────────┤
│🏦 Bank   │
└──────────┘
```

## ⚡ Performance

### Admin Dashboard
- Load time: <500ms (cached from DB)
- Update time: <200ms per change
- No page reload required

### Customer Payment Page
- Load time: <300ms (with 5-min cache)
- Shows cached data
- Cache expires: 5 minutes
- Manual refresh shows latest

## 🎓 Key Features Summary

| Feature | What It Does | Who Uses It |
|---------|-------------|-------------|
| **Eye Icon** | Show/hide from customers | Admins (maintenance) |
| **Status Button** | Enable/disable method | Admins (availability) |
| **Arrows** | Reorder display | Admins (optimization) |
| **Info Card** | Display details | Admin reference |
| **Summary** | Show active count | Admin overview |

---

**Visual Version:** 1.0  
**Created:** December 7, 2025  
**For:** All Users & Developers
