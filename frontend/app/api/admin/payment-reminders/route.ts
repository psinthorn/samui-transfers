/**
 * API Route: Trigger Payment Reminders
 * 
 * POST /api/admin/payment-reminders/trigger
 * - Requires admin authentication
 * - Manually trigger payment reminder processing
 * - Used for testing and manual trigger
 * 
 * GET /api/admin/payment-reminders
 * - Requires admin authentication
 * - Get reminder status and settings
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { processPaymentReminders } from "@/lib/payment-reminders/service"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    // GET reminder settings and stats
    const settings = await db.paymentReminderSettings.findMany({
      orderBy: { hoursAfterBooking: "asc" },
    })

    const stats = await Promise.all(
      settings.map(async (setting: any) => {
        const reminders = await db.paymentReminder.groupBy({
          by: ["status"],
          where: { reminderType: setting.reminderType },
          _count: true,
        })

        return {
          reminderType: setting.reminderType,
          hoursAfterBooking: setting.hoursAfterBooking,
          enabled: setting.enabled,
          stats: reminders,
        }
      })
    )

    return NextResponse.json({
      settings,
      stats,
    })
  } catch (error) {
    console.error("Error fetching reminder settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch reminder settings" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { action } = body

    if (action === "trigger") {
      // Process all pending reminders
      const result = await processPaymentReminders()

      return NextResponse.json({
        success: true,
        message: "Payment reminders processed",
        result,
      })
    }

    if (action === "update-settings") {
      // Update reminder settings
      const { reminderType, hoursAfterBooking, enabled } = body

      if (!reminderType) {
        return NextResponse.json(
          { error: "reminderType is required" },
          { status: 400 }
        )
      }

      const setting = await db.paymentReminderSettings.update({
        where: { reminderType },
        data: {
          ...(hoursAfterBooking && { hoursAfterBooking }),
          ...(enabled !== undefined && { enabled }),
        },
      })

      return NextResponse.json({
        success: true,
        setting,
      })
    }

    return NextResponse.json(
      { error: "Unknown action" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error processing reminder action:", error)

    if (error instanceof Error) {
      if (error.message.includes("Unauthorized")) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { error: "Failed to process reminder action" },
      { status: 500 }
    )
  }
}
