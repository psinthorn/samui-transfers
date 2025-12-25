# Speedboat & Tour Service Database Design
## Comprehensive Architecture for Multi-Service Platform

**Document Version:** 1.0  
**Date:** December 7, 2025  
**Status:** Design Phase (Ready for Implementation)  
**Scope:** Database schema expansion for speedboat services, tour packages, and special events

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture Analysis](#current-architecture-analysis)
3. [New Service Requirements](#new-service-requirements)
4. [Proposed Data Models](#proposed-data-models)
5. [Relationship Diagrams](#relationship-diagrams)
6. [Implementation Strategy](#implementation-strategy)
7. [Migration Plan](#migration-plan)
8. [Backward Compatibility](#backward-compatibility)
9. [Future Extensibility](#future-extensibility)

---

## Executive Summary

### Current State
The system currently handles **transfer bookings** (car-based ground transportation):
- 1 Booking model for all transfers
- ServiceRate keyed on vehicleType (sedan, SUV, minibus)
- Driver assignment for route execution
- Pricing via ServiceRate + PricingRule

### Requested Expansion
Add three new service categories:
1. **Speedboat Services** - One-day trips, island tours, special events
2. **Tour Packages** - Multi-destination experiences with guides
3. **Special Events** - Full-moon party, themed experiences

### Proposed Approach
**Multi-Service Generic Model** with service-type discrimination:
- Extend existing Booking model with `serviceType` field (TRANSFER, BOAT, TOUR, EVENT)
- Create service-specific data models for boat/tour details
- Link each booking to appropriate service details table
- Keep pricing flexible per service type via enhanced ServiceRate model
- Enable booking bundles (e.g., transfer + tour)

### Key Benefits
✅ Minimal schema disruption (backward compatible)  
✅ Reusable booking/payment infrastructure  
✅ Flexible pricing per service type  
✅ Support for multi-service transactions  
✅ Clear audit trail via booking associations  

---

## Current Architecture Analysis

### Existing Models That Will Be Extended

#### **Booking Model** (Core Transaction Entity)
```
Current purpose: Ground transportation (transfers)
Current fields: userId, startLocation, endLocation, scheduledTime, status, paymentStatus, etc.

Extension plan: Add serviceType enum to discriminate service type
New field: serviceType (TRANSFER, BOAT, TOUR, EVENT)
New field: serviceId (references service-specific model)
New field: guidedByDriver (boolean - true for tours with guides)
```

#### **ServiceRate Model** (Pricing)
```
Current structure: vehicleType, basePrice, perKmPrice, etc.
Current usage: Only for TRANSFER bookings

Extension plan: 
- Add serviceType field (TRANSFER, BOAT, TOUR, EVENT)
- Rename vehicleType to vehicleOrServiceType
- Add serviceCategory field
Examples:
  - {serviceType: TRANSFER, vehicleOrServiceType: "sedan", basePrice: 400}
  - {serviceType: BOAT, vehicleOrServiceType: "speedboat_6person", basePrice: 2000}
  - {serviceType: TOUR, vehicleOrServiceType: "island_tour", basePrice: 1500}
```

#### **Driver Model** (Service Providers)
```
Current purpose: Car drivers
Extension plan:
- Add isBoatOperator boolean (for speedboat captains)
- Add isTourGuide boolean (for tour guides)
- Add isCertified boolean + certifications Json field
- Map boat operators to Speedboat model via new relationship

Example: A person can be both car driver AND tour guide
```

#### **DriverAssignment Model**
```
Current purpose: Assign drivers to transfers
Extension plan:
- Keep as-is for transfers
- Add support for boat assignments (captain)
- Add support for tour assignments (guide)
```

#### **Payment Model** (Transactions)
```
Current: Works for all payment types (Stripe, PayPal, Bank Transfer, Cash)
Extension: No changes needed - already generic by design
```

---

## New Service Requirements Analysis

### 1. Speedboat Services

**Business Requirements:**
- Inventory management (multiple boats)
- Capacity tracking (different boat sizes: 6-person, 12-person, etc.)
- Maintenance scheduling (downtime tracking)
- Location tracking (which island/port)
- Operator assignment (captain + crew)
- Fuel/cost calculations
- Weather-based cancellations
- Safety equipment verification

**Key Features:**
- One-day trip bookings (morning, afternoon, evening)
- Island-hopping tours
- Special events (full moon party, birthday parties)
- Premium experiences (sunset cruises, snorkeling trips)

**Pricing Model:**
- Base price (by boat type and duration)
- Fuel surcharge (per trip or per km traveled)
- Capacity discount/premium (fewer/more people)
- Peak season pricing (using existing PricingRule model)
- Additional services (meals, drinks, equipment rental)

### 2. Tour Packages

**Business Requirements:**
- Multi-destination itineraries (3-5 stops per tour)
- Flexible duration (half-day, full-day, multi-day)
- Group capacity (different package sizes)
- Transportation method (transfer, boat, or combination)
- Guide assignment
- Accommodation options (for multi-day)
- Meal plan options
- Activity inclusions (snorkeling, massage, etc.)

**Key Features:**
- Pre-packaged tours (popular routes/times)
- Custom tours (user-defined itineraries)
- Tour scheduling (available dates/times)
- Location stops with descriptions and photos
- Activity recommendations per stop

**Pricing Model:**
- Base package price (by type and duration)
- Per-person pricing (capacity-based)
- Optional add-ons (activities, meals, photos)
- Seasonal pricing multipliers
- Group discounts

### 3. Special Events

**Business Requirements:**
- Event details and schedule
- Capacity and occupancy tracking
- Theme/activity information
- Food and beverage options
- Entertainment/DJ information
- Timing and duration

**Key Features:**
- Full Moon Party bookings
- Themed boat parties
- Birthday/celebration packages
- Wedding ceremonies/receptions
- Corporate events

**Pricing Model:**
- Tiered pricing (early bird, regular, last-minute)
- Per-person or package pricing
- VIP table/cabin pricing
- Open bar vs pay-as-you-go

---

## Proposed Data Models

### 1. SERVICE TYPE ENUMERATION

**Rationale:** Discriminate different booking types at the application level

```prisma
enum ServiceType {
  TRANSFER      // Car-based ground transportation (existing)
  BOAT          // Speedboat day trips and island tours
  TOUR          // Multi-destination guided tours
  EVENT         // Special events (full moon party, etc.)
  PACKAGE       // Combined services (transfer + tour, etc.)
}
```

### 2. SPEEDBOAT MODELS

#### **Speedboat** - Inventory Management
```prisma
model Speedboat {
  id                String    @id @default(cuid())
  name              String    // "Speed Boat A", "Express II", etc.
  boatType          String    // "6-person", "12-person", "luxury", etc.
  
  // Specifications
  capacity          Int       // Maximum passengers
  crewSize          Int       // Captain + crew required
  length            Decimal   // Length in meters
  color             String?   // Boat color/identifier
  registrationNumber String? @unique  // Boat registration ID
  
  // Location & Operations
  homePort          String    // Base location (e.g., "Koh Samui Marina")
  currentLocation   String?   // Current location
  
  // Status & Availability
  status            String @default("AVAILABLE")  // AVAILABLE, MAINTENANCE, RETIRED, OUT_OF_SERVICE
  maintenanceUntil  DateTime?
  
  // Operational Details
  manufacturerYear  Int?
  lastMaintenanceDate DateTime?
  nextMaintenanceDate DateTime?
  maintenanceNotes  String?   // JSON or text for maintenance history
  
  // Safety & Compliance
  safetyInspectionDate DateTime?
  safetyInspectionValid Boolean @default(true)
  safetyEquipmentList Json?   // Required equipment checklist
  insuranceExpiry   DateTime?
  
  // Fuel & Consumption
  fuelType          String    // "Petrol", "Diesel", "Electric"
  fuelCapacity      Decimal   // Liters
  fuelConsumption   Decimal?  // Liters per km (estimated)
  
  // Pricing Reference
  speedboatRates    SpeedboatRate[]
  
  // Bookings
  speedboatBookings SpeedboatBooking[]
  
  // Captain/Crew Assignments
  captainAssignments SpeedboatCaptainAssignment[]
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([status])
  @@index([homePort])
  @@index([boatType])
  @@index([maintenanceUntil])
}
```

#### **SpeedboatRate** - Pricing
```prisma
model SpeedboatRate {
  id                String    @id @default(cuid())
  speedboatId       String
  speedboat         Speedboat @relation(fields: [speedboatId], references: [id], onDelete: Cascade)
  
  // Service Details
  serviceType       String    // "DAY_TRIP", "ISLAND_HOPPING", "SPECIAL_EVENT"
  duration          Int       // Minutes (e.g., 480 for 8-hour trip)
  
  // Pricing
  basePrice         Decimal   // Base price for standard conditions
  pricePerPerson    Decimal?  // If applicable
  
  // Capacity Pricing
  minCapacity       Int       // Minimum number of people to book
  maxCapacity       Int       // Maximum (usually boat capacity)
  capacityDiscount  Decimal?  // Percentage discount for full capacity
  
  // Surcharges
  fuelSurcharge     Decimal?  // Additional fuel cost per km or per trip
  crewCost          Decimal?  // Captain + crew cost (may be included in base)
  
  // Peak Season
  isSeasonalRate    Boolean @default(false)
  seasonStart       Int?      // Month (1-12)
  seasonEnd         Int?
  seasonMultiplier  Decimal @default(1.0)  // 1.0 = no change, 1.2 = 20% increase
  
  // Active Period
  validFrom         DateTime  @default(now())
  validUntil        DateTime?
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([speedboatId])
  @@index([serviceType])
  @@index([validFrom])
}
```

#### **SpeedboatBooking** - Booking Details
```prisma
model SpeedboatBooking {
  id                String    @id @default(cuid())
  bookingId         String    @unique
  booking           Booking   @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  
  speedboatId       String
  speedboat         Speedboat @relation(fields: [speedboatId], references: [id])
  
  // Trip Details
  tripType          String    // "DAY_TRIP", "ISLAND_HOPPING", "SUNSET_CRUISE", etc.
  departureTime     DateTime
  returnTime        DateTime
  departurePort     String
  returnPort        String
  estimatedDistance Decimal?  // KM
  
  // Passenger Details
  passengerCount    Int
  specialRequests   String?   // Dietary, accessibility, etc.
  
  // Crew Assignment
  captainId         String?
  captain           Driver?   @relation("SpeedboatBookingCaptain", fields: [captainId], references: [id])
  
  // Additional Services
  mealIncluded      Boolean @default(false)
  mealType          String?   // "LIGHT_SNACKS", "LUNCH", "DINNER", "FULL_BAR"
  equipmentRental   String?   // "SNORKEL_GEAR", "LIFE_JACKET", etc. (JSON array)
  
  // Status & Tracking
  status            String @default("PENDING")  // PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
  cancellationReason String?
  cancellationTime  DateTime?
  
  // Weather/Safety Notes
  weatherCancelled  Boolean @default(false)
  weatherNote       String?
  safetyChecklist   Json?     // Pre-departure safety checklist
  
  // Photos/Media
  photoUrl          String?   // For post-trip photos/gallery
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([bookingId])
  @@index([speedboatId])
  @@index([departureTime])
  @@index([status])
  @@index([captainId])
}
```

#### **SpeedboatCaptainAssignment** - Crew Management
```prisma
model SpeedboatCaptainAssignment {
  id                String    @id @default(cuid())
  speedboatId       String
  speedboat         Speedboat @relation(fields: [speedboatId], references: [id], onDelete: Cascade)
  
  captainId         String
  captain           Driver    @relation("SpeedboatCaptainAssignments", fields: [captainId], references: [id], onDelete: Cascade)
  
  // Assignment Details
  assignedDate      DateTime  @default(now())
  status            String @default("ACTIVE")  // ACTIVE, ON_LEAVE, RETIRED
  
  // Certification
  boatOperatorLicense Boolean @default(false)
  licenseExpiry     DateTime?
  safetyTraining    Boolean @default(false)
  safetyTrainingExpiry DateTime?
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@unique([speedboatId, captainId, assignedDate])
  @@index([captainId])
  @@index([status])
}
```

---

### 3. TOUR MODELS

#### **TourPackage** - Tour Definition
```prisma
model TourPackage {
  id                String    @id @default(cuid())
  name              String    // "Island Hopping Tour", "Full Day Temple Tour", etc.
  slug              String    @unique  // URL slug
  
  // Description
  description       String?   // Rich text description
  summary           String?   // Short summary for listing
  
  // Type & Duration
  tourType          String    // "ISLAND_HOPPING", "CULTURAL", "ADVENTURE", "LUXURY", "THEMED"
  duration          Int       // Total duration in minutes
  durationDays      Int @default(1)  // 1 for day tour, > 1 for multi-day
  
  // Capacity
  minGroupSize      Int @default(1)
  maxGroupSize      Int       // Maximum tour group size
  defaultGroupSize  Int       // Recommended group size
  
  // Coverage & Location
  islandsCovered    String[]  // ["Koh Samui", "Koh Phangan", "Koh Tao"]
  departureLocation String
  returnLocation    String?   // If different from departure
  
  // Schedule
  availableDays     String[]  // ["MONDAY", "TUESDAY", ...] or "DAILY"
  departureTime     String    // "08:00", "09:30", etc.
  returnTime        String    // Estimated return time
  
  // Season Availability
  seasonalAvailability Boolean @default(true)
  seasonStart       Int?      // Month (1-12)
  seasonEnd         Int?
  offSeasonAvailable Boolean @default(false)
  
  // Services Included
  includedServices  String[]  // ["MEALS", "GUIDE", "TRANSPORTATION", "SNORKEL_GEAR", "INSURANCE"]
  excludedServices  String[]? // What's NOT included
  
  // Image & Media
  imageUrl          String?   // Main tour image
  gallery           String[]? // Additional images
  
  // Status
  isPublished       Boolean @default(true)
  isActive          Boolean @default(true)
  
  // Pricing
  tourRates         TourRate[]
  
  // Locations (tour stops)
  locations         TourLocation[]
  
  // Bookings
  tourBookings      TourBooking[]
  
  // Schedule/Availability
  schedules         TourSchedule[]
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([tourType])
  @@index([isPublished])
  @@index([departureTime])
  @@index([maxGroupSize])
}
```

#### **TourLocation** - Tour Stops/Attractions
```prisma
model TourLocation {
  id                String    @id @default(cuid())
  tourPackageId     String
  tourPackage       TourPackage @relation(fields: [tourPackageId], references: [id], onDelete: Cascade)
  
  // Location Details
  name              String    // "Big Buddha Temple", "Nathon Pier", etc.
  description       String?
  type              String    // "TEMPLE", "BEACH", "PIER", "RESTAURANT", "SHOP", "VIEWPOINT"
  
  // Order in Itinerary
  sequenceNumber    Int       // 1, 2, 3, etc.
  
  // Geography
  latitude          Decimal   // GPS coordinates
  longitude         Decimal
  island            String?   // "Koh Samui", "Koh Phangan", etc.
  
  // Duration at Location
  durationMinutes   Int?      // How long visitors typically spend
  arrivalTime       String?   // Estimated time (in "HH:MM" format relative to start)
  
  // Activity & Experience
  activity          String?   // "TEMPLE_VISIT", "BEACH_SWIM", "SNORKELING", "SHOPPING", "MEAL"
  activityDuration  Int?      // Minutes for activity
  
  // Image & Info
  imageUrl          String?
  notes             String?
  
  // Status
  isFeatured        Boolean @default(false)
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@unique([tourPackageId, sequenceNumber])
  @@index([tourPackageId])
  @@index([type])
}
```

#### **TourRate** - Pricing
```prisma
model TourRate {
  id                String    @id @default(cuid())
  tourPackageId     String
  tourPackage       TourPackage @relation(fields: [tourPackageId], references: [id], onDelete: Cascade)
  
  // Group Size & Pricing
  minGroupSize      Int       // Pricing valid for this group size minimum
  maxGroupSize      Int       // Up to this group size
  pricePerPerson    Decimal   // Price per person
  minimumGroupPrice Decimal?  // Minimum total price
  
  // Peak Season
  isSeasonalRate    Boolean @default(false)
  seasonStart       Int?      // Month (1-12)
  seasonEnd         Int?
  seasonMultiplier  Decimal @default(1.0)
  
  // Add-ons (individual pricing)
  mealAddon         Decimal?  // If meals not included
  photographyAddon  Decimal?  // Professional photos
  transportAddon    Decimal?  // Extra transport
  
  // Active Period
  validFrom         DateTime  @default(now())
  validUntil        DateTime?
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([tourPackageId])
  @@index([minGroupSize, maxGroupSize])
  @@index([validFrom])
}
```

#### **TourSchedule** - Tour Dates & Availability
```prisma
model TourSchedule {
  id                String    @id @default(cuid())
  tourPackageId     String
  tourPackage       TourPackage @relation(fields: [tourPackageId], references: [id], onDelete: Cascade)
  
  // Schedule Date
  tourDate          DateTime  // The date of the tour
  departureTime     DateTime  // Full datetime with time
  
  // Capacity
  maxCapacity       Int       // How many spots available for this date
  bookedCapacity    Int @default(0)  // How many already booked
  
  // Pricing Override (if different from standard rate)
  overridePrice     Decimal?  // If null, use TourRate
  
  // Status & Control
  isOpen            Boolean @default(true)  // Can be booked
  isCancelled       Boolean @default(false)
  cancellationReason String?
  notes             String?
  
  // Guide Assignment
  guideId           String?
  guide             Driver?   @relation(fields: [guideId], references: [id])
  
  // Transportation
  transportationType String? // "TRANSFER", "BOAT", "BOTH"
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@unique([tourPackageId, tourDate])
  @@index([tourPackageId])
  @@index([tourDate])
  @@index([isOpen])
}
```

#### **TourBooking** - Tour Booking Details
```prisma
model TourBooking {
  id                String    @id @default(cuid())
  bookingId         String    @unique
  booking           Booking   @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  
  tourPackageId     String
  tourPackage       TourPackage @relation(fields: [tourPackageId], references: [id])
  
  tourScheduleId    String
  tourSchedule      TourSchedule @relation(fields: [tourScheduleId], references: [id])
  
  // Passenger Details
  totalParticipants Int
  childrenCount     Int @default(0)
  adultsCount       Int @default(0)
  
  // Special Requirements
  specialRequests   String?   // Dietary, accessibility, preferences
  pickupLocation    String?   // If transfer included
  
  // Guide Assignment
  guideId           String?   // Assigned tour guide
  guide             Driver?   @relation("TourBookingGuides", fields: [guideId], references: [id])
  
  // Add-ons Purchased
  addOnServices     String[]? // ["PROFESSIONAL_PHOTOS", "BREAKFAST", "SNORKEL_GEAR"]
  
  // Status
  status            String @default("PENDING")  // PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
  cancellationReason String?
  cancellationTime  DateTime?
  
  // Feedback
  rating            Int?      // 1-5 stars
  review            String?
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([bookingId])
  @@index([tourPackageId])
  @@index([tourScheduleId])
  @@index([status])
  @@index([guideId])
}
```

---

### 4. SPECIAL EVENT MODELS

#### **SpecialEvent** - Event Definition
```prisma
model SpecialEvent {
  id                String    @id @default(cuid())
  name              String    // "Full Moon Party", "Sunset DJ Cruise", etc.
  slug              String    @unique
  
  // Description
  description       String?
  summary           String?
  theme             String?   // "BEACH_PARTY", "DJ_NIGHT", "CELEBRATION", "CULTURAL", etc.
  
  // Venue & Location
  venueType         String    // "SPEEDBOAT", "BEACH", "RESORT", "ISLAND", "MULTIPLE"
  venueLocation     String    // Location/venue name
  
  // Schedule
  startDate         DateTime
  endDate           DateTime
  
  // Frequency (optional)
  isRecurring       Boolean @default(false)
  recurringPattern  String?   // "MONTHLY", "WEEKLY", "FULL_MOON", "CUSTOM"
  
  // Capacity
  maxCapacity       Int
  registrationFee   Decimal   // Per person
  
  // What's Included
  includedItems     String[]  // ["WELCOME_DRINK", "FOOD", "DJ", "LIVE_MUSIC", "GAMES", "TRANSPORT"]
  
  // Entertainment
  entertainmentType String[]? // ["DJ", "LIVE_BAND", "PERFORMER", "GAMES"]
  performerDetails  String?   // Details about performers
  
  // Food & Beverage
  mealOption        String?   // "INCLUDED", "AVAILABLE", "PAID"
  barOption         String?   // "OPEN_BAR", "SPONSORED", "CASH_BAR"
  
  // Image & Marketing
  imageUrl          String?
  gallery           String[]?
  
  // Status
  isPublished       Boolean @default(true)
  isActive          Boolean @default(true)
  
  // Pricing
  eventRates        EventRate[]
  
  // Bookings
  eventBookings     EventBooking[]
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([venueType])
  @@index([startDate])
  @@index([isPublished])
  @@index([recurringPattern])
}
```

#### **EventRate** - Pricing (Tiered)
```prisma
model EventRate {
  id                String    @id @default(cuid())
  eventId           String
  event             SpecialEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  // Pricing Tier
  tierName          String    // "EARLY_BIRD", "REGULAR", "LAST_MINUTE", "VIP"
  description       String?
  
  // Dates
  validFrom         DateTime
  validUntil        DateTime
  
  // Pricing
  pricePerPerson    Decimal
  minimumPartySize  Int @default(1)
  
  // Status
  isActive          Boolean @default(true)
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([eventId])
  @@index([validFrom, validUntil])
}
```

#### **EventBooking** - Event Registration
```prisma
model EventBooking {
  id                String    @id @default(cuid())
  bookingId         String    @unique
  booking           Booking   @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  
  eventId           String
  event             SpecialEvent @relation(fields: [eventId], references: [id])
  
  // Guest Details
  totalGuests       Int
  guestNames        String[]? // Array of guest names
  
  // Booking Details
  tierBooked        String    // "EARLY_BIRD", "REGULAR", etc.
  tableNumber       String?   // For seated events
  specialRequests   String?   // "VEG_MEALS", "NO_ALCOHOL", etc.
  
  // Status
  status            String @default("PENDING")  // PENDING, CONFIRMED, ATTENDED, CANCELLED
  checkInTime       DateTime?
  cancellationReason String?
  
  // Feedback
  rating            Int?      // 1-5 stars
  review            String?
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([bookingId])
  @@index([eventId])
  @@index([status])
}
```

---

### 5. ENHANCED EXISTING MODELS

#### **Booking Model Updates**
```prisma
model Booking {
  // ... existing fields ...
  
  // NEW FIELDS FOR MULTI-SERVICE SUPPORT
  serviceType       ServiceType @default(TRANSFER)  // TRANSFER, BOAT, TOUR, EVENT, PACKAGE
  serviceId         String?     // ID of service-specific booking (speedboatBookingId, tourBookingId, etc.)
  
  // Service-Specific Relations
  speedboatBooking  SpeedboatBooking?
  tourBooking       TourBooking?
  eventBooking      EventBooking?
  
  // Multi-Service Support
  isBundle          Boolean @default(false)  // true if combining services
  parentBookingId   String?     // For bundled bookings, reference parent
  childBookings     Booking[] @relation("BundledBookings", fields: [parentBookingId], references: [id])
  
  // Existing fields remain unchanged...
  userId            String
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  paymentId         String?
  payment           Payment?    @relation(fields: [paymentId], references: [id])
  
  // ... rest of existing Booking fields ...
}
```

#### **Driver Model Updates**
```prisma
model Driver {
  // ... existing fields ...
  
  // BOAT & TOUR CAPABILITIES
  isBoatOperator    Boolean @default(false)
  isTourGuide       Boolean @default(false)
  
  // Certifications
  certifications    Json?   // {"boatLicense": "...", "safetyTraining": "..."}
  
  // Relations
  speedboatAssignments SpeedboatCaptainAssignment[] @relation("SpeedboatCaptainAssignments")
  tourScheduleGuides TourSchedule[] @relation("TourGuides")
  tourBookingGuides TourBooking[] @relation("TourBookingGuides")
  speedboatBookingCaptains SpeedboatBooking[] @relation("SpeedboatBookingCaptain")
  
  // ... rest of existing Driver fields ...
}
```

#### **ServiceRate Model Updates**
```prisma
model ServiceRate {
  // ... existing fields ...
  
  // ENHANCED FOR MULTI-SERVICE PRICING
  serviceType       ServiceType @default(TRANSFER)  // New field
  
  // Existing vehicleType renamed conceptually to handle boat/tour types
  vehicleOrServiceType String  // "sedan", "speedboat_6person", "island_tour", etc.
  
  // ... rest of existing ServiceRate fields ...
}
```

---

## Relationship Diagrams

### Service Type Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                        BOOKING (Core)                        │
│  (Updated: Add serviceType, serviceId, bundling support)     │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┬──────────┐
        │          │          │          │
    TRANSFER    BOAT       TOUR      EVENT
    (existing) (new)      (new)      (new)
        │          │          │          │
        │          ↓          ↓          ↓
   ServiceRate SpeedboatBooking TourBooking EventBooking
                   │          │          │
                   ↓          ↓          ↓
              Speedboat  TourPackage SpecialEvent
                   │      (+ Locations)
                   ↓
              Driver (as Captain/Guide)
```

### Speedboat Service Graph

```
Speedboat (Inventory)
├── SpeedboatRate (Pricing)
├── SpeedboatBooking (Booking Details)
│   ├── Booking (Transaction)
│   └── Driver (Captain)
└── SpeedboatCaptainAssignment (Crew Management)
    └── Driver
```

### Tour Service Graph

```
TourPackage (Tour Definition)
├── TourRate (Pricing)
├── TourLocation (Itinerary Stops)
├── TourSchedule (Date/Time Slots)
│   └── Driver (Guide)
└── TourBooking (Booking Details)
    ├── Booking (Transaction)
    ├── TourSchedule
    └── Driver (Guide)
```

### Special Event Graph

```
SpecialEvent (Event Definition)
├── EventRate (Tiered Pricing)
└── EventBooking (Registration)
    └── Booking (Transaction)
```

---

## Implementation Strategy

### Phase 1: Database Schema Extension (1 day)

**Step 1: Create Migration**
```bash
npm run prisma:migration-create "add_speedboat_tour_event_services"
```

**Step 2: Update `prisma/schema.prisma`**
- Add `ServiceType` enum
- Add 4 speedboat models (Speedboat, SpeedboatRate, SpeedboatBooking, SpeedboatCaptainAssignment)
- Add 4 tour models (TourPackage, TourLocation, TourRate, TourSchedule, TourBooking)
- Add 2 event models (SpecialEvent, EventRate, EventBooking)
- Update Booking model (add serviceType, serviceId, bundling fields)
- Update Driver model (add boat/tour capabilities)
- Update ServiceRate model (add serviceType field)

**Step 3: Apply Migration**
```bash
npm run prisma:migrate-dev
```

**Step 4: Regenerate Prisma Client**
```bash
npm run prisma:generate
```

### Phase 2: API Endpoint Implementation (2-3 days)

**New API Endpoints:**

**Speedboat Management:**
- `POST /api/admin/speedboats` - Create boat
- `GET /api/admin/speedboats` - List boats
- `PUT /api/admin/speedboats/[id]` - Update boat
- `DELETE /api/admin/speedboats/[id]` - Retire boat
- `POST /api/admin/speedboats/[id]/rates` - Add boat pricing

**Speedboat Bookings:**
- `POST /api/bookings/speedboat` - Create speedboat booking
- `GET /api/bookings/speedboat/[id]` - Get booking details
- `PUT /api/bookings/speedboat/[id]` - Update booking
- `POST /api/bookings/speedboat/[id]/cancel` - Cancel with reason

**Tour Management:**
- `POST /api/admin/tours` - Create tour package
- `GET /api/admin/tours` - List all tours
- `PUT /api/admin/tours/[id]` - Update tour
- `POST /api/admin/tours/[id]/locations` - Add location to itinerary
- `POST /api/admin/tours/[id]/rates` - Add pricing tier
- `POST /api/admin/tours/[id]/schedules` - Create tour date

**Tour Bookings:**
- `POST /api/bookings/tour` - Book tour
- `GET /api/bookings/tour/[id]` - Get booking details
- `POST /api/bookings/tour/[id]/review` - Submit review

**Event Management:**
- `POST /api/admin/events` - Create event
- `GET /api/admin/events` - List events
- `POST /api/admin/events/[id]/rates` - Add pricing tier

**Event Bookings:**
- `POST /api/bookings/event` - Register for event
- `GET /api/bookings/event/[id]` - Get registration

### Phase 3: Frontend Components (2-3 days)

**New Components:**
- `SpeedboatServiceSelector` - Choose boat type and trip
- `SpeedboatTripDetails` - Pick date, time, location
- `SpeedboatReviewForm` - Rate and review
- `TourPackageCard` - Display tour in listings
- `TourItineraryDisplay` - Show stops and timeline
- `TourBookingForm` - Select tour and group size
- `EventCard` - Display special event
- `EventRegistrationForm` - Register guests

**Updated Components:**
- `BookingFlow` - Add service type selection step
- `ServiceSelector` - Choose TRANSFER, BOAT, TOUR, or EVENT
- `PaymentProcessor` - Handle multi-service pricing

### Phase 4: Admin Dashboard (1-2 days)

**New Admin Pages:**
- `/admin/speedboats` - Manage boat inventory
- `/admin/tours` - Manage tour packages
- `/admin/events` - Manage special events
- `/admin/boat-captains` - Assign captains to boats
- `/admin/tour-guides` - Assign guides to tours

**Updated Admin Pages:**
- `/admin/bookings` - Filter by service type
- `/admin/drivers` - Add boat/tour capability flags

### Phase 5: Testing & QA (1-2 days)

- Unit tests for new models and services
- Integration tests for booking flows
- API endpoint testing
- Frontend component testing
- Payment processing with new service types
- Edge cases (cancellations, refunds, scheduling conflicts)

---

## Migration Plan

### Step-by-Step Execution

#### 1. Backup Current Database
```bash
# Export current schema state
pg_dump samui_transfers > backup_before_expansion.sql
```

#### 2. Create and Apply Migration

**File:** `prisma/migrations/[timestamp]_add_speedboat_tour_event_services/migration.sql`

The migration will:
- Add `ServiceType` enum type
- Create 10 new tables (Speedboat, TourPackage, TourLocation, TourRate, TourSchedule, TourBooking, SpecialEvent, EventRate, EventBooking, SpeedboatRate, SpeedboatBooking, SpeedboatCaptainAssignment)
- Add columns to existing Booking table
- Add columns to existing Driver table
- Add columns to existing ServiceRate table
- Create necessary indexes
- Add constraints and relationships

#### 3. Data Migration Script (if any existing data needs transformation)

Since this is a new feature (no existing boat/tour data), no data transformation needed.

#### 4. Validation

```bash
# Test schema validity
npm run prisma:validate

# Generate Prisma Client
npm run prisma:generate

# Run tests
npm test
```

#### 5. Seed Initial Data (Optional)

Create seeders for:
- Sample speedboats (3-5 boats with different capacities)
- Sample tour packages (5-10 popular tours)
- Sample special events (upcoming full moon parties, DJ nights)

---

## Backward Compatibility

### What Stays the Same ✅

1. **Existing Transfer Bookings**
   - All current bookings remain in Booking table
   - ServiceType defaults to TRANSFER
   - No breaking changes to existing API calls

2. **Payment Processing**
   - All payment methods work unchanged
   - Payment model needs no modifications
   - Existing payment flow continues

3. **User Authentication**
   - No changes to user authentication
   - User model remains unchanged

4. **Driver System**
   - Existing car driver data remains unchanged
   - New fields (isBoatOperator, isTourGuide) default to false
   - No breaking changes for existing drivers

### Migration Path for Frontend

**Old API calls still work:**
```javascript
// Existing transfer booking - still works
POST /api/bookings/transfer
{
  "startLocation": "Airport",
  "endLocation": "Resort"
}

// Will be internally:
// serviceType: "TRANSFER"
// serviceId: null (no separate model)
```

**New API calls for new services:**
```javascript
// New speedboat booking
POST /api/bookings/speedboat
{
  "speedboatId": "...",
  "departureTime": "..."
}

// New tour booking
POST /api/bookings/tour
{
  "tourPackageId": "...",
  "tourScheduleId": "..."
}
```

### Phased Rollout

**Phase 1:** Deploy speedboat booking system
**Phase 2:** Deploy tour booking system (after speedboat stable)
**Phase 3:** Deploy special event system (after tours stable)

Each phase can be independently toggled via feature flags:
```javascript
const features = {
  SPEEDBOAT_BOOKINGS: true,
  TOUR_BOOKINGS: false,  // enable later
  EVENT_BOOKINGS: false, // enable later
}
```

---

## Future Extensibility

### Planned Extensions (Not in Scope Now)

1. **Multi-Day Tours**
   - Add accommodation selection
   - Add meal plan pricing
   - Track multi-day itineraries

2. **Hybrid Services**
   - Combine transfer + boat + tour in single booking
   - Show bundled pricing
   - Coordinate timing across services

3. **Flexible Itineraries**
   - Allow customers to build custom tours
   - "A-la-carte" activity selection
   - Dynamic pricing based on selections

4. **Equipment Rental**
   - Snorkel gear, life jackets, etc.
   - Track rental inventory
   - Add to booking cost

5. **Photography Services**
   - Assign photographer to tour
   - Photo delivery workflow
   - Photo gallery per booking

6. **Language Support**
   - Tours in multiple languages
   - Guide language capabilities
   - Language selection in booking

7. **Age Restrictions**
   - Adult-only events
   - Family-friendly tours
   - Age-based pricing

8. **Transport Add-ons**
   - Hotel pickup/dropoff for tours
   - Transfer to boat departure
   - Return shuttle to resort

### Extensibility in Schema

**Design patterns that enable future growth:**

1. **JSON Metadata Fields**
   - Tour: `additionalDetails` (flexible for new fields)
   - Event: `customSettings` (theming, rules, etc.)
   - Speedboat: `specifications` (extensible boat data)

2. **String Enums (not Prisma enums)**
   - Allows adding new values without migration
   - Used for activityType, tripType, etc.

3. **Array Fields**
   - `includedItems String[]` - easily add new inclusions
   - `equipmentRental String[]` - extend rental options
   - `guestNames String[]` - flexible guest management

4. **Relationship Flexibility**
   - Tour can have multiple guides
   - Events can use multiple boats
   - Bookings can link to multiple services

---

## Summary Table

| Aspect | Current | After Expansion |
|--------|---------|-----------------|
| Service Types | 1 (Transfer) | 4 (Transfer, Boat, Tour, Event) |
| Booking Models | 1 (Booking) | 4 (Booking + 3 service-specific) |
| Pricing Models | 1 (ServiceRate) | 4 (ServiceRate, SpeedboatRate, TourRate, EventRate) |
| Inventory Models | 1 (Driver for cars) | 2 (Driver + Speedboat) |
| Database Tables | ~15 | ~25 (10 new) |
| API Endpoints | ~20 | ~50+ (30+ new) |
| Complexity | Medium | High |
| Backward Compat | N/A | 100% ✅ |

---

## Next Steps

1. **Review & Approval** - Review this design with stakeholders
2. **Schema Finalization** - Confirm all fields and relationships
3. **Migration Preparation** - Prepare database backup and rollback plan
4. **Development Start** - Begin Phase 1 (database) implementation
5. **Parallel Development** - Phases 2-5 can start once DB is ready

---

**Document Status:** Ready for Implementation  
**Approval Required:** Before proceeding to Phase 1  
**Estimated Timeline:** 7-10 working days (all 5 phases)

