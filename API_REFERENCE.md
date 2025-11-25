# Payment & Rate API Quick Reference

## Payment Endpoints

### 1. Create Payment Intent
```
POST /api/payments/create-intent
Content-Type: application/json

Request:
{
  "bookingId": "cm4x1234...",
  "amount": 525.00,
  "customerEmail": "user@example.com"
}

Response (Success):
{
  "success": true,
  "clientSecret": "pi_1234_secret_5678",
  "paymentIntentId": "pi_1234567890"
}

Response (Error):
{
  "error": "Booking not found: cm4x1234"
}
```

### 2. Confirm Payment
```
POST /api/payments/confirm
Content-Type: application/json

Request:
{
  "paymentIntentId": "pi_1234567890",
  "bookingId": "cm4x1234..."
}

Response:
{
  "success": true,
  "status": "succeeded|requires_action|processing|canceled",
  "paymentIntent": { ...stripe payment intent object },
  "bookingStatus": "COMPLETED|PENDING|FAILED"
}
```

### 3. Check Payment Status
```
GET /api/payments/status/[bookingId]

Response:
{
  "success": true,
  "bookingId": "cm4x1234...",
  "paymentStatus": "PENDING|COMPLETED|FAILED|REFUNDED",
  "paymentAmount": 525.00,
  "paymentMethod": "card",
  "paymentDate": "2025-11-25T10:30:00Z",
  "bookingStatus": "CONFIRMED"
}
```

### 4. Payment Webhook
```
POST /api/payments/webhook
Headers:
  stripe-signature: t=...,v1=...

Stripe Events Handled:
- payment_intent.succeeded → paymentStatus = COMPLETED
- payment_intent.payment_failed → paymentStatus = FAILED
- charge.refunded → paymentStatus = REFUNDED
```

---

## Rate Calculation Endpoints

### 1. Calculate Booking Rate
```
POST /api/rates/calculate
Content-Type: application/json

Request:
{
  "vehicleType": "MINIBUS",
  "distance": 10.5,
  "pickupTime": "2025-11-25T14:30:00Z",
  "pickupDate": "2025-11-25T00:00:00Z",
  "bookingId": "cm4x1234...",  // optional, for history
  "returnTrip": false
}

Response:
{
  "success": true,
  "calculation": {
    "basePrice": "300.00",
    "distanceCharge": "50.00",
    "peakHourMultiplier": 1.5,
    "seasonalMultiplier": 1.0,
    "discountMultiplier": 1.0,
    "subtotal": "525.00",
    "finalPrice": "525.00",
    "appliedRules": [
      "ServiceRate: MINIBUS",
      "Distance: 10.5km",
      "PeakHour: 150%",
      "ReturnTrip: -10%"
    ]
  }
}
```

### 2. Get Active Rates
```
GET /api/rates/active

Response:
{
  "success": true,
  "serviceRates": [
    {
      "id": "...",
      "vehicleType": "MINIBUS",
      "basePrice": "300.00",
      "distanceRate": "5.00",
      "minDistance": 5,
      "maxDistance": 50,
      "isActive": true,
      "description": "7-seat minibus",
      "createdAt": "2025-11-25T10:00:00Z"
    },
    ...
  ],
  "pricingRules": [
    {
      "id": "...",
      "ruleType": "PEAK_HOUR",
      "multiplier": "1.5",
      "startTime": "2025-01-01T15:00:00Z",
      "endTime": "2025-01-01T19:00:00Z",
      "dayOfWeek": [1,2,3,4,5],  // Mon-Fri
      "isActive": true
    },
    ...
  ]
}
```

---

## Admin Rate Management Endpoints

### 1. List Service Rates
```
GET /api/admin/rates/service-rates
Authorization: Bearer [admin-token]

Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "vehicleType": "MINIBUS",
      "basePrice": "300.00",
      "distanceRate": "5.00",
      "minDistance": 5,
      "maxDistance": 50,
      "isActive": true,
      "description": "7-seat minibus"
    },
    ...
  ]
}
```

### 2. Create Service Rate
```
POST /api/admin/rates/service-rates
Authorization: Bearer [admin-token]
Content-Type: application/json

Request:
{
  "vehicleType": "SUV",
  "basePrice": 400,
  "distanceRate": 6.50,
  "minDistance": 5,
  "maxDistance": 80,
  "description": "4x4 luxury vehicle"
}

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "vehicleType": "SUV",
    "basePrice": "400.00",
    "distanceRate": "6.50",
    "minDistance": 5,
    "maxDistance": 80,
    "isActive": true,
    "description": "4x4 luxury vehicle",
    "createdAt": "2025-11-25T15:00:00Z"
  }
}
```

### 3. Update Service Rate
```
PUT /api/admin/rates/service-rates
Authorization: Bearer [admin-token]
Content-Type: application/json

Request:
{
  "id": "...",
  "basePrice": 350,
  "distanceRate": 5.50,
  "isActive": true
}

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "vehicleType": "MINIBUS",
    "basePrice": "350.00",
    "distanceRate": "5.50",
    ...
  }
}
```

### 4. Delete Service Rate
```
DELETE /api/admin/rates/service-rates
Authorization: Bearer [admin-token]
Content-Type: application/json

Request:
{
  "id": "..."
}

Response:
{
  "success": true,
  "message": "Service rate deleted"
}
```

---

## Error Responses

### Common Error Codes
```
400 Bad Request
{
  "error": "Missing required fields: vehicleType, distance, ..."
}

404 Not Found
{
  "error": "Booking not found: cm4x1234..."
}

401 Unauthorized
{
  "error": "Unauthorized"
}

409 Conflict
{
  "error": "Service rate for MINIBUS already exists"
}

500 Internal Server Error
{
  "error": "Internal server error"
}
```

---

## Frontend Integration Example

### React Hook for Rate Calculation
```typescript
async function calculateBookingRate(bookingData) {
  const response = await fetch('/api/rates/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vehicleType: bookingData.vehicleType,
      distance: bookingData.distance,
      pickupTime: bookingData.pickupTime,
      pickupDate: bookingData.pickupDate,
      returnTrip: bookingData.returnTrip
    })
  });
  
  if (!response.ok) throw new Error('Failed to calculate rate');
  return response.json();
}

// Usage in form
onDistanceChange(async (distance) => {
  const { calculation } = await calculateBookingRate({
    vehicleType: 'MINIBUS',
    distance,
    pickupTime: new Date(),
    pickupDate: new Date()
  });
  
  setFinalPrice(calculation.finalPrice);
  setPriceBreakdown(calculation);
});
```

### React Hook for Payment
```typescript
async function initiatePayment(bookingId, amount) {
  const response = await fetch('/api/payments/create-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookingId,
      amount,
      customerEmail: userEmail
    })
  });
  
  const { clientSecret, paymentIntentId } = await response.json();
  
  // Use clientSecret with Stripe Elements
  const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement,
      billing_details: { email: userEmail }
    }
  });
  
  if (result.error) {
    // Handle error
  } else if (result.paymentIntent.status === 'succeeded') {
    // Confirm with backend
    await fetch('/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentIntentId, bookingId })
    });
  }
}
```

---

## Testing with cURL

### Test Rate Calculation
```bash
curl -X POST http://localhost:3000/api/rates/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleType": "MINIBUS",
    "distance": 10,
    "pickupTime": "2025-11-25T14:30:00Z",
    "pickupDate": "2025-11-25T00:00:00Z"
  }'
```

### Test Payment Intent Creation
```bash
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "test-booking-id",
    "amount": 525,
    "customerEmail": "test@example.com"
  }'
```

### Test Get Active Rates
```bash
curl http://localhost:3000/api/rates/active
```
