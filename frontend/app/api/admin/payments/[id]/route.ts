import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(
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

    // Fetch payment with related data
    const payment = await db.payment.findUnique({
      where: { id: params.id },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            referenceNumber: true,
            paymentStatus: true,
            paymentAmount: true,
            paymentMethod: true,
            paymentDate: true,
            details: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        webhooks: {
          select: {
            id: true,
            provider: true,
            eventType: true,
            processed: true,
            processedAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Convert Decimal to number for JSON response
    const formattedPayment = {
      ...payment,
      amount: Number(payment.amount),
      booking: payment.booking
        ? {
            ...payment.booking,
            estimatedAmount: payment.booking.paymentAmount
              ? Number(payment.booking.paymentAmount)
              : null,
          }
        : null,
    }

    return NextResponse.json(formattedPayment, { status: 200 })
  } catch (error) {
    console.error("Error fetching payment:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 }
    )
  }
}
