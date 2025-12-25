/**
 * Tour Location by Slug API Route
 * GET /api/tour-locations/by-slug/:slug
 * 
 * Fetch a tour location by its slug for public-facing pages
 * More SEO-friendly than using IDs in URLs
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

type Params = Promise<{ slug: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { slug } = await params;

    // Validate slug
    if (!slug || typeof slug !== 'string' || slug.length === 0) {
      return NextResponse.json(
        { success: false, error: 'INVALID_SLUG', message: 'Invalid location slug' },
        { status: 400 }
      );
    }

    // Fetch location by slug
    const location = await prisma.tourLocation.findFirst({
      where: { 
        slug,
        visibility: 'PUBLIC',
      },
      include: {
        tourPackage: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
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

    // Fetch nearby locations for recommendations
    const nearbyLocations = await prisma.tourLocation.findMany({
      where: {
        tourPackageId: location.tourPackageId,
        visibility: 'PUBLIC',
        isActive: true,
        id: { not: location.id },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        shortDescription: true,
        sequenceNumber: true,
      },
      orderBy: { sequenceNumber: 'asc' },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...parseLocationFields(location),
        relatedLocations: nearbyLocations,
      },
    });
  } catch (error) {
    console.error('Error fetching location by slug:', error);
    return NextResponse.json(
      { success: false, error: 'DATABASE_ERROR', message: 'Failed to fetch location' },
      { status: 500 }
    );
  }
}
