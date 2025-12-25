# 🚀 Seeded Data Quick Start Guide

## 🎯 Access the Data

### Admin Dashboard
- **URL:** `http://localhost:3000/admin/vehicles`
- **Login:** 
  - Email: `admin@admin.com`
  - Password: Check your `.env` file or use default from seed

### Database Explorer
Open Prisma Studio to browse all seeded data:
```bash
cd /Volumes/Data/Projects/samui-transfers/frontend
npm run prisma:studio
```

---

## 🧪 Quick Tests

### Test 1: Service Rate Calculation
**Scenario:** User books minibus for 15 km journey

**Expected Result:**
- Base Price: 800 THB
- Distance Rate: 15 THB × (15 - 5) km = 150 THB  
- **Total: 950 THB**

### Test 2: Tour Package Booking
**Scenario:** 5 people book "Big Buddha & Waterfall" tour

**Expected Result:**
- Group size 5 falls in tier: 3-6 people
- Price per person: 950 THB
- **Total: 4,750 THB**

### Test 3: Speedboat Booking  
**Scenario:** 10 people book "Island Explorer" for island hopping

**Expected Result:**
- Capacity: 12 (sufficient)
- Base price: 4,000 THB
- Per person rate: 350 THB
- Additional: (10 - 4) × 350 = 2,100 THB
- **Total: 6,100 THB**

### Test 4: Event Ticket Pricing
**Scenario:** 2 people booking Full Moon Party (Jan 15)

**Expected Result:**
- Date falls in "Regular" tier (Jan 30 - Feb 11)
- Price per person: 500 THB
- **Total: 1,000 THB**

---

## 📱 API Testing

### List All Vehicles
```bash
curl http://localhost:3000/api/vehicles
```

**Response includes:**
- 9 vehicles (3 minibuses, 3 SUVs, 2 sedans, 1 pickup)
- Full specifications (capacity, registration, color, fuel type, etc.)

### List Service Rates
```bash
curl http://localhost:3000/api/rates/service
```

**Response includes:**
- 4 rate tiers (minibus, SUV, sedan, pickup)
- Base prices and distance rates

### Filter Vehicles by Type
```bash
curl "http://localhost:3000/api/vehicles?vehicleType=minibus"
```

**Response:** 3 minibuses with full details

---

## 🔐 Test Accounts

| Email | Password | Role | Notes |
|-------|----------|------|-------|
| admin@admin.com | (from .env) | ADMIN | Full system access |
| user@test.com | Test_123! | USER | Booking customer |
| john@example.com | John_123! | USER | Test user |
| jane@example.com | Jane_123! | USER | Test user |

---

## 📊 Data Verification Queries

### Count All Records
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  console.log('Vehicles:', await prisma.vehicle.count());
  console.log('Service Rates:', await prisma.serviceRate.count());
  console.log('Tour Packages:', await prisma.tourPackage.count());
  console.log('Tour Rates:', await prisma.tourRate.count());
  console.log('Special Events:', await prisma.specialEvent.count());
  console.log('Event Rates:', await prisma.eventRate.count());
  console.log('Speedboats:', await prisma.speedboat.count());
  await prisma.\$disconnect();
})();
"
```

### Check Specific Pricing
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const minibus = await prisma.serviceRate.findFirst({
    where: { vehicleType: 'minibus' }
  });
  console.log('Minibus Rate:', minibus);
  await prisma.\$disconnect();
})();
"
```

---

## 🎨 Visual Testing Checklist

### Admin Dashboard (`/admin/vehicles`)
- [ ] See all 9 vehicles in list
- [ ] Filter by vehicle type (minibus, SUV, sedan, pickup)
- [ ] Filter by status (AVAILABLE)
- [ ] Filter by home port (Koh Samui Airport, Nathon Pier, Lamai Beach)
- [ ] Click edit on a vehicle - see all details
- [ ] Create new vehicle - form should accept input
- [ ] Delete vehicle (soft delete) - should move to inactive
- [ ] Pagination works with 9 vehicles

### Booking Flow (If Implemented)
- [ ] Service transfer pricing calculates correctly
- [ ] Tour package group size affects pricing  
- [ ] Event rates show correct pricing tiers
- [ ] Speedboat availability shown correctly
- [ ] Payment methods display all 3 gateways

---

## 🔄 Resetting Test Data

If you need a fresh start, run the seed script again:

```bash
cd /Volumes/Data/Projects/samui-transfers/frontend
npm run prisma:seed
```

**What this does:**
- Deletes all existing vehicles, rates, tours, events
- Recreates the seeded data from scratch
- Preserves user accounts
- Resets all IDs to new values

⚠️ **Warning:** This will delete all test bookings created during testing!

---

## 📈 Next: Extending the Data

### Add More Vehicles
Edit `/frontend/prisma/seed.cjs` and add to `vehiclesData` array.

### Adjust Pricing
Modify base prices or distance rates in the seed file.

### Add Tour Locations
The schema supports detailed tour stop information (currently simplified).

### Real Event Dates
Update event dates and pricing tiers to match actual business schedule.

---

## ✅ Success Indicators

You'll know everything is working when:
1. ✅ Admin dashboard loads without errors
2. ✅ All 9 vehicles appear in `/admin/vehicles`  
3. ✅ Each vehicle shows correct details (name, type, capacity, port)
4. ✅ Service rates show 4 tiers with correct pricing
5. ✅ Tour packages show 4 different tours
6. ✅ Events show Full Moon Party, Green Mango, Sunrise Yoga
7. ✅ API endpoints return vehicle data successfully
8. ✅ Pricing calculations match test scenarios above

---

## 🆘 Troubleshooting

### "No vehicles showing in admin dashboard"
1. Check database connection
2. Verify seed script ran successfully (look for ✅ marks)
3. Run `npm run prisma:seed` again
4. Check browser console for errors

### "Seed script fails with validation error"
1. Check for schema mismatches
2. Verify Prisma is up-to-date: `npm install @prisma/client@latest`
3. Run migrations: `npm run prisma:migrate:dev`

### "Pricing calculations don't match test scenarios"
1. Check the service rate basePrice and distanceRate values
2. Verify the distance is greater than minDistance
3. Check tour rate minGroupSize/maxGroupSize

---

**Last Updated:** Seed script execution complete  
**Data Status:** ✅ Production-ready test data loaded
