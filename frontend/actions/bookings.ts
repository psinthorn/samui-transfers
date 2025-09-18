"use server"

import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import nodemailer from "nodemailer"

export async function updateBookingStatus(bookingId: string, status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED") {
  await requireAdmin()
  if (!bookingId || !status) return { ok: false, message: "Invalid input" }
  try {
    const updated = await (db as any).booking.update({ where: { id: bookingId }, data: { status }, include: { user: true } })

    // Send notification emails
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SSL_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })

    const COMPANY = {
      name: process.env.COMPANY_NAME || "Samui Transfers",
      bookingEmail: process.env.BOOKING_EMAIL || "booking@samui-transfers.com",
      infoEmail: process.env.INFO_EMAIL || "info@samui-transfers.com",
      website: process.env.COMPANY_WEBSITE || "https://samui-transfers.com",
    }

    const d = (updated.details as any) || {}
    const idOrNumber = updated.requestNumber || updated.id
    const route = [d?.pickupPoint, d?.dropoffPoint].filter(Boolean).join(" → ") || "-"
    const vehicle = [d?.carType, d?.carModel].filter(Boolean).join(" — ") || "-"

    const subjects: Record<string, string> = {
      PENDING: `Booking update — ${idOrNumber} is pending`,
      CONFIRMED: `Booking confirmed — ${idOrNumber}`,
      COMPLETED: `Booking completed — ${idOrNumber}`,
      CANCELLED: `Booking cancelled — ${idOrNumber}`,
    }

    const html = `
      <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;background:#ffffff;padding:24px">
        <div style="max-width:640px;margin:0 auto">
          <h1 style="margin:0 0 8px 0;font-size:18px;color:#0f172a">Booking ${idOrNumber} — Status: ${status}</h1>
          <table style="width:100%;font-size:14px;color:#0f172a">
            <tr><td style="padding:4px 0;color:#475569">Route</td><td style="text-align:right">${route}</td></tr>
            <tr><td style="padding:4px 0;color:#475569">Vehicle</td><td style="text-align:right">${vehicle}</td></tr>
            <tr><td style="padding:4px 0;color:#475569">When</td><td style="text-align:right">${d?.date || '-'}</td></tr>
            <tr><td style="padding:4px 0;color:#475569">Rate</td><td style="text-align:right">${d?.rate ?? '-'}</td></tr>
          </table>
          <p style="margin:12px 0 0 0;color:#334155;font-size:13px">
            You can view details on our site: <a href="${COMPANY.website}/dashboard/bookings/${updated.id}" style="color:#2563eb;text-decoration:none">Booking details</a>
          </p>
        </div>
      </div>
    `

    const subject = subjects[status]
    const customerEmail = (updated.user?.email as string) || d?.email
    if (subject && customerEmail) {
      await Promise.all([
        transporter.sendMail({ from: COMPANY.bookingEmail, to: COMPANY.bookingEmail, subject, html }),
        transporter.sendMail({ from: COMPANY.bookingEmail, to: customerEmail, subject, html }),
      ])
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, message: "Failed to update status" }
  }
}
