"use client"
import { useLanguage } from "@/context/LanguageContext"
import { pick } from "@/data/i18n/core"
import { adminText } from "@/data/content/admin"

export default function AdminClient({ email, role }: { email?: string; role?: string }) {
  const { lang } = useLanguage()
  return (
    <div className="space-y-4">
      <p className="text-slate-700">
        {pick(lang, adminText.welcome)}, {email} (role: {role})
      </p>
      <div className="card card-padding">
        <ul className="list-disc pl-5 space-y-1">
          <li>{pick(lang, adminText.menu.manageBookings)}</li>
          <li>{pick(lang, adminText.menu.vehiclesRates)}</li>
          <li>{pick(lang, adminText.menu.contentPages)}</li>
          <li>{pick(lang, adminText.menu.users)}</li>
        </ul>
      </div>
    </div>
  )
}
