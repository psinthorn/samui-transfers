import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import PrintButton from "../PrintButton"

export const runtime = "nodejs"

export default async function VoucherPage({ params }: { params?: Promise<{ id: string }> }) {
  const session = await requireUser()
  const user = session.user as any
  const p = (await params) || ({} as any)
  const id = p.id as string

  const booking = await (db as any).booking.findUnique({ where: { id } })
  if (!booking || (booking.userId !== user.id && user.role !== "ADMIN")) {
    return <div className="p-8 text-center text-slate-600">Not authorized</div>
  }
  const d = booking.details as any

  const dd = booking.details as any
  const langHint = String((dd?.lang || dd?.language || "en")).toLowerCase()
  const isTH = langHint === "th"
  const label = isTH
    ? { title: "ใบยืนยันการจอง", download: "ดาวน์โหลด PDF", print: "พิมพ์" }
    : { title: "Booking Voucher", download: "Download PDF", print: "Print" }
  return (
    <main className="p-8 print:p-0 bg-white text-slate-900">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <h1 className="text-xl font-semibold">{label.title}</h1>
          <div className="flex gap-2">
            <a
              className="text-sm px-3 py-1 rounded border"
              href={`/api/bookings/${booking.id}/voucher`}
            >
              {label.download}
            </a>
            <PrintButton />
          </div>
        </div>
        <div className="text-sm space-y-2">
          <div><strong>Booking ID:</strong> {booking.requestNumber || booking.id}</div>
          <div><strong>Name:</strong> {d?.firstName} {d?.lastName}</div>
          <div><strong>Email:</strong> {d?.email}</div>
          <div><strong>Mobile:</strong> {d?.mobile}</div>
          <div><strong>Pickup:</strong> {d?.pickupPoint}</div>
          <div><strong>Drop-off:</strong> {d?.dropoffPoint}</div>
          <div><strong>Date/Time:</strong> {d?.date}</div>
          <div><strong>Vehicle:</strong> {[d?.carType, d?.carModel].filter(Boolean).join(" — ") || '-'}</div>
          <div><strong>Rate:</strong> {d?.rate ?? '-'}</div>
          {d?.notes ? (<div><strong>Notes:</strong> {d.notes}</div>) : null}
        </div>
        <footer className="mt-8 text-xs text-slate-500 print:mt-2">
          Printed {new Date().toLocaleString()}
        </footer>
      </div>
    </main>
  )
}