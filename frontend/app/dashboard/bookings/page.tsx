import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"

export const runtime = "nodejs"

function parseDate(value?: string) {
  if (!value) return undefined
  const d = new Date(value)
  return isNaN(d.getTime()) ? undefined : d
}

function cell(v: any) {
  return v ?? "-"
}

export default async function BookingsPage({ searchParams }: { searchParams?: Promise<Record<string, any>> }) {
  const session = await requireUser()
  const userId = (session.user as any).id as string

  const sp = (await searchParams) || {}
  const from = parseDate((sp.from as string) || undefined)
  const to = parseDate((sp.to as string) || undefined)
  const q = (sp.q as string) || ""
  const status = (sp.status as string) || ""
  const page = Math.max(1, parseInt((sp.page as string) || "1", 10))
  const pageSize = Math.min(50, Math.max(5, parseInt((sp.pageSize as string) || "10", 10)))
  const skip = (page - 1) * pageSize

  // Build where clause
  const where: any = { userId }
  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = from
    if (to) where.createdAt.lte = to
  }
  if (status) {
    where.status = status
  }

  // Basic text search across details JSON (pickup/dropoff/vehicle/date)
  if (q) {
    where.OR = [
      { requestNumber: { contains: q, mode: "insensitive" } },
      // For JSON fields, use string contains matching on serialized fields we expect
      { details: { path: ["pickupPoint"], string_contains: q, mode: "insensitive" } as any },
      { details: { path: ["dropoffPoint"], string_contains: q, mode: "insensitive" } as any },
      { details: { path: ["carType"], string_contains: q, mode: "insensitive" } as any },
      { details: { path: ["carModel"], string_contains: q, mode: "insensitive" } as any },
    ]
  }

  const bookingClient = (db as any).booking
  const [total, rows] = await Promise.all([
    bookingClient.count({ where }),
    bookingClient.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: pageSize }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">My bookings</h1>
            <p className="text-slate-600 text-sm">{total} total</p>
          </div>
          <form className="flex gap-2">
            <input className="border rounded px-2 py-1 text-sm" name="from" type="date" defaultValue={from ? from.toISOString().slice(0,10) : undefined} />
            <input className="border rounded px-2 py-1 text-sm" name="to" type="date" defaultValue={to ? to.toISOString().slice(0,10) : undefined} />
            <input className="border rounded px-2 py-1 text-sm" name="q" placeholder="Search..." defaultValue={q} />
            <select className="border rounded px-2 py-1 text-sm" name="status" defaultValue={status}>
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button className="bg-[#005B9A] text-white px-3 py-1 rounded text-sm">Filter</button>
          </form>
        </div>

        <div className="overflow-x-auto rounded border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="text-left px-3 py-2">Created</th>
                <th className="text-left px-3 py-2">Booking ID</th>
                <th className="text-left px-3 py-2">From → To</th>
                <th className="text-left px-3 py-2">Vehicle</th>
                <th className="text-left px-3 py-2">Rate</th>
                <th className="text-left px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">No bookings found</td>
                </tr>
              )}
              {rows.map((b: any) => {
                const d = b.details as any
                const vehicle = [d?.carType, d?.carModel].filter(Boolean).join(" — ") || "-"
                const route = [d?.pickupPoint, d?.dropoffPoint].filter(Boolean).join(" → ") || "-"
                return (
                  <tr key={b.id} className="border-t">
                    <td className="px-3 py-2 text-slate-700">{new Date(b.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-2 text-slate-700">
                      <Link href={`/dashboard/bookings/${b.id}`} className="text-[#005B9A] underline">
                        {cell(b.requestNumber) || b.id}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-slate-700">{route}</td>
                    <td className="px-3 py-2 text-slate-700">{vehicle}</td>
                    <td className="px-3 py-2 text-slate-700">{cell(d?.rate)}</td>
                    <td className="px-3 py-2 text-slate-700">{b.status}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <div>Page {page} of {totalPages}</div>
          <div className="flex gap-2">
            <Link className={`px-3 py-1 rounded border ${page <= 1 ? "opacity-50 pointer-events-none" : ""}`} href={{ pathname: "/dashboard/bookings", query: { ...sp, page: String(page-1), pageSize } }}>Prev</Link>
            <Link className={`px-3 py-1 rounded border ${page >= totalPages ? "opacity-50 pointer-events-none" : ""}`} href={{ pathname: "/dashboard/bookings", query: { ...sp, page: String(page+1), pageSize } }}>Next</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
