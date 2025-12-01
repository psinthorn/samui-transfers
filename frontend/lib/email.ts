import fs from "node:fs"
import path from "node:path"
import nodemailer from "nodemailer"

type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"

// Configure email transporter
const getEmailTransporter = () => {
  // Try Mailtrap first
  if (process.env.MAILTRAP_HOST) {
    console.log("Using Mailtrap email configuration")
    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: parseInt(process.env.MAILTRAP_PORT || "2525"),
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    })
  }

  // Fallback to SMTP configuration
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("SMTP configuration missing:")
    console.error("- SMTP_HOST:", process.env.SMTP_HOST ? "✓ set" : "✗ missing")
    console.error("- SMTP_USER:", process.env.SMTP_USER ? "✓ set" : "✗ missing")
    console.error("- SMTP_PASS:", process.env.SMTP_PASS ? "✓ set" : "✗ missing")
    throw new Error(
      "Email configuration incomplete. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables."
    )
  }

  console.log(`Using SMTP email configuration (${process.env.SMTP_HOST})`)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

const getBaseUrl = () => {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "http://localhost:3000"
}

export type CompanyInfo = {
  name: string
  website: string
  bookingEmail?: string
  supportEmail?: string
  phone?: string
  address?: string
  whatsapp?: string
  managedByName?: string
  managedByTaxId?: string
  managedByTel?: string
  managedByEmail?: string
}

export type BookingDetails = {
  firstName?: string
  lastName?: string
  email?: string
  mobile?: string
  flightNo?: string
  passengers?: number | string
  date?: string
  time?: string
  carType?: string
  carModel?: string
  rate?: string | number
  pickupPoint?: string
  dropoffPoint?: string
  notes?: string
  [key: string]: any
}

function getInlineLogoDataUrl(): string {
  try {
    const candidates = ["logo.png", "logo.jpg", "logo.jpeg", "samui-transfers-001.jpeg"]
    for (const name of candidates) {
      const p = path.join(process.cwd(), "public", name)
      if (fs.existsSync(p)) {
        const mime = name.endsWith(".png") ? "image/png" : "image/jpeg"
        const b64 = fs.readFileSync(p).toString("base64")
        return `data:${mime};base64,${b64}`
      }
    }
  } catch {}
  return ""
}

function row(label: string, value?: string | number | null) {
  return `<tr>
    <td style="padding:10px 0;border-top:1px solid #e5e7eb;color:#6b7280">${label}</td>
    <td style="padding:10px 0;border-top:1px solid #e5e7eb;text-align:right;color:#111827;font-weight:500">${
      value != null && String(value).trim() !== "" ? String(value) : "-"
    }</td>
  </tr>`
}

function header(company: CompanyInfo) {
  const logo = getInlineLogoDataUrl()
  const website = (company.website || "").replace(/\/$/, "")
  const remoteLogo = website ? `${website}/logo.png` : ""
  const logoSrc = remoteLogo || logo
  return `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0;padding:24px 0">
    <tr>
      <td align="left" style="font-size:0">
        ${logoSrc ? `<img src="${logoSrc}" alt="${company.name}" width="120" height="40" style="display:block;max-width:120px;max-height:40px"/>` : `<div style="font-size:18px;font-weight:600;color:#111827">${company.name}</div>`}
      </td>
    </tr>
  </table>`
}

export function generateBookingEmailHtml(opts: {
  audience: "customer" | "admin"
  status?: BookingStatus
  company: CompanyInfo
  bookingId: string
  requestNumber?: string | null
  details: BookingDetails
  bookingUrl?: string
  chatUrl?: string
  preheader?: string
}): string {
  const { audience, status = "PENDING", company, bookingId, requestNumber, details, bookingUrl, chatUrl, preheader } = opts
  const idOrNumber = requestNumber || bookingId

  const route = [details?.pickupPoint, details?.dropoffPoint].filter(Boolean).join(" → ") || "-"
  const when = [details?.date, details?.time].filter(Boolean).join(" • ") || details?.date || "-"
  const vehicle = [details?.carType, details?.carModel].filter(Boolean).join(" — ") || "-"

  const title =
    audience === "admin"
      ? status === "PENDING"
        ? `New transfer request — ${idOrNumber}`
        : `Booking update — ${idOrNumber} (${status.toLowerCase()})`
      : status === "PENDING"
      ? "Thanks — we’ve received your transfer request"
      : status === "CONFIRMED"
      ? "Your booking is confirmed"
      : status === "COMPLETED"
      ? "Your transfer is completed"
      : "Your booking was cancelled"

  const headerHtml = header(company)

  const statusColor =
    status === "CONFIRMED" ? "#10b981" : status === "COMPLETED" ? "#0ea5e9" : status === "CANCELLED" ? "#ef4444" : "#6b7280"

  const ctaButton = (href: string, label: string, bg = "#111827") => `
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0"><tr>
      <td style="border-radius:8px" bgcolor="${bg}">
        <a href="${href}"
           style="display:inline-block;padding:10px 14px;font-size:14px;line-height:1.4;color:#ffffff;text-decoration:none;border-radius:8px"
        >${label}</a>
      </td>
    </tr></table>`

  const preheaderText = preheader || (audience === "admin" ? `Booking ${idOrNumber} • ${route} • ${when}` : `Booking ${idOrNumber} • ${status}`)

  return `
  <div style="background:#f8fafc;margin:0;padding:0">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${preheaderText}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:0;margin:0">
      <tr>
        <td align="center" style="padding:0 16px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:12px;padding:0 20px 20px 20px">
            <tr><td>${headerHtml}</td></tr>
            <tr>
              <td style="padding:0 0 8px 0">
                <div style="font-size:18px;font-weight:600;color:#111827;margin:0 0 6px 0">${title}</div>
                ${audience === "customer" && status === "PENDING" ? `<div style=\"font-size:14px;color:#374151;margin:8px 0 0\">We’re reviewing availability. Summary below:</div>` : ""}
                <div style="display:inline-block;font-size:12px;color:#111827;background:${statusColor}1a;border:1px solid ${statusColor};border-radius:999px;padding:2px 8px;">Status: ${status.toLowerCase()}</div>
                <div style="margin-top:8px;font-size:12px;color:#6b7280">ID: ${idOrNumber}</div>
              </td>
            </tr>
            <tr>
              <td>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px">
                  ${row("Booking ID", idOrNumber)}
                  ${row("Name", [details?.firstName, details?.lastName].filter(Boolean).join(" "))}
                  ${row("Email", details?.email)}
                  ${row("Mobile", details?.mobile)}
                  ${row("Flight no.", details?.flightNo)}
                  ${row("Passengers", details?.passengers as any)}
                  ${row("Notes", details?.notes)}
                  ${row("Pickup", details?.pickupPoint)}
                  ${row("Drop‑off", details?.dropoffPoint)}
                  ${row("Date/Time", when)}
                  ${row("Vehicle", vehicle)}
                  ${row("Rate", details?.rate as any)}
                </table>
              </td>
            </tr>
            ${audience === "customer" && status === "PENDING" ? `
            <tr>
              <td style="padding-top:12px">
                <div style="font-size:13px;color:#374151">This is not a confirmation. We’ll contact you shortly to confirm availability and driver details.</div>
              </td>
            </tr>` : ""}
            ${(bookingUrl || chatUrl)
              ? `<tr>
                  <td style="padding-top:16px">
                    <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%"><tr>
                      <td align="left" style="gap:8px">
                        ${bookingUrl ? ctaButton(bookingUrl, audience === "admin" ? "Open booking" : "View booking") : ""}
                        ${chatUrl ? `<span style="display:inline-block;width:8px"></span>${ctaButton(chatUrl, "Message us", "#0f766e")}` : ""}
                      </td>
                    </tr></table>
                  </td>
                </tr>`
              : ""}
            ${(() => {
              const wa = company.whatsapp ? `https://wa.me/${company.whatsapp.replace(/[^\\d]/g, "")}` : ""
              const mail = `mailto:${company.supportEmail || company.bookingEmail || "info@samui-transfers.com"}`
              const web = company.website || "https://samui-transfers.com"
              return `
              <tr>
                <td style="padding-top:8px">
                  <div style="font-size:13px;color:#2563eb">
                    ${wa ? `<a href="${wa}" style="color:#2563eb;text-decoration:none;margin-right:16px">Chat on WhatsApp</a>` : ""}
                    <a href="${mail}" style="color:#2563eb;text-decoration:none;margin-right:16px">Email support</a>
                    <a href="${web}" style="color:#2563eb;text-decoration:none">Visit website</a>
                  </div>
                </td>
              </tr>`
            })()}
            <tr>
              <td style="padding-top:16px">
                <div style="font-size:12px;color:#374151;line-height:1.6">
                  <strong>Terms and conditions</strong><br/>
                  Payment: 100% deposit required to confirm your booking.<br/>
                  Cancellation: ≥ 72 hours before pickup — full refund of deposit.<br/>
                  Cancellation: 24–72 hours before pickup — 70% refund within 5–7 business days.<br/>
                  Cancellation: &lt; 24 hours or no‑show — non‑refundable.<br/>
                  Changes: One free change up to 24 hours before pickup (subject to availability; fare differences may apply).<br/>
                  Waiting time: Airport pickups include 60 minutes free; other pickups include 15 minutes free. Extra waiting may incur charges or require a new booking.<br/>
                  Passengers &amp; luggage: Passenger count must match the booking. Oversized luggage or extra items may require a larger vehicle and additional fees.<br/>
                  Child seats: Available on request; please specify in Notes so we can confirm availability.<br/>
                  Delays: We monitor flight delays and will adjust pickup when possible. Significant delays may require rescheduling.<br/>
                  Conduct &amp; safety: No smoking or open alcohol in vehicles. Seat belts are required at all times.<br/>
                  Pricing: All prices in THB; taxes/fees included unless stated otherwise.<br/>
                  Force majeure: Not liable for delays caused by events beyond our control (weather, traffic incidents, etc.).<br/>
                  By continuing, you accept these terms.
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding-top:20px;border-top:1px solid #e5e7eb">
                <div style="font-size:12px;color:#6b7280;line-height:1.6">
                  ${company.name}${company.address ? ` • ${company.address}` : ""}
                </div>
                <div style="font-size:12px;color:#6b7280;margin-top:4px">
                  ${company.phone ? `Tel: ${company.phone} • ` : ""}Email: ${company.supportEmail || company.bookingEmail || "info@samui-transfers.com"}${company.whatsapp ? ` • WhatsApp: +${company.whatsapp}` : ""}
                </div>
                ${(company.managedByName || company.managedByTaxId || company.managedByTel || company.managedByEmail)
                  ? `<div style=\"font-size:12px;color:#6b7280;margin-top:4px\">Managed by ${company.managedByName || ""}${company.managedByTaxId ? ` • Tax ID: ${company.managedByTaxId}` : ""}${company.managedByTel ? ` • Tel: ${company.managedByTel}` : ""}${company.managedByEmail ? ` • Email: ${company.managedByEmail}` : ""}</div>`
                  : ""}
                <div style="font-size:12px;color:#9ca3af;margin-top:8px">This is an automated message. If you didn’t request this, please ignore it.</div>
                <div style="font-size:12px;color:#9ca3af;margin-top:4px">© ${new Date().getFullYear()} ${company.name}. All rights reserved.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`
}

/**
 * Send email verification link to user
 */
export async function sendVerificationEmail({
  email,
  name,
  token,
}: {
  email: string
  name: string
  token: string
}) {
  const baseUrl = getBaseUrl()
  const verificationUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background-color: #111827; 
          color: white; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 20px 0;
        }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; color: #111827;">Verify Your Email</h1>
        </div>
        
        <p>Hi ${name},</p>
        
        <p>Welcome to Samui Transfers! Please verify your email address to complete your registration and start booking transfers.</p>
        
        <p>
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
        </p>
        
        <p style="color: #6b7280; font-size: 14px;">
          Or copy and paste this link in your browser:<br/>
          <code style="word-break: break-all;">${verificationUrl}</code>
        </p>
        
        <p>This verification link will expire in 24 hours.</p>
        
        <p>If you didn't create this account, please ignore this email.</p>
        
        <div class="footer">
          <p style="margin: 0;">© ${new Date().getFullYear()} Samui Transfers. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const transporter = getEmailTransporter()
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@samui-transfers.com",
    to: email,
    subject: "Verify Your Email - Samui Transfers",
    html,
  })
}

/**
 * Send password reset link to user
 */
export async function sendPasswordResetEmail({
  email,
  name,
  token,
}: {
  email: string
  name: string
  token: string
}) {
  const baseUrl = getBaseUrl()
  const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background-color: #111827; 
          color: white; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 20px 0;
        }
        .warning { 
          background-color: #fef3c7; 
          border: 1px solid #fcd34d; 
          color: #92400e; 
          padding: 12px; 
          border-radius: 6px; 
          margin: 20px 0;
        }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; color: #111827;">Reset Your Password</h1>
        </div>
        
        <p>Hi ${name},</p>
        
        <p>We received a request to reset your Samui Transfers password. Click the button below to create a new password.</p>
        
        <p>
          <a href="${resetUrl}" class="button">Reset Password</a>
        </p>
        
        <p style="color: #6b7280; font-size: 14px;">
          Or copy and paste this link in your browser:<br/>
          <code style="word-break: break-all;">${resetUrl}</code>
        </p>
        
        <div class="warning">
          <strong>Security Notice:</strong> This password reset link will expire in 1 hour. If you didn't request this, please ignore this email.
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          For security reasons, never share this link with anyone. Samui Transfers staff will never ask for your password or this link.
        </p>
        
        <div class="footer">
          <p style="margin: 0;">© ${new Date().getFullYear()} Samui Transfers. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const transporter = getEmailTransporter()
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@samui-transfers.com",
    to: email,
    subject: "Reset Your Password - Samui Transfers",
    html,
  })
}

/**
 * Verify an email verification token
 */
export async function verifyEmailToken(email: string, token: string) {
  const { db } = await import("@/lib/db")
  
  const verificationToken = await db.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
  })

  if (!verificationToken) {
    throw new Error("Invalid or expired token")
  }

  if (verificationToken.expires < new Date()) {
    throw new Error("Token has expired")
  }

  // Mark email as verified
  await db.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  })

  // Delete the token
  await db.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
  })
}
