import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiError } from '@/app/api/utils/api-response';
import { requireFields, validateId, validatePagination } from '@/app/api/utils/validation';

/**
 * GET /api/event-bookings
 * List event bookings with filters
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    const { page: pageNum, limit: limitNum } = validatePagination(page, limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (eventId) where.eventId = eventId;
    if (status) where.status = status;

    const [total, bookings] = await Promise.all([
      prisma.eventBooking.count({ where }),
      prisma.eventBooking.findMany({
        where,
        include: {
          booking: true,
          event: true,
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
      'Event bookings retrieved'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/event-bookings
 * Create a new event booking
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    requireFields(body, ['bookingId', 'eventId', 'totalGuests', 'tierBooked']);

    const {
      bookingId,
      eventId,
      totalGuests,
      tierBooked,
      guestNames = [],
      tableNumber,
      specialRequests,
    } = body;

    // Validate event exists
    const event = await prisma.specialEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new ApiError(404, 'Event not found');
    }

    // Check capacity
    const currentBookings = await prisma.eventBooking.aggregate({
      where: { eventId },
      _sum: { totalGuests: true },
    });

    const totalBooked = (currentBookings._sum.totalGuests || 0) + totalGuests;
    if (totalBooked > event.maxCapacity) {
      throw new ApiError(
        409,
        `Event capacity exceeded. Requested: ${totalGuests}, Available: ${event.maxCapacity - (currentBookings._sum.totalGuests || 0)}`
      );
    }

    const booking = await prisma.eventBooking.create({
      data: {
        bookingId,
        eventId,
        totalGuests,
        tierBooked,
        guestNames: JSON.stringify(guestNames),
        tableNumber,
        specialRequests,
        status: 'PENDING',
      },
      include: {
        booking: true,
        event: true,
      },
    });

    return successResponse(booking, 'Event booking created', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
