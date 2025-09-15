"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Mail, Phone, MapPin, MessageCircle, ExternalLink } from "lucide-react"
import { company } from "@/data/company"
import { type Lang, pick, digitsOnly } from "@/data/i18n/core"

type Props = {
  lang?: Lang
  className?: string
  showLanguageSelector?: boolean
}

const LABELS = {
  en: {
    kicker: "Contact",
    title: "Get in touch",
    subtitle: "Questions about transfers, pricing, or availability? We’re here to help.",
    language: "Language",
    infoHeader: "Contact information",
    responseNote: "Our team replies within a few hours during 08:00–20:00 (UTC+07:00).",
    formHeader: "Send us a message",
    name: "Name",
    email: "Email",
    message: "Message",
    namePh: "Your name",
    emailPh: "you@example.com",
    messagePh: "How can we help?",
    send: "Send message",
    sending: "Sending…",
    chatPrompt: "Prefer chat?",
    whatsapp: "WhatsApp",
    errorFill: "Please fill all fields with a valid email.",
    errorGeneric: "Something went wrong. Please try again.",
    success: "Message sent. We’ll get back to you shortly.",
    tagline: "Tagline",
    address: "Address",
    phone: "Phone",
    facebook: "Facebook page",
  },
  th: {
    kicker: "ติดต่อ",
    title: "ติดต่อเรา",
    subtitle: "มีคำถามเรื่องการรับส่ง ราคา หรือการจอง? เรายินดีช่วยเหลือ",
    language: "ภาษา",
    infoHeader: "ข้อมูลติดต่อ",
    responseNote: "ปกติเราตอบกลับภายในไม่กี่ชั่วโมง ระหว่าง 08:00–20:00 (UTC+07:00)",
    formHeader: "ส่งข้อความถึงเรา",
    name: "ชื่อ",
    email: "อีเมล",
    message: "ข้อความ",
    namePh: "ชื่อของคุณ",
    emailPh: "you@example.com",
    messagePh: "ให้เราช่วยอะไรได้บ้าง",
    send: "ส่งข้อความ",
    sending: "กำลังส่ง…",
    chatPrompt: "อยากแชท?",
    whatsapp: "WhatsApp",
    errorFill: "กรุณากรอกทุกช่องและใช้อีเมลที่ถูกต้อง",
    errorGeneric: "เกิดข้อผิดพลาด กรุณาลองใหม่",
    success: "ส่งข้อความแล้ว เราจะติดต่อกลับโดยเร็ว",
    tagline: "สโลแกน",
    address: "ที่อยู่",
    phone: "โทร",
    facebook: "เพจ Facebook",
  },
}

export default function ContactUs({ lang, className = "", showLanguageSelector }: Props) {
  const [localLang, setLocalLang] = useState<Lang>("en")
  const effectiveLang = (lang ?? localLang) as Lang
  const L = LABELS[effectiveLang]

  // Form state
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Initialize language
  useEffect(() => {
    if (lang) return
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    const q = (url.searchParams.get("lang") || "").toLowerCase()
    if (q === "en" || q === "th") setLocalLang(q as Lang)
    else {
      const nav = navigator.language?.toLowerCase() || ""
      setLocalLang(nav.startsWith("th") ? "th" : "en")
    }
  }, [lang])

  const onChangeLang = (value: Lang) => {
    if (!lang) setLocalLang(value)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.set("lang", value)
      window.history.replaceState({}, "", url.toString())
    }
  }

  const info = useMemo(
    () => ({
      email: company.email,
      phone: company.phone,
      whatsapp: `+${company.whatsapp}`,
      address: pick(effectiveLang, company.address),
      tagline: pick(effectiveLang, company.tagline),
      facebook: company.facebook,
    }),
    [effectiveLang]
  )

  const telHref = useMemo(() => `tel:${digitsOnly(info.phone)}`, [info.phone])
  const waHref = useMemo(() => `https://wa.me/${digitsOnly(info.whatsapp)}`, [info.whatsapp])

  const validate = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return false
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
  }

  const onChangeField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      setToast({ type: "error", message: L.errorFill })
      return
    }
    setLoading(true)
    setToast(null)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message || L.errorGeneric)
      setToast({ type: "success", message: json?.message || L.success })
      setFormData({ name: "", email: "", message: "" })
    } catch (err: any) {
      setToast({ type: "error", message: err?.message || L.errorGeneric })
    } finally {
      setLoading(false)
      setTimeout(() => setToast(null), 6000)
    }
  }

  const showSelectorFinal = showLanguageSelector ?? (lang == null)

  return (
    <section className={`py-8 sm:py-12 ${className}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-primary">
                {L.kicker}
              </p>
              <h1 className="mt-2 text-lg sm:text-3xl md:text-4xl font-semibold text-slate-900">
                {L.title}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600">{L.subtitle}</p>
            </div>
            {showSelectorFinal && (
              <div>
                <label htmlFor="contact-lang" className="sr-only">
                  {L.language}
                </label>
                <select
                  id="contact-lang"
                  value={effectiveLang}
                  onChange={(e) => onChangeLang(e.target.value as Lang)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-primary/30"
                >
                  <option value="en">English</option>
                  <option value="th">ไทย</option>
                </select>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">
              {L.infoHeader}
            </h2>
            <ul className="space-y-3 text-sm sm:text-base text-slate-700">
              {info.tagline && (
                <li className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-primary mt-0.5" />
                  <span>{info.tagline}</span>
                </li>
              )}
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <a
                  href={`mailto:${info.email}`}
                  className="hover:text-primary focus:outline-none focus:underline"
                >
                  {info.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5" />
                <a
                  href={telHref}
                  className="hover:text-primary focus:outline-none focus:underline"
                >
                  {info.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-primary mt-0.5" />
                <Link
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary focus:outline-none focus:underline"
                >
                  {L.whatsapp} <ExternalLink className="inline w-3.5 h-3.5 ml-1 align-[-2px]" />
                </Link>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <span>{info.address}</span>
              </li>
              {info.facebook && (
                <li className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-primary mt-0.5" />
                  <Link
                    href={info.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary focus:outline-none focus:underline"
                  >
                    {L.facebook}
                  </Link>
                </li>
              )}
            </ul>
            <div className="mt-6 rounded-lg bg-primary/5 p-4 text-xs sm:text-sm text-slate-700">
              {L.responseNote}
            </div>
          </div>

            {/* Form Card */}
            {/* <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">
                {L.formHeader}
              </h2>

              {toast && (
                <div
                  role="status"
                  className={`mb-4 rounded-md px-4 py-2 text-sm ${
                    toast.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {toast.message}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                    {L.name}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={onChangeField}
                    required
                    placeholder={L.namePh}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                    {L.email}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={onChangeField}
                    required
                    placeholder={L.emailPh}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700">
                    {L.message}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={onChangeField}
                    required
                    placeholder={L.messagePh}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-white text-sm disabled:opacity-50"
                  >
                    {loading ? L.sending : L.send}
                  </button>

                  <p className="text-xs text-slate-500">
                    {L.chatPrompt}{" "}
                    <Link
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-primary"
                    >
                      {L.whatsapp}
                    </Link>
                  </p>
                </div>
              </form>
            </div> */}
        </div>
      </div>
    </section>
  )
}