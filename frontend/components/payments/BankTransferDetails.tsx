"use client"

import React, { useState } from "react"
import Image from "next/image"

interface BankTransferDetailsProps {
  amount: number
  currency?: string
  bookingId: string
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
  qrImage: process.env.NEXT_PUBLIC_BANK_QR_IMAGE || "",
  logo: process.env.NEXT_PUBLIC_BANK_LOGO || "",
}

export function BankTransferDetails({
  amount,
  currency = "THB",
  bookingId,
}: BankTransferDetailsProps) {
  const [copied, setCopied] = useState<string | null>(null)

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
    <div className="w-full max-w-md mx-auto">
      {/* Bank Transfer Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-700 font-semibold mb-2">💳 Bank Transfer Instructions</p>
        <ol className="text-xs text-blue-600 space-y-1 list-decimal list-inside">
          <li>Copy the account details below</li>
          <li>Transfer {currency} {amount.toLocaleString()} to the bank account</li>
          <li>Include booking ID: <code className="bg-white px-1 py-0.5 rounded">{bookingId}</code> in the transfer reference</li>
          <li>Take a screenshot of the transfer confirmation</li>
          <li>Upload the receipt using the form below</li>
        </ol>
      </div>

      {/* Bank Details Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <div className="flex items-center gap-3 mb-4">
          {BANK.logo ? (
            <div className="relative h-10 w-10 overflow-hidden rounded">
              <Image src={BANK.logo} alt="Bank logo" fill className="object-contain" />
            </div>
          ) : null}
          <div>
            <p className="text-sm font-semibold text-slate-900">{BANK.name}</p>
            <p className="text-xs text-slate-600">{BANK.type} Account</p>
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-200 pt-4">
          {/* Account Name */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Account Name</p>
              <p className="text-sm font-medium text-slate-900">{BANK.accountName}</p>
            </div>
            <button
              type="button"
              onClick={() => copy(BANK.accountName, "accountName")}
              className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition"
            >
              {copied === "accountName" ? "✓ Copied" : "Copy"}
            </button>
          </div>

          {/* Account Number */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Account Number</p>
              <p className="text-sm font-mono font-medium text-slate-900">{BANK.accountNumber}</p>
            </div>
            <button
              type="button"
              onClick={() => copy(BANK.accountNumber, "accountNumber")}
              className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition"
            >
              {copied === "accountNumber" ? "✓ Copied" : "Copy"}
            </button>
          </div>

          {/* SWIFT Code */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">SWIFT/BIC Code</p>
              <p className="text-sm font-mono font-medium text-slate-900">{BANK.swift}</p>
            </div>
            <button
              type="button"
              onClick={() => copy(BANK.swift, "swift")}
              className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition"
            >
              {copied === "swift" ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      {/* PromptPay / QR Code Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* PromptPay */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">PromptPay ID</p>
          <p className="text-lg font-mono font-bold text-slate-900">{BANK.promptpay}</p>
          <p className="text-xs text-slate-600 mt-1">{BANK.promptpayName}</p>
          <button
            type="button"
            onClick={() => copy(BANK.promptpay, "promptpay")}
            className="mt-3 w-full px-2 py-1.5 text-xs font-semibold bg-green-100 hover:bg-green-200 text-green-700 rounded transition"
          >
            {copied === "promptpay" ? "✓ Copied" : "Copy PromptPay"}
          </button>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">QR Code</p>
          {BANK.qrImage ? (
            <div className="relative h-32 w-32 mx-auto overflow-hidden rounded border border-slate-200">
              <Image src={BANK.qrImage} alt="Payment QR Code" fill className="object-contain" />
            </div>
          ) : (
            <div className="h-32 w-32 mx-auto flex items-center justify-center rounded border border-dashed border-slate-300 text-slate-400 text-xs text-center">
              QR Code not available
            </div>
          )}
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-amber-900 mb-2">⚠️ Important</p>
        <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
          <li>Please include your booking ID in the transfer reference/description</li>
          <li>We'll confirm your payment and booking within 24 hours of receiving the transfer</li>
          <li>Keep the transfer receipt for your records</li>
          <li>For international transfers, use the SWIFT/BIC code provided above</li>
        </ul>
      </div>
    </div>
  )
}
