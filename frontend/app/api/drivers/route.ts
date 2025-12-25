import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/app/api/utils/api-response'

export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20')
    const status = req.nextUrl.searchParams.get('status')
    const isBoatOperator = req.nextUrl.searchParams.get('isBoatOperator')
    const isTourGuide = req.nextUrl.searchParams.get('isTourGuide')

    const skip = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status
    if (isBoatOperator === 'true') where.isBoatOperator = true
    if (isTourGuide === 'true') where.isTourGuide = true

    const total = await prisma.driver.count({ where })

    const drivers = await prisma.driver.findMany({
      where,
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
          },
          take: 5,
        },
        ratings: {
          select: {
            rating: true,
            comment: true,
          },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    return successResponse(
      {
        data: drivers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      'Drivers retrieved successfully'
    )
  } catch (error) {
    console.error('Error fetching drivers:', error)
    return errorResponse('Failed to retrieve drivers', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      userId,
      licenseNumber,
      licenseExpiry,
      isBoatOperator = false,
      isTourGuide = false,
      certifications = {},
    } = body

    // Validate required fields
    if (!userId || !licenseNumber) {
      return errorResponse('userId and licenseNumber are required', 400)
    }

    // Check for duplicate license number
    const existingLicense = await prisma.driver.findUnique({
      where: { licenseNumber },
    })
    if (existingLicense) {
      return errorResponse('License number already registered', 409)
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    if (!user) {
      return errorResponse('User not found', 404)
    }

    // Create driver
    const driver = await prisma.driver.create({
      data: {
        userId,
        licenseNumber,
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null,
        isBoatOperator,
        isTourGuide,
        certifications: certifications || {},
        status: 'offline',
        acceptingRides: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return successResponse(driver, 'Driver registered successfully', 201)
  } catch (error) {
    console.error('Error creating driver:', error)
    return errorResponse('Failed to register driver', 500)
  }
}
