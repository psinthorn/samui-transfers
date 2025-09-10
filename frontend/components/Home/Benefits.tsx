"use client"

import React, { useEffect, useMemo, useState } from "react"
import { type Lang, pick } from "@/data/i18n/core"
import { whyChooseUs } from "@/data/content/whyChooseUs"

type Props = {
  lang?: Lang
  className?: string
  titleOverride?: string
  subtitleOverride?: string
  showLanguageSelector?: boolean
}

const LABELS = {
  en: {
    kicker: "About",
    title: "Benefits",
    subtitle: "Local, safe, reliable transfers",
    language: "Language",
  },
  th: {
    kicker: "เกี่ยวกับเรา",
    title: "จุดเด่นของเรา",
    subtitle: "บริการรับส่งท้องถิ่น ปลอดภัย เชื่อถือได้",
    language: "ภาษา",
  },
}

export default function BenefitsSection({
  lang,
  className = "",
  titleOverride,
  subtitleOverride,
  showLanguageSelector,
}: Props) {
  const [localLang, setLocalLang] = useState<Lang>("en")
  const effectiveLang = (lang ?? localLang) as Lang
  const labels = LABELS[effectiveLang]

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

  const items = useMemo(
    () =>
      whyChooseUs.map((item) => ({
        title: pick(effectiveLang, item.title),
        desc: pick(effectiveLang, item.desc),
      })),
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
          <ul className="divide-y divide-slate-200">
            {items.map((item, idx) => (
              <li key={idx} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CheckIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}