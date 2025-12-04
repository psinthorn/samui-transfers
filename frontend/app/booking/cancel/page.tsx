"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Button from "@/components/ui/button"

export default function BookingCancelPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  const bookingId = searchParams?.get("bookingId")
  const error = searchParams?.get("error")

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin mb-4">
              <span className="text-6xl">🔄</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Cancel Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="bg-gray-100 rounded-full p-4">
              <span className="text-5xl">⏸️</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600">Your payment process has been cancelled.</p>
        </div>

        {/* Cancellation Details Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">You can still complete this booking</p>
              <p className="text-sm text-gray-700">
                Your booking has been saved. Return to the payment page anytime to complete your purchase.
              </p>
            </div>

            {bookingId && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-600 mb-1">Booking Reference</p>
                <p className="text-lg font-bold text-gray-900">{bookingId}</p>
              </div>
            )}

            {error && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-600 mb-1">Error Details</p>
                <p className="text-sm text-red-600 font-mono break-all">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
          <h2 className="font-semibold text-gray-900 mb-3">What Happens Now?</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">1</span>
              <span>Your booking details have been saved</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">2</span>
              <span>You can return to complete payment anytime</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">3</span>
              <span>No charges have been made to your account</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {bookingId ? (
            <Link href={`/booking/${bookingId}`} className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">
                Return to Booking
              </Button>
            </Link>
          ) : (
            <Link href="/booking" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">
                Back to Bookings
              </Button>
            </Link>
          )}

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
          <p className="mb-2">Need assistance?</p>
          <p className="font-semibold text-gray-900">📞 +66 99 108 7999</p>
          <p className="text-xs mt-2">Available 24/7</p>
        </div>
      </div>
    </div>
  )
}
