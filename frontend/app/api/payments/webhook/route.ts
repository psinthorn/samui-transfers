/**
 * Stripe Webhook Endpoint
 * POST /api/payments/webhook
 * 
 * Handles Stripe webhook events for payment confirmations
 */

import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const body = await request.text();

    // Verify webhook signature
    let event;
    try {
      event = constructWebhookEvent(body, signature);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Handle payment intent events
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  const bookingId = paymentIntent.metadata?.bookingId;

  if (!bookingId) {
    console.warn('Payment intent succeeded but no bookingId in metadata');
    return;
  }

  // Update booking payment status
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    console.warn(`Booking not found for payment intent: ${bookingId}`);
    return;
  }

  await db.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: 'COMPLETED',
      paymentDate: new Date(),
    },
  });

  console.log(`Payment succeeded for booking: ${bookingId}`);
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  const bookingId = paymentIntent.metadata?.bookingId;

  if (!bookingId) {
    console.warn('Payment intent failed but no bookingId in metadata');
    return;
  }

  // Update booking payment status
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    console.warn(`Booking not found for failed payment intent: ${bookingId}`);
    return;
  }

  await db.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: 'FAILED',
    },
  });

  console.log(`Payment failed for booking: ${bookingId}`);
}

async function handleChargeRefunded(charge: any) {
  const bookingId = charge.metadata?.bookingId;

  if (!bookingId) {
    console.warn('Charge refunded but no bookingId in metadata');
    return;
  }

  // Update booking payment status
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    console.warn(`Booking not found for refunded charge: ${bookingId}`);
    return;
  }

  await db.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: 'REFUNDED',
    },
  });

  console.log(`Charge refunded for booking: ${bookingId}`);
}
