"use client"

import { useState } from "react"
import { updateBookingStatus } from "@/actions/bookings"

interface BookingStatusUpdateDialogProps {
  bookingId: string
  currentStatus: string
  paymentAmount?: number
  onSuccess?: () => void
}

const PAYMENT_METHODS = [
  { id: "stripe", label: "Credit Card (Stripe)" },
  { id: "paypal", label: "PayPal" },
  { id: "bank_transfer", label: "Bank Transfer" },
  { id: "pay_on_tour", label: "Pay on Tour" },
  { id: "other", label: "Other" },
]

export function BookingStatusUpdateDialog({
  bookingId,
  currentStatus,
  paymentAmount,
  onSuccess,
}: BookingStatusUpdateDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await updateBookingStatus(
        bookingId,
        status as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED",
        paymentMethod || undefined,
        paymentAmount
      )

      if (!result.ok) {
        setError(result.message || "Failed to update booking status")
      } else {
        setSuccess(true)
        setTimeout(() => {
          setIsOpen(false)
          onSuccess?.()
          window.location.reload()
        }, 1500)
      }
    } catch (err) {
      setError("An error occurred while updating the booking")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Show payment method selector only for certain status transitions
  const shouldShowPaymentMethod =
    (currentStatus === "PENDING" && status === "CONFIRMED") ||
    (currentStatus === "CONFIRMED" && status === "COMPLETED")

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-50 transition-colors"
      >
        Update Status
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Update Booking Status
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current Status Display */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Current Status
                </label>
                <div className="px-3 py-2 bg-slate-100 rounded text-sm text-slate-700">
                  {currentStatus}
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
                  New Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#005B9A] focus:border-transparent"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Payment Method Selector - Show for status transitions */}
              {shouldShowPaymentMethod && (
                <div>
                  <label htmlFor="payment-method" className="block text-sm font-medium text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    id="payment-method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#005B9A] focus:border-transparent"
                  >
                    <option value="">Select payment method...</option>
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                  {shouldShowPaymentMethod && !paymentMethod && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Payment method is required for this status change
                    </p>
                  )}
                </div>
              )}

              {/* Payment Amount Display */}
              {paymentAmount && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Payment Amount
                  </label>
                  <div className="px-3 py-2 bg-slate-100 rounded text-sm text-slate-700">
                    ฿{paymentAmount.toFixed(2)}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  ✓ Booking status updated successfully!
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    status === currentStatus ||
                    (shouldShowPaymentMethod && !paymentMethod)
                  }
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#005B9A] hover:bg-[#004a7a] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
