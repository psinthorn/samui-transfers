# Database Relationships Visualization
## Speedboat & Tour Service Architecture

**Document Version:** 1.0  
**Date:** December 7, 2025

---

## Complete Data Model Relationship Map

### ASCII Relationship Diagram (Complete Picture)

```
╔═════════════════════════════════════════════════════════════════════════════╗
║                      MULTI-SERVICE BOOKING ARCHITECTURE                      ║
╚═════════════════════════════════════════════════════════════════════════════╝

                              ┌──────────────────┐
                              │   USER (Auth)    │
                              └────────┬─────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
             ┌──────▼──────────┐                  ┌──────▼──────────┐
             │    BOOKING      │                  │    PAYMENT      │
             │   (Core TXN)    │                  │  (Transaction)  │
             └──────┬──────────┘                  └─────────────────┘
                    │
          ┌─────────┼─────────┐
          │         │         │
    ┌─────▼─┐  ┌───▼───┐  ┌──▼─────┐
    │ServiceId │ serviceType  │Parent/Child│
    │          │         │
    │          │         │
    ├─ TRANSFER (existing)
    │  └─────────────────────► ServiceRate
    │                             ├─► Driver (existing)
    │                             └─► PricingRule
    │
    ├─ BOAT (NEW)
    │  └────────────────────────┐
    │                            │
    │     ┌──────────────────────┘
    │     │
    │  ┌──▼──────────────────┐
    │  │ SpeedboatBooking    │
    │  ├─ speedboatId       │
    │  ├─ captainId         │
    │  ├─ passengerCount    │
    │  └─ tripType          │
    │         │
    │         ├──► Speedboat (Inventory)
    │         │      ├─ name, capacity
    │         │      ├─ status, location
    │         │      ├─ maintenanceUntil
    │         │      └─► SpeedboatRate
    │         │             ├─ basePrice
    │         │             ├─ duration
    │         │             ├─ fuelSurcharge
    │         │             └─ capacity pricing
    │         │
    │         └──► Driver (as Captain)
    │              ├─ isBoatOperator
    │              ├─ certifications
    │              └─► SpeedboatCaptainAssignment
    │                   ├─ license info
    │                   └─ safety training
    │
    ├─ TOUR (NEW)
    │  └────────────────────────┐
    │                            │
    │     ┌──────────────────────┘
    │     │
    │  ┌──▼──────────────────┐
    │  │  TourBooking        │
    │  ├─ tourPackageId     │
    │  ├─ tourScheduleId    │
    │  ├─ guideId           │
    │  ├─ totalParticipants │
    │  └─ specialRequests   │
    │         │
    │         ├──► TourPackage (Definition)
    │         │      ├─ name, duration
    │         │      ├─ tourType
    │         │      ├─ maxGroupSize
    │         │      ├─ departureLocation
    │         │      ├─ includedServices
    │         │      │
    │         │      ├──► TourLocation[]
    │         │      │      ├─ sequenceNumber
    │         │      │      ├─ latitude, longitude
    │         │      │      ├─ activity
    │         │      │      ├─ durationMinutes
    │         │      │      └─ imageUrl
    │         │      │
    │         │      ├──► TourRate[]
    │         │      │      ├─ minGroupSize, maxGroupSize
    │         │      │      ├─ pricePerPerson
    │         │      │      ├─ seasonalRate
    │         │      │      └─ addOnPrices
    │         │      │
    │         │      └──► TourSchedule[]
    │         │             ├─ tourDate
    │         │             ├─ departureTime
    │         │             ├─ maxCapacity
    │         │             ├─ bookedCapacity
    │         │             ├─ guideId
    │         │             └─ transportationType
    │         │
    │         ├──► TourSchedule
    │         │      └─► Driver (as Guide)
    │         │
    │         └──► Driver (Assigned Guide)
    │              ├─ isTourGuide
    │              └─ certifications
    │
    └─ EVENT (NEW)
       └────────────────────────┐
                                 │
          ┌──────────────────────┘
          │
       ┌──▼──────────────────┐
       │  EventBooking       │
       ├─ eventId           │
       ├─ totalGuests       │
       ├─ tierBooked        │
       ├─ guestNames[]      │
       └─ specialRequests   │
              │
              └──► SpecialEvent (Definition)
                     ├─ name, theme
                     ├─ venueType, venueLocation
                     ├─ startDate, endDate
                     ├─ maxCapacity
                     ├─ includedItems[]
                     ├─ entertainmentType[]
                     ├─ mealOption, barOption
                     │
                     └──► EventRate[]
                            ├─ tierName
                            ├─ pricePerPerson
                            ├─ minimumPartySize
                            └─ validFrom/Until

════════════════════════════════════════════════════════════════════════════
                            INDEX STRATEGY
════════════════════════════════════════════════════════════════════════════

BOOKING TABLE (Most Queried)
├─ Index on (userId, createdAt)
├─ Index on (status, createdAt)
├─ Index on (serviceType)
└─ Index on (parentBookingId) - for bundle queries

SPEEDBOAT TABLES
├─ Speedboat: status, homePort, boatType, maintenanceUntil
├─ SpeedboatBooking: bookingId, speedboatId, departureTime, status
└─ SpeedboatRate: speedboatId, serviceType, validFrom

TOUR TABLES
├─ TourPackage: tourType, departureTime, isPublished
├─ TourLocation: tourPackageId, sequenceNumber
├─ TourSchedule: tourPackageId, tourDate, isOpen
└─ TourBooking: bookingId, tourPackageId, tourScheduleId

EVENT TABLES
├─ SpecialEvent: venueType, startDate, isPublished
└─ EventBooking: bookingId, eventId, status

════════════════════════════════════════════════════════════════════════════
                          QUERY PATTERNS
════════════════════════════════════════════════════════════════════════════

COMMON QUERIES & THEIR INDEXES

1. Get User's All Bookings (Transfer + Boat + Tour + Event)
   Query: SELECT * FROM Booking WHERE userId = ? AND serviceType IN (...)
   Index: (userId, createdAt)

2. Get Available Speedboats on Date X
   Query: SELECT * FROM Speedboat WHERE status = 'AVAILABLE'
   Index: status

3. Get Tour Itinerary
   Query: SELECT * FROM TourLocation WHERE tourPackageId = ? ORDER BY sequenceNumber
   Index: (tourPackageId, sequenceNumber)

4. Get Available Tour Dates
   Query: SELECT * FROM TourSchedule WHERE tourPackageId = ? AND isOpen = true
   Index: (tourPackageId, isOpen, tourDate)

5. Find Events in Date Range
   Query: SELECT * FROM SpecialEvent WHERE startDate >= ? AND startDate <= ?
   Index: startDate

6. Get Boat Availability (No Maintenance)
   Query: SELECT * FROM Speedboat WHERE maintenanceUntil < NOW() AND status = 'AVAILABLE'
   Index: (maintenanceUntil, status)

════════════════════════════════════════════════════════════════════════════
```

---

## Service Type Decision Tree

```
                           ┌─────────────────┐
                           │  START BOOKING  │
                           └────────┬────────┘
                                    │
                        ┌───────────┴───────────┐
                        │                       │
                    ┌───▼────┐         ┌───────▼────┐
                    │ GROUND  │         │ NOT GROUND │
                    └───┬────┘         └───────┬────┘
                        │                      │
               ┌────────┼────────┐    ┌────────┼────────┐
               │                 │    │        │        │
         ┌─────▼──────┐    ┌─────▼────▼┐      │        │
         │ TRANSFER    │    │   COMBO  ├──────┘        │
         │             │    │          │               │
         │ Car-based   │    │ Multi-   │          ┌────▼─────┐
         │ point-to    │    │ Service  │          │ SINGLE   │
         │ point       │    │ Bundle   │          │ SERVICE  │
         │             │    │          │          │          │
         └─────────────┘    └──────────┘          └────┬─────┘
                                                       │
                               ┌───────────────────────┼───────────────────┐
                               │                       │                   │
                          ┌────▼────┐          ┌──────▼─────┐      ┌─────▼──────┐
                          │  BOAT    │          │   TOUR     │      │   EVENT    │
                          │          │          │            │      │            │
                          │ Speedboat│          │ Multi-stop │      │ Full Moon  │
                          │ day trip │          │ with guide │      │ Party, DJ  │
                          │ island   │          │ package    │      │ night,     │
                          │ hop      │          │            │      │ celebration│
                          └──────────┘          └────────────┘      └────────────┘

  Models Used: Booking +    Models Used: Booking +  Models Used: Booking +  Models Used: Booking +
               SpeedboatBooking + ServiceRate      TourBooking + TourRate   EventBooking + EventRate
               Speedboat + Driver                  TourPackage + Driver     SpecialEvent
```

---

## Pricing Calculation Flow

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    PRICING WORKFLOW BY SERVICE TYPE                         ║
╚════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════
TRANSFER BOOKING (Existing - No Changes)
═══════════════════════════════════════════════════════════════════════════

User Books Transfer
    ↓
Identify: distance, vehicleType, dateTime
    ↓
Look up ServiceRate WHERE vehicleType = ? AND serviceType = 'TRANSFER'
    ↓
Get: basePrice, perKmPrice, etc.
    ↓
Check PricingRule for modifiers (peak hour, seasonal, promo)
    ↓
Calculate: basePrice + (km × perKmPrice) × multiplier
    ↓
Total Price → Payment

═══════════════════════════════════════════════════════════════════════════
SPEEDBOAT BOOKING (New Service)
═══════════════════════════════════════════════════════════════════════════

User Selects Boat + Trip Type
    ↓
Identify: speedboatId, tripType, date, passengerCount
    ↓
Look up SpeedboatRate WHERE:
  - speedboatId = ?
  - serviceType = 'DAY_TRIP' (or ISLAND_HOPPING, etc.)
  - duration matches (e.g., 8 hours)
    ↓
Get: basePrice, pricePerPerson, fuelSurcharge, capacityDiscount
    ↓
Check PricingRule for seasonal multiplier
    ↓
Calculate:
  baseCost = basePrice + (passengerCount × pricePerPerson)
  fuelCost = distance × fuelSurcharge (if applicable)
  seasonalPrice = baseCost × seasonMultiplier
  capacityPrice = seasonalPrice - (seasonalPrice × capacityDiscount)
    ↓
Total Price → Payment

═══════════════════════════════════════════════════════════════════════════
TOUR BOOKING (New Service)
═══════════════════════════════════════════════════════════════════════════

User Selects Tour Package + Schedule
    ↓
Identify: tourPackageId, tourScheduleId, groupSize
    ↓
Check if override price exists on TourSchedule
  ├─ Yes: Use override price
  │   perPersonPrice = overridePrice
  │
  └─ No: Look up TourRate WHERE:
        - tourPackageId = ?
        - groupSize BETWEEN minGroupSize AND maxGroupSize
          ↓
        Get: pricePerPerson, seasonMultiplier
          ↓
        perPersonPrice = basePrice × seasonMultiplier
    ↓
Calculate add-ons (if selected):
  - Professional Photos: +price
  - Special Meals: +price
  - Equipment Rental: +price
    ↓
Total = (groupSize × pricePerPerson) + addOns
    ↓
Total Price → Payment

═══════════════════════════════════════════════════════════════════════════
EVENT BOOKING (New Service)
═══════════════════════════════════════════════════════════════════════════

User Selects Event + Ticket Tier + Guest Count
    ↓
Identify: eventId, tierName, totalGuests
    ↓
Look up EventRate WHERE:
  - eventId = ?
  - tierName = ?
  - NOW() BETWEEN validFrom AND validUntil
    ↓
Get: pricePerPerson, minimumPartySize
    ↓
Validate: totalGuests >= minimumPartySize
    ↓
Calculate: totalGuests × pricePerPerson
    ↓
Total Price → Payment

═══════════════════════════════════════════════════════════════════════════
BUNDLE BOOKING (Future: Multiple Services)
═══════════════════════════════════════════════════════════════════════════

User Creates Multi-Service Bundle
    ↓
Service 1: Transfer + Pricing
    Service 2: Boat + Pricing
    Service 3: Tour + Pricing
    ↓
Parent Booking (serviceType = PACKAGE)
    ├─ Child Booking 1 (TRANSFER)
    ├─ Child Booking 2 (BOAT)
    └─ Child Booking 3 (TOUR)
    ↓
Total = Sum of all child bookings
(Apply bundle discount if available)
    ↓
Single Payment for all services
```

---

## Capacity & Availability Calculation

```
╔════════════════════════════════════════════════════════════════════════════╗
║                         CAPACITY MANAGEMENT                                 ║
╚════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════
SPEEDBOAT AVAILABILITY
═══════════════════════════════════════════════════════════════════════════

Check if Speedboat Available on Date X:

1. Is boat in AVAILABLE status?
   └─ If NO → Not available

2. Is boat under maintenance?
   └─ If maintenanceUntil > requestedDate → Not available

3. How many existing bookings on that date?
   Count SpeedboatBooking WHERE:
     - speedboatId = ?
     - DATE(departureTime) = ?
     ↓
   totalBooked = SUM(passengerCount)

4. Calculate remaining capacity:
   remainingCapacity = speedboat.capacity - totalBooked
   ↓
   IF remainingCapacity >= requestedPassengers → AVAILABLE
   ELSE → NOT AVAILABLE

5. Check time slot conflict:
   IF existing booking overlaps in time → NOT AVAILABLE FOR THAT TIME

═══════════════════════════════════════════════════════════════════════════
TOUR SCHEDULE AVAILABILITY
═══════════════════════════════════════════════════════════════════════════

Check if Tour Date Available for Group Size:

1. Does TourSchedule exist for requested date?
   └─ If NO → Create if admin, else NOT AVAILABLE

2. Is tour marked as CANCELLED?
   └─ If YES → Not available

3. Is isOpen = true?
   └─ If NO → Not available (closed by admin)

4. Check capacity:
   availableSpots = maxCapacity - bookedCapacity
   ↓
   IF availableSpots >= requestedGroupSize → AVAILABLE
   ELSE → NOT AVAILABLE

5. Check group size constraints:
   tourMinGroupSize = tourPackage.minGroupSize
   tourMaxGroupSize = tourPackage.maxGroupSize
   
   IF requestedGroupSize < tourMinGroupSize OR
      requestedGroupSize > tourMaxGroupSize
   → NOT AVAILABLE

═══════════════════════════════════════════════════════════════════════════
EVENT AVAILABILITY
═══════════════════════════════════════════════════════════════════════════

Check if Event Accepting Registrations:

1. Is event CANCELLED?
   └─ If YES → Not available

2. Has event already occurred?
   IF NOW() > event.endDate → Not available

3. Check event capacity:
   registeredGuests = SUM(totalGuests) from EventBooking WHERE eventId = ?
   remainingSpots = event.maxCapacity - registeredGuests
   
   IF remainingSpots >= requestedGuests → AVAILABLE
   ELSE → SOLD OUT

4. Check ticket tier availability:
   FOR EACH tier in EVENT:
     IF NOW() BETWEEN tier.validFrom AND tier.validUntil → TIER AVAILABLE
     ELSE → TIER EXPIRED

════════════════════════════════════════════════════════════════════════════
```

---

## Driver/Staff Assignment Patterns

```
╔════════════════════════════════════════════════════════════════════════════╗
║                      DRIVER ROLE ASSIGNMENTS                                ║
╚════════════════════════════════════════════════════════════════════════════╝

One Driver Can Have Multiple Roles:

┌──────────────┐
│   Driver     │
├──────────────┤
│ id           │
│ name         │
│ isDriver     │  ─ Can operate cars
│ isBoatOperator    ─ Can captain speedboats
│ isTourGuide  │  ─ Can guide tours
│ certifications    ─ JSON with all certs
└──────────────┘

═══════════════════════════════════════════════════════════════════════════
ASSIGNMENT PATTERNS
═══════════════════════════════════════════════════════════════════════════

TRANSFER SERVICE (Existing):
Driver → DriverAssignment → Booking (TRANSFER)
  - Multiple assignments per driver (different bookings)
  - No historical record of captain/guide

SPEEDBOAT SERVICE (New):
Driver → SpeedboatCaptainAssignment → Speedboat
         (tracks certification, license validity)

Then during SpeedboatBooking:
  - Captain is assigned from certified operators of that boat
  - Historical record: who captained which trip

TOUR SERVICE (New):
Driver → TourSchedule (guide assignment per date)
  - Check isTourGuide = true
  - Check certifications (language, experience)

Then during TourBooking:
  - Guide is assigned from TourSchedule
  - Multiple tours per day possible

═══════════════════════════════════════════════════════════════════════════
CERTIFICATION TRACKING
═══════════════════════════════════════════════════════════════════════════

Driver.certifications = {
  "boatOperatorLicense": {
    "value": "THB12345",
    "expiryDate": "2025-12-31"
  },
  "safetyTraining": {
    "value": "CERTIFIED_2024",
    "expiryDate": "2026-01-15"
  },
  "tourGuideLanguages": [
    "ENGLISH",
    "GERMAN",
    "FRENCH"
  ],
  "carDrivingLicense": {
    "value": "DL123456",
    "expiryDate": "2026-05-10"
  }
}

Query: Get all certified boat captains available on Date X

SELECT d.* FROM Driver d
JOIN SpeedboatCaptainAssignment sca ON d.id = sca.captainId
WHERE sca.status = 'ACTIVE'
  AND sca.boatOperatorLicense = true
  AND sca.licenseExpiry > NOW()
  AND sca.safetyTraining = true
  AND sca.safetyTrainingExpiry > NOW()
  AND NOT EXISTS (
    SELECT 1 FROM SpeedboatBooking sb
    WHERE sb.captainId = d.id
    AND DATE(sb.departureTime) = ?
    AND sb.status IN ('CONFIRMED', 'IN_PROGRESS')
  )

════════════════════════════════════════════════════════════════════════════
```

---

## Status Flow Diagrams

```
╔════════════════════════════════════════════════════════════════════════════╗
║                        SERVICE BOOKING STATUS                               ║
╚════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════
TRANSFER BOOKING STATUS (Existing - No Changes)
═══════════════════════════════════════════════════════════════════════════

[PENDING] ──── User fills form, no payment yet
     ↓
[CONFIRMED] ── Payment received, booking locked in
     ↓
[IN_PROGRESS] ─ Driver assigned, on the way
     ↓
[COMPLETED] ── Trip done, finalized
     ↕
[CANCELLED] ── User or system cancelled (at any point)

═══════════════════════════════════════════════════════════════════════════
SPEEDBOAT BOOKING STATUS (New)
═══════════════════════════════════════════════════════════════════════════

[PENDING] ──── Speedboat booking created, awaiting payment
     ├─ Can cancel anytime
     └─ Captain not yet assigned
     ↓
[CONFIRMED] ── Payment complete, captain assigned
     ├─ Less than 24h before: can't cancel (refund policy)
     └─ Weather forecast monitored
     ↓
[IN_PROGRESS] ─ Departure time reached, trip started
     ├─ Safety checklist completed
     └─ Real-time tracking (boat location?)
     ↓
[COMPLETED] ── Return to port, trip finished
     ├─ Photos uploaded
     └─ Awaiting review
     ↕
[CANCELLED] ── Weather, maintenance, or user cancellation
              ├─ Full refund if < 48h notice
              ├─ Partial if >= 48h notice
              └─ No refund if < 24h notice

═══════════════════════════════════════════════════════════════════════════
TOUR BOOKING STATUS (New)
═══════════════════════════════════════════════════════════════════════════

[PENDING] ──── Tour selected, group size chosen
     ├─ TourSchedule availability checked
     └─ Final group count can change
     ↓
[CONFIRMED] ── Payment complete, guide assigned
     ├─ Guide language preference confirmed
     └─ Itinerary locked
     ↓
[IN_PROGRESS] ─ Tour departure time reached
     ├─ All participants accounted for
     └─ Guide starts itinerary
     ↓
[COMPLETED] ── Tour finished, back at return point
     ├─ Photos from guide uploaded
     └─ Awaiting review & rating
     ↕
[CANCELLED] ── Guide unavailable, bad weather, etc.
              └─ Refund based on cancellation policy

═══════════════════════════════════════════════════════════════════════════
EVENT BOOKING STATUS (New)
═══════════════════════════════════════════════════════════════════════════

[PENDING] ──── Event selected, tier chosen, guests registered
     ├─ Headcount can be adjusted before payment
     └─ Table/cabin not assigned yet
     ↓
[CONFIRMED] ── Payment complete, registration locked
     ├─ Venue assignment made
     └─ Ticketing confirmed
     ↓
[ATTENDED] ── Event date reached, guest checked in
     └─ Access to event provided
     ↓
[COMPLETED] ── Event finished
     ├─ Feedback requested
     └─ Photos from event available
     ↕
[CANCELLED] ── User or event cancellation
              └─ Refund based on event terms

════════════════════════════════════════════════════════════════════════════
```

---

## Data Integrity Rules

```
╔════════════════════════════════════════════════════════════════════════════╗
║                       REFERENTIAL INTEGRITY                                 ║
╚════════════════════════════════════════════════════════════════════════════╝

FOREIGN KEY CONSTRAINTS (ON DELETE CASCADE where noted):

Booking ──┐
          ├──→ SpeedboatBooking (FK: bookingId) [CASCADE]
          ├──→ TourBooking (FK: bookingId) [CASCADE]
          ├──→ EventBooking (FK: bookingId) [CASCADE]
          ├──→ Payment (FK: bookingId) [CASCADE]
          └──→ PaymentProof (FK: bookingId) [CASCADE]

Speedboat ────┐
              ├──→ SpeedboatBooking (FK: speedboatId) [CASCADE]
              ├──→ SpeedboatRate (FK: speedboatId) [CASCADE]
              └──→ SpeedboatCaptainAssignment (FK: speedboatId) [CASCADE]

TourPackage ──┐
              ├──→ TourLocation (FK: tourPackageId) [CASCADE]
              ├──→ TourRate (FK: tourPackageId) [CASCADE]
              ├──→ TourSchedule (FK: tourPackageId) [CASCADE]
              └──→ TourBooking (FK: tourPackageId) [CASCADE]

TourSchedule ─┬──→ TourBooking (FK: tourScheduleId) [CASCADE]
              └──→ Driver (FK: guideId) [SET NULL]

SpecialEvent ──┬──→ EventRate (FK: eventId) [CASCADE]
               └──→ EventBooking (FK: eventId) [CASCADE]

Driver ────┬──→ DriverAssignment (FK: driverId)
           ├──→ SpeedboatBooking (FK: captainId) [SET NULL]
           ├──→ SpeedboatCaptainAssignment (FK: captainId) [CASCADE]
           ├──→ TourSchedule (FK: guideId) [SET NULL]
           └──→ TourBooking (FK: guideId) [SET NULL]

VALIDATION RULES:

Speedboat:
  - capacity > crewSize (must have space for passengers)
  - If under maintenance: maintenanceUntil must be future date
  - registrationNumber must be unique

Tour Package:
  - maxGroupSize >= minGroupSize
  - duration > 0
  - TourLocation sequenceNumbers must be unique & sequential

Tour Schedule:
  - bookedCapacity <= maxCapacity (enforced by application)
  - tourDate must be future date (or equal to today)
  - departureTime must align with package departureTime

Special Event:
  - endDate >= startDate
  - maxCapacity > 0

Payment Rates:
  - All prices must be >= 0
  - seasonMultiplier must be > 0
  - If percentages: 0 <= percentage <= 100

════════════════════════════════════════════════════════════════════════════
```

---

## Query Performance Optimization

```
╔════════════════════════════════════════════════════════════════════════════╗
║                       INDEXING STRATEGY                                     ║
╚════════════════════════════════════════════════════════════════════════════╝

CRITICAL INDEXES (For Performance):

Booking:
  ├─ PRIMARY KEY: id
  ├─ UNIQUE: paymentId (one booking per transaction)
  ├─ INDEX: (userId, createdAt) ─ User's booking history
  ├─ INDEX: (status, createdAt) ─ Find pending bookings
  ├─ INDEX: (serviceType) ─ Filter by service
  └─ INDEX: (parentBookingId) ─ Bundle navigation

SpeedboatBooking:
  ├─ UNIQUE: bookingId (one speedboat booking per booking)
  ├─ INDEX: (speedboatId, departureTime) ─ Availability check
  ├─ INDEX: (departureTime, status) ─ Trip timeline queries
  └─ INDEX: (captainId, departureTime) ─ Captain schedule

TourBooking:
  ├─ UNIQUE: bookingId
  ├─ INDEX: (tourPackageId, tourScheduleId) ─ Tour date queries
  └─ INDEX: (guideId) ─ Guide's tour list

TourSchedule:
  ├─ UNIQUE: (tourPackageId, tourDate)
  ├─ INDEX: (tourDate, isOpen) ─ Available dates
  ├─ INDEX: (guideId) ─ Guide's schedule
  └─ INDEX: (tourDate DESC) ─ Upcoming tours

EventBooking:
  └─ UNIQUE: bookingId

SpecialEvent:
  ├─ INDEX: (startDate, isPublished) ─ Upcoming events
  └─ INDEX: (recurringPattern) ─ Event series

Speedboat:
  ├─ INDEX: (status) ─ Find available boats
  ├─ INDEX: (homePort) ─ Boats by location
  └─ INDEX: (maintenanceUntil) ─ Maintenance conflicts

TourPackage:
  ├─ INDEX: (tourType, isPublished) ─ Tour listings
  └─ INDEX: (departureTime) ─ Filter by trip time

════════════════════════════════════════════════════════════════════════════
```

---

## Audit & Compliance

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    AUDIT TRAIL REQUIREMENTS                                 ║
╚════════════════════════════════════════════════════════════════════════════╝

All models track:
  - createdAt: DateTime (creation timestamp)
  - updatedAt: DateTime (last modification timestamp)

Additional Audit Tracking:

1. BOOKING CHANGES
   Track: status changes, cancellations, reschedules
   Purpose: Refund policy enforcement, user communication

2. PAYMENT EVENTS
   Existing: PaymentWebhook table (already implemented)
   Captures: Stripe, PayPal webhook data

3. CREW CERTIFICATION CHANGES
   Track: When captain/guide certifications expire
   Alert: System notification when approaching expiry

4. AVAILABILITY CHANGES
   Track: When boats/dates become unavailable
   Alert: Notify pending bookings if trip cancelled

════════════════════════════════════════════════════════════════════════════
```

---

## Conclusion

This comprehensive relationship map ensures:

✅ **Data Integrity** - Referential constraints prevent orphaned records  
✅ **Performance** - Strategic indexing optimizes query patterns  
✅ **Scalability** - Service-agnostic design supports future expansion  
✅ **Auditability** - Timestamps and relationships provide full history  
✅ **Flexibility** - JSON fields allow attribute expansion without migrations  

