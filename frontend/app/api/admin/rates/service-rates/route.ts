/**
 * Service Rates CRUD Endpoints
 * GET /api/admin/rates/service-rates - Get all service rates
 * POST /api/admin/rates/service-rates - Create new service rate
 * PUT /api/admin/rates/service-rates/:id - Update service rate
 * DELETE /api/admin/rates/service-rates/:id - Delete service rate
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';

// Verify admin authorization (basic check)
async function verifyAdminAccess(request: NextRequest) {
  // In a real app, you'd check JWT token and verify admin role
  const authHeader = request.headers.get('authorization');
  // TODO: Implement proper JWT verification
  return true;
}

export async function GET(request: NextRequest) {
  try {
    if (!(await verifyAdminAccess(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const serviceRates = await db.serviceRate.findMany({
      orderBy: { vehicleType: 'asc' },
    });

    const transformedRates = serviceRates.map((rate) => ({
      ...rate,
      basePrice: rate.basePrice.toString(),
      distanceRate: rate.distanceRate.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: transformedRates,
    });
  } catch (error) {
    console.error('Error fetching service rates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAdminAccess(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      vehicleType,
      basePrice,
      distanceRate,
      minDistance,
      maxDistance,
      description,
    } = await request.json();

    // Validate input
    if (!vehicleType || basePrice === undefined || distanceRate === undefined || minDistance === undefined) {
      return NextResponse.json(
        {
          error: 'Missing required fields: vehicleType, basePrice, distanceRate, minDistance',
        },
        { status: 400 }
      );
    }

    // Check for duplicates
    const existing = await db.serviceRate.findFirst({
      where: { vehicleType: vehicleType.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Service rate for ${vehicleType} already exists` },
        { status: 409 }
      );
    }

    const newRate = await db.serviceRate.create({
      data: {
        vehicleType: vehicleType.toUpperCase(),
        basePrice: new Decimal(basePrice),
        distanceRate: new Decimal(distanceRate),
        minDistance: parseInt(minDistance),
        maxDistance: maxDistance ? parseInt(maxDistance) : null,
        description,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...newRate,
        basePrice: newRate.basePrice.toString(),
        distanceRate: newRate.distanceRate.toString(),
      },
    });
  } catch (error) {
    console.error('Error creating service rate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await verifyAdminAccess(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, basePrice, distanceRate, minDistance, maxDistance, isActive, description } =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (basePrice !== undefined) updateData.basePrice = new Decimal(basePrice);
    if (distanceRate !== undefined) updateData.distanceRate = new Decimal(distanceRate);
    if (minDistance !== undefined) updateData.minDistance = parseInt(minDistance);
    if (maxDistance !== undefined) updateData.maxDistance = maxDistance ? parseInt(maxDistance) : null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (description !== undefined) updateData.description = description;

    const updated = await db.serviceRate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        basePrice: updated.basePrice.toString(),
        distanceRate: updated.distanceRate.toString(),
      },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Service rate not found' },
        { status: 404 }
      );
    }
    console.error('Error updating service rate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await verifyAdminAccess(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id' },
        { status: 400 }
      );
    }

    await db.serviceRate.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Service rate deleted',
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Service rate not found' },
        { status: 404 }
      );
    }
    console.error('Error deleting service rate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
