# Vehicle Integration - Visual Flow & Architecture

## 🔄 User Journey Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         HOME PAGE                               │
│                 http://localhost:3000/                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  🗺️  SEARCH SECTION                                       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  📍 Select Pickup Location                             │  │
│  │  [Google Places Autocomplete Input]                    │  │
│  │                                                          │  │
│  │  📍 Select Drop-off Location                           │  │
│  │  [Google Places Autocomplete Input]                    │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  🚗 VEHICLE SELECTION                                     │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  Distance: 20.45 KM                                    │  │
│  │                                                          │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │ 🟢 Toyota Fortuner - SUV A                       │   │  │
│  │  │ Status: Available                               │   │  │
│  │  │ Capacity: 4 Seats • Luggage: 6                  │   │  │
│  │  │ Estimated Fare: 875 THB   [Select] Button      │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  │                                                          │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │ 🟢 Toyota Commuter - Minibus A                  │   │  │
│  │  │ Status: Available                               │   │  │
│  │  │ Capacity: 10 Seats • Luggage: 9                 │   │  │
│  │  │ Estimated Fare: 1,175 THB   [Select] Button    │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  │                                                          │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │ 🟡 Honda City - Sedan A                         │   │  │
│  │  │ Status: Maintenance         🔒 Locked           │   │  │
│  │  │ Capacity: 4 Seats • Luggage: 4                  │   │  │
│  │  │ Estimated Fare: 750 THB                        │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             ↓                                    │
│              [User Clicks "Select" Button]                      │
│                             ↓                                    │
│        System Saves to sessionStorage & Routes                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                             ↓↓↓
┌─────────────────────────────────────────────────────────────────┐
│                      BOOKING PAGE                               │
│               http://localhost:3000/booking                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ Form Auto-Fills from sessionStorage                        │
│                                                                 │
│  📍 Pickup:        Koh Samui Airport                          │
│  📍 Drop-off:      Chaweng Beach                              │
│  📏 Distance:      20.45 km                                   │
│  🚗 Vehicle:       Toyota Fortuner - SUV A                    │
│  💰 Estimated:     875 THB                                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ☑️ STEP 2: SELECT DATE & TIME                           │ │
│  │ [Date Picker]  [Time Picker]                           │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ☑️ STEP 3: PASSENGER INFO                               │ │
│  │ Passengers: [1] [+] [-]                               │ │
│  │ Name: [________________]                              │ │
│  │ Email: [________________]                             │ │
│  │ Phone: [________________]                             │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ☑️ STEP 4: SPECIAL REQUESTS                             │ │
│  │ [Text Area for notes/requests]                       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [← BACK]  [CONFIRM BOOKING →]                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                             ↓
                      User Confirms
                             ↓
                   POST /api/bookings
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                   CONFIRMATION PAGE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ BOOKING CONFIRMED                                         │
│                                                                 │
│  Reference: BK-2025-001234                                    │
│  Status: PENDING (awaiting payment)                           │
│                                                                 │
│  📧 Confirmation sent to: user@example.com                    │
│                                                                 │
│  [View Voucher]  [Chat Support]  [Home]                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🏗️ Component Architecture

```
app/page.tsx (Home Page)
    ↓
    ├─→ components/Home/SearchSection.js
    │       ├─ InputItem (Google Places)
    │       ├─ Distance Calculation (Google Distance Matrix)
    │       └─ Vehicle List
    │           ├─ Fetches: GET /api/vehicles?status=AVAILABLE
    │           ├─ For each vehicle:
    │           │   ├─ Status badge (🟢🟡⚫🔴)
    │           │   ├─ Capacity info
    │           │   ├─ Estimated fare calculation
    │           │   └─ Select button (enabled if AVAILABLE)
    │           └─ On select:
    │               ├─ Prepare booking data
    │               ├─ Save to sessionStorage
    │               └─ Navigate to /booking
    │
    └─→ Other home components
        (WhyChooseUs, AIChat, GoogleMapsSection, etc.)
```

```
app/booking/page.tsx (Booking Page)
    ↓
    └─→ app/booking/BookingPage.tsx
        ├─ Load from sessionStorage: pendingBookingData
        ├─ Pre-fill:
        │   ├─ Pickup location
        │   ├─ Drop-off location
        │   ├─ Distance
        │   ├─ Vehicle type
        │   ├─ Vehicle model
        │   └─ Estimated fare
        │
        ├─ Clear sessionStorage
        │
        └─ Multi-step form:
            ├─ Step 0: Location selector (if no data)
            ├─ Step 1: Vehicle selection (from pre-filled data)
            ├─ Step 2: Date & Time picker
            ├─ Step 3: Passenger info
            ├─ Step 4: Price review
            └─ Step 5: Confirmation
                └─ Submit: POST /api/bookings
```

## 🔌 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                   GOOGLE MAPS API                                │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐│
│  │ Places Autocomplete  │  │ Distance Matrix Service         ││
│  │ (Pickup/Dropoff)     │  │ (Calculate distance)            ││
│  └──────────────┬───────┘  └──────────────┬───────────────────┘│
└─────────────────┼──────────────────────────┼──────────────────────┘
                  │                          │
                  ↓                          ↓
        ┌─────────────────────────────────────────┐
        │   SearchSection Component               │
        │                                         │
        │  SourceContext    DestinationContext   │
        │  ↓                ↓                    │
        │  source={...}    destination={...}    │
        │                                         │
        │  routeDistanceInKiloMeter = 20.45 km  │
        └────────────────────┬────────────────────┘
                             │
                             ↓
        ┌─────────────────────────────────────────┐
        │  Fetch Vehicles                         │
        │  GET /api/vehicles?status=AVAILABLE     │
        └────────────────────┬────────────────────┘
                             │
                             ↓
        ┌──────────────────────────────────────────────┐
        │  Database (Prisma)                           │
        │  ┌──────────────────────────────────────┐   │
        │  │ SELECT * FROM Vehicle                │   │
        │  │ WHERE status = 'AVAILABLE'           │   │
        │  │ LIMIT 20                             │   │
        │  └──────────────────────────────────────┘   │
        │                                              │
        │  Returns: [Vehicle, Vehicle, Vehicle, ...]  │
        └────────────────────┬─────────────────────────┘
                             │
                             ↓
        ┌──────────────────────────────────────────┐
        │  Calculate Fare for Each Vehicle         │
        │                                          │
        │  basePrice = DEFAULT_RATES[vehicleType] │
        │  calculatedDistance = max(20.45 - 5, 0) │
        │  fare = basePrice +                     │
        │         calculatedDistance *            │
        │         distanceRate                    │
        │                                          │
        │  Example:                                │
        │  SUV: 350 + 15.45 * 35 = 890.75 → 891 │
        └────────────────────┬─────────────────────┘
                             │
                             ↓
        ┌──────────────────────────────────────────┐
        │  Display Vehicle List                    │
        │  - Name, Type, Status Badge              │
        │  - Capacity, Luggage, Estimated Fare     │
        │  - Select Button (enabled if AVAILABLE)  │
        └────────────────────┬─────────────────────┘
                             │
                   [User clicks "Select"]
                             │
                             ↓
        ┌──────────────────────────────────────────┐
        │  Prepare Booking Data                    │
        │                                          │
        │  bookingData = {                        │
        │    pickupPoint,                         │
        │    dropoffPoint,                        │
        │    distance,                            │
        │    vehicleId,                           │
        │    vehicleType,                         │
        │    rate: estimatedFare,                 │
        │    ...                                  │
        │  }                                       │
        └────────────────────┬─────────────────────┘
                             │
                             ↓
        ┌──────────────────────────────────────────┐
        │  Save to Browser sessionStorage          │
        │                                          │
        │  sessionStorage.setItem(                │
        │    'pendingBookingData',                │
        │    JSON.stringify(bookingData)          │
        │  )                                       │
        └────────────────────┬─────────────────────┘
                             │
                             ↓
        ┌──────────────────────────────────────────┐
        │  Navigate to /booking                    │
        │  router.push('/booking')                 │
        └────────────────────┬─────────────────────┘
                             │
                             ↓
        ┌──────────────────────────────────────────┐
        │  BookingPage Component                   │
        │                                          │
        │  useEffect(() => {                      │
        │    const data =                         │
        │      sessionStorage.getItem(            │
        │        'pendingBookingData'             │
        │      )                                   │
        │    // Pre-fill all state                │
        │    setPickupPoint(data.pickupPoint)    │
        │    setDistance(data.distance)          │
        │    setSelectedCarType(...)             │
        │    // Clear sessionStorage              │
        │    sessionStorage.removeItem(...)      │
        │  }, [])                                 │
        └────────────────────┬─────────────────────┘
                             │
                             ↓
        ┌──────────────────────────────────────────┐
        │  Form Pre-filled & Ready                 │
        │  User continues with date/time/contact  │
        └────────────────────┬─────────────────────┘
                             │
                             ↓
        ┌──────────────────────────────────────────┐
        │  User Submits                            │
        │  POST /api/bookings                     │
        │  ↓                                       │
        │  Create Booking in Database              │
        │  ↓                                       │
        │  Return booking ID & reference number   │
        └──────────────────────────────────────────┘
```

## 📊 Vehicle Status State Machine

```
            ┌─────────────────┐
            │   AVAILABLE     │
            │      🟢         │
            │   (Clickable)   │
            └────────┬────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ↓           ↓           ↓
    ┌─────────┐  ┌────────────┐  ┌──────────┐
    │RETIRED  │  │MAINTENANCE │  │OUT_OF_   │
    │   ⚫    │  │    🟡      │  │SERVICE   │
    │(Locked) │  │  (Locked)  │  │   🔴     │
    │         │  │            │  │ (Locked) │
    └─────────┘  └────────────┘  └──────────┘
         │            │              │
         └────────────┴──────────────┘
                     │
            ┌────────┴─────────┐
            │ All non-AVAILABLE │
            │ show disabled UI  │
            │ (lock icon)       │
            └──────────────────┘
```

## 🧮 Fare Calculation Logic

```
Input:
  vehicle.vehicleType = "suv"
  distance = 20.45 km

Step 1: Get rate for vehicle type
  ├─ minibus: basePrice: 500, distanceRate: 45
  ├─ suv: basePrice: 350, distanceRate: 35  ← Selected
  ├─ sedan: basePrice: 300, distanceRate: 30
  └─ ... others

Step 2: Get rate for SUV
  basePrice = 350 THB
  distanceRate = 35 THB/km

Step 3: Calculate distance charge
  calculatedDistance = max(20.45 - 5, 0)
  calculatedDistance = max(15.45, 0)
  calculatedDistance = 15.45 km

Step 4: Calculate fare
  fare = basePrice + (calculatedDistance * distanceRate)
  fare = 350 + (15.45 * 35)
  fare = 350 + 540.75
  fare = 890.75 THB

Step 5: Round to nearest integer
  finalFare = Math.round(890.75)
  finalFare = 891 THB

Output:
  Estimated Fare: 891 THB
```

## 🔒 Security & Data Integrity

```
┌──────────────────────────────────────────┐
│  Home Page → Select Vehicle               │
├──────────────────────────────────────────┤
│                                          │
│  1. Validate location coordinates         │
│     (Must be valid lat/lng pair)         │
│                                          │
│  2. Validate vehicle exists in DB        │
│     (Prevent fake vehicle IDs)           │
│                                          │
│  3. Validate vehicle status              │
│     (Only AVAILABLE can be selected)     │
│                                          │
│  4. Store data in sessionStorage         │
│     (Not in URL, not in cookies)         │
│                                          │
│  5. Clear after loading on /booking     │
│     (Prevent data reuse/replay)          │
│                                          │
└──────────────────────────────────────────┘
```

## ⚡ Performance Considerations

| Operation | Time | Notes |
|-----------|------|-------|
| Fetch vehicles from DB | 50-100ms | Paginated, indexed by status |
| Google Distance Matrix | 200-500ms | External API call |
| Calculate fare | < 1ms | Local math calculation |
| Display vehicle list | Instant | 20 vehicles rendered |
| Navigate to /booking | Instant | Client-side navigation |
| Load from sessionStorage | < 1ms | In-memory data |
| Total flow | ~1-2 seconds | From pickup selection to ready to book |

---

**Status:** ✅ Complete Architecture
**Last Updated:** December 9, 2025
