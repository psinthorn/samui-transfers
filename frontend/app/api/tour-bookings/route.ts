import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiError } from '@/app/api/utils/api-response';
import { requireFields, validateId, validatePagination } from '@/app/api/utils/validation';

/**
 * GET /api/tour-bookings
 * List tour bookings with filters
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const tourPackageId = searchParams.get('tourPackageId');
    const tourScheduleId = searchParams.get('tourScheduleId');
    const status = searchParams.get('status');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    const { page: pageNum, limit: limitNum } = validatePagination(page, limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (tourPackageId) where.tourPackageId = tourPackageId;
    if (tourScheduleId) where.tourScheduleId = tourScheduleId;
    if (status) where.booking = { status };

    const [total, bookings] = await Promise.all([
      prisma.tourBooking.count({ where }),
      prisma.tourBooking.findMany({
        where,
        include: {
          booking: true,
          tourPackage: true,
          tourSchedule: {
            include: { guide: true },
          },
          guide: true,
        },
        skip,
        take: limitNum,
        orderBy: { booking: { createdAt: 'desc' } },
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
      'Tour bookings retrieved'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/tour-bookings
 * Create a new tour booking
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    requireFields(body, ['tourScheduleId', 'totalParticipants', 'bookingId']);

    const {
      bookingId,
      tourScheduleId,
      totalParticipants,
      childrenCount = 0,
      adultsCount = 0,
      specialRequests,
      pickupLocation,
      guideId,
      addOnServices = [],
    } = body;

    // Validate tour schedule exists and has availability
    const schedule = await prisma.tourSchedule.findUnique({
      where: { id: tourScheduleId },
      include: { tourPackage: true },
    });

    if (!schedule) {
      throw new ApiError(404, 'Tour schedule not found');
    }

    if (!schedule.isOpen) {
      throw new ApiError(409, 'Tour schedule is no longer open for booking');
    }

    // Check capacity
    const bookedSeats = await prisma.tourBooking.aggregate({
      where: { tourScheduleId },
      _sum: { totalParticipants: true },
    });

    const totalBooked = (bookedSeats._sum.totalParticipants || 0) + totalParticipants;
    if (totalBooked > schedule.maxCapacity) {
      throw new ApiError(
        409,
        `Not enough seats available. Requested: ${totalParticipants}, Available: ${schedule.maxCapacity - (bookedSeats._sum.totalParticipants || 0)}`
      );
    }

    // Validate guide if provided
    if (guideId) {
      const guide = await prisma.driver.findUnique({
        where: { id: guideId },
      });

      if (!guide || !guide.isTourGuide) {
        throw new ApiError(404, 'Tour guide not found or not qualified');
      }
    }

    const booking = await prisma.tourBooking.create({
      data: {
        bookingId,
        tourScheduleId,
        tourPackageId: schedule.tourPackageId,
        totalParticipants,
        childrenCount,
        adultsCount,
        specialRequests,
        pickupLocation,
        guideId,
        addOnServices: JSON.stringify(addOnServices),
      },
      include: {
        booking: true,
        tourPackage: true,
        tourSchedule: true,
        guide: true,
      },
    });

    return successResponse(booking, 'Tour booking created', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
