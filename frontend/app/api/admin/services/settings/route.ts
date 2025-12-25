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

    // Get or create service settings for each service type
    const serviceTypes = ["TRANSFER", "BOAT", "TOUR", "EVENT", "PACKAGE"]
    
    const settings = await Promise.all(
      serviceTypes.map(async (serviceType) => {
        let setting = await prisma.serviceSetting.findUnique({
          where: { serviceType: serviceType as any },
        })

        if (!setting) {
          // Create default settings if they don't exist
          setting = await prisma.serviceSetting.create({
            data: {
              serviceType: serviceType as any,
              isActive: true,
              maxCapacity: 50,
              minBookingDays: 1,
              maxBookingDays: 365,
              commissionRate: 15,
              description: `${serviceType} service settings`,
            },
          })
        }

        return setting
      })
    )

    return NextResponse.json(settings)
  } catch (error) {
    console.error("[Services Settings] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch service settings" },
      { status: 500 }
    )
  }
}
