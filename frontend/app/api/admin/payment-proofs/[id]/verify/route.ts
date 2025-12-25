import { NextRequest, NextResponse } from "next/server"
import { Decimal } from "@prisma/client/runtime/library"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/email/service"

export const runtime = "nodejs"

// POST - Verify payment proof
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    await requireAdmin()

    const body = await request.json()
    const { bookingId, amountReceived } = body

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

    // Verify the amount is reasonable (within 10% of expected)
    const amountDifference = Math.abs(amountReceived - Number(proof.expectedAmount))
    const percentageDifference = (amountDifference / Number(proof.expectedAmount)) * 100

    if (percentageDifference > 10) {
      return NextResponse.json(
        { error: "Amount received differs by more than 10% from expected" },
        { status: 400 }
      )
    }

    // Update proof status
    await db.paymentProof.update({
      where: { id: proofId },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
      },
    })

    // Update booking payment status
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { user: true },
    })

    if (booking) {
      await db.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: "COMPLETED",
          paymentDate: new Date(),
          paymentAmount: new Decimal(amountReceived),
          paymentProofStatus: "VERIFIED",
          status: "CONFIRMED",
        },
      })

      // Send verification email to customer
      if (booking.user?.email) {
        await sendEmail({
          to: booking.user.email,
          subject: `Payment Verified - Booking ${booking.referenceNumber}`,
          html: `
            <h2>Payment Verified</h2>
            <p>Dear ${booking.user.name},</p>
            <p>Your payment proof has been verified by our team.</p>
            <ul>
              <li><strong>Booking Reference:</strong> ${booking.referenceNumber}</li>
              <li><strong>Amount:</strong> ฿${amountReceived.toLocaleString()}</li>
              <li><strong>Status:</strong> Confirmed</li>
            </ul>
            <p>Your booking is now confirmed. You will receive further updates via email.</p>
            <p>Thank you for booking with us!</p>
          `,
          text: `Payment Verified for booking ${booking.referenceNumber}`,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment proof verified successfully",
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

