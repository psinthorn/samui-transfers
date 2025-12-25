import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const paymentMethod = searchParams.get("paymentMethod") || undefined
    const status = searchParams.get("status") || undefined
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined
    const search = searchParams.get("search") || undefined

    // Build where clause
    const where: any = {}

    if (status) where.paymentStatus = status
    if (paymentMethod) where.paymentMethod = paymentMethod

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = startDate
      if (endDate) where.createdAt.lte = endDate
    }

    if (search) {
      where.OR = [
        { requestNumber: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
      ]
    }

    // Get all bookings matching criteria
    const bookings = await db.booking.findMany({
      where,
      select: {
        id: true,
        requestNumber: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        paymentAmount: true,
        paymentDate: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    // Calculate statistics
    const stats = {
      totalBookings: bookings.length,
      totalAmount: 0,
      amountReceived: 0,
      amountPending: 0,
      amountFailed: 0,
      byMethod: {} as Record<string, { count: number; amount: number; status: "completed" | "pending" | "failed" }>,
      byDate: [] as Array<{ date: string; received: number; pending: number; failed: number }>,
      conversionRate: 0,
    }

    // Daily breakdown
    const dailyStats = new Map<string, { received: number; pending: number; failed: number }>()

    // Process each booking
    for (const booking of bookings) {
      const amount = Number(booking.paymentAmount || 0)
      stats.totalAmount += amount

      // Count by status
      if (booking.paymentStatus === "COMPLETED") {
        stats.amountReceived += amount
      } else if (booking.paymentStatus === "PENDING") {
        stats.amountPending += amount
      } else if (booking.paymentStatus === "FAILED") {
        stats.amountFailed += amount
      }

      // Count by method
      const method = booking.paymentMethod || "other"
      if (!stats.byMethod[method]) {
        stats.byMethod[method] = { count: 0, amount: 0, status: "pending" }
      }
      stats.byMethod[method].count += 1
      stats.byMethod[method].amount += amount
      if (booking.paymentStatus === "COMPLETED") {
        stats.byMethod[method].status = "completed"
      }

      // Daily breakdown
      if (booking.paymentDate) {
        const date = booking.paymentDate.toISOString().split("T")[0]
        if (!dailyStats.has(date)) {
          dailyStats.set(date, { received: 0, pending: 0, failed: 0 })
        }
        const dayStats = dailyStats.get(date)!
        if (booking.paymentStatus === "COMPLETED") {
          dayStats.received += amount
        } else if (booking.paymentStatus === "PENDING") {
          dayStats.pending += amount
        } else if (booking.paymentStatus === "FAILED") {
          dayStats.failed += amount
        }
      }
    }

    // Calculate conversion rate
    if (stats.totalAmount > 0) {
      stats.conversionRate = (stats.amountReceived / stats.totalAmount) * 100
    }

    // Convert daily stats to array
    stats.byDate = Array.from(dailyStats.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Payment reconciliation error:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment reconciliation data" },
      { status: 500 }
    )
  }
}
