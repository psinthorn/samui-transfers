import { useCallback } from "react"
import { db } from "@/lib/db"
import { Decimal } from "@prisma/client/runtime/library"

/**
 * Hook to integrate payments with bookings
 * Handles creating payment records and updating booking status
 */
export function useBookingPayment() {
  /**
   * Create a payment record for a booking
   */
  const createPayment = useCallback(
    async (paymentData: {
      bookingId: string
      method: "stripe" | "paypal"
      amount: number
      currency: string
      email: string
      payerName?: string
    }) => {
      try {
        const payment = await db.payment.create({
          data: {
            bookingId: paymentData.bookingId,
            method: paymentData.method,
            amount: new Decimal(paymentData.amount),
            currency: paymentData.currency,
            status: "PROCESSING",
            payerEmail: paymentData.email,
            payerName: paymentData.payerName,
            metadata: {
              initiatedAt: new Date().toISOString(),
              paymentMethod: paymentData.method,
            },
          },
        })

        return payment
      } catch (error) {
        console.error("Error creating payment record:", error)
        throw error
      }
    },
    []
  )

  /**
   * Update payment status to completed
   */
  const completePayment = useCallback(
    async (paymentData: {
      bookingId: string
      paymentId: string
      transactionId: string
      method: "stripe" | "paypal"
      stripeSessionId?: string
      paypalOrderId?: string
    }) => {
      try {
        // Update payment record
        const payment = await db.payment.update({
          where: { id: paymentData.paymentId },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            transactionId: paymentData.transactionId,
            stripeSessionId: paymentData.stripeSessionId,
            paypalOrderId: paymentData.paypalOrderId,
          },
        })

        // Update booking status
        const booking = await db.booking.update({
          where: { id: paymentData.bookingId },
          data: {
            status: "CONFIRMED",
            paymentStatus: "COMPLETED",
            paymentDate: new Date(),
          },
        })

        return { payment, booking }
      } catch (error) {
        console.error("Error completing payment:", error)
        throw error
      }
    },
    []
  )

  /**
   * Handle payment failure
   */
  const failPayment = useCallback(
    async (paymentData: {
      paymentId: string
      bookingId: string
      failureReason: string
      failureCode?: string
    }) => {
      try {
        const payment = await db.payment.update({
          where: { id: paymentData.paymentId },
          data: {
            status: "FAILED",
            failureReason: paymentData.failureReason,
            failureCode: paymentData.failureCode,
          },
        })

        // Don't update booking - keep it as is so user can retry
        return payment
      } catch (error) {
        console.error("Error failing payment:", error)
        throw error
      }
    },
    []
  )

  /**
   * Get payment status for a booking
   */
  const getPaymentStatus = useCallback(async (bookingId: string) => {
    try {
      const payment = await db.payment.findFirst({
        where: { bookingId },
        orderBy: { createdAt: "desc" },
      })

      return payment
    } catch (error) {
      console.error("Error fetching payment status:", error)
      return null
    }
  }, [])

  /**
   * Create webhook record for payment event
   */
  const recordWebhook = useCallback(
    async (webhookData: {
      paymentId: string
      provider: "stripe" | "paypal"
      eventType: string
      externalId: string
      rawData: Record<string, any>
    }) => {
      try {
        const webhook = await db.paymentWebhook.create({
          data: {
            paymentId: webhookData.paymentId,
            provider: webhookData.provider,
            eventType: webhookData.eventType,
            externalId: webhookData.externalId,
            rawData: webhookData.rawData,
          },
        })

        return webhook
      } catch (error) {
        console.error("Error recording webhook:", error)
        throw error
      }
    },
    []
  )

  return {
    createPayment,
    completePayment,
    failPayment,
    getPaymentStatus,
    recordWebhook,
  }
}
