import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    await requireAdmin()

    // Get database stats
    const [totalBookings, totalUsers, pendingBookings, confirmedBookings, lastBooking] = await Promise.all([
      (db as any).booking.count(),
      (db as any).user.count(),
      (db as any).booking.count({ where: { status: 'PENDING' } }),
      (db as any).booking.count({ where: { status: 'CONFIRMED' } }),
      (db as any).booking.findFirst({ 
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      })
    ])

    const projectStatus = {
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      lastUpdated: new Date().toISOString(),
      status: 'Production Ready' as const,
      database: {
        status: 'connected',
        totalBookings,
        totalUsers,
        pendingBookings,
        confirmedBookings,
        lastActivity: lastBooking?.createdAt || null
      },
      services: {
        openai: !!process.env.OPENAI_API_KEY,
        email: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
        googleMaps: !!process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        auth: !!(process.env.AUTH_SECRET && process.env.NEXTAUTH_URL)
      }
    }

    return NextResponse.json(projectStatus)
  } catch (error) {
    console.error('Project status error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project status' },
      { status: 500 }
    )
  }
}