import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    const user = session?.user as any

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get metrics for each service type
    const serviceTypes = ["TRANSFER", "BOAT", "TOUR", "EVENT", "PACKAGE"]
    
    const metrics = await Promise.all(
      serviceTypes.map(async (serviceType) => {
        const [totalBookings, confirmedBookings, pendingBookings, revenue] = await Promise.all([
          prisma.booking.count({
            where: { serviceType: serviceType as any },
          }),
          prisma.booking.count({
            where: { serviceType: serviceType as any, status: "CONFIRMED" },
          }),
          prisma.booking.count({
            where: { serviceType: serviceType as any, status: "PENDING" },
          }),
          prisma.payment.aggregate({
            where: {
              booking: {
                serviceType: serviceType as any,
              },
              status: "COMPLETED",
            },
            _sum: {
              amount: true,
            },
          }),
        ])

        return {
          serviceType,
          totalBookings,
          confirmedBookings,
          pendingBookings,
          totalRevenue: revenue._sum.amount || 0,
          averageRating: 4.5, // TODO: Calculate from reviews
          lastUpdated: new Date().toISOString(),
        }
      })
    )

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("[Services Metrics] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch service metrics" },
      { status: 500 }
    )
  }
}
