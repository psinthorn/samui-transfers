import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get counts for each service type
    const [transferCount, boatCount, tourCount, eventCount, packageCount] = await Promise.all([
      prisma.booking.count({
        where: { serviceType: "TRANSFER", status: "CONFIRMED" }
      }),
      prisma.speedboatBooking.count({
        where: { status: "AVAILABLE" }
      }),
      prisma.tourLocation.count({
        where: { contentApproved: true }
      }),
      prisma.booking.count({
        where: { serviceType: "EVENT", status: "CONFIRMED" }
      }),
      prisma.booking.count({
        where: { serviceType: "PACKAGE", status: "CONFIRMED" }
      }),
    ])

    return NextResponse.json({
      TRANSFER: transferCount,
      BOAT: boatCount,
      TOUR: tourCount,
      EVENT: eventCount,
      PACKAGE: packageCount,
    })
  } catch (error) {
    console.error("[Services Count] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch service counts" },
      { status: 500 }
    )
  }
}
