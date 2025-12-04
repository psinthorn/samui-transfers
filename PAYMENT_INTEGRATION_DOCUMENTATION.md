# Payment Integration Documentation

## Overview

Complete payment gateway integration with Stripe and PayPal for Samui Transfers booking system. This document provides comprehensive guidance on implementation, testing, and deployment.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Structure](#component-structure)
3. [Integration Guide](#integration-guide)
4. [Testing Guide](#testing-guide)
5. [Deployment](#deployment)
6. [API Reference](#api-reference)
7. [Error Handling](#error-handling)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Payment Flow

```
User Booking
    ↓
PaymentGateway Component
    ├─→ Select Payment Method (Stripe/PayPal)
    ├─→ Enter Payment Details
    ├─→ Submit Form
    ↓
API Route (/api/payments/[method]/...)
    ├─→ Validate Payment
    ├─→ Create Stripe Session / PayPal Order
    ├─→ Return Redirect URL
    ↓
Payment Provider (Stripe/PayPal)
    ├─→ Process Payment
    ├─→ Return to Success/Error Page
    ↓
Database Update
    └─→ Update Booking Status
```

### Technology Stack

- **Frontend**: React 19 + TypeScript + Next.js 15
- **State Management**: React Context (PaymentContext)
- **Payment Processors**: Stripe v20.0.0, PayPal SDK v1.1.0
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

---

## Component Structure

### 1. PaymentGateway Component
**Location**: `frontend/components/payments/PaymentGateway.tsx`

Main component orchestrating both payment methods with method selection.

```typescript
<PaymentGateway
  bookingId="BK-123456"
  amount={1600}
  currency="THB"
  email="user@example.com"
  onSuccess={() => console.log("Payment successful")}
  onError={(error) => console.error(error)}
/>
```

**Features**:
- Payment method toggle (Stripe/PayPal)
- Dynamic form rendering
- Security information display
- FAQ accordion
- Professional UI/UX

### 2. StripePaymentForm Component
**Location**: `frontend/components/payments/StripePaymentForm.tsx`

Dedicated Stripe payment form with card details.

```typescript
<StripePaymentForm
  bookingId="BK-123456"
  amount={1600}
  currency="THB"
  onSuccess={handleSuccess}
  onError={handleError}
/>
```

**Features**:
- Cardholder name input
- Email validation
- Payment summary
- Test card display (4242 4242 4242 4242)
- Error handling

### 3. PayPalPaymentButton Component
**Location**: `frontend/components/payments/PayPalPaymentButton.tsx`

Dedicated PayPal payment form.

```typescript
<PayPalPaymentButton
  bookingId="BK-123456"
  amount={1600}
  currency="THB"
  onSuccess={handleSuccess}
  onError={handleError}
/>
```

**Features**:
- Full name input
- Email validation
- Sandbox mode indicator
- PayPal redirect messaging
- Error handling

---

## Integration Guide

### Step 1: Setup Environment Variables

Create `.env.local` with:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# Stripe Configuration
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal Configuration
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox  # or 'live' for production

# Database
DATABASE_URL=postgresql://...

# Payment Configuration
PAYMENT_SUCCESS_URL=/booking/success
PAYMENT_CANCEL_URL=/booking/cancel
PAYMENT_ERROR_URL=/booking/error
```

### Step 2: Add Payment Context Provider

Wrap your app with PaymentProvider:

```typescript
// app/layout.tsx
import { PaymentProvider } from "@/context/PaymentContext"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <PaymentProvider>
          {children}
        </PaymentProvider>
      </body>
    </html>
  )
}
```

### Step 3: Add Payment Gateway to Booking Flow

```typescript
// In your booking checkout page
import PaymentGateway from "@/components/payments/PaymentGateway"

export default function CheckoutPage() {
  const [bookingData] = useState({
    id: "BK-123456",
    amount: 1600,
    currency: "THB",
  })

  return (
    <div>
      {/* Booking Details */}
      <h1>Review Your Booking</h1>
      
      {/* Payment Component */}
      <PaymentGateway
        bookingId={bookingData.id}
        amount={bookingData.amount}
        currency={bookingData.currency}
        email={userEmail}
        onSuccess={() => {
          // Handle success - user will auto-redirect to /booking/success
        }}
        onError={(error) => {
          // Handle error
          console.error(error)
        }}
      />
    </div>
  )
}
```

### Step 4: Handle Success and Error Redirects

Success page: `/app/booking/success/page.tsx`
- Displays booking confirmation
- Shows transaction details
- Provides next steps

Error page: `/app/booking/error/page.tsx`
- Shows error details
- Provides retry options
- Links to support

Cancel page: `/app/booking/cancel/page.tsx`
- Indicates payment was cancelled
- Allows user to retry
- Shows booking is still saved

---

## Testing Guide

### Test Card Numbers (Stripe)

| Card Type | Number | Expiry | CVC |
|-----------|--------|--------|-----|
| Visa (Success) | 4242 4242 4242 4242 | 12/25 | 123 |
| Visa (Decline) | 4000 0000 0000 0002 | 12/25 | 123 |
| Visa (3D Secure) | 4000 0025 0000 3155 | 12/25 | 123 |
| Mastercard | 5555 5555 5555 4444 | 12/25 | 123 |
| Amex | 3782 822463 10005 | 12/25 | 1234 |

### PayPal Sandbox Testing

1. Log in to [PayPal Developer](https://developer.paypal.com)
2. Create sandbox test accounts
3. Use test credentials in your app
4. Test complete payment flow

### Local Testing Workflow

1. **Start development server**:
```bash
npm run dev
```

2. **Navigate to booking checkout**:
```
http://localhost:3000/booking/checkout
```

3. **Test Stripe Flow**:
   - Select "Stripe" method
   - Fill in required fields
   - Enter test card: 4242 4242 4242 4242
   - Complete payment
   - Verify redirect to `/booking/success`

4. **Test PayPal Flow**:
   - Select "PayPal" method
   - Fill in required fields
   - Click "Pay with PayPal"
   - Use sandbox credentials
   - Confirm payment
   - Verify redirect to `/booking/success`

5. **Test Error Cases**:
   - Use card 4000 0000 0000 0002 for decline
   - Fill invalid email for validation error
   - Check error messages

### Verify Database Updates

Check that payments are saved:

```bash
npm run db:studio
```

Look for new records in:
- `Payment` table
- `Booking` table (status should be "confirmed", paymentStatus should be "paid")

---

## Deployment

### Vercel Deployment Checklist

- [ ] Add environment variables to Vercel
- [ ] Update NEXTAUTH_URL to production domain
- [ ] Update STRIPE_WEBHOOK_SECRET with production secret
- [ ] Update PAYPAL_MODE to 'live' with production credentials
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Configure webhook in Stripe dashboard
- [ ] Configure webhook in PayPal dashboard
- [ ] Test payment flow on staging
- [ ] Monitor logs for errors

### Environment Variables on Vercel

```bash
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_production_secret

STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

PAYPAL_CLIENT_ID=production_client_id
PAYPAL_CLIENT_SECRET=production_secret
PAYPAL_MODE=live

DATABASE_URL=your_production_db_url
```

### Webhook Configuration

**Stripe Webhook Events**:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

**PayPal Webhook Events**:
- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.DECLINED`

---

## API Reference

### Create Stripe Checkout Session

**Endpoint**: `POST /api/payments/stripe/create-checkout-session`

**Request**:
```json
{
  "bookingId": "BK-123456",
  "amount": 1600,
  "currency": "THB",
  "email": "user@example.com",
  "bookingDetails": {
    "description": "Transfer from Airport to Hotel"
  }
}
```

**Response**:
```json
{
  "success": true,
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/..."
}
```

### Create PayPal Order

**Endpoint**: `POST /api/payments/paypal/create-order`

**Request**:
```json
{
  "bookingId": "BK-123456",
  "amount": 1600,
  "currency": "THB",
  "email": "user@example.com",
  "bookingDetails": {
    "description": "Transfer from Airport to Hotel"
  }
}
```

**Response**:
```json
{
  "success": true,
  "orderId": "7E1234567890",
  "approvalLink": "https://www.sandbox.paypal.com/checkoutnow?token=..."
}
```

### Capture PayPal Order

**Endpoint**: `POST /api/payments/paypal/capture-order`

**Request**:
```json
{
  "orderId": "7E1234567890",
  "bookingId": "BK-123456"
}
```

**Response**:
```json
{
  "success": true,
  "orderId": "7E1234567890",
  "status": "COMPLETED"
}
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Missing API Keys | Env vars not set | Set STRIPE_SECRET_KEY and PAYPAL credentials |
| Card Declined | Payment provider rejected | Use valid test card (4242...) |
| Invalid Amount | Amount ≤ 0 | Verify amount is positive number |
| Missing Email | Email not provided | Add email validation in form |
| Webhook Signature Invalid | Wrong secret | Verify STRIPE_WEBHOOK_SECRET |
| PayPal Order Not Found | Incorrect OrderId | Check order creation response |

### Error Response Format

```json
{
  "error": "Payment processing failed",
  "details": "Card declined by issuer",
  "code": "card_declined"
}
```

---

## Troubleshooting

### Payment Redirects Not Working

**Symptoms**: After payment, stays on payment page
**Solution**:
1. Check NEXTAUTH_URL is correct
2. Verify browser allows redirects
3. Check browser console for errors
4. Verify API route returns redirect URL

### Webhook Not Processing

**Symptoms**: Payment successful but booking not updated
**Solution**:
1. Verify webhook URL in dashboard
2. Check webhook secret matches
3. View webhook logs in provider dashboard
4. Check server logs for errors

### Test Cards Not Working

**Symptoms**: Can't complete test payment
**Solution**:
1. Use correct test card numbers
2. Use future expiration date (12/25)
3. Use any 3-digit CVC
4. Check you're in test mode

### Database Not Updating

**Symptoms**: Payment succeeds but Payment record not created
**Solution**:
1. Verify DATABASE_URL is set
2. Run migrations: `npx prisma migrate dev`
3. Check Prisma schema has Payment model
4. View logs for database errors

### PayPal Sandbox Issues

**Symptoms**: PayPal not accepting payments
**Solution**:
1. Verify sandbox credentials
2. Check PAYPAL_MODE=sandbox
3. Create new test accounts
4. Clear browser cookies

---

## Support

For issues or questions:
- 📞 **Phone**: +66 99 108 7999 (24/7)
- 📧 **Email**: support@samuItransfers.com
- 📋 **Documentation**: See API_REFERENCE.md
- 💬 **GitHub**: [Repository Issues](https://github.com/your-repo/issues)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024 | Initial payment integration |
| 1.1.0 | 2024 | Added PayPal support |
| 1.2.0 | 2024 | Added webhook handling |

---

**Last Updated**: 2024
**Status**: Production Ready
