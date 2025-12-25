/**
 * Tour Location SEO Data API Route
 * GET /api/tour-locations/:id/seo
 * 
 * Retrieve SEO metadata and structured data for a location
 * Used for meta tags, Open Graph, JSON-LD schema
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    // Validate ID
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

    if (!location || location.visibility !== 'PUBLIC') {
      return NextResponse.json(
        { success: false, error: 'LOCATION_NOT_FOUND', message: 'Location not found' },
        { status: 404 }
      );
    }

    // Parse keywords and tags
    const keywords = location.keywords ? 
      (typeof location.keywords === 'string' ? JSON.parse(location.keywords) : location.keywords) : [];
    const seoTags = location.seoTags ? 
      (typeof location.seoTags === 'string' ? JSON.parse(location.seoTags) : location.seoTags) : [];
    const highlights = location.highlights ?
      (typeof location.highlights === 'string' ? JSON.parse(location.highlights) : location.highlights) : [];

    // Generate structured data (JSON-LD)
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'TouristAttraction',
      name: location.title || location.name,
      description: location.metaDescription || location.description,
      image: location.imageUrl,
      address: {
        '@type': 'PostalAddress',
        streetAddress: location.address,
        addressLocality: location.island,
        addressCountry: 'TH',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: location.latitude,
        longitude: location.longitude,
      },
      priceRange: '$',
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: location.arrivalTime,
        closes: location.departureTime,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.5',
        ratingCount: '128',
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        // Meta tags
        title: location.title || location.name,
        description: location.metaDescription || location.shortDescription || location.description?.substring(0, 160),
        slug: location.slug,
        
        // Open Graph
        og: {
          title: location.title || location.name,
          description: location.metaDescription || location.shortDescription,
          image: location.imageUrl,
          type: 'website',
          url: `/tour-locations/${location.slug}`,
        },

        // Twitter Card
        twitter: {
          card: 'summary_large_image',
          title: location.title || location.name,
          description: location.metaDescription || location.shortDescription,
          image: location.imageUrl,
        },

        // Keywords and tags
        keywords: [...keywords, ...seoTags].filter(Boolean),
        
        // Breadcrumb
        breadcrumb: [
          { name: 'Home', url: '/' },
          { name: location.tourPackage?.name || 'Tour', url: `/tour-packages/${location.tourPackage?.slug}` },
          { name: location.name, url: `/tour-locations/${location.slug}` },
        ],

        // Structured data (JSON-LD)
        structuredData,

        // Canonical URL
        canonical: `/tour-locations/${location.slug}`,

        // Additional metadata
        metadata: {
          type: location.type,
          island: location.island,
          skillLevel: location.skillLevel,
          duration: location.durationMinutes,
          highlights,
          featured: location.isFeatured,
          lastModified: location.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching SEO data:', error);
    return NextResponse.json(
      { success: false, error: 'DATABASE_ERROR', message: 'Failed to fetch SEO data' },
      { status: 500 }
    );
  }
}
