/**
 * Admin SMS Settings Panel
 * 
 * Features:
 * - View SMS templates for all message types
 * - Edit SMS templates
 * - View SMS statistics
 * - Send test SMS messages
 * - Retry failed messages
 */

"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SMSTemplate {
  id: string
  messageType: string
  template: string
  enabled: boolean
  maxLength: number
}

interface SMSStats {
  totalMessages: number
  sentMessages: number
  failedMessages: number
  pendingMessages: number
  successRate: string
}

export function SMSSettingsPanel() {
  const [templates, setTemplates] = useState<SMSTemplate[]>([])
  const [stats, setStats] = useState<SMSStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [editedTemplate, setEditedTemplate] = useState<Partial<SMSTemplate>>({})
  const [testPhoneNumber, setTestPhoneNumber] = useState("")
  const [testMessageType, setTestMessageType] = useState("BOOKING_CONFIRMATION")
  const [testLoading, setTestLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/sms")
      const data = await response.json()

      if (data.success) {
        setTemplates(data.templates)
        setStats(data.statistics)
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch SMS settings" })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTemplate = async (template: SMSTemplate) => {
    try {
      setSaving(true)
      const response = await fetch("/api/admin/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-settings",
          templates: [
            {
              messageType: template.messageType,
              template: editedTemplate.template || template.template,
            },
          ],
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: "SMS template updated successfully" })
        setEditing(null)
        setEditedTemplate({})
        fetchSettings()
      } else {
        setMessage({ type: "error", text: data.error })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save SMS template" })
    } finally {
      setSaving(false)
    }
  }

  const handleSendTest = async () => {
    if (!testPhoneNumber) {
      setMessage({ type: "error", text: "Please enter a phone number" })
      return
    }

    try {
      setTestLoading(true)
      const response = await fetch("/api/admin/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-test",
          phoneNumber: testPhoneNumber,
          messageType: testMessageType,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: "Test SMS sent successfully!" })
        setTestPhoneNumber("")
      } else {
        setMessage({ type: "error", text: data.error })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to send test SMS" })
    } finally {
      setTestLoading(false)
    }
  }

  const handleRetryFailed = async () => {
    try {
      setSaving(true)
      const response = await fetch("/api/admin/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry-failed" }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: data.message })
        fetchSettings()
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to retry failed messages" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading SMS settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>SMS Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">{stats.totalMessages}</div>
                <div className="text-sm text-gray-600">Total Messages</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">{stats.sentMessages}</div>
                <div className="text-sm text-gray-600">Sent</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded">
                <div className="text-2xl font-bold text-red-600">{stats.failedMessages}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded">
                <div className="text-2xl font-bold text-yellow-600">{stats.successRate}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test SMS */}
      <Card>
        <CardHeader>
          <CardTitle>Send Test SMS</CardTitle>
          <CardDescription>Send a test message to verify SMS functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              type="tel"
              placeholder="+66900000000"
              value={testPhoneNumber}
              onChange={(e) => setTestPhoneNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Message Type</label>
            <select
              value={testMessageType}
              onChange={(e) => setTestMessageType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {templates.map((t) => (
                <option key={t.messageType} value={t.messageType}>
                  {t.messageType}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={handleSendTest} disabled={testLoading} className="w-full">
            {testLoading ? "Sending..." : "Send Test SMS"}
          </Button>
        </CardContent>
      </Card>

      {/* SMS Templates */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">SMS Templates</h3>
          <Button
            onClick={handleRetryFailed}
            disabled={saving}
            variant="outline"
            size="sm"
          >
            {saving ? "Processing..." : "Retry Failed Messages"}
          </Button>
        </div>

        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="text-base">{template.messageType}</CardTitle>
              <CardDescription>
                Character limit: {template.maxLength} | Status: {template.enabled ? "Enabled" : "Disabled"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing === template.id ? (
                <>
                  <Textarea
                    value={editedTemplate.template || template.template}
                    onChange={(e) =>
                      setEditedTemplate({ ...editedTemplate, template: e.target.value })
                    }
                    rows={4}
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSaveTemplate(template)}
                      disabled={saving}
                      size="sm"
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      onClick={() => {
                        setEditing(null)
                        setEditedTemplate({})
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="whitespace-pre-wrap">{template.template}</p>
                  </div>
                  <Button
                    onClick={() => {
                      setEditing(template.id)
                      setEditedTemplate(template)
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Edit Template
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Available Placeholders Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Template Placeholders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded">{"{bookingReference}"}</code>
            </div>
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded">{"{amount}"}</code>
            </div>
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded">{"{currency}"}</code>
            </div>
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded">{"{driverName}"}</code>
            </div>
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded">{"{driverPhone}"}</code>
            </div>
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded">{"{pickupTime}"}</code>
            </div>
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded">{"{customerName}"}</code>
            </div>
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded">{"{eta}"}</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
