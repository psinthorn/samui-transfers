"use client"
import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import Button from "@/components/ui/button"
import { useLanguage } from "@/context/LanguageContext"
import { pick } from "@/data/i18n/core"

const verifyEmailText = {
  title: { en: "Verify your email", th: "ยืนยันอีเมลของคุณ" },
  verifying: { en: "Verifying...", th: "กำลังยืนยัน..." },
  success: { en: "✓ Email verified!", th: "✓ อีเมลยืนยันแล้ว!" },
  error: { en: "Verification failed", th: "การยืนยันล้มเหลว" },
  successMessage: { en: "Your email has been verified. Redirecting to login...", th: "อีเมลของคุณได้รับการยืนยัน กำลังนำไปหน้าเข้าสู่ระบบ..." },
  errorMessage: { en: "This verification link has expired or is invalid. Please request a new one.", th: "ลิงค์ยืนยันนี้หมดอายุหรือไม่ถูกต้อง โปรดขอใหม่" },
  invalidRequest: { en: "Invalid verification request. Please check your email for the correct link.", th: "คำขอยืนยันไม่ถูกต้อง โปรดตรวจสอบอีเมลสำหรับลิงค์ที่ถูกต้อง" },
  backToSignIn: { en: "Back to Sign In", th: "กลับไปหน้าเข้าสู่ระบบ" },
  requestNewLink: { en: "Request new verification link", th: "ขอลิงค์ยืนยันใหม่" },
} as const

export default function VerifyEmailPage() {
  const params = useSearchParams()
  const router = useRouter()
  const { lang } = useLanguage()
  const email = params?.get("email") ?? null
  const token = params?.get("token") ?? null
  const [status, setStatus] = useState<"loading" | "success" | "error" | "invalid">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (token && email) {
      verifyEmail()
    } else {
      setStatus("invalid")
      setMessage(pick(lang, verifyEmailText.invalidRequest))
    }
  }, [token, email, lang])

  const verifyEmail = async () => {
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      })
      const data = await res.json()

      if (data.success) {
        setStatus("success")
        setMessage(pick(lang, verifyEmailText.successMessage))
        setTimeout(() => router.push("/sign-in"), 3000)
      } else {
        setStatus("error")
        setMessage(data.error || pick(lang, verifyEmailText.errorMessage))
      }
    } catch (err) {
      setStatus("error")
      setMessage(pick(lang, verifyEmailText.errorMessage))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center space-y-4">
          <div className="text-4xl mb-4">
            {status === "loading" && "⏳"}
            {status === "success" && "✓"}
            {(status === "error" || status === "invalid") && "✗"}
          </div>

          <h1 className="text-2xl font-semibold">
            {status === "loading" && pick(lang, verifyEmailText.verifying)}
            {status === "success" && pick(lang, verifyEmailText.success)}
            {(status === "error" || status === "invalid") && pick(lang, verifyEmailText.error)}
          </h1>

          <p className={`text-sm ${
            status === "success" ? "text-green-600" : 
            status === "error" || status === "invalid" ? "text-red-600" : 
            "text-slate-600"
          }`}>
            {message}
          </p>

          {status === "success" && (
            <p className="text-xs text-slate-500">
              {pick(lang, verifyEmailText.successMessage)}
            </p>
          )}

          <div className="pt-4 space-y-3">
            {status === "success" && (
              <Button onClick={() => router.push("/sign-in")} className="w-full">
                {pick(lang, verifyEmailText.backToSignIn)}
              </Button>
            )}

            {(status === "error" || status === "invalid") && (
              <>
                <Button
                  onClick={() => router.push("/sign-in")}
                  variant="outline"
                  className="w-full"
                >
                  {pick(lang, verifyEmailText.backToSignIn)}
                </Button>
                <Link href={email ? `/api/auth/verify-email?resend=true&email=${encodeURIComponent(email)}` : "#"}>
                  <Button variant="ghost" className="w-full">
                    {pick(lang, verifyEmailText.requestNewLink)}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          {email && `Verifying: ${email}`}
        </p>
      </div>
    </div>
  )
}
