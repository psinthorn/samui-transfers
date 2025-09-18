import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"

import { sendMyVoucher } from "@/actions/sendMyVoucher"
import EmailMeVoucherButton from "./EmailMeVoucherButton"
import PrintButton from "./PrintButton"

export const runtime = "nodejs"

export default async function BookingDetailsPage({ params }: { params?: Promise<{ id: string }> }) {
  const session = await requireUser()
  const user = session.user as any
  const p = (await params) || ({} as any)
  const id = p.id as string

  const booking = await (db as any).booking.findUnique({ where: { id } })
  if (!booking) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="text-xl font-semibold text-slate-900">Booking not found</h1>
          <p className="text-slate-600 mt-2">The booking you are looking for does not exist.</p>
          <Link className="text-[#005B9A] underline mt-4 inline-block" href="/dashboard/bookings">Back to bookings</Link>
        </div>
      </main>
    )
  }

  // Ownership/admin check
  const isOwner = booking.userId === user.id
  const isAdmin = user.role === "ADMIN"
  if (!isOwner && !isAdmin) {
    // Soft 403
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="text-xl font-semibold text-slate-900">Not authorized</h1>
          <p className="text-slate-600 mt-2">You do not have permission to view this booking.</p>
          <Link className="text-[#005B9A] underline mt-4 inline-block" href="/dashboard/bookings">Back to bookings</Link>
        </div>
      </main>
    )
  }

  const d = booking.details as any
  const vehicle = [d?.carType, d?.carModel].filter(Boolean).join(" — ") || "-"
  const route = [d?.pickupPoint, d?.dropoffPoint].filter(Boolean).join(" → ") || "-"

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 print:p-0">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Booking details</h1>
            <p className="text-slate-600 text-sm">ID: {booking.requestNumber || booking.id} • Status: {booking.status}</p>
          </div>
          <div className="flex gap-2">
            <Link className="px-3 py-1 rounded border" href="/dashboard/bookings">Back</Link>
            <Link className="px-3 py-1 rounded border" href={`/dashboard/bookings/${booking.id}/voucher`}>
              Voucher
            </Link>
            <EmailMeVoucherButton action={async () => { "use server"; return await sendMyVoucher(booking.id) }} />
            <a
              className="px-3 py-1 rounded border"
              href={`/api/bookings/${booking.id}/voucher`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download PDF
            </a>
            <PrintButton />
          </div>
        </div>

        <section className="bg-white border rounded p-6 print:border-0 print:rounded-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-500">Customer</h2>
              <div className="mt-2 text-slate-800 text-sm">
                <div>Name: {d?.firstName} {d?.lastName}</div>
                <div>Email: {d?.email}</div>
                <div>Mobile: {d?.mobile}</div>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-500">Booking</h2>
              <div className="mt-2 text-slate-800 text-sm">
                <div>Created: {new Date(booking.createdAt).toLocaleString()}</div>
                <div>Date / Time: {d?.date || '-'}</div>
                <div>Passengers: {d?.passengers || '-'}</div>
                <div>Flight no.: {d?.flightNo || '-'}</div>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-500">Route</h2>
              <div className="mt-2 text-slate-800 text-sm">
                <div>From: {d?.pickupPoint || '-'}</div>
                <div>To: {d?.dropoffPoint || '-'}</div>
                <div>Distance: {d?.distance || '-'}</div>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-500">Vehicle</h2>
              <div className="mt-2 text-slate-800 text-sm">
                <div>Type / Model: {vehicle}</div>
                <div>Rate: {d?.rate || '-'}</div>
              </div>
            </div>
            {d?.notes && (
              <div className="sm:col-span-2">
                <h2 className="text-sm font-semibold text-slate-500">Notes</h2>
                <p className="mt-2 text-slate-800 text-sm whitespace-pre-wrap">{d.notes}</p>
              </div>
            )}
          </div>

          {/* Redact sensitive payment fields */}
          {d?.cardNumber || d?.expiryDate || d?.cvv ? (
            <div className="sm:col-span-2 mt-6">
              <h2 className="text-sm font-semibold text-slate-500">Payment</h2>
              <p className="mt-2 text-slate-700 text-sm">Stored for request context only — sensitive fields redacted in UI/print.</p>
            </div>
          ) : null}
        </section>

        <footer className="text-center text-slate-500 text-xs mt-6 print:mt-2">
          <div>Printed from Samui Transfers — {new Date().toLocaleString()}</div>
        </footer>
      </div>
    </main>
  )
}
