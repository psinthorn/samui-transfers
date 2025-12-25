/**
 * Tour Location API Route - GET, PUT, DELETE
 * GET /api/tour-locations/:id - Fetch single location
 * PUT /api/tour-locations/:id - Update location (admin only)
 * DELETE /api/tour-locations/:id - Delete location (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

type Params = Promise<{ id: string }>;

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

// ============================================
// GET - Fetch single location (public)
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'INVALID_ID', message: 'Invalid location ID' },
        { status: 400 }
      );
    }

    // Fetch location
    const location = await prisma.tourLocation.findUnique({
      where: { id },
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

    if (!location) {
      return NextResponse.json(
        { success: false, error: 'LOCATION_NOT_FOUND', message: 'Location not found' },
        { status: 404 }
      );
    }

    // Check visibility for non-admin users
    if (location.visibility !== 'PUBLIC') {
      return NextResponse.json(
        { success: false, error: 'ACCESS_DENIED', message: 'Location not accessible' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: parseLocationFields(location),
    });
  } catch (error) {
    console.error('Error fetching tour location:', error);
    return NextResponse.json(
      { success: false, error: 'DATABASE_ERROR', message: 'Failed to fetch location' },
      { status: 500 }
    );
  }
}

// ============================================
// PUT - Update location (admin only)
// ============================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'INVALID_ID', message: 'Invalid location ID' },
        { status: 400 }
      );
    }

    // Find location
    const location = await prisma.tourLocation.findUnique({
      where: { id },
    });

    if (!location) {
      return NextResponse.json(
        { success: false, error: 'LOCATION_NOT_FOUND', message: 'Location not found' },
        { status: 404 }
      );
    }

    // Validate lat/lng if provided
    if (body.latitude !== undefined || body.longitude !== undefined) {
      const lat = parseFloat(body.latitude ?? location.latitude);
      const lng = parseFloat(body.longitude ?? location.longitude);

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return NextResponse.json(
          { success: false, error: 'INVALID_COORDINATES', message: 'Invalid latitude/longitude' },
          { status: 400 }
        );
      }
    }

    // Check slug uniqueness if changing
    if (body.slug && body.slug !== location.slug) {
      const existingSlug = await prisma.tourLocation.findFirst({
        where: {
          tourPackageId: location.tourPackageId,
          slug: body.slug,
          id: { not: id },
        },
      });

      if (existingSlug) {
        return NextResponse.json(
          { success: false, error: 'DUPLICATE_SLUG', message: 'Slug already exists' },
          { status: 409 }
        );
      }
    }

    // Update location
    const updated = await prisma.tourLocation.update({
      where: { id },
      data: {
        name: body.name ?? location.name,
        slug: body.slug ?? location.slug,
        type: body.type ?? location.type,
        sequenceNumber: body.sequenceNumber ?? location.sequenceNumber,
        latitude: body.latitude ?? location.latitude,
        longitude: body.longitude ?? location.longitude,
        island: body.island ?? location.island,
        address: body.address ?? location.address,
        durationMinutes: body.durationMinutes ?? location.durationMinutes,
        arrivalTime: body.arrivalTime ?? location.arrivalTime,
        departureTime: body.departureTime ?? location.departureTime,
        activity: body.activity ?? location.activity,
        activityDuration: body.activityDuration ?? location.activityDuration,
        skillLevel: body.skillLevel ?? location.skillLevel,
        title: body.title ?? location.title,
        description: body.description ?? location.description,
        shortDescription: body.shortDescription ?? location.shortDescription,
        imageUrl: body.imageUrl ?? location.imageUrl,
        imageAlt: body.imageAlt ?? location.imageAlt,
        gallery: body.gallery ? JSON.stringify(body.gallery) : location.gallery,
        keywords: body.keywords ? JSON.stringify(body.keywords) : location.keywords,
        seoTags: body.seoTags ? JSON.stringify(body.seoTags) : location.seoTags,
        metaDescription: body.metaDescription ?? location.metaDescription,
        highlights: body.highlights ? JSON.stringify(body.highlights) : location.highlights,
        bestTimeToVisit: body.bestTimeToVisit ?? location.bestTimeToVisit,
        funFacts: body.funFacts ? JSON.stringify(body.funFacts) : location.funFacts,
        tipsFacts: body.tipsFacts ? JSON.stringify(body.tipsFacts) : location.tipsFacts,
        wheelchairAccessible: body.wheelchairAccessible ?? location.wheelchairAccessible,
        parkingAvailable: body.parkingAvailable ?? location.parkingAvailable,
        toiletsAvailable: body.toiletsAvailable ?? location.toiletsAvailable,
        amenities: body.amenities ? JSON.stringify(body.amenities) : location.amenities,
        isActive: body.isActive ?? location.isActive,
        isFeatured: body.isFeatured ?? location.isFeatured,
        visibility: body.visibility ?? location.visibility,
        notes: body.notes ?? location.notes,
      },
    });

    return NextResponse.json({
      success: true,
      data: parseLocationFields(updated),
    });
  } catch (error) {
    console.error('Error updating tour location:', error);
    return NextResponse.json(
      { success: false, error: 'DATABASE_ERROR', message: 'Failed to update location' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - Delete location (admin only)
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validate ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'INVALID_ID', message: 'Invalid location ID' },
        { status: 400 }
      );
    }

    // Find location
    const location = await prisma.tourLocation.findUnique({
      where: { id },
    });

    if (!location) {
      return NextResponse.json(
        { success: false, error: 'LOCATION_NOT_FOUND', message: 'Location not found' },
        { status: 404 }
      );
    }

    // Delete location
    await prisma.tourLocation.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Location deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting tour location:', error);
    return NextResponse.json(
      { success: false, error: 'DATABASE_ERROR', message: 'Failed to delete location' },
      { status: 500 }
    );
  }
}
