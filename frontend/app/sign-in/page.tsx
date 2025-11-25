"use client"
import { signIn } from "next-auth/react"
import { Suspense, useMemo, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useLanguage } from "@/context/LanguageContext"
import { pick } from "@/data/i18n/core"
import { signInText } from "@/data/content/auth"
import Link from "next/link"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" />}> 
      <SignInForm />
    </Suspense>
  )
}

function SignInForm() {
  const { lang } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = (params ? params.get("callbackUrl") : null) || "/dashboard"
  const urlError = params?.get("error") || null

  const invalidMsg = useMemo(() => pick(lang, signInText.invalidError), [lang])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await signIn("credentials", { redirect: false, email, password, callbackUrl })
      if (!res?.error) {
        router.push(callbackUrl)
      } else {
        // Show specific error messages
        const errorLower = res.error.toLowerCase()
        if (errorLower.includes("not found")) {
          setError(pick(lang, signInText.emailNotFound))
        } else if (errorLower.includes("not verified")) {
          setError(pick(lang, signInText.emailNotVerified))
        } else if (errorLower.includes("disabled")) {
          setError(pick(lang, signInText.accountDisabled))
        } else if (errorLower.includes("password")) {
          setError(pick(lang, signInText.incorrectPassword))
        } else {
          setError(invalidMsg)
        }
      }
    })
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-8 md:py-12 lg:py-16">
      <div className="w-full max-w-sm">
        {/* Header Section with Brand */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#005B9A] to-[#003d6b] flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">ST</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            {pick(lang, signInText.title)}
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            {pick(lang, signInText.subtitle) || "Welcome back"}
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6 md:p-7 space-y-5">
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                {pick(lang, signInText.emailPlaceholder)}
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                disabled={isPending}
                required
                aria-describedby={error ? "error-message" : undefined}
                className="min-h-12 md:min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-500 transition-all focus:border-[#005B9A] focus:ring-2 focus:ring-[#005B9A]/10 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  {pick(lang, signInText.passwordPlaceholder)}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#005B9A] hover:text-[#003d6b] transition-colors hover:underline"
                >
                  {pick(lang, signInText.forgotPassword)}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isPending}
                required
                aria-describedby={error ? "error-message" : undefined}
                className="min-h-12 md:min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-500 transition-all focus:border-[#005B9A] focus:ring-2 focus:ring-[#005B9A]/10 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            {/* Error Alert */}
            {(error || urlError) && (
              <div
                id="error-message"
                className="p-4 rounded-lg bg-red-50 border-l-4 border-[#D94141] text-sm text-red-700 space-y-2"
                role="alert"
              >
                <p className="font-medium">{error || invalidMsg}</p>
                {error?.includes(pick(lang, signInText.emailNotVerified).split(".")[0]) && (
                  <Link
                    href={`/api/auth/verify-email?resend=true&email=${encodeURIComponent(email)}`}
                    className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors hover:underline block mt-1"
                  >
                    {pick(lang, signInText.resendVerificationEmail)}
                  </Link>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button
              className="w-full min-h-12 md:min-h-11 rounded-lg bg-[#005B9A] hover:bg-[#003d6b] text-white font-medium text-base transition-all active:scale-95 disabled:opacity-70"
              disabled={isPending || !email || !password}
              type="submit"
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
                  {pick(lang, signInText.signingIn) || "Signing in..."}
                </span>
              ) : (
                pick(lang, signInText.submit)
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
                {pick(lang, signInText.noAccountQuestion)}
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Link
            href="/sign-up"
            className="w-full inline-flex items-center justify-center min-h-11 rounded-lg border-2 border-slate-200 bg-white text-slate-900 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 text-sm"
          >
            {pick(lang, signInText.createAccount)}
          </Link>
        </div>

        {/* Footer Help */}
        <p className="mt-6 text-center text-xs text-slate-600">
          {pick(lang, signInText.needHelp) || "Need help?"}{" "}
          <Link href="mailto:support@samui-transfers.com" className="text-[#005B9A] hover:underline font-medium">
            {pick(lang, signInText.contactSupport) || "Contact support"}
          </Link>
        </p>
      </div>
    </div>
  )
}
