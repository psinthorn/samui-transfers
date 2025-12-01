import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { FileDown, Printer, Check, MapPin, User, Calendar, Car, DollarSign, MessageSquare } from "lucide-react"
import PrintButton from "../PrintButton"

export const runtime = "nodejs"

export default async function VoucherPage({ params }: { params?: Promise<{ id: string }> }) {
  const session = await requireUser()
  const user = session.user as any
  const p = (await params) || ({} as any)
  const id = p.id as string

  const booking = await (db as any).booking.findUnique({ where: { id } })
  if (!booking || (booking.userId !== user.id && user.role !== "ADMIN")) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Not Authorized</h1>
            <p className="text-slate-600 mt-2">You do not have permission to view this voucher.</p>
          </div>
        </div>
      </main>
    )
  }

  const d = booking.details as any
  const dd = booking.details as any
  const langHint = String((dd?.lang || dd?.language || "en")).toLowerCase()
  const isTH = langHint === "th"

  const label = isTH
    ? {
        title: "ใบยืนยันการจอง",
        download: "ดาวน์โหลด PDF",
        print: "พิมพ์",
        bookingConfirmed: "การจองของคุณได้รับการยืนยัน",
        bookingDetails: "รายละเอียดการจอง",
        passengerInfo: "ข้อมูลผู้โดยสาร",
        tripDetails: "รายละเอียดการเดินทาง",
        contactInfo: "ข้อมูลติดต่อ",
        id: "รหัสการจอง",
        status: "สถานะ",
        name: "ชื่อ",
        passengers: "จำนวนผู้โดยสาร",
        email: "อีเมล",
        mobile: "มือถือ",
        pickup: "จุดรับ",
        dropoff: "จุดส่ง",
        distance: "ระยะทาง",
        date: "วันที่/เวลา",
        vehicle: "ประเภทรถ",
        rate: "ราคา",
        notes: "หมายเหตุ",
        flightNo: "หมายเลขเที่ยวบิน",
        printed: "พิมพ์เมื่อ",
      }
    : {
        title: "Booking Voucher",
        download: "Download PDF",
        print: "Print",
        bookingConfirmed: "Your Booking is Confirmed",
        bookingDetails: "Booking Details",
        passengerInfo: "Passenger Information",
        tripDetails: "Trip Details",
        contactInfo: "Contact Information",
        id: "Booking ID",
        status: "Status",
        name: "Name",
        passengers: "Passengers",
        email: "Email",
        mobile: "Mobile",
        pickup: "Pickup",
        dropoff: "Drop-off",
        distance: "Distance",
        date: "Date / Time",
        vehicle: "Vehicle",
        rate: "Rate",
        notes: "Special Requests",
        flightNo: "Flight Number",
        printed: "Printed",
      }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const statusColor = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    CONFIRMED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Header with Actions - Print Hidden */}
        <div className="print:hidden mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{label.title}</h1>
            <p className="text-slate-600 text-sm mt-1">{booking.requestNumber || booking.id}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
              href={`/api/bookings/${booking.id}/voucher`}
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">{label.download}</span>
              <span className="sm:hidden">PDF</span>
            </a>
            <PrintButton />
          </div>
        </div>

        {/* Main Voucher Card - Optimized for Print */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden print:shadow-none print:border-0 print:rounded-none">
          
          {/* Header Band with Status */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-6 sm:py-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold">{label.bookingConfirmed}</h2>
                <p className="text-blue-100 text-sm mt-1">{label.id}: {booking.requestNumber || booking.id}</p>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
                statusColor[booking.status as keyof typeof statusColor] || statusColor.PENDING
              } border`}>
                <Check className="w-4 h-4" />
                {booking.status}
              </div>
            </div>
          </div>

          {/* Content - Stacked on Mobile, Grid on Desktop */}
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* Passenger Information */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">{label.passengerInfo}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-7">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label.name}</p>
                  <p className="text-sm text-slate-900 font-medium mt-1">{d?.firstName} {d?.lastName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label.passengers}</p>
                  <p className="text-sm text-slate-900 mt-1">{d?.passengers || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label.email}</p>
                  <p className="text-sm text-slate-900 break-all mt-1">{d?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label.mobile}</p>
                  <p className="text-sm text-slate-900 mt-1">{d?.mobile || '-'}</p>
                </div>
              </div>
            </section>

            {/* Trip Details */}
            <section className="border-t border-slate-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">{label.tripDetails}</h3>
              </div>
              <div className="ml-7 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label.pickup}</p>
                  <p className="text-sm text-slate-900 font-medium mt-1">{d?.pickupPoint || '-'}</p>
                </div>
                <div className="flex justify-center text-slate-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label.dropoff}</p>
                  <p className="text-sm text-slate-900 font-medium mt-1">{d?.dropoffPoint || '-'}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label.distance}</p>
                    <p className="text-sm text-slate-900 mt-1">{d?.distance ? `${d.distance} km` : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label.date}</p>
                    <p className="text-sm text-slate-900 mt-1">{formatDate(d?.date)}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Vehicle & Rate */}
            <section className="border-t border-slate-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Car className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">Vehicle & Rate</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-7">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label.vehicle}</p>
                  <p className="text-sm text-slate-900 font-medium mt-1">{[d?.carType, d?.carModel].filter(Boolean).join(' — ') || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label.rate}</p>
                  <p className="text-lg text-slate-900 font-bold mt-1">{d?.rate ? `฿ ${Number(d.rate).toLocaleString('th-TH')}` : '-'}</p>
                </div>
                {d?.flightNo && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label.flightNo}</p>
                    <p className="text-sm text-slate-900 mt-1">{d.flightNo}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Special Requests */}
            {d?.notes && (
              <section className="border-t border-slate-200 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-slate-900">{label.notes}</h3>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap ml-7">{d.notes}</p>
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-4">
            <p className="text-xs text-slate-500 text-center">
              {label.printed} {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Important Information */}
        <div className="mt-6 print:mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs sm:text-sm text-blue-900">
            <strong>📋 {isTH ? 'หลักสำคัญ: ' : 'Important: '}</strong>
            {isTH 
              ? 'กรุณาเก็บใบยืนยันนี้ไว้ เมื่อถึงเวลาที่นัด ขอให้มาถึงจุดรับส่วนครึ่งชั่วโมงก่อนเวลาที่นัด'
              : 'Please keep this confirmation. Arrive 30 minutes before your scheduled pickup time.'}
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          main {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </main>
  )
}