import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { email: session.user.email || "" },
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || undefined
    const method = searchParams.get("method") || undefined
    const dateRange = searchParams.get("dateRange") || "30days"
    const sortBy = searchParams.get("sortBy") || "recent"

    // Calculate date filter
    const now = new Date()
    let startDate = new Date()

    switch (dateRange) {
      case "7days":
        startDate.setDate(now.getDate() - 7)
        break
      case "30days":
        startDate.setDate(now.getDate() - 30)
        break
      case "90days":
        startDate.setDate(now.getDate() - 90)
        break
      case "all":
        startDate = new Date("1970-01-01")
        break
    }

    // Build where clause
    const where: any = {
      createdAt: {
        gte: startDate,
        lte: now,
      },
    }

    if (status) {
      where.status = status
    }

    if (method) {
      where.method = method
    }

    // Determine sort order
    let orderBy: any = { createdAt: "desc" }

    switch (sortBy) {
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      case "amount-high":
        orderBy = { amount: "desc" }
        break
      case "amount-low":
        orderBy = { amount: "asc" }
        break
      case "recent":
      default:
        orderBy = { createdAt: "desc" }
        break
    }

    // Fetch payments
    const payments = await db.payment.findMany({
      where,
      orderBy,
      select: {
        id: true,
        bookingId: true,
        method: true,
        amount: true,
        currency: true,
        status: true,
        payerEmail: true,
        payerName: true,
        completedAt: true,
        createdAt: true,
      },
    })

    // Convert Decimal to number for JSON response
    const formattedPayments = payments.map((p) => ({
      ...p,
      amount: Number(p.amount),
    }))

    return NextResponse.json(formattedPayments, { status: 200 })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}
