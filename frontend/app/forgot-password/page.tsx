"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import { useLanguage } from "@/context/LanguageContext"
import { pick } from "@/data/i18n/core"

const forgotPasswordText = {
  title: { en: "Forgot password?", th: "ลืมรหัสผ่าน?" },
  subtitle: { en: "Enter your email and we'll send you a link to reset your password", th: "ป้อนอีเมลของคุณ และเราจะส่งลิงค์เพื่อตั้งรหัสผ่านใหม่" },
  email: { en: "Email address", th: "ที่อยู่อีเมล" },
  submit: { en: "Send reset link", th: "ส่งลิงค์ตั้งรหัสผ่านใหม่" },
  submitting: { en: "Sending...", th: "กำลังส่ง..." },
  success: { en: "Check your email", th: "ตรวจสอบอีเมลของคุณ" },
  successMessage: { en: "We've sent a password reset link to your email. It will expire in 1 hour.", th: "เราได้ส่งลิงค์ตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณ จะหมดอายุใน 1 ชั่วโมง" },
  successSubtext: { en: "Check your spam folder if you don't see it.", th: "ตรวจสอบโฟลเดอร์สแปมหากคุณไม่เห็นอีเมล" },
  backToSignIn: { en: "Back to Sign In", th: "กลับไปหน้าเข้าสู่ระบบ" },
  dontHaveAccount: { en: "Don't have an account?", th: "ยังไม่มีบัญชีใช่ไหม?" },
  createAccount: { en: "Create one", th: "สร้างบัญชี" },
  error: { en: "Error sending reset link. Please try again.", th: "เกิดข้อผิดพลาดในการส่งลิงค์ตั้งรหัสผ่านใหม่ โปรดลองใหม่" },
  emailNotFound: { en: "No account found with this email", th: "ไม่พบบัญชีกับอีเมลนี้" },
  tooManyAttempts: { en: "Too many attempts. Please try again later.", th: "พยายามหลายครั้งเกินไป โปรดลองใหม่ในภายหลัง" },
  haveAccount: { en: "Remember your password?", th: "จำรหัสผ่านได้ไหม?" },
  signIn: { en: "Sign in", th: "เข้าสู่ระบบ" },
  sendAnother: { en: "Send another link", th: "ส่งลิงค์อื่น" },
  expireTime: { en: "Link expires in 1 hour", th: "ลิงค์หมดอายุใน 1 ชั่วโมง" },
} as const

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [isPending, startTransition] = useTransition()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/password-reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        })

        const data = await res.json()

        if (!data.success) {
          const errorLower = data.error?.toLowerCase() || ""
          if (errorLower.includes("not found")) {
            setError(pick(lang, forgotPasswordText.emailNotFound))
          } else if (errorLower.includes("too many")) {
            setError(pick(lang, forgotPasswordText.tooManyAttempts))
          } else {
            setError(data.error || pick(lang, forgotPasswordText.error))
          }
        } else {
          setSent(true)
        }
      } catch (err) {
        setError(pick(lang, forgotPasswordText.error))
      }
    })
  }

  if (sent) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-8 md:py-12 lg:py-16">
        <div className="w-full max-w-sm">
          {/* Success Card */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-[#3AA76D] to-[#2d8555] p-6 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/20 mb-4">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {pick(lang, forgotPasswordText.success)}
              </h1>
            </div>

            {/* Success Content */}
            <div className="p-6 md:p-7 space-y-5 text-center">
              <div className="space-y-2">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {pick(lang, forgotPasswordText.successMessage)}
                </p>
                <p className="text-xs text-slate-500 italic">
                  {pick(lang, forgotPasswordText.successSubtext)}
                </p>
              </div>

              {/* Helper Badge */}
              <div className="inline-block px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                <p className="text-xs font-medium text-amber-700">
                  ⏱️ {pick(lang, forgotPasswordText.expireTime)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-3">
                <Button
                  onClick={() => router.push("/sign-in")}
                  className="w-full min-h-12 rounded-lg bg-[#005B9A] hover:bg-[#003d6b] text-white font-medium transition-all active:scale-95"
                >
                  {pick(lang, forgotPasswordText.backToSignIn)}
                </Button>
                <Button
                  onClick={() => setSent(false)}
                  className="w-full min-h-11 rounded-lg border-2 border-slate-200 bg-white text-slate-900 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
                >
                  {pick(lang, forgotPasswordText.sendAnother)}
                </Button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-slate-600">
            {pick(lang, forgotPasswordText.haveAccount)}{" "}
            <Link href="/sign-in" className="text-[#005B9A] hover:underline font-medium transition-colors">
              {pick(lang, forgotPasswordText.signIn)}
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-8 md:py-12 lg:py-16">
      <div className="w-full max-w-sm">
        {/* Header Section with Brand */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#D94141] to-[#b83030] flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">ST</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            {pick(lang, forgotPasswordText.title)}
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-xs mx-auto leading-relaxed">
            {pick(lang, forgotPasswordText.subtitle)}
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6 md:p-7 space-y-5">
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                {pick(lang, forgotPasswordText.email)}
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                disabled={isPending}
                autoComplete="email"
                aria-describedby={error ? "error-message" : undefined}
                className="min-h-12 md:min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-500 transition-all focus:border-[#D94141] focus:ring-2 focus:ring-[#D94141]/10 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            {/* Error Alert */}
            {error && (
              <div
                id="error-message"
                className="p-4 rounded-lg bg-red-50 border-l-4 border-[#D94141] text-sm text-red-700 space-y-1"
                role="alert"
              >
                <p className="font-medium">{error}</p>
                {error.includes(pick(lang, forgotPasswordText.tooManyAttempts)) && (
                  <p className="text-xs text-red-600 mt-1">
                    💡 {pick(lang, forgotPasswordText.haveAccount)}{" "}
                    <Link href="/sign-in" className="underline font-medium">
                      {pick(lang, forgotPasswordText.signIn)}
                    </Link>
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending || !email}
              className="w-full min-h-12 md:min-h-11 rounded-lg bg-[#D94141] hover:bg-[#b83030] text-white font-medium text-base transition-all active:scale-95 disabled:opacity-70"
              aria-busy={isPending}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {pick(lang, forgotPasswordText.submitting)}
                </span>
              ) : (
                pick(lang, forgotPasswordText.submit)
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-500">
                {pick(lang, forgotPasswordText.haveAccount)}
              </span>
            </div>
          </div>

          {/* Sign In & Sign Up Links */}
          <div className="space-y-3">
            <Link
              href="/sign-in"
              className="w-full inline-flex items-center justify-center min-h-11 rounded-lg border-2 border-slate-200 bg-white text-slate-900 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 text-sm"
            >
              {pick(lang, forgotPasswordText.signIn)}
            </Link>
            <Link
              href="/sign-up"
              className="w-full inline-flex items-center justify-center min-h-11 rounded-lg border-2 border-[#3AA76D] bg-white text-[#3AA76D] font-medium hover:bg-[#3AA76D]/5 hover:border-[#2d8555] transition-all active:scale-95 text-sm"
            >
              {pick(lang, forgotPasswordText.dontHaveAccount)} {pick(lang, forgotPasswordText.createAccount)}
            </Link>
          </div>
        </div>

        {/* Footer Help */}
        <p className="mt-6 text-center text-xs text-slate-600">
          {pick(lang, forgotPasswordText.haveAccount)}{" "}
          <Link href="/sign-in" className="text-[#005B9A] hover:underline font-medium transition-colors">
            {pick(lang, forgotPasswordText.signIn)}
          </Link>
        </p>
      </div>
    </div>
  )
}
