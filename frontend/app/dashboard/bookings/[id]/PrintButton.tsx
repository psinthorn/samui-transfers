"use client"

import { Printer } from "lucide-react"

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors print:hidden"
    >
      <Printer className="w-4 h-4" />
      Print
    </button>
  )
}
