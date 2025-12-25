import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiError } from '@/app/api/utils/api-response';
import { validateId } from '@/app/api/utils/validation';

/**
 * PATCH /api/event-bookings/[id]
 * Update event booking status or details
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validatedId = validateId(id);
    const body = await req.json();

    const existing = await prisma.eventBooking.findUnique({
      where: { id: validatedId },
    });

    if (!existing) {
      throw new ApiError(404, 'Booking not found');
    }

    const updateData: any = {};
    const allowedFields = [
      'status',
      'tableNumber',
      'specialRequests',
      'checkInTime',
      'cancellationReason',
      'rating',
      'review',
    ];

    for (const field of allowedFields) {
      if (field in body) {
        if (field === 'checkInTime') {
          updateData[field] = body[field] ? new Date(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    }

    if ('guestNames' in body) {
      updateData.guestNames = JSON.stringify(body.guestNames);
    }

    const updated = await prisma.eventBooking.update({
      where: { id: validatedId },
      data: updateData,
      include: {
        booking: true,
        event: true,
      },
    });

    return successResponse(updated, 'Booking updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
