"use client"

import React, { Suspense, useMemo } from "react"
import { privacy } from "@/data/legal/privacy"
import { useLanguage } from "@/context/LanguageContext"

function PrivacyContent() {
  const { lang } = useLanguage()
  const t = useMemo(() => privacy[lang] || privacy.en, [lang])

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <header className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t.legal}</p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-900">{t.title}</h1>
              <p className="mt-2 text-sm text-slate-600">{t.intro}</p>
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
            <p className="text-sm text-slate-600">{t.contact}</p>
          </div>
        </section>
      </div>
    </main>
  )
}

function PageFallback() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div className="h-6 w-64 bg-slate-200 rounded" />
          <div className="h-4 w-80 bg-slate-200 rounded" />
        </div>
      </div>
    </main>
  )
}

export default function PrivacyPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <PrivacyContent />
    </Suspense>
  )
}