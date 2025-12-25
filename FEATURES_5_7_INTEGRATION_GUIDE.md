# Features #5 & #7 Integration Guide

## Quick Start Integration

### 1. Add Activity Log to Admin Dashboard

Add to your admin dashboard page (e.g., `app/admin/dashboard/page.tsx`):

```typescript
import { ActivityLog } from "@/components/admin/ActivityLog"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Other dashboard components */}
      
      <ActivityLog />
    </div>
  )
}
```

### 2. Add Driver Dashboard to Driver App

Create `app/driver/dashboard/page.tsx`:

```typescript
import { DriverDashboard } from "@/components/driver/DriverDashboard"

export default function DriverDashboardPage() {
  return <DriverDashboard />
}
```

### 3. Add Activity Logging to Existing Features

Whenever you perform admin actions, log them using the audit service:

```typescript
import { logActivity, ActivityActions, ResourceTypes } from "@/lib/audit/service"

// Example: When updating a user
await logActivity({
  actorId: currentUser.id,
  action: ActivityActions.USER_UPDATED,
  resourceType: ResourceTypes.USER,
  resourceId: userId,
  oldValues: { role: "USER" },
  newValues: { role: "ADMIN" },
  details: "Promoted user to admin",
})

// Example: When cancelling a booking
await logActivity({
  actorId: currentUser.id,
  action: ActivityActions.BOOKING_CANCELLED,
  resourceType: ResourceTypes.BOOKING,
  resourceId: bookingId,
  details: "Cancelled due to customer request",
})
```

### 4. Integrate Driver Assignment in Booking Flow

When confirming a booking and assigning a driver:

```typescript
import { assignDriverToBooking } from "@/lib/driver/service"
import { logActivity, ActivityActions, ResourceTypes } from "@/lib/audit/service"

// Find nearby drivers
const nearbyDrivers = await findNearbyDrivers(
  pickupLat,
  pickupLon,
  5 // 5km radius
)

// Assign the best driver
const assignment = await assignDriverToBooking({
  driverId: nearbyDrivers[0].id,
  bookingId,
  pickupLatitude: pickupLat,
  pickupLongitude: pickupLon,
})

// Log the activity
await logActivity({
  actorId: adminId,
  action: ActivityActions.DRIVER_ASSIGNED,
  resourceType: ResourceTypes.BOOKING,
  resourceId: bookingId,
  newValues: { driverId: assignment.driverId },
  details: `Driver ${nearbyDrivers[0].user.name} assigned`,
})

// Send notification to driver
// TODO: Implement SMS/push notification
```

### 5. Update Booking Confirmation Flow

When booking is completed and driver finishes:

```typescript
import { completeDriverAssignment } from "@/lib/driver/service"

// Complete the assignment with customer rating
const completion = await completeDriverAssignment(
  assignmentId,
  rating,  // 1-5
  comment  // optional
)

// Update booking status
await prisma.booking.update({
  where: { id: bookingId },
  data: { status: "COMPLETED" },
})

// Log completion
await logActivity({
  actorId: driverId,
  action: ActivityActions.BOOKING_COMPLETED,
  resourceType: ResourceTypes.BOOKING,
  resourceId: bookingId,
  newValues: { rating, status: "COMPLETED" },
})
```

---

## API Usage Examples

### Fetch Activity Logs (Admin)

```typescript
// Get all activity logs
const response = await fetch("/api/admin/activity")
const { logs, total, hasMore } = await response.json()

// Filter by action and date
const response = await fetch(
  `/api/admin/activity?action=BOOKING_CONFIRMED&startDate=2025-12-01&endDate=2025-12-31`
)

// Paginate
const response = await fetch(
  `/api/admin/activity?limit=100&offset=0`
)

// Get activity for specific resource
const response = await fetch(
  `/api/admin/activity/BOOKING/booking-123`
)
```

### Register a Driver (Admin)

```typescript
const response = await fetch("/api/admin/drivers", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId: "user-123",
    licenseNumber: "DL123456789",
    licenseExpiry: "2026-12-31",
    vehicleType: "minibus",
    registrationNumber: "กx123456",
  }),
})

const driver = await response.json()
```

### List Drivers (Admin)

```typescript
// Get all available drivers
const response = await fetch("/api/admin/drivers?status=available")

// Paginate
const response = await fetch(
  `/api/admin/drivers?limit=50&offset=0`
)

const { drivers, total, hasMore } = await response.json()
```

### Assign Driver to Booking (Admin)

```typescript
const response = await fetch("/api/drivers/assignments", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    driverId: "driver-123",
    bookingId: "booking-456",
    pickupLatitude: 8.7245,
    pickupLongitude: 100.5931,
  }),
})

const assignment = await response.json()
```

### Update Driver Location (Driver)

```typescript
// Called automatically by DriverDashboard component
const response = await fetch("/api/drivers/location", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    latitude: 8.7245,
    longitude: 100.5931,
  }),
})

const { driver, currentAssignment } = await response.json()
```

### Complete Assignment with Rating (Driver)

```typescript
const response = await fetch("/api/drivers/assignments", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    assignmentId: "assignment-123",
    action: "complete",
    rating: 5,
    comment: "Great driver!",
  }),
})

const updatedAssignment = await response.json()
```

### Cancel Assignment (Admin/Driver)

```typescript
const response = await fetch("/api/drivers/assignments", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    assignmentId: "assignment-123",
    action: "cancel",
    reason: "Customer requested different driver",
  }),
})

const cancelledAssignment = await response.json()
```

---

## Database Queries

### Get All Activity by Admin User

```typescript
import { getActorActivityLog } from "@/lib/audit/service"

const logs = await getActorActivityLog("admin-user-id", 100)
```

### Generate Audit Report

```typescript
import { generateAuditReport } from "@/lib/audit/service"

const startDate = new Date("2025-12-01")
const endDate = new Date("2025-12-31")

const report = await generateAuditReport(startDate, endDate)

console.log(report.summary.byAction)
console.log(report.summary.byResource)
console.log(report.summary.topActors)
```

### Get Activity Summary for Dashboard

```typescript
import { getActivitySummary } from "@/lib/audit/service"

const summary = await getActivitySummary(7) // Last 7 days
console.log(summary.totalActivities)
console.log(summary.avgPerDay)
console.log(summary.byDate)
console.log(summary.byAction)
```

### Get Driver Statistics

```typescript
import { getDriverStats } from "@/lib/driver/service"

const stats = await getDriverStats("driver-id")
console.log(stats.averageRating)
console.log(stats.completionRate)
console.log(stats.thisMonthTrips)
```

### Get Nearby Drivers

```typescript
import { findNearbyDrivers } from "@/lib/driver/service"

const drivers = await findNearbyDrivers(
  8.7245,      // latitude
  100.5931,    // longitude
  5,           // 5km radius
  5            // top 5 drivers
)

drivers.forEach(driver => {
  console.log(`${driver.user.name}: ${driver.distance.toFixed(2)}km away`)
})
```

---

## Monitoring & Maintenance

### Archive Old Activity Logs

Run periodically (weekly or monthly) to clean up old records:

```typescript
import { archiveOldActivityLogs } from "@/lib/audit/service"

// Archive logs older than 90 days
const result = await archiveOldActivityLogs(90)
console.log(`Archived ${result.count} activity logs`)
```

### Scheduled Cleanup Job

Add to your cron jobs (in `vercel.json`):

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-activity",
      "schedule": "0 2 * * 0"  // Weekly on Sunday at 2am
    }
  ]
}
```

Create `app/api/cron/cleanup-activity/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { archiveOldActivityLogs } from "@/lib/audit/service"

export async function GET(request: Request) {
  // Verify cron secret
  if (request.headers.get("x-vercel-cron-secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const result = await archiveOldActivityLogs(90)
    return NextResponse.json({
      success: true,
      archivedCount: result.count,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to archive activity logs" },
      { status: 500 }
    )
  }
}
```

---

## Testing Checklist

- [ ] Activity log displays all actions
- [ ] Filters work correctly (action, resource type, date range)
- [ ] CSV export contains correct data
- [ ] Pagination works with large datasets
- [ ] Admin can view activity for specific resources
- [ ] Driver registration creates driver account
- [ ] Driver location updates in real-time
- [ ] Driver assignment creates activity log entry
- [ ] Driver rating updates completion rate
- [ ] Cancelled assignments free up driver
- [ ] Nearby drivers sorted by rating and distance
- [ ] Driver dashboard shows current assignment
- [ ] Permission checks prevent unauthorized access

---

## Troubleshooting

### Activity logs not appearing
1. Check admin user role is "ADMIN"
2. Verify `logActivity()` is being called in your actions
3. Check database migration was applied

### Driver location not updating
1. Verify browser geolocation permission is granted
2. Check network request to `/api/drivers/location`
3. Ensure driver authentication is valid

### Driver assignment failing
1. Verify driver status is "available"
2. Check booking exists
3. Ensure no existing assignment for booking

For more help, check `FEATURES_5_7_COMPLETE.md` or the component source code.
