import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { generateBookingReference } from '@/lib/booking'
import nodemailer from 'nodemailer'

/**
 * POST /api/bookings/[id]/confirm
 * Confirms a booking after successful payment
 * - Generates unique reference number
 * - Updates booking status to CONFIRMED
 * - Sends confirmation email
 * - Logs confirmation timestamp
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

    // Check if already confirmed
    if (booking.status === 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Booking already confirmed' },
        { status: 400 }
      )
    }

    // Check payment status
    if (booking.paymentStatus !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Generate reference number if not already generated
    let referenceNumber = booking.referenceNumber
    if (!referenceNumber) {
      referenceNumber = await generateBookingReference()
    }

    // Update booking
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        referenceNumber,
        confirmationSentAt: new Date(),
      },
      include: {
        user: true,
        payments: true,
      },
    })

    // Prepare email data
    const bookingDetails = updatedBooking.details as any
    const payment = updatedBooking.payments[0]

    // TODO: Send confirmation email using Resend or email service
    // For now, we'll just log it
    console.log('Booking confirmed - send email to:', updatedBooking.user.email, {
      referenceNumber,
      bookingDate: updatedBooking.createdAt.toLocaleDateString(),
      pickupLocation: bookingDetails?.pickupLocation || 'N/A',
      dropoffLocation: bookingDetails?.dropoffLocation || 'N/A',
      pickupTime: bookingDetails?.pickupTime || 'N/A',
      vehicleType: bookingDetails?.vehicleType || 'N/A',
      amount: payment?.amount?.toString() || 'N/A',
      currency: payment?.currency || 'THB',
      paymentMethod: payment?.method || 'N/A',
    })

    return NextResponse.json(
      {
        success: true,
        booking: {
          id: updatedBooking.id,
          referenceNumber: updatedBooking.referenceNumber,
          status: updatedBooking.status,
          confirmationSentAt: updatedBooking.confirmationSentAt,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Booking confirmation error:', error)
    return NextResponse.json(
      { error: 'Failed to confirm booking' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/bookings/[id]/confirm
 * Retrieves booking confirmation details
 */
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const booking = await db.booking.findUnique({
      where: { id: params.id },
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

    return NextResponse.json({ booking }, { status: 200 })
  } catch (error) {
    console.error('Error fetching booking confirmation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}
