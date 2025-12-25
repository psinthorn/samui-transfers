"use client"

import { useState } from "react"
import { PaymentProofVerification } from "@/components/admin/PaymentProofVerification"
import { FileCheck, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminBookingPaymentProofProps {
  bookingId: string
  bookingReference: string
  paymentProofStatus?: string
  paymentAmount?: number
  onRefresh?: () => void
}

export function AdminBookingPaymentProof({
  bookingId,
  bookingReference,
  paymentProofStatus,
  paymentAmount,
  onRefresh,
}: AdminBookingPaymentProofProps) {
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)

  if (!paymentProofStatus) {
    return null
  }

  return (
    <>
      {/* Payment Proof Section */}
      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-slate-900">Payment Proof</p>
            <p className="text-xs text-slate-600 mt-1">Status: {paymentProofStatus}</p>
          </div>
          {paymentProofStatus === "UPLOADED" && (
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          )}
        </div>

        {paymentProofStatus === "UPLOADED" && (
          <Button
            onClick={() => setVerifyDialogOpen(true)}
            className="w-full bg-[#005B9A] hover:bg-[#004480] text-white"
          >
            <FileCheck className="w-4 h-4 mr-2" />
            Review & Verify Payment Proof
          </Button>
        )}

        {paymentProofStatus === "VERIFIED" && (
          <div className="text-sm text-green-700 font-medium">
            ✓ Payment proof verified
          </div>
        )}

        {paymentProofStatus === "REJECTED" && (
          <div className="text-sm text-red-700 font-medium">
            ✗ Payment proof rejected
          </div>
        )}
      </div>

      {/* Verification Dialog */}
      <PaymentProofVerification
        open={verifyDialogOpen}
        onOpenChange={setVerifyDialogOpen}
        bookingId={bookingId}
        bookingReference={bookingReference}
        actualPaymentAmount={paymentAmount}
        onVerified={onRefresh}
      />
    </>
  )
}
