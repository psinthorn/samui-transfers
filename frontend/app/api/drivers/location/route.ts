import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { updateDriverLocation, getDriverCurrentAssignment } from "@/lib/driver/service"
import { logActivity, ActivityActions, ResourceTypes } from "@/lib/audit/service"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// PATCH - Update driver location
export async function PATCH(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if user is a driver
    const driver = await prisma.driver.findUnique({
      where: { userId: session.user.id },
    })

    if (!driver) {
      return NextResponse.json(
        { error: "User is not a driver" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { latitude, longitude } = body

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "latitude and longitude are required" },
        { status: 400 }
      )
    }

    // Update location
    const updatedDriver = await updateDriverLocation({
      driverId: driver.id,
      latitude,
      longitude,
    })

    // Get current assignment
    const assignment = await getDriverCurrentAssignment(driver.id)

    // Log the activity
    await logActivity({
      actorId: session.user.id,
      action: ActivityActions.DRIVER_LOCATION_UPDATED,
      resourceType: ResourceTypes.DRIVER,
      resourceId: driver.id,
      newValues: {
        latitude,
        longitude,
      },
    })

    return NextResponse.json({
      success: true,
      driver: updatedDriver,
      currentAssignment: assignment,
    })
  } catch (error) {
    console.error("Failed to update driver location:", error)
    return NextResponse.json(
      { error: "Failed to update driver location" },
      { status: 500 }
    )
  }
}
