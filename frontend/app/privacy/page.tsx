import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Samui Transfers",
  description: "How we collect, use, and protect your personal data.",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Legal</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-600">Your privacy and data protection.</p>
        </header>

        <section className="rounded-xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">Information we collect</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
            <li>Contact details: name, email, phone number.</li>
            <li>Trip details: pickup/drop-off, dates/times, passengers, notes.</li>
            <li>Technical: IP, device, and usage analytics (cookies).</li>
          </ul>

          <h2 className="mt-5 text-base sm:text-lg font-semibold text-slate-900">How we use your data</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
            <li>Provide and manage bookings and customer support.</li>
            <li>Send confirmations, updates, and service messages.</li>
            <li>Improve services, security, and site performance.</li>
          </ul>

          <h2 className="mt-5 text-base sm:text-lg font-semibold text-slate-900">Legal bases & retention</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
            <li>Contract performance (fulfilling your booking).</li>
            <li>Legitimate interests (service improvement, security).</li>
            <li>Consent where required (marketing, cookies).</li>
            <li>We keep data only as long as necessary for the purposes described or to comply with law.</li>
          </ul>

          <h2 className="mt-5 text-base sm:text-lg font-semibold text-slate-900">Sharing & third parties</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
            <li>Trusted providers (e.g., email, hosting, analytics) under data protection agreements.</li>
            <li>Authorities where required by law.</li>
            <li>We do not sell personal data.</li>
          </ul>

          <h2 className="mt-5 text-base sm:text-lg font-semibold text-slate-900">Your rights</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
            <li>Access, correct, delete, or export your data.</li>
            <li>Object to or restrict processing; withdraw consent at any time.</li>
            <li>Contact us to exercise rights or make a complaint.</li>
          </ul>

          <p className="mt-5 text-xs text-slate-500">
            For privacy requests, contact: booking@samui-transfers.com
          </p>
        </section>
      </div>
    </main>
  )
}