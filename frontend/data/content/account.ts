import { Localized } from "@/data/i18n/core";

export const accountText = {
  profile: {
    title: { en: "Profile", th: "โปรไฟล์" } as Localized<string>,
    name: { en: "Name", th: "ชื่อ" } as Localized<string>,
    email: { en: "Email", th: "อีเมล" } as Localized<string>,
    role: { en: "Role", th: "สิทธิ์" } as Localized<string>,
    save: { en: "Save changes", th: "บันทึกการเปลี่ยนแปลง" } as Localized<string>,
    saved: { en: "Profile updated", th: "อัปเดตโปรไฟล์แล้ว" } as Localized<string>,
    errors: {
      name_required: { en: "Name is required", th: "กรุณากรอกชื่อ" } as Localized<string>,
      name_too_long: { en: "Name is too long (max 100)", th: "ชื่อต้องไม่เกิน 100 ตัวอักษร" } as Localized<string>,
      invalid: { en: "Invalid input", th: "ข้อมูลไม่ถูกต้อง" } as Localized<string>,
    },
  },
  settings: {
    title: { en: "Settings", th: "การตั้งค่า" } as Localized<string>,
    preferredLanguage: { en: "Preferred language", th: "ภาษาที่ต้องการ" } as Localized<string>,
    languageEnglish: { en: "English", th: "อังกฤษ" } as Localized<string>,
    languageThai: { en: "Thai", th: "ไทย" } as Localized<string>,
    emailNotifications: { en: "Email notifications", th: "การแจ้งเตือนทางอีเมล" } as Localized<string>,
    marketingEmails: { en: "Marketing emails", th: "อีเมลการตลาด" } as Localized<string>,
    save: { en: "Save settings", th: "บันทึกการตั้งค่า" } as Localized<string>,
    saved: { en: "Settings updated", th: "อัปเดตการตั้งค่าแล้ว" } as Localized<string>,
  },
  dashboard: {
    recentEmptyTitle: { en: "No recent bookings", th: "ยังไม่มีการจองล่าสุด" } as Localized<string>,
    recentEmptyDesc: {
      en: "Your latest bookings will appear here once you make a reservation.",
      th: "เมื่อคุณทำการจอง รายการล่าสุดจะแสดงที่นี่",
    } as Localized<string>,
  },
} as const;

export type AccountText = typeof accountText;
