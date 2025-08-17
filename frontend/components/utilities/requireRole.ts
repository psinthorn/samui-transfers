import { auth } from '@/components/utilities/auth'

interface GateOptions { roles?: string[]; }

export async function requireRole(roles: string[] | GateOptions) {
  const wantedRoles = Array.isArray(roles) ? roles : (roles.roles || [])
  const session = await auth()
  if (!session?.user) return { allowed: false, reason: 'UNAUTHENTICATED' as const }
  const role = (session.user as any).role || 'USER'
  if (wantedRoles.length && !wantedRoles.includes(role)) return { allowed: false, reason: 'FORBIDDEN' as const, role }
  return { allowed: true as const, role, session }
}

