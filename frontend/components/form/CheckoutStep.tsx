"use client"

import React, { useMemo, useState } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { bookingText } from "@/data/content/booking"
import { pick } from "@/data/i18n/core"
import { PaymentGateway } from "@/components/payments/PaymentGateway"
import { AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"

type Props = {
  formData: any
  bookingId?: string
  onPaymentSuccess?: () => void
  prevStep: () => void
}

export default function CheckoutStep({ 
  formData = {}, 
  bookingId,
  onPaymentSuccess,
  prevStep 
}: Props) {
  const { lang } = useLanguage()
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const formatter = useMemo(
    () => new Intl.NumberFormat(lang === 'th' ? 'th-TH' : 'en-US', { 
      style: 'currency', 
      currency: 'THB', 
      maximumFractionDigits: 0 
    }),
    [lang]
  )

  const totalAmount = Math.round((formData.rate || 0) * 100) // Convert to cents for Stripe

  const handlePaymentSuccess = () => {
    // Payment was successful, will be redirected by PaymentGateway
    if (onPaymentSuccess) {
      onPaymentSuccess()
    }
  }

  const handlePaymentError = (error: string) => {
    setPaymentError(error)
    setTimeout(() => setPaymentError(null), 5000)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <header className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {pick(lang, bookingText.review.kicker)}
        </p>
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
          Complete Your Payment
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Secure checkout to confirm your booking
        </p>
      </header>

      {/* Order Summary */}
      <section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Order Summary</h3>
        
        <div className="space-y-3">
          {/* Route */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wide">Route</p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                {formData.pickupPoint || "—"} → {formData.dropoffPoint || "—"}
              </p>
            </div>
          </div>

          {/* Vehicle */}
          <div className="pt-3 border-t border-slate-200 flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wide">Vehicle</p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                {[formData.carType, formData.carModel].filter(Boolean).join(" — ") || "—"}
              </p>
            </div>
          </div>

          {/* Distance */}
          <div className="pt-3 border-t border-slate-200 flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wide">Distance</p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                {formData.distance?.toFixed(2) || "—"} km
              </p>
            </div>
          </div>

          {/* Passengers */}
          <div className="pt-3 border-t border-slate-200 flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wide">Passengers</p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                {formData.passengers || "—"} {formData.passengers === 1 ? "person" : "people"}
              </p>
            </div>
          </div>

          {/* Total Price */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">Total Amount</span>
            <span className="text-lg sm:text-xl font-bold text-blue-600">
              {formData.rate ? formatter.format(Number(formData.rate)) : "—"}
            </span>
          </div>
        </div>
      </section>

      {/* Payment Info */}
      <section className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-blue-900">Payment Information</h3>
          <ul className="mt-2 text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>100% deposit required to confirm your booking</li>
            <li>Payment is processed securely via Stripe or PayPal</li>
            <li>You will receive a confirmation email with receipt</li>
            <li>Cancellation terms apply (see booking details)</li>
          </ul>
        </div>
      </section>

      {/* Error Message */}
      {paymentError && (
        <section className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-900">Payment Error</h3>
            <p className="mt-1 text-sm text-red-800">{paymentError}</p>
          </div>
        </section>
      )}

      {/* Payment Form Section */}
      <section className="mt-6">
        {!showPaymentForm ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Click below to proceed with payment via Stripe or PayPal.
            </p>
            <button
              type="button"
              onClick={() => setShowPaymentForm(true)}
              className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Proceed to Payment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900 mb-4">
                Select Payment Method
              </p>
              <PaymentGateway
                amount={totalAmount}
                bookingId={bookingId || formData.requestNumber}
                bookingDetails={{
                  pickupPoint: formData.pickupPoint,
                  dropoffPoint: formData.dropoffPoint,
                  date: formData.date,
                  time: formData.time,
                  passengers: formData.passengers,
                  vehicle: `${formData.carType} - ${formData.carModel}`,
                  distance: formData.distance,
                }}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowPaymentForm(false)}
              className="w-full inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Summary
            </button>
          </div>
        )}
      </section>

      {/* Navigation */}
      {!showPaymentForm && (
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={prevStep}
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {pick(lang, bookingText.review.back)}
          </button>
        </div>
      )}
    </div>
  )
}
