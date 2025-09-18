"use client"

import { useTransition } from "react"
import { useToast } from "@/components/ui/toast"
import { useLanguage } from "@/context/LanguageContext"

const M = {
  en: { sending: "Sending…", sent: "Voucher sent to your email", failed: "Failed to send voucher", label: "Email me voucher" },
  th: { sending: "กำลังส่ง…", sent: "ส่งใบยืนยันการจองไปที่อีเมลแล้ว", failed: "ไม่สามารถส่งใบยืนยันการจองได้", label: "ส่งใบยืนยันไปที่อีเมล" },
}

export default function EmailMeVoucherButton({ action }: { action: () => Promise<{ ok: boolean; message?: string }> }) {
  const [pending, start] = useTransition()
  const { push } = useToast()
  const { lang } = useLanguage()
  const t = M[lang]
  return (
    <button
      className="px-3 py-1 rounded border disabled:opacity-50"
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
      {pending ? t.sending : t.label}
    </button>
  )
}
