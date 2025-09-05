import type { Localized } from "../i18n/core"

export type FAQItem = { q: Localized<string>; a: Localized<string> }
export type FAQSection = { category: Localized<string>; items: FAQItem[] }

export const faqs: FAQSection[] = [
  {
    category: { en: "Booking & Payment", th: "การจองและการชำระเงิน" },
    items: [
      {
        q: { en: "How do I book an airport transfer?", th: "จองบริการรับส่งสนามบินได้อย่างไร?" },
        a: { en: "Book on our website, call us, or WhatsApp.", th: "จองผ่านเว็บไซต์ โทร หรือ WhatsApp" },
      },
      {
        q: { en: "What payment methods do you accept?", th: "รับชำระเงินช่องทางใดบ้าง?" },
        a: { en: "Cash, QR (PromptPay), PayPal, bank transfer.", th: "เงินสด พร้อมเพย์ เพย์พาล โอนธนาคาร" },
      },
      {
        q: { en: "Can I modify or cancel my booking?", th: "สามารถแก้ไข/ยกเลิกการจองได้ไหม?" },
        a: { en: "Modify up to 24h before transfer; fees may apply.", th: "แก้ไขได้ถึง 24 ชม.ก่อนรับส่ง อาจมีค่าธรรมเนียม" },
      },
      {
        q: { en: "Do I need to book in advance?", th: "ต้องจองล่วงหน้าหรือไม่?" },
        a: { en: "We recommend at least 24 hours in advance.", th: "แนะนำให้จองล่วงหน้าอย่างน้อย 24 ชั่วโมง" },
      },
    ],
  },
  {
    category: { en: "Airport Pick‑up & Drop‑off", th: "การรับ‑ส่งสนามบิน" },
    items: [
      {
        q: { en: "Where will I meet my driver?", th: "นัดเจอคนขับตรงไหน?" },
        a: { en: "Arrivals area with your name sign.", th: "บริเวณผู้โดยสารขาเข้าพร้อมป้ายชื่อของคุณ" },
      },
      {
        q: { en: "What if my flight is delayed?", th: "ถ้าเที่ยวบินล่าช้าจะทำอย่างไร?" },
        a: { en: "We track flights and adjust pickup.", th: "เราติดตามเที่ยวบินและปรับเวลารับ" },
      },
      {
        q: { en: "Hotel to airport transfers?", th: "มีบริการจากโรงแรมไปสนามบินไหม?" },
        a: { en: "Yes, one‑way and round‑trip.", th: "มี ทั้งเที่ยวเดียวและไป‑กลับ" },
      },
    ],
  },
  {
    category: { en: "Vehicles & Services", th: "รถและการให้บริการ" },
    items: [
      { q: { en: "What vehicles do you offer?", th: "มีรถประเภทใดให้บริการ?" }, a: { en: "Private car, minivan, SUV.", th: "รถเก๋ง มินิแวน เอสยูวี" } },
      { q: { en: "Child seat available?", th: "มีที่นั่งเด็กหรือไม่?" }, a: { en: "Currently unavailable.", th: "ขณะนี้ยังไม่มีให้บริการ" } },
      { q: { en: "Shared transfers?", th: "มีบริการแบบแชร์หรือไม่?" }, a: { en: "Private only.", th: "บริการเฉพาะส่วนตัว" } },
    ],
  },
  {
    category: { en: "Pricing & Additional Costs", th: "ราคาและค่าใช้จ่ายเพิ่มเติม" },
    items: [
      { q: { en: "Any hidden fees?", th: "มีค่าธรรมเนียมแอบแฝงไหม?" }, a: { en: "No hidden charges.", th: "ไม่มีค่าใช้จ่ายแอบแฝง" } },
      { q: { en: "Night‑time surcharge?", th: "มีค่าบริการช่วงกลางคืนหรือไม่?" }, a: { en: "Same price 24/7.", th: "ราคาเท่ากันตลอด 24 ชั่วโมง" } },
    ],
  },
]