"use server"

import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import nodemailer from "nodemailer"
import { renderVoucherPdf } from "@/lib/pdf"
import { LANG, type Lang } from "@/data/i18n/core"
import { format } from "date-fns"
import { enUS, th as thLocale } from "date-fns/locale"
import fs from "node:fs"
import path from "node:path"

export async function resendVoucher(bookingId: string) {
  await requireAdmin()
  if (!bookingId) return { ok: false, message: "Invalid booking id" }
  const booking = await (db as any).booking.findUnique({ where: { id: bookingId }, include: { user: true } })
  if (!booking) return { ok: false, message: "Not found" }

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
  const locale = lang === "th" ? thLocale : enUS
  const whenText = d?.date ? format(new Date(d.date), "PPP p", { locale }) : "-"
  // Optional inline logo from public folder
  let logoDataUrl = ""
  try {
    const candidates = ["logo.png", "logo.jpg", "logo.jpeg", "samui-transfers-001.jpeg"]
    for (const name of candidates) {
      const p = path.join(process.cwd(), "public", name)
      if (fs.existsSync(p)) {
        const mime = name.endsWith(".png") ? "image/png" : "image/jpeg"
        const b64 = fs.readFileSync(p).toString("base64")
        logoDataUrl = `data:${mime};base64,${b64}`
        break
      }
    }
  } catch {}

  const html = `
    <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;background:#ffffff;padding:0;margin:0">
      <div style="background:#005B9A;color:#fff;padding:16px 20px">
        <table width="100%" cellspacing="0" cellpadding="0"><tr>
          <td style="width:140px;vertical-align:middle">${logoDataUrl ? `<img src="${logoDataUrl}" alt="${COMPANY.name}" style="display:block;max-width:120px;max-height:44px"/>` : ""}</td>
          <td style="vertical-align:middle"><div style="font-size:18px;font-weight:600">${COMPANY.name}</div><div style="font-size:13px;opacity:.9">Booking Voucher</div></td>
        </tr></table>
      </div>
      <div style="max-width:640px;margin:0 auto;padding:20px">
        <h1 style="margin:0 0 8px 0;font-size:18px;color:#0f172a">Your booking voucher</h1>
        <p style="margin:0 0 8px 0;color:#334155;font-size:13px">Booking ID: ${booking.requestNumber || booking.id}</p>
        <p style="margin:0 0 12px 0;color:#334155;font-size:13px">Pickup: ${d?.pickupPoint || '-'} → Drop-off: ${d?.dropoffPoint || '-'} • ${whenText}</p>
        <p style="margin:0;color:#334155;font-size:13px">View online: <a href="${COMPANY.website}/dashboard/bookings/${booking.id}/voucher" style="color:#2563eb;text-decoration:none">Voucher</a></p>
        <p style="margin:12px 0 0 0;color:#334155;font-size:13px">We've attached a PDF copy of your voucher for convenience.</p>
      </div>
    </div>
  `
  // Generate PDF attachment (default to language based on detail hint if provided)
  const voucherUrl = `${COMPANY.website}/dashboard/bookings/${booking.id}/voucher`
  const pdf = await renderVoucherPdf({
    id: booking.id,
    requestNumber: booking.requestNumber,
    status: booking.status,
    createdAt: booking.createdAt,
    details: booking.details as any,
    voucherUrl,
  }, lang)

  await transporter.sendMail({
    from: COMPANY.bookingEmail,
    to: email,
    subject: `Booking voucher — ${booking.requestNumber || booking.id}`,
    html,
    attachments: [
      {
        filename: `voucher-${booking.requestNumber || booking.id}.pdf`,
        content: pdf,
        contentType: "application/pdf",
      },
    ],
  })
  return { ok: true }
}
