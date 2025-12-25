"use client"

import React, { useState, useEffect } from "react"
import { StripePaymentForm } from "./StripePaymentForm"
import { PayPalPaymentButton } from "./PayPalPaymentButton"
import { BankTransferDetails } from "./BankTransferDetails"
import { formatPaymentAmount } from "@/lib/payment-utils"

type PaymentMethod = "stripe" | "paypal" | "bank_transfer"

interface Gateway {
  id: string
  type: string
  displayName: string
  description?: string
  icon?: string
  processingTime?: string
  fees?: string
  metadata?: any
}

interface PaymentGatewayProps {
  bookingId: string
  amount: number
  currency?: string
  email?: string
  onSuccess?: (method: PaymentMethod, transactionId: string) => void
  onError?: (error: string) => void
  showTitle?: boolean
  showDescription?: boolean
}

export function PaymentGateway({
  bookingId,
  amount,
  currency = "THB",
  email,
  onSuccess,
  onError,
  showTitle = true,
  showDescription = true,
}: PaymentGatewayProps) {
  const [gateways, setGateways] = useState<Gateway[]>([])
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGateways = async () => {
      try {
        const response = await fetch("/api/payment-gateways", {
          cache: "no-store",
        })
        if (!response.ok) throw new Error("Failed to fetch gateways")
        const data = await response.json()
        setGateways(data)
        if (data.length > 0) {
          setSelectedMethod(data[0].type as PaymentMethod)
        }
      } catch (error) {
        console.error("Error fetching payment gateways:", error)
        onError?.("Failed to load payment methods")
      } finally {
        setLoading(false)
      }
    }
    fetchGateways()
  }, [onError])

  const handleStripeSuccess = (sessionId: string) => {
    if (onSuccess) onSuccess("stripe", sessionId)
  }

  const handlePayPalSuccess = (orderId: string) => {
    if (onSuccess) onSuccess("paypal", orderId)
  }

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 text-center">
        <p className="text-slate-600">Loading payment methods...</p>
      </div>
    )
  }

  if (!gateways.length) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700 font-semibold">No Payment Methods Available</p>
          <p className="text-red-600 text-sm mt-1">Please contact support.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {showTitle && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
          {showDescription && (
            <p className="text-gray-600 mt-2">Choose your preferred payment method</p>
          )}
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
            <p className="text-xl font-bold text-gray-900">{bookingId}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatPaymentAmount(amount, currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-sm font-semibold text-gray-700 mb-3">Select Payment Method</p>
        <div
          className={`grid gap-4 ${
            gateways.length === 3
              ? "grid-cols-3"
              : gateways.length === 2
              ? "grid-cols-2"
              : "grid-cols-1"
          }`}
        >
          {gateways.map((gateway) => (
            <button
              key={gateway.type}
              onClick={() => setSelectedMethod(gateway.type as PaymentMethod)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedMethod === gateway.type
                  ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                  : "border-gray-200 bg-white hover:border-blue-300"
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <span className="text-3xl">{gateway.icon || "💳"}</span>
              </div>
              <p className="font-semibold text-gray-900">{gateway.displayName}</p>
              {gateway.description && (
                <p className="text-xs text-gray-600 mt-1">{gateway.description}</p>
              )}
              {gateway.processingTime && (
                <p className="text-xs text-gray-500 mt-1">⏱️ {gateway.processingTime}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        {selectedMethod === "stripe" && (
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
        )}
        {selectedMethod === "paypal" && (
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
        {selectedMethod === "bank_transfer" && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🏦 Bank Transfer</h2>
            <BankTransferDetails
              amount={amount}
              currency={currency}
              bookingId={bookingId}
            />
          </>
        )}
      </div>

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

      <div className="mt-8 pt-8 border-t border-gray-200">
        <p className="font-semibold text-gray-900 mb-4">FAQ</p>
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </span>
            </summary>
            <p className="mt-2 px-4 text-sm text-gray-600">
              All methods are secure. Choose whichever is convenient for you.
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </span>
            </summary>
            <p className="mt-2 px-4 text-sm text-gray-600">
              Yes. We use industry-leading encryption and fraud detection.
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </span>
            </summary>
            <p className="mt-2 px-4 text-sm text-gray-600">
              Both Stripe and PayPal can save your information for future checkouts.
            </p>
          </details>
        </div>
      </div>
    </div>
  )
}

export default PaymentGateway
