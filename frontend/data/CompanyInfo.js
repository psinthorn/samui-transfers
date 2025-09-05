// Centralized bilingual content (EN/TH) for the site.
// Safe for client-side import (uses only NEXT_PUBLIC_* envs).

const digitsOnly = (v = "") => String(v).replace(/[^\d]/g, "")

export const LANG = {
  EN: "en",
  TH: "th",
}

export const companyBck = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || "Samui Transfers",
  tagline: {
    en: process.env.NEXT_PUBLIC_COMPANY_TAGLINE_EN || "A Local Transfer Service",
    th: process.env.NEXT_PUBLIC_COMPANY_TAGLINE_TH || "บริการรถรับส่งท้องถิ่นบนเกาะสมุย",
  },
  address: {
    en:
      process.env.NEXT_PUBLIC_COMPANY_ADDRESS_EN ||
      "9/38 Moo 6, Bophut, Koh Samui, Surat Thani 84320, Thailand",
    th:
      process.env.NEXT_PUBLIC_COMPANY_ADDRESS_TH ||
      "9/38 หมู่ 6 ต.บ่อผุด อ.เกาะสมุย จ.สุราษฎร์ธานี 84320",
  },
  phone: process.env.NEXT_PUBLIC_PHONE || "(+66) 099 108 7999",
  whatsapp: digitsOnly(process.env.NEXT_PUBLIC_WHATSAPP || "66991087999"),
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "info@samui-transfers.com",
  facebook:
    process.env.NEXT_PUBLIC_FACEBOOK_URL ||
    "https://www.facebook.com/profile.php?id=61578880422159",
  managedBy: {
    name: process.env.NEXT_PUBLIC_MANAGED_BY_NAME || "F2 Co., Ltd.",
    website: process.env.NEXT_PUBLIC_MANAGED_BY_WEBSITE || "https://www.f2.co.th",
    taxId: process.env.NEXT_PUBLIC_MANAGED_BY_TAX_ID || "",
  },
}

export const hero = {
  welcome: {
    en:
      "Welcome to Samui-Transfers.com, your trusted local transfer service on the beautiful island of Koh Samui. We provide safe, reliable, and comfortable transportation for travelers, families, and groups across the island.",
    th:
      "ยินดีต้อนรับสู่ Samui-Transfers.com บริการรถรับส่งท้องถิ่นที่คุณวางใจได้บนเกาะสมุย เราให้บริการเดินทางที่ปลอดภัย เชื่อถือได้ และสะดวกสบายสำหรับนักท่องเที่ยว ครอบครัว และกลุ่มเดินทางทั่วทั้งเกาะ",
  },
  mission: {
    en:
      "Our mission is to make your journey smooth and stress‑free with reliable scheduling, friendly drivers, and modern vehicles from pickup to drop‑off.",
    th:
      "ภารกิจของเราคือทำให้การเดินทางของคุณราบรื่นและไร้กังวล ด้วยการนัดหมายที่ตรงเวลา คนขับที่เป็นมิตร และรถที่ทันสมัย ตั้งแต่รับจนถึงส่ง",
  },
}

export const rates = [
  {
    en: "Start from 350 THB",
    th: "ราคาเริ่มต้น 350 บาท",
  },
  {
    en: "After 5 km, calculate based on distance",
    th: "หลังจาก 5 กิโลเมตร คิดราคาตามระยะทาง",
  },
  {
    en: "Free cancellation up to 24 hours before your transfer",
    th: "ยกเลิกฟรีภายใน 24 ชั่วโมงก่อนวันรับส่ง",
  },
  {
    en: "No hidden fees, no extra charges",
    th: "ไม่มีค่าธรรมเนียมแอบแฝง ไม่มีค่าใช้จ่ายเพิ่มเติม",
  },
  {
    en: "24/7 customer support",
    th: "บริการลูกค้า 24 ชั่วโมง",
  },
]

export const whyChooseUs = [
  {
    title: { en: "Ready", th: "พร้อมให้บริการ" },
    desc: { en: "We’re always prepared for your trip.", th: "พร้อมสำหรับการเดินทางของคุณเสมอ" },
  },
  {
    title: { en: "Reliable", th: "เชื่อถือได้" },
    desc: { en: "On time, every time.", th: "ตรงเวลา ทุกครั้ง" },
  },
  {
    title: { en: "Safe", th: "ปลอดภัย" },
    desc: { en: "Your safety is our top priority.", th: "ความปลอดภัยของคุณคือสิ่งสำคัญที่สุด" },
  },
  {
    title: { en: "Friendly", th: "เป็นมิตร" },
    desc: { en: "Helpful, local drivers.", th: "คนขับท้องถิ่นที่เป็นมิตรและช่วยเหลือดี" },
  },
  {
    title: { en: "Fair Pricing", th: "ราคายุติธรรม" },
    desc: { en: "Pay only for the distance you travel.", th: "จ่ายตามระยะทางจริงที่เดินทาง" },
  },
]

export const vehicles = [
  {
    type: { en: "Minibus", th: "มินิบัส" },
    seats: 7,
    luggage: { en: "Large", th: "ขนาดใหญ่" },
    desc: {
      en:
        "Spacious, air‑conditioned minivans ideal for families, small groups, or extra luggage. Perfect for airport transfers, tours, or group trips around Koh Samui.",
      th:
        "มินิแวนกว้างขวางพร้อมแอร์ เหมาะสำหรับครอบครัว กลุ่มเล็ก หรือสัมภาระมาก เหมาะกับรับส่งสนามบิน ท่องเที่ยว หรือเดินทางเป็นกลุ่มรอบเกาะสมุย",
    },
  },
  {
    type: { en: "SUV", th: "เอสยูวี" },
    seats: 4,
    luggage: { en: "Medium", th: "ขนาดกลาง" },
    desc: {
      en:
        "Stylish and comfortable SUVs for up to 4 passengers. Smooth ride and extra luggage space—great for couples, small families, or business travelers.",
      th:
        "เอสยูวีสวยหรูนั่งสบาย รองรับได้ถึง 4 คน ขับนุ่มนวล มีพื้นที่เก็บสัมภาระเพิ่ม เหมาะสำหรับคู่รัก ครอบครัวเล็ก หรือผู้เดินทางเพื่อธุรกิจ",
    },
  },
]

export const services = [
  {
    en: "Airport Transfers: Hassle‑free transfers to and from Samui International Airport.",
    th: "บริการรับส่งสนามบิน: รับส่งไป‑กลับสนามบินสมุยแบบไร้กังวล",
  },
  {
    en: "Hotel Transfers: Convenient pickups and drop‑offs at your hotel or resort.",
    th: "บริการรับส่งโรงแรม: รับ‑ส่งถึงโรงแรมหรือรีสอร์ทของคุณอย่างสะดวกสบาย",
  },
  {
    en: "Private Tours: Customized tours around Koh Samui’s top attractions.",
    th: "ทัวร์ส่วนตัว: เที่ยวรอบเกาะสมุยตามต้องการ",
  },
  {
    en: "Group Transfers: Spacious vehicles for larger groups or families.",
    th: "บริการสำหรับกลุ่ม: รถกว้างขวางรองรับกลุ่มใหญ่หรือครอบครัว",
  },
]

export const paymentMethods = [
  { en: "Cash (THB)", th: "เงินสด (บาท)" },
  { en: "QR Code (PromptPay)", th: "คิวอาร์โค้ด (พร้อมเพย์)" },
  { en: "PayPal", th: "เพย์พาล" },
  { en: "Bank Transfer", th: "โอนเงินผ่านธนาคาร" },
]

export const faqs = [
  {
    category: { en: "Booking & Payment", th: "การจองและการชำระเงิน" },
    items: [
      {
        q: {
          en: "How do I book an airport transfer?",
          th: "จองบริการรับส่งสนามบินได้อย่างไร?",
        },
        a: {
          en: "Book on our website, call us, or message via WhatsApp.",
          th: "จองผ่านเว็บไซต์ โทรหาเรา หรือส่งข้อความผ่าน WhatsApp",
        },
      },
      {
        q: { en: "What payment methods do you accept?", th: "รับชำระเงินช่องทางใดบ้าง?" },
        a: {
          en: "Cash, QR (PromptPay), PayPal, and bank transfer.",
          th: "เงินสด คิวอาร์พร้อมเพย์ เพย์พาล และโอนผ่านธนาคาร",
        },
      },
      {
        q: { en: "Can I modify or cancel my booking?", th: "สามารถแก้ไข/ยกเลิกการจองได้ไหม?" },
        a: {
          en: "Yes. Modify up to 24 hours before your transfer. Cancellations may be subject to a fee.",
          th: "ได้ สามารถแก้ไขได้ภายใน 24 ชั่วโมงก่อนวันรับส่ง การยกเลิกอาจมีค่าธรรมเนียม",
        },
      },
      {
        q: { en: "Do I need to book in advance?", th: "ต้องจองล่วงหน้าหรือไม่?" },
        a: {
          en: "We recommend at least 24 hours in advance.",
          th: "แนะนำให้จองล่วงหน้าอย่างน้อย 24 ชั่วโมง",
        },
      },
    ],
  },
  {
    category: { en: "Airport Pick‑up & Drop‑off", th: "การรับ‑ส่งสนามบิน" },
    items: [
      {
        q: { en: "Where will I meet my driver?", th: "นัดเจอคนขับตรงไหน?" },
        a: {
          en: "At the arrivals area with a sign displaying your name.",
          th: "บริเวณผู้โดยสารขาเข้า จะมีป้ายชื่อของคุณ",
        },
      },
      {
        q: { en: "What if my flight is delayed?", th: "ถ้าเที่ยวบินล่าช้าจะทำอย่างไร?" },
        a: {
          en: "We track flights and adjust pickup time.",
          th: "เราติดตามเที่ยวบินและปรับเวลารับตามความเหมาะสม",
        },
      },
      {
        q: {
          en: "Do you offer hotel to airport transfers?",
          th: "มีบริการจากโรงแรมไปสนามบินหรือไม่?",
        },
        a: { en: "Yes, one‑way and round‑trip.", th: "มี บริการทั้งเที่ยวเดียวและไป‑กลับ" },
      },
    ],
  },
  {
    category: { en: "Vehicles & Services", th: "รถและการให้บริการ" },
    items: [
      {
        q: { en: "What types of vehicles do you offer?", th: "มีรถประเภทใดให้บริการ?" },
        a: { en: "Private car, minivan, and SUV.", th: "รถเก๋ง มินิแวน และเอสยูวี" },
      },
      {
        q: { en: "Is there a child seat available?", th: "มีที่นั่งเด็กหรือไม่?" },
        a: { en: "Currently unavailable.", th: "ขออภัย ขณะนี้ยังไม่มีให้บริการ" },
      },
      {
        q: { en: "Do you offer shared transfers?", th: "มีบริการแบบแชร์หรือไม่?" },
        a: { en: "No, private transfers only.", th: "ไม่มี ให้บริการเฉพาะส่วนตัวเท่านั้น" },
      },
    ],
  },
  {
    category: { en: "Pricing & Additional Costs", th: "ราคาและค่าใช้จ่ายเพิ่มเติม" },
    items: [
      {
        q: { en: "Any hidden fees?", th: "มีค่าธรรมเนียมแอบแฝงไหม?" },
        a: { en: "No hidden charges.", th: "ไม่มีค่าใช้จ่ายแอบแฝง" },
      },
      {
        q: { en: "Extra for night‑time transfers?", th: "มีค่าบริการช่วงกลางคืนหรือไม่?" },
        a: { en: "No, same price 24/7.", th: "ไม่มี ราคาเท่ากันตลอด 24 ชั่วโมง" },
      },
    ],
  },
]

export const terms = {
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
    accept:
      "By booking, you acknowledge and accept these terms. For questions, please contact support.",
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
          "การเปลี่ยนแปลง: เปลี่ยนแปลงได้ฟรี 1 ครั้งภายใน 24 ชั่วโมงก่อนรับ (ขึ้นกับความพร้อม และอาจมีส่วนต่างราคา)",
        ],
      },
      {
        h: "การรับ‑ส่ง เวลารอ และความล่าช้า",
        items: [
          "เวลารอ: รับที่สนามบินรวมเวลารอฟรี 60 นาที; จุดรับอื่น ๆ รวมฟรี 15 นาที อาจมีค่าใช้จ่ายเพิ่มเติมหากรอเกินกำหนดหรืออาจต้องทำการจองใหม่",
          "ความล่าช้า: เราติดตามเที่ยวบินและจะปรับเวลารับตามสมควร กรณีล่าช้าจำนวนมากอาจต้องเลื่อนเวลา",
          "เหตุสุดวิสัย: ไม่รับผิดชอบต่อความล่าช้าที่เกิดจากเหตุการณ์นอกเหนือการควบคุม",
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
    accept:
      "เมื่อทำการจอง ถือว่าคุณยอมรับข้อตกลงและเงื่อนไขเหล่านี้ หากมีคำถามโปรดติดต่อฝ่ายสนับสนุน",
    language: "ภาษา",
  },
}

export const privacy = {
  en: {
    legal: "Legal",
    title: "Privacy Policy",
    intro: "Your privacy and data protection.",
    sections: [
      {
        h: "Information we collect",
        items: [
          "Contact details: name, email, phone number.",
          "Trip details: pickup/drop‑off, dates/times, passengers, notes.",
          "Technical: IP, device, and usage analytics (cookies).",
        ],
      },
      {
        h: "How we use your data",
        items: [
          "Provide and manage bookings and customer support.",
          "Send confirmations, updates, and service messages.",
          "Improve services, security, and site performance.",
        ],
      },
      {
        h: "Legal bases & retention",
        items: [
          "Contract performance (fulfilling your booking).",
          "Legitimate interests (service improvement, security).",
          "Consent where required (marketing, cookies).",
          "We keep data only as long as necessary or to comply with law.",
        ],
      },
      {
        h: "Sharing & third parties",
        items: [
          "Trusted providers (email, hosting, analytics) under data protection agreements.",
          "Authorities where required by law.",
          "We do not sell personal data.",
        ],
      },
      {
        h: "Your rights",
        items: [
          "Access, correct, delete, or export your data.",
          "Object to or restrict processing; withdraw consent at any time.",
          "Contact us to exercise rights or make a complaint.",
        ],
      },
    ],
    contact: "For privacy requests, contact: booking@samui-transfers.com",
    language: "Language",
  },
  th: {
    legal: "กฎหมาย",
    title: "นโยบายความเป็นส่วนตัว",
    intro: "ความเป็นส่วนตัวและการคุ้มครองข้อมูลของคุณ",
    sections: [
      {
        h: "ข้อมูลที่เราเก็บรวบรวม",
        items: [
          "ข้อมูลติดต่อ: ชื่อ อีเมล หมายเลขโทรศัพท์",
          "รายละเอียดการเดินทาง: จุดรับ–ส่ง วันที่/เวลา จำนวนผู้โดยสาร หมายเหตุ",
          "ข้อมูลทางเทคนิค: IP อุปกรณ์ และสถิติการใช้งาน (คุกกี้)",
        ],
      },
      {
        h: "วิธีที่เราใช้ข้อมูลของคุณ",
        items: [
          "ให้บริการและจัดการการจอง รวมถึงการสนับสนุนลูกค้า",
          "ส่งการยืนยัน อัปเดต และข้อความเกี่ยวกับการให้บริการ",
          "พัฒนาบริการ ความปลอดภัย และประสิทธิภาพของเว็บไซต์",
        ],
      },
      {
        h: "ฐานทางกฎหมายและระยะเวลาเก็บรักษา",
        items: [
          "การปฏิบัติตามสัญญา (เพื่อให้บริการตามการจองของคุณ)",
          "ผลประโยชน์โดยชอบด้วยกฎหมาย (การพัฒนาบริการ ความปลอดภัย)",
          "ความยินยอมเมื่อจำเป็น (การตลาด คุกกี้)",
          "เราจะเก็บข้อมูลเท่าที่จำเป็นตามวัตถุประสงค์ที่ระบุไว้หรือเพื่อปฏิบัติตามกฎหมาย",
        ],
      },
      {
        h: "การเปิดเผยข้อมูลและบุคคลที่สาม",
        items: [
          "ผู้ให้บริการที่เชื่อถือได้ (เช่น อีเมล โฮสติ้ง วิเคราะห์การใช้งาน) ภายใต้ข้อตกลงคุ้มครองข้อมูล",
          "หน่วยงานของรัฐเมื่อกฎหมายกำหนด",
          "เราไม่ขายข้อมูลส่วนบุคคล",
        ],
      },
      {
        h: "สิทธิของคุณ",
        items: [
          "ขอเข้าถึง แก้ไข ลบ หรือขอสำเนาข้อมูล",
          "คัดค้านหรือจำกัดการประมวลผล; ถอนความยินยอมได้ทุกเมื่อ",
          "ติดต่อเราเพื่อใช้สิทธิหรือยื่นเรื่องร้องเรียน",
        ],
      },
    ],
    contact: "สำหรับคำขอด้านความเป็นส่วนตัว ติดต่อ: booking@samui-transfers.com",
    language: "ภาษา",
  },
}

// Quick links
export const companyLinks = {
  whatsappHref: `https://wa.me/${company.whatsapp}`,
  emailHref: `mailto:${company.email}`,
  phoneHref: `tel:${digitsOnly(company.phone)}`,
  facebook: company.facebook,
}

// Helper: select localized string { en, th } -> string
export function pick(lang = LANG.EN, value) {
  if (!value) return ""
  if (typeof value === "string") return value
  return value[lang] || value.en || value.th || ""
}

// Build a fully localized view for easy consumption in components
export function getContent(lang = LANG.EN) {
  return {
    company: {
      name: company.name,
      tagline: pick(lang, company.tagline),
      address: pick(lang, company.address),
      phone: company.phone,
      whatsapp: company.whatsapp,
      email: company.email,
      facebook: company.facebook,
      managedBy: { ...company.managedBy },
    },
    links: companyLinks,
    hero: {
      welcome: pick(lang, hero.welcome),
      mission: pick(lang, hero.mission),
    },
    rates: rates.map((x) => pick(lang, x)),
    whyChooseUs: whyChooseUs.map((x) => ({
      title: pick(lang, x.title),
      desc: pick(lang, x.desc),
    })),
    vehicles: vehicles.map((v) => ({
      type: pick(lang, v.type),
      seats: v.seats,
      luggage: pick(lang, v.luggage),
      desc: pick(lang, v.desc),
    })),
    services: services.map((s) => pick(lang, s)),
    paymentMethods: paymentMethods.map((m) => pick(lang, m)),
    faqs: faqs.map((sec) => ({
      category: pick(lang, sec.category),
      items: sec.items.map((it) => ({ q: pick(lang, it.q), a: pick(lang, it.a) })),
    })),
    legal: {
      terms: terms[lang] || terms.en,
      privacy: privacy[lang] || privacy.en,
    },
  }
}

// Backward-compatible shim that re-exports the new modular data.
// You can delete this file after updating imports to "@/data".

import { company, companyLinks, hero, rates, whyChooseUs, vehicles, services, paymentMethods, faqs, terms, privacy, LANG, pick, getContent } from "./index"

// Rebuild an i18n-shaped object for compatibility (optional)
export const i18n = {
  company,
  hero,
  rates: { items: rates },
  whyChooseUs,
  vehicles,
  services,
  paymentMethods,
  faqs,
  legal: { terms, privacy },
}

export const links = companyLinks

export { LANG, pick, getContent }

// Default export similar to the old module (reduced surface)
export default { LANG, i18n, links, pick, getContent }

