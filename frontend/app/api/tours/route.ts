import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiError } from '@/app/api/utils/api-response';
import { requireFields, validatePagination, validatePrice } from '@/app/api/utils/validation';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * GET /api/tours
 * List all tour packages with filters and pagination
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const difficulty = searchParams.get('difficulty');
    const duration = searchParams.get('duration');
    const isActive = searchParams.get('isActive');

    const { page: pageNum, limit: limitNum } = validatePagination(page, limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (difficulty) where.difficulty = difficulty;
    if (duration) where.duration = parseInt(duration);
    if (isActive !== null) where.isActive = isActive === 'true';

    const [total, tours] = await Promise.all([
      prisma.tourPackage.count({ where }),
      prisma.tourPackage.findMany({
        where,
        include: {
          locations: { orderBy: { sequenceNumber: 'asc' } },
          tourRates: true,
          schedules: { take: 5, orderBy: { tourDate: 'desc' } },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return successResponse(
      {
        data: tours,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      'Tours retrieved successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/tours
 * Create a new tour package
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    requireFields(body, ['name', 'description', 'duration', 'maxGroupSize', 'tourType', 'slug', 'departureLocation', 'departureTime', 'returnTime']);

    const {
      name,
      description,
      duration,
      durationDays = 1,
      maxGroupSize,
      minGroupSize = 1,
      defaultGroupSize,
      tourType,
      slug,
      departureLocation,
      returnLocation,
      departureTime,
      returnTime,
      isActive = true,
      gallery = [],
      excludedServices = [],
    } = body;

    // Validate numeric fields
    if (typeof duration !== 'number' || duration <= 0) {
      throw new ApiError(400, 'Duration must be a positive number');
    }
    if (typeof maxGroupSize !== 'number' || maxGroupSize <= 0) {
      throw new ApiError(400, 'Max group size must be a positive number');
    }

    const tour = await prisma.tourPackage.create({
      data: {
        name,
        description,
        duration,
        durationDays,
        maxGroupSize,
        minGroupSize,
        defaultGroupSize: defaultGroupSize || maxGroupSize,
        tourType,
        slug,
        departureLocation,
        returnLocation: returnLocation || departureLocation,
        departureTime,
        returnTime,
        isActive,
        gallery: JSON.stringify(gallery),
        excludedServices: JSON.stringify(excludedServices),
      },
      include: {
        locations: true,
        tourRates: true,
      },
    });

    return successResponse(tour, 'Tour package created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
