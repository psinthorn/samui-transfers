# Database Schema Reference - Features #5 & #7

## New Models Created

### 1. ActivityLog Model
Comprehensive audit trail for all admin actions.

```sql
CREATE TABLE "ActivityLog" (
  id              String NOT NULL PRIMARY KEY,
  actorId         String NOT NULL,
  action          String NOT NULL,
  resourceType    String NOT NULL,
  resourceId      String,
  oldValues       JsonB,
  newValues       JsonB,
  details         String,
  ipAddress       String,
  userAgent       String,
  createdAt       DateTime NOT NULL DEFAULT now(),
  
  -- Relationships
  FOREIGN KEY (actorId) REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_actorId_createdAt (actorId, createdAt),
  INDEX idx_action_createdAt (action, createdAt),
  INDEX idx_resourceType_resourceId (resourceType, resourceId),
  INDEX idx_createdAt (createdAt)
);
```

**Fields:**
- `id` - Unique identifier
- `actorId` - User who performed the action (admin)
- `action` - Action type (USER_CREATED, BOOKING_CONFIRMED, etc.)
- `resourceType` - Type of resource affected (USER, BOOKING, PAYMENT, DRIVER)
- `resourceId` - ID of the affected resource
- `oldValues` - Previous values (for UPDATE operations)
- `newValues` - New values (for UPDATE operations)
- `details` - Additional context
- `ipAddress` - IP address of the action source
- `userAgent` - Browser/client information
- `createdAt` - Timestamp

**Indexes:**
- Actor + Date (fast lookup of user's actions)
- Action + Date (fast lookup of action type)
- Resource Type + ID (fast lookup of resource history)
- Creation date (for time-series queries)

---

### 2. Driver Model
Driver profile with location, status, and performance metrics.

```sql
CREATE TABLE "Driver" (
  id                    String NOT NULL PRIMARY KEY,
  userId                String NOT NULL UNIQUE,
  licenseNumber         String NOT NULL UNIQUE,
  licenseExpiry         DateTime,
  licenseVerified       Boolean NOT NULL DEFAULT false,
  licenseVerifiedAt     DateTime,
  vehicleId             String,
  vehicleType           String,
  registrationNumber    String,
  status                String NOT NULL DEFAULT 'offline',
  acceptingRides        Boolean NOT NULL DEFAULT true,
  currentLatitude       Decimal(10,8),
  currentLongitude      Decimal(11,8),
  locationUpdatedAt     DateTime,
  totalTrips            Int NOT NULL DEFAULT 0,
  cancelledTrips        Int NOT NULL DEFAULT 0,
  completedTrips        Int NOT NULL DEFAULT 0,
  averageRating         Decimal(3,2),
  totalReviews          Int NOT NULL DEFAULT 0,
  backgroundCheckStatus String,
  backgroundCheckDate   DateTime,
  insuranceExpiry       DateTime,
  createdAt             DateTime NOT NULL DEFAULT now(),
  updatedAt             DateTime NOT NULL,
  
  -- Relationships
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_userId (userId),
  INDEX idx_status (status),
  INDEX idx_acceptingRides (acceptingRides),
  INDEX idx_locationUpdatedAt (locationUpdatedAt)
);
```

**Fields:**
- `id` - Unique identifier
- `userId` - Reference to User account (one-to-one)
- `licenseNumber` - Driver license number (unique)
- `licenseExpiry` - License expiration date
- `licenseVerified` - Whether license has been verified
- `vehicleType` - Vehicle type (minibus, suv, sedan)
- `registrationNumber` - Vehicle registration plate
- `status` - Driver status (available, busy, offline, on_break)
- `acceptingRides` - Whether driver is accepting new rides
- `currentLatitude` - Current latitude (8 decimal places)
- `currentLongitude` - Current longitude (8 decimal places)
- `locationUpdatedAt` - Last location update timestamp
- `totalTrips` - Lifetime trip count
- `completedTrips` - Completed trips count
- `cancelledTrips` - Cancelled trips count
- `averageRating` - Average customer rating (0-5)
- `totalReviews` - Number of ratings received
- `backgroundCheckStatus` - Compliance status
- `insuranceExpiry` - Vehicle insurance expiration

**Precision:**
- Latitude: 10 digits total, 8 decimal places (~1.1mm accuracy)
- Longitude: 11 digits total, 8 decimal places (~1.1mm accuracy)

---

### 3. DriverAssignment Model
Links drivers to bookings with status tracking.

```sql
CREATE TABLE "DriverAssignment" (
  id                String NOT NULL PRIMARY KEY,
  driverId          String NOT NULL,
  bookingId         String NOT NULL UNIQUE,
  assignmentStatus  String NOT NULL DEFAULT 'assigned',
  assignedAt        DateTime NOT NULL DEFAULT now(),
  acceptedAt        DateTime,
  startedAt         DateTime,
  completedAt       DateTime,
  pickupLatitude    Decimal(10,8),
  pickupLongitude   Decimal(11,8),
  estimatedArrival  DateTime,
  actualArrival     DateTime,
  rating            Int,
  ratingComment     String,
  cancellationReason String,
  cancelledAt       DateTime,
  createdAt         DateTime NOT NULL DEFAULT now(),
  updatedAt         DateTime NOT NULL,
  
  -- Relationships
  FOREIGN KEY (driverId) REFERENCES "Driver"(id) ON DELETE CASCADE,
  
  -- Unique constraint: one driver per booking
  UNIQUE (bookingId),
  
  -- Indexes
  INDEX idx_driverId (driverId),
  INDEX idx_bookingId (bookingId),
  INDEX idx_assignmentStatus (assignmentStatus)
);
```

**Fields:**
- `id` - Unique identifier
- `driverId` - Assigned driver
- `bookingId` - Associated booking (one-to-one via UNIQUE)
- `assignmentStatus` - Status (assigned, accepted, ongoing, completed, cancelled)
- `assignedAt` - When assignment was made
- `acceptedAt` - When driver accepted
- `startedAt` - When driver started trip
- `completedAt` - When trip was completed
- `pickupLatitude` - Pickup location latitude at assignment time
- `pickupLongitude` - Pickup location longitude at assignment time
- `estimatedArrival` - ETA for driver
- `actualArrival` - Actual arrival time
- `rating` - 1-5 star rating given by customer
- `ratingComment` - Customer feedback
- `cancellationReason` - Why assignment was cancelled
- `cancelledAt` - When assignment was cancelled

**Lifecycle:**
```
assigned → accepted → ongoing → completed (with rating)
                    ↓
                 cancelled (with reason)
```

---

### 4. DriverRating Model
Customer feedback and ratings for drivers.

```sql
CREATE TABLE "DriverRating" (
  id            String NOT NULL PRIMARY KEY,
  driverId      String NOT NULL,
  ratedBy       String NOT NULL,
  rating        Int NOT NULL,
  comment       String,
  categories    JsonB,
  createdAt     DateTime NOT NULL DEFAULT now(),
  updatedAt     DateTime NOT NULL,
  
  -- Relationships
  FOREIGN KEY (driverId) REFERENCES "Driver"(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_driverId (driverId),
  INDEX idx_rating (rating)
);
```

**Fields:**
- `id` - Unique identifier
- `driverId` - Driver being rated
- `ratedBy` - User ID who gave the rating
- `rating` - 1-5 stars
- `comment` - Optional feedback
- `categories` - JSON breakdown by category:
  ```json
  {
    "cleanliness": 5,
    "professionalism": 4,
    "safety": 5,
    "communication": 4,
    "punctuality": 5
  }
  ```

**Rating Scale:**
- 1 = Poor
- 2 = Fair
- 3 = Good
- 4 = Very Good
- 5 = Excellent

---

## Model Relationships

```
User (1)
  ├─ ActivityLog (many) [one-to-many]
  │   └─ actorId → User.id
  │
  └─ Driver (1) [one-to-one]
      └─ userId → User.id
          ├─ DriverAssignment (many) [one-to-many]
          │   └─ driverId → Driver.id
          │
          └─ DriverRating (many) [one-to-many]
              └─ driverId → Driver.id

Booking
  └─ DriverAssignment (1 or 0) [zero-to-one, via UNIQUE bookingId]
      └─ bookingId → Booking.id
```

---

## Indexes for Performance

### ActivityLog Indexes
1. **idx_actorId_createdAt** - Fast lookup of admin's actions
   - Query: Get all actions by user X since date Y
   
2. **idx_action_createdAt** - Fast lookup by action type
   - Query: Get all USER_CREATED events in timeframe
   
3. **idx_resourceType_resourceId** - Fast history lookup
   - Query: Get all changes to booking #123
   
4. **idx_createdAt** - Time-series queries
   - Query: Get activity from last 7 days

### Driver Indexes
1. **idx_userId** - One-to-one relationship lookup
2. **idx_status** - Find drivers by status
3. **idx_acceptingRides** - Find available drivers
4. **idx_locationUpdatedAt** - Find recent driver locations

### DriverAssignment Indexes
1. **idx_driverId** - Find driver's assignments
2. **idx_bookingId** - Find assignment for booking
3. **idx_assignmentStatus** - Find active assignments

### DriverRating Indexes
1. **idx_driverId** - Find ratings for driver
2. **idx_rating** - Find high-rated or low-rated drivers

---

## Data Types & Constraints

### Decimal Precision
- **Driver Coordinates**: Decimal(10,8) and Decimal(11,8)
  - Accuracy: ~1.1 millimeter at equator
  - Suitable for street-level routing
  - Example: 8.72456789°N, 100.59876543°E

### Enums (String Values)
- **Driver Status**: 'available' | 'busy' | 'offline' | 'on_break'
- **Assignment Status**: 'assigned' | 'accepted' | 'ongoing' | 'completed' | 'cancelled'
- **Background Check**: 'PENDING' | 'APPROVED' | 'REJECTED'

### Integer Ranges
- **Rating**: 1-5
- **Decimal Rating**: 0.00-5.00 (Decimal(3,2))
- **Trip Counts**: 0 - 2,147,483,647 (Int max)

---

## Migration Details

### Migration File
`20251207144713_add_activity_log_and_driver_system.sql`

**Changes Made:**
1. Created `ActivityLog` table
2. Created `Driver` table
3. Created `DriverAssignment` table
4. Created `DriverRating` table
5. Added `activityLogs` relation to User model
6. Added `driver` relation to User model

**Status:** ✅ Applied successfully

---

## Query Examples

### Get Activity for Resource
```sql
SELECT * FROM "ActivityLog"
WHERE "resourceType" = 'BOOKING'
  AND "resourceId" = 'booking-123'
ORDER BY "createdAt" DESC;
```

### Get Nearby Drivers
```sql
-- Requires geospatial queries (implemented in service layer)
SELECT * FROM "Driver"
WHERE "status" = 'available'
  AND "acceptingRides" = true
ORDER BY "averageRating" DESC
LIMIT 5;
```

### Get Driver Statistics
```sql
SELECT 
  "id",
  "averageRating",
  "totalTrips",
  "completedTrips",
  "cancelledTrips",
  ROUND(("completedTrips" * 100.0 / "totalTrips"), 2) as completion_rate
FROM "Driver"
WHERE "id" = 'driver-123';
```

### Get Recent Activity
```sql
SELECT 
  a."action",
  a."resourceType",
  a."details",
  u."email" as actor_email,
  a."createdAt"
FROM "ActivityLog" a
JOIN "User" u ON a."actorId" = u."id"
WHERE a."createdAt" >= NOW() - INTERVAL '7 days'
ORDER BY a."createdAt" DESC
LIMIT 100;
```

---

## Database Size Estimates

Based on 1 year of operation:

| Table | Estimated Rows | Size |
|-------|----------------|------|
| ActivityLog | 100,000+ | ~50 MB |
| Driver | 50-200 | ~100 KB |
| DriverAssignment | 10,000+ | ~5 MB |
| DriverRating | 10,000+ | ~2 MB |
| **Total** | **120,000+** | **~57 MB** |

*Note: ActivityLog archiving after 90 days recommended for long-term storage*

---

**Schema Created:** December 7, 2025  
**Prisma Version:** 6.15.0  
**Database:** PostgreSQL (Neon)  
**Status:** ✅ Fully Migrated
