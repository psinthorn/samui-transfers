// Cron Job for Payment Reminders
// Runs every 30 minutes via Vercel cron jobs
// Processes payment reminders and auto-cancels overdue bookings

import { NextRequest, NextResponse } from "next/server"
import { processPaymentReminders } from "@/lib/payment-reminders/service"

function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.warn("CRON_SECRET not configured in environment")
    return false
  }

  if (!authHeader) {
    console.error("Missing Authorization header in cron request")
    return false
  }

  const token = authHeader.replace("Bearer ", "")
  const isValid = token === cronSecret

  if (!isValid) {
    console.error("Invalid CRON_SECRET in Authorization header")
  }

  return isValid
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyCronSecret(request)) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid cron secret" },
        { status: 401 }
      )
    }

    console.log("Starting payment reminder processing...")
    const startTime = Date.now()

    const result = await processPaymentReminders()

    const duration = Date.now() - startTime
    console.log(`Payment reminder processing completed in ${duration}ms`, {
      processed: result.processed,
      sent: result.sent,
      cancelled: result.cancelled,
      errors: result.errors,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Payment reminders processed successfully",
        data: {
          processed: result.processed,
          sent: result.sent,
          cancelled: result.cancelled,
          errors: result.errors,
          duration: `${duration}ms`,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    console.error("Error processing payment reminders:", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process payment reminders",
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      status: "healthy",
      endpoint: "/api/cron/payment-reminders",
      description: "Payment reminder processor cron job",
      schedule: "Every 30 minutes",
      lastRun: new Date().toISOString(),
    },
    { status: 200 }
  )
}
