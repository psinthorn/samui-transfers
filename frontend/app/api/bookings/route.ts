import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      userId,
      serviceType,
      serviceId,
      details,
      paymentAmount,
      paymentMethod,
      specialRequests,
    } = body

    // Validation
    if (!userId || !serviceType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and serviceType' },
        { status: 400 }
      )
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceType: serviceType.toUpperCase() || 'TRANSFER',
        serviceId: serviceId || null,
        details: details || {},
        paymentAmount: paymentAmount ? parseFloat(paymentAmount) : null,
        paymentMethod: paymentMethod || null,
        status: 'PENDING',
        paymentStatus: 'PENDING',
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

    return NextResponse.json(
      {
        success: true,
        data: {
          id: booking.id,
          referenceNumber: booking.referenceNumber || `BK-${booking.id.substring(0, 8).toUpperCase()}`,
          paymentAmount: booking.paymentAmount,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          createdAt: booking.createdAt,
        },
        message: 'Booking created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const serviceType = searchParams.get('serviceType')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (userId) where.userId = userId
    if (status) where.status = status.toUpperCase()
    if (serviceType) where.serviceType = serviceType.toUpperCase()

    // Get bookings
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          payments: {
            select: {
              id: true,
              status: true,
              amount: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.booking.count({ where }),
    ])

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        data: bookings,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      },
      message: 'Bookings retrieved successfully',
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
