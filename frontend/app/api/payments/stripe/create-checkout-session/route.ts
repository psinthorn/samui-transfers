import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")

export async function POST(req: NextRequest) {
  try {
    const { bookingId, amount, currency = "THB", email, bookingDetails } = await req.json()

    if (!bookingId || !amount || !email) {
      return NextResponse.json(
        { error: "Missing required fields: bookingId, amount, email" },
        { status: 400 }
      )
    }

    // Validate amount (Stripe uses cents)
    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      )
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Booking #${bookingId}`,
              description: bookingDetails?.description || "Transfer booking",
              images: bookingDetails?.images || undefined,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email,
      success_url: `${process.env.NEXTAUTH_URL}${process.env.PAYMENT_SUCCESS_URL || "/booking/success"}?session_id={CHECKOUT_SESSION_ID}&bookingId=${bookingId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}${process.env.PAYMENT_CANCEL_URL || "/booking/cancel"}?bookingId=${bookingId}`,
      metadata: {
        bookingId,
        email,
      },
    })

    console.log(`✓ Stripe checkout session created: ${session.id}`)

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      message: "Checkout session created successfully",
    })
  } catch (error) {
    console.error("❌ Stripe checkout session error:", error)

    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: (error as any)?.message,
      },
      { status: 500 }
    )
  }
}
