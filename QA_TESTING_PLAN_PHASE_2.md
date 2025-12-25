# 🧪 QA Testing Plan - All 6 Features

**Date:** December 7, 2025  
**Phase:** QA Testing (Staging Environment)  
**Features to Test:** 6  
**Estimated Duration:** 3-5 days

---

## 📋 Executive Summary

This document outlines the comprehensive QA testing plan for all 6 completed features before production deployment:

1. **Feature #3:** Automated Payment Reminders
2. **Feature #4:** SMS Notifications
3. **Feature #5:** Admin Activity Log
4. **Feature #6:** Stripe Webhooks
5. **Scheduled Cron Jobs:** Payment Reminders
6. **Feature #7:** Driver Assignment & Tracking

---

## 🎯 Testing Objectives

### Primary Goals
- ✅ Verify all features work as designed
- ✅ Test integration between features
- ✅ Validate data integrity
- ✅ Confirm error handling
- ✅ Performance validation
- ✅ Security verification
- ✅ User experience validation

### Success Criteria
- All test cases pass
- 0 critical bugs
- 0 security vulnerabilities
- Performance meets benchmarks
- All error messages clear
- API responses correct

---

## 🏗️ Testing Environment Setup

### Prerequisites
```bash
# 1. Deploy to staging
git checkout rbac
git pull origin rbac
npm install
npm run build

# 2. Set staging environment variables
# .env.staging should have:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxx
TWILIO_ACCOUNT_SID=AC_test_xxx
TWILIO_AUTH_TOKEN=test_xxx
TWILIO_PHONE_NUMBER=+1234567890
CRON_SECRET=test_secret_xxx

# 3. Deploy database migrations
npx prisma migrate deploy

# 4. Start application
npm run dev
# or
npm start
```

### Test Accounts Required
```
Admin User:
  Email: admin@test.samui-transfers.local
  Password: TestAdmin123!
  Role: ADMIN

Driver User:
  Email: driver@test.samui-transfers.local
  Password: TestDriver123!
  Role: DRIVER

Customer User:
  Email: customer@test.samui-transfers.local
  Password: TestCustomer123!
  Role: USER

Test Stripe Card:
  Number: 4242 4242 4242 4242
  Expiry: 12/25
  CVC: 123
```

---

## 📊 Feature #3: Payment Reminders - Testing Plan

### 3.1 Database & Service Testing

**Test Case 3.1.1: Reminder Creation**
- [ ] Create booking with future payment date
- [ ] Verify reminder is automatically created
- [ ] Check reminder status is "PENDING"
- [ ] Verify reminder type matches settings (FIRST_REMINDER, SECOND_REMINDER, FINAL_WARNING)

**Test Case 3.1.2: Reminder Sending**
- [ ] Manually trigger reminder job
- [ ] Verify email is sent
- [ ] Check reminder status changes to "SENT"
- [ ] Verify sentAt timestamp is updated

**Test Case 3.1.3: Retry Logic**
- [ ] Simulate email failure
- [ ] Verify nextRetryAt is set
- [ ] Verify retryCount increments
- [ ] Test max retries (should be 3)

### 3.2 Admin Panel Testing

**Test Case 3.2.1: Reminder Settings**
- [ ] Access admin reminder settings
- [ ] Update reminder schedule (e.g., change from 24h to 12h)
- [ ] Verify changes are saved
- [ ] Confirm new reminders use updated schedule

**Test Case 3.2.2: Email Templates**
- [ ] View available email templates
- [ ] Edit template content
- [ ] Verify placeholders work ({bookingId}, {amount}, etc.)
- [ ] Test template preview

**Test Case 3.2.3: Manual Reminder Sending**
- [ ] Find pending booking
- [ ] Manually trigger reminder send
- [ ] Verify email sent immediately
- [ ] Check reminder status updates

### 3.3 Booking Flow Testing

**Test Case 3.3.1: Booking to Payment Reminder Flow**
- [ ] Create booking
- [ ] Complete payment
- [ ] Verify no reminders sent (payment completed)
- [ ] Create another booking, leave unpaid
- [ ] Verify first reminder sent after 24h

**Test Case 3.3.2: Auto-Cancellation**
- [ ] Create booking, leave unpaid
- [ ] Wait for all reminders to be sent
- [ ] Verify booking is auto-cancelled after final warning
- [ ] Check cancellation date is recorded

### 3.4 Email Delivery Testing

**Test Case 3.4.1: Email Content**
- [ ] Receive reminder email
- [ ] Verify all content is present
- [ ] Check formatting (HTML renders correctly)
- [ ] Verify payment link in email works
- [ ] Test on desktop and mobile

**Test Case 3.4.2: Multiple Reminders**
- [ ] Create booking
- [ ] Receive 1st reminder (24h)
- [ ] Receive 2nd reminder (48h)
- [ ] Receive final warning (72h)
- [ ] Verify each has correct message

---

## 📊 Feature #4: SMS Notifications - Testing Plan

### 4.1 SMS Template Testing

**Test Case 4.1.1: Template Rendering**
- [ ] Verify all template types exist
- [ ] Test placeholder replacement
- [ ] Check message length (160 chars)
- [ ] Verify special characters handled correctly

**Test Case 4.1.2: Enabled/Disabled Templates**
- [ ] Disable a template
- [ ] Trigger corresponding event
- [ ] Verify SMS not sent
- [ ] Re-enable template
- [ ] Verify SMS sent again

### 4.2 Admin API Testing

**Test Case 4.2.1: Template Management**
```
POST /api/admin/sms/templates
  - Create new template
  - Verify template saved
  - Test duplicate prevention

GET /api/admin/sms/templates
  - List all templates
  - Verify pagination works
  - Check filtering by messageType

PATCH /api/admin/sms/templates/{id}
  - Update template content
  - Verify changes reflected
```

**Test Case 4.2.2: Admin Settings**
```
GET /api/admin/sms/settings
  - Verify settings structure
  
PATCH /api/admin/sms/settings
  - Update global settings
  - Verify applied to new messages
```

### 4.3 User API Testing

**Test Case 4.3.1: Verification Code**
```
POST /api/sms/verify-code
  - Request verification code
  - Verify code sent via SMS
  - Test code format (6 digits)
  - Verify expiration (5 mins)
```

**Test Case 4.3.2: Phone Number Verification**
```
POST /api/sms/settings/verify-phone
  - Submit code
  - Verify phone number marked as verified
  - Prevent sending without verification
```

**Test Case 4.3.3: User Preferences**
```
PATCH /api/sms/settings
  - Opt-out of SMS
  - Verify SMS not sent
  - Opt-in again
  - Verify SMS sent
```

### 4.4 SMS Delivery Testing

**Test Case 4.4.1: Message Sending**
- [ ] Trigger SMS event (booking confirmation)
- [ ] Receive SMS on test phone
- [ ] Verify message content
- [ ] Check Twilio SID recorded

**Test Case 4.4.2: Multiple Message Types**
- [ ] Booking confirmation SMS
- [ ] Payment reminder SMS
- [ ] Payment confirmation SMS
- [ ] Refund notification SMS
- [ ] Driver assigned SMS

**Test Case 4.4.3: Error Handling**
- [ ] Send to invalid number
- [ ] Verify error logged
- [ ] Check retry scheduled
- [ ] Test max retry limit

### 4.5 Opt-out Flow Testing

**Test Case 4.5.1: Opt-out Process**
- [ ] User opts out from SMS settings
- [ ] Verify flag set in database
- [ ] Trigger SMS event
- [ ] Verify SMS not sent
- [ ] Check "opted out" status recorded

---

## 📊 Feature #5: Activity Log - Testing Plan

### 5.1 Activity Logging Testing

**Test Case 5.1.1: Log Creation**
- [ ] Perform admin action (change user role)
- [ ] Verify activity logged immediately
- [ ] Check all fields populated
- [ ] Verify IP address captured
- [ ] Verify user agent captured

**Test Case 5.1.2: Different Action Types**
- [ ] Log USER_CREATED
- [ ] Log USER_UPDATED
- [ ] Log BOOKING_CONFIRMED
- [ ] Log PAYMENT_PROCESSED
- [ ] Log DRIVER_ASSIGNED
- [ ] Verify each action type logged correctly

**Test Case 5.1.3: Value Tracking**
- [ ] Update user role (USER → ADMIN)
- [ ] Verify oldValues shows {role: "USER"}
- [ ] Verify newValues shows {role: "ADMIN"}
- [ ] Check details field populated

### 5.2 API Endpoint Testing

**Test Case 5.2.1: GET /api/admin/activity**
```
Query Parameters Testing:
  - ?action=USER_CREATED → returns only user creation logs
  - ?resourceType=BOOKING → returns only booking-related logs
  - ?startDate=2025-12-01&endDate=2025-12-07 → date range filtering
  - ?limit=25&offset=0 → pagination (25, 50, 100, 250 items)
  - ?actorId=user123 → filter by admin who performed action

Response Validation:
  - Check logs array populated
  - Verify total count
  - Check hasMore flag
  - Verify pagination offsets
```

**Test Case 5.2.2: GET /api/admin/activity/[resourceType]/[resourceId]**
```
Test Cases:
  - /api/admin/activity/BOOKING/booking-123 → all changes to booking
  - /api/admin/activity/USER/user-456 → all changes to user
  - /api/admin/activity/PAYMENT/payment-789 → all changes to payment

Verify:
  - Returns complete history in order
  - Each entry shows change details
  - Includes timestamps
```

**Test Case 5.2.3: Admin Role Verification**
- [ ] Access /api/admin/activity as regular user
- [ ] Verify 403 Forbidden response
- [ ] Access as admin
- [ ] Verify 200 OK response

### 5.3 UI Dashboard Testing

**Test Case 5.3.1: Table Display**
- [ ] Navigate to Activity Log dashboard
- [ ] Verify table loads
- [ ] Check all columns visible (Timestamp, Actor, Action, Resource, Details, IP)
- [ ] Verify data populates
- [ ] Check row count matches pagination

**Test Case 5.3.2: Filtering**
- [ ] Filter by action type
- [ ] Verify only matching entries shown
- [ ] Filter by resource type
- [ ] Filter by date range
- [ ] Combine multiple filters
- [ ] Click "Clear Filters" button
- [ ] Verify filters reset

**Test Case 5.3.3: Pagination**
- [ ] Load page 1
- [ ] Verify 50 items shown
- [ ] Click next page arrow
- [ ] Verify page 2 loads
- [ ] Change items per page to 100
- [ ] Verify display updates
- [ ] Navigate to last page
- [ ] Verify next button disabled

**Test Case 5.3.4: CSV Export**
- [ ] Click "Export CSV" button
- [ ] Verify file downloads
- [ ] Open CSV in Excel
- [ ] Verify headers match columns
- [ ] Check data integrity
- [ ] Verify all filtered rows included

**Test Case 5.3.5: UI Responsiveness**
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Verify table scrolls horizontally on mobile
- [ ] Check all buttons clickable

---

## 📊 Feature #6: Stripe Webhooks - Testing Plan

### 6.1 Webhook Signature Verification

**Test Case 6.1.1: Valid Signature**
- [ ] Send webhook with valid signature
- [ ] Verify webhook processed
- [ ] Check event recorded

**Test Case 6.1.2: Invalid Signature**
- [ ] Send webhook with bad signature
- [ ] Verify webhook rejected (403)
- [ ] Check error logged

**Test Case 6.1.3: Replay Attack Prevention**
- [ ] Send webhook
- [ ] Resend same webhook
- [ ] Verify duplicate handling (should be idempotent)

### 6.2 Payment Intent Events

**Test Case 6.2.1: payment_intent.succeeded**
- [ ] Create booking with pending payment
- [ ] Process successful payment in Stripe
- [ ] Verify webhook triggers
- [ ] Check booking status → CONFIRMED
- [ ] Verify confirmation email sent
- [ ] Check activity logged

**Test Case 6.2.2: payment_intent.payment_failed**
- [ ] Attempt payment with test card 4000000000000002
- [ ] Verify webhook triggers
- [ ] Check booking status stays PENDING
- [ ] Verify failure email sent to customer
- [ ] Check failure reason recorded

**Test Case 6.2.3: charge.refunded**
- [ ] Refund payment from Stripe dashboard
- [ ] Verify webhook triggers
- [ ] Check booking status → CANCELLED
- [ ] Verify refund email sent
- [ ] Check refund amount recorded

### 6.3 Event Logging

**Test Case 6.3.1: Event Recording**
- [ ] Process multiple webhook events
- [ ] Verify all in PaymentWebhook table
- [ ] Check eventType recorded correctly
- [ ] Verify externalId unique
- [ ] Check processed flag set

**Test Case 6.3.2: Error Handling**
- [ ] Send malformed webhook payload
- [ ] Verify error logged
- [ ] Check processed=false
- [ ] Verify errorMessage populated

### 6.4 Customer Notifications

**Test Case 6.4.1: Payment Confirmation Email**
- [ ] Complete successful payment
- [ ] Check confirmation email received
- [ ] Verify all details present (amount, date, reference)
- [ ] Test email links work

**Test Case 6.4.2: Payment Failure Email**
- [ ] Fail a payment
- [ ] Check failure email received
- [ ] Verify error reason explained
- [ ] Check retry link present

---

## 📊 Scheduled Jobs - Testing Plan

### Cron Job Testing

**Test Case Cron.1: Job Execution**
- [ ] Verify cron job triggers at scheduled time
- [ ] Check /api/cron/payment-reminders called
- [ ] Verify CRON_SECRET verified
- [ ] Check job completes without error

**Test Case Cron.2: Job Processing**
- [ ] Verify processPaymentReminders() executes
- [ ] Check all pending reminders sent
- [ ] Verify reminders marked as SENT
- [ ] Check sentAt timestamps updated

**Test Case Cron.3: Timing**
- [ ] Job scheduled for 30-minute intervals
- [ ] Verify actual execution timing
- [ ] Check no missed executions
- [ ] Verify no duplicate executions

**Test Case Cron.4: Error Recovery**
- [ ] Simulate database error during job
- [ ] Verify error logged
- [ ] Check next execution still scheduled
- [ ] Verify data consistency

---

## 📊 Feature #7: Driver System - Testing Plan

### 7.1 Driver Registration

**Test Case 7.1.1: Register Driver**
```
POST /api/admin/drivers
  - Submit driver registration
  - Required: userId, licenseNumber, licenseExpiry, vehicleType, registrationNumber
  - Verify driver created
  - Check status = "offline"
  - Verify acceptingRides = true
```

**Test Case 7.1.2: Validation**
- [ ] Try duplicate license number
- [ ] Verify 409 Conflict response
- [ ] Try non-existent user
- [ ] Verify 404 response
- [ ] Try missing required fields
- [ ] Verify 400 Bad Request

### 7.2 Location Tracking

**Test Case 7.2.1: Update Location**
```
PATCH /api/drivers/location
  - latitude: 8.7245
  - longitude: 100.5931
  - Verify driver location updated
  - Check locationUpdatedAt timestamp
```

**Test Case 7.2.2: Real-time Updates**
- [ ] Update location multiple times
- [ ] Verify coordinates change
- [ ] Check timestamps increment
- [ ] Verify location accuracy (8 decimals)

**Test Case 7.2.3: Geolocation Integration**
- [ ] Open Driver Dashboard
- [ ] Allow browser geolocation permission
- [ ] Verify location auto-updates
- [ ] Check display refreshes
- [ ] Test on mobile device

### 7.3 Driver Assignment

**Test Case 7.3.1: Assign Driver**
```
POST /api/drivers/assignments
  - driverId: "driver-123"
  - bookingId: "booking-456"
  - Verify assignment created
  - Check status = "assigned"
  - Verify driver status changes to "busy"
```

**Test Case 7.3.2: Find Nearby Drivers**
- [ ] Create multiple drivers at different locations
- [ ] Call findNearbyDrivers(lat, lon, 5km)
- [ ] Verify drivers sorted by rating first, then distance
- [ ] Check distance calculation correct
- [ ] Verify only drivers within radius returned

**Test Case 7.3.3: Assignment Validation**
- [ ] Try assigning offline driver
- [ ] Verify error (driver not available)
- [ ] Try double-booking same booking
- [ ] Verify 409 error

### 7.4 Trip Completion

**Test Case 7.4.1: Complete Assignment**
```
PATCH /api/drivers/assignments
  - assignmentId: "assignment-123"
  - action: "complete"
  - rating: 5
  - comment: "Great service!"
  - Verify status = "completed"
  - Check driver status = "available"
  - Verify rating recorded
```

**Test Case 7.4.2: Rating Calculation**
- [ ] Complete 5 trips with ratings (5,4,5,3,4)
- [ ] Check averageRating = 4.2
- [ ] Verify totalReviews = 5
- [ ] Complete another trip (4 stars)
- [ ] Check averageRating = 4.17 (rounded)

### 7.5 Driver Dashboard

**Test Case 7.5.1: Status Display**
- [ ] Open Driver Dashboard
- [ ] Verify current status shown
- [ ] Check accept rides toggle
- [ ] Click status buttons
- [ ] Verify status changes

**Test Case 7.5.2: Location Display**
- [ ] Verify coordinates shown
- [ ] Check precision (8 decimals)
- [ ] Verify last update timestamp
- [ ] Location updates in real-time

**Test Case 7.5.3: Performance Metrics**
- [ ] Verify average rating displayed
- [ ] Check trip counts (total, completed, cancelled)
- [ ] Verify completion rate percentage
- [ ] Check monthly trip count

**Test Case 7.5.4: Current Assignment**
- [ ] When assignment active, verify shown
- [ ] Check booking details displayed
- [ ] When no assignment, verify empty state
- [ ] Complete assignment, verify cleared

---

## 🔗 Integration Testing

### 7.1 Cross-Feature Integration

**Test Case I.1: Activity Log Integration**
- [ ] Register driver
- [ ] Verify activity logged (DRIVER_ASSIGNED)
- [ ] Assign driver to booking
- [ ] Verify activity logged
- [ ] Complete assignment
- [ ] Verify activity logged

**Test Case I.2: SMS Integration**
- [ ] Assign driver to booking
- [ ] Verify driver SMS sent
- [ ] Customer receives booking confirmation
- [ ] Verify SMS template used correctly

**Test Case I.3: Payment Reminders Integration**
- [ ] Create booking (unpaid)
- [ ] Assign driver
- [ ] Verify reminder created separately
- [ ] Confirm both reminder and driver SMS sent

**Test Case I.4: Webhook Integration**
- [ ] Complete payment via Stripe
- [ ] Verify webhook triggers
- [ ] Check booking confirmed
- [ ] Verify driver can be assigned
- [ ] Check activity logged

---

## 📈 Performance Testing

### Load Testing

**Test Case P.1: Activity Log Performance**
- [ ] Generate 10,000 activity log entries
- [ ] Query with various filters
- [ ] Measure response time (should be < 500ms)
- [ ] Test pagination with large datasets
- [ ] CSV export with 10k rows (should complete in < 5s)

**Test Case P.2: Driver Location Updates**
- [ ] Simulate 100 drivers updating location simultaneously
- [ ] Measure update latency (should be < 1s)
- [ ] Check no data corruption
- [ ] Verify database indexes working

**Test Case P.3: Reminder Job Performance**
- [ ] Create 1,000 pending reminders
- [ ] Run cron job
- [ ] Measure job completion time (should be < 60s)
- [ ] Verify all reminders processed
- [ ] Check no timeouts

---

## 🔐 Security Testing

### Authentication & Authorization

**Test Case S.1: API Authorization**
- [ ] Activity Log endpoints require ADMIN role
- [ ] Try accessing as regular user
- [ ] Verify 403 Forbidden
- [ ] Admin can access
- [ ] Verify 200 OK

**Test Case S.2: Driver Location Updates**
- [ ] Only authenticated drivers can update location
- [ ] Try updating another driver's location
- [ ] Verify 403 Forbidden

**Test Case S.3: Driver Assignment**
- [ ] Only admins can assign drivers
- [ ] Try assigning as regular user
- [ ] Verify 403 Forbidden

### Data Security

**Test Case S.4: Sensitive Data**
- [ ] No passwords in activity logs
- [ ] No credit card info in logs
- [ ] No SMS content in logs (only metadata)
- [ ] Location data properly secured

**Test Case S.5: Webhook Security**
- [ ] Invalid signatures rejected
- [ ] Replay attacks prevented
- [ ] Webhook URL only accessible from Stripe IPs

---

## 🐛 Bug Testing

### Error Scenarios

**Test Case B.1: Missing Fields**
- [ ] Submit form with blank fields
- [ ] Verify validation errors shown
- [ ] Check error messages clear

**Test Case B.2: Invalid Data Types**
- [ ] Submit text in number field
- [ ] Submit future date as past
- [ ] Verify error handling

**Test Case B.3: Database Failures**
- [ ] Kill database connection
- [ ] Verify graceful error handling
- [ ] Check user sees friendly message
- [ ] Verify logs contain error details

---

## 📋 Test Execution Checklist

### Day 1: Feature #3 & #4
- [ ] Reminder system complete
- [ ] SMS notifications complete
- [ ] Integration tested

### Day 2: Feature #5 & #6
- [ ] Activity log complete
- [ ] Stripe webhooks complete
- [ ] Cron jobs verified

### Day 3: Feature #7
- [ ] Driver system complete
- [ ] Location tracking tested
- [ ] Performance validated

### Day 4: Integration & Security
- [ ] Cross-feature integration verified
- [ ] Security audit passed
- [ ] Performance benchmarks met

### Day 5: Final Verification
- [ ] All bugs fixed
- [ ] Documentation updated
- [ ] Ready for production

---

## 📊 Test Results Template

```markdown
# Test Results - [Feature Name]

## Summary
- Total Tests: X
- Passed: ✅ X
- Failed: ❌ X
- Skipped: ⏭️ X
- Success Rate: X%

## Failed Tests
1. [Test Name] - [Description] - [Fix]
2. ...

## Performance Results
- Average Response Time: Xms
- Max Response Time: Xms
- Error Rate: X%

## Security Findings
- Critical: X
- High: X
- Medium: X
- Low: X

## Recommendations
1. ...
2. ...

## Sign-off
- QA Lead: ________________
- Date: ________________
- Ready for Production: ☐ YES ☐ NO
```

---

## 🎯 Success Criteria

### Must Pass
- ✅ All 50+ test cases pass
- ✅ 0 critical bugs
- ✅ 0 security vulnerabilities
- ✅ All error messages working
- ✅ All email/SMS sent correctly

### Performance Targets
- ✅ API response time < 500ms (95th percentile)
- ✅ Cron job completes in < 60 seconds
- ✅ CSV export < 5 seconds for 10k rows
- ✅ Location update < 1 second

### Quality Gates
- ✅ 0 TypeScript errors
- ✅ All components render without console errors
- ✅ Mobile responsive on all screen sizes
- ✅ Accessibility WCAG AA compliance

---

## 📞 Test Execution Notes

**Test Lead:** [Name]  
**Test Date:** December 8-12, 2025  
**Environment:** Staging  
**Database:** PostgreSQL (Neon) - Staging  
**Duration:** 3-5 days

---

**QA Plan Created:** December 7, 2025  
**Status:** Ready for Execution  
**Next Phase:** Execute tests, document results, fix bugs
