import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { db } from "@/lib/db"

interface PayPalCaptureRequest {
  orderId: string
  bookingId: string
}

/**
 * Capture PayPal Order
 * POST /api/payments/paypal/capture-order
 * GET /api/payments/paypal/capture-order (from PayPal return redirect)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as PayPalCaptureRequest

    if (!body.orderId) {
      return NextResponse.json(
        { error: "Missing orderId" },
        { status: 400 }
      )
    }

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.error("❌ Missing PayPal credentials")
      return NextResponse.json(
        { error: "Payment service misconfigured" },
        { status: 500 }
      )
    }

    // Get PayPal access token using Basic Authentication
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
    const authResponse = await fetch("https://api.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Language": "en_US",
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${auth}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }).toString(),
    })

    if (!authResponse.ok) {
      const error = await authResponse.text()
      console.error("❌ PayPal auth failed:", error)
      return NextResponse.json(
        { error: "Failed to authenticate with PayPal" },
        { status: 500 }
      )
    }

    const { access_token } = await authResponse.json()

    // Capture PayPal order
    const captureResponse = await fetch(
      `https://api.sandbox.paypal.com/v2/checkout/orders/${body.orderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${access_token}`,
        },
      }
    )

    if (!captureResponse.ok) {
      const error = await captureResponse.json()
      console.error("❌ PayPal capture failed:", error)
      return NextResponse.json(
        { error: error.message || "Failed to capture PayPal order" },
        { status: 500 }
      )
    }

    const capturedOrder = await captureResponse.json()

    // Get transaction ID from captured order
    const transactionId =
      capturedOrder.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
      capturedOrder.id

    // Update payment record
    if (body.bookingId) {
      try {
        await db.payment.create({
          data: {
            bookingId: body.bookingId,
            paypalOrderId: body.orderId,
            transactionId,
            status: "COMPLETED",
            method: "paypal",
            amount: 0, // Amount should have been stored during order creation
            currency: "THB",
          },
        }).catch(() => {
          // Record might already exist, that's OK
        })
      } catch (dbError) {
        console.error("Warning: Could not update payment record:", dbError)
      }
    }

    console.log("✅ PayPal order captured successfully:", {
      orderId: body.orderId,
      transactionId,
      bookingId: body.bookingId,
    })

    return NextResponse.json({
      success: true,
      orderId: body.orderId,
      transactionId,
      status: capturedOrder.status,
    })
  } catch (error) {
    console.error("❌ PayPal capture error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // PayPal returns user to this URL after approval with 'token' parameter
    const searchParams = req.nextUrl.searchParams
    const token = searchParams.get("token")
    const bookingId = searchParams.get("bookingId")

    if (!token) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/booking/error?reason=invalid_token`)
    }

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.error("❌ Missing PayPal credentials")
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/booking/error?reason=server_error`)
    }

    // Get PayPal access token
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
    const authResponse = await fetch("https://api.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Language": "en_US",
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${auth}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }).toString(),
    })

    if (!authResponse.ok) {
      console.error("❌ PayPal auth failed")
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/booking/error?reason=auth_failed`)
    }

    const { access_token } = await authResponse.json()

    // Get order details using token
    const orderResponse = await fetch(
      `https://api.sandbox.paypal.com/v2/checkout/orders/${token}`,
      {
        headers: {
          "Authorization": `Bearer ${access_token}`,
        },
      }
    )

    if (!orderResponse.ok) {
      console.error("❌ Failed to fetch PayPal order")
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/booking/error?reason=order_not_found`)
    }

    const order = await orderResponse.json()

    // Capture the order
    const captureResponse = await fetch(
      `https://api.sandbox.paypal.com/v2/checkout/orders/${token}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${access_token}`,
        },
      }
    )

    if (!captureResponse.ok) {
      console.error("❌ Failed to capture PayPal order")
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/booking/error?reason=capture_failed`)
    }

    const capturedOrder = await captureResponse.json()

    // Get transaction ID
    const transactionId =
      capturedOrder.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
      capturedOrder.id

    // Update payment record if we have bookingId
    if (bookingId) {
      try {
        await db.payment.create({
          data: {
            bookingId,
            paypalOrderId: token,
            transactionId,
            status: "COMPLETED",
            method: "paypal",
            amount: 0, // Amount should have been stored during order creation
            currency: "THB",
          },
        }).catch(() => {
          // Record might already exist
        })
      } catch (dbError) {
        console.error("Warning: Could not update payment record:", dbError)
      }
    }

    console.log("✅ PayPal payment completed:", {
      orderId: token,
      transactionId,
      bookingId,
    })

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?orderId=${token}&transactionId=${transactionId}`
    )
  } catch (error) {
    console.error("❌ PayPal GET error:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/booking/error?reason=server_error`)
  }
}
