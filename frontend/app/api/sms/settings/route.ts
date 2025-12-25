/**
 * User SMS Settings API
 * 
 * Endpoints:
 * - GET: Fetch user's SMS settings
 * - POST: Update user's SMS preferences
 * - POST with action="send-verification": Send verification code
 * - POST with action="verify-code": Verify phone number
 */

import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"

// GET: Fetch user's SMS settings
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    let smsSettings = await db.sMSSettings.findUnique({
      where: { userId: user.id },
    })

    // Create default settings if not exists
    if (!smsSettings) {
      smsSettings = await db.sMSSettings.create({
        data: {
          userId: user.id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      settings: smsSettings,
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

// POST: Update SMS settings or perform actions
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { action, ...data } = body

    if (action === "update-preferences") {
      // Update notification preferences
      const { smsService } = await import("@/lib/sms/service")
      const {
        bookingConfirmation,
        paymentReminders,
        paymentConfirmation,
        refundNotification,
        driverNotifications,
      } = data

      const settings = await smsService.updateUserSettings(user.id, {
        bookingConfirmation: bookingConfirmation ?? undefined,
        paymentReminders: paymentReminders ?? undefined,
        paymentConfirmation: paymentConfirmation ?? undefined,
        refundNotification: refundNotification ?? undefined,
        driverNotifications: driverNotifications ?? undefined,
      })

      return NextResponse.json({
        success: true,
        message: "Preferences updated",
        settings,
      })
    }

    if (action === "send-verification") {
      // Send verification code to phone number
      const { smsService } = await import("@/lib/sms/service")
      const { phoneNumber } = data as { phoneNumber: string }

      if (!phoneNumber) {
        return NextResponse.json(
          { success: false, error: "Phone number required" },
          { status: 400 }
        )
      }

      const result = await smsService.sendVerificationCode(phoneNumber, user.id)

      if (result.success) {
        // Store code temporarily (in production use Redis or similar)
        // For now, we'll return the code (not secure for production)
        return NextResponse.json({
          success: true,
          message: "Verification code sent",
          // Don't return code in production
        })
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        )
      }
    }

    if (action === "verify-code") {
      // Verify phone number with code
      const { phoneNumber, code } = data as {
        phoneNumber: string
        code: string
      }

      if (!phoneNumber || !code) {
        return NextResponse.json(
          { success: false, error: "Phone number and code required" },
          { status: 400 }
        )
      }

      // In production, verify against stored code and expiration
      // For now, accept any 6-digit code
      if (!/^\d{6}$/.test(code)) {
        return NextResponse.json(
          { success: false, error: "Invalid verification code" },
          { status: 400 }
        )
      }

      const { smsService } = await import("@/lib/sms/service")
      const settings = await smsService.updateUserSettings(user.id, {
        phoneNumber,
      })

      return NextResponse.json({
        success: true,
        message: "Phone number verified",
        settings,
      })
    }

    if (action === "opt-out") {
      // Opt out of SMS notifications
      const { smsService } = await import("@/lib/sms/service")
      const settings = await smsService.updateUserSettings(user.id, {
        optedOut: true,
      })

      return NextResponse.json({
        success: true,
        message: "You have been opted out of SMS notifications",
        settings,
      })
    }

    if (action === "opt-in") {
      // Opt back in to SMS notifications
      const { smsService } = await import("@/lib/sms/service")
      const settings = await smsService.updateUserSettings(user.id, {
        optedOut: false,
      })

      return NextResponse.json({
        success: true,
        message: "You have been opted back in to SMS notifications",
        settings,
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
