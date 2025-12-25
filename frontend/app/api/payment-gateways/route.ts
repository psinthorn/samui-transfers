import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET public payment gateways (for customer-facing pages)
export async function GET(req: NextRequest) {
  try {
    // Get only public and enabled gateways, sorted by display order
    const gateways = await db.paymentGateway.findMany({
      where: {
        isPublic: true,
        enabled: true,
      },
      select: {
        id: true,
        type: true,
        displayName: true,
        description: true,
        icon: true,
        processingTime: true,
        fees: true,
        metadata: true,
      },
      orderBy: { displayOrder: "asc" },
    })

    // Cache for 5 minutes
    const response = NextResponse.json(gateways)
    response.headers.set("Cache-Control", "public, max-age=300")
    return response
  } catch (error) {
    console.error("Error fetching public payment gateways:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment gateways" },
      { status: 500 }
    )
  }
}
