"use client"
import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import { useLanguage } from "@/context/LanguageContext"
import { pick } from "@/data/i18n/core"

const resetPasswordText = {
  title: { en: "Reset password", th: "ตั้งรหัสผ่านใหม่" },
  subtitle: { en: "Enter your new password", th: "ป้อนรหัสผ่านใหม่ของคุณ" },
  password: { en: "New password", th: "รหัสผ่านใหม่" },
  confirm: { en: "Confirm password", th: "ยืนยันรหัสผ่าน" },
  passwordRequirements: { en: "Password requirements", th: "ข้อกำหนดรหัสผ่าน" },
  minChars: { en: "At least 8 characters", th: "ขั้นต่ำ 8 ตัวอักษร" },
  uppercase: { en: "One uppercase letter", th: "ตัวอักษรตัวใหญ่หนึ่งตัว" },
  lowercase: { en: "One lowercase letter", th: "ตัวอักษรตัวเล็กหนึ่งตัว" },
  number: { en: "One number", th: "หมายเลขหนึ่ง" },
  special: { en: "One special character", th: "ตัวอักษรพิเศษหนึ่งตัว" },
  submit: { en: "Reset password", th: "ตั้งรหัสผ่านใหม่" },
  submitting: { en: "Resetting...", th: "กำลังตั้งรหัสผ่านใหม่..." },
  success: { en: "Password reset successful!", th: "ตั้งรหัสผ่านใหม่สำเร็จ!" },
  successMessage: { en: "Your password has been successfully reset. Redirecting to login...", th: "รหัสผ่านของคุณได้รับการตั้งใหม่สำเร็จ กำลังนำไปหน้าเข้าสู่ระบบ..." },
  signIn: { en: "Sign In", th: "เข้าสู่ระบบ" },
  error: { en: "Error resetting password", th: "เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่" },
  invalidLink: { en: "This reset link has expired or is invalid", th: "ลิงค์ตั้งรหัสผ่านนี้หมดอายุหรือไม่ถูกต้อง" },
  passwordMismatch: { en: "Passwords do not match", th: "รหัสผ่านไม่ตรงกัน" },
  passwordMatch: { en: "Passwords match", th: "รหัสผ่านตรงกัน" },
  backToForgot: { en: "Request new reset link", th: "ขอลิงค์ตั้งรหัสผ่านใหม่" },
} as const

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang } = useLanguage()

  const token = searchParams?.get("token") ?? null
  const email = searchParams?.get("email") ?? null

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Password requirement checks
  const passwordChecks = {
    minChars: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
  const allRequirementsMet = Object.values(passwordChecks).every(Boolean)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!token || !email) {
      setError(pick(lang, resetPasswordText.invalidLink))
      return
    }

    if (!passwordsMatch) {
      setError(pick(lang, resetPasswordText.passwordMismatch))
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/password-reset", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token, password }),
        })

        const data = await res.json()

        if (!data.success) {
          const errorLower = data.error?.toLowerCase() || ""
          if (errorLower.includes("expired") || errorLower.includes("invalid")) {
            setError(pick(lang, resetPasswordText.invalidLink))
          } else {
            setError(data.error || pick(lang, resetPasswordText.error))
          }
        } else {
          setSuccess(true)
          setTimeout(() => router.push("/sign-in"), 3000)
        }
      } catch (err) {
        setError(pick(lang, resetPasswordText.error))
      }
    })
  }

  if (success) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-8 md:py-12 lg:py-16">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-[#3AA76D] to-[#2d8555] p-6 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/20 mb-4">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {pick(lang, resetPasswordText.success)}
              </h1>
            </div>

            {/* Success Content */}
            <div className="p-6 md:p-7 space-y-5 text-center">
              <p className="text-sm text-slate-700 leading-relaxed">
                {pick(lang, resetPasswordText.successMessage)}
              </p>

              <Button
                onClick={() => router.push("/sign-in")}
                className="w-full min-h-12 rounded-lg bg-[#005B9A] hover:bg-[#003d6b] text-white font-medium transition-all active:scale-95"
              >
                {pick(lang, resetPasswordText.signIn)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-8 md:py-12 lg:py-16">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            {/* Error Header */}
            <div className="bg-gradient-to-r from-[#D94141] to-[#b83030] p-6 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/20 mb-4">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {pick(lang, resetPasswordText.error)}
              </h1>
            </div>

            {/* Error Content */}
            <div className="p-6 md:p-7 space-y-5 text-center">
              <p className="text-sm text-slate-700 leading-relaxed">
                {pick(lang, resetPasswordText.invalidLink)}
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/forgot-password")}
                  className="w-full min-h-12 rounded-lg bg-[#D94141] hover:bg-[#b83030] text-white font-medium transition-all active:scale-95"
                >
                  {pick(lang, resetPasswordText.backToForgot)}
                </Button>
                <Button
                  onClick={() => router.push("/sign-in")}
                  className="w-full min-h-11 rounded-lg border-2 border-slate-200 bg-white text-slate-900 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
                >
                  {pick(lang, resetPasswordText.signIn)}
                </Button>
              </div>
            </div>
          </div>
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
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#3AA76D] to-[#2d8555] flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">ST</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            {pick(lang, resetPasswordText.title)}
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-xs mx-auto leading-relaxed">
            {pick(lang, resetPasswordText.subtitle)}
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6 md:p-7 space-y-5">
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            {/* New Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                {pick(lang, resetPasswordText.password)}
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isPending}
                className="min-h-12 md:min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-500 transition-all focus:border-[#3AA76D] focus:ring-2 focus:ring-[#3AA76D]/10 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            {/* Password Requirements Checklist */}
            {password && (
              <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  {pick(lang, resetPasswordText.passwordRequirements)}
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    { check: passwordChecks.minChars, text: resetPasswordText.minChars },
                    { check: passwordChecks.uppercase, text: resetPasswordText.uppercase },
                    { check: passwordChecks.lowercase, text: resetPasswordText.lowercase },
                    { check: passwordChecks.number, text: resetPasswordText.number },
                    { check: passwordChecks.special, text: resetPasswordText.special },
                  ].map((req, idx) => (
                    <li
                      key={idx}
                      className={`flex items-center gap-3 transition-colors ${
                        req.check ? "text-[#3AA76D]" : "text-slate-500"
                      }`}
                    >
                      {req.check ? (
                        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      <span>{pick(lang, req.text)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirm" className="block text-sm font-medium text-slate-700">
                {pick(lang, resetPasswordText.confirm)}
              </label>
              <Input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isPending}
                className="min-h-12 md:min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-500 transition-all focus:border-[#3AA76D] focus:ring-2 focus:ring-[#3AA76D]/10 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            {/* Password Match Feedback */}
            {confirmPassword && (
              <div
                className={`p-4 rounded-lg border-l-4 text-sm ${
                  passwordsMatch
                    ? "bg-green-50 border-[#3AA76D] text-green-700"
                    : "bg-red-50 border-[#D94141] text-red-700"
                }`}
              >
                <p className="font-medium">
                  {passwordsMatch ? "✓ " : "✗ "}
                  {passwordsMatch
                    ? pick(lang, resetPasswordText.passwordMatch)
                    : pick(lang, resetPasswordText.passwordMismatch)}
                </p>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div
                className="p-4 rounded-lg bg-red-50 border-l-4 border-[#D94141] text-sm text-red-700 space-y-1"
                role="alert"
              >
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending || !allRequirementsMet || !passwordsMatch}
              className="w-full min-h-12 md:min-h-11 rounded-lg bg-[#3AA76D] hover:bg-[#2d8555] text-white font-medium text-base transition-all active:scale-95 disabled:opacity-70"
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
                  {pick(lang, resetPasswordText.submitting)}
                </span>
              ) : (
                pick(lang, resetPasswordText.submit)
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
                Need help?
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <Link
            href="/sign-in"
            className="w-full inline-flex items-center justify-center min-h-11 rounded-lg border-2 border-slate-200 bg-white text-slate-900 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 text-sm"
          >
            {pick(lang, resetPasswordText.signIn)}
          </Link>
        </div>

        {/* Footer Help */}
        <p className="mt-6 text-center text-xs text-slate-600">
          {pick(lang, resetPasswordText.error)}{" "}
          <Link href="/forgot-password" className="text-[#D94141] hover:underline font-medium transition-colors">
            {pick(lang, resetPasswordText.backToForgot)}
          </Link>
        </p>
      </div>
    </div>
  )
}
