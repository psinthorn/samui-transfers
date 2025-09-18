"use client"

import React from "react"
import { useSession } from "next-auth/react"

export function RoleGate({ allow, children, fallback = null }: { allow: Array<"USER" | "ADMIN">; children: React.ReactNode; fallback?: React.ReactNode }) {
  const { data } = useSession()
  const role = (data?.user as any)?.role as "USER" | "ADMIN" | undefined
  if (!role || !allow.includes(role)) return <>{fallback}</>
  return <>{children}</>
}
