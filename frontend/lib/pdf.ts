import PDFDocument from "pdfkit"
import type PDFKit from "pdfkit"
import { company } from "@/data/company"
import { LANG, type Lang } from "@/data/i18n/core"
import fs from "node:fs"
import path from "node:path"
import { format } from "date-fns"
import { enUS, th as thLocale } from "date-fns/locale"
import QRCode from "qrcode"

export type VoucherPayload = {
  id: string
  requestNumber?: string | null
  status: string
  createdAt: Date
  details: any
  voucherUrl?: string
}

const OCEAN = "#005B9A"

// Try to load a logo from public folder (optional)
let logoBuffer: Buffer | null = null
const CANDIDATE_LOGOS = [
  "logo.png",
  "logo.jpg",
  "logo.jpeg",
  "samui-transfers-001.jpeg",
]
for (const name of CANDIDATE_LOGOS) {
  try {
    const p = path.join(process.cwd(), "public", name)
    if (fs.existsSync(p)) {
      logoBuffer = fs.readFileSync(p)
      break
    }
  } catch {}
}

const LABELS: Record<Lang, Record<string, string>> = {
  en: {
    voucher: "Booking Voucher",
    qrCaption: "Scan to view",
    bookingId: "Booking ID",
    status: "Status",
    name: "Name",
    passengers: "Passengers",
    email: "Email",
    mobile: "Mobile",
    pickup: "Pickup",
    dropoff: "Drop-off",
    datetime: "Date / Time",
    vehicle: "Vehicle",
    rate: "Rate",
    notes: "Special Requests",
    generated: "Generated",
    passengerInfo: "Passenger Information",
    tripDetails: "Trip Details",
    distance: "Distance",
    confirmed: "Your Booking is Confirmed",
    important: "Important Information",
    arriveEarly: "Please arrive 30 minutes before your scheduled pickup time.",
  },
  th: {
    voucher: "ใบยืนยันการจอง",
    qrCaption: "สแกนเพื่อเปิดดู",
    bookingId: "รหัสการจอง",
    status: "สถานะ",
    name: "ชื่อ",
    passengers: "จำนวนผู้โดยสาร",
    email: "อีเมล",
    mobile: "มือถือ",
    pickup: "จุดรับ",
    dropoff: "จุดส่ง",
    datetime: "วัน/เวลา",
    vehicle: "รถ",
    rate: "ราคา",
    notes: "หมายเหตุ",
    generated: "สร้างเมื่อ",
    passengerInfo: "ข้อมูลผู้โดยสาร",
    tripDetails: "รายละเอียดการเดินทาง",
    distance: "ระยะทาง",
    confirmed: "การจองของคุณได้รับการยืนยัน",
    important: "ข้อมูลสำคัญ",
    arriveEarly: "กรุณาเก็บใบยืนยันนี้ไว้ เมื่อถึงเวลาที่นัด ขอให้มาถึงจุดรับส่วนครึ่งชั่วโมงก่อนเวลาที่นัด",
  },
}

function addField(doc: PDFKit.PDFDocument, label: string, value?: string | number) {
  const v = (value ?? "-").toString()
  doc.font("Helvetica").fontSize(10).fillColor("#6B7280").text(label)
  doc.font("Helvetica").fontSize(12).fillColor("#111827").text(v)
  doc.moveDown(0.5)
}

function addSection(doc: PDFKit.PDFDocument, title: string) {
  doc.font("Helvetica-Bold").fontSize(14).fillColor("#1F2937").text(title)
  doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor("#E5E7EB").stroke()
  doc.moveDown(0.5)
}

function addFieldRow(doc: PDFKit.PDFDocument, label: string, value?: string | number, x?: number) {
  const v = (value ?? "-").toString()
  doc.fontSize(9).fillColor("#6B7280").text(label, x || 50, doc.y)
  doc.fontSize(11).fillColor("#111827").text(v, x || 50, doc.y + 12)
  doc.moveDown(0.8)
}

export async function renderVoucherPdf(
  booking: VoucherPayload,
  lang: Lang = LANG.EN
): Promise<Buffer> {
  const d = booking.details || {}
  const labels = LABELS[lang] || LABELS.en
  const locale = lang === LANG.TH ? thLocale : enUS

  const doc = new PDFDocument({ size: "A4", margin: 40 })
  const chunks: Buffer[] = []
  doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
  const done = new Promise<void>((resolve) => doc.on("end", () => resolve()))

  // ===== HEADER SECTION =====
  const headerHeight = 90
  
  // Gradient-like effect with colored rectangle
  doc.rect(0, 0, doc.page.width, headerHeight).fill(OCEAN)
  
  // Company name and logo
  let startX = 50
  if (logoBuffer) {
    try {
      doc.image(logoBuffer, 50, 15, { width: 100, fit: [100, 40] })
      startX = 160
    } catch {}
  }

  doc.font("Helvetica-Bold").fillColor("#ffffff").fontSize(18)
  doc.text(company.name, startX, 20, { align: "left" })

  doc.font("Helvetica-Bold").fontSize(24).fillColor("#ffffff")
  doc.text(labels.confirmed, startX, 42, { align: "left" })

  // Status badge area
  const statusX = doc.page.width - 100
  doc.rect(statusX - 10, 20, 90, 30).fill("#ffffff")
  doc.font("Helvetica-Bold").fillColor("#005B9A").fontSize(10)
  doc.text(booking.status, statusX, 30, { align: "center", width: 90 })

  doc.moveDown(1)
  doc.y = headerHeight + 5

  // ===== BOOKING ID & STATUS (Compact) =====
  doc.font("Helvetica").fontSize(9).fillColor("#6B7280").text(labels.bookingId)
  doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827")
  doc.text(booking.requestNumber || booking.id)
  doc.moveDown(0.3)

  // ===== PASSENGER INFORMATION SECTION =====
  doc.moveDown(0.5)
  addSection(doc, `👤 ${labels.passengerInfo}`)
  doc.moveDown(0.3)
  
  // Two columns layout for passenger info
  const col1X = 50
  const col2X = doc.page.width / 2 + 20
  
  doc.font("Helvetica").fontSize(9).fillColor("#6B7280").text(labels.name, col1X, doc.y)
  doc.font("Helvetica").fontSize(11).fillColor("#111827").text([d?.firstName, d?.lastName].filter(Boolean).join(" ") || "-", col1X, doc.y + 12)
  
  doc.font("Helvetica").fontSize(9).fillColor("#6B7280").text(labels.passengers, col2X, doc.y)
  doc.font("Helvetica").fontSize(11).fillColor("#111827").text(d?.passengers ? String(d.passengers) : "-", col2X, doc.y + 12)
  
  doc.moveDown(0.8)
  
  doc.font("Helvetica").fontSize(9).fillColor("#6B7280").text(labels.email, col1X, doc.y)
  doc.font("Helvetica").fontSize(11).fillColor("#111827").text(d?.email || "-", col1X, doc.y + 12)
  
  doc.font("Helvetica").fontSize(9).fillColor("#6B7280").text(labels.mobile, col2X, doc.y)
  doc.font("Helvetica").fontSize(11).fillColor("#111827").text(d?.mobile || "-", col2X, doc.y + 12)
  
  doc.moveDown(0.8)

  // ===== TRIP DETAILS SECTION =====
  doc.moveDown(0.3)
  addSection(doc, `📍 ${labels.tripDetails}`)
  doc.moveDown(0.3)
  
  doc.font("Helvetica").fontSize(9).fillColor("#6B7280").text(labels.pickup, 50, doc.y)
  doc.font("Helvetica").fontSize(11).fillColor("#111827").text(d?.pickupPoint || "-", 50, doc.y + 12)
  doc.moveDown(0.8)
  
  // Arrow or separator
  doc.font("Helvetica").fontSize(10).fillColor("#9CA3AF").text("↓", 60, doc.y)
  doc.moveDown(0.4)
  
  doc.font("Helvetica").fontSize(9).fillColor("#6B7280").text(labels.dropoff, 50, doc.y)
  doc.font("Helvetica").fontSize(11).fillColor("#111827").text(d?.dropoffPoint || "-", 50, doc.y + 12)
  doc.moveDown(0.8)
  
  // Distance and Date in two columns
  doc.font("Helvetica").fontSize(9).fillColor("#6B7280").text(labels.distance, col1X, doc.y)
  doc.font("Helvetica").fontSize(11).fillColor("#111827").text(d?.distance ? `${d.distance} km` : "-", col1X, doc.y + 12)
  
  const whenText = d?.date ? format(new Date(d.date), "PPP p", { locale }) : "-"
  doc.font("Helvetica").fontSize(9).fillColor("#6B7280").text(labels.datetime, col2X, doc.y)
  doc.font("Helvetica").fontSize(11).fillColor("#111827").text(whenText, col2X, doc.y + 12)
  
  doc.moveDown(0.8)

  // ===== VEHICLE & RATE SECTION =====
  doc.moveDown(0.3)
  addSection(doc, `🚗 Vehicle & Rate`)
  doc.moveDown(0.3)
  
  doc.font("Helvetica").fontSize(9).fillColor("#6B7280").text(labels.vehicle, col1X, doc.y)
  doc.font("Helvetica").fontSize(11).fillColor("#111827").text([d?.carType, d?.carModel].filter(Boolean).join(" — ") || "-", col1X, doc.y + 12)
  
  doc.font("Helvetica").fontSize(9).fillColor("#6B7280").text(labels.rate, col2X, doc.y)
  doc.font("Helvetica-Bold").fontSize(14).fillColor(OCEAN)
  doc.text(d?.rate ? `฿ ${Number(d.rate).toLocaleString('th-TH')}` : "-", col2X, doc.y + 12)
  
  doc.moveDown(1)

  // ===== NOTES SECTION (if present) =====
  if (d?.notes) {
    doc.moveDown(0.3)
    addSection(doc, `💬 ${labels.notes}`)
    doc.moveDown(0.3)
    doc.font("Helvetica").fontSize(10).fillColor("#111827").text(d.notes, 50, doc.y, { width: doc.page.width - 100 })
    doc.moveDown(0.5)
  }

  // ===== IMPORTANT INFORMATION BOX =====
  doc.moveDown(0.5)
  const importantY = doc.y
  doc.rect(40, importantY, doc.page.width - 80, 40).fill("#FEF3C7").stroke()
  doc.font("Helvetica-Bold").fillColor("#92400E").fontSize(9)
  doc.text(`⚠️ ${labels.important}`, 50, importantY + 5, { width: doc.page.width - 100 })
  doc.font("Helvetica").fontSize(9).fillColor("#78350F")
  doc.text(labels.arriveEarly, 50, importantY + 18, { width: doc.page.width - 100 })

  // ===== FOOTER =====
  const footerY = doc.page.height - 70
  
  // Separator line
  doc.moveTo(40, footerY).lineTo(doc.page.width - 40, footerY).strokeColor("#E5E7EB").stroke()

  // Footer text
  doc.font("Helvetica").fontSize(8).fillColor("#6B7280")
  doc.text(`${labels.generated} ${format(new Date(), "PPP p", { locale })}`, 50, footerY + 8)
  doc.font("Helvetica").fontSize(8).fillColor("#6B7280")
  doc.text(`${company.phone} • ${company.email}`, 50, footerY + 18)

  // QR Code (if available)
  if (booking.voucherUrl) {
    try {
      const qrDataUrl = await QRCode.toDataURL(booking.voucherUrl, { margin: 0 })
      const qrSize = 50
      const qrX = doc.page.width - 50 - qrSize
      const qrY = footerY - qrSize - 10
      doc.image(qrDataUrl, qrX, qrY, { width: qrSize, height: qrSize })
      doc.font("Helvetica").fontSize(7).fillColor("#6B7280").text(labels.qrCaption, qrX, qrY + qrSize + 2, {
        width: qrSize,
        align: "center",
      })
    } catch {}
  }

  doc.end()
  await done
  return Buffer.concat(chunks)
}
