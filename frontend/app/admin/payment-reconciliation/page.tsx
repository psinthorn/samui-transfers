import { requireAdmin } from "@/lib/auth"
import { PaymentReconciliationDashboard } from "@/components/admin/PaymentReconciliationDashboard"
import Link from "next/link"

export const runtime = "nodejs"

export const metadata = {
  title: "Payment Reconciliation | Admin",
  description: "Track and analyze all booking payments",
}

export default async function PaymentReconciliationPage() {
  await requireAdmin()

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="sticky top-0 bg-white border-b border-slate-200 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Payment Reconciliation</h1>
          <Link href="/admin" className="text-[#005B9A] hover:underline text-sm">
            ← Back to Admin
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <PaymentReconciliationDashboard />
      </div>
    </main>
  )
}
