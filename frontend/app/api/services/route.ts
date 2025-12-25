import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/app/api/utils/api-response';

/**
 * GET /api/services
 * Get all available services with counts and basic info
 */
export async function GET(req: NextRequest) {
  try {
    const [speedboats, tours, events] = await Promise.all([
      prisma.speedboat.count({ where: { status: 'AVAILABLE' } }),
      prisma.tourPackage.count({ where: { isActive: true } }),
      prisma.specialEvent.count({ where: { isActive: true } }),
    ]);

    return successResponse(
      {
        services: [
          {
            type: 'TRANSFER',
            name: 'Transfers',
            description: 'Private or shared vehicle transfers',
            icon: 'car',
            available: true,
          },
          {
            type: 'BOAT',
            name: 'Speedboat Tours',
            description: 'Fast boat experiences to islands',
            icon: 'boat',
            available: speedboats > 0,
            count: speedboats,
          },
          {
            type: 'TOUR',
            name: 'Guided Tours',
            description: 'Curated tour packages with guides',
            icon: 'map',
            available: tours > 0,
            count: tours,
          },
          {
            type: 'EVENT',
            name: 'Special Events',
            description: 'Parties, celebrations, and entertainment',
            icon: 'party',
            available: events > 0,
            count: events,
          },
          {
            type: 'PACKAGE',
            name: 'Bundles',
            description: 'Multi-service combinations',
            icon: 'bundle',
            available: true,
          },
        ],
      },
      'Services retrieved successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/services/compare
 * Compare pricing and features across services
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceTypes = ['TRANSFER', 'BOAT', 'TOUR', 'EVENT'], groupSize = 1 } = body;

    const results: any = {};

    // Get speedboat data
    if (serviceTypes.includes('BOAT')) {
      const boats = await prisma.speedboat.findMany({
        where: { status: 'AVAILABLE' },
        include: { speedboatRates: { take: 3 } },
        take: 5,
      });

      results.BOAT = {
        type: 'BOAT',
        name: 'Speedboat',
        count: boats.length,
        samples: boats.map((b) => ({
          id: b.id,
          name: b.name,
          capacity: b.capacity,
          minRate:
            b.speedboatRates.length > 0
              ? Math.min(...b.speedboatRates.map((r) => Number(r.basePrice)))
              : null,
        })),
      };
    }

    // Get tour data
    if (serviceTypes.includes('TOUR')) {
      const tours = await prisma.tourPackage.findMany({
        where: { isActive: true },
        include: {
          tourRates: {
            where: {
              minGroupSize: { lte: groupSize },
              maxGroupSize: { gte: groupSize },
            },
            take: 1,
          },
        },
        take: 5,
      });

      results.TOUR = {
        type: 'TOUR',
        name: 'Guided Tour',
        count: tours.length,
        samples: tours.map((t) => ({
          id: t.id,
          name: t.name,
          duration: t.duration,
          maxCapacity: t.maxGroupSize,
          pricePerPerson:
            t.tourRates.length > 0
              ? Number(t.tourRates[0].pricePerPerson)
              : null,
        })),
      };
    }

    // Get event data
    if (serviceTypes.includes('EVENT')) {
      const events = await prisma.specialEvent.findMany({
        where: { isActive: true },
        include: {
          eventRates: {
            orderBy: { validFrom: 'desc' },
            take: 1,
          },
        },
        take: 5,
      });

      results.EVENT = {
        type: 'EVENT',
        name: 'Special Event',
        count: events.length,
        samples: events.map((e) => ({
          id: e.id,
          name: e.name,
          theme: e.theme,
          maxCapacity: e.maxCapacity,
          pricePerPerson:
            e.eventRates.length > 0
              ? Number(e.eventRates[0].pricePerPerson)
              : Number(e.registrationFee),
        })),
      };
    }

    return successResponse(
      { comparison: results, groupSize },
      'Service comparison retrieved'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
