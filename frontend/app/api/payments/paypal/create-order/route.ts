import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  Client,
  Environment,
  LogLevel,
  OrdersCreateRequest,
} from "@paypal/paypal-server-sdk"

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
    const {
      bookingId,
      amount,
      currency = "THB",
      email,
      bookingDetails,
    } = await req.json()

    if (!bookingId || !amount || !email) {
      return NextResponse.json(
        { error: "Missing required fields: bookingId, amount, email" },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      )
    }

    // Create PayPal order
    const ordersCreateRequest = new OrdersCreateRequest()
    ordersCreateRequest.prefer("return=representation")
    ordersCreateRequest.body = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: bookingId,
          description: bookingDetails?.description || `Booking #${bookingId}`,
          amount: {
            currency_code: currency,
            value: amount.toString(),
            breakdown: {
              item_total: {
                currency_code: currency,
                value: amount.toString(),
              },
            },
          },
          items: [
            {
              name: `Booking #${bookingId}`,
              description: bookingDetails?.description || "Transfer booking",
              unit_amount: {
                currency_code: currency,
                value: amount.toString(),
              },
              quantity: "1",
            },
          ],
        },
      ],
      payer: {
        email_address: email,
      },
      application_context: {
        brand_name: "Samui Transfers",
        locale: "en-US",
        landing_page: "BILLING",
        return_url: `${process.env.NEXTAUTH_URL}/api/payments/paypal/capture-order?bookingId=${bookingId}`,
        cancel_url: `${process.env.NEXTAUTH_URL}${process.env.PAYMENT_CANCEL_URL || "/booking/cancel"}?bookingId=${bookingId}`,
        user_action: "PAY_NOW",
      },
    }

    const response = await client
      .ordersController()
      .ordersCreate(ordersCreateRequest)

    console.log(`✓ PayPal order created: ${response.result?.id}`)

    return NextResponse.json({
      success: true,
      orderId: response.result?.id,
      links: response.result?.links,
      approvalLink: response.result?.links?.find((link: any) => link.rel === "approve")
        ?.href,
      message: "PayPal order created successfully",
    })
  } catch (error) {
    console.error("❌ PayPal create order error:", error)

    return NextResponse.json(
      {
        error: "Failed to create PayPal order",
        details: (error as any)?.message,
      },
      { status: 500 }
    )
  }
}
