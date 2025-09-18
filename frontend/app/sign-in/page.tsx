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
    <Suspense fallback={<div />}> 
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
        setError(invalidMsg)
      }
    })
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            {pick(lang, signInText.title)}
          </h1>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {pick(lang, signInText.emailPlaceholder)}
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={pick(lang, signInText.emailPlaceholder)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {pick(lang, signInText.passwordPlaceholder)}
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={pick(lang, signInText.passwordPlaceholder)}
                autoComplete="current-password"
                required
              />
            </div>
            {(error || urlError) && (
              <p className="text-sm text-destructive" role="alert">
                {error || invalidMsg}
              </p>
            )}
            <Button className="w-full" disabled={isPending} type="submit">
              {isPending ? "…" : pick(lang, signInText.submit)}
            </Button>
          </form>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {pick(lang, signInText.noAccountQuestion)}{" "}
          <Link href="/sign-up" className="text-primary hover:underline">
            {pick(lang, signInText.createAccount)}
          </Link>
        </p>
      </div>
    </div>
  )
}
