import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError, ApiError } from '@/app/api/utils/api-response';
import { requireFields, validatePrice, validateId } from '@/app/api/utils/validation';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * GET /api/speedboat-rates
 * Get rates for speedboats (by speedboat or service type)
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const speedboatId = searchParams.get('speedboatId');
    const serviceType = searchParams.get('serviceType');

    const where: any = {};
    if (speedboatId) where.speedboatId = speedboatId;
    if (serviceType) where.serviceType = serviceType;

    const rates = await prisma.speedboatRate.findMany({
      where,
      include: {
        speedboat: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(rates, 'Speedboat rates retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/speedboat-rates
 * Create a new rate for a speedboat
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    requireFields(body, ['speedboatId', 'serviceType', 'basePrice', 'duration', 'minCapacity', 'maxCapacity']);

    const {
      speedboatId,
      serviceType,
      basePrice,
      pricePerPerson,
      duration,
      minCapacity,
      maxCapacity,
      fuelSurcharge,
      crewCost,
      capacityDiscount,
      isSeasonalRate = false,
      seasonStart,
      seasonEnd,
      seasonMultiplier = 1,
      validFrom,
      validUntil,
    } = body;

    // Validate speedboat exists
    const speedboat = await prisma.speedboat.findUnique({
      where: { id: speedboatId },
    });

    if (!speedboat) {
      throw new ApiError(404, 'Speedboat not found');
    }

    // Validate prices
    const basePriceVal = validatePrice(basePrice, 'Base price');
    const ppVal = pricePerPerson ? validatePrice(pricePerPerson, 'Price per person') : null;
    const fuelVal = fuelSurcharge ? validatePrice(fuelSurcharge, 'Fuel surcharge') : null;
    const crewVal = crewCost ? validatePrice(crewCost, 'Crew cost') : null;
    const capDiscVal = capacityDiscount ? validatePrice(capacityDiscount, 'Capacity discount') : null;
    const seasonMultVal = validatePrice(seasonMultiplier, 'Season multiplier');

    const rate = await prisma.speedboatRate.create({
      data: {
        speedboatId,
        serviceType,
        basePrice: new Decimal(basePriceVal),
        pricePerPerson: ppVal ? new Decimal(ppVal) : null,
        duration,
        minCapacity,
        maxCapacity,
        fuelSurcharge: fuelVal ? new Decimal(fuelVal) : null,
        crewCost: crewVal ? new Decimal(crewVal) : null,
        capacityDiscount: capDiscVal ? new Decimal(capDiscVal) : null,
        isSeasonalRate,
        seasonStart,
        seasonEnd,
        seasonMultiplier: new Decimal(seasonMultVal),
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
      },
      include: { speedboat: true },
    });

    return successResponse(rate, 'Speedboat rate created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/speedboat-rates
 * Bulk update speedboat rates (future enhancement)
 * Currently, update individual rates at /api/speedboat-rates/[id]
 */
export async function PUT(req: NextRequest) {
  try {
    return errorResponse('Use PUT /api/speedboat-rates/[id] to update individual rates', 400);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/speedboat-rates
 * Bulk delete speedboat rates (future enhancement)
 * Currently, delete individual rates at /api/speedboat-rates/[id]
 */
export async function DELETE(req: NextRequest) {
  try {
    return errorResponse('Use DELETE /api/speedboat-rates/[id] to delete individual rates', 400);
  } catch (error) {
    return handleApiError(error);
  }
}

