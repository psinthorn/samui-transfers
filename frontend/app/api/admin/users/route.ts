import { NextResponse } from 'next/server'
import { requireRole } from '@/components/utilities/requireRole'
import prisma from '@/components/utilities/db'

export async function GET() {
  const gate = await requireRole(['ADMIN'])
  if (!gate.allowed) return NextResponse.json({ error: gate.reason }, { status: gate.reason === 'UNAUTHENTICATED' ? 401 : 403 })
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, createdAt: true } })
  return NextResponse.json(users)
}
