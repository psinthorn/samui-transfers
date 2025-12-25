# Admin Booking Update - Quick Reference Card

**Quick Start Guide for Admin Users**

---

## 🚀 30-Second Quick Start

```
1. Go to: /admin/bookings
2. Find the booking
3. Click booking → Opens details
4. Click "Update Status" button → Opens dialog
5. Select new status
6. Select payment method (if PENDING→CONFIRMED)
7. Click "Update" → Done!
```

---

## 💳 Payment Methods

```
✓ Credit Card (Stripe)  - For Stripe payments
✓ PayPal               - For PayPal payments
✓ Bank Transfer        - For direct bank transfers
✓ Pay on Tour         - For cash during tour
✓ Other               - For anything else
```

---

## 📊 Status Flow

```
PENDING
  ↓ (Select Bank Transfer/Pay on Tour/etc)
CONFIRMED (with payment method recorded)
  ↓ (Tour starts)
COMPLETED

Or: PENDING/CONFIRMED → CANCELLED (within 2 hours)
```

---

## 🔄 Common Actions

### Bank Transfer Received
```
1. Status: PENDING → CONFIRMED
2. Payment Method: Bank Transfer
3. Click Update
```

### Customer Will Pay on Tour
```
1. Status: PENDING → CONFIRMED
2. Payment Method: Pay on Tour
3. Click Update
```

### Payment Already Made Online
```
1. Status: PENDING → CONFIRMED
2. Payment Method: Credit Card (Stripe) or PayPal
3. Click Update
```

### Mark Tour as Completed
```
1. Status: CONFIRMED → COMPLETED
2. Click Update
```

### Cancel Booking
```
1. Status: PENDING/CONFIRMED → CANCELLED
2. Click Update
```

---

## ⚠️ Important Rules

✓ **MUST select payment method for PENDING→CONFIRMED**
✓ **Payment method records HOW the customer paid**
✓ **Email sent to customer when status changes**
✓ **Only update when payment actually received**
✓ **Can't cancel after pickup + 2 hours**

---

## 📍 Where Payment Shows

After update, payment method appears:
- ✓ Admin booking details page
- ✓ Customer's booking confirmation
- ✓ Customer's booking history
- ✓ Real-time status tracking page

---

## 📧 What Happens on Update

1. ✓ Booking status changes
2. ✓ Payment method recorded
3. ✓ Payment status marked COMPLETED
4. ✓ Payment date set to NOW
5. ✓ Email sent to customer
6. ✓ Email sent to admin
7. ✓ Page reloads with new info

---

## 🔍 Finding Bookings

**Search by:**
- Booking ID / Reference
- Customer name / email
- Pickup location
- Dropoff location

**Filter by:**
- Status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
- Date range

---

## ✨ Pro Tips

1. **Always set payment method** - Helps with reconciliation
2. **Use correct payment method** - Keeps records accurate
3. **Check customer email** - Verify they get confirmation
4. **Update payment method if wrong** - Can fix mistakes
5. **Use Pay on Tour** - For cash/card at pickup

---

## 🆘 If Something Goes Wrong

| Problem | Solution |
|---------|----------|
| Button doesn't appear | Make sure you're logged in as admin |
| "Payment method required" error | Select a payment method from dropdown |
| Email not sent | Check if SMTP is configured |
| Can't find booking | Try searching by reference number |

---

## 📱 Mobile Friendly

Dialog works perfectly on mobile:
- ✓ Readable text
- ✓ Easy to tap buttons
- ✓ Scrollable on small screens
- ✓ Clear confirmation messages

---

## 🎨 Visual Indicators

**Payment Status Colors:**
- 🟢 GREEN - Payment Completed
- 🟡 YELLOW - Payment Pending
- 🔴 RED - Payment Failed

**Status Badges:**
- 🔵 PENDING - Waiting for payment
- 🟢 CONFIRMED - Payment received
- ✅ COMPLETED - Tour finished
- ❌ CANCELLED - Booking cancelled

---

## 🔐 Security

✓ Only you (admin) can update statuses
✓ All changes logged
✓ Payment info encrypted in database
✓ Customer email verified before notification

---

## 📞 Support Contacts

**System Admin:** Check .env.local for contact info
**Booking Questions:** Check in booking details
**Email Issues:** SMTP_HOST, SMTP_USER in .env.local

---

## ⏱️ Typical Time Per Booking

- Finding booking: ~10 seconds
- Opening details: ~2 seconds  
- Updating status: ~5 seconds
- **Total: ~20 seconds per booking**

---

**You're all set! Happy booking management! 🎉**

---

Last updated: December 7, 2025
