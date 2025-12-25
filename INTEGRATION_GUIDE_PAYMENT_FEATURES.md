# Integration Guide - Payment Features

## Quick Integration Steps

### Step 1: Add Payment Reconciliation Dashboard

The dashboard is already accessible at:
```
/admin/payment-reconciliation
```

It will automatically show:
- Payment status breakdown (pie chart)
- Payments by method (bar chart)  
- Daily payment trends (line chart)
- Summary cards with totals
- Filters and CSV export

**No integration needed** - just update admin navigation menu to link to it.

---

### Step 2: Add Payment Proof Upload to Customer Booking Page

**Location:** Customer booking status/detail page

**Add Import:**
```tsx
import { PaymentProofUploadDialog } from "@/components/customer/PaymentProofUploadDialog"
```

**Add State:**
```tsx
const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
```

**Add Component:**
```tsx
<PaymentProofUploadDialog
  open={uploadDialogOpen}
  onOpenChange={setUploadDialogOpen}
  bookingId={booking.id}
  bookingReference={booking.referenceNumber}
  paymentAmount={Number(booking.paymentAmount || booking.details.totalPrice)}
  onUploadSuccess={() => {
    // Refresh booking data to show updated status
    reloadBooking()
  }}
/>
```

**Add Button (conditionally show for PENDING payments):**
```tsx
{booking.paymentStatus === "PENDING" && (
  <Button
    onClick={() => setUploadDialogOpen(true)}
    className="w-full bg-[#005B9A] hover:bg-[#004480]"
  >
    <Upload className="w-4 h-4 mr-2" />
    Upload Payment Proof
  </Button>
)}
```

---

### Step 3: Add Payment Proof Verification to Admin Booking Page

**Location:** Admin booking detail page (after payment section)

**Add Import:**
```tsx
import { PaymentProofVerification } from "@/components/admin/PaymentProofVerification"
```

**Add State:**
```tsx
const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
```

**Add Component:**
```tsx
{booking.paymentProofStatus && (
  <>
    <PaymentProofVerification
      open={verifyDialogOpen}
      onOpenChange={setVerifyDialogOpen}
      bookingId={booking.id}
      bookingReference={booking.referenceNumber}
      actualPaymentAmount={Number(booking.paymentAmount)}
      onVerified={() => {
        // Refresh booking data
        reloadBooking()
      }}
    />

    <Button
      onClick={() => setVerifyDialogOpen(true)}
      variant="outline"
      className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
    >
      <FileCheck className="w-4 h-4 mr-2" />
      Verify Payment Proof
    </Button>
  </>
)}
```

---

## Complete Example: Booking Page Integration

### Customer Booking Detail Page

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PaymentProofUploadDialog } from "@/components/customer/PaymentProofUploadDialog"
import { Upload } from "lucide-react"

export function CustomerBookingPage({ booking }) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [bookingData, setBookingData] = useState(booking)

  const handleReload = async () => {
    // Fetch updated booking data
    const response = await fetch(`/api/bookings/${booking.id}`)
    const updated = await response.json()
    setBookingData(updated)
  }

  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <h2 className="text-2xl font-bold mb-4">Booking {booking.referenceNumber}</h2>
        
        {/* Payment Status */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-slate-600">Status</p>
            <p className="font-bold text-lg">{booking.status}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Payment Status</p>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                booking.paymentStatus === "COMPLETED" 
                  ? "bg-green-500" 
                  : booking.paymentStatus === "PENDING"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`} />
              <span className="font-bold">{booking.paymentStatus}</span>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="mb-6">
          <p className="text-sm text-slate-600">Total Amount</p>
          <p className="text-2xl font-bold text-[#005B9A]">
            ฿{booking.paymentAmount?.toLocaleString() || booking.details.totalPrice.toLocaleString()}
          </p>
        </div>

        {/* Upload Section - Show if payment not completed */}
        {booking.paymentStatus === "PENDING" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 mb-4">
              Paid via bank transfer? Upload your receipt below.
            </p>
            
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="w-full bg-[#005B9A] hover:bg-[#004480]"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Payment Proof
            </Button>

            {/* Show proof status if uploaded */}
            {booking.paymentProofStatus && (
              <div className="mt-2 text-sm text-blue-700">
                ✓ Proof uploaded - {booking.paymentProofStatus}
              </div>
            )}
          </div>
        )}

        {/* Confirmation Section - Show if completed */}
        {booking.paymentStatus === "COMPLETED" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700 font-medium">
              ✓ Payment verified! Your booking is confirmed.
            </p>
          </div>
        )}
      </div>

      {/* Payment Proof Upload Dialog */}
      <PaymentProofUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        bookingId={bookingData.id}
        bookingReference={bookingData.referenceNumber}
        paymentAmount={
          bookingData.paymentAmount || 
          bookingData.details.totalPrice
        }
        onUploadSuccess={handleReload}
      />
    </div>
  )
}
```

### Admin Booking Detail Page

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PaymentProofVerification } from "@/components/admin/PaymentProofVerification"
import { FileCheck, AlertCircle } from "lucide-react"

export function AdminBookingPage({ booking }) {
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [bookingData, setBookingData] = useState(booking)

  const handleReload = async () => {
    const response = await fetch(`/api/admin/bookings/${booking.id}`)
    const updated = await response.json()
    setBookingData(updated)
  }

  return (
    <div className="space-y-6">
      {/* Admin Controls */}
      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <h2 className="text-2xl font-bold mb-6">Booking #{bookingData.referenceNumber}</h2>

        {/* Booking Status */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm text-slate-600">Booking Status</p>
            <p className="font-bold text-lg">{bookingData.status}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Payment Status</p>
            <p className={`font-bold ${
              bookingData.paymentStatus === "COMPLETED" ? "text-green-600" :
              bookingData.paymentStatus === "PENDING" ? "text-yellow-600" :
              "text-red-600"
            }`}>
              {bookingData.paymentStatus}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Amount</p>
            <p className="font-bold">฿{bookingData.paymentAmount?.toLocaleString() || "—"}</p>
          </div>
        </div>

        {/* Payment Proof Section */}
        {bookingData.paymentProofStatus && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-900">Payment Proof</p>
                <p className="text-sm text-slate-600">Status: {bookingData.paymentProofStatus}</p>
              </div>
              {bookingData.paymentProofStatus === "UPLOADED" && (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
            </div>

            {bookingData.paymentProofStatus === "UPLOADED" && (
              <Button
                onClick={() => setVerifyDialogOpen(true)}
                className="w-full bg-[#005B9A] hover:bg-[#004480]"
              >
                <FileCheck className="w-4 h-4 mr-2" />
                Review & Verify Payment Proof
              </Button>
            )}

            {bookingData.paymentProofStatus === "VERIFIED" && (
              <div className="text-sm text-green-700">
                ✓ Payment proof verified
              </div>
            )}

            {bookingData.paymentProofStatus === "REJECTED" && (
              <div className="text-sm text-red-700">
                ✗ Payment proof rejected
              </div>
            )}
          </div>
        )}

        {/* More admin controls... */}
      </div>

      {/* Verification Dialog */}
      <PaymentProofVerification
        open={verifyDialogOpen}
        onOpenChange={setVerifyDialogOpen}
        bookingId={bookingData.id}
        bookingReference={bookingData.referenceNumber}
        actualPaymentAmount={Number(bookingData.paymentAmount)}
        onVerified={handleReload}
      />
    </div>
  )
}
```

---

## Update Admin Navigation

Add link to payment reconciliation dashboard:

```tsx
// In your admin navigation component

<nav className="space-y-2">
  {/* ... existing nav items ... */}
  
  <Link
    href="/admin/payment-reconciliation"
    className="block px-4 py-2 rounded hover:bg-slate-100"
  >
    💰 Payment Reconciliation
  </Link>
  
  {/* ... more nav items ... */}
</nav>
```

---

## Testing the Features

### Test Customer Upload Flow
1. Go to customer booking page
2. Click "Upload Payment Proof" button
3. Select an image or PDF file
4. Verify file preview shows
5. Click "Upload Proof"
6. Confirm success message appears
7. Verify booking shows "Proof Uploaded" status

### Test Admin Verification Flow
1. Go to admin booking page
2. Click "Review & Verify Payment Proof"
3. Dialog shows uploaded proof(s)
4. Click "View" to preview the image/PDF
5. Verify amount matches expected
6. Click "Verify" button
7. Confirm success message
8. Verify booking status changed to CONFIRMED
9. Check customer email received verification

### Test Admin Rejection Flow
1. In verification dialog, click "X" (reject) button
2. Enter rejection reason
3. Confirm rejection
4. Verify customer email received rejection notice
5. Verify proof shows as REJECTED in dashboard

### Test Payment Reconciliation Dashboard
1. Go to `/admin/payment-reconciliation`
2. Verify charts display payment data
3. Test filters (method, status, date)
4. Click "Export CSV"
5. Verify CSV file downloads with correct data

---

## API Response Examples

### POST /api/bookings/[id]/upload-proof
**Success Response:**
```json
{
  "success": true,
  "message": "Payment proof uploaded successfully",
  "paymentProof": {
    "id": "cluxxxxxxxxx",
    "fileName": "booking-1701855000000-a1b2c3d4.jpg",
    "uploadedAt": "2024-12-07T01:30:00.000Z",
    "status": "PENDING"
  }
}
```

### GET /api/admin/payment-proofs/[bookingId]
**Success Response:**
```json
{
  "success": true,
  "proofs": [
    {
      "id": "cluxxxxxxxxx",
      "fileName": "booking-1701855000000-hash.jpg",
      "originalFileName": "bank_transfer_screenshot.jpg",
      "uploadedAt": "2024-12-07T01:30:00.000Z",
      "status": "PENDING",
      "fileSize": 245678,
      "expectedAmount": 5000,
      "filePath": "/payment-proofs/booking-1701855000000-hash.jpg"
    }
  ]
}
```

### GET /api/admin/payments/reconciliation
**Success Response:**
```json
{
  "totalBookings": 42,
  "totalAmount": 125000,
  "amountReceived": 95000,
  "amountPending": 20000,
  "amountFailed": 10000,
  "byMethod": {
    "stripe": { "count": 20, "amount": 50000 },
    "bank_transfer": { "count": 15, "amount": 35000 },
    "paypal": { "count": 5, "amount": 15000 },
    "cash": { "count": 2, "amount": 25000 }
  },
  "byDate": [
    { "date": "2024-12-06", "received": 15000, "pending": 5000, "failed": 0 },
    { "date": "2024-12-07", "received": 20000, "pending": 8000, "failed": 2000 }
  ],
  "conversionRate": 76.0
}
```

---

## Error Handling

### Common Errors and Solutions

**"File too large"**
- Solution: User selected file > 5MB
- Retry with smaller file

**"Invalid file type"**
- Solution: Only JPG, PNG, WebP, PDF supported
- Convert file to supported format

**"Amount differs by more than 10%"**
- Solution: Actual amount doesn't match expected
- Admin can reject and ask customer for clarification

**"Booking not found"**
- Solution: Booking ID or reference doesn't exist
- Verify correct booking selected

---

## Next Steps

1. **Integrate Components** - Add to your booking pages
2. **Test Flows** - Follow testing steps above
3. **Deploy** - Push to staging/production
4. **Monitor** - Check file uploads, email delivery
5. **Next Feature** - Implement Feature #3 (Automated Reminders)

Questions? Check the detailed implementation guide: `PAYMENT_PROOF_IMPLEMENTATION.md`
