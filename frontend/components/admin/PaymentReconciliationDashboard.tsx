"use client"

import React, { useState, useEffect } from "react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Download, RefreshCw, Filter, X } from "lucide-react"

interface PaymentStats {
  totalBookings: number
  totalAmount: number
  amountReceived: number
  amountPending: number
  amountFailed: number
  byMethod: Record<string, { count: number; amount: number; status: "completed" | "pending" | "failed" }>
  byDate: Array<{ date: string; received: number; pending: number; failed: number }>
  conversionRate: number
}

interface FilterState {
  paymentMethod: string
  status: string
  startDate: string
  endDate: string
  searchText: string
}

const PAYMENT_METHODS = [
  { id: "stripe", label: "Credit Card (Stripe)" },
  { id: "paypal", label: "PayPal" },
  { id: "bank_transfer", label: "Bank Transfer" },
  { id: "pay_on_tour", label: "Pay on Tour" },
  { id: "other", label: "Other" },
]

const STATUS_OPTIONS = [
  { id: "COMPLETED", label: "Completed" },
  { id: "PENDING", label: "Pending" },
  { id: "FAILED", label: "Failed" },
]

const COLORS = {
  received: "#10b981",
  pending: "#f59e0b",
  failed: "#ef4444",
  stripe: "#6366f1",
  paypal: "#0070ba",
  bank_transfer: "#1f2937",
  pay_on_tour: "#8b5cf6",
  other: "#6b7280",
}

export function PaymentReconciliationDashboard() {
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    paymentMethod: "",
    status: "",
    startDate: "",
    endDate: "",
    searchText: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  // Load data
  useEffect(() => {
    loadPaymentStats()
  }, [filters])

  const loadPaymentStats = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      if (filters.paymentMethod) query.append("paymentMethod", filters.paymentMethod)
      if (filters.status) query.append("status", filters.status)
      if (filters.startDate) query.append("startDate", filters.startDate)
      if (filters.endDate) query.append("endDate", filters.endDate)
      if (filters.searchText) query.append("search", filters.searchText)

      const response = await fetch(`/api/admin/payments/reconciliation?${query}`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to load payment stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      paymentMethod: "",
      status: "",
      startDate: "",
      endDate: "",
      searchText: "",
    })
  }

  const exportToCSV = () => {
    if (!stats) return

    const csv = [
      ["Payment Reconciliation Report"],
      ["Generated:", new Date().toLocaleString()],
      [""],
      ["Summary"],
      ["Total Bookings", stats.totalBookings],
      ["Total Amount", `฿${stats.totalAmount.toFixed(2)}`],
      ["Amount Received", `฿${stats.amountReceived.toFixed(2)}`],
      ["Amount Pending", `฿${stats.amountPending.toFixed(2)}`],
      ["Amount Failed", `฿${stats.amountFailed.toFixed(2)}`],
      ["Payment Conversion Rate", `${stats.conversionRate.toFixed(1)}%`],
      [""],
      ["By Payment Method"],
      ["Method", "Count", "Amount", "Status"],
      ...Object.entries(stats.byMethod).map(([method, data]) => [
        PAYMENT_METHODS.find(m => m.id === method)?.label || method,
        data.count,
        `฿${data.amount.toFixed(2)}`,
        data.status,
      ]),
    ]

    const csvContent = csv.map(row => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `payment-reconciliation-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#005B9A]"></div>
          <p className="mt-4 text-slate-600">Loading payment data...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Failed to load payment reconciliation data
      </div>
    )
  }

  // Pie chart data for payment methods
  const methodData = Object.entries(stats.byMethod).map(([method, data]) => ({
    name: PAYMENT_METHODS.find(m => m.id === method)?.label || method,
    value: data.amount,
    count: data.count,
  }))

  // Status breakdown
  const statusData = [
    { name: "Received", value: stats.amountReceived, color: COLORS.received },
    { name: "Pending", value: stats.amountPending, color: COLORS.pending },
    { name: "Failed", value: stats.amountFailed, color: COLORS.failed },
  ]

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Reconciliation</h1>
          <p className="text-slate-600">Track and analyze all booking payments</p>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6 gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters {Object.values(filters).some(v => v) && <span className="ml-2 bg-[#005B9A] text-white text-xs px-2 py-1 rounded">Active</span>}
          </button>
          <div className="flex gap-2">
            <button
              onClick={loadPaymentStats}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#005B9A] text-white rounded-lg hover:bg-[#004a7a] transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => handleFilterChange("paymentMethod", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005B9A]"
                >
                  <option value="">All Methods</option>
                  {PAYMENT_METHODS.map(method => (
                    <option key={method.id} value={method.id}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005B9A]"
                >
                  <option value="">All Statuses</option>
                  {STATUS_OPTIONS.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005B9A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005B9A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Booking ID..."
                  value={filters.searchText}
                  onChange={(e) => handleFilterChange("searchText", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005B9A]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-600 mb-2">Total Bookings</p>
            <p className="text-3xl font-bold text-slate-900">{stats.totalBookings}</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-600 mb-2">Total Amount</p>
            <p className="text-3xl font-bold text-slate-900">฿{(stats.totalAmount / 1000).toFixed(1)}k</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 border-l-4 border-l-green-500">
            <p className="text-sm font-medium text-slate-600 mb-2">Received</p>
            <p className="text-3xl font-bold text-green-600">฿{(stats.amountReceived / 1000).toFixed(1)}k</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 border-l-4 border-l-amber-500">
            <p className="text-sm font-medium text-slate-600 mb-2">Pending</p>
            <p className="text-3xl font-bold text-amber-600">฿{(stats.amountPending / 1000).toFixed(1)}k</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 border-l-4 border-l-red-500">
            <p className="text-sm font-medium text-slate-600 mb-2">Failed</p>
            <p className="text-3xl font-bold text-red-600">฿{(stats.amountFailed / 1000).toFixed(1)}k</p>
            <p className="text-xs text-slate-500 mt-2">({stats.conversionRate.toFixed(1)}% conversion)</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Status Breakdown - Pie Chart */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Payment Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ฿${(entry.value / 1000).toFixed(1)}k`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => `฿${(Number(value) / 1000).toFixed(1)}k`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods - Bar Chart */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Payments by Method</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={methodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => `฿${(Number(value) / 1000).toFixed(1)}k`}
                />
                <Bar dataKey="value" fill="#005B9A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Trend */}
        {stats.byDate.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Daily Payment Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.byDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => `฿${(Number(value) / 1000).toFixed(1)}k`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="received"
                  stroke={COLORS.received}
                  strokeWidth={2}
                  name="Received"
                  dot={{ fill: COLORS.received }}
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke={COLORS.pending}
                  strokeWidth={2}
                  name="Pending"
                  dot={{ fill: COLORS.pending }}
                />
                <Line
                  type="monotone"
                  dataKey="failed"
                  stroke={COLORS.failed}
                  strokeWidth={2}
                  name="Failed"
                  dot={{ fill: COLORS.failed }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
