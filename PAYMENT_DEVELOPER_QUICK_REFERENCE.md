# 💳 Payment Developer Quick Reference Card

**Status:** ✅ Complete  
**Last Updated:** December 4, 2024  
**For:** Developers integrating payment features

---

## 🚀 Quick Start - 5 Minutes

### Installation
```bash
npm install stripe paypal-sdk-js @stripe/react-stripe-js
```

### Environment Setup
```env
# .env.local
STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx
RESEND_API_KEY=xxx
NEXT_PUBLIC_FROM_EMAIL=payments@example.com
```

### Basic Payment Flow
```typescript
// 1. Create booking
const booking = await createBooking(data);

// 2. Initialize payment
const payment = await useBookingPayment.createPayment(booking.id, {
  amount: booking.price,
  method: 'stripe'
});

// 3. User pays via form
<PaymentGateway onSuccess={handleSuccess} />

// 4. Complete payment
await useBookingPayment.completePayment(payment.id);

// 5. User gets confirmation + email
```

---

## 📁 File Structure

```
frontend/
├── components/payments/
│   ├── StripePaymentForm.tsx        (228 lines)
│   ├── PayPalPaymentButton.tsx      (180 lines)
│   └── PaymentGateway.tsx           (228 lines)
├── hooks/
│   └── useBookingPayment.ts         (180+ lines)
├── lib/
│   ├── email/
│   │   ├── payment-receipt-template.ts  (250 lines)
│   │   └── service.ts                   (200 lines)
│   └── payment.ts                   (utilities)
├── app/api/payments/
│   ├── stripe/
│   │   ├── create-checkout-session/route.ts
│   │   └── webhook/route.ts
│   └── paypal/
│       ├── create-order/route.ts
│       ├── capture-order/route.ts
│       └── webhook/route.ts
├── app/booking/
│   └── [id]/page.tsx                (booking page with modal)
└── app/admin/payments/
    ├── page.tsx                     (payments list - 288 lines)
    └── [id]/page.tsx                (payment details - 450+ lines)
```

---

## 🎯 Common Tasks

### Task 1: Use Payment Form in a Component

```typescript
import { PaymentGateway } from '@/components/payments/PaymentGateway';

export function MyComponent() {
  const handlePaymentSuccess = (paymentData) => {
    console.log('Payment successful:', paymentData);
    // Redirect or show confirmation
  };

  return (
    <PaymentGateway
      amount={100} // in cents, so $1.00
      bookingId="booking-123"
      onSuccess={handlePaymentSuccess}
      onError={(error) => console.error(error)}
    />
  );
}
```

### Task 2: Create a Payment with Hook

```typescript
import { useBookingPayment } from '@/hooks/useBookingPayment';

export function PaymentComponent() {
  const payment = useBookingPayment();
  
  const startPayment = async () => {
    // Step 1: Create payment record
    const result = await payment.createPayment('booking-123', {
      amount: 10000, // $100.00
      currency: 'USD',
      method: 'stripe' // or 'paypal'
    });
    
    if (result.success) {
      // Show payment form
      setShowForm(true);
    } else {
      console.error(result.error);
    }
  };

  const completePayment = async (paymentId) => {
    const result = await payment.completePayment(paymentId);
    if (result.success) {
      // Payment done, email sent
      router.push('/booking/success');
    }
  };

  return (
    <>
      <button onClick={startPayment}>Start Payment</button>
      {/* Show PaymentGateway here */}
    </>
  );
}
```

### Task 3: Check Payment Status

```typescript
const payment = useBookingPayment();

const checkStatus = async (paymentId) => {
  const status = await payment.getPaymentStatus(paymentId);
  
  console.log(status);
  // Returns: { status: 'COMPLETED', payment: {...} }
};
```

### Task 4: Record a Webhook Event

```typescript
const payment = useBookingPayment();

await payment.recordWebhook(paymentId, {
  type: 'stripe.payment_intent.succeeded',
  data: webhookPayload
});
```

### Task 5: Send Payment Email

```typescript
import { sendPaymentReceiptEmail } from '@/lib/email/service';

await sendPaymentReceiptEmail({
  to: 'customer@example.com',
  paymentData: {
    amount: 10000,
    currency: 'USD',
    status: 'COMPLETED',
    transactionId: 'pi_xxxxx',
    bookingDetails: {
      id: 'booking-123',
      location: 'Bangkok',
      date: '2024-12-20'
    }
  }
});
```

---

## 🔌 API Endpoints

### Payment Creation
```
POST /api/payments/stripe/create-checkout-session
Body: { bookingId, amount, currency }
Response: { sessionId, clientSecret }
```

### Payment Completion
```
POST /api/payments/stripe/webhook
Headers: stripe-signature
Webhook Event: payment_intent.succeeded
```

### PayPal Order Creation
```
POST /api/payments/paypal/create-order
Body: { amount, currency, bookingId }
Response: { orderId }
```

### PayPal Order Capture
```
POST /api/payments/paypal/capture-order
Body: { orderId, paymentId }
Response: { success, captureId }
```

### Admin Payment List
```
GET /api/admin/payments?status=COMPLETED&method=stripe&sortBy=recent
Auth: Admin only
Response: [ { id, amount, status, method, ... }, ... ]
```

### Admin Payment Details
```
GET /api/admin/payments/[id]
Auth: Admin only
Response: { payment, booking, webhooks: [...] }
```

### Admin Refund
```
POST /api/admin/payments/[id]/refund
Auth: Admin only
Body: { amount?, reason? }
Response: { success, refundId, status }
```

---

## 🧪 Testing Snippets

### Test Stripe Payment (cURL)
```bash
# 1. Create checkout session
curl -X POST http://localhost:3000/api/payments/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "test-123",
    "amount": 10000,
    "currency": "USD"
  }'

# Response: { sessionId: "cs_xxx", clientSecret: "pi_xxx" }

# 2. Use sessionId in frontend to show payment form
```

### Test PayPal Payment (cURL)
```bash
# 1. Create order
curl -X POST http://localhost:3000/api/payments/paypal/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "test-123",
    "amount": "100.00",
    "currency": "USD"
  }'

# Response: { orderId: "xxx" }

# 2. Capture order after user approval
curl -X POST http://localhost:3000/api/payments/paypal/capture-order \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "xxx",
    "paymentId": "payment-123"
  }'
```

### Test Admin Endpoints (cURL)
```bash
# Get all payments
curl -X GET http://localhost:3000/api/admin/payments \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get payment details
curl -X GET http://localhost:3000/api/admin/payments/payment-123 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Process refund
curl -X POST http://localhost:3000/api/admin/payments/payment-123/refund \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "amount": 5000,
    "reason": "Customer requested"
  }'
```

---

## 🔍 Debugging

### Enable Debug Logging

```typescript
// In component or API route
console.log('Payment State:', {
  paymentId: payment.id,
  status: payment.status,
  method: payment.method,
  amount: payment.amount,
  timestamp: new Date().toISOString()
});

// Add to middleware for request logging
import { logger } from '@/lib/logger';
logger.info('Payment request', { bookingId, amount });
```

### Common Errors

#### Error: "Stripe script not loaded"
```typescript
// Solution: Check STRIPE_PUBLIC_KEY in .env.local
console.log('Stripe Key:', process.env.STRIPE_PUBLIC_KEY);
// Should output: pk_test_xxxxx

// Reload page or restart dev server
```

#### Error: "PayPal button not rendering"
```typescript
// Solution: Check NEXT_PUBLIC_PAYPAL_CLIENT_ID
console.log('PayPal ID:', process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID);

// Clear browser cache and local storage
localStorage.clear();
// Hard refresh: Ctrl+Shift+R
```

#### Error: "Payment webhook not received"
```typescript
// Solution 1: Check Stripe webhook endpoint
// Go to Stripe Dashboard > Developers > Webhooks
// Endpoint should be: https://yourdomain.com/api/payments/stripe/webhook

// Solution 2: Use Stripe CLI for local testing
stripe listen --forward-to localhost:3000/api/payments/stripe/webhook

// Solution 3: Check webhook secret in .env
console.log('Webhook secret exists:', !!process.env.STRIPE_WEBHOOK_SECRET);
```

#### Error: "Email not sending"
```typescript
// Development mode: Check console
console.log('Email would be sent to:', email);

// Production mode: Check RESEND_API_KEY
// And verify FROM_EMAIL is in Resend whitelist
```

---

## 📊 Database Queries (SQL)

### Get All Payments for Booking
```sql
SELECT p.*, b.* FROM "Payment" p
JOIN "Booking" b ON p.bookingId = b.id
WHERE b.id = 'booking-123'
ORDER BY p.createdAt DESC;
```

### Get Payment Statistics
```sql
SELECT 
  status,
  COUNT(*) as count,
  SUM(amount) as total,
  AVG(amount) as average
FROM "Payment"
GROUP BY status;
```

### Get Failed Payments (Last 7 Days)
```sql
SELECT * FROM "Payment"
WHERE status IN ('FAILED', 'DECLINED')
AND createdAt >= NOW() - INTERVAL '7 days'
ORDER BY createdAt DESC;
```

### Get Webhook Events for Payment
```sql
SELECT * FROM "PaymentWebhook"
WHERE paymentId = 'payment-123'
ORDER BY createdAt DESC;
```

---

## 🔐 Security Checklist

- [ ] STRIPE_SECRET_KEY never exposed in frontend
- [ ] PAYPAL_CLIENT_SECRET never exposed in frontend
- [ ] All API routes have authentication
- [ ] Admin routes check for admin role
- [ ] Webhook endpoints verify signatures
- [ ] Input validation on all amounts
- [ ] HTTPS only in production
- [ ] Webhook secrets stored securely
- [ ] Rate limiting on payment endpoints
- [ ] Logging all payment activities

---

## 📈 Performance Tips

### 1. Lazy Load Payment Forms
```typescript
const PaymentForm = dynamic(
  () => import('@/components/payments/PaymentGateway'),
  { loading: () => <div>Loading...</div> }
);
```

### 2. Cache Payment Status
```typescript
// Use SWR for polling
import useSWR from 'swr';

const { data: payment } = useSWR(
  `/api/payments/${paymentId}`,
  fetcher,
  { refreshInterval: 5000 } // Poll every 5 seconds
);
```

### 3. Optimize Admin Dashboard
```typescript
// Use pagination
const { data, page, totalPages } = await getPayments({
  limit: 20,
  offset: (currentPage - 1) * 20
});
```

---

## 🎓 Code Examples by Use Case

### Use Case: Payment Modal in Booking
```typescript
'use client';

import { BookingConfirmationModal } from '@/components/bookings/BookingConfirmationModal';

export default function BookingPage() {
  return (
    <BookingConfirmationModal
      booking={booking}
      onSuccess={() => router.push('/booking/success')}
      onError={() => router.push('/booking/error')}
    />
  );
}
```

### Use Case: Admin Payment Review
```typescript
import { PaymentDetailsPage } from '@/app/admin/payments/[id]/page';

// Already includes:
// - Payment details
// - Refund functionality
// - Webhook timeline
// - Booking link
// - Receipt download
```

### Use Case: Custom Payment Handler
```typescript
export async function handleCustomPayment(bookingId: string) {
  try {
    // 1. Create payment
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount: new Decimal('100.00'),
        currency: 'USD',
        status: 'PROCESSING',
        method: 'custom'
      }
    });

    // 2. Process payment
    const result = await processWithCustomGateway(payment);

    // 3. Update payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        transactionId: result.transactionId
      }
    });

    // 4. Send email
    await sendPaymentReceiptEmail({...});

    return { success: true, paymentId: payment.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

---

## 🔗 Related Files

| File | Purpose | Lines |
|------|---------|-------|
| `components/payments/PaymentGateway.tsx` | Main payment form | 228 |
| `components/payments/StripePaymentForm.tsx` | Stripe integration | 228 |
| `components/payments/PayPalPaymentButton.tsx` | PayPal integration | 180 |
| `hooks/useBookingPayment.ts` | Payment operations hook | 180+ |
| `lib/email/service.ts` | Email sending service | 200 |
| `lib/email/payment-receipt-template.ts` | Email templates | 250 |
| `app/api/payments/stripe/route.ts` | Stripe API | 150+ |
| `app/api/payments/paypal/route.ts` | PayPal API | 150+ |
| `app/admin/payments/page.tsx` | Admin dashboard | 288 |
| `app/admin/payments/[id]/page.tsx` | Payment details | 450+ |

---

## 📞 Support & Documentation

- 📖 Full guide: `PAYMENT_INTEGRATION_DOCUMENTATION.md`
- 🧪 Testing guide: `PAYMENT_TESTING_VISUAL_GUIDE.md`
- 🎯 Quick reference: `PAYMENT_QUICK_REFERENCE.md`
- 🚀 Deployment: `VERCEL_DEPLOYMENT_GUIDE.md`

---

## ⚡ Cheat Sheet

```typescript
// Import payment hook
import { useBookingPayment } from '@/hooks/useBookingPayment';

// Create payment
const { createPayment } = useBookingPayment();
await createPayment(bookingId, { amount, method });

// Complete payment
const { completePayment } = useBookingPayment();
await completePayment(paymentId);

// Check status
const { getPaymentStatus } = useBookingPayment();
const status = await getPaymentStatus(paymentId);

// Send email
import { sendPaymentReceiptEmail } from '@/lib/email/service';
await sendPaymentReceiptEmail({ to, paymentData });

// Query payments
import { prisma } from '@/lib/prisma';
const payments = await prisma.payment.findMany({
  where: { status: 'COMPLETED' },
  include: { booking: true, webhooks: true }
});
```

---

**Version:** 1.0  
**Status:** ✅ Ready for developers  
**Last Updated:** December 4, 2024
