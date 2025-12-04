"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/payment-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, RefreshCw, Undo2, Download } from "lucide-react"

interface PaymentDetailsType {
  id: string
  bookingId: string
  method: "stripe" | "paypal" | "bank_transfer" | "cash"
  amount: number
  currency: string
  status: string
  payerEmail: string
  payerName: string
  transactionId: string | null
  stripeSessionId: string | null
  paypalOrderId: string | null
  failureReason: string | null
  completedAt: string | null
  refundedAt: string | null
  createdAt: string
  updatedAt: string
  booking: {
    id: string
    pickupLocation: string
    dropoffLocation: string
    pickupDate: string
    pickupTime: string
    passengers: number
    vehicleType: string
    status: string
    userEmail: string
  } | null
  webhooks: Array<{
    id: string
    provider: string
    eventType: string
    processed: boolean
    processedAt: string | null
    createdAt: string
  }>
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  REFUNDED: "bg-purple-100 text-purple-800",
  PARTIALLY_REFUNDED: "bg-orange-100 text-orange-800",
}

const methodEmojis: Record<string, string> = {
  stripe: "💳",
  paypal: "🅿️",
  bank_transfer: "🏦",
  cash: "💵",
}

export default function PaymentDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const paymentId = params?.id as string

  const [payment, setPayment] = useState<PaymentDetailsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefunding, setIsRefunding] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [refundReason, setRefundReason] = useState("")

  useEffect(() => {
    fetchPaymentDetails()
  }, [paymentId])

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/payments/${paymentId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch payment details")
      }
      const data = await response.json()
      setPayment(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const handleRefund = async () => {
    try {
      setIsRefunding(true)
      const response = await fetch(
        `/api/admin/payments/${paymentId}/refund`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: refundReason }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to process refund")
      }

      const updatedPayment = await response.json()
      setPayment(updatedPayment)
      setShowRefundDialog(false)
      setRefundReason("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsRefunding(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded w-40 animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div className="container mx-auto py-10">
        <Link
          href="/admin/payments"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Payments
        </Link>
        <div className="text-red-600">
          {error || "Payment not found"}
        </div>
      </div>
    )
  }

  const canRefund =
    payment.status === "COMPLETED" || payment.status === "PARTIALLY_REFUNDED"

  return (
    <div className="container mx-auto py-10">
      <Link
        href="/admin/payments"
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Payments
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Payment #{payment.id.slice(-8).toUpperCase()}
                </h1>
                <p className="text-sm text-gray-600">
                  {methodEmojis[payment.method]} {payment.method.replace("_", " ").toUpperCase()}
                </p>
              </div>
              <Badge className={statusColors[payment.status]}>
                {payment.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600 mb-1">Amount</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(payment.amount, payment.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Payment Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(payment.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Payer Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payer Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="text-base text-gray-900">{payment.payerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-base text-gray-900">{payment.payerEmail}</p>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Transaction Details
            </h2>
            <div className="space-y-3">
              {payment.transactionId && (
                <div>
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {payment.transactionId}
                  </p>
                </div>
              )}
              {payment.stripeSessionId && (
                <div>
                  <p className="text-sm text-gray-600">Stripe Session ID</p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {payment.stripeSessionId}
                  </p>
                </div>
              )}
              {payment.paypalOrderId && (
                <div>
                  <p className="text-sm text-gray-600">PayPal Order ID</p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {payment.paypalOrderId}
                  </p>
                </div>
              )}
              {payment.failureReason && (
                <div>
                  <p className="text-sm text-gray-600">Failure Reason</p>
                  <p className="text-sm text-red-600">{payment.failureReason}</p>
                </div>
              )}
              {payment.completedAt && (
                <div>
                  <p className="text-sm text-gray-600">Completed At</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(payment.completedAt)}
                  </p>
                </div>
              )}
              {payment.refundedAt && (
                <div>
                  <p className="text-sm text-gray-600">Refunded At</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(payment.refundedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Information */}
          {payment.booking && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Booking Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Booking ID</p>
                    <Link
                      href={`/admin/bookings/${payment.booking.id}`}
                      className="text-blue-600 hover:text-blue-800 font-mono text-sm"
                    >
                      {payment.booking.id}
                    </Link>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge className="mt-1">{payment.booking.status}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Route</p>
                    <p className="text-sm text-gray-900">
                      {payment.booking.pickupLocation} → {payment.booking.dropoffLocation}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="text-sm text-gray-900">
                      {formatDate(payment.booking.pickupDate)} at{" "}
                      {payment.booking.pickupTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Passengers</p>
                    <p className="text-sm text-gray-900">
                      {payment.booking.passengers}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Type</p>
                    <p className="text-sm text-gray-900">
                      {payment.booking.vehicleType}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Webhook Events */}
          {payment.webhooks.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Webhook Events
              </h2>
              <div className="space-y-3">
                {payment.webhooks.map((webhook) => (
                  <div
                    key={webhook.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {webhook.eventType}
                      </p>
                      <p className="text-xs text-gray-600">
                        {webhook.provider} • {formatDate(webhook.createdAt)}
                      </p>
                    </div>
                    {webhook.processed && (
                      <Badge className="bg-green-100 text-green-800">
                        Processed
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Actions
            </h2>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => fetchPaymentDetails()}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>

              {canRefund && (
                <Button
                  variant="destructive"
                  className="w-full justify-start gap-2"
                  onClick={() => setShowRefundDialog(true)}
                >
                  <Undo2 className="w-4 h-4" />
                  Refund Payment
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </Button>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-semibold">
                  {formatCurrency(payment.amount, payment.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="font-semibold capitalize">
                  {payment.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="font-semibold text-xs">
                  {formatDate(payment.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Dialog */}
      <AlertDialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Process Refund</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to refund this payment? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Refund Reason (Optional)
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter reason for refund..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={3}
              />
            </div>
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-900">
                Refund Amount: {formatCurrency(payment.amount, payment.currency)}
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={isRefunding}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRefund}
              disabled={isRefunding}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRefunding ? "Processing..." : "Confirm Refund"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
