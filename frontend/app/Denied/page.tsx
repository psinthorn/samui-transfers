"use client"
import Link from "next/link"
import Button from "@/components/ui/button"
import { useLanguage } from "@/context/LanguageContext"
import { pick } from "@/data/i18n/core"
import { adminText } from "@/data/content/admin"

export default function DeniedPage() {
  const { lang } = useLanguage()
  return (
    <section className="page-gutter page-section">
      <div className="card card-padding text-center">
        <h1 className="text-2xl font-semibold">{pick(lang, adminText.denied.title)}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{pick(lang, adminText.denied.description)}</p>
        <div className="mt-4">
          <Link href="/">
            <Button variant="secondary">{pick(lang, adminText.denied.goHome)}</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}