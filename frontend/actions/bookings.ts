"use server"

import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import nodemailer from "nodemailer"
import { generateBookingEmailHtml } from "@/lib/email"

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
      supportEmail: process.env.SUPPORT_EMAIL || "info@samui-transfers.com",
      infoEmail: process.env.INFO_EMAIL || "info@samui-transfers.com",
      website:
        process.env.NODE_ENV !== "production"
          ? "http://localhost:3000"
          : process.env.COMPANY_WEBSITE || "https://samui-transfers.com",
      phone: process.env.SUPPORT_PHONE || "(+66) 99 108 7999",
      whatsapp: (process.env.SUPPORT_WHATSAPP || "66991087999").replace(/[^\d]/g, ""),
      address: process.env.COMPANY_ADDRESS || "9/38 Moo 6, Bo Phut, Ko Samui, Surat Thani 84320, Thailand",
      managedByName: process.env.MANAGED_BY_NAME || "F2 Co.,Ltd.",
      managedByTaxId: process.env.MANAGED_BY_TAX_ID || "0845560003240",
      managedByTel: process.env.MANAGED_BY_TEL || "+66 064 027 0528",
      managedByEmail: process.env.MANAGED_BY_EMAIL || "info@f2.co.th",
    }

  const d = (updated.details as any) || {}
  const idOrNumber = updated.requestNumber || updated.id

    const subjects: Record<string, string> = {
      PENDING: `Booking update — ${idOrNumber} is pending`,
      CONFIRMED: `Booking confirmed — ${idOrNumber}`,
      COMPLETED: `Booking completed — ${idOrNumber}`,
      CANCELLED: `Booking cancelled — ${idOrNumber}`,
    }

    const bookingUrl = `${COMPANY.website}/dashboard/bookings/${updated.id}`
    const chatUrl = `${bookingUrl}#chat`
    const adminHtml = generateBookingEmailHtml({
      audience: "admin",
      status,
      company: COMPANY,
      bookingId: updated.id,
      requestNumber: updated.requestNumber || null,
      details: {
        firstName: d?.firstName,
        lastName: d?.lastName,
        email: d?.email,
        mobile: d?.mobile,
        flightNo: d?.flightNo,
        passengers: d?.passengers,
        date: d?.date,
        time: d?.time,
        carType: d?.carType,
        carModel: d?.carModel,
        rate: d?.rate,
        pickupPoint: d?.pickupPoint,
        dropoffPoint: d?.dropoffPoint,
        notes: d?.notes,
      },
      bookingUrl,
      chatUrl,
    })
    const customerHtml = generateBookingEmailHtml({
      audience: "customer",
      status,
      company: COMPANY,
      bookingId: updated.id,
      requestNumber: updated.requestNumber || null,
      details: {
        firstName: d?.firstName,
        lastName: d?.lastName,
        email: d?.email,
        mobile: d?.mobile,
        flightNo: d?.flightNo,
        passengers: d?.passengers,
        date: d?.date,
        time: d?.time,
        carType: d?.carType,
        carModel: d?.carModel,
        rate: d?.rate,
        pickupPoint: d?.pickupPoint,
        dropoffPoint: d?.dropoffPoint,
        notes: d?.notes,
      },
      bookingUrl,
      chatUrl,
    })

  const subject = subjects[status]
    const customerEmail = (updated.user?.email as string) || d?.email
    if (subject && customerEmail) {
      await Promise.all([
        transporter.sendMail({ from: COMPANY.bookingEmail, to: COMPANY.bookingEmail, replyTo: customerEmail, subject, html: adminHtml }),
        transporter.sendMail({ from: COMPANY.bookingEmail, to: customerEmail, replyTo: COMPANY.supportEmail || COMPANY.bookingEmail, subject, html: customerHtml }),
      ])
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, message: "Failed to update status" }
  }
}
