import { Localized } from "@/data/i18n/core"

export const signInText = {
  title: { en: "Sign in", th: "เข้าสู่ระบบ" } as Localized<string>,
  subtitle: { en: "Welcome back to Samui Transfers", th: "ยินดีต้อนรับกลับมายังการโอนย้าย Samui" } as Localized<string>,
  emailPlaceholder: { en: "Email", th: "อีเมล" } as Localized<string>,
  passwordPlaceholder: { en: "Password", th: "รหัสผ่าน" } as Localized<string>,
  submit: { en: "Sign in", th: "เข้าสู่ระบบ" } as Localized<string>,
  signingIn: { en: "Signing in...", th: "กำลังเข้าสู่ระบบ..." } as Localized<string>,
  createAccount: { en: "Create account", th: "สร้างบัญชี" } as Localized<string>,
  noAccountQuestion: { en: "Don't have an account?", th: "ยังไม่มีบัญชีใช่ไหม?" } as Localized<string>,
  invalidError: { en: "Invalid email or password", th: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" } as Localized<string>,
  forgotPassword: { en: "Forgot password?", th: "ลืมรหัสผ่าน?" } as Localized<string>,
  emailNotFound: { en: "No account found with this email", th: "ไม่พบบัญชีกับอีเมลนี้" } as Localized<string>,
  emailNotVerified: { en: "Please verify your email first. Check your inbox.", th: "โปรดยืนยันอีเมลของคุณก่อน ตรวจสอบกล่องจดหมายของคุณ" } as Localized<string>,
  accountDisabled: { en: "This account has been disabled. Contact support.", th: "บัญชีนี้ถูกปิดใช้งาน โปรดติดต่อฝ่ายสนับสนุน" } as Localized<string>,
  incorrectPassword: { en: "Incorrect password. Try again.", th: "รหัสผ่านไม่ถูกต้อง ลองใหม่อีกครั้ง" } as Localized<string>,
  resendVerificationEmail: { en: "Resend verification email", th: "ส่งอีเมลยืนยันอีกครั้ง" } as Localized<string>,
  needHelp: { en: "Need help?", th: "ต้องการความช่วยเหลือ?" } as Localized<string>,
  contactSupport: { en: "Contact support", th: "ติดต่อฝ่ายสนับสนุน" } as Localized<string>,
} as const

export type SignInText = typeof signInText

export const signUpText = {
  title: { en: "Create account", th: "สร้างบัญชี" } as Localized<string>,
  subtitle: { en: "Join Samui Transfers", th: "เข้าร่วม Samui Transfers" } as Localized<string>,
  name: { en: "Name", th: "ชื่อ" } as Localized<string>,
  email: { en: "Email", th: "อีเมล" } as Localized<string>,
  password: { en: "Password", th: "รหัสผ่าน" } as Localized<string>,
  passwordRequirements: { en: "Password requirements", th: "ข้อกำหนดรหัสผ่าน" } as Localized<string>,
  minChars: { en: "At least 8 characters", th: "ขั้นต่ำ 8 ตัวอักษร" } as Localized<string>,
  uppercase: { en: "One uppercase letter (A-Z)", th: "ตัวอักษรตัวใหญ่หนึ่งตัว (A-Z)" } as Localized<string>,
  lowercase: { en: "One lowercase letter (a-z)", th: "ตัวอักษรตัวเล็กหนึ่งตัว (a-z)" } as Localized<string>,
  number: { en: "One number (0-9)", th: "หมายเลขหนึ่ง (0-9)" } as Localized<string>,
  special: { en: "One special character (!@#$%^&*)", th: "ตัวอักษรพิเศษหนึ่งตัว (!@#$%^&*)" } as Localized<string>,
  createBtn: { en: "Create account", th: "สร้างบัญชี" } as Localized<string>,
  creatingBtn: { en: "Creating account...", th: "กำลังสร้างบัญชี..." } as Localized<string>,
  haveAccount: { en: "Already have an account?", th: "มีบัญชีอยู่แล้วใช่ไหม?" } as Localized<string>,
  signInLink: { en: "Sign in", th: "เข้าสู่ระบบ" } as Localized<string>,
  needHelp: { en: "Need help?", th: "ต้องการความช่วยเหลือ?" } as Localized<string>,
  contactSupport: { en: "Contact support", th: "ติดต่อฝ่ายสนับสนุน" } as Localized<string>,
} as const

export type SignUpText = typeof signUpText

export const forgotPasswordText = {
  title: { en: "Forgot password?", th: "ลืมรหัสผ่าน?" } as Localized<string>,
  subtitle: { en: "Enter your email and we'll send you a link to reset your password", th: "ป้อนอีเมลของคุณ และเราจะส่งลิงค์เพื่อตั้งรหัสผ่านใหม่" } as Localized<string>,
  email: { en: "Email address", th: "ที่อยู่อีเมล" } as Localized<string>,
  submit: { en: "Send reset link", th: "ส่งลิงค์ตั้งรหัสผ่านใหม่" } as Localized<string>,
  submitting: { en: "Sending...", th: "กำลังส่ง..." } as Localized<string>,
  success: { en: "Check your email", th: "ตรวจสอบอีเมลของคุณ" } as Localized<string>,
  successMessage: { en: "We've sent a password reset link to your email. It will expire in 1 hour.", th: "เราได้ส่งลิงค์ตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณ จะหมดอายุใน 1 ชั่วโมง" } as Localized<string>,
  successSubtext: { en: "Check your spam folder if you don't see it.", th: "ตรวจสอบโฟลเดอร์สแปมหากคุณไม่เห็นอีเมล" } as Localized<string>,
  backToSignIn: { en: "Back to Sign In", th: "กลับไปหน้าเข้าสู่ระบบ" } as Localized<string>,
  dontHaveAccount: { en: "Don't have an account?", th: "ยังไม่มีบัญชีใช่ไหม?" } as Localized<string>,
  createAccount: { en: "Create one", th: "สร้างบัญชี" } as Localized<string>,
  error: { en: "Error sending reset link. Please try again.", th: "เกิดข้อผิดพลาดในการส่งลิงค์ตั้งรหัสผ่านใหม่ โปรดลองใหม่" } as Localized<string>,
  emailNotFound: { en: "No account found with this email", th: "ไม่พบบัญชีกับอีเมลนี้" } as Localized<string>,
  tooManyAttempts: { en: "Too many attempts. Please try again later.", th: "พยายามหลายครั้งเกินไป โปรดลองใหม่ในภายหลัง" } as Localized<string>,
  haveAccount: { en: "Remember your password?", th: "จำรหัสผ่านได้ไหม?" } as Localized<string>,
  signIn: { en: "Sign in", th: "เข้าสู่ระบบ" } as Localized<string>,
  sendAnother: { en: "Send another link", th: "ส่งลิงค์อื่น" } as Localized<string>,
  expireTime: { en: "Link expires in 1 hour", th: "ลิงค์หมดอายุใน 1 ชั่วโมง" } as Localized<string>,
} as const

export type ForgotPasswordText = typeof forgotPasswordText

export const resetPasswordText = {
  title: { en: "Reset password", th: "ตั้งรหัสผ่านใหม่" } as Localized<string>,
  subtitle: { en: "Enter your new password", th: "ป้อนรหัสผ่านใหม่ของคุณ" } as Localized<string>,
  password: { en: "New password", th: "รหัสผ่านใหม่" } as Localized<string>,
  confirm: { en: "Confirm password", th: "ยืนยันรหัสผ่าน" } as Localized<string>,
  passwordRequirements: { en: "Password requirements", th: "ข้อกำหนดรหัสผ่าน" } as Localized<string>,
  minChars: { en: "At least 8 characters", th: "ขั้นต่ำ 8 ตัวอักษร" } as Localized<string>,
  uppercase: { en: "One uppercase letter", th: "ตัวอักษรตัวใหญ่หนึ่งตัว" } as Localized<string>,
  lowercase: { en: "One lowercase letter", th: "ตัวอักษรตัวเล็กหนึ่งตัว" } as Localized<string>,
  number: { en: "One number", th: "หมายเลขหนึ่ง" } as Localized<string>,
  special: { en: "One special character", th: "ตัวอักษรพิเศษหนึ่งตัว" } as Localized<string>,
  submit: { en: "Reset password", th: "ตั้งรหัสผ่านใหม่" } as Localized<string>,
  submitting: { en: "Resetting...", th: "กำลังตั้งรหัสผ่านใหม่..." } as Localized<string>,
  success: { en: "Password reset successful!", th: "ตั้งรหัสผ่านใหม่สำเร็จ!" } as Localized<string>,
  successMessage: { en: "Your password has been successfully reset. Redirecting to login...", th: "รหัสผ่านของคุณได้รับการตั้งใหม่สำเร็จ กำลังนำไปหน้าเข้าสู่ระบบ..." } as Localized<string>,
  signIn: { en: "Sign In", th: "เข้าสู่ระบบ" } as Localized<string>,
  error: { en: "Error resetting password", th: "เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่" } as Localized<string>,
  invalidLink: { en: "This reset link has expired or is invalid", th: "ลิงค์ตั้งรหัสผ่านนี้หมดอายุหรือไม่ถูกต้อง" } as Localized<string>,
  passwordMismatch: { en: "Passwords do not match", th: "รหัสผ่านไม่ตรงกัน" } as Localized<string>,
  passwordMatch: { en: "Passwords match", th: "รหัสผ่านตรงกัน" } as Localized<string>,
  backToForgot: { en: "Request new reset link", th: "ขอลิงค์ตั้งรหัสผ่านใหม่" } as Localized<string>,
} as const

export type ResetPasswordText = typeof resetPasswordText