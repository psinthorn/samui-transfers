import { auth } from "@/auth"

export const getSession = (req?: any) => (req ? auth(req as any) : auth())

export async function requireUser(req?: any) {
  const session = await (req ? auth(req as any) : auth())
  if (!session?.user) throw new Error("UNAUTHORIZED")
  return session
}

export async function requireAdmin(req?: any) {
  const session = await (req ? auth(req as any) : auth())
  if (!session?.user || (session.user as any).role !== "ADMIN") throw new Error("FORBIDDEN")
  return session
}
