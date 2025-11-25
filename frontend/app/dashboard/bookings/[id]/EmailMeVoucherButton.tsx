"use client"

import { useTransition } from "react"
import { Mail } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { useLanguage } from "@/context/LanguageContext"

const M = {
  en: { sending: "Sending…", sent: "Voucher sent to your email", failed: "Failed to send voucher", label: "Email Voucher" },
  th: { sending: "กำลังส่ง…", sent: "ส่งใบยืนยันการจองไปที่อีเมลแล้ว", failed: "ไม่สามารถส่งใบยืนยันการจองได้", label: "ส่งใบยืนยันไปที่อีเมล" },
}

export default function EmailMeVoucherButton({ action }: { action: () => Promise<{ ok: boolean; message?: string }> }) {
  const [pending, start] = useTransition()
  const { push } = useToast()
  const { lang } = useLanguage()
  const t = M[lang]
  return (
    <button
      className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            const res = await action()
            if (res?.ok) push({ type: "success", message: t.sent })
            else push({ type: "error", message: res?.message || t.failed })
          } catch (e: any) {
            push({ type: "error", message: e?.message || t.failed })
          }
        })
      }
    >
      <Mail className="w-4 h-4" />
      <span className="hidden sm:inline">{pending ? t.sending : t.label}</span>
      <span className="sm:hidden">{pending ? "..." : t.label}</span>
    </button>
  )
}
