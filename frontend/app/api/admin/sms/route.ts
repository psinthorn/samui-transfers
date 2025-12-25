/**
 * Admin SMS Settings API
 * 
 * Endpoints:
 * - GET: Fetch SMS settings and statistics
 * - POST with action="update-settings": Update SMS templates and settings
 * - POST with action="send-test": Send test SMS to phone number
 * - POST with action="get-templates": Get all SMS templates
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"

// GET: Fetch SMS settings and statistics
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    // Get all SMS templates
    const templates = await db.sMSTemplate.findMany({
      orderBy: { messageType: "asc" },
    })

    // Get SMS statistics
    const stats = await Promise.all([
      db.sMSMessage.count(),
      db.sMSMessage.count({ where: { status: "SENT" } }),
      db.sMSMessage.count({ where: { status: "FAILED" } }),
      db.sMSMessage.count({ where: { status: "PENDING" } }),
    ])

    const totalMessages = stats[0]
    const sentMessages = stats[1]
    const failedMessages = stats[2]
    const pendingMessages = stats[3]

    return NextResponse.json({
      success: true,
      templates,
      statistics: {
        totalMessages,
        sentMessages,
        failedMessages,
        pendingMessages,
        successRate: totalMessages > 0 ? ((sentMessages / totalMessages) * 100).toFixed(2) : "0",
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error fetching SMS settings:", errorMessage)

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

// POST: Handle admin actions
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { action, ...data } = body

    if (action === "update-settings") {
      // Update SMS templates
      const { templates } = data as {
        templates: Array<{
          messageType: string
          template: string
        }>
      }

      const results = []
      for (const tmpl of templates) {
        const updated = await db.sMSTemplate.upsert({
          where: { messageType: tmpl.messageType },
          update: { template: tmpl.template },
          create: {
            messageType: tmpl.messageType,
            template: tmpl.template,
            maxLength: 160,
          },
        })
        results.push(updated)
      }

      return NextResponse.json({
        success: true,
        message: `Updated ${results.length} SMS templates`,
        data: results,
      })
    }

    if (action === "send-test") {
      // Send test SMS
      const { smsService } = await import("@/lib/sms/service")
      const { phoneNumber, messageType } = data as {
        phoneNumber: string
        messageType: string
      }

      // Create a test user session or use admin user
      // For this we'll just send to the phone number
      const result = await smsService.sendSMS(
        phoneNumber,
        messageType as any,
        "test-admin-user",
        undefined,
        {
          bookingReference: "TEST-001",
          customerName: "Test User",
          amount: "1,000",
          currency: "THB",
          pickupTime: "12:00 PM",
          driverName: "Test Driver",
          driverPhone: "+66900000000",
          eta: "5",
        }
      )

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: "Test SMS sent successfully",
          messageSid: result.messageSid,
        })
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        )
      }
    }

    if (action === "get-templates") {
      // Get all SMS templates
      const templates = await db.sMSTemplate.findMany({
        orderBy: { messageType: "asc" },
      })

      return NextResponse.json({
        success: true,
        templates,
      })
    }

    if (action === "retry-failed") {
      // Retry failed SMS messages
      const { smsService } = await import("@/lib/sms/service")
      await smsService.retryFailedMessages()

      return NextResponse.json({
        success: true,
        message: "Failed SMS messages retry job started",
      })
    }

    return NextResponse.json(
      { success: false, error: "Unknown action" },
      { status: 400 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error in SMS settings API:", errorMessage)

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
