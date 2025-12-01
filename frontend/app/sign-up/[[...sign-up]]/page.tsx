"use client"
import { useState, useTransition, type FormEvent } from "react"
import { registerAction } from "@/actions/register"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useLanguage } from "@/context/LanguageContext"
import { pick } from "@/data/i18n/core"
import { signUpText } from "@/data/content/auth"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"

export default function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang } = useLanguage()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [errors, setErrors] = useState<Array<{ message: string }>>([])
  const [pending, startTransition] = useTransition()

  // Preserve callbackUrl if provided (e.g., user was redirected to sign-up)
  const initialCallbackUrl = searchParams?.get("callbackUrl") ?? null
  const targetCallbackUrl = initialCallbackUrl || "/dashboard"

  // Password requirement checks
  const passwordChecks = {
    minChars: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
  const allRequirementsMet = Object.values(passwordChecks).every(Boolean)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setErrors([])
    startTransition(async () => {
      const res = await registerAction(name, email, password)
      if (!res?.success) {
        setMessage(res?.message || "Registration failed")
        const errs = Array.isArray(res?.errors) ? res.errors : []
        setErrors(errs)
        return
      }

      // Registration successful - show success message and redirect to verify email page
      setMessage(res.message)
      
      // Redirect to email verification page after 1 second
      setTimeout(() => {
        window.location.href = res.redirectUrl || "/verify-email"
      }, 1000)
    })
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-8 md:py-12 lg:py-16">
      <div className="w-full max-w-sm">
        {/* Header Section with Brand */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#3AA76D] to-[#2d8555] flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">ST</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            {pick(lang, signUpText.title)}
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            {pick(lang, signUpText.subtitle)}
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6 md:p-7 space-y-5">
          <form onSubmit={onSubmit} aria-busy={pending} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                {pick(lang, signUpText.name)}
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={pending}
                placeholder="John Doe"
                autoComplete="name"
                required
                className="min-h-12 md:min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-500 transition-all focus:border-[#005B9A] focus:ring-2 focus:ring-[#005B9A]/10 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                {pick(lang, signUpText.email)}
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={pending}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="min-h-12 md:min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-500 transition-all focus:border-[#005B9A] focus:ring-2 focus:ring-[#005B9A]/10 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                {pick(lang, signUpText.password)}
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={pending}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                className="min-h-12 md:min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-500 transition-all focus:border-[#005B9A] focus:ring-2 focus:ring-[#005B9A]/10 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
              />

              {/* Password Requirements Checklist */}
              {password && (
                <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    {pick(lang, signUpText.passwordRequirements)}
                  </p>
                  <ul className="space-y-2 text-sm">
                    {[
                      { check: passwordChecks.minChars, text: signUpText.minChars },
                      { check: passwordChecks.uppercase, text: signUpText.uppercase },
                      { check: passwordChecks.lowercase, text: signUpText.lowercase },
                      { check: passwordChecks.number, text: signUpText.number },
                      { check: passwordChecks.special, text: signUpText.special },
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
            </div>

            {/* Alert Messages */}
            {message && (
              <div className="p-4 rounded-lg bg-amber-50 border-l-4 border-amber-400 text-sm text-amber-700">
                {message}
              </div>
            )}

            {errors && errors.length > 0 && (
              <div className="p-4 rounded-lg bg-red-50 border-l-4 border-[#D94141] space-y-2">
                <p className="text-sm font-medium text-red-700">
                  {pick(lang, signUpText.passwordRequirements)}
                </p>
                <ul className="text-sm text-red-600 list-disc pl-5 space-y-1">
                  {errors.map((err, idx) => (
                    <li key={idx}>{err.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={pending || !allRequirementsMet || !name || !email || !password}
              className="w-full min-h-12 md:min-h-11 rounded-lg bg-[#3AA76D] hover:bg-[#2d8555] text-white font-medium text-base transition-all active:scale-95 disabled:opacity-70"
              aria-busy={pending}
            >
              {pending ? (
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
                  {pick(lang, signUpText.creatingBtn)}
                </span>
              ) : (
                pick(lang, signUpText.createBtn)
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
                {pick(lang, signUpText.haveAccount)}
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <Link
            href={initialCallbackUrl ? `/sign-in?callbackUrl=${encodeURIComponent(initialCallbackUrl)}` : "/sign-in"}
            className="w-full inline-flex items-center justify-center min-h-11 rounded-lg border-2 border-slate-200 bg-white text-slate-900 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 text-sm"
          >
            {pick(lang, signUpText.signInLink)}
          </Link>
        </div>

        {/* Footer Help */}
        <p className="mt-6 text-center text-xs text-slate-600">
          {pick(lang, signUpText.needHelp) || "Need help?"}{" "}
          <Link href="mailto:support@samui-transfers.com" className="text-[#005B9A] hover:underline font-medium">
            {pick(lang, signUpText.contactSupport) || "Contact support"}
          </Link>
        </p>
      </div>
    </main>
  )
}
