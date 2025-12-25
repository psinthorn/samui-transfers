import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"

export const runtime = "nodejs"

// GET - List payment proofs for a booking
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get("bookingId")

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId query parameter is required" },
        { status: 400 }
      )
    }

    // Verify booking exists
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Get all proofs for this booking
    const proofs = await db.paymentProof.findMany({
      where: { bookingId: bookingId },
      orderBy: { uploadedAt: "desc" },
      select: {
        id: true,
        fileName: true,
        originalFileName: true,
        uploadedAt: true,
        status: true,
        fileSize: true,
        expectedAmount: true,
        filePath: true,
      },
    })

    return NextResponse.json({
      success: true,
      proofs: proofs,
    })
  } catch (error) {
    console.error("Error fetching proofs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
