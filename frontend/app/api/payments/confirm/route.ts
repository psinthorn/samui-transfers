/**
 * Payment Confirmation Endpoint
 * GET/POST /api/payments/confirm
 * 
 * Confirms a payment intent and updates booking status
 */

import { NextRequest, NextResponse } from 'next/server';
import { confirmPayment } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, bookingId } = await request.json();

    if (!paymentIntentId || !bookingId) {
      return NextResponse.json(
        { error: 'Missing required fields: paymentIntentId, bookingId' },
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

    // Confirm payment with Stripe
    const paymentResult = await confirmPayment(paymentIntentId);

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error },
        { status: 500 }
      );
    }

    const { status, paymentIntent } = paymentResult;

    // Update booking status based on payment status
    let bookingStatus = 'PENDING';
    if (status === 'succeeded') {
      bookingStatus = 'COMPLETED';
    } else if (status === 'requires_action') {
      bookingStatus = 'PENDING';
    } else if (status === 'canceled') {
      bookingStatus = 'FAILED';
    }

    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: bookingStatus,
        paymentDate: status === 'succeeded' ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      status,
      paymentIntent,
      bookingStatus: updatedBooking.status,
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentIntentId = searchParams.get('paymentIntentId');
    const bookingId = searchParams.get('bookingId');

    if (!paymentIntentId || !bookingId) {
      return NextResponse.json(
        { error: 'Missing required query parameters: paymentIntentId, bookingId' },
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

    // Get payment status from Stripe
    const paymentResult = await confirmPayment(paymentIntentId);

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: paymentResult.status,
      paymentIntent: paymentResult.paymentIntent,
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
