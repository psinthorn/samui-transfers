import { auth } from "@/auth"

export const getSession = () => auth()

export async function requireUser() {
  const session = await auth()
  if (!session?.user) throw new Error("UNAUTHORIZED")
  return session
}

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") throw new Error("FORBIDDEN")
  return session
}
