import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiError } from '@/app/api/utils/api-response';
import { requireFields, validatePagination } from '@/app/api/utils/validation';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * GET /api/events
 * List all special events with filters
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const theme = searchParams.get('theme');
    const venueType = searchParams.get('venueType');
    const isActive = searchParams.get('isActive');

    const { page: pageNum, limit: limitNum } = validatePagination(page, limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (theme) where.theme = theme;
    if (venueType) where.venueType = venueType;
    if (isActive !== null) where.isActive = isActive === 'true';

    const [total, events] = await Promise.all([
      prisma.specialEvent.count({ where }),
      prisma.specialEvent.findMany({
        where,
        include: {
          eventRates: true,
          eventBookings: { take: 5 },
        },
        skip,
        take: limitNum,
        orderBy: { startDate: 'desc' },
      }),
    ]);

    return successResponse(
      {
        data: events,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      'Events retrieved successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/events
 * Create a new special event
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    requireFields(body, [
      'name',
      'slug',
      'venueType',
      'venueLocation',
      'startDate',
      'endDate',
      'maxCapacity',
      'registrationFee',
    ]);

    const {
      name,
      slug,
      description,
      summary,
      theme,
      venueType,
      venueLocation,
      startDate,
      endDate,
      maxCapacity,
      registrationFee,
      isRecurring = false,
      recurringPattern,
      includedItems = [],
      entertainmentType = [],
      performerDetails,
      mealOption,
      barOption,
      imageUrl,
      gallery = [],
    } = body;

    // Check if slug already exists
    const existingSlug = await prisma.specialEvent.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      throw new ApiError(409, 'Event slug already exists');
    }

    const event = await prisma.specialEvent.create({
      data: {
        name,
        slug,
        description,
        summary,
        theme,
        venueType,
        venueLocation,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        maxCapacity,
        registrationFee: new Decimal(registrationFee),
        isRecurring,
        recurringPattern,
        includedItems,
        entertainmentType: JSON.stringify(entertainmentType),
        performerDetails,
        mealOption,
        barOption,
        imageUrl,
        gallery: JSON.stringify(gallery),
      },
      include: { eventRates: true },
    });

    return successResponse(event, 'Event created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
