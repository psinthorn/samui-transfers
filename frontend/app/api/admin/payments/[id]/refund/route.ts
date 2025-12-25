import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    // Check authentication and authorization
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { email: session.user.email || "" },
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get request body
    const body = await req.json()
    const { amount, reason } = body

    // Fetch payment
    const payment = await db.payment.findUnique({
      where: { id: params.id },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Check if payment can be refunded
    if (payment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Only completed payments can be refunded" },
        { status: 400 }
      )
    }

    // Validate refund amount
    const refundAmount = amount ? Number(amount) : Number(payment.amount)
    if (refundAmount > Number(payment.amount)) {
      return NextResponse.json(
        { error: "Refund amount cannot exceed payment amount" },
        { status: 400 }
      )
    }

    // Update payment status to REFUNDED
    const newStatus =
      refundAmount < Number(payment.amount)
        ? "PARTIALLY_REFUNDED"
        : "REFUNDED"

    const updatedPayment = await db.payment.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        refundedAt: new Date(),
        failureReason: reason || "Admin refund",
        metadata: {
          ...(typeof payment.metadata === 'object' && payment.metadata ? payment.metadata : {}),
          refundedAmount: refundAmount,
          refundReason: reason,
          refundedBy: session.user.email,
          refundedAt: new Date().toISOString(),
        },
      },
    })

    // Record webhook event for refund
    await db.paymentWebhook.create({
      data: {
        externalId: `refund-${params.id}-${Date.now()}`,
        paymentId: params.id,
        provider: payment.method,
        eventType: "refund",
        processed: true,
        processedAt: new Date(),
        rawData: {
          type: "refund",
          refundAmount,
          reason,
          processedBy: session.user.email,
        },
      },
    })

    // Convert Decimal to number for JSON response
    const formattedPayment = {
      ...updatedPayment,
      amount: Number(updatedPayment.amount),
    }

    return NextResponse.json(formattedPayment, { status: 200 })
  } catch (error) {
    console.error("Error processing refund:", error)
    return NextResponse.json(
      { error: "Failed to process refund" },
      { status: 500 }
    )
  }
}
