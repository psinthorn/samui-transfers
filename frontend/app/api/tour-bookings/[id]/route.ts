import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiError } from '@/app/api/utils/api-response';
import { validateId } from '@/app/api/utils/validation';

/**
 * PATCH /api/tour-bookings/[id]
 * Update booking details or add-ons
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validatedId = validateId(id);
    const body = await req.json();

    const existing = await prisma.tourBooking.findUnique({
      where: { id: validatedId },
    });

    if (!existing) {
      throw new ApiError(404, 'Booking not found');
    }

    const updateData: any = {};
    const allowedFields = [
      'specialRequests',
      'pickupLocation',
      'guideId',
    ];

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    if ('addOnServices' in body) {
      updateData.addOnServices = JSON.stringify(body.addOnServices);
    }

    const updated = await prisma.tourBooking.update({
      where: { id: validatedId },
      data: updateData,
      include: {
        booking: true,
        tourPackage: true,
        tourSchedule: true,
        guide: true,
      },
    });

    return successResponse(updated, 'Booking updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
