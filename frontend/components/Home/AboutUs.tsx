"use client"

import React, { useEffect, useMemo, useState } from "react"
import { type Lang, pick } from "@/data/i18n/core"
import { hero } from "@/data/content/hero"

type Props = {
  // If provided, component becomes controlled; selector is hidden unless showLanguageSelector=true
  lang?: Lang
  className?: string
  titleOverride?: string
  subtitleOverride?: string
  showLanguageSelector?: boolean
}

const LABELS = {
  en: {
    kicker: "About",
    title: "About Us",
    subtitle: "Local transfer service in Koh Samui",
    language: "Language",
    sections: { welcome: "Welcome", mission: "Our mission" },
  },
  th: {
    kicker: "เกี่ยวกับเรา",
    title: "เกี่ยวกับเรา",
    subtitle: "บริการรถรับส่งท้องถิ่นบนเกาะสมุย",
    language: "ภาษา",
    sections: { welcome: "ยินดีต้อนรับ", mission: "พันธกิจของเรา" },
  },
}

export default function AboutUsSection({
  lang,
  className = "",
  titleOverride,
  subtitleOverride,
  showLanguageSelector,
}: Props) {
  const [localLang, setLocalLang] = useState<Lang>("en")
  const effectiveLang = (lang ?? localLang) as Lang
  const labels = LABELS[effectiveLang]

  // Initialize from ?lang or browser language (no useSearchParams to avoid CSR bailout)
  useEffect(() => {
    if (lang) return
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    const q = (url.searchParams.get("lang") || "").toLowerCase()
    if (q === "en" || q === "th") {
      setLocalLang(q as Lang)
    } else {
      const nav = navigator.language?.toLowerCase() || ""
      setLocalLang(nav.startsWith("th") ? "th" : "en")
    }
  }, [lang])

  const onChangeLang = (value: Lang) => {
    if (!lang) setLocalLang(value)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.set("lang", value)
      window.history.replaceState({}, "", url.toString())
    }
  }

  const content = useMemo(
    () => ({
      welcome: pick(effectiveLang, hero.welcome),
      mission: pick(effectiveLang, hero.mission),
    }),
    [effectiveLang]
  )

  const shouldShowSelector = showLanguageSelector ?? (lang == null)

  return (
    <section className={`w-full ${className}`}>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <header className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{labels.kicker}</p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-900">
                {titleOverride ?? labels.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {subtitleOverride ?? labels.subtitle}
              </p>
            </div>
            {shouldShowSelector && (
              <div className="shrink-0">
                <label className="sr-only" htmlFor="lang">
                  {labels.language}
                </label>
                <select
                  id="lang"
                  value={effectiveLang}
                  onChange={(e) => onChangeLang(e.target.value as Lang)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-primary/30"
                >
                  <option value="en">English</option>
                  <option value="th">ไทย</option>
                </select>
              </div>
            )}
          </div>
        </header>

        <section className="rounded-xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200">
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-semibold text-slate-900">{labels.sections.welcome}</h3>
              <p className="mt-1 text-sm text-slate-700">{content.welcome}</p>
            </div>
            <div className="border-t border-slate-200 pt-5">
              <h3 className="text-base font-semibold text-slate-900">{labels.sections.mission}</h3>
              <p className="mt-1 text-sm text-slate-700">{content.mission}</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}