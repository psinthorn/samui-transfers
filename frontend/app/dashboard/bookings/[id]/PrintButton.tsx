"use client"

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="bg-[#005B9A] text-white px-3 py-1 rounded text-sm print:hidden"
    >
      Print
    </button>
  )
}
