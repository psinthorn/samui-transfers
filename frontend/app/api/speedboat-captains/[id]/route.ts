import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/app/api/utils/api-response'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const assignment = await prisma.speedboatCaptainAssignment.findUnique({
      where: { id },
      include: {
        speedboat: {
          select: {
            id: true,
            name: true,
            registrationNumber: true,
            capacity: true,
          },
        },
        captain: {
          select: {
            id: true,
            licenseNumber: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!assignment) {
      return errorResponse('Captain assignment not found', 404)
    }

    return successResponse(assignment, 'Captain assignment retrieved', 200)
  } catch (error) {
    console.error('Error fetching captain assignment:', error)
    return errorResponse('Failed to retrieve captain assignment', 500)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    // Verify assignment exists
    const existingAssignment =
      await prisma.speedboatCaptainAssignment.findUnique({
        where: { id },
      })

    if (!existingAssignment) {
      return errorResponse('Captain assignment not found', 404)
    }

    // Prepare update data
    const updateData: any = {}

    if (body.status !== undefined) updateData.status = body.status
    if (body.boatOperatorLicense !== undefined)
      updateData.boatOperatorLicense = body.boatOperatorLicense
    if (body.licenseExpiry !== undefined)
      updateData.licenseExpiry = body.licenseExpiry
        ? new Date(body.licenseExpiry)
        : null
    if (body.safetyTraining !== undefined)
      updateData.safetyTraining = body.safetyTraining
    if (body.safetyTrainingExpiry !== undefined)
      updateData.safetyTrainingExpiry = body.safetyTrainingExpiry
        ? new Date(body.safetyTrainingExpiry)
        : null

    // Update assignment
    const updated = await prisma.speedboatCaptainAssignment.update({
      where: { id },
      data: updateData,
      include: {
        speedboat: {
          select: {
            id: true,
            name: true,
            registrationNumber: true,
          },
        },
        captain: {
          select: {
            id: true,
            licenseNumber: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return successResponse(updated, 'Captain assignment updated', 200)
  } catch (error) {
    console.error('Error updating captain assignment:', error)
    return errorResponse('Failed to update captain assignment', 500)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify assignment exists
    const assignment = await prisma.speedboatCaptainAssignment.findUnique({
      where: { id },
    })

    if (!assignment) {
      return errorResponse('Captain assignment not found', 404)
    }

    // Delete assignment
    await prisma.speedboatCaptainAssignment.delete({
      where: { id },
    })

    return successResponse(
      { id },
      'Captain assignment deleted successfully',
      200
    )
  } catch (error) {
    console.error('Error deleting captain assignment:', error)
    return errorResponse('Failed to delete captain assignment', 500)
  }
}
