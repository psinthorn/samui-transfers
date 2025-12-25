import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/app/api/utils/api-response'

/**
 * Create a multi-service booking bundle
 * Request body should include:
 * - userId: string
 * - services: Array of { serviceType, serviceBookingId, details }
 * - bundleDiscount: number (percentage)
 * - totalAmount: Decimal
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      userId,
      services = [],
      bundleDiscount = 0,
      totalAmount,
      details = {},
    } = body

    // Validate required fields
    if (!userId || !services || services.length === 0) {
      return errorResponse(
        'userId and services array are required',
        400
      )
    }

    if (services.length < 2) {
      return errorResponse('Bundle must include at least 2 services', 400)
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    if (!user) {
      return errorResponse('User not found', 404)
    }

    // Validate all services exist and collect their data
    const validatedServices: any[] = []
    let calculatedTotal = 0

    for (const service of services) {
      const { serviceType, serviceBookingId } = service

      // Map service types to models
      switch (serviceType) {
        case 'BOAT': {
          const speedboatBooking = await prisma.speedboatBooking.findUnique({
            where: { id: serviceBookingId },
            include: { 
              speedboat: { select: { id: true, name: true } },
              booking: { select: { paymentAmount: true } }
            },
          })
          if (!speedboatBooking) {
            return errorResponse(`Speedboat booking ${serviceBookingId} not found`, 404)
          }
          const amount = Number(speedboatBooking.booking?.paymentAmount || 0)
          validatedServices.push({
            serviceType: 'BOAT',
            serviceBookingId,
            amount,
            booking: speedboatBooking,
          })
          calculatedTotal += amount
          break
        }

        case 'TOUR': {
          const tourBooking = await prisma.tourBooking.findUnique({
            where: { id: serviceBookingId },
            include: { 
              tourPackage: { select: { id: true, name: true } },
              booking: { select: { paymentAmount: true } }
            },
          })
          if (!tourBooking) {
            return errorResponse(`Tour booking ${serviceBookingId} not found`, 404)
          }
          const amount = Number(tourBooking.booking?.paymentAmount || 0)
          validatedServices.push({
            serviceType: 'TOUR',
            serviceBookingId,
            amount,
            booking: tourBooking,
          })
          calculatedTotal += amount
          break
        }

        case 'EVENT': {
          const eventBooking = await prisma.eventBooking.findUnique({
            where: { id: serviceBookingId },
            include: { 
              event: { select: { id: true, name: true } },
              booking: { select: { paymentAmount: true } }
            },
          })
          if (!eventBooking) {
            return errorResponse(`Event booking ${serviceBookingId} not found`, 404)
          }
          const amount = Number(eventBooking.booking?.paymentAmount || 0)
          validatedServices.push({
            serviceType: 'EVENT',
            serviceBookingId,
            amount,
            booking: eventBooking,
          })
          calculatedTotal += amount
          break
        }

        default:
          return errorResponse(`Invalid service type: ${serviceType}`, 400)
      }
    }

    // Apply bundle discount
    const discountAmount = calculatedTotal * (bundleDiscount / 100)
    const finalAmount = calculatedTotal - discountAmount

    // Create parent bundle booking
    const bundleBooking = await prisma.booking.create({
      data: {
        userId,
        serviceType: 'PACKAGE',
        isBundle: true,
        paymentStatus: 'PENDING',
        paymentAmount: finalAmount,
        status: 'PENDING',
        details: {
          ...details,
          services: validatedServices.map((s) => ({
            serviceType: s.serviceType,
            serviceBookingId: s.serviceBookingId,
            amount: s.amount,
          })),
          bundleDiscount,
          discountAmount,
          subtotal: calculatedTotal,
          total: finalAmount,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    // Update child bookings to link to parent
    for (const service of validatedServices) {
      if (service.serviceType === 'BOAT') {
        await prisma.speedboatBooking.update({
          where: { id: service.serviceBookingId },
          data: { bookingId: bundleBooking.id },
        })
      } else if (service.serviceType === 'TOUR') {
        await prisma.tourBooking.update({
          where: { id: service.serviceBookingId },
          data: { bookingId: bundleBooking.id },
        })
      } else if (service.serviceType === 'EVENT') {
        await prisma.eventBooking.update({
          where: { id: service.serviceBookingId },
          data: { bookingId: bundleBooking.id },
        })
      }
    }

    return successResponse(
      {
        ...bundleBooking,
        services: validatedServices.map((s) => ({
          serviceType: s.serviceType,
          serviceBookingId: s.serviceBookingId,
          amount: s.amount,
        })),
      },
      'Multi-service bundle created successfully',
      201
    )
  } catch (error) {
    console.error('Error creating multi-service booking:', error)
    return errorResponse('Failed to create multi-service booking', 500)
  }
}

/**
 * Get all bundle bookings with filters
 */
export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20')
    const userId = req.nextUrl.searchParams.get('userId')
    const status = req.nextUrl.searchParams.get('status')

    const skip = (page - 1) * limit

    const where: any = { isBundle: true }
    if (userId) where.userId = userId
    if (status) where.status = status

    const total = await prisma.booking.count({ where })

    const bundles = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        childBookings: {
          select: {
            id: true,
            serviceType: true,
            status: true,
            paymentAmount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    return successResponse(
      {
        data: bundles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      'Bundle bookings retrieved successfully'
    )
  } catch (error) {
    console.error('Error fetching bundle bookings:', error)
    return errorResponse('Failed to retrieve bundle bookings', 500)
  }
}
