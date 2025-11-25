import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"

export const runtime = "nodejs"

function parseDate(value?: string) {
  if (!value) return undefined
  const d = new Date(value)
  return isNaN(d.getTime()) ? undefined : d
}

function formatDateDDMMYYYY(date: Date) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; dot: string }> = {
      PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400" },
      CONFIRMED: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
      COMPLETED: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400" },
      CANCELLED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
    }
    const style = statusMap[status] || statusMap.PENDING
    return style
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
        <p className="text-slate-600 mt-1">View and manage all your transfers</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Filters & Search</h3>
        <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">From Date</label>
            <input 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
              name="from" 
              type="date" 
              defaultValue={from ? from.toISOString().slice(0,10) : undefined} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">To Date</label>
            <input 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
              name="to" 
              type="date" 
              defaultValue={to ? to.toISOString().slice(0,10) : undefined} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <input 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
              name="q" 
              placeholder="Booking ID or location..." 
              defaultValue={q} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
              name="status" 
              defaultValue={status}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Bookings Table */}
      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No bookings found</h3>
          <p className="text-slate-600 mb-4">Start your journey with Samui Transfers today</p>
          <Link href="/booking" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Book a Transfer
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Created</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Booking ID</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Route</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Vehicle</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Rate</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((b: any) => {
                  const d = b.details as any
                  const vehicle = [d?.carType, d?.carModel].filter(Boolean).join(" ") || "-"
                  const route = [d?.pickupPoint, d?.dropoffPoint].filter(Boolean).join(" → ") || "-"
                  const statusStyle = getStatusBadge(b.status)
                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {formatDateDDMMYYYY(new Date(b.createdAt))}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link href={`/dashboard/bookings/${b.id}`} className="text-blue-600 hover:text-blue-700 font-semibold">
                          {cell(b.requestNumber) || b.id.slice(0, 8)}...
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 truncate max-w-xs" title={route}>
                        {route}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {vehicle}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        ฿{cell(d?.rate)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                          <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`}></span>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {rows.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span> ({total} total)
          </p>
          <div className="flex gap-2">
            <Link 
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                page <= 1 
                  ? "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200" 
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`} 
              href={{ pathname: "/dashboard/bookings", query: { ...sp, page: String(page-1), pageSize } }}
            >
              ← Previous
            </Link>
            <Link 
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                page >= totalPages 
                  ? "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200" 
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`} 
              href={{ pathname: "/dashboard/bookings", query: { ...sp, page: String(page+1), pageSize } }}
            >
              Next →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
