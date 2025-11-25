/**
 * Payment Intent Creation Endpoint
 * POST /api/payments/create-intent
 * 
 * Creates a Stripe Payment Intent for a booking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, amount, customerEmail } = await request.json();

    // Validate input
    if (!bookingId || !amount || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId, amount, customerEmail' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Verify booking exists
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { error: `Booking not found: ${bookingId}` },
        { status: 404 }
      );
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Booking already has a completed payment' },
        { status: 400 }
      );
    }

    // Convert amount to cents (Stripe works in smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Create payment intent
    const result = await createPaymentIntent({
      bookingId,
      amount: amountInCents,
      customerEmail,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // Update booking with payment intent ID and status
    await db.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'PENDING',
        paymentId: result.paymentIntentId,
        paymentAmount: amount,
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
