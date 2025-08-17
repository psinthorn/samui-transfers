"use client";
import { useSession } from 'next-auth/react'

export function useRole() {
  const { data: session, status } = useSession()
  const role = (session?.user as any)?.role || 'GUEST'
  return { role, session, status, isAdmin: role === 'ADMIN' }
}
