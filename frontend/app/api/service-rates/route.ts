import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/app/api/utils/api-response'

export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20')
    const serviceType = req.nextUrl.searchParams.get('serviceType')
    const vehicleType = req.nextUrl.searchParams.get('vehicleType')
    const isActive = req.nextUrl.searchParams.get('isActive')

    const skip = (page - 1) * limit

    const where: any = {}
    if (serviceType) where.serviceType = serviceType
    if (vehicleType) where.vehicleType = vehicleType
    if (isActive === 'true') where.isActive = true
    if (isActive === 'false') where.isActive = false

    const total = await prisma.serviceRate.count({ where })

    const rates = await prisma.serviceRate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    return successResponse(
      {
        data: rates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      'Service rates retrieved successfully'
    )
  } catch (error) {
    console.error('Error fetching service rates:', error)
    return errorResponse('Failed to retrieve service rates', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      serviceType,
      vehicleType,
      basePrice,
      distanceRate,
      minDistance = 0,
      maxDistance,
      description,
      isActive = true,
    } = body

    // Validate required fields
    if (!serviceType || !vehicleType || basePrice === undefined || distanceRate === undefined) {
      return errorResponse(
        'serviceType, vehicleType, basePrice, and distanceRate are required',
        400
      )
    }

    // Validate service type
    const validServiceTypes = ['TRANSFER', 'BOAT', 'TOUR', 'EVENT', 'PACKAGE']
    if (!validServiceTypes.includes(serviceType)) {
      return errorResponse(
        `Invalid serviceType. Must be one of: ${validServiceTypes.join(', ')}`,
        400
      )
    }

    // Validate prices are positive
    if (basePrice < 0 || distanceRate < 0) {
      return errorResponse('Prices must be positive numbers', 400)
    }

    // Create service rate
    const rate = await prisma.serviceRate.create({
      data: {
        serviceType,
        vehicleType,
        basePrice,
        distanceRate,
        minDistance,
        maxDistance,
        description,
        isActive,
      },
    })

    return successResponse(rate, 'Service rate created successfully', 201)
  } catch (error) {
    console.error('Error creating service rate:', error)
    return errorResponse('Failed to create service rate', 500)
  }
}
