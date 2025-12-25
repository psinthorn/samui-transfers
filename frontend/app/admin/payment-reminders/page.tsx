/**
 * Admin Payment Reminders Settings Page
 */

import { PaymentReminderSettingsPanel } from "@/components/admin/PaymentReminderSettingsPanel"

export const metadata = {
  title: "Payment Reminder Settings",
  description: "Configure automated payment reminders",
}

export default function PaymentRemindersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment Reminder Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure automated payment reminders and view reminder status
        </p>
      </div>

      {/* Settings Panel */}
      <PaymentReminderSettingsPanel />
    </div>
  )
}
