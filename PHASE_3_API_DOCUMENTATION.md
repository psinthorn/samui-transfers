# Phase 3: Payment Integration & Admin Dashboard - API Documentation

## Overview

Phase 3 implements the complete payment integration system with admin dashboard for managing all payment operations. This includes database models, API routes, webhooks, and email notifications.

## API Endpoints

### Payments Management

#### 1. Get Payments List
**Endpoint:** `GET /api/admin/payments`

**Authentication:** Admin role required

**Query Parameters:**
- `status` (optional): Filter by payment status
  - Values: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `CANCELLED`, `REFUNDED`, `PARTIALLY_REFUNDED`
- `method` (optional): Filter by payment method
  - Values: `stripe`, `paypal`, `bank_transfer`, `cash`
- `dateRange` (optional): Date range for filtering
  - Values: `7days`, `30days`, `90days`, `all` (default: `30days`)
- `sortBy` (optional): Sort order
  - Values: `recent`, `oldest`, `amount-high`, `amount-low` (default: `recent`)

**Response:**
```json
[
  {
    "id": "pay_xxx",
    "bookingId": "booking_xxx",
    "method": "stripe",
    "amount": 2500.00,
    "currency": "THB",
    "status": "COMPLETED",
    "payerEmail": "customer@example.com",
    "payerName": "John Doe",
    "completedAt": "2024-12-04T10:30:00Z",
    "createdAt": "2024-12-04T10:25:00Z"
  }
]
```

**Example Requests:**
```bash
# Get completed payments from last 30 days
curl -H "Authorization: Bearer <token>" \
  "https://api.samuitransfers.com/api/admin/payments?status=COMPLETED&dateRange=30days"

# Get Stripe payments sorted by highest amount
curl -H "Authorization: Bearer <token>" \
  "https://api.samuitransfers.com/api/admin/payments?method=stripe&sortBy=amount-high"
```

---

#### 2. Get Payment Details
**Endpoint:** `GET /api/admin/payments/[id]`

**Authentication:** Admin role required

**Parameters:**
- `id` (path): Payment ID

**Response:**
```json
{
  "id": "pay_xxx",
  "bookingId": "booking_xxx",
  "method": "stripe",
  "amount": 2500.00,
  "currency": "THB",
  "status": "COMPLETED",
  "payerEmail": "customer@example.com",
  "payerName": "John Doe",
  "transactionId": "txn_123456",
  "stripeSessionId": "cs_xxx",
  "paypalOrderId": null,
  "failureReason": null,
  "completedAt": "2024-12-04T10:30:00Z",
  "refundedAt": null,
  "createdAt": "2024-12-04T10:25:00Z",
  "updatedAt": "2024-12-04T10:30:00Z",
  "booking": {
    "id": "booking_xxx",
    "pickupLocation": "Bangkok Airport",
    "dropoffLocation": "Phuket Hotel",
    "pickupDate": "2024-12-10",
    "pickupTime": "14:00",
    "passengers": 2,
    "vehicleType": "SUV",
    "status": "CONFIRMED",
    "userEmail": "user@example.com"
  },
  "webhooks": [
    {
      "id": "webhook_xxx",
      "provider": "stripe",
      "eventType": "payment_intent.succeeded",
      "processed": true,
      "processedAt": "2024-12-04T10:30:00Z",
      "createdAt": "2024-12-04T10:30:00Z"
    }
  ]
}
```

---

#### 3. Process Refund
**Endpoint:** `POST /api/admin/payments/[id]/refund`

**Authentication:** Admin role required

**Parameters:**
- `id` (path): Payment ID

**Request Body:**
```json
{
  "amount": 2500.00,  // Optional, defaults to full amount
  "reason": "Customer requested cancellation"
}
```

**Response:**
```json
{
  "id": "pay_xxx",
  "bookingId": "booking_xxx",
  "amount": 2500.00,
  "currency": "THB",
  "status": "REFUNDED",  // or PARTIALLY_REFUNDED if partial
  "refundedAt": "2024-12-04T11:00:00Z",
  "failureReason": "Customer requested cancellation",
  "metadata": {
    "refundedAmount": 2500.00,
    "refundReason": "Customer requested cancellation",
    "refundedBy": "admin@samuitransfers.com",
    "refundedAt": "2024-12-04T11:00:00Z"
  }
}
```

**Error Responses:**
```json
// Payment not found
{ "error": "Payment not found" }  // Status: 404

// Payment status invalid
{ "error": "Only completed payments can be refunded" }  // Status: 400

// Refund amount exceeds payment amount
{ "error": "Refund amount cannot exceed payment amount" }  // Status: 400
```

---

## Payment Models

### Payment Model

Stores complete payment information with provider-specific fields and metadata.

**Fields:**
- `id`: Unique payment identifier
- `bookingId`: Reference to booking
- `method`: Payment method (stripe, paypal, bank_transfer, cash)
- `amount`: Payment amount (stored as Decimal for precision)
- `currency`: Currency code (default: THB)
- `status`: Current payment status
- `payerEmail`: Customer email
- `payerName`: Customer name
- `transactionId`: Provider's transaction reference
- `stripeSessionId`: Stripe session ID (if applicable)
- `paypalOrderId`: PayPal order ID (if applicable)
- `failureReason`: Reason for failure (if failed)
- `failureCode`: Error code from provider
- `completedAt`: Timestamp of completion
- `refundedAt`: Timestamp of refund (if refunded)
- `metadata`: JSON object for additional data
- `webhooks`: Related webhook events
- `booking`: Reference to booking record

**Relationships:**
- One-to-Many with `Booking`
- One-to-Many with `PaymentWebhook`

---

### PaymentWebhook Model

Tracks all webhook events for audit trail and event processing.

**Fields:**
- `id`: Unique webhook record ID
- `paymentId`: Reference to payment
- `provider`: Provider name (stripe, paypal)
- `eventType`: Event type (e.g., payment_intent.succeeded)
- `externalId`: External event ID from provider
- `rawData`: JSON object with full webhook payload
- `processed`: Whether webhook was processed
- `processedAt`: Timestamp of processing
- `createdAt`: Timestamp of webhook receipt

**Relationships:**
- Many-to-One with `Payment`

---

## Email System

### Payment Receipt Email

Automatically sent when payment is completed.

**Triggered By:** `completePayment()` in `useBookingPayment` hook

**Content:**
- Payment amount and status
- Transaction details
- Booking information (route, date, time, passengers)
- Payment method used
- Contact information

**Templates:**
- HTML version (professional styling)
- Plain text version (fallback)

**Example Template Variables:**
```
{
  paymentId: "pay_xxx",
  amount: 2500.00,
  currency: "THB",
  method: "stripe",
  status: "COMPLETED",
  payerName: "John Doe",
  booking: {
    pickupLocation: "Bangkok Airport",
    dropoffLocation: "Phuket Hotel",
    pickupDate: "2024-12-10",
    pickupTime: "14:00"
  }
}
```

---

## Integration Points

### 1. Booking Confirmation Modal
**File:** `frontend/components/bookings/BookingConfirmationModal.tsx`

Displays booking details and payment form to user. Integrates with PaymentGateway component from Phase 2.

**Props:**
```typescript
interface Props {
  booking: BookingConfirmation
  onPaymentSuccess?: (payment: Payment) => void
  onPaymentError?: (error: Error) => void
  onClose?: () => void
}
```

---

### 2. useBookingPayment Hook
**File:** `frontend/hooks/useBookingPayment.ts`

Core hook for payment operations with email integration.

**Methods:**
```typescript
createPayment(paymentData) // Create new payment record
completePayment(paymentData) // Mark payment completed + send email
failPayment(paymentData) // Mark payment failed
getPaymentStatus(bookingId) // Get latest payment for booking
recordWebhook(webhookData) // Log webhook event
```

---

### 3. Admin Payments Dashboard
**File:** `frontend/app/admin/payments/page.tsx`

Lists all payments with filtering and sorting capabilities.

**Features:**
- Real-time payment list
- Multiple filters (status, method, date range)
- Sorting options
- Statistics cards (total, completed, pending, revenue)
- Links to payment details

---

### 4. Admin Payment Details Page
**File:** `frontend/app/admin/payments/[id]/page.tsx`

Detailed view of individual payment with refund capability.

**Features:**
- Complete payment information
- Booking details and link
- Payer information
- Transaction IDs
- Webhook event history
- Refund button with reason dialog
- Download receipt button

---

## Environment Variables

```bash
# Email Configuration (Resend)
RESEND_API_KEY=re_xxxxx
NEXT_PUBLIC_FROM_EMAIL=noreply@samuitransfers.com

# Application URLs
NEXT_PUBLIC_APP_URL=https://samuitransfers.com

# Database
DATABASE_URL=postgresql://user:password@host/database
```

---

## Database Schema Changes

Migration: `20251204003053_add_payment_models_phase_3`

**New Tables:**
- `Payment` - Main payment records
- `PaymentWebhook` - Webhook event log
- `PaymentMethod` enum
- `PaymentStatus` enum

**Indexes Added:**
- Payment: `(bookingId, createdAt, status, method, processedAt, paypalOrderId, stripeSessionId, payerEmail)`
- PaymentWebhook: `(paymentId, provider, eventType, processed, createdAt)`

---

## Error Handling

### Common Error Scenarios

**1. Unauthorized Access**
```
Status: 401
{ "error": "Unauthorized" }
```

**2. Insufficient Permissions**
```
Status: 403
{ "error": "Forbidden" }
```

**3. Resource Not Found**
```
Status: 404
{ "error": "Payment not found" }
```

**4. Invalid Request**
```
Status: 400
{ "error": "Only completed payments can be refunded" }
```

**5. Server Error**
```
Status: 500
{ "error": "Failed to fetch payments" }
```

---

## Testing

### Test Payment IDs
When testing locally, use these mock payment IDs:
- `pay_test_completed` - Test completed payment
- `pay_test_pending` - Test pending payment
- `pay_test_failed` - Test failed payment

### Manual Testing Checklist
- [ ] Fetch payments list with various filters
- [ ] Get individual payment details
- [ ] Process full refund
- [ ] Process partial refund
- [ ] Verify email is sent on completion
- [ ] Test webhook recording
- [ ] Verify admin dashboard displays data correctly

---

## Security Considerations

1. **Authentication:** All endpoints require valid session
2. **Authorization:** Admin role verification on all endpoints
3. **Data Privacy:** Payment emails contain sensitive info, secure transmission
4. **Audit Trail:** All operations logged via webhooks
5. **Rate Limiting:** Recommended on production

---

## Performance Notes

- **Pagination:** Currently returns all results; add pagination for scalability
- **Indexes:** Database indexes on commonly filtered fields
- **Email:** Async, non-blocking to avoid request delays
- **Caching:** Consider caching frequently accessed payment stats

---

## Future Enhancements

1. **Webhooks:** Implement payment provider webhooks (Stripe, PayPal)
2. **Reconciliation:** Automated payment reconciliation system
3. **Reporting:** Advanced payment analytics and reports
4. **Multi-currency:** Full multi-currency support
5. **Installments:** Payment plan/installment support
6. **Invoicing:** Generate and send invoices
7. **PCI Compliance:** Full PCI-DSS compliance certification
