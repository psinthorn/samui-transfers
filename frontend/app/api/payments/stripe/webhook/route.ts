import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import Stripe from "stripe"
import { db } from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    console.log(`✓ Webhook event verified: ${event.type}`)
  } catch (error) {
    console.error("❌ Webhook signature verification failed:", (error as any)?.message)
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`✓ Payment succeeded: ${paymentIntent.id}`)

        const { bookingId } = paymentIntent.metadata || {}

        if (bookingId) {
          // Update payment status in database
          await db.payment.update({
            where: { stripePaymentIntentId: paymentIntent.id },
            data: {
              status: "completed",
              stripePaymentIntentId: paymentIntent.id,
              completedAt: new Date(),
            },
          })

          // Update booking status if needed
          await db.booking.update({
            where: { id: bookingId },
            data: {
              status: "confirmed",
              paymentStatus: "paid",
            },
          })

          console.log(`✓ Updated booking ${bookingId} to paid`)
        }

        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`✗ Payment failed: ${paymentIntent.id}`)

        const { bookingId } = paymentIntent.metadata || {}

        if (bookingId) {
          await db.payment.update({
            where: { stripePaymentIntentId: paymentIntent.id },
            data: {
              status: "failed",
              failureReason: paymentIntent.last_payment_error?.message,
            },
          })
        }

        break
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge
        console.log(`↩️ Charge refunded: ${charge.id}`)

        if (charge.payment_intent) {
          await db.payment.update({
            where: { stripePaymentIntentId: charge.payment_intent as string },
            data: {
              status: "refunded",
              refundedAt: new Date(),
            },
          })
        }

        break
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("❌ Webhook processing error:", (error as any)?.message)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
