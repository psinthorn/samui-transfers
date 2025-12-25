import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/app/api/utils/api-response'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const rate = await prisma.serviceRate.findUnique({
      where: { id },
    })

    if (!rate) {
      return errorResponse('Service rate not found', 404)
    }

    return successResponse(rate, 'Service rate retrieved successfully')
  } catch (error) {
    console.error('Error fetching service rate:', error)
    return errorResponse('Failed to retrieve service rate', 500)
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    // Verify rate exists
    const existingRate = await prisma.serviceRate.findUnique({
      where: { id },
    })

    if (!existingRate) {
      return errorResponse('Service rate not found', 404)
    }

    // Prepare update data
    const updateData: any = {}

    if (body.vehicleType !== undefined) updateData.vehicleType = body.vehicleType
    if (body.description !== undefined) updateData.description = body.description
    if (body.basePrice !== undefined) {
      if (body.basePrice < 0) return errorResponse('basePrice must be positive', 400)
      updateData.basePrice = body.basePrice
    }
    if (body.distanceRate !== undefined) {
      if (body.distanceRate < 0) return errorResponse('distanceRate must be positive', 400)
      updateData.distanceRate = body.distanceRate
    }
    if (body.minDistance !== undefined) updateData.minDistance = body.minDistance
    if (body.maxDistance !== undefined) updateData.maxDistance = body.maxDistance
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    // Update rate
    const updated = await prisma.serviceRate.update({
      where: { id },
      data: updateData,
    })

    return successResponse(updated, 'Service rate updated successfully')
  } catch (error) {
    console.error('Error updating service rate:', error)
    return errorResponse('Failed to update service rate', 500)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify rate exists
    const rate = await prisma.serviceRate.findUnique({
      where: { id },
    })

    if (!rate) {
      return errorResponse('Service rate not found', 404)
    }

    // Soft delete by marking as inactive
    await prisma.serviceRate.update({
      where: { id },
      data: { isActive: false },
    })

    return successResponse(
      { id },
      'Service rate deleted successfully'
    )
  } catch (error) {
    console.error('Error deleting service rate:', error)
    return errorResponse('Failed to delete service rate', 500)
  }
}
