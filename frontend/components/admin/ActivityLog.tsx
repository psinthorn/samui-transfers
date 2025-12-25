"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader,
} from "lucide-react"
import { format } from "date-fns"

interface ActivityLogEntry {
  id: string
  action: string
  resourceType: string
  resourceId?: string
  details?: string
  actor: {
    id: string
    name?: string
    email: string
    role: string
  }
  createdAt: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

interface ActivityLogResponse {
  logs: ActivityLogEntry[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

const ACTION_COLORS: Record<string, string> = {
  // User actions
  USER_CREATED: "bg-blue-100 text-blue-800",
  USER_UPDATED: "bg-cyan-100 text-cyan-800",
  USER_DELETED: "bg-red-100 text-red-800",
  USER_ROLE_CHANGED: "bg-purple-100 text-purple-800",
  USER_DISABLED: "bg-orange-100 text-orange-800",
  USER_ENABLED: "bg-green-100 text-green-800",

  // Booking actions
  BOOKING_CREATED: "bg-blue-100 text-blue-800",
  BOOKING_CONFIRMED: "bg-green-100 text-green-800",
  BOOKING_UPDATED: "bg-cyan-100 text-cyan-800",
  BOOKING_CANCELLED: "bg-red-100 text-red-800",
  BOOKING_COMPLETED: "bg-green-100 text-green-800",

  // Payment actions
  PAYMENT_CREATED: "bg-blue-100 text-blue-800",
  PAYMENT_PROCESSED: "bg-green-100 text-green-800",
  PAYMENT_REFUNDED: "bg-orange-100 text-orange-800",
  PAYMENT_FAILED: "bg-red-100 text-red-800",

  // Driver actions
  DRIVER_ASSIGNED: "bg-indigo-100 text-indigo-800",
  DRIVER_STATUS_CHANGED: "bg-yellow-100 text-yellow-800",
  DRIVER_LOCATION_UPDATED: "bg-gray-100 text-gray-800",
  DRIVER_REMOVED: "bg-red-100 text-red-800",

  // Admin actions
  ADMIN_SETTING_CHANGED: "bg-purple-100 text-purple-800",
  ADMIN_TEMPLATE_UPDATED: "bg-pink-100 text-pink-800",
  ADMIN_BULK_ACTION: "bg-indigo-100 text-indigo-800",

  // Auth
  LOGIN: "bg-blue-100 text-blue-800",
  LOGOUT: "bg-gray-100 text-gray-800",
  LOGIN_FAILED: "bg-red-100 text-red-800",
}

export function ActivityLog() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [limit, setLimit] = useState(50)

  // Filters
  const [actionFilter, setActionFilter] = useState("")
  const [resourceTypeFilter, setResourceTypeFilter] = useState("")
  const [actorFilter, setActorFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()

      if (actionFilter) params.append("action", actionFilter)
      if (resourceTypeFilter) params.append("resourceType", resourceTypeFilter)
      if (actorFilter) params.append("actorId", actorFilter)
      if (startDate) params.append("startDate", new Date(startDate).toISOString())
      if (endDate) params.append("endDate", new Date(endDate).toISOString())
      params.append("limit", limit.toString())
      params.append("offset", offset.toString())

      const response = await fetch(`/api/admin/activity?${params}`)

      if (!response.ok) {
        throw new Error("Failed to fetch activity logs")
      }

      const data: ActivityLogResponse = await response.json()
      setLogs(data.logs)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setOffset(0)
  }, [actionFilter, resourceTypeFilter, actorFilter, startDate, endDate])

  useEffect(() => {
    fetchLogs()
  }, [offset, limit, actionFilter, resourceTypeFilter, actorFilter, startDate, endDate])

  const handleExportCSV = () => {
    const headers = [
      "Timestamp",
      "Actor",
      "Email",
      "Action",
      "Resource Type",
      "Resource ID",
      "Details",
      "IP Address",
    ]

    const rows = logs.map((log) => [
      format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss"),
      log.actor.name || "Unknown",
      log.actor.email,
      log.action,
      log.resourceType,
      log.resourceId || "-",
      log.details || "-",
      log.ipAddress || "-",
    ])

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => (typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell)).join(",")
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `activity-log-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const hasMore = offset + limit < total

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Activity Log</h2>
        <Button onClick={handleExportCSV} disabled={logs.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by action..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Actions</SelectItem>
              <SelectItem value="USER_CREATED">User Created</SelectItem>
              <SelectItem value="USER_UPDATED">User Updated</SelectItem>
              <SelectItem value="USER_ROLE_CHANGED">Role Changed</SelectItem>
              <SelectItem value="BOOKING_CREATED">Booking Created</SelectItem>
              <SelectItem value="BOOKING_CONFIRMED">Booking Confirmed</SelectItem>
              <SelectItem value="PAYMENT_PROCESSED">Payment Processed</SelectItem>
              <SelectItem value="DRIVER_ASSIGNED">Driver Assigned</SelectItem>
            </SelectContent>
          </Select>

          <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by resource..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Resources</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="BOOKING">Booking</SelectItem>
              <SelectItem value="PAYMENT">Payment</SelectItem>
              <SelectItem value="DRIVER">Driver</SelectItem>
              <SelectItem value="SETTINGS">Settings</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Start date"
          />

          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End date"
          />
        </div>

        <Button variant="outline" onClick={() => {
          setActionFilter("")
          setResourceTypeFilter("")
          setActorFilter("")
          setStartDate("")
          setEndDate("")
        }}>
          Clear Filters
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Activity table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading activity logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No activity logs found
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {format(new Date(log.createdAt), "MMM dd, HH:mm")}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="font-medium">{log.actor.name || "Unknown"}</div>
                      <div className="text-xs text-gray-500">{log.actor.email}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        ACTION_COLORS[log.action] || "bg-gray-100 text-gray-800"
                      }`}>
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{log.resourceType}</div>
                      {log.resourceId && (
                        <div className="text-xs text-gray-500 font-mono">{log.resourceId.slice(0, 8)}...</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {log.details || "-"}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-gray-500">
                      {log.ipAddress || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="px-6 py-4 border-t flex items-center justify-between bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} entries
              </div>

              <div className="flex items-center gap-2">
                <Select value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="250">250</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(offset + limit)}
                  disabled={!hasMore}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
