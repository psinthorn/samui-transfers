"use client"
import { useLanguage } from "@/context/LanguageContext"
import { pick } from "@/data/i18n/core"
import { adminText } from "@/data/content/admin"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLanguage()
  return (
    <section className="page-gutter page-section">
      <div className="mb-6">
        <h1 className="page-title">{pick(lang, adminText.title)}</h1>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  )
}
