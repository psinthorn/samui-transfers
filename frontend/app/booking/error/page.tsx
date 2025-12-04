"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Button from "@/components/ui/button"

export default function BookingErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  const errorCode = searchParams?.get("code") || "payment_failed"
  const bookingId = searchParams?.get("bookingId")
  const reason = searchParams?.get("reason") || "Your payment could not be processed"

  // Map error codes to user-friendly messages
  const errorMessages: Record<string, { title: string; description: string; suggestion: string }> = {
    card_declined: {
      title: "Card Declined",
      description: "Your card was declined by the bank.",
      suggestion: "Please try with a different card or contact your bank.",
    },
    insufficient_funds: {
      title: "Insufficient Funds",
      description: "Your card doesn't have enough balance.",
      suggestion: "Please ensure your card has sufficient funds or use another payment method.",
    },
    invalid_card: {
      title: "Invalid Card Details",
      description: "The card details you provided are invalid.",
      suggestion: "Please double-check your card number, expiry date, and CVV.",
    },
    expired_card: {
      title: "Expired Card",
      description: "Your card has expired.",
      suggestion: "Please use a valid, non-expired card.",
    },
    processing_error: {
      title: "Processing Error",
      description: "There was an error processing your payment.",
      suggestion: "Please try again in a few moments. If the problem persists, contact support.",
    },
    network_error: {
      title: "Network Error",
      description: "There was a network connectivity issue.",
      suggestion: "Please check your internet connection and try again.",
    },
    cancelled: {
      title: "Payment Cancelled",
      description: "You cancelled the payment process.",
      suggestion: "You can try again whenever you're ready.",
    },
    payment_failed: {
      title: "Payment Failed",
      description: "Your payment could not be processed.",
      suggestion: "Please try again or use a different payment method.",
    },
  }

  const error = errorMessages[errorCode] || errorMessages.payment_failed

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin mb-4">
              <span className="text-6xl">🔄</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing...</h1>
          <p className="text-gray-600">Loading error details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Error Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="bg-red-100 rounded-full p-4">
              <span className="text-5xl">✕</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{error.title}</h1>
          <p className="text-gray-600">{error.description}</p>
        </div>

        {/* Error Details Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-red-200">
          <div className="space-y-4">
            {bookingId && (
              <div className="border-b border-gray-200 pb-4">
                <p className="text-xs text-gray-600 mb-1">Booking Reference</p>
                <p className="text-lg font-bold text-gray-900">{bookingId}</p>
              </div>
            )}

            <div className="border-b border-gray-200 pb-4">
              <p className="text-xs text-gray-600 mb-1">Error Code</p>
              <p className="font-mono text-sm text-gray-900">{errorCode}</p>
            </div>

            {reason && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Details</p>
                <p className="text-sm text-gray-900">{reason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Suggestion Card */}
        <div className="bg-amber-50 rounded-xl p-6 mb-6 border border-amber-200">
          <h2 className="font-semibold text-gray-900 mb-3">What You Can Do</h2>
          <p className="text-sm text-gray-700 mb-4">{error.suggestion}</p>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">→</span>
              <span>Try a different payment method</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">→</span>
              <span>Contact your bank for more information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">→</span>
              <span>Try again after a few minutes</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {bookingId ? (
            <Link href={`/booking/${bookingId}?retry=true`} className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">
                Try Payment Again
              </Button>
            </Link>
          ) : (
            <Link href="/booking" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">
                Back to Booking
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
          <p className="mb-2">Still having trouble?</p>
          <p className="font-semibold text-gray-900">📞 +66 99 108 7999</p>
          <p className="text-xs mt-2">Our team is ready to help 24/7</p>
          <p className="text-xs mt-3">
            Or email:{" "}
            <a href="mailto:support@samuItransfers.com" className="text-blue-600 hover:underline">
              support@samuItransfers.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
