import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/app/api/utils/api-response'

/**
 * Get bundle booking details with all child services
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const bundle = await prisma.booking.findFirst({
      where: {
        id,
        isBundle: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        speedboatBooking: {
          include: {
            speedboat: {
              select: {
                id: true,
                name: true,
                capacity: true,
              },
            },
          },
        },
        tourBooking: {
          include: {
            tourPackage: {
              select: {
                id: true,
                name: true,
                minGroupSize: true,
                maxGroupSize: true,
              },
            },
          },
        },
        eventBooking: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        childBookings: {
          select: {
            id: true,
            serviceType: true,
            status: true,
            paymentStatus: true,
            paymentAmount: true,
            createdAt: true,
          },
        },
      },
    })

    if (!bundle) {
      return errorResponse('Bundle booking not found', 404)
    }

    return successResponse(bundle, 'Bundle booking retrieved successfully')
  } catch (error) {
    console.error('Error fetching bundle booking:', error)
    return errorResponse('Failed to retrieve bundle booking', 500)
  }
}

/**
 * Update bundle booking (pricing, discount, status)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    // Verify bundle exists
    const existingBundle = await prisma.booking.findFirst({
      where: {
        id,
        isBundle: true,
      },
    })

    if (!existingBundle) {
      return errorResponse('Bundle booking not found', 404)
    }

    // Prepare update data
    const updateData: any = {}

    if (body.status !== undefined) updateData.status = body.status
    if (body.paymentStatus !== undefined)
      updateData.paymentStatus = body.paymentStatus

    // If discount is being updated, recalculate totals
    if (body.bundleDiscount !== undefined || body.paymentAmount !== undefined) {
      const currentDetails = existingBundle.details as any

      if (body.bundleDiscount !== undefined) {
        const subtotal = currentDetails?.subtotal || 0
        const discountAmount = subtotal * (body.bundleDiscount / 100)
        const finalAmount = subtotal - discountAmount

        updateData.details = {
          ...currentDetails,
          bundleDiscount: body.bundleDiscount,
          discountAmount,
          total: finalAmount,
        }
        updateData.paymentAmount = finalAmount
      }

      if (body.paymentAmount !== undefined) {
        updateData.paymentAmount = body.paymentAmount
        updateData.details = {
          ...currentDetails,
          total: body.paymentAmount,
        }
      }
    }

    if (body.details !== undefined) {
      updateData.details = {
        ...(existingBundle.details as any),
        ...body.details,
      }
    }

    // Update bundle
    const updated = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        childBookings: {
          select: {
            id: true,
            serviceType: true,
            status: true,
            paymentStatus: true,
            paymentAmount: true,
          },
        },
      },
    })

    return successResponse(updated, 'Bundle booking updated successfully')
  } catch (error) {
    console.error('Error updating bundle booking:', error)
    return errorResponse('Failed to update bundle booking', 500)
  }
}

/**
 * Cancel bundle booking (soft delete all child bookings)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { cancellationReason = 'User requested cancellation' } = body

    // Verify bundle exists
    const bundle = await prisma.booking.findFirst({
      where: {
        id,
        isBundle: true,
      },
      include: {
        childBookings: true,
      },
    })

    if (!bundle) {
      return errorResponse('Bundle booking not found', 404)
    }

    const now = new Date()

    // Update parent booking
    const cancelled = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason,
        cancellationDate: now,
        cancellationRequestedAt: now,
      },
    })

    // Cancel all child bookings
    if (bundle.childBookings && bundle.childBookings.length > 0) {
      await prisma.booking.updateMany({
        where: {
          parentBookingId: id,
        },
        data: {
          status: 'CANCELLED',
          cancellationReason: `Parent bundle cancelled: ${cancellationReason}`,
          cancellationDate: now,
        },
      })

      // Also update the specific booking types
      for (const childBooking of bundle.childBookings) {
        if (childBooking.serviceType === 'BOAT') {
          await prisma.speedboatBooking.updateMany({
            where: { bookingId: childBooking.id },
            data: { status: 'CANCELLED' },
          })
        } else if (childBooking.serviceType === 'TOUR') {
          await prisma.tourBooking.updateMany({
            where: { bookingId: childBooking.id },
            data: { status: 'CANCELLED' },
          })
        } else if (childBooking.serviceType === 'EVENT') {
          await prisma.eventBooking.updateMany({
            where: { bookingId: childBooking.id },
            data: { status: 'CANCELLED' },
          })
        }
      }
    }

    return successResponse(
      { id, status: 'CANCELLED' },
      'Bundle booking cancelled successfully'
    )
  } catch (error) {
    console.error('Error cancelling bundle booking:', error)
    return errorResponse('Failed to cancel bundle booking', 500)
  }
}
