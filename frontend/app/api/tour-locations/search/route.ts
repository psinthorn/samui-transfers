/**
 * Tour Locations Search API Route
 * POST /api/tour-locations/search
 * 
 * Search and filter tour locations with pagination
 * Supports full-text search on name, title, description, keywords
 * Supports filtering by type, island, skill level, amenities
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract search and filter parameters
    const {
      query = '',
      page = 1,
      limit = 20,
      sort = 'sequenceNumber',
      order = 'asc',
      tourPackageId,
      type,
      island,
      skillLevel,
      isActive = true,
      isFeatured,
      visibility = 'PUBLIC',
    } = body;

    // Validate pagination
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      visibility,
      isActive,
    };

    if (tourPackageId) {
      where.tourPackageId = tourPackageId;
    }

    if (type) {
      where.type = type;
    }

    if (island) {
      where.island = { contains: island, mode: 'insensitive' };
    }

    if (skillLevel) {
      where.skillLevel = skillLevel;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    // Add full-text search if query provided
    if (query.trim()) {
      const searchTerm = query.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { shortDescription: { contains: searchTerm, mode: 'insensitive' } },
        { keywords: { contains: searchTerm, mode: 'insensitive' } },
        { seoTags: { contains: searchTerm, mode: 'insensitive' } },
        { highlights: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Validate sort field
    const validSortFields = [
      'name',
      'sequenceNumber',
      'createdAt',
      'updatedAt',
      'isFeatured',
      'latitude',
      'longitude',
    ];
    const sortField = validSortFields.includes(sort) ? sort : 'sequenceNumber';
    const sortOrder = order?.toLowerCase() === 'desc' ? 'desc' : 'asc';

    // Execute search query
    const [locations, total] = await Promise.all([
      prisma.tourLocation.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortField]: sortOrder },
        include: {
          tourPackage: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.tourLocation.count({ where }),
    ]);

    const pages = Math.ceil(total / limitNum);

    return NextResponse.json({
      success: true,
      data: locations.map(parseLocationFields),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages,
        hasMore: pageNum < pages,
      },
      meta: {
        query,
        sort: sortField,
        order: sortOrder,
      },
    });
  } catch (error) {
    console.error('Error searching tour locations:', error);
    return NextResponse.json(
      { success: false, error: 'SEARCH_ERROR', message: 'Failed to search locations' },
      { status: 500 }
    );
  }
}
