import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// GET - Fetch all tour packages with filters and pagination
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { email: session.user.email || '' },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const tourType = searchParams.get('tourType') || '';

    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'published') {
      where.isPublished = true;
    } else if (status === 'draft') {
      where.isPublished = false;
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    if (tourType) {
      where.tourType = tourType;
    }

    // Get total count
    const total = await db.tourPackage.count({ where });

    // Get paginated data
    const tourPackages = await db.tourPackage.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        tourRates: true,
        locations: true,
        schedules: true,
        _count: {
          select: { tourBookings: true, locations: true },
        },
      },
    });

    return NextResponse.json({
      data: tourPackages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching tour packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tour packages' },
      { status: 500 }
    );
  }
}

// POST - Create a new tour package
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { email: session.user.email || '' },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      slug,
      description,
      summary,
      tourType,
      duration,
      durationDays,
      minGroupSize,
      maxGroupSize,
      defaultGroupSize,
      islandsCovered,
      departureLocation,
      returnLocation,
      availableDays,
      departureTime,
      returnTime,
      seasonalAvailability,
      seasonStart,
      seasonEnd,
      offSeasonAvailable,
      includedServices,
      excludedServices,
      imageUrl,
      gallery,
      isPublished,
      isActive,
      locations = [],
    } = body;

    // DEBUG: Log incoming locations
    console.log('🆕 CREATE TOUR - Incoming locations:', locations.map((l: any) => ({
      name: l.name,
      seq: l.sequenceNumber,
    })));

    // Check for duplicate sequence numbers
    if (locations && locations.length > 0) {
      const sequenceNumbers = locations.map((l: any) => l.sequenceNumber);
      const uniqueSequences = new Set(sequenceNumbers);
      if (uniqueSequences.size !== sequenceNumbers.length) {
        console.warn('⚠️ DUPLICATE SEQUENCE NUMBERS IN CREATE!');
        console.warn('Sequences:', sequenceNumbers);
        return NextResponse.json(
          { error: `Duplicate sequence numbers detected: ${sequenceNumbers.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate required fields
    if (!name || !slug || !tourType || !duration || !maxGroupSize || !departureLocation || !departureTime || !returnTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await db.tourPackage.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    const tourPackage = await db.tourPackage.create({
      data: {
        name,
        slug,
        description: description || null,
        summary: summary || null,
        tourType,
        duration,
        durationDays: durationDays || 1,
        minGroupSize: minGroupSize || 1,
        maxGroupSize,
        defaultGroupSize: defaultGroupSize || maxGroupSize,
        islandsCovered: islandsCovered || [],
        departureLocation,
        returnLocation: returnLocation || null,
        availableDays: availableDays || ['DAILY'],
        departureTime,
        returnTime,
        seasonalAvailability: seasonalAvailability ?? true,
        seasonStart: seasonStart || null,
        seasonEnd: seasonEnd || null,
        offSeasonAvailable: offSeasonAvailable ?? false,
        includedServices: includedServices || [],
        excludedServices: excludedServices || '[]',
        imageUrl: imageUrl || null,
        gallery: gallery || '[]',
        isPublished: isPublished ?? true,
        isActive: isActive ?? true,
        // Create locations if provided
        locations: locations && locations.length > 0 ? {
          create: locations.map((loc: any) => ({
            name: loc.name,
            slug: loc.slug || null,
            type: loc.type,
            sequenceNumber: loc.sequenceNumber,
            latitude: loc.latitude,
            longitude: loc.longitude,
            island: loc.island || null,
            address: loc.address || null,
            durationMinutes: loc.durationMinutes || null,
            arrivalTime: loc.arrivalTime || null,
            departureTime: loc.departureTime || null,
            activity: loc.activity || null,
            activityDuration: loc.activityDuration || null,
            title: loc.title || null,
            description: loc.description || null,
            shortDescription: loc.shortDescription || null,
            imageUrl: loc.imageUrl || null,
            imageAlt: loc.imageAlt || null,
            amenities: Array.isArray(loc.amenities) ? JSON.stringify(loc.amenities) : (loc.amenities || '[]'),
            highlights: Array.isArray(loc.highlights) ? JSON.stringify(loc.highlights) : (loc.highlights || '[]'),
            notes: loc.notes || null,
          }))
        } : undefined,
      },
      include: {
        tourRates: true,
        locations: true,
        schedules: true,
        _count: {
          select: { tourBookings: true, locations: true },
        },
      },
    });

    return NextResponse.json(tourPackage, { status: 201 });
  } catch (error) {
    console.error('Error creating tour package:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create tour package';
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}
