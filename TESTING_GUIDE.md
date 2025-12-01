# Payment & Rate Integration Testing Guide

## Overview

This guide covers testing the complete payment and rate integration for the Koh Samui Transfer Service. The system includes:

- **Rate Calculation API** - Dynamic pricing based on vehicle type, distance, time, and rules
- **Stripe Payment Integration** - Secure payment processing
- **Admin Rate Management** - Configure service rates and pricing rules
- **Booking Form Integration** - Real-time rate display and payment checkout

---

## Prerequisites

### Environment Setup

Ensure `.env.local` has these variables:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
DATABASE_URL=postgresql://...
```

### Stripe Test Cards

Use these test cards with any future expiry and CVC:

| Card Number | Use Case |
|------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Payment declined |
| `4000 0025 0000 3155` | Requires authentication |

---

## Manual Testing Scenarios

### 1. Rate Calculation API

#### Test 1.1: Calculate Basic Rate

**Endpoint:** `POST /api/rates/calculate`

**Request:**
```bash
curl -X POST http://localhost:3000/api/rates/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleType": "MINIBUS",
    "distance": 20,
    "pickupTime": "09:00",
    "pickupDate": "2025-12-25",
    "returnTrip": false
  }'
```

**Expected Response:**
- Status: `200 OK`
- Fields: `basePrice`, `distanceCharge`, `finalPrice`, `appliedRules`, `breakdown`
- Example: `{"finalPrice": 500, "breakdown": [...], "appliedRules": []}`

**Pass Criteria:**
- ✅ finalPrice > 0
- ✅ breakdown array populated
- ✅ All fields present

---

#### Test 1.2: Calculate with Return Trip

**Request:**
```bash
curl -X POST http://localhost:3000/api/rates/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleType": "SUV",
    "distance": 15,
    "pickupTime": "14:30",
    "pickupDate": "2025-12-20",
    "returnTrip": true
  }'
```

**Expected Response:**
- finalPrice should be ~2x the one-way rate
- appliedRules should include "Return Trip" multiplier (2x)

**Pass Criteria:**
- ✅ Return trip multiplier applied (2x)
- ✅ finalPrice reflects doubling

---

#### Test 1.3: Peak Hours (18:00-22:00)

**Request:**
```bash
curl -X POST http://localhost:3000/api/rates/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleType": "MINIBUS",
    "distance": 20,
    "pickupTime": "21:00",
    "pickupDate": "2025-12-20",
    "returnTrip": false
  }'
```

**Expected Response:**
- appliedRules includes "Peak Hours (18:00-22:00)" with 1.5x multiplier

**Pass Criteria:**
- ✅ Peak hours multiplier (1.5x) applied
- ✅ finalPrice ~1.5x standard rate

---

#### Test 1.4: Seasonal Multiplier (Dec 20 - Jan 10)

**Request:**
```bash
curl -X POST http://localhost:3000/api/rates/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleType": "MINIBUS",
    "distance": 20,
    "pickupTime": "09:00",
    "pickupDate": "2025-12-25",
    "returnTrip": false
  }'
```

**Expected Response:**
- appliedRules includes "Holiday Season (Dec 20 - Jan 10)" with 1.3x multiplier

**Pass Criteria:**
- ✅ Seasonal multiplier (1.3x) applied
- ✅ finalPrice ~1.3x standard rate

---

#### Test 1.5: Error - Invalid Vehicle Type

**Request:**
```bash
curl -X POST http://localhost:3000/api/rates/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleType": "INVALID_CAR",
    "distance": 20,
    "pickupTime": "09:00",
    "pickupDate": "2025-12-20",
    "returnTrip": false
  }'
```

**Expected Response:**
- Status: `400 Bad Request`
- Error message: "No active rates found for vehicle type INVALID_CAR"

**Pass Criteria:**
- ✅ Proper error handling
- ✅ Clear error message

---

### 2. Admin Rate Management API

#### Test 2.1: Get All Service Rates

**Endpoint:** `GET /api/admin/rates/service-rates`

**Request:**
```bash
curl http://localhost:3000/api/admin/rates/service-rates
```

**Expected Response:**
- Status: `200 OK`
- Returns array of service rates with: `id`, `vehicleType`, `basePrice`, `distanceRate`, `minDistance`, `maxDistance`, `description`, `isActive`

**Pass Criteria:**
- ✅ Array of rates returned
- ✅ All required fields present

---

#### Test 2.2: Create New Service Rate

**Endpoint:** `POST /api/admin/rates/service-rates`

**Request:**
```bash
curl -X POST http://localhost:3000/api/admin/rates/service-rates \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleType": "PREMIUM_SUV",
    "basePrice": 400,
    "distanceRate": 7.50,
    "minDistance": 5,
    "maxDistance": 100,
    "description": "Luxury SUV for premium clients"
  }'
```

**Expected Response:**
- Status: `201 Created`
- Returns created rate object with `id`

**Pass Criteria:**
- ✅ New rate created
- ✅ ID returned
- ✅ Retrievable via GET

---

#### Test 2.3: Update Service Rate

**Endpoint:** `PUT /api/admin/rates/service-rates`

**Request:**
```bash
curl -X PUT http://localhost:3000/api/admin/rates/service-rates \
  -H "Content-Type: application/json" \
  -d '{
    "id": "rate-id-here",
    "basePrice": 450,
    "distanceRate": 8.00
  }'
```

**Expected Response:**
- Status: `200 OK`
- Returns updated rate

**Pass Criteria:**
- ✅ Rate updated
- ✅ Changes reflected in calculations

---

#### Test 2.4: Delete Service Rate

**Endpoint:** `DELETE /api/admin/rates/service-rates`

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/admin/rates/service-rates \
  -H "Content-Type: application/json" \
  -d '{"id": "rate-id-here"}'
```

**Expected Response:**
- Status: `200 OK`
- Returns success message

**Pass Criteria:**
- ✅ Rate deleted
- ✅ No longer available in calculations

---

### 3. Payment API

#### Test 3.1: Create Payment Intent

**Endpoint:** `POST /api/payments/create-intent`

**Request:**
```bash
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "booking-123",
    "amount": 50000,
    "customerEmail": "user@example.com"
  }'
```

**Expected Response:**
- Status: `200 OK`
- Returns: `clientSecret` (for Stripe Elements)

**Pass Criteria:**
- ✅ clientSecret returned
- ✅ Can be used in frontend payment form

---

#### Test 3.2: Confirm Payment

**Endpoint:** `POST /api/payments/confirm`

**Request:**
```bash
curl -X POST http://localhost:3000/api/payments/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "booking-123",
    "paymentIntentId": "pi_xxxxx",
    "status": "COMPLETED"
  }'
```

**Expected Response:**
- Status: `200 OK`
- Booking payment status updated in database

**Pass Criteria:**
- ✅ Payment status updated
- ✅ Booking ready for processing

---

#### Test 3.3: Check Payment Status

**Endpoint:** `GET /api/payments/status/:bookingId`

**Request:**
```bash
curl http://localhost:3000/api/payments/status/booking-123
```

**Expected Response:**
- Status: `200 OK`
- Returns: `status` (PENDING|COMPLETED|FAILED|REFUNDED), `amount`, `date`

**Pass Criteria:**
- ✅ Current payment status returned
- ✅ Matches booking payment status

---

### 4. End-to-End Booking Flow

#### Test 4.1: Complete Booking with Payment (Happy Path)

**Steps:**

1. **Navigate to Booking Form**
   - URL: `http://localhost:3000/booking`
   - Sign in if required

2. **Fill Step 1: Booking Details**
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Mobile: +66812345678
   - Pickup DateTime: 2025-12-25 09:00
   - Passengers: 2
   - Vehicle: MINIBUS
   - Pickup Point: Samui Airport
   - Dropoff Point: Chaweng Beach
   - Distance: 25 km
   - Verify price displays automatically

3. **Verify Price Display**
   - Base price should show
   - Any multipliers should be visible
   - Total should be calculated
   - Click "Review" button

4. **Step 2: Confirmation**
   - Review all details
   - Accept terms and conditions
   - Click "Confirm & Continue"

5. **Step 3: Payment**
   - Payment form displays with amount
   - Enter test card: `4242 4242 4242 4242`
   - Any expiry date (e.g., 12/25)
   - Any CVC (e.g., 123)
   - Click "Pay Now"

6. **Payment Processing**
   - Loader should appear
   - Payment should process

7. **Step 4: Confirmation**
   - "Thank you" page should display
   - Booking ID should be shown
   - Success message confirms payment

**Pass Criteria:**
- ✅ All steps complete without error
- ✅ Rate calculated on form changes
- ✅ Price displays correctly
- ✅ Payment processes successfully
- ✅ Confirmation page shows booking ID
- ✅ Database updated with booking and payment

---

#### Test 4.2: Payment Declined

**Repeat Test 4.1 but use card:** `4000 0000 0000 0002`

**Expected Results:**
- Payment should fail
- Error message displays: "Your card was declined"
- User can retry
- Booking not created until payment succeeds

**Pass Criteria:**
- ✅ Error handled gracefully
- ✅ User can retry
- ✅ Booking not created

---

#### Test 4.3: Return Trip Booking

**Repeat Test 4.1 with modifications:**
- After filling form, check "Return Trip" checkbox
- Verify price doubles

**Pass Criteria:**
- ✅ Price updates to ~2x
- ✅ Breakdown shows 2x multiplier
- ✅ Payment succeeds

---

### 5. Admin Dashboard Testing

#### Test 5.1: Access Admin Rates Page

**URL:** `http://localhost:3000/admin/rates`

**Expected:**
- Page loads (requires admin access)
- Lists all current service rates
- Shows "Add Rate" button

**Pass Criteria:**
- ✅ Page accessible
- ✅ Rates displayed in table
- ✅ Add button visible

---

#### Test 5.2: Create New Rate via UI

1. Click "Add Rate" button
2. Fill form:
   - Vehicle Type: ECONOMY
   - Base Price: 250
   - Distance Rate: 4.50
   - Min Distance: 3
   - Max Distance: 50
3. Click "Save Rate"

**Expected:**
- Success message appears
- New rate added to table
- Rate immediately available for calculations

**Pass Criteria:**
- ✅ Form submits successfully
- ✅ Rate appears in table
- ✅ Available in calculations

---

#### Test 5.3: Edit Existing Rate

1. Click edit icon on a rate
2. Change Base Price to different value
3. Click "Save Rate"

**Expected:**
- Rate updated in table
- Changes reflected in future calculations

**Pass Criteria:**
- ✅ Edit form populates
- ✅ Changes saved
- ✅ Reflected in calculations

---

#### Test 5.4: Delete Rate

1. Click delete icon on a rate
2. Confirm deletion

**Expected:**
- Rate removed from table
- No longer available for new bookings

**Pass Criteria:**
- ✅ Confirmation dialog shown
- ✅ Rate deleted
- ✅ No longer in table

---

## Automated Test Cases

### API Test File

Create `frontend/__tests__/api.test.ts`:

```typescript
describe('Rate API', () => {
  describe('POST /api/rates/calculate', () => {
    it('should calculate basic rate', async () => {
      const response = await fetch('/api/rates/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleType: 'MINIBUS',
          distance: 20,
          pickupTime: '09:00',
          pickupDate: '2025-12-20',
          returnTrip: false,
        }),
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.finalPrice).toBeGreaterThan(0);
      expect(data.breakdown).toBeDefined();
    });

    it('should apply return trip multiplier', async () => {
      const singleTrip = await fetch('/api/rates/calculate', {
        method: 'POST',
        body: JSON.stringify({
          vehicleType: 'MINIBUS',
          distance: 20,
          pickupTime: '09:00',
          pickupDate: '2025-12-20',
          returnTrip: false,
        }),
      }).then(r => r.json());

      const returnTrip = await fetch('/api/rates/calculate', {
        method: 'POST',
        body: JSON.stringify({
          vehicleType: 'MINIBUS',
          distance: 20,
          pickupTime: '09:00',
          pickupDate: '2025-12-20',
          returnTrip: true,
        }),
      }).then(r => r.json());

      expect(returnTrip.finalPrice).toBeCloseTo(singleTrip.finalPrice * 2, 0);
    });
  });
});
```

---

## Performance Testing

### Load Test - Rate Calculation API

**Tool:** Apache Bench or k6

```bash
# 100 requests, 10 concurrent
ab -n 100 -c 10 -p request.json -T application/json http://localhost:3000/api/rates/calculate
```

**Expected:**
- Response time < 200ms per request
- Success rate 100%
- No timeouts

---

## Error Scenarios

| Scenario | Expected Behavior |
|----------|------------------|
| Missing vehicle type | 400 error with clear message |
| Invalid distance (0 or negative) | 400 error |
| Past booking date | 400 error |
| Declined card | Payment fails with message |
| Network timeout | Retry with exponential backoff |
| Database connection fails | 500 error with retry guidance |

---

## Debugging

### Enable Request/Response Logging

Add to `app/api/[...route]/route.ts`:

```typescript
console.log('Request:', {
  method: req.method,
  body: await req.json(),
  timestamp: new Date(),
});
```

### Check Stripe Webhook Events

Visit: `https://dashboard.stripe.com/test/webhooks`

Look for:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.completed`

### Database Query Inspection

Use Prisma Studio:

```bash
npx prisma studio
```

Check:
- Bookings table for new bookings
- ServiceRate table for active rates
- PricingRule table for active rules

---

## Success Checklist

- [ ] Rate calculation API returns correct prices
- [ ] Peak hours multiplier applied correctly
- [ ] Seasonal multiplier applied correctly
- [ ] Return trip multiplier applied correctly
- [ ] Payment intent created successfully
- [ ] Stripe payment processes test cards
- [ ] Booking form calculates rates on change
- [ ] Price display updates in real-time
- [ ] Admin dashboard CRUD operations work
- [ ] End-to-end booking flow completes
- [ ] Payment success redirects to confirmation
- [ ] Payment failure allows retry
- [ ] Database records created for all bookings
- [ ] Webhook events received and processed

---

## Known Limitations

1. **Test Data**: Using fixed dates. Seasonal rules are hardcoded (Dec 20 - Jan 10).
2. **Timezone**: Times are in 24-hour format; ensure consistency with user locale.
3. **Stripe Webhook**: Only test webhook with live vs test mode; staging requires tunneling.

---

## Support

For issues, check:
1. Console errors (browser DevTools)
2. Server logs (terminal output)
3. Stripe Dashboard for payment details
4. Prisma Studio for database state
