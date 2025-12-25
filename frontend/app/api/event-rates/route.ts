import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiError, errorResponse } from '@/app/api/utils/api-response';
import { requireFields, validatePrice, validateId } from '@/app/api/utils/validation';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * GET /api/event-rates
 * Get rates for events
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');

    const where: any = {};
    if (eventId) where.eventId = eventId;

    const rates = await prisma.eventRate.findMany({
      where,
      include: {
        event: true,
      },
      orderBy: { tierName: 'asc' },
    });

    return successResponse(rates, 'Event rates retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/event-rates
 * Create a new tier pricing for an event
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    requireFields(body, ['eventId', 'tierName', 'validFrom', 'validUntil', 'pricePerPerson']);

    const {
      eventId,
      tierName,
      description,
      validFrom,
      validUntil,
      pricePerPerson,
      minimumPartySize = 1,
      isActive = true,
    } = body;

    // Validate event exists
    const event = await prisma.specialEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new ApiError(404, 'Event not found');
    }

    // Validate dates
    const fromDate = new Date(validFrom);
    const untilDate = new Date(validUntil);

    if (fromDate >= untilDate) {
      throw new ApiError(400, 'Valid from date must be before valid until date');
    }

    const price = validatePrice(pricePerPerson, 'Price per person');

    const rate = await prisma.eventRate.create({
      data: {
        eventId,
        tierName,
        description,
        validFrom: fromDate,
        validUntil: untilDate,
        pricePerPerson: new Decimal(price),
        minimumPartySize,
        isActive,
      },
      include: { event: true },
    });

    return successResponse(rate, 'Event rate created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/event-rates
 * Bulk update event rates (future enhancement)
 * Currently, update individual rates at /api/event-rates/[id]
 */
export async function PUT(req: NextRequest) {
  try {
    return errorResponse('Use PUT /api/event-rates/[id] to update individual rates', 400);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/event-rates
 * Bulk delete event rates (future enhancement)
 * Currently, delete individual rates at /api/event-rates/[id]
 */
export async function DELETE(req: NextRequest) {
  try {
    return errorResponse('Use DELETE /api/event-rates/[id] to delete individual rates', 400);
  } catch (error) {
    return handleApiError(error);
  }
}
