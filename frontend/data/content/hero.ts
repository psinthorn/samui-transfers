import type { Localized } from "../i18n/core"

export const hero: { welcome: Localized<string>; mission: Localized<string> } = {
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