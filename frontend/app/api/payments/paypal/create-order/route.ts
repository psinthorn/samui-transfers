import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { db } from "@/lib/db"

interface PayPalCreateOrderRequest {
  bookingId: string
  amount: number
  currency?: string
  email?: string
  bookingDetails?: {
    description?: string
  }
}

/**
 * Create PayPal Order
 * POST /api/payments/paypal/create-order
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as PayPalCreateOrderRequest

    // Validate required fields
    if (!body.bookingId || !body.amount) {
      return NextResponse.json(
        { error: "Missing required fields: bookingId, amount" },
        { status: 400 }
      )
    }

    // Validate amount
    if (body.amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
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

    // Create PayPal order
    const orderResponse = await fetch("https://api.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: body.bookingId,
            amount: {
              currency_code: body.currency || "THB",
              value: body.amount.toString(),
            },
            description: body.bookingDetails?.description || `Booking #${body.bookingId}`,
          },
        ],
        payer: body.email ? { email_address: body.email } : undefined,
        application_context: {
          brand_name: "Samui Transfers",
          locale: "en-US",
          landing_page: "BILLING",
          user_action: "PAY_NOW",
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/paypal/capture-order?bookingId=${body.bookingId}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/error?reason=payment_cancelled`,
        },
      }),
    })

    if (!orderResponse.ok) {
      const error = await orderResponse.json()
      console.error("❌ PayPal order creation failed:", error)
      return NextResponse.json(
        { error: error.message || "Failed to create PayPal order" },
        { status: 500 }
      )
    }

    const order = await orderResponse.json()

    // Store order ID in database for verification
    if (order.id) {
      try {
        // Create payment record (will error if already exists, which is OK)
        await db.payment.create({
          data: {
            bookingId: body.bookingId,
            paypalOrderId: order.id,
            status: "PENDING",
            method: "paypal",
            amount: body.amount,
            currency: body.currency || "THB",
            payerEmail: body.email,
          },
        }).catch(() => {
          // Record might already exist, that's OK
        })
      } catch (dbError) {
        console.error("Warning: Could not store payment record:", dbError)
        // Don't fail the request if DB fails, just log it
      }
    }

    // Find approval link from order
    const approvalLink = order.links?.find((link: any) => link.rel === "approve")?.href

    console.log("✅ PayPal order created successfully:", {
      orderId: order.id,
      bookingId: body.bookingId,
      amount: body.amount,
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      approvalLink,
      status: order.status,
    })
  } catch (error) {
    console.error("❌ PayPal create order error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
