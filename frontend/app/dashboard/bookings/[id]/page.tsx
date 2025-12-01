import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { MapPin, User, Calendar, Car, MessageSquare, ArrowRight, FileText, Mail, Download, Printer } from "lucide-react"

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
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="rounded-lg bg-white border border-slate-200 shadow-sm p-6 sm:p-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Booking not found</h1>
            <p className="text-slate-600 mt-3 text-sm sm:text-base">The booking you are looking for does not exist.</p>
            <Link className="text-primary hover:underline mt-6 inline-block font-medium" href="/dashboard/bookings">
              ← Back to bookings
            </Link>
          </div>
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
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="rounded-lg bg-white border border-slate-200 shadow-sm p-6 sm:p-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Not authorized</h1>
            <p className="text-slate-600 mt-3 text-sm sm:text-base">You do not have permission to view this booking.</p>
            <Link className="text-primary hover:underline mt-6 inline-block font-medium" href="/dashboard/bookings">
              ← Back to bookings
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const d = booking.details as any
  const vehicle = [d?.carType, d?.carModel].filter(Boolean).join(" — ") || "-"
  const route = [d?.pickupPoint, d?.dropoffPoint].filter(Boolean).join(" → ") || "-"

  // Format date to DD/MM/YYYY
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8 print:p-0 sm:px-6">
        {/* Header */}
        <div className="mb-6 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Booking Details</h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                <span className="font-mono text-slate-500">{booking.requestNumber || booking.id}</span>
                <span className="mx-2">•</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                  booking.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                  booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {booking.status}
                </span>
              </p>
            </div>
            <Link className="text-primary hover:underline text-sm font-medium self-start sm:self-auto" href="/dashboard/bookings">
              ← Back to bookings
            </Link>
          </div>

          {/* Action buttons - Mobile first stacked, then 2 columns, then horizontal */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-row gap-2 flex-wrap">
            <Link 
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
              href={`/dashboard/bookings/${booking.id}/voucher`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">View</span> Voucher
            </Link>
            <EmailMeVoucherButton action={async () => { "use server"; return await sendMyVoucher(booking.id) }} />
            <a
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
              href={`/api/bookings/${booking.id}/voucher`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </a>
            <PrintButton />
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-4">
          {/* Route Card - Prominent */}
          <section className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Trip Route</h2>
            </div>
            <div className="space-y-3 ml-8">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pickup</p>
                <p className="text-sm sm:text-base text-slate-900 font-medium mt-1">{d?.pickupPoint || '-'}</p>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Dropoff</p>
                <p className="text-sm sm:text-base text-slate-900 font-medium mt-1">{d?.dropoffPoint || '-'}</p>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Distance</p>
                <p className="text-sm text-slate-700 mt-1">{d?.distance ? `${d.distance} km` : '-'}</p>
              </div>
            </div>
          </section>

          {/* Customer & Booking Info - 2 column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Card */}
            <section className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-start gap-3 mb-4">
                <User className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <h2 className="text-lg font-semibold text-slate-900">Passenger</h2>
              </div>
              <div className="space-y-3 ml-8">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</p>
                  <p className="text-sm text-slate-900 font-medium mt-1">{d?.firstName} {d?.lastName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</p>
                  <a href={`mailto:${d?.email}`} className="text-sm text-primary hover:underline mt-1 break-all">{d?.email}</a>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mobile</p>
                  <p className="text-sm text-slate-900 mt-1">{d?.mobile || '-'}</p>
                </div>
              </div>
            </section>

            {/* Booking Info Card */}
            <section className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-start gap-3 mb-4">
                <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <h2 className="text-lg font-semibold text-slate-900">Booking Info</h2>
              </div>
              <div className="space-y-3 ml-8">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pickup Date</p>
                  <p className="text-sm text-slate-900 font-medium mt-1">{formatDate(d?.date)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Passengers</p>
                  <p className="text-sm text-slate-900 mt-1">{d?.passengers || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Flight Number</p>
                  <p className="text-sm text-slate-900 mt-1">{d?.flightNo || '-'}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Vehicle & Rate Card */}
          <section className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
              <Car className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <h2 className="text-lg font-semibold text-slate-900">Vehicle & Rate</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-8">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Vehicle</p>
                <p className="text-sm sm:text-base text-slate-900 font-medium mt-1">{vehicle}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Rate</p>
                <p className="text-sm sm:text-base text-slate-900 font-medium mt-1">
                  {d?.rate ? `฿ ${Number(d.rate).toLocaleString('th-TH')}` : '-'}
                </p>
              </div>
            </div>
          </section>

          {/* Notes Card - if present */}
          {d?.notes && (
            <section className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-start gap-3 mb-4">
                <MessageSquare className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <h2 className="text-lg font-semibold text-slate-900">Special Requests</h2>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap ml-8">{d.notes}</p>
            </section>
          )}

          {/* Metadata */}
          <div className="text-center text-slate-500 text-xs mt-8 print:mt-4">
            <p>Created on {new Date(booking.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p className="mt-1">Printed from Samui Transfers — {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>
    </main>
  )
}
