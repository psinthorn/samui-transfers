/**
 * Tour Location Approval API Route
 * POST /api/tour-locations/:id/approve
 * 
 * Admin endpoint to approve/reject tour location content
 * Updates contentApproved status and approval metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

type Params = Promise<{ id: string }>;

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { approve, notes } = body;

    // Validate ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'INVALID_ID', message: 'Invalid location ID' },
        { status: 400 }
      );
    }

    // Validate approval status
    if (approve !== true && approve !== false) {
      return NextResponse.json(
        { success: false, error: 'INVALID_STATUS', message: 'Approve must be boolean' },
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

    // Update approval status
    const updated = await prisma.tourLocation.update({
      where: { id },
      data: {
        contentApproved: approve,
        approvedBy: approve ? session.user.email : null,
        approvedAt: approve ? new Date() : null,
        notes: notes || location.notes,
      },
      include: {
        tourPackage: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log approval action
    console.log(`Location ${approve ? 'approved' : 'rejected'}: ${updated.name} by ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: `Location ${approve ? 'approved' : 'rejected'} successfully`,
      data: {
        id: updated.id,
        name: updated.name,
        contentApproved: updated.contentApproved,
        approvedBy: updated.approvedBy,
        approvedAt: updated.approvedAt,
        tourPackage: updated.tourPackage,
      },
    });
  } catch (error) {
    console.error('Error approving tour location:', error);
    return NextResponse.json(
      { success: false, error: 'DATABASE_ERROR', message: 'Failed to approve location' },
      { status: 500 }
    );
  }
}
