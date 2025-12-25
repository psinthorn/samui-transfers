import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiError } from '@/app/api/utils/api-response';
import { requireFields, validatePagination } from '@/app/api/utils/validation';

/**
 * GET /api/speedboats
 * List all speedboats with optional filters and pagination
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const status = searchParams.get('status');
    const boatType = searchParams.get('boatType');

    const { page: pageNum, limit: limitNum } = validatePagination(page, limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const where: any = {};
    if (status) where.status = status;
    if (boatType) where.boatType = boatType;

    // Get count and data
    const [total, speedboats] = await Promise.all([
      prisma.speedboat.count({ where }),
      prisma.speedboat.findMany({
        where,
        include: {
          speedboatRates: true,
          speedboatBookings: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return successResponse(
      {
        data: speedboats,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      'Speedboats retrieved successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/speedboats
 * Create a new speedboat
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    requireFields(body, ['name', 'boatType', 'capacity', 'crewSize', 'homePort', 'fuelType', 'fuelCapacity']);

    const { name, boatType, capacity, crewSize, homePort, fuelType, fuelCapacity, ...rest } = body;

    // Validate numeric fields
    if (typeof capacity !== 'number' || capacity <= 0) {
      throw new ApiError(400, 'Capacity must be a positive number');
    }
    if (typeof crewSize !== 'number' || crewSize <= 0) {
      throw new ApiError(400, 'Crew size must be a positive number');
    }

    const speedboat = await prisma.speedboat.create({
      data: {
        name,
        boatType,
        capacity,
        crewSize,
        homePort,
        fuelType,
        fuelCapacity: new Decimal(fuelCapacity),
        status: 'AVAILABLE',
        ...rest,
      },
      include: { speedboatRates: true },
    });

    return successResponse(speedboat, 'Speedboat created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// Import Decimal for proper price handling
import { Decimal } from '@prisma/client/runtime/library';
