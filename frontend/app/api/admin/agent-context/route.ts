import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export const runtime = "nodejs"
export const revalidate = 0

function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>
  for (const k of keys) if (k in obj) (out as any)[k] = obj[k]
  return out
}

export async function GET(req: Request) {
  try {
    await requireAdmin(req)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "FORBIDDEN" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const key = searchParams.get("key") || undefined
    const locale = searchParams.get("locale") || undefined
    const enabledParam = searchParams.get("enabled")
    const where: any = {}
    if (key) where.key = key
    if (locale) where.locale = locale
    if (enabledParam !== null && enabledParam !== undefined && enabledParam !== "") where.enabled = enabledParam === "true"

    const data = await (db as any).chatbotContext.findMany({ where, orderBy: { createdAt: "desc" } })
    return NextResponse.json({ data }, { status: 200 })
  } catch (err: any) {
    console.error("/app/api/admin/agent-context GET error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "FORBIDDEN" }, { status: 403 })
  }

  try {
    const body = await req.json().catch(() => ({} as any))
    const { key, locale = "en", content, title, enabled = true } = body || {}
    if (!key || !content) return NextResponse.json({ error: "key and content are required" }, { status: 400 })

    const created = await (db as any).chatbotContext.create({
      data: { key, locale, content, title: title ?? null, enabled: Boolean(enabled) },
    })
    return NextResponse.json({ data: created }, { status: 201 })
  } catch (err: any) {
    console.error("/app/api/admin/agent-context POST error", err)
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Unique constraint failed. key+locale must be unique" }, { status: 409 })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin(req)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "FORBIDDEN" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })

    const body = await req.json().catch(() => ({} as any))
    const updates = pick(body || {}, ["key", "locale", "content", "title", "enabled"] as const)
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 400 })

    const updated = await (db as any).chatbotContext.update({ where: { id }, data: updates as any })
    return NextResponse.json({ data: updated }, { status: 200 })
  } catch (err: any) {
    console.error("/app/api/admin/agent-context PUT error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  // Delegate to PUT
  return PUT(req)
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin(req)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "FORBIDDEN" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })

    await (db as any).chatbotContext.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (err: any) {
    console.error("/app/api/admin/agent-context DELETE error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
