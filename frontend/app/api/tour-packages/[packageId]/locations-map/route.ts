/**
 * Tour Locations Map Data API Route
 * GET /api/tour-packages/:packageId/locations-map
 * 
 * Retrieve lightweight location data for map display
 * Includes coordinates, names, sequence numbers, and location types
 * Optimized for map rendering with minimal payload
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ packageId: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { packageId } = await params;

    // Validate package ID
    if (!packageId || typeof packageId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'INVALID_ID', message: 'Invalid package ID' },
        { status: 400 }
      );
    }

    // Verify tour package exists
    const tourPackage = await prisma.tourPackage.findUnique({
      where: { id: packageId },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!tourPackage) {
      return NextResponse.json(
        { success: false, error: 'PACKAGE_NOT_FOUND', message: 'Tour package not found' },
        { status: 404 }
      );
    }

    // Fetch locations sorted by sequence
    const locations = await prisma.tourLocation.findMany({
      where: {
        tourPackageId: packageId,
        visibility: 'PUBLIC',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        sequenceNumber: true,
        latitude: true,
        longitude: true,
        imageUrl: true,
        island: true,
        durationMinutes: true,
        arrivalTime: true,
        departureTime: true,
      },
      orderBy: { sequenceNumber: 'asc' },
    });

    // Transform for map display
    const mapData = locations.map((loc, index) => ({
      id: loc.id,
      name: loc.name,
      slug: loc.slug,
      sequence: loc.sequenceNumber,
      coordinates: {
        latitude: Number(loc.latitude),
        longitude: Number(loc.longitude),
      },
      type: loc.type,
      island: loc.island,
      thumbnail: loc.imageUrl,
      duration: loc.durationMinutes,
      timing: {
        arrival: loc.arrivalTime,
        departure: loc.departureTime,
      },
      // Calculate distance from previous location (for route visualization)
      distanceToPrevious: index > 0 ? calculateDistance(
        Number(locations[index - 1].latitude),
        Number(locations[index - 1].longitude),
        Number(loc.latitude),
        Number(loc.longitude)
      ) : 0,
    }));

    // Calculate route bounds for map fitting
    const bounds = calculateBounds(locations);

    return NextResponse.json({
      success: true,
      data: {
        packageId: tourPackage.id,
        packageName: tourPackage.name,
        packageSlug: tourPackage.slug,
        locations: mapData,
        stats: {
          totalLocations: locations.length,
          totalDistance: mapData.reduce((sum, loc) => sum + (loc.distanceToPrevious || 0), 0),
          bounds,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching map data:', error);
    return NextResponse.json(
      { success: false, error: 'DATABASE_ERROR', message: 'Failed to fetch map data' },
      { status: 500 }
    );
  }
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

/**
 * Calculate geographic bounds for all locations
 * Returns min/max latitude and longitude
 */
function calculateBounds(locations: any[]) {
  if (locations.length === 0) {
    return {
      minLat: 0,
      maxLat: 0,
      minLng: 0,
      maxLng: 0,
    };
  }

  let minLat = Number(locations[0].latitude);
  let maxLat = Number(locations[0].latitude);
  let minLng = Number(locations[0].longitude);
  let maxLng = Number(locations[0].longitude);

  for (const loc of locations) {
    const lat = Number(loc.latitude);
    const lng = Number(loc.longitude);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  }

  return { minLat, maxLat, minLng, maxLng };
}
