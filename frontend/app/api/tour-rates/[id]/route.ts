import { NextRequest } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiError } from '@/app/api/utils/api-response';
import { validateId } from '@/app/api/utils/validation';

/**
 * GET /api/tour-rates/[id]
 * Retrieve a specific tour rate by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validatedId = validateId(id);

    const rate = await prisma.tourRate.findUnique({
      where: { id: validatedId },
      include: { tourPackage: true },
    });

    if (!rate) {
      throw new ApiError(404, 'Tour rate not found');
    }

    return successResponse(rate, 'Tour rate retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/tour-rates/[id]
 * Update a rate
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validatedId = validateId(id);
    const body = await req.json();

    const existing = await prisma.tourRate.findUnique({
      where: { id: validatedId },
    });

    if (!existing) {
      throw new ApiError(404, 'Rate not found');
    }

    const updateData: any = {};
    const priceFields = ['pricePerPerson', 'minimumGroupPrice', 'seasonMultiplier'];
    const otherFields = ['minGroupSize', 'maxGroupSize', 'isSeasonalRate', 'seasonStart', 'seasonEnd'];

    for (const field of [...otherFields, ...priceFields]) {
      if (field in body) {
        if (priceFields.includes(field) && body[field] !== undefined && body[field] !== null) {
          updateData[field] = new Decimal(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const updated = await prisma.tourRate.update({
      where: { id: validatedId },
      data: updateData,
      include: { tourPackage: true },
    });

    return successResponse(updated, 'Rate updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/tour-rates/[id]
 * Soft delete a tour rate
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validatedId = validateId(id);

    const existing = await prisma.tourRate.findUnique({
      where: { id: validatedId },
    });

    if (!existing) {
      throw new ApiError(404, 'Rate not found');
    }

    // Soft delete: mark as inactive by setting a past validUntil date
    const deleted = await prisma.tourRate.update({
      where: { id: validatedId },
      data: {
        validUntil: new Date(),
      },
      include: { tourPackage: true },
    });

    return successResponse(deleted, 'Tour rate deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
