import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/email/service"

export const runtime = "nodejs"

// POST - Reject payment proof
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    await requireAdmin()

    const body = await request.json()
    const { bookingId, reason } = body

    const proofId = params.id

    // Get the proof
    const proof = await db.paymentProof.findUnique({
      where: { id: proofId },
    })

    if (!proof) {
      return NextResponse.json({ error: "Payment proof not found" }, { status: 404 })
    }

    if (proof.status !== "PENDING") {
      return NextResponse.json({ error: "Proof has already been processed" }, { status: 400 })
    }

    // Update proof status with rejection reason
    await db.paymentProof.update({
      where: { id: proofId },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
        rejectedAt: new Date(),
      },
    })

    // Get booking and user info
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { user: true },
    })

    if (booking?.user?.email) {
      // Send rejection email to customer
      await sendEmail({
        to: booking.user.email,
        subject: `Payment Proof Rejected - Booking ${booking.referenceNumber}`,
        html: `
          <h2>Payment Proof Rejected</h2>
          <p>Dear ${booking.user.name},</p>
          <p>Unfortunately, your submitted payment proof could not be verified.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>Please submit a new payment proof or contact our support team for assistance.</p>
          <p><strong>Booking Reference:</strong> ${booking.referenceNumber}</p>
          <p>If you have any questions, please don't hesitate to reach out.</p>
          <p>Thank you for your patience.</p>
        `,
        text: `Payment proof rejected for booking ${booking.referenceNumber}`,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Payment proof rejected",
    })
  } catch (error) {
    console.error("Rejection error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
