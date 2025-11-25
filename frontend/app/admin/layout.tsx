"use client"
import { useLanguage } from "@/context/LanguageContext"
import { pick } from "@/data/i18n/core"
import { adminText } from "@/data/content/admin"
import Link from "next/link"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLanguage()
  
  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="page-gutter flex items-center justify-between h-16 md:h-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-slate-500 hover:text-slate-700 transition-colors">
              {lang === "en" ? "Home" : "หน้าแรก"}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-900">
              {pick(lang, adminText.title)}
            </span>
          </div>
          
          {/* Admin Badge */}
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-blue-700">
              {lang === "en" ? "Admin Panel" : "แผงผู้ดูแล"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="page-gutter page-section">
        {/* Section Header */}
        <div className="mb-8 md:mb-10">
          <h1 className="page-title text-4xl md:text-5xl font-bold text-slate-900 mb-2">
            {pick(lang, adminText.title)}
          </h1>
          <p className="text-slate-600">
            {pick(lang, adminText.subtitle)}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 md:space-y-10">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            {lang === "en" 
              ? "Samui Transfers Admin Dashboard v1.0"
              : "แดชบอร์ดผู้ดูแล Samui Transfers v1.0"}
          </p>
        </div>
      </div>
    </section>
  )
}
