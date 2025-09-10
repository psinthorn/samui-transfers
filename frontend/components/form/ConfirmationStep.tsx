"use client"

import React, { useState } from "react"

type Props = {
  formData: any
  handleSendmail: (e?: React.MouseEvent<HTMLButtonElement>) => void
  prevStep: () => void
  nextStep?: () => void
}

export default function ConfirmationStep({ formData = {}, handleSendmail, prevStep }: Props) {
  const [agree, setAgree] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const passengers =
    Number(formData?.passengers ?? formData?.pax ?? 0) > 0
      ? Number(formData?.passengers ?? formData?.pax)
      : undefined

  const onConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!agree || submitting) return
    setSubmitting(true)
    try {
      const ret = handleSendmail?.(e)
      // Support async handlers
      if (ret !== undefined && typeof (ret as any)?.then === "function") {
        await (ret as Promise<any>)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <header className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Review</p>
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Confirm your booking</h2>
        <p className="text-sm text-slate-600 mt-1">Make sure everything looks right before sending.</p>
      </header>

      <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        This is not a confirmation. We’ll contact you shortly to confirm availability and driver details.
      </div>

      <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <Item label="Request ID" value={formData.requestNumber || "—"} />
        <Item label="Flight no." value={formData.flightNo || "—"} />
        <Item label="Name" value={`${formData.firstName || ""} ${formData.lastName || ""}`.trim() || "—"} />
        <Item label="Passengers" value={passengers ? String(passengers) : "—"} />
        <Item label="Email" value={formData.email || "—"} />
        <Item label="Mobile" value={formData.mobile || "—"} />
        <Item label="Pickup date/time" value={formData.date || "—"} />
        <Item label="Pickup" value={formData.pickupPoint || "—"} />
        <Item label="Drop‑off" value={formData.dropoffPoint || "—"} />
        <Item
          label="Vehicle"
          value={[formData.carType, formData.carModel].filter(Boolean).join(" — ") || "—"}
        />
        <Item label="Notes" value={formData.note || formData.notes || "—"} />
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
        <span className="text-sm text-slate-600">Total</span>
        <span className="text-base font-semibold text-slate-900">
          {formData.rate ? `${formData.rate} THB` : "—"}
        </span>
      </div>

      <section className="mt-5">
        <h3 className="text-sm font-semibold text-slate-900">Terms and conditions</h3>
        <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
          <li>Payment: 100% deposit required to confirm your booking.</li>
          <li>Cancellation: ≥ 72 hours before pickup — full refund of deposit.</li>
          <li>Cancellation: 24–72 hours before pickup — 70% refund within 5–7 business days.</li>
          <li>Cancellation: &lt; 24 hours or no‑show — non‑refundable.</li>
          <li>Changes: One free change up to 24 hours before pickup (subject to availability; fare differences may apply).</li>
          <li>Waiting time: Airport pickups include 60 minutes free; other pickups include 15 minutes free. Extra waiting may incur charges or require a new booking.</li>
          <li>Passengers &amp; luggage: Passenger count must match the booking. Oversized luggage or extra items may require a larger vehicle and additional fees.</li>
          <li>Child seats: Available on request; please specify in Notes so we can confirm availability.</li>
          <li>Delays: We monitor flight delays and will adjust pickup when possible. Significant delays may require rescheduling.</li>
          <li>Conduct &amp; safety: No smoking or open alcohol in vehicles. Seat belts are required at all times.</li>
          <li>Pricing: All prices in THB; taxes/fees included unless stated otherwise.</li>
          <li>Force majeure: Not liable for delays caused by events beyond our control (weather, traffic incidents, etc.).</li>
        </ul>
        <p className="mt-2 text-xs text-slate-500">By continuing, you accept these terms.</p>

        <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-800">
          <input
            id="agree"
            name="agree"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          I agree to the Terms and Conditions
        </label>
      </section>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={prevStep}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!agree || submitting}
          aria-busy={submitting}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
              </svg>
              Sending…
            </>
          ) : (
            "Confirm booking"
          )}
        </button>
      </div>
    </div>
  )
}

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  )
}