import { NextRequest } from 'next/server'
import { Decimal } from '@prisma/client/runtime/library'
import { prisma } from '@/lib/prisma'
import { successResponse, handleApiError, ApiError, errorResponse } from '@/app/api/utils/api-response'
import { validateId, validatePrice } from '@/app/api/utils/validation'

type Params = Promise<{ id: string }>

/**
 * GET /api/speedboat-rates/[id]
 * Retrieve a specific speedboat rate by ID
 *
 * Response: SpeedboatRate object with speedboat relation
 */
export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params

    validateId(id)

    const rate = await prisma.speedboatRate.findUnique({
      where: { id },
      include: { speedboat: true },
    })

    if (!rate) {
      throw new ApiError(404, 'Speedboat rate not found')
    }

    return successResponse(rate, 'Speedboat rate retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PUT /api/speedboat-rates/[id]
 * Update a speedboat rate
 *
 * Optional Fields:
 * - basePrice, pricePerPerson, duration, minCapacity, maxCapacity
 * - fuelSurcharge, crewCost, capacityDiscount
 * - isSeasonalRate, seasonStart, seasonEnd, seasonMultiplier
 * - validFrom, validUntil, serviceType
 *
 * Response: Updated SpeedboatRate object
 */
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params
    const body = await req.json()

    validateId(id)

    // Check if rate exists
    const rate = await prisma.speedboatRate.findUnique({
      where: { id },
      include: { speedboat: true },
    })

    if (!rate) {
      throw new ApiError(404, 'Speedboat rate not found')
    }

    // Check for empty update
    if (Object.keys(body).length === 0) {
      return errorResponse('No fields to update', 400)
    }

    const {
      basePrice,
      pricePerPerson,
      duration,
      minCapacity,
      maxCapacity,
      fuelSurcharge,
      crewCost,
      capacityDiscount,
      isSeasonalRate,
      seasonStart,
      seasonEnd,
      seasonMultiplier,
      validFrom,
      validUntil,
      serviceType,
    } = body

    // Validate prices if provided
    const updateData: any = {}

    if (basePrice !== undefined) {
      updateData.basePrice = new Decimal(validatePrice(basePrice, 'Base price'))
    }

    if (pricePerPerson !== undefined) {
      updateData.pricePerPerson = pricePerPerson ? new Decimal(validatePrice(pricePerPerson, 'Price per person')) : null
    }

    if (fuelSurcharge !== undefined) {
      updateData.fuelSurcharge = fuelSurcharge ? new Decimal(validatePrice(fuelSurcharge, 'Fuel surcharge')) : null
    }

    if (crewCost !== undefined) {
      updateData.crewCost = crewCost ? new Decimal(validatePrice(crewCost, 'Crew cost')) : null
    }

    if (capacityDiscount !== undefined) {
      updateData.capacityDiscount = capacityDiscount ? new Decimal(validatePrice(capacityDiscount, 'Capacity discount')) : null
    }

    if (seasonMultiplier !== undefined) {
      updateData.seasonMultiplier = new Decimal(validatePrice(seasonMultiplier, 'Season multiplier'))
    }

    // Validate capacity constraints
    const newMinCap = minCapacity !== undefined ? minCapacity : rate.minCapacity
    const newMaxCap = maxCapacity !== undefined ? maxCapacity : rate.maxCapacity

    if (newMinCap >= newMaxCap) {
      return errorResponse('Min capacity must be less than max capacity', 400)
    }

    if (minCapacity !== undefined) updateData.minCapacity = minCapacity
    if (maxCapacity !== undefined) updateData.maxCapacity = maxCapacity
    if (duration !== undefined) updateData.duration = duration
    if (serviceType !== undefined) updateData.serviceType = serviceType
    if (isSeasonalRate !== undefined) updateData.isSeasonalRate = isSeasonalRate
    if (seasonStart !== undefined) updateData.seasonStart = seasonStart
    if (seasonEnd !== undefined) updateData.seasonEnd = seasonEnd

    if (validFrom !== undefined) updateData.validFrom = new Date(validFrom)
    if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null

    const updatedRate = await prisma.speedboatRate.update({
      where: { id },
      data: updateData,
      include: { speedboat: true },
    })

    return successResponse(updatedRate, 'Speedboat rate updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/speedboat-rates/[id]
 * Soft delete a speedboat rate (mark validUntil to today)
 *
 * Response: Deleted SpeedboatRate object with updated validUntil
 *
 * Note: This is a soft delete. The record is marked as expired by setting
 * validUntil to today. To retrieve only active rates, filter with
 * validUntil >= today in GET requests.
 */
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params

    validateId(id)

    // Check if rate exists
    const rate = await prisma.speedboatRate.findUnique({
      where: { id },
    })

    if (!rate) {
      throw new ApiError(404, 'Speedboat rate not found')
    }

    // Soft delete: set validUntil to today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const deletedRate = await prisma.speedboatRate.update({
      where: { id },
      data: {
        validUntil: today,
      },
      include: { speedboat: true },
    })

    return successResponse(deletedRate, 'Speedboat rate deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
