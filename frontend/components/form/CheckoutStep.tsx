"use client"

import React, { useMemo } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { PaymentGateway } from "@/components/payments/PaymentGateway"
import { ArrowLeft, ArrowRight } from "lucide-react"

type Props = {
  bookingData: any
  bookingId: string
  prevStep: () => void
  nextStep: () => void
}

export default function CheckoutStep({ bookingData = {}, bookingId, prevStep, nextStep }: Props) {
  const { lang } = useLanguage()
  const formatter = useMemo(
    () => new Intl.NumberFormat(lang === 'th' ? 'th-TH' : 'en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }),
    [lang]
  )

  const handlePaymentSuccess = () => {
    // Move to thank you step after successful payment
    nextStep()
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    // Error is shown in PaymentGateway component
  }

  // Use raw amount for display (THB is already in proper units)
  // Don't multiply by 100 - that's only needed when sending to payment providers if they require cents
  const displayAmount = bookingData.total || 0
  const paymentAmount = displayAmount // Pass the actual amount to PaymentGateway

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Payment</p>
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Secure Payment</h2>
        <p className="text-sm text-slate-600 mt-1">Complete your booking with a secure payment</p>
      </header>

      {/* Order Summary */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Order Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Booking Reference:</span>
            <span className="font-medium text-slate-900">{bookingId}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Route:</span>
            <span className="font-medium text-slate-900">
              {bookingData.pickupPoint} → {bookingData.dropoffPoint}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Distance:</span>
            <span className="font-medium text-slate-900">{bookingData.distance?.toFixed(2)} km</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Vehicle:</span>
            <span className="font-medium text-slate-900">{bookingData.carModel}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Passengers:</span>
            <span className="font-medium text-slate-900">{bookingData.passengers}</span>
          </div>
          <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
            <span className="font-semibold text-slate-900">Total Amount:</span>
            <span className="text-lg font-bold text-blue-600">{formatter.format(bookingData.total || 0)}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Select Payment Method</h3>
        <PaymentGateway
          amount={paymentAmount}
          bookingId={bookingId}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={prevStep}
          className="inline-flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <p className="text-xs text-slate-600 text-center flex-1 mx-4">
          Your payment information is secure and encrypted
        </p>
      </div>
    </div>
  )
}
