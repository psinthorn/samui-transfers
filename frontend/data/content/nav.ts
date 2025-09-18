import { Localized } from "@/data/i18n/core"

export const navText = {
  dashboard: { en: "Dashboard", th: "แดชบอร์ด" } as Localized<string>,
  admin: { en: "Admin", th: "ผู้ดูแล" } as Localized<string>,
  signIn: { en: "Sign in", th: "เข้าสู่ระบบ" } as Localized<string>,
  signOut: { en: "Sign out", th: "ออกจากระบบ" } as Localized<string>,
  signedInAs: { en: "Signed in as", th: "ลงชื่อเข้าใช้ในชื่อ" } as Localized<string>,
  bookNow: { en: "Book now", th: "จองเลย" } as Localized<string>,
  menu: { en: "Menu", th: "เมนู" } as Localized<string>,
  whatsApp: { en: "WhatsApp", th: "วอทส์แอพ" } as Localized<string>,
  profile: { en: "Profile", th: "โปรไฟล์" } as Localized<string>,
  settings: { en: "Settings", th: "การตั้งค่า" } as Localized<string>,
} as const

export type NavText = typeof navText
