/**
 * Admin Payment Reminder Settings Component
 * 
 * Allows admins to:
 * - View reminder settings and statistics
 * - Customize reminder timings
 * - Enable/disable reminders
 * - Manually trigger reminder processing
 * - View reminder history
 */

"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Clock, Mail, Play, Loader } from "lucide-react"

interface ReminderSetting {
  reminderType: string
  hoursAfterBooking: number
  enabled: boolean
}

interface ReminderStats {
  reminderType: string
  hoursAfterBooking: number
  enabled: boolean
  stats: { status: string; _count: number }[]
}

export function PaymentReminderSettingsPanel() {
  const [settings, setSettings] = useState<ReminderSetting[]>([])
  const [stats, setStats] = useState<ReminderStats[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, number>>({})
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(
    null
  )

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/payment-reminders", {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch settings")
      }

      const data = await response.json()
      setSettings(data.settings)
      setStats(data.stats)
      setMessage(null)
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to fetch settings",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTriggerReminders = async () => {
    try {
      setProcessing(true)
      const response = await fetch("/api/admin/payment-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger" }),
      })

      if (!response.ok) {
        throw new Error("Failed to trigger reminders")
      }

      const data = await response.json()
      setMessage({
        type: "success",
        text: `Processed ${data.result.sent} reminders (${data.result.cancelled} bookings cancelled)`,
      })

      // Refresh settings
      await fetchSettings()
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to trigger reminders",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleSaveEdit = async (reminderType: string) => {
    try {
      const hoursAfterBooking = editValues[reminderType]

      const response = await fetch("/api/admin/payment-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-settings",
          reminderType,
          hoursAfterBooking: hoursAfterBooking ? Number(hoursAfterBooking) : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update settings")
      }

      setMessage({
        type: "success",
        text: "Settings updated successfully",
      })

      setEditing(null)
      await fetchSettings()
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update settings",
      })
    }
  }

  const handleToggleReminder = async (reminderType: string, enabled: boolean) => {
    try {
      const response = await fetch("/api/admin/payment-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-settings",
          reminderType,
          enabled: !enabled,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to toggle reminder")
      }

      setMessage({
        type: "success",
        text: `Reminder ${!enabled ? "enabled" : "disabled"}`,
      })

      await fetchSettings()
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to toggle reminder",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          message.type === "success" ? "bg-green-50 border border-green-200" :
          message.type === "error" ? "bg-red-50 border border-red-200" :
          "bg-blue-50 border border-blue-200"
        }`}>
          <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
            message.type === "success" ? "text-green-600" :
            message.type === "error" ? "text-red-600" :
            "text-blue-600"
          }`} />
          <p className={message.type === "success" ? "text-green-800" :
            message.type === "error" ? "text-red-800" :
            "text-blue-800"}>
            {message.text}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleTriggerReminders}
          disabled={processing}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <Play className="w-4 h-4" />
          {processing ? "Processing..." : "Trigger Reminders Now"}
        </button>
      </div>

      {/* Settings Cards */}
      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.reminderType} className="border rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {stat.reminderType === "FIRST_REMINDER" && "First Reminder"}
                  {stat.reminderType === "SECOND_REMINDER" && "Second Reminder"}
                  {stat.reminderType === "FINAL_WARNING" && "Final Warning"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Sent <strong>{stat.hoursAfterBooking} hours</strong> after booking creation
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stat.enabled}
                    onChange={() => handleToggleReminder(stat.reminderType, stat.enabled)}
                    className="w-4 h-4 rounded accent-purple-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {stat.enabled ? "Enabled" : "Disabled"}
                  </span>
                </label>
              </div>
            </div>

            {/* Edit Hours */}
            {editing === stat.reminderType ? (
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hours After Booking
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="240"
                    value={editValues[stat.reminderType] || stat.hoursAfterBooking}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        [stat.reminderType]: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(stat.reminderType)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{stat.hoursAfterBooking} hours</span>
                </div>
                <button
                  onClick={() => {
                    setEditing(stat.reminderType)
                    setEditValues({
                      ...editValues,
                      [stat.reminderType]: stat.hoursAfterBooking,
                    })
                  }}
                  className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded transition"
                >
                  Edit
                </button>
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              {stat.stats && stat.stats.length > 0 ? (
                stat.stats.map((s: any) => (
                  <div key={s.status} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{s._count}</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {s.status === "SENT" && "✓ Sent"}
                      {s.status === "PENDING" && "⏳ Pending"}
                      {s.status === "FAILED" && "✗ Failed"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center text-gray-500 text-sm">
                  No reminders sent yet
                </div>
              )}
            </div>

            {/* Description */}
            <div className="text-sm text-gray-600 flex items-start gap-2 pt-2 border-t">
              <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
              <div>
                {stat.reminderType === "FIRST_REMINDER" && (
                  <p>Friendly reminder that payment is due. Customer can still pay.</p>
                )}
                {stat.reminderType === "SECOND_REMINDER" && (
                  <p>Urgent reminder - payment overdue. Customer warned of possible cancellation.</p>
                )}
                {stat.reminderType === "FINAL_WARNING" && (
                  <p>Final notice - booking will be automatically cancelled if payment not received within 24 hours.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
        <h4 className="font-semibold text-blue-900">How It Works</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Reminders are automatically sent based on the schedule above</li>
          <li>Each reminder is sent only once per booking</li>
          <li>Failed reminders are retried up to 3 times (1 hour apart)</li>
          <li>After the final warning threshold, the booking is automatically cancelled</li>
          <li>Use "Trigger Reminders Now" button to manually process pending reminders</li>
        </ul>
      </div>
    </div>
  )
}
