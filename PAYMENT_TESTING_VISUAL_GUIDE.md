# 💳 Payment Testing Visual Guide

**Last Updated:** December 4, 2024  
**Status:** ✅ Complete for Stripe & PayPal testing

---

## 🎯 Quick Start Testing

### Before You Start:
1. ✅ Ensure you have Stripe test keys in `.env.local`
2. ✅ Ensure you have PayPal sandbox credentials in `.env.local`
3. ✅ Open your app at `http://localhost:3000`
4. ✅ Check browser console for errors (F12)
5. ✅ Have admin dashboard ready to verify payments

---

## 💳 STRIPE TESTING GUIDE

### Step 1: Access the Payment Form

```
1. Go to: http://localhost:3000/booking
2. Fill in booking details (location, date, time, passengers)
3. Click "Confirm & Pay"
4. BookingConfirmationModal appears
5. Click "Show Payment Form"
6. Stripe payment form displays
```

### Step 2: Test Cards - Success Scenarios

#### 🟢 VISA - Successful Payment
```
Card Number:     4242 4242 4242 4242
Expiry:          Any future date (e.g., 12/25)
CVC:             Any 3 digits (e.g., 123)
ZIP:             Any 5 digits (e.g., 12345)

Expected Result:
✅ Payment succeeds
✅ Success page displays
✅ Booking status: CONFIRMED
✅ Email receipt sent
✅ Admin dashboard shows payment
```

#### 🟢 VISA DEBIT - Alternative Success
```
Card Number:     4000 0566 5566 5556
Expiry:          Any future date
CVC:             Any 3 digits
ZIP:             Any 5 digits

Expected Result:
✅ Payment succeeds
✅ Alternative card confirmation
✅ Same flow as above
```

#### 🟢 MASTERCARD - Successful Payment
```
Card Number:     5555 5555 5555 4444
Expiry:          Any future date
CVC:             Any 3 digits
ZIP:             Any 5 digits

Expected Result:
✅ Payment succeeds
✅ MasterCard confirmation
✅ Same flow as above
```

### Step 3: Test Cards - Failure Scenarios

#### 🔴 CARD DECLINED
```
Card Number:     4000 0000 0000 0002
Expiry:          Any future date
CVC:             Any 3 digits
ZIP:             Any 5 digits

Expected Result:
❌ Payment declined
🔴 Error message: "Your card was declined"
🔴 Redirect to error page
🔴 Option to retry
🔴 Booking status: PENDING (not confirmed)
```

#### 🔴 INSUFFICIENT FUNDS
```
Card Number:     4000 0000 0000 9995
Expiry:          Any future date
CVC:             Any 3 digits
ZIP:             Any 5 digits

Expected Result:
❌ Insufficient funds error
🔴 Clear error message
🔴 Redirect to error page
🔴 Retry button available
```

#### 🔴 LOST CARD
```
Card Number:     4000 0000 0000 9987
Expiry:          Any future date
CVC:             Any 3 digits
ZIP:             Any 5 digits

Expected Result:
❌ Payment declined
🔴 Card reported lost/stolen
🔴 Error page shown
🔴 Contact support message
```

#### 🔴 EXPIRED CARD
```
Card Number:     4000 0000 0000 0069
Expiry:          Any past date (e.g., 01/20)
CVC:             Any 3 digits
ZIP:             Any 5 digits

Expected Result:
❌ Expired card error
🔴 "Card expired" message
🔴 Error page redirect
```

#### 🔴 INCORRECT CVC
```
Card Number:     4000 0000 0000 0127
Expiry:          Any future date
CVC:             999 (wrong CVC)
ZIP:             Any 5 digits

Expected Result:
❌ CVC validation failed
🔴 "Incorrect security code" message
🔴 Error handling
```

### Step 4: Stripe Test Card Flow Diagram

```
Payment Form Loaded
        ↓
Enter Card: 4242 4242 4242 4242
        ↓
Enter Expiry: 12/25
        ↓
Enter CVC: 123
        ↓
Click "Pay"
        ↓
Stripe validates → ✅ Success
        ↓
createPayment() API called
        ↓
Payment record created (PROCESSING)
        ↓
completePayment() called
        ↓
Booking status: CONFIRMED
        ↓
Email receipt sent
        ↓
Redirect to /booking/success
        ↓
Admin sees payment in dashboard
```

### Step 5: Verify Stripe Payment in Admin Dashboard

```
1. Go to: http://localhost:3000/admin/payments
2. Look for payment in list
3. Status should be: COMPLETED
4. Method should be: stripe
5. Amount should match booking price
6. Click "View" to see details
7. Check transaction ID
8. Verify booking link
9. Check webhook events
```

### Step 6: Stripe Webhook Testing (Local Development)

```
Install Stripe CLI:
  macOS: brew install stripe/stripe-cli/stripe
  Linux: Follow https://stripe.com/docs/stripe-cli

Login to Stripe:
  stripe login

Forward webhooks to local:
  stripe listen --forward-to localhost:3000/api/payments/stripe/webhook

In another terminal, run your app:
  npm run dev

Trigger test event:
  stripe trigger payment_intent.succeeded

Expected:
✅ Webhook received
✅ Payment webhook event logged
✅ paymentWebhook record created
✅ Browser shows success
```

---

## 🅿️ PAYPAL TESTING GUIDE

### Step 1: Access PayPal Payment Form

```
1. Go to: http://localhost:3000/booking
2. Fill in booking details
3. Click "Confirm & Pay"
4. Click "Show Payment Form"
5. Select PayPal from payment method dropdown
6. PayPal button appears
```

### Step 2: PayPal Sandbox Credentials

#### Seller Account (Business)
```
Email:    sb-xxxxx@business.example.com
Password: Get from PayPal Developer Dashboard

Use for:
- Setting up orders
- Receiving payments
- Testing capture
```

#### Buyer Account (Personal)
```
Email:    sb-xxxxx@personal.example.com
Password: Get from PayPal Developer Dashboard

Use for:
- Completing payments
- Testing from customer perspective
- Testing payment flows
```

**To Get Credentials:**
1. Go to: https://developer.paypal.com
2. Login with your developer account
3. Go to Sandbox accounts
4. Find Business and Personal accounts
5. Click "Show" to reveal passwords

### Step 3: PayPal Successful Payment Flow

```
1. User on booking page
2. Fills booking details
3. Clicks "Confirm & Pay"
4. Modal shows with PayPal button
5. Clicks "Pay with PayPal"
6. Redirected to PayPal login
7. Login with personal account:
   - Email: sb-xxxxx@personal.example.com
   - Password: xxxxxxxx
8. Reviews order amount
9. Clicks "Approve"
10. Redirected back to app
11. Order captured
12. Payment success page shown
13. Email receipt sent
14. Admin dashboard updated
```

### Step 4: PayPal Test Scenarios

#### 🟢 SUCCESSFUL PAYMENT
```
Buyer Email:     sb-xxxxx@personal.example.com
Amount:          Auto-calculated from booking
Status:          COMPLETED

Expected Flow:
✅ PayPal popup opens
✅ Login with sandbox account
✅ Approve payment
✅ Return to app
✅ Success page shows
✅ Payment recorded
✅ Email sent
```

#### 🟢 APPROVED THEN DENIED
```
Trigger: Use special test amount

Note: Some payment methods may require
additional verification - PayPal handles this

Expected:
✅ Handles multiple verification attempts
✅ Or shows authorization required message
```

#### 🔴 PAYMENT DENIED
```
Trigger: Use invalid buyer account
Or: Insufficient funds in sandbox account

Expected:
❌ PayPal shows error
🔴 Return to error page
🔴 Retry option available
```

### Step 5: PayPal Testing Without Login

```
For quick testing without full sandbox flow:

Set test mode in browser console:
  window.localStorage.setItem('paypal_test_mode', 'true')

Or use Test-Driven button directly
```

### Step 6: PayPal Webhook Testing

```
In PayPal Developer Dashboard:

1. Navigate to Sandbox Settings
2. Go to Webhook endpoints
3. Add webhook URL:
   https://your-app.com/api/payments/paypal/webhook

4. Select events to listen for:
   - CHECKOUT.ORDER.APPROVED
   - CHECKOUT.ORDER.COMPLETED
   - PAYMENT.CAPTURE.COMPLETED

5. Test webhook (send test event)

Expected:
✅ Webhook received by your app
✅ Event logged in database
✅ Payment updated if needed
```

---

## 📊 Testing Checklist - Stripe

- [ ] Create booking
- [ ] Open payment form
- [ ] Select Stripe
- [ ] Enter 4242 4242 4242 4242
- [ ] Enter future expiry date
- [ ] Enter any CVC
- [ ] Click Pay
- [ ] Wait for success page
- [ ] Verify email received
- [ ] Check admin dashboard
- [ ] View payment details
- [ ] Confirm transaction ID
- [ ] Check webhook events
- [ ] Test with declined card 4000 0000 0000 0002
- [ ] Verify error page shows
- [ ] Test retry flow
- [ ] Test cancel flow

---

## 📊 Testing Checklist - PayPal

- [ ] Create booking
- [ ] Open payment form
- [ ] Select PayPal
- [ ] Click PayPal button
- [ ] Login with sandbox account
- [ ] Approve payment
- [ ] Return to app
- [ ] Wait for success page
- [ ] Verify email received
- [ ] Check admin dashboard
- [ ] View payment details
- [ ] Confirm order ID
- [ ] Test without funds
- [ ] Verify error handling
- [ ] Test webhook receipt
- [ ] Confirm webhook logged

---

## 🔧 Troubleshooting Payment Tests

### Issue: Payment form not loading
```
Solution:
1. Check STRIPE_PUBLIC_KEY in .env.local
2. Check NEXT_PUBLIC_PAYPAL_CLIENT_ID in .env.local
3. Run: npm run dev
4. Refresh browser (Ctrl+R)
5. Check console for errors (F12)
```

### Issue: "Error loading script from Stripe"
```
Solution:
1. Check internet connection
2. Verify .env.local has STRIPE_PUBLIC_KEY
3. Clear browser cache: Ctrl+Shift+Delete
4. Check Stripe account is in test mode
5. Check API key is not restricted
```

### Issue: "PayPal button not appearing"
```
Solution:
1. Verify NEXT_PUBLIC_PAYPAL_CLIENT_ID in .env.local
2. Check PayPal sandbox is active
3. Verify client ID is for SANDBOX not LIVE
4. Clear localStorage: F12 → Storage → Local Storage → Clear
5. Hard refresh page: Ctrl+Shift+R
```

### Issue: Card declined but should work
```
Solution:
1. Use correct test card number (4242 4242 4242 4242)
2. Use future expiry date (not past date)
3. Use any 3-digit CVC
4. Use any 5-digit ZIP
5. Don't use real card numbers
```

### Issue: Payment succeeds but not in admin
```
Solution:
1. Check payment record created:
   - SELECT * FROM "Payment" WHERE status='COMPLETED'
2. Check booking updated:
   - SELECT * FROM "Booking" WHERE status='CONFIRMED'
3. Check email sent (console log)
4. Refresh admin dashboard
5. Check payment status in details page
```

### Issue: Email not sending
```
Solution:
1. Check RESEND_API_KEY is set (production only)
2. In development, check console for email log
3. Verify NEXT_PUBLIC_FROM_EMAIL is set
4. Check email service is not throwing errors
5. Test with: curl -X POST http://localhost:3000/api/payments/stripe/...
```

---

## 📈 Payment Testing Workflow

```
Start Testing
    ↓
┌─────────────────────────────────┐
│ Test Stripe Success             │
│ └─ 4242 4242 4242 4242          │
│ └─ Verify success page          │
│ └─ Check admin dashboard        │
└──────────┬──────────────────────┘
           ↓
┌─────────────────────────────────┐
│ Test Stripe Failure             │
│ └─ 4000 0000 0000 0002          │
│ └─ Verify error page            │
│ └─ Test retry                   │
└──────────┬──────────────────────┘
           ↓
┌─────────────────────────────────┐
│ Test PayPal Success             │
│ └─ Sandbox login                │
│ └─ Approve payment              │
│ └─ Verify success page          │
│ └─ Check admin dashboard        │
└──────────┬──────────────────────┘
           ↓
┌─────────────────────────────────┐
│ Test Admin Dashboard            │
│ └─ View all payments            │
│ └─ Filter by status             │
│ └─ Filter by method             │
│ └─ View payment details         │
│ └─ Test refund                  │
└──────────┬──────────────────────┘
           ↓
┌─────────────────────────────────┐
│ Test Email Notifications        │
│ └─ Check receipt received       │
│ └─ Verify content               │
│ └─ Check booking details        │
│ └─ Check transaction ID         │
└──────────┬──────────────────────┘
           ↓
┌─────────────────────────────────┐
│ Test Webhooks                   │
│ └─ Stripe webhook               │
│ └─ PayPal webhook               │
│ └─ Check events logged          │
│ └─ Verify data saved            │
└──────────┬──────────────────────┘
           ↓
Testing Complete ✅
```

---

## 🎓 Test Data Summary

### Stripe Test Cards
| Scenario | Card Number | Expiry | CVC | ZIP |
|----------|------------|--------|-----|-----|
| ✅ Success | 4242 4242 4242 4242 | Future | Any | Any |
| ✅ Alternative | 4000 0566 5566 5556 | Future | Any | Any |
| ✅ MasterCard | 5555 5555 5555 4444 | Future | Any | Any |
| ❌ Declined | 4000 0000 0000 0002 | Future | Any | Any |
| ❌ Insufficient | 4000 0000 0000 9995 | Future | Any | Any |
| ❌ Lost Card | 4000 0000 0000 9987 | Future | Any | Any |
| ❌ Expired | 4000 0000 0000 0069 | Past | Any | Any |
| ❌ Bad CVC | 4000 0000 0000 0127 | Future | 999 | Any |

### PayPal Sandbox Accounts
| Account Type | Email Format | Password | Use |
|--------------|-------------|----------|-----|
| Business | sb-xxxxx@business.example.com | Sandbox | Receive payments |
| Personal | sb-xxxxx@personal.example.com | Sandbox | Pay for orders |

---

## 🔐 Security Testing Notes

### DO NOT
```
❌ Use real card numbers
❌ Use personal PayPal account
❌ Commit .env with real API keys
❌ Test with real amounts (use small test amounts)
❌ Leave test mode enabled in production
```

### DO
```
✅ Use provided test card numbers
✅ Use sandbox accounts only
✅ Use environment variables for keys
✅ Use test amounts (e.g., $0.01)
✅ Switch to production mode before deploying
```

---

## 📝 Manual Test Form

Use this form to track your manual testing:

```
Test Date: _______________
Tester: ___________________
Environment: [ ] Local [ ] Staging [ ] Production

STRIPE TESTS:
┌────────────────────────────────────────┐
│ Test: Successful Payment               │
│ Card: 4242 4242 4242 4242             │
│ Result: [ ] Pass [ ] Fail             │
│ Notes: _____________________________   │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Test: Declined Card                    │
│ Card: 4000 0000 0000 0002             │
│ Result: [ ] Pass [ ] Fail             │
│ Notes: _____________________________   │
└────────────────────────────────────────┘

PAYPAL TESTS:
┌────────────────────────────────────────┐
│ Test: Successful Payment               │
│ Account: sb-xxxxx@personal.example.com │
│ Result: [ ] Pass [ ] Fail             │
│ Notes: _____________________________   │
└────────────────────────────────────────┘

ADMIN TESTS:
┌────────────────────────────────────────┐
│ Test: View Payments                    │
│ Result: [ ] Pass [ ] Fail             │
│ Notes: _____________________________   │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Test: Filter & Sort                    │
│ Result: [ ] Pass [ ] Fail             │
│ Notes: _____________________________   │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Test: Process Refund                   │
│ Result: [ ] Pass [ ] Fail             │
│ Notes: _____________________________   │
└────────────────────────────────────────┘

OVERALL RESULT: [ ] All Pass [ ] Some Fail

Sign-off: ____________________________
```

---

## 🚀 Production Readiness

Before going to production:

- [ ] Switch Stripe to production keys
- [ ] Switch PayPal to live account
- [ ] Remove test card numbers from code
- [ ] Set RESEND_API_KEY for email
- [ ] Test with real small amount ($0.01)
- [ ] Verify SSL/HTTPS enabled
- [ ] Set up monitoring/alerting
- [ ] Have support plan ready
- [ ] Document incident response
- [ ] Train support team

---

**Document Version:** 1.0  
**Last Updated:** December 4, 2024  
**Status:** ✅ Ready for testing
