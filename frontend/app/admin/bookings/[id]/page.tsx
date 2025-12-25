import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { resendVoucher } from "@/actions/voucher"
import { BookingStatusUpdateDialog } from "@/components/admin/BookingStatusUpdateDialog"
import { AdminBookingPaymentProof } from "@/components/admin/AdminBookingPaymentProof"

export const runtime = "nodejs"

function formatPaymentMethod(method: string): string {
  const methods: Record<string, string> = {
    stripe: "Credit Card (Stripe)",
    paypal: "PayPal",
    bank_transfer: "Bank Transfer",
    pay_on_tour: "Pay on Tour",
    other: "Other",
  }
  return methods[method] || method
}

export default async function AdminBookingDetailsPage({ params }: { params?: Promise<{ id: string }> }) {
  await requireAdmin()
  const p = (await params) || ({} as any)
  const id = p.id as string

  const booking = await db.booking.findUnique({ where: { id }, include: { user: true } })
  if (!booking) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="text-xl font-semibold text-slate-900">Booking not found</h1>
          <Link className="text-[#005B9A] underline mt-4 inline-block" href="/admin/bookings">Back to all bookings</Link>
        </div>
      </main>
    )
  }

  const d = booking.details as any
  const vehicle = [d?.carType, d?.carModel].filter(Boolean).join(" — ") || "-"
  const route = [d?.pickupPoint, d?.dropoffPoint].filter(Boolean).join(" → ") || "-"

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Admin: Booking details</h1>
            <p className="text-slate-600 text-sm">ID: {booking.requestNumber || booking.id}</p>
          </div>
          <div className="flex gap-2">
            <form action={async () => { "use server"; await resendVoucher(id) }}>
              <button className="px-3 py-1 rounded border">Resend voucher</button>
            </form>
            <a
              className="px-3 py-1 rounded border"
              href={`/api/bookings/${booking.id}/voucher`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download PDF
            </a>
            <Link className="px-3 py-1 rounded border" href="/admin/bookings">Back</Link>
          </div>
        </div>

        <div className="bg-white border rounded p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-500">User</h2>
              <div className="mt-2 text-slate-800 text-sm">
                <div>{booking.user?.email || booking.user?.name || booking.userId}</div>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-500">Status</h2>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <div className="px-3 py-1 bg-slate-100 rounded">
                  {booking.status}
                </div>
                <BookingStatusUpdateDialog
                  bookingId={booking.id}
                  currentStatus={booking.status}
                  paymentAmount={booking.paymentAmount ? Number(booking.paymentAmount) : undefined}
                />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-500">Route</h2>
              <div className="mt-2 text-slate-800 text-sm">
                <div>From: {d?.pickupPoint || '-'}</div>
                <div>To: {d?.dropoffPoint || '-'}</div>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-500">Vehicle</h2>
              <div className="mt-2 text-slate-800 text-sm">
                <div>Type / Model: {vehicle}</div>
                <div>Rate: {d?.rate || '-'}</div>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-500">Payment Status</h2>
              <div className="mt-2 text-slate-800 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    booking.paymentStatus === "COMPLETED" ? "bg-green-100 text-green-800" :
                    booking.paymentStatus === "FAILED" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {booking.paymentStatus || "PENDING"}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-500">Payment Method</h2>
              <div className="mt-2 text-slate-800 text-sm">
                <div>{booking.paymentMethod ? formatPaymentMethod(booking.paymentMethod) : "-"}</div>
                {booking.paymentAmount && (
                  <div className="text-slate-600 text-xs mt-1">Amount: ฿{Number(booking.paymentAmount).toFixed(2)}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Proof Verification Section */}
        <AdminBookingPaymentProof
          bookingId={booking.id}
          bookingReference={booking.referenceNumber || booking.id}
          paymentProofStatus={booking.paymentProofStatus || undefined}
          paymentAmount={booking.paymentAmount ? Number(booking.paymentAmount) : undefined}
        />
      </div>
    </main>
  )
}

