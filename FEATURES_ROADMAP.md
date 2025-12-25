# Next Features Implementation Roadmap

## Current Status
✅ **Feature #1: Payment Reconciliation Dashboard** - COMPLETE
✅ **Feature #2: Payment Proof Upload** - COMPLETE
🔄 **Feature #3-8: Queued for Implementation**

---

## Feature #3: Automated Payment Reminders ⏰

### Purpose
Auto-send email/SMS reminders if payment not received after 24/48/72 hours. Block booking after 72 hours.

### Implementation Strategy

**Components Needed:**
1. **Scheduled Job Handler** - Node.js cron job or Vercel Cron
   - Runs every 30 minutes
   - Checks bookings with PENDING payment status
   - Calculates time elapsed since booking creation
   - Sends reminders based on schedule

2. **Admin Settings Page** - `/admin/payment-reminders`
   - Configure reminder schedule (24h, 48h, 72h)
   - Toggle reminders on/off
   - Customize reminder message template
   - View reminder history

3. **Email Templates**
   - First reminder (24h): "Payment pending - please pay"
   - Second reminder (48h): "Final reminder - 24 hours left"
   - Final notice (72h): "Booking will be cancelled"

4. **Database Changes**
   - Add fields to Booking: `reminder1Sent`, `reminder2Sent`, `reminder3Sent` (DateTime)
   - Track which reminders were sent

**Implementation Steps:**
1. Create API route `/api/admin/payment-reminders-config` (GET/PUT)
2. Create scheduled task handler
3. Add reminder tracking fields to Booking model
4. Create admin settings page
5. Implement email reminder logic
6. Add cancellation logic for 72h timeout

**Estimated Time:** 3-4 hours

---

## Feature #4: SMS Notifications 📱

### Purpose
Send SMS updates for payment reminders, status changes, and driver arrival notifications.

### Implementation Strategy

**Components Needed:**
1. **Twilio Integration Wrapper** - `/lib/sms/service.ts`
   - Initialize Twilio client with credentials
   - Send SMS function with templates
   - Error handling and logging
   - Rate limiting

2. **SMS Templates**
   - Payment reminder template
   - Payment confirmed template
   - Driver assigned notification
   - Driver arriving notification

3. **Customer Phone Field**
   - Add `phoneNumber` to booking details or separate field
   - Validate E.164 format (+66XXXXXXXXX)
   - Add phone input to booking form

4. **SMS Event Triggers**
   - Payment proof verified → SMS confirmation
   - Payment reminder → SMS reminder
   - Driver assigned → SMS notification
   - Driver arriving → SMS alert

**Database Changes:**
- Add `phoneNumber` to Booking or User model
- Add `smsConsent` boolean field
- Add `lastSmsNotification` timestamp

**Implementation Steps:**
1. Install Twilio SDK: `npm install twilio`
2. Create SMS service wrapper
3. Add phone field to booking model
4. Create SMS event triggers in existing action handlers
5. Add SMS templates
6. Create admin SMS logs view

**Estimated Time:** 3-4 hours

**Environment Needed:**
```
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+66xxx
```

---

## Feature #5: Admin Activity Log 📋

### Purpose
Track all admin actions with audit trail for compliance and debugging.

### Implementation Strategy

**Components Needed:**
1. **Enhanced AuditLog Model**
   - Already exists but can be extended
   - Add `bookingId` and `paymentId` relationships
   - Add `actionDetails` JSON for specific changes
   - Add `ipAddress` for security

2. **Activity Logging Middleware**
   - Intercept admin action handlers
   - Create log entry for each action
   - Log old/new values for changes
   - Track who made what change when

3. **Admin Activity Dashboard** - `/admin/activity-logs`
   - Search by date, admin, action type
   - Filter by resource (booking, payment, user)
   - Export logs to CSV
   - Real-time activity stream

4. **Action Types to Track:**
   - Booking status changes
   - Payment verification
   - Payment proof rejection
   - Admin settings changes
   - User role changes
   - Refund processing

**Database Changes:**
- Enhance AuditLog model with additional fields
- Create indexes for efficient querying

**Implementation Steps:**
1. Extend AuditLog model in schema
2. Create audit logging utility function
3. Add logging to existing admin actions
4. Create activity logs page/components
5. Add search and filter functionality
6. Add CSV export

**Estimated Time:** 3-4 hours

---

## Feature #6: Fix Stripe Webhooks 🔧

### Purpose
Fix webhook signature verification and auto-update bookings on payment.

### Implementation Strategy

**Issues to Fix:**
1. Webhook signature validation (currently case-sensitive bug)
2. PayPal SDK integration errors
3. Auto-confirmation of bookings on successful payment
4. Proper refund handling

**Components Needed:**
1. **Webhook Verification Fix** - `/api/webhooks/stripe`
   - Implement correct Stripe signature verification
   - Handle raw body correctly (not parsed JSON)
   - Verify endpoint secret properly

2. **Payment Event Handlers**
   - `payment_intent.succeeded` → Update booking to CONFIRMED
   - `payment_intent.payment_failed` → Update booking status, send email
   - `charge.refunded` → Update booking refund status

3. **Webhook Event Logging**
   - Store all webhook events (already in PaymentWebhook model)
   - Add retry logic for failed processing
   - Admin view of webhook history

**Implementation Steps:**
1. Review Stripe webhook integration in existing code
2. Fix signature verification logic
3. Implement event processing handlers
4. Test with Stripe CLI
5. Add comprehensive logging
6. Document webhook events

**Estimated Time:** 3-4 hours

**Key Fix Areas:**
- Check webhook signature verification code
- Ensure raw body is passed to Stripe verification
- Properly update booking status on payment events
- Handle edge cases (duplicate events, timeouts)

---

## Feature #7: Driver Assignment & Tracking 🚗

### Purpose
Admin assign drivers, track location in real-time, customer sees driver on map.

### Implementation Strategy

**Components Needed:**
1. **Driver Model** - Extend schema
   - Driver personal info
   - Vehicle info (type, license plate, seats)
   - Service area
   - Status (available, on-duty, off-duty)

2. **Real-time Location Tracking**
   - WebSocket connection for live updates
   - GPS location endpoint for mobile app
   - Geolocation marker on map
   - ETA calculation

3. **Admin Driver Management** - `/admin/drivers`
   - List all drivers
   - Assign to bookings
   - View driver schedule
   - Manage vehicle info

4. **Customer Tracking View**
   - Show driver location on booking page
   - Display ETA
   - Driver contact info
   - Real-time status updates

5. **Maps Integration**
   - Use existing Google Maps API
   - Add polyline for route
   - Show driver position
   - Estimated arrival

**Database Changes:**
- Create Driver model
- Create DriverSchedule model
- Add `driverId` to Booking
- Add location tracking table

**Implementation Steps:**
1. Create Driver schema models
2. Add driver management API endpoints
3. Create admin driver management page
4. Implement location tracking API
5. Add customer tracking view component
6. Integrate real-time updates (Socket.io or WebSocket)

**Estimated Time:** 6-8 hours (complex feature)

**High Effort Due To:**
- Real-time location tracking
- WebSocket connections
- Map integration
- Mobile app coordination

---

## Feature #8: Mobile App Foundation 📲

### Purpose
React Native app for booking management, status tracking, and customer communication.

### Implementation Strategy

**Technology Stack:**
- React Native with TypeScript
- React Navigation for routing
- Expo for development/deployment
- Redux for state management
- Async Storage for offline data
- Geolocation for driver tracking

**App Screens Needed:**
1. **Authentication**
   - Login/Sign up (use existing Auth API)
   - Phone verification
   - Password reset

2. **Booking Management**
   - List active/past bookings
   - Create new booking
   - Booking details with real-time status
   - Cancel booking
   - Upload payment proof

3. **Payment**
   - Payment method selection
   - Payment proof upload
   - Payment status tracking
   - Receipt download

4. **Tracking**
   - Real-time driver location
   - ETA display
   - Route visualization
   - Driver contact

5. **Communication**
   - Chat with driver/support
   - Notification center
   - Push notifications
   - SMS forwarding

6. **Account**
   - Profile management
   - Saved addresses
   - Payment methods
   - Booking history
   - Support chat

**Implementation Steps:**
1. Initialize React Native Expo project
2. Set up authentication with existing backend
3. Create booking screens
4. Implement payment proof upload
5. Add driver tracking
6. Build communication features
7. Implement offline support
8. Set up push notifications
9. Deploy to app stores

**Estimated Time:** 20-30 hours (significant project)

**Very High Effort Due To:**
- Complete app development
- Native platform considerations
- App store deployment
- Testing across devices
- Ongoing maintenance

---

## 🎯 Recommended Implementation Order

### Phase 1 (High Priority - Do Next)
1. ✅ Payment Reconciliation Dashboard (DONE)
2. ✅ Payment Proof Upload (DONE)
3. ⏳ Fix Stripe Webhooks (HIGH - fixes payment reliability)

### Phase 2 (Medium Priority - Next)
4. Automated Payment Reminders (improves payment completion rate)
5. SMS Notifications (improves customer engagement)
6. Admin Activity Log (improves security/compliance)

### Phase 3 (Lower Priority - Later)
7. Driver Assignment & Tracking (complex but high value)
8. Mobile App Foundation (long-term investment)

---

## 📊 Feature Prioritization Matrix

| Feature | Value | Effort | Priority | Users |
|---------|-------|--------|----------|-------|
| Payment Reconciliation | ⭐⭐⭐ | ⭐ | HIGH | Admin |
| Payment Proof Upload | ⭐⭐⭐ | ⭐⭐ | HIGH | Customer + Admin |
| Fix Stripe Webhooks | ⭐⭐⭐ | ⭐⭐ | HIGH | System |
| Payment Reminders | ⭐⭐ | ⭐⭐ | MEDIUM | Customer |
| SMS Notifications | ⭐⭐ | ⭐⭐ | MEDIUM | Customer |
| Activity Logs | ⭐⭐ | ⭐⭐ | MEDIUM | Admin |
| Driver Tracking | ⭐⭐⭐ | ⭐⭐⭐⭐ | LOW | Customer |
| Mobile App | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | VERY LOW | All |

---

## 🚀 Next Steps

Ready to implement Feature #3 (Automated Payment Reminders)?

**Say:** "start feature 3" or "implement payment reminders"

Or choose a different feature:
- "start feature 5" → Admin Activity Log
- "start feature 6" → Fix Stripe Webhooks
- "start feature 7" → Driver Tracking
- "start feature 8" → Mobile App

---

**Total Estimated Timeline:** 20-30 hours for all 8 features (excluding mobile app: 6-12 hours)
