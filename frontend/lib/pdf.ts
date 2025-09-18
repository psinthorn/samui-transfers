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
    email: "Email",
    mobile: "Mobile",
    pickup: "Pickup",
    dropoff: "Drop-off",
    datetime: "Date / Time",
    vehicle: "Vehicle",
    rate: "Rate",
    notes: "Notes",
    generated: "Generated",
  },
  th: {
    voucher: "ใบยืนยันการจอง",
    qrCaption: "สแกนเพื่อเปิดดู",
    bookingId: "รหัสการจอง",
    status: "สถานะ",
    name: "ชื่อ",
    email: "อีเมล",
    mobile: "มือถือ",
    pickup: "จุดรับ",
    dropoff: "จุดส่ง",
    datetime: "วัน/เวลา",
    vehicle: "รถ",
    rate: "ราคา",
    notes: "หมายเหตุ",
    generated: "สร้างเมื่อ",
  },
}

function addField(doc: PDFKit.PDFDocument, label: string, value?: string | number) {
  const v = (value ?? "-").toString()
  doc.fontSize(10).fillColor("#6B7280").text(label)
  doc.fontSize(12).fillColor("#111827").text(v)
  doc.moveDown(0.5)
}

export async function renderVoucherPdf(
  booking: VoucherPayload,
  lang: Lang = LANG.EN
): Promise<Buffer> {
  const d = booking.details || {}
  const labels = LABELS[lang] || LABELS.en
  const locale = lang === LANG.TH ? thLocale : enUS

  const doc = new PDFDocument({ size: "A4", margin: 50 })
  const chunks: Buffer[] = []
  doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
  const done = new Promise<void>((resolve) => doc.on("end", () => resolve()))

  // Header band
  const headerHeight = 80
  doc.rect(0, 0, doc.page.width, headerHeight).fill(OCEAN)

  if (logoBuffer) {
    try {
      doc.image(logoBuffer, 50, 18, { width: 110, fit: [110, 44] })
    } catch {}
  }

  doc.fillColor("#ffffff").fontSize(20)
  const titleX = logoBuffer ? 170 : 50
  doc.text(company.name, titleX, 20, { align: "left" })

  doc.fontSize(13).fillColor("#ffffff").text(labels.voucher, titleX, 46, { align: "left" })

  doc.moveDown(2)
  doc.fillColor("#111827")
  doc.y = headerHeight + 20

  // Content
  addField(doc, labels.bookingId, booking.requestNumber || booking.id)
  addField(doc, labels.status, booking.status)
  addField(doc, labels.name, [d?.firstName, d?.lastName].filter(Boolean).join(" ") || "-")
  addField(doc, labels.email, d?.email)
  addField(doc, labels.mobile, d?.mobile)
  addField(doc, labels.pickup, d?.pickupPoint)
  addField(doc, labels.dropoff, d?.dropoffPoint)
  const whenText = d?.date ? format(new Date(d.date), "PPP p", { locale }) : "-"
  addField(doc, labels.datetime, whenText)
  addField(doc, labels.vehicle, [d?.carType, d?.carModel].filter(Boolean).join(" — ") || "-")
  addField(doc, labels.rate, d?.rate)
  if (d?.notes) addField(doc, labels.notes, d.notes)

  // Footer
  const footerY = doc.page.height - 80
  doc
    .moveTo(50, footerY)
    .lineTo(doc.page.width - 50, footerY)
    .strokeColor("#E5E7EB")
    .stroke()

  doc
    .fontSize(9)
    .fillColor("#6B7280")
    .text(`${labels.generated} ${format(new Date(), "PPP p", { locale })}  •  ${company.phone}  •  ${company.email}`,
      50, footerY + 10, { align: "left" })

  // QR code (voucher link) on the right side above footer
  if (booking.voucherUrl) {
    try {
      const qrDataUrl = await QRCode.toDataURL(booking.voucherUrl, { margin: 0 })
      const qrY = footerY - 70
      doc.image(qrDataUrl, doc.page.width - 50 - 72, qrY, { width: 72, height: 72 })
      doc.fontSize(8).fillColor("#6B7280").text(labels.qrCaption, doc.page.width - 50 - 72, qrY + 74, {
        width: 72,
        align: "center",
      })
    } catch {}
  }

  doc.end()
  await done
  return Buffer.concat(chunks)
}
