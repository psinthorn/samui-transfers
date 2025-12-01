import { Localized } from "@/data/i18n/core"

export const adminText = {
  title: { en: "Admin Dashboard", th: "แดชบอร์ดผู้ดูแล" } as Localized<string>,
  subtitle: { en: "Manage transfers, bookings, users, and system content", th: "จัดการการโอนย้าย การจอง ผู้ใช้ และเนื้อหาระบบ" } as Localized<string>,
  welcome: { en: "Welcome back", th: "ยินดีต้อนรับกลับ" } as Localized<string>,
  role: { en: "Administrator", th: "ผู้ดูแลระบบ" } as Localized<string>,
  lastLogin: { en: "Last login", th: "เข้าสู่ระบบล่าสุด" } as Localized<string>,
  navigationTitle: { en: "Quick Access", th: "การเข้าถึงอย่างรวดเร็ว" } as Localized<string>,
  menu: {
    manageBookings: { en: "Manage Bookings", th: "จัดการการจอง" } as Localized<string>,
    bookingsDescription: { en: "View, confirm, and manage all customer bookings and reservations", th: "ดู ยืนยัน และจัดการการจองและการสำรองของลูกค้าทั้งหมด" } as Localized<string>,
    vehiclesRates: { en: "Vehicles & Rates", th: "ยานพาหนะและอัตราค่าโดยสาร" } as Localized<string>,
    vehiclesDescription: { en: "Manage fleet, configure pricing, and set service routes", th: "จัดการฝูง ตั้งค่าราคา และกำหนดเส้นทางการบริการ" } as Localized<string>,
    contentPages: { en: "Content & Pages", th: "เนื้อหาและเพจ" } as Localized<string>,
    contentDescription: { en: "Edit website content, FAQs, and informational pages", th: "แก้ไขเนื้อหาเว็บไซต์ คำถามที่พบบ่อย และหน้าข้อมูล" } as Localized<string>,
    users: { en: "Users", th: "ผู้ใช้" } as Localized<string>,
    usersDescription: { en: "Manage user accounts, permissions, and customer profiles", th: "จัดการบัญชีผู้ใช้ สิทธิ์ และโปรไฟล์ของลูกค้า" } as Localized<string>,
    aiAgent: { en: "AI Agent Context", th: "บริบท AI Agent" } as Localized<string>,
    aiDescription: { en: "Configure AI assistant knowledge base and conversation context", th: "กำหนดค่าฐานความรู้ของผู้ช่วย AI และบริบทการสนทนา" } as Localized<string>,
    documentation: { en: "Documentation", th: "เอกสารประกอบ" } as Localized<string>,
    docDescription: { en: "Access project documentation, guides, and technical references", th: "เข้าถึงเอกสารโครงการ คู่มือ และการอ้างอิงทางเทคนิค" } as Localized<string>,
  },
  quickStats: {
    title: { en: "System Overview", th: "ภาพรวมระบบ" } as Localized<string>,
    pendingBookings: { en: "Pending Bookings", th: "การจองที่รอดำเนิน" } as Localized<string>,
    activeUsers: { en: "Active Users", th: "ผู้ใช้ที่ใช้งาน" } as Localized<string>,
    totalRevenue: { en: "Total Revenue", th: "รายรับรวม" } as Localized<string>,
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
