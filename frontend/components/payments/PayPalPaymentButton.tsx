"use client"

import React, { useState, useCallback } from "react"
import { usePayment } from "@/context/PaymentContext"
import { validateEmail, validatePaymentAmount, formatPaymentAmount } from "@/lib/payment-utils"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"

interface PayPalPaymentButtonProps {
  bookingId: string
  amount: number
  currency?: string
  onSuccess?: (orderId: string) => void
  onError?: (error: string) => void
}

export function PayPalPaymentButton({
  bookingId,
  amount,
  currency = "THB",
  onSuccess,
  onError,
}: PayPalPaymentButtonProps) {
  const { processPayPalPayment, isProcessing, error, status } = usePayment()
  const [email, setEmail] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)
  const [fullName, setFullName] = useState("")

  const validateForm = useCallback((): boolean => {
    setLocalError(null)

    // Validate name
    if (!fullName.trim()) {
      setLocalError("Full name is required")
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
  }, [fullName, email, amount])

  const handlePayPalPayment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLocalError(null)

      if (!validateForm()) {
        return
      }

      try {
        console.log("🅿️ [PayPal] Processing payment...", {
          bookingId,
          amount,
          email,
        })

        await processPayPalPayment({
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
        const errorMessage = err instanceof Error ? err.message : "PayPal payment processing failed"
        setLocalError(errorMessage)
        if (onError) {
          onError(errorMessage)
        }
      }
    },
    [bookingId, amount, currency, email, validateForm, processPayPalPayment, onSuccess, onError]
  )

  const displayError = localError || error?.message
  const isLoading = isProcessing || status === "processing"

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handlePayPalPayment} className="space-y-4">
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

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <Input
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <Input
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        {/* PayPal Mode Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Testing:</span> Using PayPal sandbox. Use your sandbox
            test account to complete the payment.
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

        {/* Info Message */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-700">
            🅿️ You will be redirected to PayPal to complete your payment securely.
          </p>
        </div>

        {/* PayPal Button */}
        <Button
          type="submit"
          disabled={isLoading || !email || !fullName}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-semibold"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Connecting to PayPal...
            </span>
          ) : (
            <>
              <span className="mr-2">🅿️</span>
              Pay with PayPal - {formatPaymentAmount(amount, currency)}
            </>
          )}
        </Button>

        {/* Additional Info */}
        <p className="text-xs text-gray-500 text-center">
          🔒 Your payment is secure. PayPal handles all payment processing securely.
        </p>
      </form>
    </div>
  )
}
