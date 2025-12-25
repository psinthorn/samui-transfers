# Admin Booking Status Update - Visual Guide

**Visual representation of the admin booking update system**

---

## 🎯 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN INTERFACE                          │
│                                                             │
│  /admin/bookings → List of all bookings                   │
│         ↓                                                   │
│  Click booking → /admin/bookings/[id]                     │
│         ↓                                                   │
│  Click "Update Status" → BookingStatusUpdateDialog opens  │
│         ↓                                                   │
│  Select status & payment method → updateBookingStatus()   │
│         ↓                                                   │
│  SUCCESS → Update database → Send emails                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Booking Lifecycle

```
┌──────────┐
│ PENDING  │  ← Initial state after booking created
└────┬─────┘
     │
     │ Admin updates: PENDING → CONFIRMED
     │ Selects: Bank Transfer / Pay on Tour / etc
     ↓
┌──────────────────────────────────────────────┐
│ CONFIRMED                                    │
│ - Payment Status: COMPLETED ✓                │
│ - Payment Method: [Selected by Admin]        │
│ - Payment Date: [Current Time]               │
└────┬─────────────────────────────────────────┘
     │
     │ Option A: Tour happens
     │ Admin updates: CONFIRMED → COMPLETED
     ↓
┌──────────┐
│COMPLETED │  ← Tour finished
└──────────┘

OR

┌─────────────────────────────┐
│ CANCELLED                   │
│ (if within 2-hour window)   │
│ - Refund Status: REFUNDED   │
│ - Refund Amount: [Amount]   │
└─────────────────────────────┘
```

---

## 🔄 Admin Update Dialog Flow

```
User clicks "Update Status" button
     ↓
┌──────────────────────────────────────────┐
│   Booking Status Update Dialog Opens     │
├──────────────────────────────────────────┤
│ Current Status:     PENDING              │
│ New Status:         [PENDING/CONFIRMED/  │
│                     COMPLETED/CANCELLED] │
│                                          │
│ Payment Method:*    [Optional]           │
│ ├─ Credit Card                           │
│ ├─ PayPal                               │
│ ├─ Bank Transfer                        │
│ ├─ Pay on Tour                          │
│ └─ Other                                │
│                                          │
│ Payment Amount:     ฿2,500.00            │
│                                          │
│ [Cancel Button] [Update Button]          │
│ (*Required if PENDING→CONFIRMED)        │
└──────────────────────────────────────────┘
     ↓
User selects status & payment method
     ↓
User clicks "Update"
     ↓
Backend processes update
     ↓
┌──────────────────────────────┐
│ ✓ Success Message Shown      │
│ "Booking updated!"           │
│                              │
│ Auto-reload in 1.5 seconds   │
└──────────────────────────────┘
```

---

## 📧 Email Notification Flow

```
Admin clicks "Update"
     ↓
┌─────────────────────────────────────┐
│ updateBookingStatus() executes      │
│ ├─ Updates database                │
│ ├─ Creates email content           │
│ └─ Sends emails                    │
└──────────┬──────────────────────────┘
           ↓
    ┌──────────────────┐
    │ Email 1: Admin   │
    ├──────────────────┤
    │ To: Admin email  │
    │ Subject: Booking │
    │          updated │
    │                  │
    │ Contains:        │
    │ - Status change  │
    │ - Booking details│
    │ - Customer info  │
    │ - Admin link     │
    └──────────────────┘

    ┌──────────────────┐
    │ Email 2: Customer│
    ├──────────────────┤
    │ To: Customer     │
    │     email        │
    │ Subject: Booking │
    │          confirmed│
    │                  │
    │ Contains:        │
    │ - Status change  │
    │ - Booking details│
    │ - Payment method │
    │ - Tracking link  │
    └──────────────────┘
```

---

## 💾 Database Update

```
Before Update:
┌──────────────────────────────────────┐
│ Booking Record                       │
│                                      │
│ id: abc123                          │
│ status: PENDING                     │
│ paymentStatus: PENDING              │
│ paymentMethod: null                 │
│ paymentAmount: 2500.00              │
│ paymentDate: null                   │
└──────────────────────────────────────┘

     ↓ [Admin updates: CONFIRMED, Bank Transfer]

After Update:
┌──────────────────────────────────────┐
│ Booking Record                       │
│                                      │
│ id: abc123                          │
│ status: CONFIRMED        ← Updated  │
│ paymentStatus: COMPLETED ← Updated  │
│ paymentMethod:           ← Updated  │
│   "bank_transfer"                   │
│ paymentAmount: 2500.00              │
│ paymentDate: 2025-12-07 ← Updated  │
│            11:30:00                 │
└──────────────────────────────────────┘
```

---

## 🎨 UI Components Map

```
Admin Bookings Page (/admin/bookings)
     │
     └─ BookingsTable
        ├─ Search Bar
        ├─ Filters
        │  ├─ Date Range
        │  ├─ Status
        │  └─ Search Text
        └─ Booking Rows
           └─ [Click] → Booking Details Page

Admin Booking Details (/admin/bookings/[id])
     │
     ├─ Booking Info Card
     │  ├─ User Email
     │  ├─ Current Status
     │  ├─ Route
     │  ├─ Vehicle
     │  ├─ Payment Status ← Shows colored badge
     │  ├─ Payment Method ← Shows formatted name
     │  └─ "Update Status" Button ← Opens dialog
     │
     └─ [Click "Update Status"] 
        → BookingStatusUpdateDialog opens
```

---

## 🔐 Permission & Validation Flow

```
User navigates to /admin/bookings/[id]
     ↓
┌─────────────────────────────────┐
│ Check Authorization             │
├─────────────────────────────────┤
│ Is user logged in?              │
│  NO → Redirect to login         │
│  YES → Continue                 │
│        ↓                         │
│ Is user an ADMIN?               │
│  NO → Show "Access Denied"      │
│  YES → Load booking details ✓   │
└─────────────────────────────────┘

[Dialog Opens]
     ↓
┌─────────────────────────────────┐
│ Validate Update Request         │
├─────────────────────────────────┤
│ Is user still ADMIN?            │
│  NO → Error                     │
│  YES → Continue                 │
│        ↓                         │
│ Is booking ID valid?            │
│  NO → Error                     │
│  YES → Continue                 │
│        ↓                         │
│ Is new status valid?            │
│  NO → Error                     │
│  YES → Continue                 │
│        ↓                         │
│ If PENDING→CONFIRMED:           │
│ Is payment method selected?     │
│  NO → Error                     │
│  YES → Update database ✓        │
└─────────────────────────────────┘
```

---

## 🌐 Data Flow Diagram

```
Admin Input (Dialog)
     ↓
┌─────────────────────────┐
│ FormData submitted      │
│ ├─ bookingId            │
│ ├─ status               │
│ ├─ paymentMethod        │
│ └─ paymentAmount        │
└────────┬────────────────┘
         ↓
┌─────────────────────────────────┐
│ updateBookingStatus() Action    │
├─────────────────────────────────┤
│ 1. Verify admin access          │
│ 2. Validate inputs              │
│ 3. Build update object          │
│    └─ status                    │
│    └─ paymentMethod (if set)    │
│    └─ paymentStatus (auto-set)  │
│    └─ paymentDate (auto-set)    │
│    └─ paymentAmount             │
│ 4. Update database              │
│ 5. Generate emails              │
│ 6. Send notifications           │
│ 7. Return success               │
└────────┬────────────────────────┘
         ↓
┌─────────────────────────┐
│ Booking Updated in DB   │
└────────┬────────────────┘
         ↓
┌────────────────┐  ┌────────────────┐
│ Send to Admin  │  │ Send to        │
│ (Notification) │  │ Customer       │
│                │  │ (Confirmation) │
└────────────────┘  └────────────────┘
         ↓                   ↓
┌────────────────────────────────────┐
│ Admin sees refresh                 │
│ Customer gets email                │
│ Both see updated booking status    │
└────────────────────────────────────┘
```

---

## 📱 Mobile View

```
Landscape (Mobile Width)
┌──────────────────────┐
│ Booking Details      │
│ (Narrower Layout)    │
├──────────────────────┤
│ User: email@test.com │
│ Status: PENDING      │
│ [Update Status]      │
├──────────────────────┤
│ Route: A → B         │
│ Vehicle: Car         │
├──────────────────────┤
│ Payment: PENDING     │
│ Method: (none)       │
│ Amount: ฿2,500       │
└──────────────────────┘

Dialog on Mobile
┌───────────────────┐
│ Update Status     │
├───────────────────┤
│ Current: PENDING  │
│ New: [dropdown]   │
│ Method: [dropdown]│
│ Amount: ฿2,500    │
│                   │
│ [Cancel][Update]  │
└───────────────────┘
(Scrollable if needed)
```

---

## 🔄 Status Transition Matrix

```
                FROM PENDING  FROM CONFIRMED  FROM COMPLETED  FROM CANCELLED
TO PENDING                    ✓                                      
TO CONFIRMED    ✓                                                   
TO COMPLETED                  ✓                                      
TO CANCELLED    ✓             ✓               ✗               ✗

✓ = Allowed
✗ = Not Allowed

Payment Method Requirements:
┌──────────────────────────────────┐
│ PENDING → CONFIRMED              │
│ Requires: Payment Method ★       │
│ (Bank Transfer, PayPal, etc)     │
└──────────────────────────────────┘

All other transitions: Payment method optional
```

---

## 📊 Information Display Hierarchy

```
Customer View (Confirmation Page)
     ↓
┌─────────────────────────────┐
│ Booking Confirmed! ✓        │
├─────────────────────────────┤
│ Reference: BK-2025-001234   │
├─────────────────────────────┤
│ Booking Details             │
│ ├─ Pickup: Location A       │
│ ├─ Dropoff: Location B      │
│ ├─ Vehicle: Car Type        │
│ └─ Passengers: 4            │
├─────────────────────────────┤
│ Payment Information         │
│ ├─ Amount: ฿2,500          │
│ ├─ Method: Bank Transfer    │
│ └─ Date: 7 Dec 2025         │
├─────────────────────────────┤
│ Status: CONFIRMED ✓         │
└─────────────────────────────┘

↓ Customer sees formatted payment method ↓
"Bank Transfer" instead of "bank_transfer"
```

---

## 🎯 Key Interactions

### 1. Payment Method Selection
```
Dropdown opens
     ↓
┌──────────────────────────────┐
│ ✓ Credit Card (Stripe)       │ ← Customer paid online
│ ✓ PayPal                     │ ← Via PayPal
│ ✓ Bank Transfer              │ ← Direct deposit
│ ✓ Pay on Tour                │ ← Cash at pickup
│ ✓ Other                      │ ← Something else
└──────────────────────────────┘
     ↓
Selection made
     ↓
Dialog shows selected method
     ↓
[Update] button enables
```

### 2. Status Update Chain
```
Select Status
     ↓
If PENDING→CONFIRMED:
  └─ Force payment method selection
     ↓
All validation passed
     ↓
[Update] button enables
     ↓
Click Update
     ↓
Success message
     ↓
Auto-reload (1.5 sec)
     ↓
Page shows new status
```

---

## ✅ Success Indicators

```
Visual Confirmation:
┌──────────────────────────────┐
│ ✓ Booking updated            │
│                              │
│ Auto-reloading in 1.5 sec... │
│ (or reload now)              │
└──────────────────────────────┘

After Reload:
Status: CONFIRMED ← Updated!
Payment Status: ✅ COMPLETED (green)
Payment Method: Bank Transfer
Payment Date: 7 Dec 2025 11:30

Email Sent To:
✓ Customer: confirmation
✓ Admin: notification
```

---

**Visual Guide Created: December 7, 2025**

This guide helps understand how the system flows from admin action to database update to customer notification.
