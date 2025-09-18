import { Localized } from "@/data/i18n/core"

export const adminText = {
  title: { en: "Admin", th: "ผู้ดูแล" } as Localized<string>,
  welcome: { en: "Welcome", th: "ยินดีต้อนรับ" } as Localized<string>,
  menu: {
    manageBookings: { en: "Manage bookings", th: "จัดการการจอง" } as Localized<string>,
    vehiclesRates: { en: "Vehicles & rates", th: "ยานพาหนะและอัตราค่าโดยสาร" } as Localized<string>,
    contentPages: { en: "Content & pages", th: "เนื้อหาและเพจ" } as Localized<string>,
    users: { en: "Users", th: "ผู้ใช้" } as Localized<string>,
  },
  denied: {
    title: { en: "Access denied", th: "ปฏิเสธการเข้าถึง" } as Localized<string>,
    description: {
      en: "You do not have permission to view this page.",
      th: "คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้",
    } as Localized<string>,
    goHome: { en: "Go to Home", th: "กลับหน้าแรก" } as Localized<string>,
  },
} as const

export type AdminText = typeof adminText
