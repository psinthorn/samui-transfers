import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Client, Environment, LogLevel, OrdersCaptureRequest } from "@paypal/paypal-server-sdk"
import { db } from "@/lib/db"

const client = new Client({
  clientId: process.env.PAYPAL_CLIENT_ID || "",
  clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
  environment:
    process.env.PAYPAL_MODE === "live" ? Environment.Production : Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { orderId, bookingId } = await req.json()

    if (!orderId || !bookingId) {
      return NextResponse.json(
        { error: "Missing required fields: orderId, bookingId" },
        { status: 400 }
      )
    }

    // Capture the PayPal order
    const ordersCaptureRequest = new OrdersCaptureRequest(orderId)
    ordersCaptureRequest.prefer("return=representation")

    const response = await client
      .ordersController()
      .ordersCapture(ordersCaptureRequest)

    console.log(`✓ PayPal order captured: ${response.result?.id}`)

    // Extract payment details
    const capture = response.result?.purchase_units?.[0]?.payments?.captures?.[0]
    const paymentStatus = capture?.status || response.result?.status

    // Store payment in database
    if (capture?.id) {
      try {
        await db.payment.create({
          data: {
            bookingId,
            method: "paypal",
            amount: parseFloat(response.result?.purchase_units?.[0]?.amount?.value || "0"),
            currency: response.result?.purchase_units?.[0]?.amount?.currency_code || "THB",
            status: paymentStatus === "COMPLETED" ? "completed" : "pending",
            paypalOrderId: orderId,
            paypalCaptureId: capture.id,
            payer: response.result?.payer?.email_address,
            paymentDetails: JSON.stringify(capture),
          },
        })

        console.log(`✓ Payment record created for booking ${bookingId}`)
      } catch (dbError) {
        console.error("❌ Failed to save payment record:", dbError)
        // Continue anyway - payment was successful
      }
    }

    // Update booking if payment successful
    if (paymentStatus === "COMPLETED") {
      try {
        await db.booking.update({
          where: { id: bookingId },
          data: {
            status: "confirmed",
            paymentStatus: "paid",
          },
        })
        console.log(`✓ Updated booking ${bookingId} to paid`)
      } catch (bookingError) {
        console.error("❌ Failed to update booking:", bookingError)
      }
    }

    return NextResponse.json({
      success: true,
      orderId: response.result?.id,
      status: paymentStatus,
      message: "Payment captured successfully",
    })
  } catch (error) {
    console.error("❌ PayPal capture order error:", error)

    return NextResponse.json(
      {
        error: "Failed to capture PayPal order",
        details: (error as any)?.message,
      },
      { status: 500 }
    )
  }
}

// GET handler for redirect from PayPal
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")
  const bookingId = searchParams.get("bookingId")

  if (!token || !bookingId) {
    return NextResponse.redirect(
      new URL(`/booking/cancel?error=missing_params`, req.url)
    )
  }

  try {
    // Capture the order
    const ordersCaptureRequest = new OrdersCaptureRequest(token)
    ordersCaptureRequest.prefer("return=representation")

    const response = await client
      .ordersController()
      .ordersCapture(ordersCaptureRequest)

    const capture = response.result?.purchase_units?.[0]?.payments?.captures?.[0]
    const paymentStatus = capture?.status || response.result?.status

    // Store payment in database
    if (capture?.id) {
      try {
        await db.payment.create({
          data: {
            bookingId,
            method: "paypal",
            amount: parseFloat(response.result?.purchase_units?.[0]?.amount?.value || "0"),
            currency: response.result?.purchase_units?.[0]?.amount?.currency_code || "THB",
            status: paymentStatus === "COMPLETED" ? "completed" : "pending",
            paypalOrderId: token,
            paypalCaptureId: capture.id,
            payer: response.result?.payer?.email_address,
            paymentDetails: JSON.stringify(capture),
          },
        })
      } catch (dbError) {
        console.error("❌ Failed to save payment record:", dbError)
      }
    }

    // Update booking
    if (paymentStatus === "COMPLETED") {
      try {
        await db.booking.update({
          where: { id: bookingId },
          data: {
            status: "confirmed",
            paymentStatus: "paid",
          },
        })
      } catch (bookingError) {
        console.error("❌ Failed to update booking:", bookingError)
      }
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/booking/success?orderId=${token}&bookingId=${bookingId}`, req.url)
    )
  } catch (error) {
    console.error("❌ PayPal capture error:", error)
    return NextResponse.redirect(
      new URL(`/booking/cancel?error=${(error as any)?.message}`, req.url)
    )
  }
}
