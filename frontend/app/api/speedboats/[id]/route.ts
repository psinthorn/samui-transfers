import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiError } from '@/app/api/utils/api-response';
import { validateId } from '@/app/api/utils/validation';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * GET /api/speedboats/[id]
 * Get a specific speedboat with all details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const resolvedId = validateId(id);

    const speedboat = await prisma.speedboat.findUnique({
      where: { id: resolvedId },
      include: {
        speedboatRates: true,
        speedboatBookings: {
          include: {
            captain: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        captainAssignments: {
          include: { captain: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!speedboat) {
      throw new ApiError(404, 'Speedboat not found');
    }

    return successResponse(speedboat, 'Speedboat retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/speedboats/[id]
 * Update a speedboat
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const resolvedId = validateId(id);
    const body = await req.json();

    // Check if speedboat exists
    const existing = await prisma.speedboat.findUnique({
      where: { id: resolvedId },
    });

    if (!existing) {
      throw new ApiError(404, 'Speedboat not found');
    }

    // Prepare update data (only allow certain fields to be updated)
    const updateData: any = {};
    const allowedFields = [
      'name',
      'boatType',
      'capacity',
      'crewSize',
      'length',
      'color',
      'registrationNumber',
      'currentLocation',
      'status',
      'maintenanceNotes',
      'manufacturerYear',
      'lastMaintenanceDate',
      'nextMaintenanceDate',
      'safetyInspectionDate',
      'safetyInspectionValid',
      'insuranceExpiry',
      'fuelConsumption',
    ];

    for (const field of allowedFields) {
      if (field in body) {
        if (field === 'fuelConsumption' && body[field]) {
          updateData[field] = new Decimal(body[field]);
        } else if (field === 'safetyInspectionValid') {
          updateData[field] = Boolean(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

      const updated = await prisma.speedboat.update({
        where: { id: resolvedId },
        data: updateData,
        include: {
          speedboatRates: true,
          speedboatBookings: { take: 5 },
        },
      });    return successResponse(updated, 'Speedboat updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/speedboats/[id]
 * Delete a speedboat (soft delete - mark as INACTIVE)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const resolvedId = validateId(id);

    const speedboat = await prisma.speedboat.findUnique({
      where: { id: resolvedId },
    });

    if (!speedboat) {
      throw new ApiError(404, 'Speedboat not found');
    }

    // Check if boat has active bookings
    const activeBookings = await prisma.speedboatBooking.count({
      where: {
        speedboatId: resolvedId,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      },
    });

    if (activeBookings > 0) {
      throw new ApiError(
        409,
        `Cannot delete speedboat with ${activeBookings} active booking(s)`
      );
    }

    // Soft delete by marking as INACTIVE
    const updated = await prisma.speedboat.update({
      where: { id: resolvedId },
      data: { status: 'INACTIVE' },
      include: { speedboatRates: true },
    });

    return successResponse(updated, 'Speedboat deactivated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
