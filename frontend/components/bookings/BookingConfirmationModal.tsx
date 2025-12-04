"use client"

import React, { useState } from "react"
import Link from "next/link"
import Button from "@/components/ui/button"
import PaymentGateway from "@/components/payments/PaymentGateway"

interface BookingConfirmation {
  bookingId: string
  pickupLocation: string
  dropoffLocation: string
  date: string
  time: string
  passengers: number
  amount: number
  currency: string
  vehicleType: string
  driverName: string
  userEmail: string
}

interface BookingConfirmationModalProps {
  booking: BookingConfirmation
  onPaymentSuccess?: (bookingId: string) => void
  onPaymentError?: (error: any) => void
  onClose?: () => void
}

export default function BookingConfirmationModal({
  booking,
  onPaymentSuccess,
  onPaymentError,
  onClose,
}: BookingConfirmationModalProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)

  const handlePaymentSuccess = () => {
    setIsConfirmed(true)
    onPaymentSuccess?.(booking.bookingId)
    // Auto-redirect to success page after 2 seconds
    setTimeout(() => {
      window.location.href = `/booking/success?bookingId=${booking.bookingId}`
    }, 2000)
  }

  const handlePaymentError = (error: any) => {
    onPaymentError?.(error)
  }

  if (isConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="mb-4">
            <span className="text-5xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Processing</h2>
          <p className="text-gray-600 mb-6">
            Your payment is being processed. Redirecting to confirmation page...
          </p>
          <div className="animate-pulse">
            <div className="h-2 bg-blue-600 rounded-full mx-auto w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Booking Confirmation</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Booking Summary */}
          {!showPaymentForm && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h3>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {/* Booking Reference */}
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Booking Reference:</span>
                  <span className="font-mono font-bold text-gray-900">{booking.bookingId}</span>
                </div>

                {/* Route */}
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Route:</span>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{booking.pickupLocation}</div>
                    <div className="text-gray-500 text-sm">→</div>
                    <div className="font-medium text-gray-900">{booking.dropoffLocation}</div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Date & Time:</span>
                  <div className="text-right font-medium text-gray-900">
                    {booking.date} at {booking.time}
                  </div>
                </div>

                {/* Passengers */}
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Passengers:</span>
                  <span className="font-medium text-gray-900">{booking.passengers}</span>
                </div>

                {/* Vehicle Type */}
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Vehicle:</span>
                  <span className="font-medium text-gray-900 capitalize">{booking.vehicleType}</span>
                </div>

                {/* Driver */}
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Driver:</span>
                  <span className="font-medium text-gray-900">{booking.driverName}</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3">Total Price</h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {booking.amount.toLocaleString()} {booking.currency}
                  </span>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Note:</strong> Your booking will be confirmed only after payment is completed.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setShowPaymentForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
                >
                  Proceed to Payment
                </Button>
                {onClose && (
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Payment Form */}
          {showPaymentForm && (
            <div>
              <button
                onClick={() => setShowPaymentForm(false)}
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold mb-4 flex items-center gap-2"
              >
                ← Back to Details
              </button>

              <PaymentGateway
                bookingId={booking.bookingId}
                amount={booking.amount}
                currency={booking.currency}
                email={booking.userEmail}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <p className="text-xs text-gray-500 text-center">
            Your payment information is secure and encrypted. We never store your card details.
          </p>
        </div>
      </div>
    </div>
  )
}
