"use client"
import { useLanguage } from "@/context/LanguageContext"
import { pick } from "@/data/i18n/core"
import { adminText } from "@/data/content/admin"
import Link from "next/link"

export default function AdminClient({ email, role }: { email?: string; role?: string }) {
  const { lang } = useLanguage()
  
  const getTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return lang === "en" ? "Good morning" : "สวัสดีตอนเช้า"
    if (hour < 18) return lang === "en" ? "Good afternoon" : "สวัสดีตอนบ่าย"
    return lang === "en" ? "Good evening" : "สวัสดีตอนเย็น"
  }
  
  return (
    <div className="w-full space-y-6">
      {/* Header with Brand Badge */}
      <div className="space-y-4">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-[#005B9A] to-[#003d6b] text-white">
          <div className="h-8 w-8 rounded-md bg-white/20 flex items-center justify-center text-sm font-bold">
            ST
          </div>
          <span className="text-sm font-semibold">Samui Transfers</span>
        </div>

        {/* Welcome Section */}
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            {getTimeGreeting()}, {email?.split("@")[0] || "Admin"}
          </h2>
          <p className="text-slate-600">
            {pick(lang, adminText.subtitle)}
          </p>
        </div>
      </div>

      {/* Admin Info Card */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-slate-50 p-6 md:p-7">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-600">
              {pick(lang, adminText.role)}
            </p>
            <p className="text-lg font-semibold text-slate-900">
              {email}
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2 w-full sm:w-auto">
            <Link href="/dashboard/profile">
              <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-[#005B9A] bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-200">
                {lang === "en" ? "Profile" : "โปรไฟล์"}
              </button>
            </Link>
            <Link href="/dashboard/settings">
              <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-[#005B9A] rounded-lg hover:bg-[#004080] transition-colors duration-200">
                {lang === "en" ? "Settings" : "การตั้งค่า"}
              </button>
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 mt-4" />

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {lang === "en" ? "Status" : "สถานะ"}
            </p>
            <p className="text-sm font-semibold text-green-600 mt-1">
              {lang === "en" ? "Active" : "ใช้งานอยู่"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {lang === "en" ? "Access Level" : "ระดับการเข้าถึง"}
            </p>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {role === "ADMIN" ? (lang === "en" ? "Full Access" : "เข้าถึงเต็ม") : role}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {lang === "en" ? "Module Count" : "จำนวนโมดูล"}
            </p>
            <p className="text-sm font-semibold text-slate-900 mt-1">6</p>
          </div>
        </div>
      </div>

      {/* Quick Tips Section */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 md:p-5">
        <div className="flex gap-3">
          <div className="text-2xl flex-shrink-0">💡</div>
          <div>
            <p className="text-sm font-medium text-amber-900">
              {lang === "en" ? "Pro Tip" : "คำแนะนำ"}
            </p>
            <p className="text-sm text-amber-800 mt-1">
              {lang === "en" 
                ? "Click on any navigation card below to access that admin module. Hover to see more details."
                : "คลิกบนการ์ดนำทางด้านล่างเพื่อเข้าถึงโมดูลแอดมิน วางเมาส์เหนือเพื่อดูรายละเอียดเพิ่มเติม"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
