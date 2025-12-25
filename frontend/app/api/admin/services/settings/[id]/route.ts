import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

type Params = Promise<{ id: string }>

export async function PUT(request: Request, props: { params: Params }) {
  try {
    const params = await props.params
    const serviceType = params.id
    const session = await auth()
    const user = session?.user as any

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Update or create service settings
    const updated = await prisma.serviceSetting.upsert({
      where: { serviceType: serviceType as any },
      update: {
        isActive: body.isActive ?? undefined,
        maxCapacity: body.maxCapacity ?? undefined,
        minBookingDays: body.minBookingDays ?? undefined,
        maxBookingDays: body.maxBookingDays ?? undefined,
        commissionRate: body.commissionRate ?? undefined,
        description: body.description ?? undefined,
      },
      create: {
        serviceType: serviceType as any,
        isActive: body.isActive ?? true,
        maxCapacity: body.maxCapacity ?? 50,
        minBookingDays: body.minBookingDays ?? 1,
        maxBookingDays: body.maxBookingDays ?? 365,
        commissionRate: body.commissionRate ?? 15,
        description: body.description ?? `${serviceType} service settings`,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[Update Service Settings] Error:", error)
    return NextResponse.json(
      { error: "Failed to update service settings" },
      { status: 500 }
    )
  }
}
