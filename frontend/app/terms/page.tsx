"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

type Lang = "en" | "th"

const messages: Record<Lang, any> = {
  en: {
    legal: "Legal",
    title: "Terms & Conditions",
    intro: "Please review before booking.",
    sections: [
      {
        h: "Booking & Payments",
        items: [
          "Payment: 100% deposit required to confirm your booking.",
          "Pricing: All prices in THB; taxes/fees included unless stated otherwise.",
        ],
      },
      {
        h: "Cancellations & Changes",
        items: [
          "Cancellation: ≥ 72 hours before pickup — full refund of deposit.",
          "Cancellation: 24–72 hours before pickup — 70% refund within 5–7 business days.",
          "Cancellation: < 24 hours or no‑show — non‑refundable.",
          "Changes: One free change up to 24 hours before pickup (subject to availability; fare differences may apply).",
        ],
      },
      {
        h: "Pickup, Waiting & Delays",
        items: [
          "Waiting time: Airport pickups include 60 minutes free; other pickups include 15 minutes free. Extra waiting may incur charges or require a new booking.",
          "Delays: We monitor flight delays and will adjust pickup when possible. Significant delays may require rescheduling.",
          "Force majeure: Not liable for delays caused by events beyond our control (weather, traffic incidents, etc.).",
        ],
      },
      {
        h: "Passengers, Luggage & Safety",
        items: [
          "Passengers & luggage: Passenger count must match the booking. Oversized luggage or extra items may require a larger vehicle and additional fees.",
          "Child seats: Available on request; please specify in Notes so we can confirm availability.",
          "Conduct & safety: No smoking or open alcohol in vehicles. Seat belts are required at all times.",
        ],
      },
    ],
    accept: "By booking, you acknowledge and accept these terms. For questions, please contact support.",
    language: "Language",
  },
  th: {
    legal: "กฎหมาย",
    title: "ข้อตกลงและเงื่อนไข",
    intro: "โปรดอ่านก่อนทำการจอง",
    sections: [
      {
        h: "การจองและการชำระเงิน",
        items: [
          "การชำระเงิน: ต้องชำระเงินมัดจำ 100% เพื่อยืนยันการจอง",
          "ราคา: แสดงเป็นสกุลเงินบาท (THB) รวมภาษี/ค่าธรรมเนียมแล้ว เว้นแต่จะระบุเป็นอย่างอื่น",
        ],
      },
      {
        h: "การยกเลิกและการเปลี่ยนแปลง",
        items: [
          "การยกเลิก: ≥ 72 ชั่วโมงก่อนรับ — คืนมัดจำเต็มจำนวน",
          "การยกเลิก: 24–72 ชั่วโมงก่อนรับ — คืน 70% ภายใน 5–7 วันทำการ",
          "การยกเลิก: น้อยกว่า 24 ชั่วโมง หรือไม่มาใช้บริการ — ไม่สามารถขอคืนเงิน",
          "การเปลี่ยนแปลง: เปลี่ยนแปลงได้ฟรี 1 ครั้งภายใน 24 ชั่วโมงก่อนรับ (ขึ้นกับความพร้อมให้บริการ และอาจมีส่วนต่างราคา)",
        ],
      },
      {
        h: "การรับ-ส่ง เวลารอ และความล่าช้า",
        items: [
          "เวลารอ: รับที่สนามบินรวมเวลารอฟรี 60 นาที; จุดรับอื่น ๆ รวมฟรี 15 นาที อาจมีค่าใช้จ่ายเพิ่มเติมหากรอเกินกำหนดหรืออาจต้องทำการจองใหม่",
          "ความล่าช้า: เราติดตามเที่ยวบินและจะปรับเวลารับตามสมควร กรณีล่าช้าจำนวนมากอาจต้องเลื่อนเวลา",
          "เหตุสุดวิสัย: ไม่รับผิดชอบต่อความล่าช้าที่เกิดจากเหตุการณ์นอกเหนือการควบคุม (สภาพอากาศ อุบัติเหตุจราจร ฯลฯ)",
        ],
      },
      {
        h: "ผู้โดยสาร สัมภาระ และความปลอดภัย",
        items: [
          "ผู้โดยสารและสัมภาระ: จำนวนผู้โดยสารต้องตรงตามการจอง สัมภาระขนาดใหญ่หรือต้องการพื้นที่เพิ่มอาจต้องใช้รถที่ใหญ่ขึ้นและมีค่าใช้จ่ายเพิ่มเติม",
          "ที่นั่งเด็ก: มีให้ตามคำขอ โปรดระบุในช่องหมายเหตุเพื่อยืนยันความพร้อม",
          "มารยาทและความปลอดภัย: ห้ามสูบบุหรี่หรือดื่มแอลกอฮอล์ในรถ ต้องคาดเข็มขัดนิรภัยตลอดเวลา",
        ],
      },
    ],
    accept: "เมื่อทำการจอง ถือว่าคุณยอมรับข้อตกลงและเงื่อนไขเหล่านี้ หากมีคำถามโปรดติดต่อฝ่ายสนับสนุน",
    language: "ภาษา",
  },
}

export default function TermsPage() {
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
    // Update URL query without reload
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
              <label className="sr-only" htmlFor="lang">
                {t.language}
              </label>
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
                {sec.items.map((it: string, i: number) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </div>
          ))}

          <p className="mt-5 text-xs text-slate-500">{t.accept}</p>
        </section>
      </div>
    </main>
  )
}