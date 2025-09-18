import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { listUsers } from "@/actions/users"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 })
  }
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || undefined
  const role = searchParams.get("role") || undefined
  const disabled = searchParams.get("disabled") || undefined
  const pageSize = Number(searchParams.get("limit") || 1000)

  const { data } = await listUsers({ q, role, disabled, page: 1, pageSize })
  const rows: (string | number | boolean | null | undefined)[][] = [
    ["id", "name", "email", "role", "disabled", "createdAt"],
    ...data.map((u: any) => [u.id, u.name || "", u.email || "", u.role, u.disabled ? "true" : "false", new Date(u.createdAt).toISOString()]),
  ]
  const csv = rows
    .map((r: (string | number | boolean | null | undefined)[]) =>
      r.map((v: string | number | boolean | null | undefined) => `"${String(v ?? "").replace(/\"/g, '""')}"`).join(",")
    )
    .join("\n")
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=users-export.csv`,
    },
  })
}
