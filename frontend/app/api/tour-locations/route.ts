/**
 * Tour Locations API Route
 * GET /api/tour-packages/:tourId/locations - Get all locations for a tour
 * POST /api/tour-locations - Create new location (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// ============================================
// GET - Fetch all locations for a tour
// ============================================

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const tourId = searchParams.get('tourId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sort = searchParams.get('sort') || 'sequenceNumber';
    const order = (searchParams.get('order') || 'asc') as 'asc' | 'desc';

    // Validate tour ID
    if (!tourId) {
      return NextResponse.json(
        { success: false, error: 'MISSING_TOUR_ID', message: 'tourId parameter is required' },
        { status: 400 }
      );
    }

    // Verify tour exists
    const tour = await prisma.tourPackage.findUnique({
      where: { id: tourId },
    });

    if (!tour) {
      return NextResponse.json(
        { success: false, error: 'TOUR_NOT_FOUND', message: 'Tour not found' },
        { status: 404 }
      );
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch locations
    const [locations, total] = await Promise.all([
      prisma.tourLocation.findMany({
        where: {
          tourPackageId: tourId,
          visibility: 'PUBLIC',
        },
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      prisma.tourLocation.count({
        where: {
          tourPackageId: tourId,
          visibility: 'PUBLIC',
        },
      }),
    ]);

    // Parse JSON fields for all locations
    const parsedLocations = locations.map(location => ({
      ...location,
      gallery: typeof location.gallery === 'string' ? JSON.parse(location.gallery) : location.gallery,
      keywords: typeof location.keywords === 'string' ? JSON.parse(location.keywords) : location.keywords,
      seoTags: typeof location.seoTags === 'string' ? JSON.parse(location.seoTags) : location.seoTags,
      highlights: typeof location.highlights === 'string' ? JSON.parse(location.highlights) : location.highlights,
      funFacts: typeof location.funFacts === 'string' ? JSON.parse(location.funFacts) : location.funFacts,
      tipsFacts: typeof location.tipsFacts === 'string' ? JSON.parse(location.tipsFacts) : location.tipsFacts,
      amenities: typeof location.amenities === 'string' ? JSON.parse(location.amenities) : location.amenities,
    }));

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: parsedLocations,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    });
  } catch (error) {
    console.error('Error fetching tour locations:', error);
    return NextResponse.json(
      { success: false, error: 'DATABASE_ERROR', message: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Create new location (admin only)
// ============================================

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['tourPackageId', 'name', 'type', 'sequenceNumber', 'latitude', 'longitude'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: 'INVALID_INPUT', message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Verify tour exists
    const tour = await prisma.tourPackage.findUnique({
      where: { id: body.tourPackageId },
    });

    if (!tour) {
      return NextResponse.json(
        { success: false, error: 'TOUR_NOT_FOUND', message: 'Tour not found' },
        { status: 404 }
      );
    }

    // Check slug uniqueness (if provided)
    if (body.slug) {
      const existingSlug = await prisma.tourLocation.findFirst({
        where: {
          tourPackageId: body.tourPackageId,
          slug: body.slug,
        },
      });

      if (existingSlug) {
        return NextResponse.json(
          { success: false, error: 'DUPLICATE_SLUG', message: 'Slug already exists for this tour' },
          { status: 409 }
        );
      }
    }

    // Validate latitude/longitude
    const lat = parseFloat(body.latitude);
    const lng = parseFloat(body.longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { success: false, error: 'INVALID_COORDINATES', message: 'Invalid latitude/longitude' },
        { status: 400 }
      );
    }

    // Create location
    const location = await prisma.tourLocation.create({
      data: {
        tourPackageId: body.tourPackageId,
        name: body.name,
        slug: body.slug || null,
        type: body.type,
        sequenceNumber: body.sequenceNumber,
        latitude: body.latitude,
        longitude: body.longitude,
        island: body.island || null,
        address: body.address || null,
        durationMinutes: body.durationMinutes || null,
        arrivalTime: body.arrivalTime || null,
        departureTime: body.departureTime || null,
        activity: body.activity || null,
        activityDuration: body.activityDuration || null,
        skillLevel: body.skillLevel || null,
        title: body.title || null,
        description: body.description || null,
        shortDescription: body.shortDescription || null,
        imageUrl: body.imageUrl || null,
        imageAlt: body.imageAlt || null,
        gallery: JSON.stringify(body.gallery || []),
        keywords: JSON.stringify(body.keywords || []),
        seoTags: JSON.stringify(body.seoTags || []),
        metaDescription: body.metaDescription || null,
        highlights: JSON.stringify(body.highlights || []),
        bestTimeToVisit: body.bestTimeToVisit || null,
        funFacts: JSON.stringify(body.funFacts || []),
        tipsFacts: JSON.stringify(body.tipsFacts || []),
        wheelchairAccessible: body.wheelchairAccessible || false,
        parkingAvailable: body.parkingAvailable || false,
        toiletsAvailable: body.toiletsAvailable || false,
        amenities: JSON.stringify(body.amenities || []),
        isActive: body.isActive !== false,
        isFeatured: body.isFeatured || false,
        visibility: body.visibility || 'DRAFT',
        notes: body.notes || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...location,
          gallery: JSON.parse(location.gallery),
          keywords: JSON.parse(location.keywords),
          seoTags: JSON.parse(location.seoTags),
          highlights: JSON.parse(location.highlights),
          funFacts: JSON.parse(location.funFacts),
          tipsFacts: JSON.parse(location.tipsFacts),
          amenities: JSON.parse(location.amenities),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating tour location:', error);
    return NextResponse.json(
      { success: false, error: 'DATABASE_ERROR', message: 'Failed to create location' },
      { status: 500 }
    );
  }
}
