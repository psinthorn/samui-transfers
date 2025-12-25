import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiError, errorResponse } from '@/app/api/utils/api-response';
import { requireFields, validatePrice, validateId } from '@/app/api/utils/validation';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * GET /api/tour-rates
 * Get rates for tours (by package or group size)
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const tourPackageId = searchParams.get('tourPackageId');
    const minGroupSize = searchParams.get('minGroupSize');

    const where: any = {};
    if (tourPackageId) where.tourPackageId = tourPackageId;
    if (minGroupSize) where.minGroupSize = parseInt(minGroupSize);

    const rates = await prisma.tourRate.findMany({
      where,
      include: {
        tourPackage: true,
      },
      orderBy: { minGroupSize: 'asc' },
    });

    return successResponse(rates, 'Tour rates retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/tour-rates
 * Create a new rate for a tour
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    requireFields(body, ['tourPackageId', 'minGroupSize', 'maxGroupSize', 'pricePerPerson']);

    const {
      tourPackageId,
      minGroupSize,
      maxGroupSize,
      pricePerPerson,
      minimumGroupPrice,
      isSeasonalRate = false,
      seasonStart,
      seasonEnd,
      seasonMultiplier = 1.0,
    } = body;

    // Validate tour package exists
    const tour = await prisma.tourPackage.findUnique({
      where: { id: tourPackageId },
    });

    if (!tour) {
      throw new ApiError(404, 'Tour package not found');
    }

    // Validate group sizes
    if (typeof minGroupSize !== 'number' || minGroupSize <= 0) {
      throw new ApiError(400, 'Min group size must be a positive number');
    }
    if (typeof maxGroupSize !== 'number' || maxGroupSize <= 0) {
      throw new ApiError(400, 'Max group size must be a positive number');
    }
    if (maxGroupSize < minGroupSize) {
      throw new ApiError(400, 'Max group size must be greater than or equal to min group size');
    }

    const price = validatePrice(pricePerPerson, 'Price per person');
    const minPrice = minimumGroupPrice ? validatePrice(minimumGroupPrice) : undefined;

    const rate = await prisma.tourRate.create({
      data: {
        tourPackageId,
        minGroupSize,
        maxGroupSize,
        pricePerPerson: new Decimal(price),
        minimumGroupPrice: minPrice ? new Decimal(minPrice) : null,
        isSeasonalRate,
        seasonStart,
        seasonEnd,
        seasonMultiplier: new Decimal(seasonMultiplier),
      },
      include: { tourPackage: true },
    });

    return successResponse(rate, 'Tour rate created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/tour-rates
 * Bulk update tour rates (future enhancement)
 * Currently, update individual rates at /api/tour-rates/[id]
 */
export async function PUT(req: NextRequest) {
  try {
    return errorResponse('Use PUT /api/tour-rates/[id] to update individual rates', 400);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/tour-rates
 * Bulk delete tour rates (future enhancement)
 * Currently, delete individual rates at /api/tour-rates/[id]
 */
export async function DELETE(req: NextRequest) {
  try {
    return errorResponse('Use DELETE /api/tour-rates/[id] to delete individual rates', 400);
  } catch (error) {
    return handleApiError(error);
  }
}
