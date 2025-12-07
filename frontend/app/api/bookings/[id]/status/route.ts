import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

/**
 * GET /api/bookings/[id]/status
 * Returns booking status timeline
 * 
 * Returns the current booking status and a timeline of all status changes
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
        user: {
          select: {
            id: true,
            email: true,
          },
        },
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

    // Build timeline based on booking status and timestamps
    const steps = [
      {
        step: 1,
        title: 'Booking Created',
        description: 'Your booking request has been created',
        completed: true,
        timestamp: booking.createdAt,
      },
      {
        step: 2,
        title: 'Payment Processing',
        description: 'Processing your payment',
        completed: booking.paymentStatus === 'COMPLETED',
        timestamp: booking.paymentDate,
      },
      {
        step: 3,
        title: 'Confirmed',
        description: 'Booking confirmed and reference number generated',
        completed: booking.status === 'CONFIRMED' || booking.status === 'COMPLETED',
        timestamp: booking.confirmationSentAt,
      },
      {
        step: 4,
        title: 'On the Way',
        description: 'Driver heading to pickup location',
        completed: booking.status === 'COMPLETED',
        timestamp: booking.status === 'COMPLETED' ? booking.updatedAt : undefined,
      },
      {
        step: 5,
        title: 'Completed',
        description: 'Your ride has been completed',
        completed: booking.status === 'COMPLETED',
        timestamp: booking.status === 'COMPLETED' ? booking.updatedAt : undefined,
      },
    ]

    // Filter out cancelled status
    const displaySteps = steps.filter((step) => {
      if (booking.status === 'CANCELLED') {
        return step.step <= 3
      }
      return true
    })

    // Determine current step
    let currentStep = 1
    if (booking.paymentStatus === 'COMPLETED') currentStep = 2
    if (booking.status === 'CONFIRMED') currentStep = 3
    if (booking.status === 'COMPLETED') currentStep = 5

    // Calculate estimated completion time (example: 1 hour from confirmation)
    let estimatedCompletionTime: Date | undefined
    if (booking.status === 'CONFIRMED' && booking.confirmationSentAt) {
      estimatedCompletionTime = new Date(booking.confirmationSentAt)
      estimatedCompletionTime.setHours(estimatedCompletionTime.getHours() + 1)
    }

    return NextResponse.json(
      {
        id: booking.id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        currentStep,
        steps: displaySteps,
        estimatedCompletionTime,
        lastUpdate: booking.updatedAt,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching booking status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking status' },
      { status: 500 }
    )
  }
}
