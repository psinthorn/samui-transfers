"use client"

import React, { useMemo, useState } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { bookingText } from "@/data/content/booking"
import { pick } from "@/data/i18n/core"

type Props = {
  formData: any
  handleSendmail: (e?: React.MouseEvent<HTMLButtonElement>) => void
  prevStep: () => void
  nextStep?: () => void
}

export default function ConfirmationStep({ formData = {}, handleSendmail, prevStep }: Props) {
  const [agree, setAgree] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { lang } = useLanguage()
  const formatter = useMemo(
    () => new Intl.NumberFormat(lang === 'th' ? 'th-TH' : 'en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }),
    [lang]
  )

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
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{pick(lang, bookingText.review.kicker)}</p>
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900">{pick(lang, bookingText.review.title)}</h2>
        <p className="text-sm text-slate-600 mt-1">{pick(lang, bookingText.review.subtitle)}</p>
      </header>

      <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        {pick(lang, bookingText.review.notConfirmedBanner)}
      </div>

      {/* Route: pickup and drop-off grouped clearly in the same column */}
      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
  <h3 className="text-sm font-semibold text-slate-900">{pick(lang, bookingText.review.route)}</h3>
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-slate-500">{pick(lang, bookingText.review.pickup)}</p>
              <p className="text-sm font-medium text-slate-900 break-words">{formData.pickupPoint || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-slate-500">{pick(lang, bookingText.review.dropoff)}</p>
              <p className="text-sm font-medium text-slate-900 break-words">{formData.dropoffPoint || "—"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">{pick(lang, bookingText.review.passenger)}</h3>
          <dl className="mt-2 space-y-2 text-sm">
            <Item label={pick(lang, bookingText.review.name)} value={`${formData.firstName || ""} ${formData.lastName || ""}`.trim() || "—"} />
            <Item label={pick(lang, bookingText.review.passengers)} value={passengers ? String(passengers) : "—"} />
          </dl>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">{pick(lang, bookingText.review.contact)}</h3>
          <dl className="mt-2 space-y-2 text-sm">
            <Item label={pick(lang, bookingText.review.email)} value={formData.email || "—"} />
            <Item label={pick(lang, bookingText.review.mobile)} value={formData.mobile || "—"} />
          </dl>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900">{pick(lang, bookingText.review.trip)}</h3>
          <dl className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <Item label={pick(lang, bookingText.review.pickupDateTime)} value={formData.date || "—"} />
            <Item label={pick(lang, bookingText.review.flightNo)} value={formData.flightNo || "—"} />
            <Item label={pick(lang, bookingText.review.vehicle)} value={[formData.carType, formData.carModel].filter(Boolean).join(" — ") || "—"} />
          </dl>
        </div>
        {Boolean(formData.note || formData.notes) && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
            <h3 className="text-sm font-semibold text-slate-900">{pick(lang, bookingText.review.notes)}</h3>
            <p className="mt-2 text-sm text-slate-800 whitespace-pre-line">
              {formData.note || formData.notes}
            </p>
          </div>
        )}
      </section>

      {/* Total */}
      <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
        <span className="text-sm text-slate-600">{pick(lang, bookingText.review.total)}</span>
        <span className="text-base sm:text-lg font-semibold text-slate-900">
          {formData.rate ? formatter.format(Number(formData.rate)) : "—"}
        </span>
      </div>

      <section className="mt-5">
  <h3 className="text-sm font-semibold text-slate-900">{pick(lang, bookingText.review.termsTitle)}</h3>
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
  <p className="mt-2 text-xs text-slate-500">{pick(lang, bookingText.review.continueAccept)}</p>

        <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-800">
          <input
            id="agree"
            name="agree"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          {pick(lang, bookingText.review.termsAccept)}
        </label>
      </section>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={prevStep}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          {pick(lang, bookingText.review.back)}
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
              {pick(lang, bookingText.review.sending)}
            </>
          ) : (
            pick(lang, bookingText.review.confirmCta)
          )}
        </button>
      </div>
    </div>
  )
}

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-500 whitespace-nowrap">{label}</dt>
      <dd className="text-right break-words">{value}</dd>
    </div>
  )
}