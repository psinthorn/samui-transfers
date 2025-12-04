"use client"

import React, { useState } from "react"
import { StripePaymentForm } from "./StripePaymentForm"
import { PayPalPaymentButton } from "./PayPalPaymentButton"
import { formatPaymentAmount } from "@/lib/payment-utils"

type PaymentMethod = "stripe" | "paypal"

interface PaymentGatewayProps {
  bookingId: string
  amount: number
  currency?: string
  onSuccess?: (method: PaymentMethod, transactionId: string) => void
  onError?: (error: string) => void
  showTitle?: boolean
  showDescription?: boolean
}

export function PaymentGateway({
  bookingId,
  amount,
  currency = "THB",
  onSuccess,
  onError,
  showTitle = true,
  showDescription = true,
}: PaymentGatewayProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("stripe")

  const handleStripeSuccess = (sessionId: string) => {
    if (onSuccess) {
      onSuccess("stripe", sessionId)
    }
  }

  const handlePayPalSuccess = (orderId: string) => {
    if (onSuccess) {
      onSuccess("paypal", orderId)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      {showTitle && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
          {showDescription && (
            <p className="text-gray-600 mt-2">
              Choose your preferred payment method to complete your booking
            </p>
          )}
        </div>
      )}

      {/* Payment Amount Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
            <p className="text-xl font-bold text-gray-900">{bookingId}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-blue-600">{formatPaymentAmount(amount, currency)}</p>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-gray-700 mb-3">Select Payment Method</p>
        <div className="grid grid-cols-2 gap-4">
          {/* Stripe Option */}
          <button
            onClick={() => setSelectedMethod("stripe")}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedMethod === "stripe"
                ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                : "border-gray-200 bg-white hover:border-blue-300"
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <span className="text-3xl">💳</span>
            </div>
            <p className="font-semibold text-gray-900">Credit/Debit Card</p>
            <p className="text-xs text-gray-600 mt-1">Powered by Stripe</p>
          </button>

          {/* PayPal Option */}
          <button
            onClick={() => setSelectedMethod("paypal")}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedMethod === "paypal"
                ? "border-amber-600 bg-amber-50 ring-2 ring-amber-200"
                : "border-gray-200 bg-white hover:border-amber-300"
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <span className="text-3xl">🅿️</span>
            </div>
            <p className="font-semibold text-gray-900">PayPal</p>
            <p className="text-xs text-gray-600 mt-1">Quick & Secure</p>
          </button>
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        {selectedMethod === "stripe" ? (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">💳 Pay with Card</h2>
            <StripePaymentForm
              bookingId={bookingId}
              amount={amount}
              currency={currency}
              onSuccess={handleStripeSuccess}
              onError={onError}
            />
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🅿️ Pay with PayPal</h2>
            <PayPalPaymentButton
              bookingId={bookingId}
              amount={amount}
              currency={currency}
              onSuccess={handlePayPalSuccess}
              onError={onError}
            />
          </>
        )}
      </div>

      {/* Security Info */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl mb-2">🔒</p>
          <p className="text-xs text-gray-600">SSL Encrypted</p>
        </div>
        <div className="text-center">
          <p className="text-2xl mb-2">✓</p>
          <p className="text-xs text-gray-600">PCI Compliant</p>
        </div>
        <div className="text-center">
          <p className="text-2xl mb-2">🛡️</p>
          <p className="text-xs text-gray-600">Fraud Protected</p>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <p className="font-semibold text-gray-900 mb-4">Frequently Asked Questions</p>
        <div className="space-y-3">
          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 px-4 py-3 font-medium text-gray-700">
              Which payment method should I use?
              <span className="transition group-open:rotate-180">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </summary>
            <p className="mt-2 px-4 text-sm text-gray-600">
              Both methods are equally secure. Choose whichever is most convenient for you. Stripe
              uses various payment methods, while PayPal is ideal if you have an existing PayPal
              account.
            </p>
          </details>

          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 px-4 py-3 font-medium text-gray-700">
              Is my payment information safe?
              <span className="transition group-open:rotate-180">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </summary>
            <p className="mt-2 px-4 text-sm text-gray-600">
              Yes. Both Stripe and PayPal use industry-leading encryption and fraud detection. Your
              payment information is never stored on our servers.
            </p>
          </details>

          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 px-4 py-3 font-medium text-gray-700">
              Can I save my payment information?
              <span className="transition group-open:rotate-180">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </summary>
            <p className="mt-2 px-4 text-sm text-gray-600">
              For security reasons, we don't store payment information. However, both Stripe and
              PayPal can securely save your information in your account for faster checkout next
              time.
            </p>
          </details>
        </div>
      </div>
    </div>
  )
}
