# 📌 Priority 1 Implementation Guide - Booking Features

**Timeline:** 2-3 Weeks  
**Complexity:** Medium  
**Team Size:** 1-2 developers  
**Status:** Ready to Start

---

## 🎯 Overview

This guide provides step-by-step instructions for implementing Priority 1 features:
1. Booking Confirmation Page
2. User Booking History
3. Booking Status Tracking
4. Booking Cancellation/Modification

---

## 📋 Feature 1: Booking Confirmation Page

### What It Does
After successful payment, users see a confirmation page with:
- Booking reference number
- Full booking details (location, vehicle, time, passengers)
- Payment confirmation
- Next steps instructions
- Download/print booking
- Return to dashboard button

### Implementation Steps

#### Step 1: Update Booking Model
```prisma
// prisma/schema.prisma
model Booking {
  // ... existing fields
  
  // Add these new fields
  status String @default("pending") // pending, confirmed, completed, cancelled
  referenceNumber String @unique @default(cuid())
  confirmedAt DateTime?
  cancellationReason String?
  cancellationDate DateTime?
  cancellationRequestedBy String? // user or admin
  modifiedAt DateTime @updatedAt
  notes String?
  
  // Add indexes
  @@index([status])
  @@index([userId])
  @@index([referenceNumber])
}
```

#### Step 2: Create Database Migration
```bash
cd frontend
npx prisma migrate dev --name add_booking_status_fields
```

#### Step 3: Create Confirmation Page Component
```typescript
// frontend/components/bookings/BookingConfirmationCard.tsx
// Shows booking details, reference number, payment status

// Key elements:
// - Reference number (large, copyable)
// - Booking details summary
// - Payment confirmation with amount
// - Vehicle and driver info (when assigned)
// - Pickup/dropoff details with map
// - Estimated duration
// - Contact information
// - Action buttons: Download, Print, Share, Dashboard
```

#### Step 4: Create Confirmation Page
```typescript
// frontend/app/booking/confirmation/page.tsx
// Display confirmation after payment redirect

// Features:
// - Gets booking ID from URL params
// - Fetches booking details from API
// - Shows confirmation card
// - Displays next steps
// - Mobile responsive
```

#### Step 5: Create Confirmation Email Template
```typescript
// frontend/lib/email/booking-confirmation-template.ts
// Professional email with booking details
// Include reference number, booking details, map preview
```

#### Step 6: Add API Route for Confirmation
```typescript
// frontend/app/api/bookings/[id]/confirm/route.ts
// POST endpoint to mark booking as confirmed
// Called after payment completes
// Sends confirmation email
```

### Database Query
```sql
-- Get booking with all details
SELECT b.*, p.*, u.*
FROM "Booking" b
LEFT JOIN "Payment" p ON b.id = p.bookingId
LEFT JOIN "User" u ON b.userId = u.id
WHERE b.referenceNumber = 'BOOKING_REF_123'
```

### Success Criteria
- [ ] User sees confirmation page after payment
- [ ] Booking reference number is unique and displayed
- [ ] All booking details are shown
- [ ] Payment amount is confirmed
- [ ] Confirmation email is sent
- [ ] User can print/download booking
- [ ] Mobile responsive design

### Estimated Time
- Database changes: 1 hour
- Components: 4 hours
- API routes: 2 hours
- Email template: 1 hour
- Testing: 2 hours
- **Total: 10 hours**

---

## 📋 Feature 2: User Booking History Page

### What It Does
Users can see all their bookings in one place with:
- List of all bookings (paginated)
- Status badge (pending, confirmed, completed, cancelled)
- Filters (date range, status)
- Sort options (newest, oldest, soonest)
- Quick actions (view, cancel, modify)
- Search by reference number

### Implementation Steps

#### Step 1: Create Booking History Hook
```typescript
// frontend/hooks/useBookingHistory.ts
export function useBookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    page: 1,
    limit: 10
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const fetchBookings = async () => {
    setLoading(true);
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`/api/user/bookings?${query}`);
    const data = await res.json();
    setBookings(data.bookings);
    setLoading(false);
  };

  return { bookings, filters, setFilters, loading };
}
```

#### Step 2: Create API Route
```typescript
// frontend/app/api/user/bookings/route.ts
// GET: Fetch user's bookings with filters and pagination

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const dateRange = searchParams.get('dateRange');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  // Build where clause based on filters
  const where: any = { userId: session.user.id };
  
  if (status && status !== 'all') {
    where.status = status;
  }

  if (dateRange && dateRange !== 'all') {
    const now = new Date();
    const startDate = new Date();
    
    if (dateRange === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (dateRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (dateRange === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    }
    
    where.pickupTime = { gte: startDate };
  }

  // Fetch bookings
  const bookings = await prisma.booking.findMany({
    where,
    include: {
      payment: true,
      vehicle: true
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { pickupTime: 'desc' }
  });

  const total = await prisma.booking.count({ where });

  return Response.json({
    bookings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}
```

#### Step 3: Create Booking List Component
```typescript
// frontend/components/bookings/BookingsList.tsx
// Displays list of bookings with filters and actions

// Features:
// - Bookings table/cards (responsive)
// - Status badge (color-coded)
// - Filter controls
// - Sort dropdown
// - Search input
// - Pagination
// - Quick action buttons
```

#### Step 4: Create Bookings Page
```typescript
// frontend/app/user/bookings/page.tsx
// Main user bookings page

// Layout:
// - Header with title
// - Filter controls
// - Bookings list
// - Empty state if no bookings
// - Pagination controls
```

#### Step 5: Add Booking List Item Component
```typescript
// frontend/components/bookings/BookingListItem.tsx
// Single booking row/card

// Shows:
// - Reference number
// - Pickup/dropoff summary
// - Date and time
// - Vehicle type
// - Status badge
// - Total amount paid
// - Action buttons
```

### Database Query
```sql
-- Get user bookings with filters
SELECT b.*, p.amount, p.status as paymentStatus, v.type as vehicleType
FROM "Booking" b
LEFT JOIN "Payment" p ON b.id = p.bookingId
LEFT JOIN "Vehicle" v ON b.vehicleId = v.id
WHERE b.userId = 'user_id'
  AND (b.status = $1 OR $1 = 'all')
  AND (b.pickupTime >= $2 OR $2 IS NULL)
ORDER BY b.pickupTime DESC
LIMIT $3 OFFSET $4
```

### Success Criteria
- [ ] User can see all their bookings
- [ ] Bookings are paginated (10 per page)
- [ ] Can filter by status (pending, confirmed, completed, cancelled)
- [ ] Can filter by date range (today, this week, this month, all)
- [ ] Can sort by date (newest/oldest/soonest)
- [ ] Can search by reference number
- [ ] Shows booking status with color coding
- [ ] Mobile responsive design
- [ ] Empty state when no bookings

### Estimated Time
- API route: 3 hours
- Hook: 2 hours
- Components: 5 hours
- Testing: 2 hours
- **Total: 12 hours**

---

## 📋 Feature 3: Booking Status Tracking

### What It Does
Users can see live booking status updates:
- Booking received
- Payment confirmed
- Awaiting assignment (if applicable)
- Driver assigned
- Driver en route
- Driver arrived (pickup)
- In transit
- Completed

### Implementation Steps

#### Step 1: Create Booking Status Hook
```typescript
// frontend/hooks/useBookingStatus.ts
export function useBookingStatus(bookingId: string) {
  const [status, setStatus] = useState<BookingStatus>('pending');
  const [timeline, setTimeline] = useState<StatusEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await fetch(`/api/bookings/${bookingId}/status`);
      const data = await res.json();
      setStatus(data.status);
      setTimeline(data.timeline);
      setLoading(false);
    };

    fetchStatus();

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [bookingId]);

  return { status, timeline, loading };
}
```

#### Step 2: Create API Route for Status
```typescript
// frontend/app/api/bookings/[id]/status/route.ts
// GET: Return booking status and timeline

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { payment: true }
  });

  if (!booking) return Response.json({ error: 'Not found' }, { status: 404 });

  // Build timeline based on booking state
  const timeline = [];
  timeline.push({
    status: 'booking_received',
    timestamp: booking.createdAt,
    title: 'Booking Received',
    description: `Your booking ${booking.referenceNumber} was received`
  });

  if (booking.payment) {
    timeline.push({
      status: 'payment_confirmed',
      timestamp: booking.payment.createdAt,
      title: 'Payment Confirmed',
      description: `$${booking.payment.amount} paid`
    });
  }

  if (booking.status === 'confirmed') {
    timeline.push({
      status: 'booking_confirmed',
      timestamp: booking.confirmedAt,
      title: 'Booking Confirmed',
      description: 'Your booking is confirmed'
    });
  }

  // Add more timeline events...

  return Response.json({
    status: booking.status,
    timeline,
    booking
  });
}
```

#### Step 3: Create Timeline Component
```typescript
// frontend/components/bookings/BookingTimeline.tsx
// Visual timeline of booking status

// Shows:
// - Vertical timeline
// - Status events with timestamps
// - Current status highlighted
// - Estimated time for next status (if applicable)
// - Icons for each status
```

#### Step 4: Create Status Badge Component
```typescript
// frontend/components/bookings/StatusBadge.tsx
// Color-coded status badge

// Status colors:
// pending: yellow
// confirmed: blue
// completed: green
// cancelled: red
```

### Database Query
```sql
-- Get booking with all status information
SELECT b.*, p.*, d.*, v.*
FROM "Booking" b
LEFT JOIN "Payment" p ON b.id = p.bookingId
LEFT JOIN "Driver" d ON b.driverId = d.id
LEFT JOIN "Vehicle" v ON b.vehicleId = v.id
WHERE b.id = 'booking_id'
```

### Success Criteria
- [ ] User can see booking status at any time
- [ ] Timeline shows status progression
- [ ] Each status event has timestamp
- [ ] Status updates in real-time (polling every 10s)
- [ ] Clear visual indicators for each status
- [ ] Estimated time for next status (if known)
- [ ] Mobile responsive design

### Estimated Time
- API route: 2 hours
- Hook: 2 hours
- Components: 3 hours
- Testing: 1 hour
- **Total: 8 hours**

---

## 📋 Feature 4: Booking Cancellation

### What It Does
Users can cancel their bookings if:
- Booking is still pending or confirmed
- Not within X hours of pickup (configurable, e.g., 2 hours)
- Admin approves

Cancellation includes:
- Cancellation reason capture
- Refund processing (if applicable)
- Cancellation confirmation email

### Implementation Steps

#### Step 1: Create Cancellation Hook
```typescript
// frontend/hooks/useCancelBooking.ts
export function useCancelBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelBooking = async (bookingId: string, reason: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to cancel booking');
      }

      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { cancelBooking, loading, error };
}
```

#### Step 2: Create Cancellation API Route
```typescript
// frontend/app/api/bookings/[id]/cancel/route.ts
// POST: Cancel a booking

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { reason } = await request.json();
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { user: true, payment: true }
  });

  if (!booking) return Response.json({ error: 'Not found' }, { status: 404 });
  if (booking.userId !== session.user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Check if cancellation is allowed
  const hoursUntilPickup = (booking.pickupTime.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntilPickup < 2) {
    return Response.json(
      { error: 'Bookings cannot be cancelled within 2 hours of pickup' },
      { status: 400 }
    );
  }

  if (!['pending', 'confirmed'].includes(booking.status)) {
    return Response.json(
      { error: `Cannot cancel ${booking.status} bookings` },
      { status: 400 }
    );
  }

  // Update booking status
  const updatedBooking = await prisma.booking.update({
    where: { id: params.id },
    data: {
      status: 'cancelled',
      cancellationReason: reason,
      cancellationDate: new Date(),
      cancellationRequestedBy: session.user.id
    }
  });

  // Process refund if payment was made
  if (booking.payment?.status === 'COMPLETED') {
    try {
      // Stripe refund
      const refund = await stripe.refunds.create({
        payment_intent: booking.payment.transactionId
      });

      // Update payment status
      await prisma.payment.update({
        where: { id: booking.payment.id },
        data: { status: 'REFUNDED' }
      });
    } catch (err) {
      console.error('Refund failed:', err);
      // Handle refund failure
    }
  }

  // Send cancellation email
  await sendCancellationEmail(booking.user.email, updatedBooking);

  // Notify admin
  await sendAdminNotification(`Booking ${booking.referenceNumber} was cancelled`);

  return Response.json({ success: true, booking: updatedBooking });
}
```

#### Step 3: Create Cancellation Dialog Component
```typescript
// frontend/components/bookings/CancellationDialog.tsx
// Dialog to confirm booking cancellation

// Features:
// - Show booking details
// - Reason dropdown with predefined options
// - Custom reason input
// - Warning about refund policy
// - Confirm/Cancel buttons
// - Loading state
```

#### Step 4: Add Cancellation Email Template
```typescript
// frontend/lib/email/booking-cancellation-template.ts
// Email confirming booking cancellation
// Include reference number, cancellation reason, refund info
```

### Database Update
```sql
UPDATE "Booking"
SET status = 'cancelled',
    cancellationReason = $1,
    cancellationDate = NOW(),
    cancellationRequestedBy = $2,
    updatedAt = NOW()
WHERE id = $3
```

### Success Criteria
- [ ] User can cancel pending/confirmed bookings
- [ ] Cannot cancel within 2 hours of pickup
- [ ] Cancellation reason is captured
- [ ] Refund is processed automatically
- [ ] Cancellation confirmation email sent
- [ ] Admin is notified
- [ ] Booking status changes to 'cancelled'
- [ ] Cannot re-cancel already cancelled booking

### Estimated Time
- API route: 3 hours
- Hook: 1 hour
- Components: 2 hours
- Email template: 1 hour
- Testing: 2 hours
- **Total: 9 hours**

---

## 🚀 Implementation Timeline

### Week 1: Foundation
- Day 1-2: Database schema update & migration
- Day 3-4: Booking confirmation page
- Day 5: Testing & refinement

### Week 2: User Features
- Day 1-2: Booking history page
- Day 3: Status tracking feature
- Day 4-5: Cancellation feature

### Week 3: Polish & Deploy
- Day 1-2: Testing & bug fixes
- Day 3: Performance optimization
- Day 4: Documentation update
- Day 5: Deployment & monitoring

---

## 📊 Effort Summary

| Feature | Hours | Complexity |
|---------|-------|-----------|
| Booking Confirmation | 10 | Medium |
| Booking History | 12 | Medium |
| Status Tracking | 8 | Easy |
| Cancellation | 9 | Medium |
| **Total** | **39 hours** | **2-3 weeks** |

---

## ✅ Testing Checklist

- [ ] Create booking and complete payment
- [ ] See confirmation page with reference number
- [ ] Receive confirmation email
- [ ] Open user bookings page
- [ ] See booking in list with correct status
- [ ] Filter bookings by status
- [ ] Filter bookings by date range
- [ ] Search by reference number
- [ ] View booking details and timeline
- [ ] See status updates in real-time
- [ ] Cancel booking successfully
- [ ] Receive cancellation email
- [ ] Receive refund to original payment method
- [ ] Admin receives cancellation notification
- [ ] Mobile responsive layout
- [ ] All error states handled

---

## 📞 Questions Before Starting

1. What's the cancellation window? (e.g., 2 hours before pickup)
2. What are valid cancellation reasons?
3. Should partial refunds be supported?
4. Should users be able to modify bookings?
5. Should we show driver info before pickup?
6. Do we need real-time location tracking?

---

## 🔗 Related Documentation

- [NEXT_FEATURES_ROADMAP.md](./NEXT_FEATURES_ROADMAP.md) - Full roadmap
- [PAYMENT_DEVELOPER_QUICK_REFERENCE.md](./PAYMENT_DEVELOPER_QUICK_REFERENCE.md) - Developer guide
- [PHASE_3_API_DOCUMENTATION.md](./PHASE_3_API_DOCUMENTATION.md) - API reference

---

**Status:** Ready for Implementation  
**Created:** December 7, 2025  
**Version:** 1.0
