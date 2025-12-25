import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/admin/tour-packages/[id]/quick-update
 * Quick update for tour type and services without full form
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { tourType, includedServices, excludedServices } = body;

    console.log('Quick update request:', {
      id,
      tourType,
      includedServices,
      excludedServices,
    });

    // Fetch current package
    const tourPackage = await prisma.tourPackage.findUnique({
      where: { id },
    });

    if (!tourPackage) {
      return NextResponse.json(
        { error: 'Tour package not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // Update tour type if provided
    if (tourType && tourType !== tourPackage.tourType) {
      updateData.tourType = tourType;
      console.log(`Updating tour type: ${tourPackage.tourType} → ${tourType}`);
    }

    // Update included services if provided
    if (includedServices !== undefined) {
      const servicesArray = Array.isArray(includedServices) ? includedServices : [];
      updateData.includedServices = servicesArray;
      console.log('Updating included services:', servicesArray);
    }

    // Update excluded services if provided
    if (excludedServices !== undefined) {
      const excludedArray = Array.isArray(excludedServices) ? excludedServices : [];
      // excludedServices is stored as JSON string in database
      const servicesJson = JSON.stringify(excludedArray);
      updateData.excludedServices = servicesJson;
      console.log('Updating excluded services:', excludedArray, 'as JSON:', servicesJson);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    console.log('Updating with data:', updateData);

    // Update the tour package
    const updated = await prisma.tourPackage.update({
      where: { id },
      data: updateData,
      include: {
        locations: {
          orderBy: { sequenceNumber: 'asc' },
        },
      },
    });

    console.log('Successfully updated tour package:', {
      id,
      tourType: updated.tourType,
      includedServices: updated.includedServices,
      excludedServices: updated.excludedServices,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Tour package updated successfully',
    });
  } catch (error) {
    console.error('Quick update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update tour package' },
      { status: 500 }
    );
  }
}
