import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getActivityLog, getResourceActivityLog } from "@/lib/audit/service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const session = await auth()

    // Check if user is authenticated and is admin
    if (!session?.user?.id || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)

    const actorId = searchParams.get("actorId") || undefined
    const action = searchParams.get("action") || undefined
    const resourceType = searchParams.get("resourceType") || undefined
    const resourceId = searchParams.get("resourceId") || undefined
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const result = await getActivityLog({
      actorId,
      action,
      resourceType,
      resourceId,
      startDate,
      endDate,
      limit,
      offset,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to fetch activity logs:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    )
  }
}
