import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/app/api/utils/api-response'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignments: {
          select: {
            id: true,
            bookingId: true,
            assignmentStatus: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        ratings: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        speedboatAssignments: {
          select: {
            id: true,
            speedboat: { select: { id: true, name: true } },
            status: true,
            assignedDate: true,
          },
          take: 5,
        },
      },
    })

    if (!driver) {
      return errorResponse('Driver not found', 404)
    }

    return successResponse(driver, 'Driver retrieved successfully')
  } catch (error) {
    console.error('Error fetching driver:', error)
    return errorResponse('Failed to retrieve driver', 500)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    // Verify driver exists
    const existingDriver = await prisma.driver.findUnique({
      where: { id },
    })

    if (!existingDriver) {
      return errorResponse('Driver not found', 404)
    }

    // Prepare update data
    const updateData: any = {}

    if (body.status !== undefined) updateData.status = body.status
    if (body.acceptingRides !== undefined)
      updateData.acceptingRides = body.acceptingRides
    if (body.isBoatOperator !== undefined)
      updateData.isBoatOperator = body.isBoatOperator
    if (body.isTourGuide !== undefined) updateData.isTourGuide = body.isTourGuide
    if (body.licenseExpiry !== undefined)
      updateData.licenseExpiry = body.licenseExpiry
        ? new Date(body.licenseExpiry)
        : null
    if (body.licenseVerified !== undefined)
      updateData.licenseVerified = body.licenseVerified

    // Handle certifications update (merge with existing)
    if (body.certifications !== undefined) {
      updateData.certifications = {
        ...(existingDriver.certifications as any),
        ...body.certifications,
      }
    }

    // Update driver
    const updated = await prisma.driver.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        speedboatAssignments: {
          select: {
            id: true,
            speedboat: { select: { id: true, name: true } },
            status: true,
          },
          take: 5,
        },
      },
    })

    return successResponse(updated, 'Driver updated successfully')
  } catch (error) {
    console.error('Error updating driver:', error)
    return errorResponse('Failed to update driver', 500)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify driver exists
    const driver = await prisma.driver.findUnique({
      where: { id },
    })

    if (!driver) {
      return errorResponse('Driver not found', 404)
    }

    // Soft delete by setting status to "deleted" or similar
    // Don't actually delete to preserve historical records
    await prisma.driver.update({
      where: { id },
      data: {
        status: 'deleted',
        acceptingRides: false,
      },
    })

    return successResponse(
      { id },
      'Driver deleted successfully'
    )
  } catch (error) {
    console.error('Error deleting driver:', error)
    return errorResponse('Failed to delete driver', 500)
  }
}
