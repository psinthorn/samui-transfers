import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiError } from '@/app/api/utils/api-response';
import { requireFields, validateId, validatePagination } from '@/app/api/utils/validation';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * GET /api/speedboat-bookings
 * List speedboat bookings with filters
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const speedboatId = searchParams.get('speedboatId');
    const status = searchParams.get('status');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    const { page: pageNum, limit: limitNum } = validatePagination(page, limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (speedboatId) where.speedboatId = speedboatId;
    if (status) where.status = status;

    const [total, bookings] = await Promise.all([
      prisma.speedboatBooking.count({ where }),
      prisma.speedboatBooking.findMany({
        where,
        include: {
          speedboat: true,
          captain: true,
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return successResponse(
      {
        data: bookings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      'Speedboat bookings retrieved'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/speedboat-bookings
 * Create a new speedboat booking
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    requireFields(body, ['bookingId', 'speedboatId', 'departureTime', 'passengerCount', 'tripType']);

    const {
      bookingId,
      speedboatId,
      departureTime,
      returnTime,
      passengerCount,
      tripType,
      departurePort,
      returnPort,
      captainId,
      mealIncluded = false,
      specialRequests,
      notes,
    } = body;

    // Validate speedboat exists
    const speedboat = await prisma.speedboat.findUnique({
      where: { id: speedboatId },
    });

    if (!speedboat) {
      throw new ApiError(404, 'Speedboat not found');
    }

    // Check capacity
    if (passengerCount > speedboat.capacity) {
      throw new ApiError(
        400,
        `Number of passengers (${passengerCount}) exceeds boat capacity (${speedboat.capacity})`
      );
    }

    // Validate captain if provided
    if (captainId) {
      const captain = await prisma.driver.findUnique({
        where: { id: captainId },
      });

      if (!captain || !captain.isBoatOperator) {
        throw new ApiError(404, 'Captain not found or not qualified');
      }
    }

    const booking = await prisma.speedboatBooking.create({
      data: {
        bookingId,
        speedboatId,
        departureTime: new Date(departureTime),
        returnTime: new Date(returnTime),
        passengerCount,
        tripType,
        departurePort,
        returnPort,
        status: 'PENDING',
        mealIncluded,
        specialRequests,
        captainId,
      },
      include: {
        speedboat: true,
        captain: true,
      },
    });

    return successResponse(booking, 'Speedboat booking created', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
