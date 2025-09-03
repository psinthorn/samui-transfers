"use client"

import React from "react"
import Link from "next/link"
import PaymentStep from "./PaymentStep"

type Props = { formData: any }

export default function ThankYouStep({ formData = {} }: Props) {
  const rateNum = Number(formData?.rate || 0)
  const total = rateNum > 0 ? rateNum : undefined
  const totalText =
    typeof total === "number"
      ? total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "—"

  const whatsapp = (process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "66991087999").replace(/[^\d]/g, "")
  const whatsappHref = `https://wa.me/${whatsapp}`
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "booking@samui-transfers.com"

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
      {/* Success header */}
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          ✓
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Thank you for your booking</h2>
        <p className="mt-1 text-sm text-slate-600">
          We received your request and will confirm availability shortly.
        </p>
      </div>

      {/* Summary card */}
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-700">Fare total</p>
        <p className="text-2xl font-bold text-slate-900">
          {totalText} THB
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Make a 100% deposit to confirm your booking.
        </p>
      </div>

      {/* Payment options */}
      <div className="mt-5">
        <PaymentStep />
      </div>

      {/* Help/next steps */}
      <div className="mt-4 rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <p className="font-medium text-slate-800">Send your payment slip</p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>
            Email:{" "}
            <a href={`mailto:${supportEmail}`} className="text-primary hover:underline">
              {supportEmail}
            </a>
          </li>
          <li>
            WhatsApp:{" "}
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              +{whatsapp}
            </a>
          </li>
          <li>We will confirm your booking within 24 hours.</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Back to home
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
        >
          New booking
        </Link>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          Chat on WhatsApp
        </a>
      </div>
    </div>
  )
}