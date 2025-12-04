"use client"

import React, { useState, useCallback } from "react"
import { usePayment } from "@/context/PaymentContext"
import { validateEmail, validatePaymentAmount, formatPaymentAmount } from "@/lib/payment-utils"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"

interface StripePaymentFormProps {
  bookingId: string
  amount: number
  currency?: string
  onSuccess?: (sessionId: string) => void
  onError?: (error: string) => void
  autoProcessPayment?: boolean
}

export function StripePaymentForm({
  bookingId,
  amount,
  currency = "THB",
  onSuccess,
  onError,
  autoProcessPayment = false,
}: StripePaymentFormProps) {
  const { processStripePayment, isProcessing, error, status } = usePayment()
  const [email, setEmail] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)
  const [cardholderName, setCardholderName] = useState("")

  const validateForm = useCallback((): boolean => {
    setLocalError(null)

    // Validate cardholder name
    if (!cardholderName.trim()) {
      setLocalError("Cardholder name is required")
      return false
    }

    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setLocalError(emailValidation.error || "Invalid email")
      return false
    }

    // Validate amount
    const amountValidation = validatePaymentAmount(amount)
    if (!amountValidation.valid) {
      setLocalError(amountValidation.error || "Invalid amount")
      return false
    }

    return true
  }, [cardholderName, email, amount])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLocalError(null)

      if (!validateForm()) {
        return
      }

      try {
        console.log("🔐 [Stripe] Processing payment...", {
          bookingId,
          amount,
          email,
        })

        await processStripePayment({
          bookingId,
          amount,
          currency,
          email,
          bookingDetails: {
            description: `Booking #${bookingId}`,
          },
        })

        if (onSuccess) {
          onSuccess(bookingId)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Payment processing failed"
        setLocalError(errorMessage)
        if (onError) {
          onError(errorMessage)
        }
      }
    },
    [bookingId, amount, currency, email, validateForm, processStripePayment, onSuccess, onError]
  )

  // Auto-process if all data provided and flag set
  React.useEffect(() => {
    if (autoProcessPayment && email && cardholderName && !isProcessing) {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent)
    }
  }, [autoProcessPayment, email, cardholderName, isProcessing, handleSubmit])

  const displayError = localError || error?.message
  const isLoading = isProcessing || status === "processing"

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Booking ID</span>
              <span className="font-medium">{bookingId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount</span>
              <span className="font-medium">{formatPaymentAmount(amount, currency)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-lg text-blue-600">
                {formatPaymentAmount(amount, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cardholder Name
          </label>
          <Input
            type="text"
            placeholder="John Doe"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Test Card:</span> Use 4242 4242 4242 4242 with any
            future expiry date and any 3-digit CVC.
          </p>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              <span className="font-semibold">Error:</span> {displayError}
            </p>
          </div>
        )}

        {/* Note: Stripe Elements will be added in Stripe checkout page */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-700">
            💳 Card details will be entered securely on the Stripe checkout page after you click
            "Pay Now"
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || !email || !cardholderName}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Processing Payment...
            </span>
          ) : (
            `Pay Now - ${formatPaymentAmount(amount, currency)}`
          )}
        </Button>

        {/* Additional Info */}
        <p className="text-xs text-gray-500 text-center">
          🔒 Your payment is secure and encrypted. You will be redirected to Stripe for payment
          processing.
        </p>
      </form>
    </div>
  )
}
