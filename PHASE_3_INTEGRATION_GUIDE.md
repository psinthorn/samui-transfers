# Phase 3: Integration Guide - BookingConfirmationModal

## Overview

This guide shows how to integrate the new `BookingConfirmationModal` component into the existing booking form to complete the payment flow.

## Integration Points

### 1. Find the Booking Form Component

The main booking form is typically in:
```
frontend/app/booking/ClientBookingEntry.tsx
```

Or other booking-related components in:
```
frontend/app/booking/
frontend/components/bookings/
```

### 2. Import Required Components and Hooks

Add these imports to your booking component:

```typescript
import { BookingConfirmationModal } from "@/components/bookings/BookingConfirmationModal"
import { useBookingPayment } from "@/hooks/useBookingPayment"
import { useState } from "react"
```

### 3. Add State Management

Inside your booking component, add state to track the booking confirmation:

```typescript
const [showConfirmationModal, setShowConfirmationModal] = useState(false)
const [bookingForPayment, setBookingForPayment] = useState<BookingConfirmation | null>(null)
const { completePayment } = useBookingPayment()
```

### 4. Handle Booking Submission

When the user submits the booking form, instead of immediately confirming:

```typescript
const handleBookingSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // Validate form data
  if (!formData.pickupLocation || !formData.dropoffLocation) {
    setError("Please fill in all required fields")
    return
  }

  try {
    // Create booking in database
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      throw new Error("Failed to create booking")
    }

    const booking = await response.json()

    // Prepare booking data for confirmation modal
    const bookingForConfirmation: BookingConfirmation = {
      id: booking.id,
      pickupLocation: formData.pickupLocation,
      dropoffLocation: formData.dropoffLocation,
      pickupDate: formData.pickupDate,
      pickupTime: formData.pickupTime,
      passengers: formData.passengers,
      vehicleType: formData.vehicleType,
      estimatedPrice: booking.estimatedPrice || 0,
      currency: "THB",
    }

    setBookingForPayment(bookingForConfirmation)
    setShowConfirmationModal(true)
  } catch (error) {
    setError(error instanceof Error ? error.message : "Booking failed")
  }
}
```

### 5. Add Modal to JSX

Add the modal component to your render output:

```typescript
return (
  <>
    {/* Your existing booking form */}
    <form onSubmit={handleBookingSubmit}>
      {/* Form fields */}
    </form>

    {/* Booking Confirmation Modal with Payment */}
    {showConfirmationModal && bookingForPayment && (
      <BookingConfirmationModal
        booking={bookingForPayment}
        onPaymentSuccess={(payment) => {
          console.log("Payment successful:", payment)
          // Clear form
          setFormData(initialFormData)
          // Close modal
          setShowConfirmationModal(false)
          // Redirect will happen automatically in modal
        }}
        onPaymentError={(error) => {
          console.error("Payment failed:", error)
          setError(error.message)
        }}
        onClose={() => {
          setShowConfirmationModal(false)
        }}
      />
    )}
  </>
)
```

## Complete Integration Example

Here's a complete example of what your booking component should look like after integration:

```typescript
"use client"

import React, { useState } from "react"
import { BookingConfirmationModal } from "@/components/bookings/BookingConfirmationModal"
import { useBookingPayment } from "@/hooks/useBookingPayment"

interface BookingConfirmation {
  id: string
  pickupLocation: string
  dropoffLocation: string
  pickupDate: string
  pickupTime: string
  passengers: number
  vehicleType: string
  estimatedPrice: number
  currency: string
}

export default function ClientBookingEntry() {
  // Form state
  const [formData, setFormData] = useState({
    pickupLocation: "",
    dropoffLocation: "",
    pickupDate: "",
    pickupTime: "",
    passengers: 1,
    vehicleType: "Standard",
  })

  // Modal state
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [bookingForPayment, setBookingForPayment] = useState<BookingConfirmation | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Use booking payment hook
  const { completePayment } = useBookingPayment()

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "passengers" ? parseInt(value) : value,
    }))
  }

  // Handle booking form submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      // Validate form
      if (!formData.pickupLocation || !formData.dropoffLocation) {
        throw new Error("Please fill in all required fields")
      }

      // Create booking
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userEmail: "user@example.com", // Get from session in real app
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create booking")
      }

      const booking = await response.json()

      // Prepare for confirmation modal
      const bookingForConfirmation: BookingConfirmation = {
        id: booking.id,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
        passengers: formData.passengers,
        vehicleType: formData.vehicleType,
        estimatedPrice: booking.estimatedPrice || 2500,
        currency: "THB",
      }

      setBookingForPayment(bookingForConfirmation)
      setShowConfirmationModal(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed")
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Book Your Transfer</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleBookingSubmit} className="space-y-6">
          {/* Pickup Location */}
          <div>
            <label className="block text-sm font-medium mb-2">Pickup Location</label>
            <input
              type="text"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleInputChange}
              placeholder="e.g., Bangkok Airport, Suvarnabhumi"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          {/* Dropoff Location */}
          <div>
            <label className="block text-sm font-medium mb-2">Dropoff Location</label>
            <input
              type="text"
              name="dropoffLocation"
              value={formData.dropoffLocation}
              onChange={handleInputChange}
              placeholder="e.g., Phuket Hotel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          {/* Pickup Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Pickup Date</label>
            <input
              type="date"
              name="pickupDate"
              value={formData.pickupDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          {/* Pickup Time */}
          <div>
            <label className="block text-sm font-medium mb-2">Pickup Time</label>
            <input
              type="time"
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          {/* Passengers */}
          <div>
            <label className="block text-sm font-medium mb-2">Number of Passengers</label>
            <select
              name="passengers"
              value={formData.passengers}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n} Passenger{n !== 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Vehicle Type</label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="Standard">Standard Car</option>
              <option value="SUV">SUV</option>
              <option value="Van">Van (7 Seater)</option>
              <option value="Minibus">Minibus (10 Seater)</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Confirm Booking & Continue to Payment
          </button>
        </form>
      </div>

      {/* Booking Confirmation Modal with Payment */}
      {showConfirmationModal && bookingForPayment && (
        <BookingConfirmationModal
          booking={bookingForPayment}
          onPaymentSuccess={(payment) => {
            console.log("✓ Payment successful:", payment)
            setFormData({
              pickupLocation: "",
              dropoffLocation: "",
              pickupDate: "",
              pickupTime: "",
              passengers: 1,
              vehicleType: "Standard",
            })
            setShowConfirmationModal(false)
          }}
          onPaymentError={(error) => {
            console.error("✗ Payment failed:", error)
            setError(error.message)
          }}
          onClose={() => {
            setShowConfirmationModal(false)
          }}
        />
      )}
    </div>
  )
}
```

## Data Flow

```
1. User fills booking form
   ↓
2. Click "Confirm & Pay"
   ↓
3. Create booking in database
   ↓
4. Open BookingConfirmationModal
   ↓
5. User reviews booking details
   ↓
6. User completes payment
   ↓
7. Payment successful callback
   ↓
8. Email receipt sent automatically
   ↓
9. Redirect to /booking/success
```

## Key Features in Integration

1. **Form Validation:** Check required fields before submission
2. **Error Handling:** Display errors to user
3. **Modal State:** Track booking and modal visibility
4. **Payment Success:** Handle successful payment with callback
5. **Auto-redirect:** Modal automatically redirects to success page
6. **Email Sent:** Receipt email sent automatically on payment completion

## TypeScript Interfaces

Make sure to import/define these interfaces:

```typescript
interface BookingConfirmation {
  id: string
  pickupLocation: string
  dropoffLocation: string
  pickupDate: string
  pickupTime: string
  passengers: number
  vehicleType: string
  estimatedPrice: number
  currency: string
}

interface Payment {
  id: string
  bookingId: string
  amount: number
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
  createdAt: Date
}
```

## Testing the Integration

1. **Form Test:**
   - Fill in all fields
   - Click "Confirm & Pay"
   - Verify modal appears

2. **Payment Test:**
   - In modal, click "Show Payment Form"
   - Use Stripe test card: `4242 4242 4242 4242`
   - Complete payment
   - Verify success redirect

3. **Email Test:**
   - Check email inbox for receipt
   - Verify booking details are correct
   - Verify payment amount matches

4. **Admin Dashboard Test:**
   - Go to `/admin/payments`
   - Verify new payment appears
   - Click "View" to see details
   - Check webhook events recorded

## Common Issues & Solutions

### Issue: "BookingConfirmationModal not found"
**Solution:** Check import path matches actual file location

### Issue: "useBookingPayment returns undefined"
**Solution:** Ensure hook is imported and called inside component

### Issue: "Modal doesn't show payment form toggle"
**Solution:** Check PaymentGateway component is installed from Phase 2

### Issue: "Email not sent"
**Solution:** Set RESEND_API_KEY environment variable in production

## Next Steps

1. Integrate into your booking component
2. Run local tests with Stripe test cards
3. Deploy to staging environment
4. Test end-to-end payment flow
5. Monitor webhook events
6. Verify emails are being sent
7. Deploy to production

---

**Updated:** December 4, 2024  
**Version:** 1.0
