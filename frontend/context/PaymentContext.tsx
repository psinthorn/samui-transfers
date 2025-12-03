"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

export type PaymentMethod = "stripe" | "paypal"
export type PaymentStatus = "idle" | "processing" | "success" | "error"

export interface PaymentDetails {
  bookingId: string
  amount: number
  currency: string
  email: string
  bookingDetails?: {
    description?: string
    images?: string[]
  }
}

export interface PaymentError {
  code: string
  message: string
  details?: any
}

interface PaymentContextType {
  paymentMethod: PaymentMethod
  setPaymentMethod: (method: PaymentMethod) => void
  status: PaymentStatus
  error: PaymentError | null
  isProcessing: boolean
  processStripePayment: (details: PaymentDetails) => Promise<void>
  processPayPalPayment: (details: PaymentDetails) => Promise<void>
  resetPayment: () => void
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe")
  const [status, setStatus] = useState<PaymentStatus>("idle")
  const [error, setError] = useState<PaymentError | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const processStripePayment = useCallback(
    async (details: PaymentDetails) => {
      setIsProcessing(true)
      setStatus("processing")
      setError(null)

      try {
        const response = await fetch("/api/payments/stripe/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(details),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to create Stripe checkout")
        }

        const data = await response.json()

        if (data.url) {
          // Redirect to Stripe checkout
          window.location.href = data.url
        } else {
          throw new Error("No checkout URL received")
        }

        setStatus("success")
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        setError({
          code: "STRIPE_ERROR",
          message: errorMessage,
        })
        setStatus("error")
        console.error("Stripe payment error:", err)
      } finally {
        setIsProcessing(false)
      }
    },
    []
  )

  const processPayPalPayment = useCallback(
    async (details: PaymentDetails) => {
      setIsProcessing(true)
      setStatus("processing")
      setError(null)

      try {
        const response = await fetch("/api/payments/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(details),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to create PayPal order")
        }

        const data = await response.json()

        if (data.approvalLink) {
          // Redirect to PayPal approval
          window.location.href = data.approvalLink
        } else {
          throw new Error("No approval link received")
        }

        setStatus("success")
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        setError({
          code: "PAYPAL_ERROR",
          message: errorMessage,
        })
        setStatus("error")
        console.error("PayPal payment error:", err)
      } finally {
        setIsProcessing(false)
      }
    },
    []
  )

  const resetPayment = useCallback(() => {
    setStatus("idle")
    setError(null)
    setIsProcessing(false)
  }, [])

  const value: PaymentContextType = {
    paymentMethod,
    setPaymentMethod,
    status,
    error,
    isProcessing,
    processStripePayment,
    processPayPalPayment,
    resetPayment,
  }

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  )
}

export function usePayment() {
  const context = useContext(PaymentContext)
  if (context === undefined) {
    throw new Error("usePayment must be used within a PaymentProvider")
  }
  return context
}
