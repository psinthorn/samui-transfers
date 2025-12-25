import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getResourceActivityLog } from "@/lib/audit/service"

export const dynamic = "force-dynamic"

interface RouteParams {
  params: Promise<{
    resourceType: string
    resourceId: string
  }>
}

export async function GET(request: Request, route: RouteParams) {
  try {
    const session = await auth()

    // Check if user is authenticated and is admin
    if (!session?.user?.id || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const params = await route.params
    const { resourceType, resourceId } = params

    if (!resourceType || !resourceId) {
      return NextResponse.json(
        { error: "resourceType and resourceId are required" },
        { status: 400 }
      )
    }

    const logs = await getResourceActivityLog(resourceType, resourceId)

    return NextResponse.json({
      logs,
      total: logs.length,
    })
  } catch (error) {
    console.error("Failed to fetch resource activity:", error)
    return NextResponse.json(
      { error: "Failed to fetch resource activity" },
      { status: 500 }
    )
  }
}
