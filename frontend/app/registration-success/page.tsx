"use client"
import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import Button from "@/components/ui/button"
import { Mail, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { pick } from "@/data/i18n/core"

const registrationSuccessText = {
  title: { en: "Registration Successful! 🎉", th: "ลงทะเบียนสำเร็จแล้ว! 🎉" },
  subtitle: { en: "Verify your email to complete registration", th: "ยืนยันอีเมลของคุณเพื่อเสร็จสิ้นการลงทะเบียน" },
  checkEmail: { en: "Check your email", th: "ตรวจสอบอีเมลของคุณ" },
  emailSent: { en: "We've sent a verification email to:", th: "เราได้ส่งอีเมลยืนยันไปที่:" },
  instructions: {
    en: [
      "A verification link has been sent to your email address",
      "Click the link in the email to verify your account",
      "The link will expire in 24 hours",
      "After verification, you can sign in to your account"
    ],
    th: [
      "ลิงค์ยืนยันได้ถูกส่งไปยังที่อยู่อีเมลของคุณ",
      "คลิกลิงค์ในอีเมลเพื่อยืนยันบัญชีของคุณ",
      "ลิงค์จะหมดอายุใน 24 ชั่วโมง",
      "หลังจากการยืนยัน คุณสามารถเข้าสู่ระบบบัญชีของคุณได้"
    ]
  },
  noEmailReceived: { en: "Didn't receive the email?", th: "ไม่ได้รับอีเมล?" },
  checkSpam: { en: "Check your spam or junk folder", th: "ตรวจสอบโฟลเดอร์สแปมหรือขยะ" },
  resendEmail: { en: "Resend verification email", th: "ส่งอีเมลยืนยันใหม่" },
  backToSignIn: { en: "Back to Sign In", th: "กลับไปหน้าเข้าสู่ระบบ" },
  resendSuccess: { en: "✓ Email resent successfully", th: "✓ ส่งอีเมลใหม่สำเร็จแล้ว" },
  resendError: { en: "Failed to resend email. Please try again.", th: "ส่งอีเมลใหม่ล้มเหลว โปรดลองอีกครั้ง" },
} as const

export default function RegistrationSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { lang } = useLanguage()
  const email = searchParams?.get("email") ?? "your email"
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")
  const [resendError, setResendError] = useState("")

  const handleResendEmail = async () => {
    setIsResending(true)
    setResendMessage("")
    setResendError("")
    
    try {
      const response = await fetch("/api/auth/resend-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setResendMessage(pick(lang, registrationSuccessText.resendSuccess))
      } else {
        setResendError(data.error || pick(lang, registrationSuccessText.resendError))
      }
    } catch (error) {
      setResendError(pick(lang, registrationSuccessText.resendError))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-8 md:py-12 lg:py-16">
      <div className="w-full max-w-md">
        {/* Success Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-lg p-8 space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full blur-xl"></div>
              <CheckCircle className="relative w-16 h-16 text-green-600" />
            </div>
          </div>

          {/* Title and Subtitle */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">
              {pick(lang, registrationSuccessText.title)}
            </h1>
            <p className="text-slate-600">
              {pick(lang, registrationSuccessText.subtitle)}
            </p>
          </div>

          {/* Email Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">
                {pick(lang, registrationSuccessText.checkEmail)}
              </span>
            </div>
            <p className="text-sm text-blue-800">
              {pick(lang, registrationSuccessText.emailSent)}
            </p>
            <p className="text-sm font-semibold text-blue-900 break-all">
              {email}
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm">
              {pick(lang, registrationSuccessText.instructions)[0]}
            </h3>
            <div className="space-y-2">
              {pick(lang, registrationSuccessText.instructions).map((instruction, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-sm font-semibold">{index + 1}</span>
                  </div>
                  <p className="text-sm text-slate-600 pt-0.5">{instruction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">
                {lang === "en" ? "Link expires in 24 hours" : "ลิงค์หมดอายุใน 24 ชั่วโมง"}
              </p>
              <p className="text-amber-700 mt-1">
                {lang === "en" 
                  ? "Don't forget to verify your email before the link expires"
                  : "อย่าลืมยืนยันอีเมลของคุณก่อนลิงค์หมดอายุ"
                }
              </p>
            </div>
          </div>

          {/* Resend Section */}
          <div className="border-t border-slate-200 pt-6 space-y-3">
            <p className="text-sm text-slate-600 text-center">
              {pick(lang, registrationSuccessText.noEmailReceived)}
            </p>
            <p className="text-xs text-slate-500 text-center">
              {pick(lang, registrationSuccessText.checkSpam)}
            </p>

            {resendMessage && (
              <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-700 text-center">
                {resendMessage}
              </div>
            )}

            {resendError && (
              <div className="bg-red-50 border border-red-200 rounded p-3 flex gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{resendError}</p>
              </div>
            )}

            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-900"
            >
              {isResending ? "..." : pick(lang, registrationSuccessText.resendEmail)}
            </Button>
          </div>

          {/* Back to Sign In */}
          <Link href="/sign-in" className="block">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              {pick(lang, registrationSuccessText.backToSignIn)}
            </Button>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-slate-600">
          <p>
            {lang === "en"
              ? "Questions? Contact us at support@samui-transfers.com"
              : "มีคำถาม? ติดต่อเราที่ support@samui-transfers.com"}
          </p>
        </div>
      </div>
    </main>
  )
}
