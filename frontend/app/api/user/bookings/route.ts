import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

/**
 * GET /api/user/bookings
 * Fetches user's booking history with filtering and pagination
 *
 * Query parameters:
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 10, max: 50)
 * - status: Filter by booking status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
 * - startDate: Filter bookings from date (ISO string)
 * - endDate: Filter bookings to date (ISO string)
 * - search: Search by reference number or location
 */
export async function GET(req: NextRequest) {
  try {
    // Get current session
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = Math.min(
      parseInt(searchParams.get('pageSize') || '10', 10),
      50 // Maximum 50 items per page
    )
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')

    // Validate pagination
    if (page < 1 || pageSize < 1) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      )
    }

    // Get user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Build query filters
    const filters: any = {
      userId: user.id,
    }

    // Status filter
    if (status) {
      filters.status = status
    }

    // Date range filter
    if (startDate || endDate) {
      filters.createdAt = {}
      if (startDate) {
        filters.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        const endOfDay = new Date(endDate)
        endOfDay.setHours(23, 59, 59, 999)
        filters.createdAt.lte = endOfDay
      }
    }

    // Text search filter (reference number or locations in details)
    const whereClause: any = {
      ...filters,
    }

    if (search) {
      whereClause.OR = [
        {
          referenceNumber: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          requestNumber: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ]
    }

    // Get total count
    const total = await db.booking.count({
      where: whereClause,
    })

    // Calculate pagination
    const skip = (page - 1) * pageSize
    const totalPages = Math.ceil(total / pageSize)

    // Fetch bookings
    const bookings = await db.booking.findMany({
      where: whereClause,
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    })

    // Format response
    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      referenceNumber: booking.referenceNumber,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      details: booking.details,
      paymentAmount: booking.paymentAmount,
      paymentMethod: booking.paymentMethod,
      paymentDate: booking.paymentDate,
      payments: booking.payments,
    }))

    return NextResponse.json(
      {
        bookings: formattedBookings,
        total,
        page,
        pageSize,
        totalPages,
        hasMore: page < totalPages,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
