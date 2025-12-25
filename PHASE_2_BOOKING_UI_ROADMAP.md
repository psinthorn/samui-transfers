# 🚀 Phase 2: Customer Booking UI Implementation Roadmap

**Status:** Ready to Start  
**Estimated Duration:** 7 days  
**Start Date:** December 9, 2025  
**Target Completion:** December 16, 2025

---

## 📋 Phase Overview

Phase 2 builds the customer-facing booking interface that allows users to search for vehicles, select dates/times, view prices, enter passenger info, and create bookings. This phase creates the foundation for payment integration in Phase 3.

### Infrastructure Status ✅
- **Database:** 75 records, fully seeded with production data
- **API:** /api/vehicles verified working with pagination
- **Admin Dashboard:** Functional at /admin/vehicles
- **Pricing:** All calculations tested and working
  - Service rates: 4 vehicle types with base + distance pricing
  - Tour packages: 4 tours with group size tiers
  - Special events: 3 events with tiered pricing

---

## 🎯 Phase 2 Deliverables

### 1. Booking Pages & Components (Days 1-2)
**Goal:** Create interactive booking interface  
**Deliverables:**
- `/app/booking/page.tsx` - Main booking page
- `/app/booking/confirmation/page.tsx` - Booking confirmation
- Vehicle selector component with search/filter
- Date/time picker component
- Passenger information form
- Price calculator display

**Key Features:**
- Search vehicles by type (minibus, SUV, sedan, pickup)
- Select departure date and time
- Select number of passengers
- Auto-calculate pricing based on distance (if provided)
- Show vehicle availability
- Real-time price updates

### 2. Booking API Routes (Day 3)
**Goal:** Handle booking submission and data persistence  
**Deliverables:**
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Fetch booking details
- `PUT /api/bookings/:id` - Update booking status
- Validation middleware
- Error handling

**Validation Requirements:**
- Required fields: vehicle, departure date, passengers
- Date must be future date
- Passengers: 1-99
- Vehicle must be AVAILABLE

### 3. Confirmation & Email (Days 4-5)
**Goal:** Confirm bookings and send notifications  
**Deliverables:**
- Booking confirmation page with reference number
- Email notification templates
- Email sending service integration
- Booking reference generation

**Email Templates:**
- Booking confirmation email
- Payment pending notification
- Booking cancelled email
- Receipt email (post-payment)

### 4. Testing & Refinement (Days 6-7)
**Goal:** Ensure quality and performance  
**Deliverables:**
- End-to-end booking flow testing
- Pricing calculation verification
- Email delivery testing
- Mobile responsiveness verification
- Performance optimization

---

## 📁 File Structure (Phase 2)

```
frontend/
├── app/
│   ├── booking/
│   │   ├── page.tsx                 # Main booking page
│   │   ├── confirmation/
│   │   │   └── page.tsx            # Confirmation page
│   │   ├── components/
│   │   │   ├── VehicleSelector.tsx
│   │   │   ├── DateTimePicker.tsx
│   │   │   ├── PassengerForm.tsx
│   │   │   └── PriceDisplay.tsx
│   │   └── hooks/
│   │       └── useBooking.ts
│   └── api/
│       └── bookings/
│           ├── route.ts            # POST create, GET list
│           └── [id]/
│               └── route.ts        # GET, PUT, DELETE
├── components/
│   └── ui/
│       ├── DatePicker.tsx          # Reusable date picker
│       └── Select.tsx              # Reusable select
└── lib/
    ├── email.ts                    # Email service
    └── booking.ts                  # Booking logic
```

---

## 🔑 Key Components Details

### 1. VehicleSelector Component
```typescript
Props:
- vehicles: Vehicle[]
- selectedVehicle: string | null
- onSelect: (vehicleId: string) => void
- filterType?: string
- onFilterChange?: (type: string) => void

Features:
- Display vehicle cards with image/icon
- Show capacity, type, price
- Search/filter by type
- Show availability status
- Highlight selected vehicle
```

### 2. DateTimePicker Component
```typescript
Props:
- selectedDate: Date | null
- selectedTime: string | null
- onDateChange: (date: Date) => void
- onTimeChange: (time: string) => void
- minDate?: Date (default: today + 1 hour)
- timeSlots?: string[] (optional)

Features:
- Calendar picker
- Time slot selector (30-min intervals)
- Show only future dates
- Show available time slots
```

### 3. PassengerForm Component
```typescript
Props:
- passengers: number
- onPassengersChange: (count: number) => void
- contactEmail: string
- onEmailChange: (email: string) => void
- contactPhone: string
- onPhoneChange: (phone: string) => void
- additionalNotes?: string
- onNotesChange?: (notes: string) => void

Features:
- Passenger count selector (1-99)
- Email validation
- Phone validation
- Notes field for special requests
```

### 4. PriceDisplay Component
```typescript
Props:
- vehicle: Vehicle
- serviceType: 'transfer' | 'tour' | 'event'
- passengers: number
- distance?: number
- basePrice: number | null
- totalPrice: number | null
- isLoading?: boolean

Features:
- Show base price
- Show per-person calculation
- Show distance breakdown (if applicable)
- Show total price
- Price update as values change
```

---

## 🔄 Booking Flow

```
1. User lands on /booking
   ↓
2. Select vehicle (minibus, SUV, sedan, pickup)
   ↓
3. Enter departure date & time
   ↓
4. Enter passenger count (1-99)
   ↓
5. View calculated price
   ↓
6. Enter contact info (email, phone)
   ↓
7. Review booking details
   ↓
8. Submit booking
   ↓
9. Booking created in database (status: PENDING)
   ↓
10. Confirmation email sent
    ↓
11. Redirect to /booking/confirmation?id={bookingId}
    ↓
12. Show booking reference number
    ↓
13. Show payment options (Phase 3)
```

---

## 💾 Database Schema (Booking)

**Booking Table Structure:**
```prisma
model Booking {
  id                    String    @id @default(cuid())
  
  // Customer Info
  customerEmail         String
  customerPhone         String
  customerName          String?
  
  // Service Details
  vehicleId             String
  vehicle               Vehicle   @relation(fields: [vehicleId], references: [id])
  
  // Booking Details
  bookingDate           DateTime
  departureDateTime     DateTime
  estimatedReturnTime   DateTime?
  numberOfPassengers    Int
  
  // Location
  pickupLocation        String
  dropoffLocation       String
  estimatedDistance     Int?
  
  // Pricing
  basePrice             Decimal
  distanceCharge        Decimal @default(0)
  totalPrice            Decimal
  
  // Service Type
  serviceType           String    // 'transfer', 'tour', 'event'
  
  // Status
  status                String    @default("PENDING") // PENDING, CONFIRMED, COMPLETED, CANCELLED
  paymentStatus         String    @default("UNPAID")  // UNPAID, PAID, REFUNDED
  
  // Additional Info
  specialRequests       String?
  notes                 String?
  
  // Timestamps
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

---

## 📊 Pricing Calculation Logic

### Service Transfer Pricing
```javascript
function calculateTransferPrice(serviceRate, distance) {
  if (distance < serviceRate.minDistance) {
    return serviceRate.basePrice
  }
  return serviceRate.basePrice + 
         (distance - serviceRate.minDistance) * serviceRate.distanceRate
}

// Example: Minibus 15km
// 800 + (15 - 5) * 15 = 950 THB
```

### Tour Package Pricing
```javascript
function calculateTourPrice(tourRates, groupSize) {
  const rate = tourRates.find(r => 
    groupSize >= r.minGroupSize && 
    groupSize <= r.maxGroupSize
  )
  return rate ? rate.pricePerPerson * groupSize : 0
}

// Example: City Tour 5 people
// 5 * 700 = 3,500 THB (4-10 group tier)
```

### Event Pricing
```javascript
function calculateEventPrice(eventRates, daysBeforeEvent) {
  const rate = eventRates.find(r => 
    daysBeforeEvent >= r.bookingWindowDays
  )
  return rate ? rate.basePricePerPerson : 0
}

// Example: Full Moon Party 15 people (30 days early)
// 15 * 400 = 6,000 THB (Early Bird tier)
```

---

## 🛠 Implementation Checklist

### Day 1: UI Components Setup
- [ ] Create `/app/booking/page.tsx` layout
- [ ] Build VehicleSelector component
- [ ] Build DateTimePicker component
- [ ] Build PassengerForm component
- [ ] Style with Tailwind CSS
- [ ] Test component rendering

### Day 2: Price Display & Integration
- [ ] Build PriceDisplay component
- [ ] Create useBooking custom hook
- [ ] Integrate pricing calculation
- [ ] Wire up form submission
- [ ] Add form validation
- [ ] Test price updates in real-time

### Day 3: API Routes
- [ ] Create `POST /api/bookings` endpoint
- [ ] Add booking validation
- [ ] Implement error handling
- [ ] Create `GET /api/bookings/:id` endpoint
- [ ] Add price calculation to API
- [ ] Test with curl/Postman

### Day 4: Confirmation Page
- [ ] Create confirmation page component
- [ ] Show booking details
- [ ] Generate booking reference number
- [ ] Display next steps message
- [ ] Add "View My Booking" link

### Day 5: Email Integration
- [ ] Setup email service (SendGrid/NodeMailer)
- [ ] Create email templates
- [ ] Send confirmation emails
- [ ] Test email delivery
- [ ] Add error handling

### Day 6-7: Testing & Optimization
- [ ] End-to-end booking flow testing
- [ ] Mobile responsiveness testing
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Bug fixes and refinements

---

## 🧪 Testing Scenarios

### Test 1: Simple Service Transfer
```
Vehicle: Minibus
Capacity: 10 people
Passengers: 3
Distance: 15 km
Expected Price: 950 THB
```

### Test 2: Tour Package Booking
```
Service: City Tour
Group Size: 5 people
Rate Tier: 4-10 people (700 THB/person)
Expected Price: 3,500 THB
```

### Test 3: Event Booking
```
Event: Full Moon Party
Group Size: 15 people
Booking Window: 30 days (Early Bird tier)
Expected Price: 6,000 THB
```

### Test 4: Edge Case - Small Group
```
Vehicle: Sedan
Passengers: 1
Distance: 8 km
Min Distance: 5 km
Expected Price: 550 THB (base, no distance surcharge applied)
```

---

## 🔗 API Endpoints Created

### POST /api/bookings
**Request:**
```json
{
  "customerEmail": "user@example.com",
  "customerPhone": "+66812345678",
  "vehicleId": "cmixw0w7p000jk0oukc26fdg8",
  "bookingDate": "2025-12-15",
  "departureDateTime": "2025-12-15T10:00:00Z",
  "numberOfPassengers": 3,
  "pickupLocation": "Koh Samui Airport",
  "dropoffLocation": "Lamai Beach",
  "estimatedDistance": 15,
  "serviceType": "transfer",
  "specialRequests": "Please arrange early pickup"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking_123",
    "bookingReference": "BK-20251209-001",
    "totalPrice": 950,
    "status": "PENDING",
    "createdAt": "2025-12-09T10:30:00Z"
  }
}
```

### GET /api/bookings/:id
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking_123",
    "bookingReference": "BK-20251209-001",
    "customer": {
      "email": "user@example.com",
      "phone": "+66812345678"
    },
    "vehicle": {
      "name": "Toyota Commuter - Minibus A",
      "capacity": 10
    },
    "bookingDetails": {
      "departureDateTime": "2025-12-15T10:00:00Z",
      "passengers": 3,
      "pickupLocation": "Koh Samui Airport",
      "dropoffLocation": "Lamai Beach"
    },
    "pricing": {
      "basePrice": 800,
      "distanceCharge": 150,
      "totalPrice": 950
    },
    "status": "PENDING",
    "paymentStatus": "UNPAID",
    "createdAt": "2025-12-09T10:30:00Z"
  }
}
```

---

## ⚠️ Validation Rules

**Email:** Valid email format required
**Phone:** Thai phone format (+66...) or local (08...)
**Passengers:** 1-99 range
**Distance:** 0-1000 km range
**Date:** Must be today or future
**Time:** Only during business hours (6 AM - 10 PM)
**Vehicle:** Must be AVAILABLE status

---

## 📱 UI/UX Considerations

1. **Responsive Design:** Mobile-first approach for booking form
2. **Accessibility:** ARIA labels, keyboard navigation, color contrast
3. **Real-time Feedback:** Price updates as user selects options
4. **Error Messages:** Clear, actionable error messages
5. **Loading States:** Show loaders during API calls
6. **Success Feedback:** Confirmation messages and animations
7. **Mobile Optimization:** Touch-friendly buttons (44px minimum)
8. **Dark Mode:** Support light and dark themes

---

## 🚀 Quick Start Commands

Once Phase 2 is complete, you can:

```bash
# Start development server
npm run dev

# Test booking API
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{...booking data...}'

# Reset database if needed
npm run prisma:seed

# View bookings in admin panel
# Navigate to: http://localhost:3000/admin/bookings (Phase 3)
```

---

## 📊 Phase 2 Success Metrics

- ✅ Booking form loads without errors
- ✅ All pricing calculations display correctly
- ✅ Bookings save to database successfully
- ✅ Confirmation emails are sent
- ✅ Mobile responsiveness verified
- ✅ All validation rules enforced
- ✅ Error handling works properly
- ✅ 0 console errors/warnings

---

## 🔜 Phase 3 Setup (After Phase 2)

Once Phase 2 is complete, Phase 3 will:
- Add payment gateway integration (Stripe/PayPal)
- Implement payment form
- Process transactions
- Handle webhooks
- Manage refunds
- Create admin booking management panel

---

**Ready to Begin? Run:** `npm run dev`  
**Phase 2 Target:** Production-ready customer booking interface  
**Timeline:** 7 days (December 9-16, 2025)
