"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Button from "@/components/ui/button"

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [orderData, setOrderData] = useState<any>(null)

  const bookingId = searchParams?.get("bookingId")
  const sessionId = searchParams?.get("session_id")
  const orderId = searchParams?.get("orderId")
  const method = sessionId ? "stripe" : orderId ? "paypal" : "unknown"

  useEffect(() => {
    // Simulate loading verification
    const timer = setTimeout(() => {
      setIsLoading(false)
      setOrderData({
        bookingId,
        transactionId: sessionId || orderId,
        method,
        timestamp: new Date().toLocaleString(),
      })
    }, 2000)

    return () => clearTimeout(timer)
  }, [bookingId, sessionId, orderId, method])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin mb-4">
              <span className="text-6xl">🔄</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Your Payment</h1>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <span className="text-5xl">✓</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your booking has been confirmed and payment received.</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-green-200">
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <p className="text-xs text-gray-600 mb-1">Booking Reference</p>
              <p className="text-xl font-bold text-gray-900">{bookingId}</p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <p className="text-xs text-gray-600 mb-1">Payment Method</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{method === "stripe" ? "💳" : "🅿️"}</span>
                <p className="font-semibold text-gray-900">
                  {method === "stripe" ? "Credit Card (Stripe)" : "PayPal"}
                </p>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <p className="text-xs text-gray-600 mb-1">Transaction ID</p>
              <p className="font-mono text-sm text-gray-900 break-all">{sessionId || orderId}</p>
            </div>

            <div>
              <p className="text-xs text-gray-600 mb-1">Confirmed At</p>
              <p className="text-sm text-gray-900">{orderData?.timestamp}</p>
            </div>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
          <h2 className="font-semibold text-gray-900 mb-3">What Happens Next?</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">1</span>
              <span>Confirmation email will be sent to your registered email address</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">2</span>
              <span>Our team will review your booking details</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">3</span>
              <span>You'll receive pickup details 24 hours before your booking</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">4</span>
              <span>Enjoy your transfer with Samui Transfers!</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/dashboard" className="block">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">
              View My Bookings
            </Button>
          </Link>

          <Link href="/" className="block">
            <Button
              variant="outline"
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50"
            >
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
          <p className="mb-2">Need help? Contact our support team</p>
          <p className="font-semibold text-gray-900">📞 +66 99 108 7999</p>
          <p className="text-xs mt-2">Available 24/7</p>
        </div>
      </div>
    </div>
  )
}
