import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import nodemailer from "nodemailer"
import { generateBookingEmailHtml } from "@/lib/email"
import { bookingRequestSchema, BookingRequest } from "@/schemas"
import { ZodError } from "zod"

export const runtime = "nodejs"

// Simple in-memory rate limiter (per-IP, sliding window)
// Note: Suitable for a single server process. For multi-instance deployments,
// use a shared store (Redis, Upstash) instead.
const RATE_WINDOW_MS = Number(process.env.BOOKING_RATE_WINDOW_MS || 60_000) // 1 minute
const RATE_MAX_REQUESTS = Number(process.env.BOOKING_RATE_MAX || 5)
declare global {
  // eslint-disable-next-line no-var
  var __bookingRateMap: Map<string, number[]> | undefined
}
const ipHits: Map<string, number[]> = globalThis.__bookingRateMap || new Map<string, number[]>()
globalThis.__bookingRateMap = ipHits

export async function POST(req: Request) {
  try {
    // Basic per-IP rate limit
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown"
    const now = Date.now()
    const arr = ipHits.get(ip) || []
    const filtered = arr.filter((t) => now - t < RATE_WINDOW_MS)
    if (filtered.length >= RATE_MAX_REQUESTS) {
      return NextResponse.json({ ok: false, message: "Too many requests" }, { status: 429 })
    }
    filtered.push(now)
    ipHits.set(ip, filtered)

    const session = await requireUser()
  const json = await req.json()
  const body: BookingRequest = bookingRequestSchema.parse(json)

    const {
      requestNumber,
      firstName,
      lastName,
      email,
      mobile,
      flightNo,
      passengers,
      date,
      carType,
      carModel,
      rate,
      pickupPoint,
      dropoffPoint,
      notes,
    } = body || {}

    // Persist booking tied to userId
    // Note: In some TS setups the Prisma Client types may appear stale and not expose `booking` on `db`.
    // The delegate exists at runtime; cast `db` to avoid an editor false-negative while keeping runtime intact.
    // Optional: reCAPTCHA verification if configured
    if (process.env.RECAPTCHA_SECRET && body.recaptchaToken) {
      const resp = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET,
          response: body.recaptchaToken,
        }),
      })
      const data = await resp.json()
      if (!data?.success) {
        return NextResponse.json({ ok: false, message: "recaptcha_failed" }, { status: 400 })
      }
    }

    const booking = await (db as any).booking.create({
      data: {
        userId: (session.user as any).id as string,
        requestNumber: requestNumber ?? null,
        details: body,
      },
    })

    // Email notifications (reuse env config from pages/api/booking.js)
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
      phone: process.env.SUPPORT_PHONE || "(+66) 99 108 7999",
      whatsapp: (process.env.SUPPORT_WHATSAPP || "66991087999").replace(/[^\d]/g, ""),
      address: process.env.COMPANY_ADDRESS || "9/38 Moo 6, Bo Phut, Ko Samui, Surat Thani 84320, Thailand",
      facebook: process.env.COMPANY_FACEBOOK || "https://www.facebook.com/profile.php?id=61578880422159",
      website:
        process.env.NODE_ENV !== "production"
          ? "http://localhost:3000"
          : process.env.COMPANY_WEBSITE || "https://samui-transfers.com",
      managedByName: process.env.MANAGED_BY_NAME || "F2 Co.,Ltd.",
      managedByTaxId: process.env.MANAGED_BY_TAX_ID || "0845560003240",
      managedByTel: process.env.MANAGED_BY_TEL || "+66 064 027 0528",
      managedByEmail: process.env.MANAGED_BY_EMAIL || "info@f2.co.th",
    }

    const bookingUrl = `${COMPANY.website}/dashboard/bookings/${booking.id}`
    const chatUrl = `${bookingUrl}#chat`
    const adminHtml = generateBookingEmailHtml({
      audience: "admin",
      status: "PENDING",
      company: COMPANY,
      bookingId: booking.id,
      requestNumber: requestNumber || null,
      details: {
        firstName,
        lastName,
        email,
        mobile,
        flightNo,
        passengers,
        date,
        time: (body as any)?.time,
        carType,
        carModel,
        rate,
        pickupPoint,
        dropoffPoint,
        notes,
      },
      bookingUrl,
      chatUrl,
    })
    const customerHtml = generateBookingEmailHtml({
      audience: "customer",
      status: "PENDING",
      company: COMPANY,
      bookingId: booking.id,
      requestNumber: requestNumber || null,
      details: {
        firstName,
        lastName,
        email,
        mobile,
        flightNo,
        passengers,
        date,
        time: (body as any)?.time,
        carType,
        carModel,
        rate,
        pickupPoint,
        dropoffPoint,
        notes,
      },
      bookingUrl,
      chatUrl,
    })

    await transporter.sendMail({
      from: COMPANY.bookingEmail,
      to: COMPANY.bookingEmail,
      replyTo: email ? `${[firstName, lastName].filter(Boolean).join(" ")} <${email}>` : undefined,
      subject: `New transfer request — ${requestNumber || booking.id}`,
      html: adminHtml,
    })
    await transporter.sendMail({
      from: COMPANY.bookingEmail,
      to: email,
      replyTo: COMPANY.supportEmail || COMPANY.bookingEmail,
      subject: "Thanks — we’ll confirm your transfer soon",
      html: customerHtml,
    })

    return NextResponse.json({ ok: true, bookingId: booking.id })
  } catch (e: any) {
    if (e instanceof ZodError) {
      return NextResponse.json({ ok: false, errors: e.flatten() }, { status: 400 })
    }
    const message = process.env.NODE_ENV === "development" ? e?.message || "Failed" : "Failed"
    return NextResponse.json({ ok: false, message }, { status: 500 })
  }
}
