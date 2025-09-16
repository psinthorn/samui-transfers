import React from 'react'
import Link from 'next/link'

const ConfirmationPage = () => {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Confirmation</h1>
          <p className="mt-2 text-sm text-slate-600">
            Please return to the booking flow to review and confirm your request.
          </p>
          <div className="mt-5">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Go to booking
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ConfirmationPage