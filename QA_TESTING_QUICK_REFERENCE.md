# 🚀 QA Testing Quick Reference Guide

**For:** QA Engineers, Product Managers, DevOps  
**Features:** 6 (Features #3-7 + Cron Jobs)  
**Duration:** 5 days  
**Status:** Ready to Execute

---

## ⚡ Quick Links

- **Full QA Plan:** `QA_TESTING_PLAN_PHASE_2.md`
- **Execution Checklist:** `QA_TESTING_EXECUTION_CHECKLIST.md` 
- **Feature Documentation:** `FEATURES_5_7_DOCUMENTATION_INDEX.md`
- **Code Reference:** `IMPLEMENTATION_REPORT_FEATURES_5_7.md`

---

## 📅 Testing Timeline

| Day | Features | Focus | Estimated Tests |
|-----|----------|-------|-----------------|
| **1** | #3, #4 | Reminders & SMS | 30 tests |
| **2** | #5, #6 | Activity Log & Webhooks | 42 tests |
| **3** | Cron, #7 | Jobs & Drivers | 56 tests |
| **4** | Integration | Cross-feature flows | 24 tests |
| **5** | Performance & Security | Load, perf, security | 28 tests |
| **Total** | - | - | **180 tests** |

---

## 🔑 Key Test Credentials

```
ADMIN USER
  Email: admin@test.samui-transfers.local
  Password: TestAdmin123!
  Role: ADMIN
  Permissions: All features

DRIVER USER
  Email: driver@test.samui-transfers.local
  Password: TestDriver123!
  Role: DRIVER
  Permissions: Location updates, assignments

CUSTOMER USER
  Email: customer@test.samui-transfers.local
  Password: TestCustomer123!
  Role: USER
  Permissions: Bookings, payments

TEST STRIPE CARD
  Number: 4242 4242 4242 4242
  Expiry: 12/25
  CVC: 123

TEST TWILIO
  Use Twilio test credentials
  No actual SMS sent in staging
```

---

## 🎯 Critical Test Cases by Feature

### Feature #3: Payment Reminders (Top 5)
1. ✅ Reminder created automatically on booking
2. ✅ Emails sent at correct times (24h, 48h, 72h)
3. ✅ Booking auto-cancelled if unpaid
4. ✅ Retry logic works on email failure
5. ✅ Admin can manually send reminders

### Feature #4: SMS Notifications (Top 5)
1. ✅ Verification code SMS sent
2. ✅ Booking confirmation SMS sent
3. ✅ Opt-out prevents SMS
4. ✅ Opt-in allows SMS again
5. ✅ Error handling for invalid numbers

### Feature #5: Activity Log (Top 5)
1. ✅ All actions logged with timestamps
2. ✅ Filters work (action, resource, date, actor)
3. ✅ CSV export includes all data
4. ✅ Admin role required (auth check)
5. ✅ Performance acceptable (10k+ records)

### Feature #6: Stripe Webhooks (Top 5)
1. ✅ Valid signatures accepted
2. ✅ Invalid signatures rejected
3. ✅ payment_intent.succeeded updates booking
4. ✅ charge.refunded processes refund
5. ✅ Idempotency prevents duplicates

### Cron Jobs (Top 3)
1. ✅ Job executes on schedule
2. ✅ All pending reminders processed
3. ✅ Error recovery works

### Feature #7: Driver System (Top 5)
1. ✅ Driver registration & validation
2. ✅ Real-time location tracking
3. ✅ Intelligent assignment (rating + distance)
4. ✅ Trip completion with rating
5. ✅ Performance metrics calculation

---

## 🚨 High-Risk Areas

### Feature #3: Payment Reminders
- ⚠️ **Race condition:** Booking payment received during reminder send
  - Fix: Check payment status before sending
- ⚠️ **Email delivery:** Spam filters may catch reminders
  - Fix: Use authenticated domain, test in staging
- ⚠️ **Timezone issues:** Reminder times in different timezones
  - Fix: Verify times calculated in user's timezone

### Feature #4: SMS Notifications
- ⚠️ **Cost overruns:** Twilio charges per SMS
  - Fix: Test with small numbers, track costs
- ⚠️ **Rate limiting:** Twilio may rate-limit high volume
  - Fix: Implement backoff strategy
- ⚠️ **Opt-out compliance:** TCPA requires opt-out respect
  - Fix: Verify opt-out prevents all SMS

### Feature #5: Activity Log
- ⚠️ **Storage growth:** Logs grow indefinitely
  - Fix: Implement archival strategy
- ⚠️ **Performance:** Large tables slow queries
  - Fix: Verify indexes used
- ⚠️ **Data sensitivity:** Logs contain user data
  - Fix: Verify no passwords/credit cards logged

### Feature #6: Stripe Webhooks
- ⚠️ **Signature verification:** Critical security
  - Fix: Test invalid signature rejection
- ⚠️ **Duplicate handling:** Same event sent twice
  - Fix: Verify idempotency
- ⚠️ **Race condition:** Event before booking exists
  - Fix: Handle gracefully

### Feature #7: Driver System
- ⚠️ **Location privacy:** Drivers location always visible
  - Fix: Verify admin-only access
- ⚠️ **Distance calculation:** Haversine formula accuracy
  - Fix: Test with known coordinates
- ⚠️ **Real-time updates:** Browser geolocation battery drain
  - Fix: Test on mobile for performance

---

## 🧪 Test Data Setup

### Create 10 Bookings for Testing
```bash
# Use admin panel or API to create:
- 5 unpaid bookings (for reminder testing)
- 3 paid bookings (for driver assignment)
- 2 cancelled bookings (for webhook testing)
```

### Create 5 Test Drivers
```bash
# Register drivers at different locations:
- Bangkok center (13.7563, 100.5018)
- Airport area (13.9250, 100.7503)
- Phuket (8.6753, 98.4063)
- Pattaya (12.9356, 100.8772)
- Chiang Mai (18.7883, 98.9853)
```

### Create Test Reminders
```bash
# Create bookings with different due dates:
- Due 24h from now (for first reminder)
- Due 48h from now (for second reminder)
- Due 72h from now (for final warning)
```

---

## ✅ Daily Standup Checklist

### Each Morning
- [ ] Review overnight test results
- [ ] Check for critical issues
- [ ] Verify staging environment healthy
- [ ] Database backups completed
- [ ] Email/SMS delivery working
- [ ] Monitoring alerts checked

### Each Evening
- [ ] Summarize day's test results
- [ ] Document issues found
- [ ] Plan next day tests
- [ ] Update checklist progress
- [ ] Notify team of blockers

---

## 🔍 Common Testing Patterns

### Testing Payment Reminder Flow
```
1. Create booking
2. DO NOT pay
3. Wait 24 hours (or manually trigger cron)
4. Verify first reminder email received
5. Wait 24 hours
6. Verify second reminder email received
7. Wait 24 hours
8. Verify final warning email received
9. Wait 24 hours
10. Verify booking auto-cancelled
11. Verify no more reminders sent
```

### Testing Driver Assignment Flow
```
1. Create booking
2. Pay booking
3. As admin, call findNearbyDrivers(lat, lon)
4. Verify sorted by rating desc, then distance asc
5. Assign top-rated nearby driver
6. Verify driver gets SMS
7. Verify booking status updated
8. Simulate driver completion with rating
9. Verify average rating updated
10. Verify activity logged
```

### Testing Activity Log Flow
```
1. Perform admin action (e.g., update user)
2. Check activity logged immediately
3. Filter by action type
4. Filter by resource type
5. Filter by date range
6. Verify old/new values shown
7. Verify IP address captured
8. Export to CSV
9. Verify data matches
10. Performance check with 10k records
```

---

## 📊 Success Metrics

### Functional Testing
- Target: 100% of test cases pass
- Acceptable: 95%+ (minor UI issues acceptable)
- Failure: < 90%

### Performance Testing
- Activity Log queries: < 500ms (95th percentile)
- Cron job completion: < 60 seconds
- CSV export 10k rows: < 5 seconds
- Driver location update: < 1 second

### Security Testing
- 0 critical vulnerabilities
- Auth checks on all admin endpoints
- No sensitive data in logs
- Webhook signature validation working

### User Experience
- All error messages clear
- Mobile responsive
- Accessibility compliant
- Email formatting correct

---

## 🐛 Issue Severity Guide

### Critical 🔴
- Complete feature unavailable
- Data loss or corruption
- Security vulnerability
- System crash
- **Action:** Stop testing, fix immediately

### High 🟠
- Feature partially broken
- Email/SMS not sent
- Wrong calculations
- Auth bypass
- **Action:** Fix before production

### Medium 🟡
- Minor UI bug
- Performance slow (not critical)
- Missing validation message
- Typo in email
- **Action:** Fix if time allows

### Low 🟢
- UI inconsistency
- Minor performance issue
- Cosmetic issue
- **Action:** Document for future

---

## 📞 Escalation Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| QA Lead | [Name] | [Phone] | [Email] |
| Backend Lead | [Name] | [Phone] | [Email] |
| DevOps Lead | [Name] | [Phone] | [Email] |
| Product Owner | [Name] | [Phone] | [Email] |
| Emergency | [Oncall] | [Phone] | [Email] |

---

## 🚀 Pre-Production Sign-off

Before deploying to production:

### QA Checklist
- [ ] 180 test cases executed
- [ ] All critical issues fixed
- [ ] High priority issues fixed
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Documentation updated

### Backend Checklist
- [ ] Code review complete
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Database migrations tested
- [ ] Rollback plan prepared

### DevOps Checklist
- [ ] Production environment ready
- [ ] Monitoring configured
- [ ] Alerting configured
- [ ] Deployment scripts tested
- [ ] Backup strategy verified
- [ ] Rollback procedure tested

### Product Checklist
- [ ] Features meet requirements
- [ ] User documentation ready
- [ ] Support team trained
- [ ] Release notes prepared
- [ ] Customer communication ready

---

## 📚 Reference Documentation

### For Backend Issues
- `IMPLEMENTATION_REPORT_FEATURES_5_7.md` - Code architecture
- `DATABASE_SCHEMA_REFERENCE.md` - Database design

### For API Issues
- `API_REFERENCE.md` - API endpoint documentation
- `AUTH_QUICK_REFERENCE.md` - Authentication details

### For Feature Details
- Feature #3: Payment reminders service layer in `lib/audit/service.ts`
- Feature #4: SMS templates in admin panel
- Feature #5: Activity log in `lib/audit/service.ts`
- Feature #6: Webhook handler in `app/api/webhooks/stripe.ts`
- Feature #7: Driver service in `lib/driver/service.ts`

---

## 💡 Pro Tips

1. **Automate Boring Tests:** Use Postman for API testing
2. **Test in Parallel:** Run independent tests simultaneously
3. **Document As You Go:** Don't wait until end of day
4. **Verify Fixes:** Test fixed issue + related features
5. **Use Test Data:** Create consistent test data sets
6. **Check Logs:** Always check backend logs for errors
7. **Mobile First:** Test mobile early, issues are usually there
8. **Backup Database:** Reset to clean state between test runs
9. **Monitor Resources:** Watch CPU, memory, database during load tests
10. **Celebrate Wins:** All tests pass = ready for production! 🎉

---

## 📋 During Testing

### When Test Fails
1. Reproduce the issue
2. Document exact steps
3. Capture screenshot/video
4. Check backend logs
5. Check database state
6. Report with severity
7. Re-test after fix

### When You Find a Bug
1. Note feature affected
2. Note steps to reproduce
3. Check if it's new or regression
4. Determine severity
5. Create GitHub issue (if not already done)
6. Tag appropriate engineer
7. Update checklist

### When Performance is Slow
1. Check network tab
2. Check backend response time
3. Check database queries
4. Profile frontend (React DevTools)
5. Document baseline
6. Report with metrics

---

## ✨ Success Indicators

You'll know testing is going well when:

✅ Most test cases passing on first run  
✅ Issues found are minor (UI, not logic)  
✅ Email/SMS delivery working consistently  
✅ API response times under benchmarks  
✅ No security vulnerabilities found  
✅ Mobile experience smooth  
✅ Activity log capturing all events  
✅ Driver assignments working correctly  
✅ Payment reminders sending on schedule  
✅ Team confident about production release  

---

## 🎯 Final Goal

**Achieve production-ready quality:** All features working correctly, performant, secure, and user-friendly.

**Target:** 100% test pass rate, 0 critical issues, ready for production deployment by end of day 5.

---

**QA Guide Version:** 1.0  
**Created:** December 7, 2025  
**Status:** Ready for QA Team
