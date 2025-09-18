import { NextResponse } from "next/server"
import { renderVoucherPdf } from "@/lib/pdf"
import { LANG, type Lang } from "@/data/i18n/core"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(
  req: Request,
  context: any
) {
  const { params } = (context || {}) as { params?: { id: string } }
  const session = await requireUser()
  const user = session.user as any
  const id = params?.id as string

  if (!id) {
    return new NextResponse("Missing booking id", { status: 400 })
  }

  const booking = await (db as any).booking.findUnique({ where: { id } })
  if (!booking) {
    return new NextResponse("Booking not found", { status: 404 })
  }

  const isOwner = booking.userId === user.id
  const isAdmin = user.role === "ADMIN"
  if (!isOwner && !isAdmin) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const url = new URL(req.url)
  const langParam = (url.searchParams.get("lang") || "en").toLowerCase()
  const lang = (langParam === "th" ? "th" : "en") as Lang

  const origin = `${url.protocol}//${url.host}`
  const voucherUrl = `${origin}/dashboard/bookings/${booking.id}/voucher`
  const pdfBuffer = await renderVoucherPdf(
    {
      id: booking.id,
      requestNumber: booking.requestNumber,
      status: booking.status,
      createdAt: booking.createdAt,
      details: booking.details as any,
      voucherUrl,
    },
    lang
  )
  const bytes = pdfBuffer instanceof Uint8Array ? pdfBuffer : new Uint8Array(pdfBuffer)
  const view = new Uint8Array(bytes) // ensure proper BlobPart
  const blob = new Blob([view], { type: "application/pdf" })
  return new Response(blob, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="voucher-${booking.requestNumber || booking.id}.pdf"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  })
}
