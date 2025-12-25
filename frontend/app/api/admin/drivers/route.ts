import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { logActivity, ActivityActions, ResourceTypes } from "@/lib/audit/service"

export const dynamic = "force-dynamic"

// GET all drivers (admin only)
export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || undefined
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: any = {}
    if (status) where.status = status

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.driver.count({ where }),
    ])

    return NextResponse.json({
      drivers,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error("Failed to fetch drivers:", error)
    return NextResponse.json(
      { error: "Failed to fetch drivers" },
      { status: 500 }
    )
  }
}

// POST - Register a new driver (admin only)
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const {
      userId,
      licenseNumber,
      licenseExpiry,
      vehicleType,
      registrationNumber,
    } = body

    if (!userId || !licenseNumber) {
      return NextResponse.json(
        { error: "userId and licenseNumber are required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if driver already exists
    const existingDriver = await prisma.driver.findUnique({
      where: { userId },
    })

    if (existingDriver) {
      return NextResponse.json(
        { error: "Driver already exists for this user" },
        { status: 409 }
      )
    }

    // Check if license number is unique
    const existingLicense = await prisma.driver.findUnique({
      where: { licenseNumber },
    })

    if (existingLicense) {
      return NextResponse.json(
        { error: "License number already in use" },
        { status: 409 }
      )
    }

    // Create driver
    const driver = await prisma.driver.create({
      data: {
        userId,
        licenseNumber,
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : undefined,
        vehicleType,
        registrationNumber,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Log the activity
    await logActivity({
      actorId: session.user.id,
      action: ActivityActions.DRIVER_ASSIGNED,
      resourceType: ResourceTypes.DRIVER,
      resourceId: driver.id,
      details: `Driver registered: ${user.name} (${licenseNumber})`,
    })

    return NextResponse.json(driver, { status: 201 })
  } catch (error) {
    console.error("Failed to register driver:", error)
    return NextResponse.json(
      { error: "Failed to register driver" },
      { status: 500 }
    )
  }
}
