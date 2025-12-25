import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { PaymentGatewayManager } from "@/components/admin/PaymentGatewayManager"

export default async function PaymentGatewaysPage() {
  const session = await auth()

  // Check authentication
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/admin/payment-gateways")
  }

  // Check admin role
  const user = await db.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user || user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
          Payment Gateway Settings
        </h1>
        <p className="text-slate-600 mt-2">
          Control which payment methods are available to customers and manage their settings
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-slate-900 mb-2">ℹ️ About Payment Gateways</h3>
        <p className="text-sm text-slate-700">
          You can enable or disable payment methods, hide them from customers, and reorder how they appear on the payment page. Changes take effect immediately.
        </p>
      </div>

      {/* Payment Gateway Manager Component */}
      <PaymentGatewayManager />
    </div>
  )
}
