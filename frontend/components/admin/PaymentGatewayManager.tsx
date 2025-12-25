"use client"

import { useEffect, useState } from "react"
import { Eye, EyeOff, ChevronUp, ChevronDown, Trash2, Plus, Key } from "lucide-react"
import { PaymentGatewayCredentials } from "./PaymentGatewayCredentials"

interface PaymentGateway {
  id: string
  type: string
  displayName: string
  description?: string
  isPublic: boolean
  enabled: boolean
  displayOrder: number
  icon?: string
  processingTime?: string
  fees?: string
  metadata?: any
}

interface CreateFormData {
  type: string
  displayName: string
  description: string
  icon: string
  processingTime: string
  fees: string
}

export function PaymentGatewayManager() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedCredentialsGateway, setSelectedCredentialsGateway] = useState<PaymentGateway | null>(null)
  const [createForm, setCreateForm] = useState<CreateFormData>({
    type: "",
    displayName: "",
    description: "",
    icon: "💳",
    processingTime: "",
    fees: "",
  })
  const [error, setError] = useState<string>("")

  // Fetch gateways on mount
  useEffect(() => {
    fetchGateways()
  }, [])

  const fetchGateways = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/payment-gateways")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setGateways(data)
    } catch (error) {
      console.error("Error fetching gateways:", error)
      setError("Failed to fetch gateways")
    } finally {
      setLoading(false)
    }
  }

  const togglePublic = async (id: string, currentValue: boolean) => {
    try {
      setSaving(true)
      setError("")
      const response = await fetch("/api/admin/payment-gateways", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPublic: !currentValue }),
      })
      if (!response.ok) throw new Error("Failed to update")
      const updated = await response.json()
      setGateways((prev) => prev.map((g) => (g.id === id ? updated : g)))
    } catch (error) {
      console.error("Error updating gateway:", error)
      setError("Failed to update gateway")
    } finally {
      setSaving(false)
    }
  }

  const toggleEnabled = async (id: string, currentValue: boolean) => {
    try {
      setSaving(true)
      setError("")
      const response = await fetch("/api/admin/payment-gateways", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled: !currentValue }),
      })
      if (!response.ok) throw new Error("Failed to update")
      const updated = await response.json()
      setGateways((prev) => prev.map((g) => (g.id === id ? updated : g)))
    } catch (error) {
      console.error("Error updating gateway:", error)
      setError("Failed to update gateway")
    } finally {
      setSaving(false)
    }
  }

  const moveOrder = async (id: string, direction: "up" | "down") => {
    const index = gateways.findIndex((g) => g.id === id)
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === gateways.length - 1)
    ) {
      return
    }

    try {
      setSaving(true)
      setError("")

      const newIndex = direction === "up" ? index - 1 : index + 1
      const currentOrder = gateways[index].displayOrder
      const swapOrder = gateways[newIndex].displayOrder

      // Update both gateways
      await Promise.all([
        fetch("/api/admin/payment-gateways", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, displayOrder: swapOrder }),
        }),
        fetch("/api/admin/payment-gateways", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: gateways[newIndex].id,
            displayOrder: currentOrder,
          }),
        }),
      ])

      // Refresh gateways
      await fetchGateways()
    } catch (error) {
      console.error("Error reordering gateways:", error)
      setError("Failed to reorder gateways")
    } finally {
      setSaving(false)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.type || !createForm.displayName) {
      setError("Type and Display Name are required")
      return
    }

    try {
      setSaving(true)
      setError("")
      const response = await fetch("/api/admin/payment-gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create gateway")
      }

      // Reset form and refresh
      setCreateForm({
        type: "",
        displayName: "",
        description: "",
        icon: "💳",
        processingTime: "",
        fees: "",
      })
      setShowCreateForm(false)
      await fetchGateways()
    } catch (error: any) {
      console.error("Error creating gateway:", error)
      setError(error.message || "Failed to create gateway")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    try {
      setSaving(true)
      setError("")
      const response = await fetch(`/api/admin/payment-gateways?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      // Refresh gateways
      await fetchGateways()
    } catch (error) {
      console.error("Error deleting gateway:", error)
      setError("Failed to delete gateway")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin">⏳</div>
          <p className="mt-2 text-slate-600">Loading payment gateways...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Active Methods:</strong>{" "}
          {gateways.filter((g) => g.enabled && g.isPublic).length} of{" "}
          {gateways.length} available to customers
        </p>
      </div>

      {/* Create New Gateway Button */}
      <div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          disabled={saving}
        >
          <Plus className="h-4 w-4" />
          Add New Payment Gateway
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Create New Payment Gateway
          </h3>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., stripe, paypal, google_pay"
                  value={createForm.type}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, type: e.target.value.toLowerCase() })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Display Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Google Pay"
                  value={createForm.displayName}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, displayName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Icon
                </label>
                <input
                  type="text"
                  placeholder="e.g., 🔵"
                  value={createForm.icon}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, icon: e.target.value })
                  }
                  maxLength={5}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>

              {/* Processing Time */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Processing Time
                </label>
                <input
                  type="text"
                  placeholder="e.g., Instant, 2-3 hours"
                  value={createForm.processingTime}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, processingTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>

              {/* Fees */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fees
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2.9% + 10 THB"
                  value={createForm.fees}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, fees: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                placeholder="Brief description for customers..."
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                disabled={saving}
              >
                {saving ? "Creating..." : "Create Gateway"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Gateways Grid */}
      <div className="grid gap-4 grid-cols-1">
        {gateways.map((gateway, index) => (
          <div
            key={gateway.id}
            className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Gateway Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{gateway.icon || "💳"}</span>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {gateway.displayName}
                    </h3>
                    {gateway.description && (
                      <p className="text-xs text-slate-600 mt-0.5">
                        {gateway.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  {gateway.processingTime && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">
                        Processing Time
                      </p>
                      <p className="text-sm text-slate-900">
                        {gateway.processingTime}
                      </p>
                    </div>
                  )}
                  {gateway.fees && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">
                        Fees
                      </p>
                      <p className="text-sm text-slate-900">{gateway.fees}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-2">
                {/* Toggle Public/Private */}
                <button
                  onClick={() => togglePublic(gateway.id, gateway.isPublic)}
                  disabled={saving}
                  className={`p-2 rounded-lg border transition-colors ${
                    gateway.isPublic
                      ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  } disabled:opacity-50`}
                  title={
                    gateway.isPublic ? "Shown to customers" : "Hidden from customers"
                  }
                >
                  {gateway.isPublic ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>

                {/* Enable/Disable Toggle */}
                <button
                  onClick={() => toggleEnabled(gateway.id, gateway.enabled)}
                  disabled={saving}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                    gateway.enabled
                      ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  } disabled:opacity-50`}
                  title={gateway.enabled ? "Active" : "Disabled"}
                >
                  {gateway.enabled ? "✓ Active" : "✗ Disabled"}
                </button>

                {/* Credentials Button */}
                {["stripe", "paypal", "bank_transfer"].includes(gateway.type) && (
                  <button
                    onClick={() => setSelectedCredentialsGateway(gateway)}
                    disabled={saving}
                    className="p-2 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-50"
                    title="Manage credentials"
                  >
                    <Key className="h-4 w-4" />
                  </button>
                )}

                {/* Move Up/Down */}
                <div className="flex gap-1">
                  <button
                    onClick={() => moveOrder(gateway.id, "up")}
                    disabled={saving || index === 0}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                    title="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveOrder(gateway.id, "down")}
                    disabled={saving || index === gateways.length - 1}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                    title="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(gateway.id, gateway.displayName)}
                  disabled={saving}
                  className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Delete gateway"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                <span className="font-mono text-slate-600">{gateway.type}</span>
              </span>
              {!gateway.isPublic && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                  Hidden
                </span>
              )}
              {!gateway.enabled && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                  Disabled
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {gateways.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">No payment gateways yet</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Your First Gateway
          </button>
        </div>
      )}

      {/* Credentials Modal */}
      {selectedCredentialsGateway && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                Manage Credentials
              </h2>
              <button
                onClick={() => setSelectedCredentialsGateway(null)}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <PaymentGatewayCredentials
                gatewayId={selectedCredentialsGateway.id}
                gatewayType={selectedCredentialsGateway.type}
                gatewayName={selectedCredentialsGateway.displayName}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
