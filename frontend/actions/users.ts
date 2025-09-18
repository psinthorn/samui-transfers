"use server"

import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function listUsers(params?: { q?: string; page?: number; pageSize?: number; role?: string; disabled?: string }) {
  await requireAdmin()
  const page = Math.max(1, Number(params?.page ?? 1))
  const pageSize = Math.min(100, Math.max(1, Number(params?.pageSize ?? 20)))
  const skip = (page - 1) * pageSize
  const where: any = {}
  if (params?.q) {
    where.OR = [
      { email: { contains: params.q, mode: "insensitive" } },
      { name: { contains: params.q, mode: "insensitive" } },
    ]
  }
  if (params?.role) where.role = params.role
  if (params?.disabled === "true") where.disabled = true
  if (params?.disabled === "false") where.disabled = false
  const anyDb = db as any
  const [total, data] = await Promise.all([
    anyDb.user.count({ where }),
    anyDb.user.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: pageSize, select: { id: true, name: true, email: true, role: true, disabled: true, createdAt: true } })
  ])
  return { total, page, pageSize, data }
}

export async function getUser(id: string) {
  await requireAdmin()
  const anyDb = db as any
  const user = await anyDb.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true, disabled: true, createdAt: true, updatedAt: true } })
  if (!user) return { ok: false, message: "Not found" }
  return { ok: true, user }
}

export async function updateUserRole(id: string, role: "USER" | "ADMIN") {
  const session = await requireAdmin()
  // Prevent self-demotion to avoid lockout
  if (session.user?.id === id && role !== "ADMIN") {
    return { ok: false, message: "Cannot change your own role" }
  }
  const anyDb = db as any
  const before = await anyDb.user.findUnique({ where: { id }, select: { role: true } })
  await anyDb.user.update({ where: { id }, data: { role } })
  try {
    await anyDb.auditLog.create({
      data: {
        actorId: String(session.user?.id),
        targetUserId: id,
        action: "USER_ROLE_CHANGED",
        details: { before, after: { role } },
      },
    })
  } catch (e) {
    // non-fatal
    console.error("audit log failed", e)
  }
  return { ok: true }
}

export async function toggleUserDisabled(id: string, disabled: boolean) {
  const session = await requireAdmin()
  // Prevent disabling yourself
  if (session.user?.id === id) {
    return { ok: false, message: "You cannot disable your own account" }
  }
  const anyDb = db as any
  const before = await anyDb.user.findUnique({ where: { id }, select: { disabled: true } })
  await anyDb.user.update({ where: { id }, data: { disabled } })
  try {
    await anyDb.auditLog.create({
      data: {
        actorId: String(session.user?.id),
        targetUserId: id,
        action: "USER_DISABLED_TOGGLED",
        details: { before, after: { disabled } },
      },
    })
  } catch (e) {
    console.error("audit log failed", e)
  }
  return { ok: true }
}
