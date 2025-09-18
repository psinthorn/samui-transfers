"use client"
import { useState, useTransition, type FormEvent } from "react"
import { registerAction } from "@/actions/register"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

export default function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [errors, setErrors] = useState<Array<{ message: string }>>([])
  const [pending, startTransition] = useTransition()

  // Preserve callbackUrl if provided (e.g., user was redirected to sign-up)
  const initialCallbackUrl = searchParams?.get("callbackUrl") ?? null
  const targetCallbackUrl = initialCallbackUrl || "/dashboard"

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

      // Auto sign-in with the same credentials and redirect to dashboard
      await signIn("credentials", { email, password, redirect: true, callbackUrl: targetCallbackUrl } as any)
    })
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-2xl font-semibold mb-1">Create account</h1>
        <p className="text-slate-600 mb-6">Join Samui Transfers</p>
        <form onSubmit={onSubmit} aria-busy={pending} className="space-y-4 bg-white rounded-lg border border-slate-200 p-4">
          <div>
            <label className="block text-sm text-slate-700">Name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} disabled={pending} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed" required />
          </div>
          <div>
            <label className="block text-sm text-slate-700">Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} disabled={pending} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed" required />
          </div>
          <div>
            <label className="block text-sm text-slate-700">Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} disabled={pending} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed" required />
          </div>
          {message && (
            <div className="text-sm text-slate-700">{message}</div>
          )}
          {errors && errors.length > 0 && (
            <ul className="text-sm text-red-600 list-disc pl-5">
              {errors.map((err, idx)=> (
                <li key={idx}>{err.message}</li>
              ))}
            </ul>
          )}
          <button type="submit" disabled={pending} className="inline-flex items-center rounded-md bg-[#005B9A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005B9A]/90 disabled:opacity-70 disabled:cursor-not-allowed">
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="text-sm text-slate-600 mt-4">
          Already have an account? {" "}
          <Link
            href={initialCallbackUrl ? `/sign-in?callbackUrl=${encodeURIComponent(initialCallbackUrl)}` : "/sign-in"}
            className="underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
