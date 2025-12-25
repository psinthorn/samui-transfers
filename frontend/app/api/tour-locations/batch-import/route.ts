/**
 * Tour Locations Batch Import API Route
 * POST /api/tour-locations/batch-import
 * 
 * Admin endpoint to bulk import tour locations from CSV
 * Validates data, handles errors gracefully, returns success/failure report
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

interface BatchLocationInput {
  name: string;
  type: string;
  sequenceNumber: number;
  latitude: number;
  longitude: number;
  island: string;
  address?: string;
  title?: string;
  description?: string;
  shortDescription?: string;
  imageUrl?: string;
  keywords?: string; // comma-separated
  seoTags?: string; // comma-separated
  highlights?: string; // comma-separated
  skillLevel?: string;
  durationMinutes?: number;
  arrivalTime?: string;
  departureTime?: string;
}

interface ImportResult {
  index: number;
  name: string;
  success: boolean;
  id?: string;
  error?: string;
}

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
    const { tourPackageId, locations } = body;

    // Validate package ID
    if (!tourPackageId || typeof tourPackageId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'INVALID_PACKAGE', message: 'Valid tourPackageId required' },
        { status: 400 }
      );
    }

    // Validate locations array
    if (!Array.isArray(locations) || locations.length === 0) {
      return NextResponse.json(
        { success: false, error: 'INVALID_DATA', message: 'Locations array required (non-empty)' },
        { status: 400 }
      );
    }

    if (locations.length > 100) {
      return NextResponse.json(
        { success: false, error: 'TOO_MANY', message: 'Maximum 100 locations per import' },
        { status: 400 }
      );
    }

    // Verify tour package exists
    const tourPackage = await prisma.tourPackage.findUnique({
      where: { id: tourPackageId },
    });

    if (!tourPackage) {
      return NextResponse.json(
        { success: false, error: 'PACKAGE_NOT_FOUND', message: 'Tour package not found' },
        { status: 404 }
      );
    }

    const results: ImportResult[] = [];
    let successCount = 0;
    let failureCount = 0;

    // Process each location
    for (let i = 0; i < locations.length; i++) {
      const item = locations[i];
      const result: ImportResult = {
        index: i + 1,
        name: item.name || `Location ${i + 1}`,
        success: false,
      };

      try {
        // Validate required fields
        if (!item.name || typeof item.name !== 'string') {
          throw new Error('Name is required');
        }

        if (!item.type || typeof item.type !== 'string') {
          throw new Error('Type is required');
        }

        if (item.sequenceNumber === undefined || item.sequenceNumber === null) {
          throw new Error('Sequence number is required');
        }

        if (item.latitude === undefined || item.latitude === null) {
          throw new Error('Latitude is required');
        }

        if (item.longitude === undefined || item.longitude === null) {
          throw new Error('Longitude is required');
        }

        // Validate coordinates
        const lat = parseFloat(String(item.latitude));
        const lng = parseFloat(String(item.longitude));

        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          throw new Error('Invalid latitude/longitude values');
        }

        // Generate slug from name
        const slug = item.name
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        // Check for duplicate slug
        const existingSlug = await prisma.tourLocation.findFirst({
          where: {
            tourPackageId,
            slug,
          },
        });

        if (existingSlug) {
          throw new Error(`Slug "${slug}" already exists in this tour`);
        }

        // Parse comma-separated arrays
        const parseCSV = (value: string | undefined) =>
          value ? value.split(',').map((v) => v.trim()).filter(Boolean) : [];

        // Create location
        const created = await prisma.tourLocation.create({
          data: {
            tourPackageId,
            name: item.name,
            slug,
            type: item.type,
            sequenceNumber: parseInt(String(item.sequenceNumber), 10),
            latitude: lat.toString(),
            longitude: lng.toString(),
            island: item.island || '',
            address: item.address,
            title: item.title,
            description: item.description,
            shortDescription: item.shortDescription,
            imageUrl: item.imageUrl,
            keywords: JSON.stringify(parseCSV(item.keywords)),
            seoTags: JSON.stringify(parseCSV(item.seoTags)),
            highlights: JSON.stringify(parseCSV(item.highlights)),
            skillLevel: item.skillLevel,
            durationMinutes: item.durationMinutes ? parseInt(String(item.durationMinutes), 10) : null,
            arrivalTime: item.arrivalTime,
            departureTime: item.departureTime,
            isActive: true,
            visibility: 'DRAFT',
            contentApproved: false,
          },
        });

        result.success = true;
        result.id = created.id;
        successCount++;
      } catch (error) {
        result.success = false;
        result.error = error instanceof Error ? error.message : 'Unknown error';
        failureCount++;
      }

      results.push(result);
    }

    return NextResponse.json({
      success: failureCount === 0,
      message: `Import completed: ${successCount} successful, ${failureCount} failed`,
      data: {
        tourPackageId,
        totalProcessed: locations.length,
        successCount,
        failureCount,
        results,
      },
    });
  } catch (error) {
    console.error('Error importing tour locations:', error);
    return NextResponse.json(
      { success: false, error: 'IMPORT_ERROR', message: 'Failed to import locations' },
      { status: 500 }
    );
  }
}
