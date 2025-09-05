"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

type Lang = "en" | "th"

const messages: Record<Lang, any> = {
  en: {
    legal: "Legal",
    title: "Privacy Policy",
    intro: "Your privacy and data protection.",
    sections: [
      { h: "Information we collect", items: [
        "Contact details: name, email, phone number.",
        "Trip details: pickup/drop-off, dates/times, passengers, notes.",
        "Technical: IP, device, and usage analytics (cookies).",
      ]},
      { h: "How we use your data", items: [
        "Provide and manage bookings and customer support.",
        "Send confirmations, updates, and service messages.",
        "Improve services, security, and site performance.",
      ]},
      { h: "Legal bases & retention", items: [
        "Contract performance (fulfilling your booking).",
        "Legitimate interests (service improvement, security).",
        "Consent where required (marketing, cookies).",
        "We keep data only as long as necessary for the purposes described or to comply with law.",
      ]},
      { h: "Sharing & third parties", items: [
        "Trusted providers (e.g., email, hosting, analytics) under data protection agreements.",
        "Authorities where required by law.",
        "We do not sell personal data.",
      ]},
      { h: "Your rights", items: [
        "Access, correct, delete, or export your data.",
        "Object to or restrict processing; withdraw consent at any time.",
        "Contact us to exercise rights or make a complaint.",
      ]},
    ],
    contact: "For privacy requests, contact: booking@samui-transfers.com",
    language: "Language",
  },
  th: {
    legal: "กฎหมาย",
    title: "นโยบายความเป็นส่วนตัว",
    intro: "ความเป็นส่วนตัวและการคุ้มครองข้อมูลของคุณ",
    sections: [
      { h: "ข้อมูลที่เราเก็บรวบรวม", items: [
        "ข้อมูลติดต่อ: ชื่อ อีเมล หมายเลขโทรศัพท์",
        "รายละเอียดการเดินทาง: จุดรับ–ส่ง วันที่/เวลา จำนวนผู้โดยสาร หมายเหตุ",
        "ข้อมูลทางเทคนิค: IP อุปกรณ์ และสถิติการใช้งาน (คุกกี้)",
      ]},
      { h: "วิธีที่เราใช้ข้อมูลของคุณ", items: [
        "ให้บริการและจัดการการจอง รวมถึงการสนับสนุนลูกค้า",
        "ส่งการยืนยัน อัปเดต และข้อความเกี่ยวกับการให้บริการ",
        "พัฒนาบริการ ความปลอดภัย และประสิทธิภาพของเว็บไซต์",
      ]},
      { h: "ฐานทางกฎหมายและระยะเวลาเก็บรักษา", items: [
        "การปฏิบัติตามสัญญา (เพื่อให้บริการตามการจองของคุณ)",
        "ผลประโยชน์โดยชอบด้วยกฎหมาย (การพัฒนาบริการ ความปลอดภัย)",
        "ความยินยอมเมื่อจำเป็น (การตลาด คุกกี้)",
        "เราจะเก็บข้อมูลเท่าที่จำเป็นตามวัตถุประสงค์ที่ระบุไว้หรือเพื่อปฏิบัติตามกฎหมาย",
      ]},
      { h: "การเปิดเผยข้อมูลและบุคคลที่สาม", items: [
        "ผู้ให้บริการที่เชื่อถือได้ (เช่น อีเมล โฮสติ้ง วิเคราะห์การใช้งาน) ภายใต้ข้อตกลงคุ้มครองข้อมูล",
        "หน่วยงานของรัฐเมื่อกฎหมายกำหนด",
        "เราไม่ขายข้อมูลส่วนบุคคล",
      ]},
      { h: "สิทธิของคุณ", items: [
        "ขอเข้าถึง แก้ไข ลบ หรือขอสำเนาข้อมูล",
        "คัดค้านหรือจำกัดการประมวลผล; ถอนความยินยอมได้ทุกเมื่อ",
        "ติดต่อเราเพื่อใช้สิทธิหรือยื่นเรื่องร้องเรียน",
      ]},
    ],
    contact: "สำหรับคำขอด้านความเป็นส่วนตัว ติดต่อ: booking@samui-transfers.com",
    language: "ภาษา",
  },
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Suspense fallback={<div className="p-4 text-sm text-slate-600">Loading…</div>}>
        <PrivacyContent />
      </Suspense>
    </main>
  )
}

function PrivacyContent() {
  const searchParams = useSearchParams()
  const [lang, setLang] = useState<Lang>("en")

  useEffect(() => {
    const q = (searchParams?.get("lang") || "").toLowerCase()
    if (q === "en" || q === "th") {
      setLang(q as Lang)
    } else if (typeof window !== "undefined") {
      const nav = navigator.language?.toLowerCase() || ""
      setLang(nav.startsWith("th") ? "th" : "en")
    }
  }, [searchParams])

  const t = useMemo(() => messages[lang], [lang])

  const onChangeLang = (value: Lang) => {
    setLang(value)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.set("lang", value)
      window.history.replaceState({}, "", url.toString())
    }
  }

  return (
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
        {t.sections.map((sec: any) => (
          <div key={sec.h} className="mt-0 first:mt-0">
            <h2 className="mt-0 text-base sm:text-lg font-semibold text-slate-900">{sec.h}</h2>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
              {sec.items.map((it: string, i: number) => <li key={i}>{it}</li>)}
            </ul>
          </div>
        ))}
        <p className="mt-5 text-xs text-slate-500">{t.contact}</p>
      </section>
    </div>
  )
}