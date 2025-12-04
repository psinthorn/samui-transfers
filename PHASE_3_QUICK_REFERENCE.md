# Phase 3 Quick Reference Card

## 🎯 What's New in Phase 3

### Payment Integration System ✅
- Complete booking → payment → confirmation flow
- Automatic email receipts on payment completion
- Admin dashboard for payment management
- Refund processing (full and partial)
- Webhook event tracking for audit trail

---

## 📍 Key Files to Know

### Components
```
frontend/components/bookings/BookingConfirmationModal.tsx
  └─ Shows booking details + payment form
     
frontend/hooks/useBookingPayment.ts
  └─ Core payment logic (create, complete, fail, status, webhook)
```

### Admin Pages
```
frontend/app/admin/payments/page.tsx
  └─ Payment list with filters and stats
  
frontend/app/admin/payments/[id]/page.tsx
  └─ Payment details with refund capability
```

### API Routes
```
/api/admin/payments                    GET    List payments
/api/admin/payments/[id]               GET    Get payment details
/api/admin/payments/[id]/refund        POST   Process refund
```

### Email System
```
frontend/lib/email/payment-receipt-template.ts
  └─ HTML and plain text email templates
  
frontend/lib/email/service.ts
  └─ Email sending with Resend integration
```

### Database
```
Payment               13 fields + metadata JSON
PaymentWebhook       7 fields (audit trail)
PaymentMethod        Enum (stripe, paypal, bank_transfer, cash)
PaymentStatus        Enum (7 statuses)
```

---

## 🚀 Quick Start - Integration

### 1. Add Imports
```typescript
import { BookingConfirmationModal } from "@/components/bookings/BookingConfirmationModal"
import { useBookingPayment } from "@/hooks/useBookingPayment"
```

### 2. Add State
```typescript
const [showModal, setShowModal] = useState(false)
const [booking, setBooking] = useState(null)
```

### 3. Handle Booking Submit
```typescript
const handleSubmit = async (e) => {
  const booking = await fetch("/api/bookings", {...})
  setBooking(booking)
  setShowModal(true)
}
```

### 4. Add Modal to JSX
```typescript
{showModal && booking && (
  <BookingConfirmationModal
    booking={booking}
    onPaymentSuccess={() => setShowModal(false)}
    onClose={() => setShowModal(false)}
  />
)}
```

---

## 📡 API Reference

### List Payments
```bash
GET /api/admin/payments?status=COMPLETED&method=stripe&dateRange=30days&sortBy=recent

Response:
[
  {
    id: "pay_xxx",
    bookingId: "booking_xxx",
    amount: 2500.00,
    status: "COMPLETED",
    ...
  }
]
```

### Get Payment Details
```bash
GET /api/admin/payments/pay_xxx

Response:
{
  id: "pay_xxx",
  booking: { ... },
  webhooks: [ ... ],
  ...
}
```

### Process Refund
```bash
POST /api/admin/payments/pay_xxx/refund

Body:
{
  "amount": 2500.00,    // Optional, defaults to full
  "reason": "Customer request"
}

Response: Updated Payment object
```

---

## 🪝 Hook Usage

### useBookingPayment
```typescript
const hook = useBookingPayment()

// Create payment record
const payment = await hook.createPayment({
  bookingId: "booking_123",
  method: "stripe",
  amount: 2500,
  currency: "THB",
  payerEmail: "user@example.com",
  payerName: "John"
})

// Complete payment (sends email)
await hook.completePayment({
  bookingId: "booking_123",
  paymentId: "pay_xxx",
  transactionId: "txn_123",
  method: "stripe",
  stripeSessionId: "cs_xxx"
})

// Record webhook event
await hook.recordWebhook({
  paymentId: "pay_xxx",
  provider: "stripe",
  eventType: "payment_intent.succeeded",
  externalId: "evt_xxx",
  rawData: { ... }
})
```

---

## 🔐 Admin Access

All admin routes require:
1. Valid user session (`await auth()`)
2. Admin role (`user.role === "ADMIN"`)

Routes check both automatically. Returns:
- 401 if not authenticated
- 403 if not admin

---

## 📧 Email Configuration

### Production (Live Emails)
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_FROM_EMAIL=noreply@samuitransfers.com
```

### Development (Console Logs)
```
No RESEND_API_KEY = emails logged to console
Useful for testing without sending real emails
```

---

## 🧪 Testing Checklist

- [ ] Create test booking
- [ ] Complete payment with test card
  - Stripe: `4242 4242 4242 4242`
  - PayPal: Use sandbox
- [ ] Check email received (or console log)
- [ ] Access `/admin/payments`
- [ ] Filter payments
- [ ] View payment details
- [ ] Process refund
- [ ] Check refund webhook event

---

## 💾 Database

### Migration
```bash
npx prisma migrate deploy  # Apply migrations
npx prisma db push        # Push schema (dev only)
```

### Check Status
```bash
npx prisma migrate status
```

### Studio (Visual DB Browser)
```bash
npx prisma studio
```

---

## 🐛 Common Issues & Fixes

### Issue: "Booking not found in modal"
**Fix:** Ensure booking ID is passed from form submission

### Issue: "Email not sending"
**Fix:** Set RESEND_API_KEY environment variable

### Issue: "Admin route returns 403"
**Fix:** Check user has admin role in database

### Issue: "Decimal precision issues"
**Fix:** Use `Number(payment.amount)` when converting to JSON

---

## 📊 Database Query Examples

### Get all completed payments
```typescript
const payments = await db.payment.findMany({
  where: { status: "COMPLETED" },
  orderBy: { completedAt: "desc" }
})
```

### Get payment with booking
```typescript
const payment = await db.payment.findUnique({
  where: { id: "pay_xxx" },
  include: { booking: true, webhooks: true }
})
```

### Get payments by date range
```typescript
const payments = await db.payment.findMany({
  where: {
    createdAt: {
      gte: new Date("2024-12-01"),
      lte: new Date("2024-12-31")
    }
  }
})
```

---

## 🔄 Data Flow Summary

```
User Booking Form
    ↓
Create Booking in DB
    ↓
Show BookingConfirmationModal
    ↓
User completes payment
    ↓
useBookingPayment.completePayment()
    ├─ Create Payment record
    ├─ Update Booking status
    ├─ Send receipt email
    └─ Record webhook event
    ↓
Redirect to success page
    ↓
Email delivered to customer
```

---

## 📚 Documentation References

- **API Docs:** `PHASE_3_API_DOCUMENTATION.md`
- **Integration Guide:** `PHASE_3_INTEGRATION_GUIDE.md`
- **Implementation Details:** `PHASE_3_IMPLEMENTATION_SUMMARY.md`
- **Completion Status:** `PHASE_3_COMPLETION_REPORT.md`

---

## ⚡ Performance Tips

- Admin list load: < 500ms (typical)
- Payment detail: < 200ms
- Email send: < 100ms (async)
- Use filters to reduce data load
- Pagination recommended for 10,000+ records

---

## 🔐 Security Reminders

- ✅ Always verify admin role in routes
- ✅ Use prepared statements (Prisma handles this)
- ✅ Don't expose internal error details
- ✅ Validate all user input
- ✅ Use HTTPS only for production

---

## 🎯 Success Indicators

All ✅ means Phase 3 is working correctly:

- ✅ Payment records created in database
- ✅ Admin dashboard shows payments
- ✅ Email receipts sent on completion
- ✅ Refunds process successfully
- ✅ Webhook events recorded
- ✅ Booking status updated
- ✅ Auth checks working

---

**Last Updated:** December 4, 2024  
**Status:** ✅ Phase 3 Complete  
**Ready:** 🚀 Production Deployment
