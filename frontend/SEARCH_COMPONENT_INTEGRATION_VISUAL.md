# 🎯 BookingPage Search Component Integration - Visual Guide

## Current System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BOOKING PAGE FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

                          USER STARTS AT /booking
                                   ↓
        ┌───────────────────────────────────────────────────────┐
        │  STEP 0: LOCATION SELECTION (NEW - Search Component) │
        ├───────────────────────────────────────────────────────┤
        │                                                       │
        │  📍 Pickup Location                                  │
        │  ┌─────────────────────────────────┐               │
        │  │ [InputItem + Google Autocomplete]│               │
        │  │ User starts typing location...   │               │
        │  │ Suggestions appear              │               │
        │  │ Select "Koh Samui Airport"      │               │
        │  └─────────────────────────────────┘               │
        │         ↓                                            │
        │  📍 Drop-off Location                              │
        │  ┌─────────────────────────────────┐               │
        │  │ [InputItem + Google Autocomplete]│               │
        │  │ User selects "Chaweng Beach"    │               │
        │  └─────────────────────────────────┘               │
        │         ↓                                            │
        │  [Google Distance Matrix API]                       │
        │  Calculates: 28.5 km                                │
        │         ↓                                            │
        │  [Continue Button]                                  │
        └───────────────────────────────────────────────────────┘
                             ↓
        ┌───────────────────────────────────────────────────────┐
        │  STEP 1: VEHICLE SELECTION (Dynamic Pricing)         │
        ├───────────────────────────────────────────────────────┤
        │                                                       │
        │  Your Journey:                                       │
        │  📍 Koh Samui Airport → Chaweng Beach (28.5 km)     │
        │                                                       │
        │  Select Vehicle:                                     │
        │  ┌──────────────────┬──────────────────┐            │
        │  │ Sedan            │ SUV              │            │
        │  │ 4 seats          │ 5 seats          │            │
        │  │ Est: 890 THB ✓ SELECTED        │            │
        │  └──────────────────┴──────────────────┘            │
        │  ┌──────────────────┬──────────────────┐            │
        │  │ Minibus          │ Pickup Truck     │            │
        │  │ 8 seats          │ 5 seats          │            │
        │  │ Est: 1,200 THB   │ Est: 920 THB     │            │
        │  └──────────────────┴──────────────────┘            │
        │                  ↓                                    │
        │  [Continue to Date & Time]                          │
        └───────────────────────────────────────────────────────┘
                             ↓
        ┌───────────────────────────────────────────────────────┐
        │  STEP 2: DATE & TIME SELECTION                        │
        ├───────────────────────────────────────────────────────┤
        │                                                       │
        │  Select Date:                                        │
        │  ┌─────────────────┐                                │
        │  │   December 2025 │  <  >                          │
        │  ├─────────────────┤                                │
        │  │ Mo Tu We Th Fr  │                                │
        │  │              1  │                                │
        │  │  2  3  4  5  6  │                                │
        │  │  9 10 11 12 13  │                                │
        │  │ 16 17[18]19 20  │ ← Selected                     │
        │  │ 23 24 25 26 27  │                                │
        │  └─────────────────┘                                │
        │                                                       │
        │  Select Time:                                        │
        │  ┌──────────────────────────────────┐               │
        │  │ 08:00 | 08:30 | 09:00 | 09:30... │ ← 09:00      │
        │  └──────────────────────────────────┘               │
        │                  ↓                                    │
        │  [Continue to Passenger Details]                    │
        └───────────────────────────────────────────────────────┘
                             ↓
        ┌───────────────────────────────────────────────────────┐
        │  STEP 3: PASSENGER DETAILS                            │
        ├───────────────────────────────────────────────────────┤
        │                                                       │
        │  Number of Passengers:                               │
        │  [−] 3 [+]                                          │
        │                                                       │
        │  Email:                                              │
        │  [john@example.com      ]                           │
        │                                                       │
        │  Phone (Thai Format):                                │
        │  [+66 8 XXXX XXXX       ]                           │
        │                                                       │
        │  Special Requests:                                   │
        │  [Need child seat, allergic to peanuts...] (500ch) │
        │                  ↓                                    │
        │  [Review Price]                                      │
        └───────────────────────────────────────────────────────┘
                             ↓
        ┌───────────────────────────────────────────────────────┐
        │  STEP 4: PRICE REVIEW                                 │
        ├───────────────────────────────────────────────────────┤
        │                                                       │
        │  Vehicle: Sedan                                      │
        │  Service: Vehicle Transfer                           │
        │  Passengers: 3                                       │
        │                                                       │
        │  Price Breakdown:                                    │
        │  ┌──────────────────────────┐                       │
        │  │ Base Fare:      890 THB  │                       │
        │  │ Per Person:     297 THB  │                       │
        │  │ Total (3 x):  2,670 THB  │                       │
        │  └──────────────────────────┘                       │
        │                  ↓                                    │
        │  [Confirm Booking]                                   │
        └───────────────────────────────────────────────────────┘
                             ↓
        ┌───────────────────────────────────────────────────────┐
        │  STEP 5: CONFIRMATION                                 │
        ├───────────────────────────────────────────────────────┤
        │                                                       │
        │  ✓ Booking Confirmed!                               │
        │                                                       │
        │  Booking Reference: BK-ABC12345                      │
        │                                                       │
        │  Route:                                              │
        │  📍 Pickup: Koh Samui Airport                        │
        │  📍 Drop-off: Chaweng Beach                          │
        │  📏 Distance: 28.5 km                                │
        │                                                       │
        │  Details:                                            │
        │  🚗 Vehicle: Sedan                                  │
        │  📅 Date: Thursday, December 18, 2025               │
        │  🕐 Time: 09:00                                     │
        │  👥 Passengers: 3                                   │
        │  📧 Email: john@example.com                         │
        │  📱 Phone: +66 8 XXXX XXXX                          │
        │                                                       │
        │  💰 Total Price: 2,670 THB                          │
        │                                                       │
        │  [View My Booking] [Create Another]                 │
        └───────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    GOOGLE PLACES API                         │
│            (Location Suggestions & Geocoding)                │
└──────────────────────────────────────────────────────────────┘
                           ↑
                           │ User selects location
                           ↓
┌──────────────────────────────────────────────────────────────┐
│               InputItem Component                             │
│     (Google Places Autocomplete Integration)                 │
└──────────────────────────────────────────────────────────────┘
                           ↓
              ┌────────────┴────────────┐
              ↓                         ↓
    ┌─────────────────┐       ┌─────────────────┐
    │ SourceContext   │       │DestinationContext│
    │ (Pickup Loc)    │       │ (Dropoff Loc)    │
    └─────────────────┘       └─────────────────┘
              ↓                         ↓
              └────────────┬────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│               BookingPage Component                           │
│     (Main Booking Flow Coordinator)                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  State:                                                      │
│  ├─ pickupPoint, dropoffPoint                              │
│  ├─ pickupCoords, dropoffCoords                            │
│  ├─ distance (from Google Maps)                            │
│  ├─ selectedCarType, selectedCarModel                      │
│  ├─ selectedDate, selectedTime                             │
│  ├─ passengers, email, phone, requests                     │
│  ├─ basePrice, totalPrice                                 │
│  └─ activeStep, submitSuccess                             │
│                                                              │
│  Effects:                                                    │
│  ├─ Sync location context                                  │
│  ├─ Calculate distance (Google Distance Matrix)            │
│  ├─ Calculate pricing (RateCalculate + passengers)         │
│  └─ Validate form at each step                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ↓                ↓                ↓
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │ Google Maps │ │  CarListData │ │RateCalculate│
    │ Distance    │ │  Vehicle     │ │  Pricing    │
    │ Matrix API  │ │  Details     │ │  Formula    │
    └─────────────┘ └─────────────┘ └─────────────┘
          ↓                ↓                ↓
          └────────────────┬────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│              UI Components                                    │
├──────────────────────────────────────────────────────────────┤
│ ├─ DateTimePicker (date/time selection)                    │
│ ├─ PassengerForm (passenger details)                       │
│ ├─ PriceDisplay (price breakdown)                          │
│ └─ Tabs (step navigation)                                  │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│              POST /api/bookings                              │
│         (Create booking in database)                        │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│              Success Page                                     │
│     (Show confirmation with reference number)               │
└──────────────────────────────────────────────────────────────┘
```

---

## Key Integration Points

### 1. **Location Context Sync** ✅
```
InputItem → SourceContext/DestinationContext 
→ useSourceContext/useDestinationContext 
→ BookingPage state
```

### 2. **Distance Calculation** ✅
```
Pickup Coords + Dropoff Coords 
→ Google Distance Matrix API 
→ Distance in KM 
→ Stored in state
```

### 3. **Dynamic Pricing** ✅
```
Distance + Vehicle Type (from CarListData) 
→ RateCalculate utility 
→ Base fare 
→ Per-person multiply 
→ Total price
```

### 4. **Vehicle Selection** ✅
```
CarListData vehicles 
→ Map to buttons 
→ Calculate fare for each 
→ Show real-time pricing 
→ Store selection
```

### 5. **Form Validation** ✅
```
Each step validates input 
→ Enable/disable next step 
→ Show error messages 
→ Prevent invalid submission
```

---

## Component Usage

| Component | Status | Purpose |
|-----------|--------|---------|
| `InputItem` | ✅ ACTIVE | Pickup/dropoff search |
| `DateTimePicker` | ✅ ACTIVE | Date & time selection |
| `PassengerForm` | ✅ ACTIVE | Passenger details |
| `PriceDisplay` | ✅ UPDATED | Price breakdown |
| `VehicleSelector` | ✅ OPTIONAL | Alternative vehicle display |
| `BookingPage` | ✅ NEW | Main coordinator |

---

## Context & Utility Usage

| Item | Status | Purpose |
|------|--------|---------|
| `SourceContext` | ✅ ACTIVE | Pickup location |
| `DestinationContext` | ✅ ACTIVE | Dropoff location |
| `LanguageContext` | ✅ ACTIVE | EN/TH support |
| `RateCalculate` | ✅ ACTIVE | Price computation |
| `CarListData` | ✅ ACTIVE | Vehicle list |
| `Google Maps API` | ✅ ACTIVE | Distance calculation |
| `Google Places API` | ✅ ACTIVE | Location autocomplete |

---

## Testing Workflow

```
START
  ↓
Visit /booking
  ↓
See "Select Your Route" screen
  ↓
Click on "📍 Pickup Location" input
  ↓
Type "Koh Samui" (suggestions appear)
  ↓
Select "Koh Samui Airport"
  ↓
Click on "📍 Drop-off Location" input
  ↓
Type "Chaweng" (suggestions appear)
  ↓
Select "Chaweng Beach"
  ↓
[Continue] button appears with distance
  ↓
Click [Continue]
  ↓
See vehicle selection with pricing
  ↓
Select a vehicle (e.g., Sedan)
  ↓
Continue through remaining steps
  ↓
Enter date, time, passengers, email, phone
  ↓
Review price breakdown
  ↓
Confirm booking
  ↓
See success page with reference number
  ↓
SUCCESS ✅
```

---

## Summary

✅ **BookingPage fully integrated with:**
- Google Places Autocomplete (InputItem)
- Location context sync (SourceContext, DestinationContext)
- Distance calculation (Google Distance Matrix)
- Vehicle selection (CarListData)
- Dynamic pricing (RateCalculate)
- Multi-step form validation
- Modern responsive UI

🎯 **Status:** Ready for testing and production use

