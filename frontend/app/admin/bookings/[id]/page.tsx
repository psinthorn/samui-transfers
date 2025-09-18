import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { updateBookingStatus } from "@/actions/bookings"
import { resendVoucher } from "@/actions/voucher"

export const runtime = "nodejs"

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

  async function handleUpdateStatus(formData: FormData) {
    "use server"
    const status = formData.get("status") as string
    await updateBookingStatus(id, status as any)
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
              <form action={handleUpdateStatus} className="mt-2 flex items-center gap-2 text-sm">
                <select name="status" defaultValue={booking.status} className="border rounded px-2 py-1">
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <button className="bg-[#005B9A] text-white px-3 py-1 rounded">Update</button>
              </form>
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
          </div>
        </div>
      </div>
    </main>
  )
}
