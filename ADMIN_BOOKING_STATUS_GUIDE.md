# Admin Booking Status Update Guide

**Date Created:** December 7, 2025  
**Feature:** Admin Booking Status Management with Payment Methods  
**Status:** ✅ Complete and Ready  

---

## 📋 Overview

Admins can now update booking statuses directly from the admin panel, with support for multiple payment methods including:
- Credit Card (Stripe)
- PayPal
- Bank Transfer
- Pay on Tour
- Other

This feature is essential for managing bookings where customers pay via bank transfer or during the tour.

---

## 🎯 Key Features

✅ **Update Booking Status**
- Change booking status from PENDING → CONFIRMED → COMPLETED
- Cancel bookings with optional reason
- Track payment status alongside booking status

✅ **Payment Method Selection**
- Select payment method when updating status
- Especially useful for bank transfers and pay-on-tour payments
- Payment method is stored in the booking record

✅ **Payment Status Tracking**
- Automatically marks payment as COMPLETED when status is updated with payment info
- Stores payment date and method
- Displays payment status with visual indicators

✅ **User Notifications**
- Automated email sent to customer when status changes
- Email also sent to admin for notification
- Includes booking details and next steps

---

## 🚀 How to Use as an Admin

### Step 1: Navigate to Admin Bookings
1. Go to `/admin/bookings`
2. See all bookings in a searchable, filterable table
3. Use filters to find specific bookings:
   - Search by booking ID or reference
   - Filter by status
   - Filter by date range
   - Search by pickup/dropoff location

### Step 2: Open Booking Details
1. Click on a booking in the list
2. You'll see the booking detail page with:
   - Customer email/name
   - Current booking status
   - Route (pickup → dropoff)
   - Vehicle type and rate
   - Payment status
   - Payment method (if recorded)
   - Payment amount (if recorded)

### Step 3: Update Booking Status
1. Click the **"Update Status"** button on the booking details page
2. A dialog will open with options to:
   - Select new status
   - Select payment method (for PENDING → CONFIRMED or CONFIRMED → COMPLETED)
   - See payment amount

### Step 4: Select Payment Method (When Required)
When updating from:
- **PENDING → CONFIRMED**: Payment method is required
- **CONFIRMED → COMPLETED**: Payment method is optional (already set)
- Other status changes: Payment method is optional

Payment methods available:
- **Credit Card (Stripe)** - For Stripe payments
- **PayPal** - For PayPal payments
- **Bank Transfer** - For direct bank transfers
- **Pay on Tour** - For payment collected during tour
- **Other** - For other payment methods

### Step 5: Confirm Update
1. Review the status change and payment method
2. Click **"Update"** button
3. System will:
   - Update the booking status
   - Record the payment method
   - Mark payment as COMPLETED (if applicable)
   - Set payment date to current time
   - Send notification emails to customer and admin
   - Reload the page

---

## 📋 Common Scenarios

### Scenario 1: Bank Transfer Payment Received

**Situation:** Customer made a bank transfer, but booking is still PENDING

**Steps:**
1. Go to `/admin/bookings`
2. Find the booking (search by ID or customer name)
3. Click to open booking details
4. Click **"Update Status"** button
5. Select **"CONFIRMED"** from dropdown
6. Select **"Bank Transfer"** from payment method dropdown
7. Click **"Update"**
8. Booking status changes to CONFIRMED
9. Payment method is recorded as "Bank Transfer"
10. Payment status becomes COMPLETED
11. Customer receives confirmation email

---

### Scenario 2: Customer Will Pay on Tour

**Situation:** Customer wants to pay cash during the tour

**Steps:**
1. Go to `/admin/bookings`
2. Find the booking
3. Click to open booking details
4. Click **"Update Status"** button
5. Select **"CONFIRMED"** from dropdown
6. Select **"Pay on Tour"** from payment method dropdown
7. Click **"Update"**
8. Booking is confirmed
9. System notes payment method as "Pay on Tour"
10. When payment is received, update again to COMPLETED with same method

---

### Scenario 3: Multiple Payment Methods in Pipeline

**Situation:** Customer made partial payment via Stripe, rest via bank transfer

**Steps:**
1. First update: Status → CONFIRMED, Method → "Stripe" (for the Stripe payment)
2. Receive and process bank transfer
3. Second update: Status → CONFIRMED/COMPLETED, Method → "Bank Transfer" (to update final payment method)
4. System tracks that final payment was via bank transfer

---

## 📊 Booking Status Workflow

```
PENDING
  ↓ (Customer pays via any method)
CONFIRMED (with paymentMethod recorded)
  ↓ (Ride is assigned, driver collected customer)
COMPLETED (tour finished)

OR

PENDING/CONFIRMED
  ↓ (Within 2-hour window)
CANCELLED (with refund processed)
```

---

## 💾 Data Stored for Each Update

When you update a booking status with payment information:

```
{
  status: "CONFIRMED" | "COMPLETED" | "PENDING" | "CANCELLED",
  paymentMethod: "stripe" | "paypal" | "bank_transfer" | "pay_on_tour" | "other",
  paymentStatus: "COMPLETED" (auto-set when payment info provided),
  paymentDate: Current timestamp,
  paymentAmount: Booking amount
}
```

All this data is visible in:
- Admin booking detail page
- Booking confirmation card shown to customer
- User's booking history
- Status tracking page

---

## 🔐 Security & Validation

✅ **Admin-Only Access**
- Only users with ADMIN role can update statuses
- Checked on both frontend and backend

✅ **Validation Rules**
- Status can only transition to valid states
- Payment method is recorded when specified
- Payment date is automatically set
- All changes are logged

✅ **Data Integrity**
- Payment amount is stored as decimal (prevents rounding errors)
- Payment date is stored as timestamp (precise tracking)
- Payment method is stored as enum value
- All bookings remain linked to correct user

---

## 📧 Email Notifications

### When Status Changes

Both customer and admin receive emails with:
- Booking reference number
- Updated status
- Complete booking details (pickup, dropoff, vehicle, passengers)
- Link to booking details
- Link to chat/support

### Email Subjects
- **PENDING**: "Booking update — [ID] is pending"
- **CONFIRMED**: "Booking confirmed — [ID]"
- **COMPLETED**: "Booking completed — [ID]"
- **CANCELLED**: "Booking cancelled — [ID]"

---

## 🔍 Viewing Payment Information

### On Admin Booking Details Page
```
Status: CONFIRMED
Payment Status: ✅ COMPLETED (green badge)
Payment Method: Bank Transfer
Amount: ฿2,500.00
```

### On Customer's Booking Confirmation
Shows:
- Payment Amount
- Payment Method (formatted nicely: "Bank Transfer" instead of "bank_transfer")
- Payment Date
- All other booking details

---

## 📝 Best Practices

### 1. **Always Set Payment Method When Confirming**
- When moving from PENDING → CONFIRMED, always select the payment method
- This records how the customer is paying
- Helps with payment reconciliation

### 2. **Use Descriptive Payment Methods**
- Use "Bank Transfer" not "other" when customer transfers
- Use "Pay on Tour" when collecting cash during trip
- Keeps records clear for reconciliation

### 3. **Update Once Payment is Received**
- Don't mark as CONFIRMED until payment is actually received
- For bank transfers: wait for confirmation from bank
- For pay-on-tour: wait until tour is complete then mark as COMPLETED

### 4. **Keep Payment Records Accurate**
- The payment method in the system should match actual payment
- Don't change payment method after marking COMPLETED
- If error occurs, contact support to correct record

### 5. **Use Status Tracking Page**
- Direct customers to `/user/bookings/[id]/status`
- Shows real-time tracking of booking progress
- Updates automatically every 10 seconds
- Gives customers confidence in the booking

---

## 🆘 Troubleshooting

### Problem: "Update Status" Button Not Appearing

**Cause:** You're not logged in as admin

**Solution:** 
1. Log in with admin account (role = "ADMIN")
2. Try accessing the booking page again

### Problem: "Payment Method is Required" Error

**Cause:** You're trying to move PENDING → CONFIRMED without selecting payment method

**Solution:**
1. Select a payment method from the dropdown
2. Must select one to proceed with status change

### Problem: Payment Status Shows "PENDING" After Update

**Cause:** You didn't select a payment method when updating

**Solution:**
1. Payment method selection triggers automatic payment status update
2. Always select payment method when confirming bookings
3. Update booking again with payment method if missed

### Problem: Email Not Sent to Customer

**Cause:** Email configuration might be incomplete

**Solution:**
1. Check if SMTP settings are configured in `.env.local`
2. Ensure `COMPANY_BOOKING_EMAIL` is set
3. Check customer email is correct in booking
4. Manually send notification email through email service

---

## 📊 Field Reference

### Booking Payment Fields

| Field | Type | Description |
|-------|------|-------------|
| `paymentStatus` | String | PENDING, COMPLETED, FAILED, REFUNDED |
| `paymentMethod` | String | stripe, paypal, bank_transfer, pay_on_tour, other |
| `paymentAmount` | Decimal | Amount in booking currency |
| `paymentDate` | DateTime | When payment was processed |
| `paymentId` | String | Stripe/PayPal transaction ID (if applicable) |

### Booking Status Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | String | PENDING, CONFIRMED, COMPLETED, CANCELLED |
| `referenceNumber` | String | Generated reference (BK-YYYY-XXXXXX) |
| `confirmationSentAt` | DateTime | When confirmation email was sent |

---

## 🔗 Related Pages

- **Admin Bookings List:** `/admin/bookings`
- **Booking Details:** `/admin/bookings/[id]`
- **User Booking History:** `/user/bookings`
- **Real-time Status Tracking:** `/user/bookings/[id]/status`
- **Booking Confirmation:** `/booking/confirmation`

---

## ✅ Testing Checklist

Before going live, test these scenarios:

- [ ] Update PENDING booking to CONFIRMED with Bank Transfer
- [ ] Update CONFIRMED booking to COMPLETED  
- [ ] Cancel a booking within 2-hour window
- [ ] Verify email is sent to customer
- [ ] Verify email is sent to admin
- [ ] Verify booking shows correct payment method on customer side
- [ ] Verify payment status shows as COMPLETED
- [ ] Check that customer can see payment method in their booking history
- [ ] Test with both English and Thai language

---

## 📞 Support

For issues or questions:

1. Check this guide's troubleshooting section
2. Review booking details page for data accuracy
3. Check admin logs for action history
4. Contact system administrator

---

**Last Updated:** December 7, 2025  
**Version:** 1.0  
**Status:** ✅ Complete and Ready for Production
