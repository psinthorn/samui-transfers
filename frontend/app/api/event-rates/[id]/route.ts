import { NextRequest } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiError } from '@/app/api/utils/api-response';
import { validateId } from '@/app/api/utils/validation';

/**
 * GET /api/event-rates/[id]
 * Retrieve a specific event rate by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validatedId = validateId(id);

    const rate = await prisma.eventRate.findUnique({
      where: { id: validatedId },
      include: { event: true },
    });

    if (!rate) {
      throw new ApiError(404, 'Event rate not found');
    }

    return successResponse(rate, 'Event rate retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/event-rates/[id]
 * Update event rate
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validatedId = validateId(id);
    const body = await req.json();

    const existing = await prisma.eventRate.findUnique({
      where: { id: validatedId },
    });

    if (!existing) {
      throw new ApiError(404, 'Rate not found');
    }

    const updateData: any = {};
    const priceFields = ['pricePerPerson'];
    const otherFields = ['tierName', 'description', 'validFrom', 'validUntil', 'minimumPartySize', 'isActive'];

    for (const field of otherFields) {
      if (field in body) {
        if (['validFrom', 'validUntil'].includes(field)) {
          updateData[field] = new Date(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    for (const field of priceFields) {
      if (field in body && body[field] !== undefined) {
        updateData[field] = new Decimal(body[field]);
      }
    }

    const updated = await prisma.eventRate.update({
      where: { id: validatedId },
      data: updateData,
      include: { event: true },
    });

    return successResponse(updated, 'Rate updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/event-rates/[id]
 * Soft delete an event rate
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validatedId = validateId(id);

    const existing = await prisma.eventRate.findUnique({
      where: { id: validatedId },
    });

    if (!existing) {
      throw new ApiError(404, 'Rate not found');
    }

    // Soft delete: mark as inactive or set validUntil to today
    const deleted = await prisma.eventRate.update({
      where: { id: validatedId },
      data: {
        isActive: false,
        validUntil: new Date(),
      },
      include: { event: true },
    });

    return successResponse(deleted, 'Event rate deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
