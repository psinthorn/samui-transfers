# API & Database Reference for Vehicle Integration

## 🔌 API Endpoints

### GET /api/vehicles
Fetch available vehicles from the database.

**Endpoint:** `GET /api/vehicles`

**Query Parameters:**
```
status=AVAILABLE          Optional: Filter by status (AVAILABLE, MAINTENANCE, RETIRED, OUT_OF_SERVICE)
vehicleType=minibus       Optional: Filter by type (minibus, suv, sedan, pickup, van, bus, truck, other)
homePort=Koh+Samui+Airport Optional: Filter by home base location
isActive=true             Optional: Filter by active status (true/false)
page=1                    Optional: Page number (default: 1)
limit=20                  Optional: Items per page (default: 20, max: 100)
```

**Example Requests:**

```bash
# Get all available vehicles
curl "http://localhost:3000/api/vehicles?status=AVAILABLE"

# Get available minibuses
curl "http://localhost:3000/api/vehicles?status=AVAILABLE&vehicleType=minibus"

# Get vehicles at Koh Samui Airport
curl "http://localhost:3000/api/vehicles?homePort=Koh+Samui+Airport&limit=50"

# Get available SUVs with pagination
curl "http://localhost:3000/api/vehicles?status=AVAILABLE&vehicleType=suv&page=1&limit=10"
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Vehicles retrieved successfully",
  "data": [
    {
      "id": "clz8ab3c000000tgw4a2a9c1",
      "name": "Toyota Fortuner - SUV A",
      "vehicleType": "suv",
      "registrationNumber": "กข-2001",
      "capacity": 4,
      "color": "Black",
      "yearOfManufacture": 2023,
      "homePort": "Koh Samui Airport",
      "currentLocation": "Koh Samui Airport",
      "status": "AVAILABLE",
      "isActive": true,
      "maintenanceUntil": null,
      "lastMaintenanceDate": "2025-12-01T10:00:00.000Z",
      "nextMaintenanceDate": "2025-12-31T10:00:00.000Z",
      "maintenanceNotes": null,
      "safetyInspectionDate": "2025-12-01T10:00:00.000Z",
      "safetyInspectionValid": true,
      "insuranceExpiry": "2026-12-01T00:00:00.000Z",
      "mileage": 3500,
      "fuelType": "Diesel",
      "fuelCapacity": 80,
      "fuelConsumption": null,
      "createdAt": "2025-12-09T01:23:45.678Z",
      "updatedAt": "2025-12-09T01:23:45.678Z"
    },
    {
      "id": "clz8ab3c000000tgw4a2a9c2",
      "name": "Toyota Commuter - Minibus A",
      "vehicleType": "minibus",
      "registrationNumber": "กข-1234",
      "capacity": 10,
      "color": "White",
      "yearOfManufacture": 2023,
      "homePort": "Koh Samui Airport",
      "status": "AVAILABLE",
      "isActive": true,
      // ... other fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "pages": 1
  }
}
```

**Status Codes:**
- `200 OK` - Vehicles retrieved successfully
- `400 Bad Request` - Invalid pagination parameters
- `500 Internal Server Error` - Database error

---

### GET /api/service-rates (Optional)
Fetch pricing rates for vehicles (currently not used, using defaults).

**Endpoint:** `GET /api/service-rates`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rate-001",
      "serviceType": "TRANSFER",
      "vehicleType": "minibus",
      "basePrice": 500,
      "distanceRate": 45,
      "minDistance": 0,
      "maxDistance": null,
      "isActive": true,
      "description": "Minibus base rate for transfers"
    },
    {
      "id": "rate-002",
      "serviceType": "TRANSFER",
      "vehicleType": "suv",
      "basePrice": 350,
      "distanceRate": 35,
      "minDistance": 0,
      "maxDistance": null,
      "isActive": true,
      "description": "SUV base rate for transfers"
    }
  ]
}
```

---

### POST /api/bookings
Create a new booking (after user submits form).

**Endpoint:** `POST /api/bookings`

**Request Body:**
```json
{
  "customerEmail": "user@example.com",
  "customerPhone": "+66912345678",
  "carType": "suv",
  "carModel": "Toyota Fortuner - SUV A",
  "bookingDate": "2025-12-20",
  "departureDateTime": "2025-12-20T14:30:00Z",
  "numberOfPassengers": 3,
  "pickupLocation": "Koh Samui Airport",
  "dropoffLocation": "Chaweng Beach",
  "estimatedDistance": 20.45,
  "serviceType": "transfer",
  "basePrice": 875,
  "totalPrice": 875,
  "specialRequests": "Please call 10 minutes before pickup"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "id": "booking-clz8xyzabc123",
  "referenceNumber": "BK-2025-001234",
  "status": "PENDING",
  "details": { /* booking data */ }
}
```

---

## 📊 Database Schema

### Vehicle Table
```sql
CREATE TABLE "Vehicle" (
  -- Primary Key
  "id"                    TEXT PRIMARY KEY DEFAULT cuid(),
  
  -- Vehicle Identity
  "name"                  TEXT NOT NULL,             -- e.g., "Toyota Fortuner - SUV A"
  "vehicleType"           TEXT NOT NULL,             -- minibus, suv, sedan, pickup, van, bus, truck, other
  "registrationNumber"    TEXT UNIQUE,               -- License plate, e.g., "กข-2001"
  
  -- Specifications
  "capacity"              INT NOT NULL,              -- Max passenger capacity
  "color"                 TEXT,                      -- Vehicle color
  "yearOfManufacture"     INT,                       -- Manufacturing year
  
  -- Location & Operations
  "homePort"              TEXT NOT NULL,             -- Base location e.g., "Koh Samui Airport"
  "currentLocation"       TEXT,                      -- Current parking location
  
  -- Status & Availability
  "status"                TEXT DEFAULT 'AVAILABLE',  -- AVAILABLE | MAINTENANCE | RETIRED | OUT_OF_SERVICE
  "isActive"              BOOLEAN DEFAULT true,      -- Soft delete flag
  "maintenanceUntil"      TIMESTAMP,                 -- Unavailable until this date
  
  -- Maintenance & Safety
  "lastMaintenanceDate"   TIMESTAMP,                 -- Last service date
  "nextMaintenanceDate"   TIMESTAMP,                 -- Next scheduled service
  "maintenanceNotes"      TEXT,                      -- Notes about maintenance
  "safetyInspectionDate"  TIMESTAMP,                 -- Last inspection date
  "safetyInspectionValid" BOOLEAN DEFAULT true,      -- Is inspection current?
  "insuranceExpiry"       TIMESTAMP,                 -- Insurance expiry date
  
  -- Operational Data
  "mileage"               INT,                       -- Current odometer reading
  "fuelType"              TEXT,                      -- Petrol, Diesel, Electric, Hybrid
  "fuelCapacity"          DECIMAL,                   -- Tank size in liters
  "fuelConsumption"       DECIMAL,                   -- Avg consumption per km
  
  -- Timestamps
  "createdAt"             TIMESTAMP DEFAULT NOW(),
  "updatedAt"             TIMESTAMP,
  
  -- Indexes
  INDEX idx_vehicleType   ON "vehicleType",
  INDEX idx_status        ON "status",
  INDEX idx_homePort      ON "homePort",
  INDEX idx_isActive      ON "isActive",
  INDEX idx_regNumber     ON "registrationNumber"
);
```

### Vehicle Status Values
```
Status        | Display      | Color  | Can Book | Icon
──────────────┼──────────────┼────────┼──────────┼──────
AVAILABLE     | Available    | Green  | Yes ✓    | 🟢
MAINTENANCE   | Maintenance  | Yellow | No ✗     | 🟡
RETIRED       | Retired      | Gray   | No ✗     | ⚫
OUT_OF_SERVICE| Unavailable  | Red    | No ✗     | 🔴
```

---

## 🔧 Implementation Code Reference

### SearchSection.js - Vehicle Fetching
```javascript
const fetchVehicles = async () => {
  try {
    setLoadingVehicles(true);
    const response = await fetch('/api/vehicles?status=AVAILABLE&limit=20');
    const data = await response.json();
    if (data.data) {
      setVehicles(data.data);
    }
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    setVehicles([]);
  } finally {
    setLoadingVehicles(false);
  }
};

// Call when locations are selected
useEffect(() => {
  if (source && destination) {
    calculateDistance();
    fetchVehicles();
    setSelectedVehicle(null);
  }
}, [source, destination]);
```

### SearchSection.js - Fare Calculation
```javascript
const DEFAULT_RATES = {
  minibus: { basePrice: 500, distanceRate: 45 },
  suv: { basePrice: 350, distanceRate: 35 },
  sedan: { basePrice: 300, distanceRate: 30 },
  pickup: { basePrice: 400, distanceRate: 40 },
  van: { basePrice: 450, distanceRate: 42 },
  bus: { basePrice: 600, distanceRate: 50 },
  truck: { basePrice: 700, distanceRate: 60 },
  other: { basePrice: 350, distanceRate: 35 },
};

const calculateFare = (vehicle) => {
  if (!routeDistanceInKiloMeter) return 0;
  const rate = DEFAULT_RATES[vehicle.vehicleType?.toLowerCase()] || DEFAULT_RATES.other;
  const distance = routeDistanceInKiloMeter;
  
  // Base price + distance charge (if > 5km)
  const calculatedDistance = Math.max(distance - 5, 0);
  const fare = rate.basePrice + (calculatedDistance * rate.distanceRate);
  return Math.round(fare);
};
```

### SearchSection.js - Data Persistence
```javascript
const handleSelectVehicle = (vehicle) => {
  const fare = calculateFare(vehicle);
  const bookingData = {
    ...requestTransfer,
    pickupPoint: source.label,
    dropoffPoint: destination.label,
    distance: Math.round(routeDistanceInKiloMeter * 100) / 100,
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    vehicleType: vehicle.vehicleType,
    rate: fare,
    total: fare,
    carType: vehicle.vehicleType,
    carModel: vehicle.name,
  };

  // Save and navigate
  sessionStorage.setItem('pendingBookingData', JSON.stringify(bookingData));
  setRequestTransfer(bookingData);
  setSelectedVehicle(vehicle);
  router.push('/booking');
};
```

### BookingPage.tsx - Data Loading
```typescript
useEffect(() => {
  try {
    const pendingData = sessionStorage.getItem('pendingBookingData')
    if (pendingData) {
      const data = JSON.parse(pendingData)
      
      // Pre-fill all fields
      if (data.pickupPoint) setPickupPoint(data.pickupPoint)
      if (data.dropoffPoint) setDropoffPoint(data.dropoffPoint)
      if (data.distance) setDistance(data.distance)
      if (data.carType) setSelectedCarType(data.carType)
      if (data.carModel) setSelectedCarModel(data.carModel)
      
      // Clear to prevent data reuse
      sessionStorage.removeItem('pendingBookingData')
    }
  } catch (error) {
    console.error('Error loading pending booking data:', error)
  }
}, [])
```

---

## 📱 Testing with curl

### Test Vehicle Fetching
```bash
# Get all available vehicles
curl -X GET "http://localhost:3000/api/vehicles?status=AVAILABLE"

# Get specific vehicle type
curl -X GET "http://localhost:3000/api/vehicles?status=AVAILABLE&vehicleType=suv"

# Get with pagination
curl -X GET "http://localhost:3000/api/vehicles?status=AVAILABLE&page=1&limit=5"
```

### Test Booking Creation
```bash
curl -X POST "http://localhost:3000/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "test@example.com",
    "customerPhone": "+66912345678",
    "carType": "suv",
    "carModel": "Toyota Fortuner - SUV A",
    "bookingDate": "2025-12-20",
    "departureDateTime": "2025-12-20T14:30:00Z",
    "numberOfPassengers": 3,
    "pickupLocation": "Koh Samui Airport",
    "dropoffLocation": "Chaweng Beach",
    "estimatedDistance": 20.45,
    "serviceType": "transfer",
    "basePrice": 875,
    "totalPrice": 875,
    "specialRequests": ""
  }'
```

---

## 🗂️ Related Files

| File | Purpose | Usage |
|------|---------|-------|
| `/components/Home/SearchSection.js` | Vehicle listing & selection | Displays vehicles from DB |
| `/app/booking/BookingPage.tsx` | Booking form | Loads pending data |
| `/components/form/BookingForm.tsx` | Alternative booking form | Loads pending data |
| `/app/api/vehicles/route.ts` | API endpoint | Fetches vehicles |
| `/prisma/schema.prisma` | Database schema | Defines Vehicle table |

---

## ✅ Verification Checklist

Before testing, verify:

- [ ] Database has vehicles with `status = 'AVAILABLE'`
- [ ] `/api/vehicles` endpoint returns data (test with curl)
- [ ] Google Maps Distance Matrix API is configured
- [ ] NEXT_PUBLIC_GOOGLE_API_KEY is set in .env
- [ ] SessionStorage is enabled in browser
- [ ] No TypeScript errors: `npm run build`
- [ ] Dev server running: `npm run dev`

---

**Status:** ✅ Complete
**Last Updated:** December 9, 2025
