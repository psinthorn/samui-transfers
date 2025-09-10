import { NextResponse } from 'next/server'
import { requireRole } from '@/components/utilities/requireRole'
import prisma from '@/components/utilities/db'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const gate = await requireRole(['ADMIN'])
  if (!gate.allowed) return NextResponse.json({ error: gate.reason }, { status: gate.reason === 'UNAUTHENTICATED' ? 401 : 403 })
  const { role } = await req.json() as { role?: string }
  if (!role || !['USER','ADMIN'].includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  await prisma.user.update({ where: { id: params.id }, data: { role } })
  return NextResponse.json({ ok: true })
}
