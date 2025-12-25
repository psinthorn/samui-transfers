/**
 * Nearby Tour Locations API Route
 * GET /api/tour-locations/:id/nearby
 * 
 * Find nearby tour locations based on GPS coordinates
 * Uses geographic distance calculation to find related locations
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to parse JSON fields
function parseLocationFields(location: any) {
  return {
    ...location,
    gallery: typeof location.gallery === 'string' ? JSON.parse(location.gallery) : location.gallery,
    keywords: typeof location.keywords === 'string' ? JSON.parse(location.keywords) : location.keywords,
    seoTags: typeof location.seoTags === 'string' ? JSON.parse(location.seoTags) : location.seoTags,
    highlights: typeof location.highlights === 'string' ? JSON.parse(location.highlights) : location.highlights,
    funFacts: typeof location.funFacts === 'string' ? JSON.parse(location.funFacts) : location.funFacts,
    tipsFacts: typeof location.tipsFacts === 'string' ? JSON.parse(location.tipsFacts) : location.tipsFacts,
    amenities: typeof location.amenities === 'string' ? JSON.parse(location.amenities) : location.amenities,
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const radiusKm = Math.min(50, Math.max(1, parseInt(searchParams.get('radius') || '5', 10)));
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

    // Validate ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'INVALID_ID', message: 'Invalid location ID' },
        { status: 400 }
      );
    }

    // Fetch the reference location
    const referenceLocation = await prisma.tourLocation.findUnique({
      where: { id },
    });

    if (!referenceLocation || referenceLocation.visibility !== 'PUBLIC') {
      return NextResponse.json(
        { success: false, error: 'LOCATION_NOT_FOUND', message: 'Location not found' },
        { status: 404 }
      );
    }

    // Fetch all nearby locations (same tour or public locations)
    const allLocations = await prisma.tourLocation.findMany({
      where: {
        visibility: 'PUBLIC',
        isActive: true,
        id: { not: id }, // Exclude the reference location
      },
      select: {
        id: true,
        name: true,
        slug: true,
        latitude: true,
        longitude: true,
        imageUrl: true,
        type: true,
        island: true,
        shortDescription: true,
        tourPackageId: true,
      },
    });

    // Calculate distances and filter by radius
    const nearbyLocations = allLocations
      .map((loc) => ({
        ...loc,
        distance: calculateDistance(
          Number(referenceLocation.latitude),
          Number(referenceLocation.longitude),
          Number(loc.latitude),
          Number(loc.longitude)
        ),
      }))
      .filter((loc) => loc.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    // Fetch full details for nearby locations
    const nearbyDetails = await prisma.tourLocation.findMany({
      where: {
        id: { in: nearbyLocations.map((l) => l.id) },
      },
      include: {
        tourPackage: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Add distance information and sort by distance
    const result = nearbyLocations.map((nearbyLoc) => {
      const fullLoc = nearbyDetails.find((d) => d.id === nearbyLoc.id);
      return {
        ...parseLocationFields(fullLoc),
        distance: nearbyLoc.distance,
      };
    });

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        referenceLocation: {
          id: referenceLocation.id,
          name: referenceLocation.name,
          coordinates: {
            latitude: Number(referenceLocation.latitude),
            longitude: Number(referenceLocation.longitude),
          },
        },
        searchRadius: radiusKm,
        found: result.length,
        limited: result.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching nearby locations:', error);
    return NextResponse.json(
      { success: false, error: 'DATABASE_ERROR', message: 'Failed to fetch nearby locations' },
      { status: 500 }
    );
  }
}
