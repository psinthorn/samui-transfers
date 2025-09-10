import type { Localized } from "../i18n/core"

export const paymentMethods: Localized<string>[] = [
  { en: "Cash (THB)", th: "เงินสด (บาท)" },
  { en: "QR Code (PromptPay)", th: "คิวอาร์โค้ด (พร้อมเพย์)" },
  { en: "PayPal", th: "เพย์พาล" },
  { en: "Bank Transfer", th: "โอนเงินผ่านธนาคาร" },
]