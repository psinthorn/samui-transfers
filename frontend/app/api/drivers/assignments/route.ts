import { NextResponse } from "next/server"
import { auth } from "@/auth"
import {
  assignDriverToBooking,
  getDriverCurrentAssignment,
  cancelDriverAssignment,
  completeDriverAssignment,
} from "@/lib/driver/service"
import { logActivity, ActivityActions, ResourceTypes } from "@/lib/audit/service"

export const dynamic = "force-dynamic"

// GET current assignment for authenticated driver
export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const driverId = searchParams.get("driverId")

    if (!driverId) {
      return NextResponse.json(
        { error: "driverId is required" },
        { status: 400 }
      )
    }

    const assignment = await getDriverCurrentAssignment(driverId)

    return NextResponse.json({
      assignment,
    })
  } catch (error) {
    console.error("Failed to get driver assignment:", error)
    return NextResponse.json(
      { error: "Failed to get driver assignment" },
      { status: 500 }
    )
  }
}

// POST - Create/assign driver to booking (admin only)
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { driverId, bookingId, pickupLatitude, pickupLongitude } = body

    if (!driverId || !bookingId) {
      return NextResponse.json(
        { error: "driverId and bookingId are required" },
        { status: 400 }
      )
    }

    const assignment = await assignDriverToBooking({
      driverId,
      bookingId,
      pickupLatitude,
      pickupLongitude,
    })

    // Log the activity
    await logActivity({
      actorId: session.user.id,
      action: ActivityActions.DRIVER_ASSIGNED,
      resourceType: ResourceTypes.BOOKING,
      resourceId: bookingId,
      details: `Driver assigned to booking`,
      newValues: {
        driverId,
      },
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error: any) {
    console.error("Failed to assign driver:", error)
    return NextResponse.json(
      { error: error.message || "Failed to assign driver" },
      { status: 400 }
    )
  }
}

// PATCH - Update assignment status
export async function PATCH(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { assignmentId, action, rating, comment, reason } = body

    if (!assignmentId || !action) {
      return NextResponse.json(
        { error: "assignmentId and action are required" },
        { status: 400 }
      )
    }

    let result

    if (action === "complete") {
      result = await completeDriverAssignment(assignmentId, rating, comment)

      // Log the activity
      await logActivity({
        actorId: session.user.id,
        action: ActivityActions.DRIVER_ASSIGNED,
        resourceType: ResourceTypes.DRIVER,
        resourceId: result.driverId,
        details: `Assignment completed`,
        newValues: {
          status: "completed",
          rating,
        },
      })
    } else if (action === "cancel") {
      result = await cancelDriverAssignment(assignmentId, reason)

      // Log the activity
      await logActivity({
        actorId: session.user.id,
        action: ActivityActions.DRIVER_ASSIGNED,
        resourceType: ResourceTypes.DRIVER,
        resourceId: result.driverId,
        details: `Assignment cancelled: ${reason}`,
        newValues: {
          status: "cancelled",
        },
      })
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'complete' or 'cancel'" },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Failed to update assignment:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update assignment" },
      { status: 400 }
    )
  }
}
