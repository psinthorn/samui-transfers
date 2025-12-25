import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

type Params = Promise<{ id: string }>;

// GET - Fetch single tour package
export async function GET(
  req: NextRequest,
  { params }: { params: Params }
) {
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

    const { id } = await params;

    const tourPackage = await db.tourPackage.findUnique({
      where: { id },
      include: {
        tourRates: true,
        locations: {
          orderBy: { name: 'asc' },
        },
        schedules: {
          orderBy: { tourDate: 'desc' },
        },
        tourBookings: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { tourBookings: true, locations: true },
        },
      },
    });

    if (!tourPackage) {
      return NextResponse.json(
        { error: 'Tour package not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(tourPackage);
  } catch (error) {
    console.error('Error fetching tour package:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tour package' },
      { status: 500 }
    );
  }
}

// PUT - Update tour package
export async function PUT(
  req: NextRequest,
  { params }: { params: Params }
) {
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

    const { id } = await params;
    const body = await req.json();

    // Fetch existing package
    const existing = await db.tourPackage.findUnique({
      where: { id },
      include: { locations: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Tour package not found' },
        { status: 404 }
      );
    }

    // If slug is changed, check for duplicates
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await db.tourPackage.findUnique({
        where: { slug: body.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    // Handle locations update
    const incomingLocations = body.locations || [];
    
    console.log('📍 LOCATION UPDATE DEBUG:');
    console.log('Tour ID:', id);
    console.log('Incoming locations count:', incomingLocations.length);
    
    // Check for duplicate sequence numbers
    const sequenceNumbers = incomingLocations.map((l: any) => l.sequenceNumber);
    const uniqueSequences = new Set(sequenceNumbers);
    if (uniqueSequences.size !== sequenceNumbers.length) {
      console.warn('⚠️ DUPLICATE SEQUENCE NUMBERS DETECTED!');
      console.warn('Sequences:', sequenceNumbers);
      console.warn('Unique sequences:', Array.from(uniqueSequences));
      throw new Error(`Duplicate sequence numbers detected: ${sequenceNumbers.join(', ')}`);
    }

    console.log('Incoming locations:', incomingLocations.map((l: any) => ({ 
      id: l.id, 
      name: l.name, 
      seq: l.sequenceNumber 
    })));
    console.log('Existing locations:', existing.locations.map(l => ({ 
      id: l.id, 
      seq: l.sequenceNumber, 
      name: l.name 
    })));

    // IMPORTANT: Delete all existing locations and recreate them in the correct order
    // This avoids unique constraint violations on (tourPackageId, sequenceNumber)
    // when sequence numbers are reordered
    console.log('🗑️ Deleting all existing locations for tour:', id);
    const deletedCount = await db.tourLocation.deleteMany({
      where: { tourPackageId: id },
    });
    console.log('✅ Deleted', deletedCount.count, 'locations');

    // Verify deletion
    const countAfterDelete = await db.tourLocation.count({
      where: { tourPackageId: id },
    });
    console.log('🔍 Locations remaining after delete:', countAfterDelete);
    
    if (countAfterDelete > 0) {
      throw new Error(`Failed to delete all locations. ${countAfterDelete} locations still exist!`);
    }

    // Now recreate all locations with correct sequence numbers
    console.log('🆕 Creating new locations...');
    for (let i = 0; i < incomingLocations.length; i++) {
      const loc = incomingLocations[i];
      
      // Verify sequence number is not duplicated
      const duplicateCheck = incomingLocations.slice(i + 1).find((l: any) => l.sequenceNumber === loc.sequenceNumber);
      if (duplicateCheck) {
        throw new Error(`Duplicate sequence number ${loc.sequenceNumber} detected at positions ${i} and ${incomingLocations.indexOf(duplicateCheck)}`);
      }

      const locationData = {
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
        tourPackageId: id,
      };

      console.log(`Creating location ${i + 1}/${incomingLocations.length}:`, { 
        name: loc.name, 
        sequenceNumber: loc.sequenceNumber,
        tourPackageId: id 
      });
      
      try {
        const created = await db.tourLocation.create({
          data: locationData,
        });
        console.log(`✅ Location ${i + 1} created with ID:`, created.id);
      } catch (error) {
        console.error(`❌ Error creating location ${i + 1}:`, error);
        console.error('Location data that failed:', locationData);
        throw error;
      }
    }

    const tourPackage = await db.tourPackage.update({
      where: { id },
      data: {
        name: body.name || existing.name,
        slug: body.slug || existing.slug,
        description: body.description !== undefined ? body.description : existing.description,
        summary: body.summary !== undefined ? body.summary : existing.summary,
        tourType: body.tourType || existing.tourType,
        duration: body.duration || existing.duration,
        durationDays: body.durationDays || existing.durationDays,
        minGroupSize: body.minGroupSize || existing.minGroupSize,
        maxGroupSize: body.maxGroupSize || existing.maxGroupSize,
        defaultGroupSize: body.defaultGroupSize || existing.defaultGroupSize,
        islandsCovered: body.islandsCovered || existing.islandsCovered,
        departureLocation: body.departureLocation || existing.departureLocation,
        returnLocation: body.returnLocation !== undefined ? body.returnLocation : existing.returnLocation,
        availableDays: body.availableDays || existing.availableDays,
        departureTime: body.departureTime || existing.departureTime,
        returnTime: body.returnTime || existing.returnTime,
        seasonalAvailability: body.seasonalAvailability !== undefined ? body.seasonalAvailability : existing.seasonalAvailability,
        seasonStart: body.seasonStart !== undefined ? body.seasonStart : existing.seasonStart,
        seasonEnd: body.seasonEnd !== undefined ? body.seasonEnd : existing.seasonEnd,
        offSeasonAvailable: body.offSeasonAvailable !== undefined ? body.offSeasonAvailable : existing.offSeasonAvailable,
        includedServices: body.includedServices || existing.includedServices,
        excludedServices: body.excludedServices || existing.excludedServices,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : existing.imageUrl,
        gallery: body.gallery || existing.gallery,
        isPublished: body.isPublished !== undefined ? body.isPublished : existing.isPublished,
        isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
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

    return NextResponse.json(tourPackage);
  } catch (error) {
    console.error('Error updating tour package:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to update tour package';
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Delete tour package
export async function DELETE(
  req: NextRequest,
  { params }: { params: Params }
) {
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

    const { id } = await params;

    const tourPackage = await db.tourPackage.findUnique({
      where: { id },
    });

    if (!tourPackage) {
      return NextResponse.json(
        { error: 'Tour package not found' },
        { status: 404 }
      );
    }

    await db.tourPackage.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Tour package deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting tour package:', error);
    return NextResponse.json(
      { error: 'Failed to delete tour package' },
      { status: 500 }
    );
  }
}
