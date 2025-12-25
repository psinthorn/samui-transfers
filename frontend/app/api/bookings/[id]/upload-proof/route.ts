import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { createHash } from "crypto"

export const runtime = "nodejs"

interface UploadProofRequest {
  file: File
  bookingId: string
  referenceNumber: string
  expectedAmount: string
}

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookingId = params.id
    const formData = await request.formData()

    const file = formData.get("file") as File
    const referenceNumber = formData.get("referenceNumber") as string
    const expectedAmount = parseFloat(formData.get("expectedAmount") as string)

    if (!file || !referenceNumber || !expectedAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify booking exists and belongs to user
    const booking = await db.booking.findFirst({
      where: {
        id: bookingId,
        referenceNumber: referenceNumber,
        user: {
          email: session.user.email,
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Only allow uploads for bookings awaiting payment
    if (booking.paymentStatus === "COMPLETED") {
      return NextResponse.json({ error: "Payment already verified for this booking" }, { status: 400 })
    }

    // Validate file
    if (!file.type.match(/^(image|application\/pdf)/)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const fileHash = createHash("sha256").update(buffer).digest("hex")
    const fileExt = file.name.split(".").pop() || "jpg"
    const fileName = `${bookingId}-${Date.now()}-${fileHash.substring(0, 8)}.${fileExt}`

    // Save file to public directory
    const uploadDir = join(process.cwd(), "public", "payment-proofs")
    await mkdir(uploadDir, { recursive: true })
    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    // Create payment proof record in database
    const paymentProof = await db.paymentProof.create({
      data: {
        bookingId: bookingId,
        fileName: fileName,
        originalFileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date(),
        status: "PENDING", // Will be verified by admin
        expectedAmount: expectedAmount,
        uploadedBy: session.user.email,
        filePath: `/payment-proofs/${fileName}`,
      },
    })

    // Update booking payment status to show proof uploaded
    await db.booking.update({
      where: { id: bookingId },
      data: {
        paymentProofStatus: "UPLOADED",
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Payment proof uploaded successfully",
        paymentProof: {
          id: paymentProof.id,
          fileName: paymentProof.fileName,
          uploadedAt: paymentProof.uploadedAt,
          status: paymentProof.status,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET endpoint to retrieve payment proof status
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookingId = params.id

    // Get booking and verify ownership
    const booking = await db.booking.findFirst({
      where: {
        id: bookingId,
        user: {
          email: session.user.email,
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Get payment proofs
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
      },
    })

    return NextResponse.json({
      success: true,
      proofs: proofs,
      bookingPaymentStatus: booking.paymentStatus,
      bookingPaymentProofStatus: booking.paymentProofStatus,
    })
  } catch (error) {
    console.error("Fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
