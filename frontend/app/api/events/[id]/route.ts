import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiError } from '@/app/api/utils/api-response';
import { validateId } from '@/app/api/utils/validation';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * GET /api/events/[id]
 * Get event details by ID or slug
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try to find by ID first, then by slug
    let event = await prisma.specialEvent.findUnique({
      where: { id },
    });

    if (!event) {
      event = await prisma.specialEvent.findUnique({
        where: { slug: id },
      });
    }

    if (!event) {
      throw new ApiError(404, 'Event not found');
    }

    // Get related data
    const [rates, bookings] = await Promise.all([
      prisma.eventRate.findMany({
        where: { eventId: event.id },
        orderBy: { tierName: 'asc' },
      }),
      prisma.eventBooking.findMany({
        where: { eventId: event.id },
        include: { booking: true },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return successResponse(
      {
        ...event,
        rates,
        bookings,
      },
      'Event retrieved successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/events/[id]
 * Update an event
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validatedId = validateId(id);
    const body = await req.json();

    const existing = await prisma.specialEvent.findUnique({
      where: { id: validatedId },
    });

    if (!existing) {
      throw new ApiError(404, 'Event not found');
    }

    const updateData: any = {};
    const allowedFields = [
      'name',
      'description',
      'summary',
      'theme',
      'venueType',
      'venueLocation',
      'startDate',
      'endDate',
      'maxCapacity',
      'registrationFee',
      'isRecurring',
      'recurringPattern',
      'performerDetails',
      'mealOption',
      'barOption',
      'imageUrl',
      'isPublished',
      'isActive',
    ];

    for (const field of allowedFields) {
      if (field in body) {
        if (field === 'registrationFee') {
          updateData[field] = new Decimal(body[field]);
        } else if (['startDate', 'endDate'].includes(field)) {
          updateData[field] = new Date(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // Handle array fields
    if ('includedItems' in body) {
      updateData.includedItems = body.includedItems;
    }

    if ('entertainmentType' in body) {
      updateData.entertainmentType = JSON.stringify(body.entertainmentType);
    }

    if ('gallery' in body) {
      updateData.gallery = JSON.stringify(body.gallery);
    }

    const updated = await prisma.specialEvent.update({
      where: { id: validatedId },
      data: updateData,
      include: { eventRates: true },
    });

    return successResponse(updated, 'Event updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/events/[id]
 * Soft delete an event
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validatedId = validateId(id);

    const event = await prisma.specialEvent.findUnique({
      where: { id: validatedId },
    });

    if (!event) {
      throw new ApiError(404, 'Event not found');
    }

    // Check for active bookings
    const activeBookings = await prisma.eventBooking.count({
      where: {
        eventId: validatedId,
        booking: {
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      },
    });

    if (activeBookings > 0) {
      throw new ApiError(
        409,
        `Cannot delete event with ${activeBookings} active booking(s)`
      );
    }

    const updated = await prisma.specialEvent.update({
      where: { id: validatedId },
      data: { isActive: false },
      include: { eventRates: true },
    });

    return successResponse(updated, 'Event deactivated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
