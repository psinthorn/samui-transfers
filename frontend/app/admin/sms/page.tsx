import { SMSSettingsPanel } from "@/components/admin/SMSSettingsPanel"

export const metadata = {
  title: "SMS Settings | Admin",
  description: "Manage SMS notification templates and settings",
}

export default function SMSSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SMS Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage SMS notification templates and configure notification preferences
        </p>
      </div>

      <SMSSettingsPanel />
    </div>
  )
}
