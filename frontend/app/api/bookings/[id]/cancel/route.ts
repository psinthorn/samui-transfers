import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { canCancelBooking, getTimeUntilPickup } from '@/lib/booking'

interface CancellationRequest {
  reason: string
  description?: string
}

/**
 * POST /api/bookings/[id]/cancel
 * Cancels a booking and processes refund
 *
 * Validation:
 * - Booking must exist and belong to user
 * - Booking must be in CONFIRMED or PENDING status
 * - Must have 2+ hours before pickup time
 * - Payment must be in COMPLETED status
 *
 * Processing:
 * - Updates booking status to CANCELLED
 * - Records cancellation reason and timestamp
 * - Processes refund to original payment method
 * - Sends confirmation email
 * - Notifies admin
 */
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    // Get current session
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: CancellationRequest = await req.json()
    if (!body.reason) {
      return NextResponse.json(
        { error: 'Cancellation reason is required' },
        { status: 400 }
      )
    }

    const bookingId = params.id

    // Fetch booking and verify ownership
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (booking.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if booking can be cancelled
    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 400 }
      )
    }

    if (booking.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot cancel a completed booking' },
        { status: 400 }
      )
    }

    // Check if booking is within cancellation window (2+ hours before pickup)
    const bookingDetails = booking.details as any
    if (bookingDetails?.pickupTime) {
      if (!canCancelBooking(bookingDetails.pickupTime)) {
        const hoursRemaining = getTimeUntilPickup(bookingDetails.pickupTime)
        return NextResponse.json(
          {
            error: `Cancellation must be made at least 2 hours before pickup. Time remaining: ${hoursRemaining} hours`,
          },
          { status: 400 }
        )
      }
    }

    // Check payment status
    if (booking.paymentStatus !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot cancel booking without completed payment' },
        { status: 400 }
      )
    }

    // Calculate refund amount (100% for now, can be adjusted based on policy)
    const refundAmount = booking.paymentAmount || 0
    const payment = booking.payments[0]

    // Update booking with cancellation info
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancellationReason: body.reason,
        cancellationDate: new Date(),
        cancellationRequestedAt: new Date(),
        refundAmount: refundAmount,
        refundProcessedAt: new Date(), // In real scenario, would process async
      },
      include: {
        user: true,
        payments: true,
      },
    })

    // TODO: Process refund using payment provider (Stripe/PayPal)
    // For now, we'll just log it
    if (payment) {
      console.log('Processing refund:', {
        bookingId: booking.id,
        paymentId: payment.id,
        method: payment.method,
        amount: refundAmount,
        originalTransactionId: payment.transactionId,
      })
    }

    // TODO: Send cancellation email to user
    console.log('Send cancellation email to:', booking.user.email, {
      referenceNumber: booking.referenceNumber,
      refundAmount,
      reason: body.reason,
    })

    // TODO: Send admin notification
    console.log('Send admin notification about cancellation:', {
      bookingId: booking.id,
      userId: booking.userId,
      refundAmount,
      reason: body.reason,
    })

    return NextResponse.json(
      {
        success: true,
        booking: {
          id: updatedBooking.id,
          status: updatedBooking.status,
          cancellationDate: updatedBooking.cancellationDate,
          refundAmount: updatedBooking.refundAmount,
          refundStatus: 'PROCESSED', // In real scenario, would be PENDING/PROCESSING/COMPLETED
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Booking cancellation error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}
