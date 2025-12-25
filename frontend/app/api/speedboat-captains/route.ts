import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/app/api/utils/api-response'

export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20')
    const speedboatId = req.nextUrl.searchParams.get('speedboatId')
    const captainId = req.nextUrl.searchParams.get('captainId')
    const status = req.nextUrl.searchParams.get('status')

    const skip = (page - 1) * limit

    // Build filter
    const where: any = {}
    if (speedboatId) where.speedboatId = speedboatId
    if (captainId) where.captainId = captainId
    if (status) where.status = status

    // Get total count
    const total = await prisma.speedboatCaptainAssignment.count({ where })

    // Get assignments with related data
    const assignments = await prisma.speedboatCaptainAssignment.findMany({
      where,
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
      orderBy: { assignedDate: 'desc' },
      skip,
      take: limit,
    })

    return successResponse(
      {
        data: assignments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      'Captain assignments retrieved successfully',
      200
    )
  } catch (error) {
    console.error('Error fetching captain assignments:', error)
    return errorResponse('Failed to retrieve captain assignments', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      speedboatId,
      captainId,
      boatOperatorLicense,
      licenseExpiry,
      safetyTraining,
      safetyTrainingExpiry,
      status = 'ACTIVE',
    } = body

    // Validate required fields
    if (!speedboatId || !captainId) {
      return errorResponse('speedboatId and captainId are required', 400)
    }

    // Verify speedboat exists
    const speedboat = await prisma.speedboat.findUnique({
      where: { id: speedboatId },
    })
    if (!speedboat) {
      return errorResponse('Speedboat not found', 404)
    }

    // Verify captain exists
    const captain = await prisma.driver.findUnique({
      where: { id: captainId },
    })
    if (!captain) {
      return errorResponse('Captain not found', 404)
    }

    // Check for existing active assignment
    const existingAssignment = await prisma.speedboatCaptainAssignment.findFirst({
      where: {
        speedboatId,
        captainId,
        status: 'ACTIVE',
      },
    })

    if (existingAssignment) {
      return errorResponse(
        'This captain is already assigned to this speedboat',
        409
      )
    }

    // Create assignment
    const assignment = await prisma.speedboatCaptainAssignment.create({
      data: {
        speedboatId,
        captainId,
        boatOperatorLicense: boatOperatorLicense || false,
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null,
        safetyTraining: safetyTraining || false,
        safetyTrainingExpiry: safetyTrainingExpiry
          ? new Date(safetyTrainingExpiry)
          : null,
        status,
      },
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

    return successResponse(assignment, 'Captain assigned successfully', 201)
  } catch (error) {
    console.error('Error creating captain assignment:', error)
    return errorResponse('Failed to assign captain', 500)
  }
}
