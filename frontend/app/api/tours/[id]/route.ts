import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiError } from '@/app/api/utils/api-response';
import { validateId } from '@/app/api/utils/validation';

/**
 * GET /api/tours/[id]
 * Get a specific tour package with all details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validatedId = validateId(id);

    const tour = await prisma.tourPackage.findUnique({
      where: { id: validatedId },
      include: {
        locations: {
          orderBy: { sequenceNumber: 'asc' },
        },
        tourRates: true,
        schedules: {
          include: {
            guide: true,
            bookings: { take: 5 },
          },
          orderBy: { tourDate: 'desc' },
        },
      },
    });

    if (!tour) {
      throw new ApiError(404, 'Tour package not found');
    }

    return successResponse(tour, 'Tour package retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/tours/[id]
 * Update a tour package
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validatedId = validateId(id);
    const body = await req.json();

    const existing = await prisma.tourPackage.findUnique({
      where: { id: validatedId },
    });

    if (!existing) {
      throw new ApiError(404, 'Tour package not found');
    }

    const updateData: any = {};
    const allowedFields = [
      'name',
      'description',
      'duration',
      'maxCapacity',
      'difficulty',
      'isActive',
      'highlights',
      'meetingPoint',
      'notes',
    ];

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Handle gallery array
    if ('gallery' in body) {
      updateData.gallery = JSON.stringify(body.gallery);
    }

    // Handle excluded services array
    if ('excludedServices' in body) {
      updateData.excludedServices = JSON.stringify(body.excludedServices);
    }

    const updated = await prisma.tourPackage.update({
      where: { id: validatedId },
      data: updateData,
      include: {
        locations: { orderBy: { sequenceNumber: 'asc' } },
        tourRates: true,
        schedules: { take: 5 },
      },
    });

    return successResponse(updated, 'Tour package updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/tours/[id]
 * Soft delete a tour package
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validatedId = validateId(id);

    const tour = await prisma.tourPackage.findUnique({
      where: { id: validatedId },
    });

    if (!tour) {
      throw new ApiError(404, 'Tour package not found');
    }

    // Check for active bookings
    const activeBookings = await prisma.tourBooking.count({
      where: {
        tourSchedule: {
          tourPackageId: validatedId,
        },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (activeBookings > 0) {
      throw new ApiError(
        409,
        `Cannot delete tour with ${activeBookings} active booking(s)`
      );
    }

    const updated = await prisma.tourPackage.update({
      where: { id: validatedId },
      data: { isActive: false },
      include: { locations: true, tourRates: true },
    });

    return successResponse(updated, 'Tour package deactivated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
