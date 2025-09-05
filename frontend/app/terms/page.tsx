"use client"

import React, { useEffect, useMemo, useState } from "react"
import { type Lang } from "@/data/i18n/core"
import { terms } from "@/data/legal/terms"

export default function TermsPage() {
  const [lang, setLang] = useState<Lang>("en")

  useEffect(() => {
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    const q = (url.searchParams.get("lang") || "").toLowerCase()
    if (q === "en" || q === "th") {
      setLang(q as Lang)
    } else {
      const nav = navigator.language?.toLowerCase() || ""
      setLang(nav.startsWith("th") ? "th" : "en")
    }
  }, [])

  const t = useMemo(() => terms[lang] || terms.en, [lang])

  const onChangeLang = (value: Lang) => {
    setLang(value)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.set("lang", value)
      window.history.replaceState({}, "", url.toString())
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <header className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t.legal}</p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-900">{t.title}</h1>
              <p className="mt-2 text-sm text-slate-600">{t.intro}</p>
            </div>
            <div className="shrink-0">
              <label className="sr-only" htmlFor="lang">{t.language}</label>
              <select
                id="lang"
                value={lang}
                onChange={(e) => onChangeLang(e.target.value as Lang)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-primary/30"
              >
                <option value="en">English</option>
                <option value="th">ไทย</option>
              </select>
            </div>
          </div>
        </header>

        <section className="rounded-xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200">
          <div className="space-y-6">
            {t.sections.map((sec: any, i: number) => (
              <div key={i} className={i > 0 ? "pt-6 border-t border-slate-200" : ""}>
                <h2 className="text-base font-semibold text-slate-900">{sec.h}</h2>
                <ul className="mt-3 list-disc pl-5 space-y-2 text-sm text-slate-700">
                  {sec.items.map((item: string, j: number) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="text-sm text-slate-600">{t.accept}</p>
          </div>
        </section>
      </div>
    </main>
  )
}