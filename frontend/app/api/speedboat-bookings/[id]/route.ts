import { NextRequest } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiError } from '@/app/api/utils/api-response';
import { validateId } from '@/app/api/utils/validation';

/**
 * PATCH /api/speedboat-bookings/[id]
 * Update booking status or details
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validatedId = validateId(id);
    const body = await req.json();

    const existing = await prisma.speedboatBooking.findUnique({
      where: { id: validatedId },
    });

    if (!existing) {
      throw new ApiError(404, 'Booking not found');
    }

    const updateData: any = {};
    const allowedFields = [
      'status',
      'numberOfPassengers',
      'totalPrice',
      'mealsIncluded',
      'specialRequests',
      'notes',
    ];

    for (const field of allowedFields) {
      if (field in body) {
        if (field === 'totalPrice') {
          updateData[field] = new Decimal(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const updated = await prisma.speedboatBooking.update({
      where: { id: validatedId },
      data: updateData,
      include: {
        speedboat: true,
        captain: true,
      },
    });

    return successResponse(updated, 'Booking updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
