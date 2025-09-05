import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms & Conditions | Samui Transfers",
  description: "Booking terms, cancellations, waiting time, safety, pricing, and more.",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Legal</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-900">Terms & Conditions</h1>
          <p className="mt-2 text-sm text-slate-600">Please review before booking.</p>
        </header>

        <section className="rounded-xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">Booking & Payments</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
            <li>Payment: 100% deposit required to confirm your booking.</li>
            <li>Pricing: All prices in THB; taxes/fees included unless stated otherwise.</li>
          </ul>

          <h2 className="mt-5 text-base sm:text-lg font-semibold text-slate-900">Cancellations & Changes</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
            <li>Cancellation: ≥ 72 hours before pickup — full refund of deposit.</li>
            <li>Cancellation: 24–72 hours before pickup — 70% refund within 5–7 business days.</li>
            <li>Cancellation: &lt; 24 hours or no‑show — non‑refundable.</li>
            <li>Changes: One free change up to 24 hours before pickup (subject to availability; fare differences may apply).</li>
          </ul>

          <h2 className="mt-5 text-base sm:text-lg font-semibold text-slate-900">Pickup, Waiting & Delays</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
            <li>Waiting time: Airport pickups include 60 minutes free; other pickups include 15 minutes free. Extra waiting may incur charges or require a new booking.</li>
            <li>Delays: We monitor flight delays and will adjust pickup when possible. Significant delays may require rescheduling.</li>
            <li>Force majeure: Not liable for delays caused by events beyond our control (weather, traffic incidents, etc.).</li>
          </ul>

          <h2 className="mt-5 text-base sm:text-lg font-semibold text-slate-900">Passengers, Luggage & Safety</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
            <li>Passengers &amp; luggage: Passenger count must match the booking. Oversized luggage or extra items may require a larger vehicle and additional fees.</li>
            <li>Child seats: Available on request; please specify in Notes so we can confirm availability.</li>
            <li>Conduct &amp; safety: No smoking or open alcohol in vehicles. Seat belts are required at all times.</li>
          </ul>

          <p className="mt-5 text-xs text-slate-500">
            By booking, you acknowledge and accept these terms. For questions, please contact support.
          </p>
        </section>
      </div>
    </main>
  )
}