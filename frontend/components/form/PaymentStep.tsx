"use client"

import React, { useState } from "react"
import Image from "next/image"
import { useLanguage } from "@/context/LanguageContext"
import { bookingText } from "@/data/content/booking"
import { pick } from "@/data/i18n/core"

type Props = {
  formData?: any
  handleChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  nextStep?: () => void
  prevStep?: () => void
}

const BANK = {
  name:
    process.env.NEXT_PUBLIC_BANK_NAME ||
    "Siam Commercial Bank PCL. (ธนาคารไทยพาณิชย์ จำกัด มหาชน)",
  type: process.env.NEXT_PUBLIC_BANK_ACCOUNT_TYPE || "Savings",
  accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "F2 Co.,Ltd.",
  accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO || "478-1-07889-8",
  swift: process.env.NEXT_PUBLIC_BANK_SWIFT || "SICOTHBK",
  promptpay: process.env.NEXT_PUBLIC_PROMPTPAY_NUMBER || "064-027-0528",
  promptpayName: process.env.NEXT_PUBLIC_PROMPTPAY_NAME || "Sinthorn Pradutnam",
  qrImage: process.env.NEXT_PUBLIC_BANK_QR_IMAGE || "", // optional public URL
  logo: process.env.NEXT_PUBLIC_BANK_LOGO || "", // optional public URL
}

export default function PaymentStep({ formData, handleChange, nextStep, prevStep }: Props) {
  const [copied, setCopied] = useState<string | null>(null)
  const [slipName, setSlipName] = useState<string>("")
  const { lang } = useLanguage()

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      setCopied(null)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{pick(lang, bookingText.payment.kicker)}</p>
        <h2 className="mt-1 text-xl sm:text-2xl font-semibold text-slate-900">{pick(lang, bookingText.payment.title)}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {pick(lang, bookingText.payment.subtitle)}
        </p>
      </header>

      {/* Bank details */}
      <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          {BANK.logo ? (
            <div className="relative h-8 w-8 overflow-hidden rounded">
              <Image src={BANK.logo} alt="Bank logo" fill className="object-contain" />
            </div>
          ) : null}
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900">{BANK.name}</p>
            <p className="text-xs text-slate-600">{BANK.type} {pick(lang, bookingText.payment.accountType)}</p>
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <Row label={pick(lang, bookingText.payment.accountName)} value={BANK.accountName} />
          <Row
            label={pick(lang, bookingText.payment.accountNumber)}
            value={BANK.accountNumber}
            onCopy={() => copy(BANK.accountNumber, pick(lang, bookingText.payment.accountNumber))}
            copied={copied === pick(lang, bookingText.payment.accountNumber)}
          />
          <Row
            label={pick(lang, bookingText.payment.swift)}
            value={BANK.swift}
            onCopy={() => copy(BANK.swift, pick(lang, bookingText.payment.swift))}
            copied={copied === pick(lang, bookingText.payment.swift)}
          />
        </dl>
      </section>

      {/* QR code / PromptPay */}
      {/* <section className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <Label className="text-sm text-slate-700">Scan QR code</Label>
          <div className="mt-2 flex items-center justify-center">
            {BANK.qrImage ? (
              <div className="relative h-44 w-44 overflow-hidden rounded-md border border-slate-200">
                <Image src={BANK.qrImage} alt="QR code" fill className="object-contain" />
              </div>
            ) : (
              <div className="h-44 w-44 rounded-md border border-dashed border-slate-300 text-slate-400 flex items-center justify-center text-xs">
                QR code not provided
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <Label className="text-sm text-slate-700">PromptPay</Label>
          <p className="mt-2 text-2xl font-bold text-slate-900">{BANK.promptpay}</p>
          <p className="text-sm text-slate-600">{BANK.promptpayName}</p>
          <button
            type="button"
            onClick={() => copy(BANK.promptpay, "PromptPay")}
            className="mt-3 inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90"
          >
            {copied === "PromptPay" ? "Copied!" : "Copy number"}
          </button>
        </div>
      </section> */}

      {/* Upload payment slip (optional) */}
      {/* <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
        <Label htmlFor="paymentSlip" className="text-sm text-slate-700">
          Upload payment slip (optional)
        </Label>
        <input
          id="paymentSlip"
          name="paymentSlip"
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0]
            setSlipName(file ? file.name : "")
            handleChange?.(e)
          }}
          className="mt-2 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90"
        />
        {slipName ? <p className="mt-1 text-xs text-slate-600">Selected: {slipName}</p> : null}
        <p className="mt-2 text-xs text-slate-500">
          We’ll verify your payment and confirm by email/WhatsApp within 24 hours.
        </p>
      </section> */}
    </div>
  )
}

function Row({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string
  value: string
  onCopy?: () => void
  copied?: boolean
}) {
  const { lang } = useLanguage()
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="flex items-center gap-2">
        <span className="text-right break-all">{value}</span>
        {onCopy ? (
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
          >
            {copied ? pick(lang, bookingText.payment.copied) : pick(lang, bookingText.payment.copy)}
          </button>
        ) : null}
      </dd>
    </div>
  )
}