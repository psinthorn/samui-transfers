/**
 * Payment Status Endpoint
 * GET /api/payments/status/:bookingId
 * 
 * Returns payment status for a booking
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: any
) {
  try {
    const bookingId = params.bookingId;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Missing bookingId' },
        { status: 400 }
      );
    }

    // Get booking with payment details
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { error: `Booking not found: ${bookingId}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      bookingId,
      paymentStatus: booking.paymentStatus,
      paymentAmount: booking.paymentAmount,
      paymentMethod: booking.paymentMethod,
      paymentDate: booking.paymentDate,
      bookingStatus: booking.status,
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
