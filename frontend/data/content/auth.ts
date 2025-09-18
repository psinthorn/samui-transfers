import { Localized } from "@/data/i18n/core"

export const signInText = {
  title: { en: "Sign in", th: "เข้าสู่ระบบ" } as Localized<string>,
  emailPlaceholder: { en: "Email", th: "อีเมล" } as Localized<string>,
  passwordPlaceholder: { en: "Password", th: "รหัสผ่าน" } as Localized<string>,
  submit: { en: "Sign in", th: "เข้าสู่ระบบ" } as Localized<string>,
  createAccount: { en: "Create account", th: "สร้างบัญชี" } as Localized<string>,
  noAccountQuestion: { en: "Don't have an account?", th: "ยังไม่มีบัญชีใช่ไหม?" } as Localized<string>,
  invalidError: { en: "Invalid email or password", th: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" } as Localized<string>,
} as const

export type SignInText = typeof signInText
