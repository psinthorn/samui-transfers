"use server"

import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import nodemailer from "nodemailer"
import { renderVoucherPdf } from "@/lib/pdf"
import { LANG, type Lang } from "@/data/i18n/core"

export async function sendMyVoucher(bookingId: string) {
  const session = await requireUser()
  const user = session.user as any
  if (!bookingId) return { ok: false, message: "Invalid booking id" }

  const booking = await (db as any).booking.findUnique({ where: { id: bookingId }, include: { user: true } })
  if (!booking) return { ok: false, message: "Not found" }
  if (booking.userId !== user.id && user.role !== "ADMIN") return { ok: false, message: "Forbidden" }

  const d = (booking.details as any) || {}
  const email = booking.user?.email || d?.email
  if (!email) return { ok: false, message: "No recipient email" }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SSL_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })

  const COMPANY = {
    name: process.env.COMPANY_NAME || "Samui Transfers",
    bookingEmail: process.env.BOOKING_EMAIL || "booking@samui-transfers.com",
    website: process.env.COMPANY_WEBSITE || "https://samui-transfers.com",
  }

  const langHint = String((d?.lang || d?.language || "en")).toLowerCase() as Lang
  const lang = langHint === "th" ? "th" : "en"
  const voucherUrl = `${COMPANY.website}/dashboard/bookings/${booking.id}/voucher`
  const pdf = await renderVoucherPdf({
    id: booking.id,
    requestNumber: booking.requestNumber,
    status: booking.status,
    createdAt: booking.createdAt,
    details: booking.details as any,
    voucherUrl,
  }, lang)

  const html = `
    <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;background:#ffffff;padding:24px">
      <div style="max-width:640px;margin:0 auto">
        <h1 style="margin:0 0 8px 0;font-size:18px;color:#0f172a">Your booking voucher</h1>
        <p style="margin:0 0 12px 0;color:#334155;font-size:13px">Booking ID: ${booking.requestNumber || booking.id}</p>
        <p style="margin:0;color:#334155;font-size:13px">View online: <a href="${voucherUrl}" style="color:#2563eb;text-decoration:none">Voucher</a></p>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: COMPANY.bookingEmail,
    to: email,
    subject: `Booking voucher — ${booking.requestNumber || booking.id}`,
    html,
    attachments: [{ filename: `voucher-${booking.requestNumber || booking.id}.pdf`, content: pdf, contentType: "application/pdf" }],
  })

  return { ok: true }
}
