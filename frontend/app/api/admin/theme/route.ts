import { auth } from '@/auth'
import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

// GET - Fetch active theme
export async function GET(req: NextRequest) {
  try {
    const theme = await prisma.themeConfig.findFirst({
      where: { isActive: true }
    })

    if (!theme) {
      return NextResponse.json(
        { error: 'No active theme found' },
        { status: 404 }
      )
    }

    return NextResponse.json(theme)
  } catch (error) {
    console.error('Failed to fetch theme:', error)
    return NextResponse.json(
      { error: 'Failed to fetch theme' },
      { status: 500 }
    )
  }
}

// PUT - Update theme (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await req.json()
    const { name, colors, typography, spacing, borderRadius, shadows, components, description } = data

    const theme = await prisma.themeConfig.findFirst({
      where: { isActive: true }
    })

    if (!theme) {
      return NextResponse.json(
        { error: 'No active theme found' },
        { status: 404 }
      )
    }

    const updated = await prisma.themeConfig.update({
      where: { id: theme.id },
      data: {
        colors: colors || theme.colors,
        typography: typography || theme.typography,
        spacing: spacing || theme.spacing,
        borderRadius: borderRadius || theme.borderRadius,
        shadows: shadows || theme.shadows,
        components: components || theme.components,
        description: description || theme.description,
        updatedBy: session.user.email || 'unknown',
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update theme:', error)
    return NextResponse.json(
      { error: 'Failed to update theme' },
      { status: 500 }
    )
  }
}

// POST - Create new theme
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await req.json()
    const { name, colors, typography, spacing, borderRadius, shadows, components, description } = data

    const theme = await prisma.themeConfig.create({
      data: {
        name,
        colors,
        typography,
        spacing,
        borderRadius,
        shadows,
        components,
        description,
        isActive: false,
        createdBy: session.user.email || 'unknown',
      }
    })

    return NextResponse.json(theme)
  } catch (error) {
    console.error('Failed to create theme:', error)
    return NextResponse.json(
      { error: 'Failed to create theme' },
      { status: 500 }
    )
  }
}
