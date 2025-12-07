'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { bookingText } from '@/data/content/booking'
import { pick } from '@/data/i18n/core'
import { BookingConfirmationCard } from '@/components/booking/BookingConfirmationCard'
import { Loader2 } from 'lucide-react'

const ConfirmationPage = () => {
  const { lang } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams?.get('id')

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!bookingId) {
      setError('No booking ID provided')
      setLoading(false)
      return
    }

    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}/confirm`)
        if (!response.ok) {
          throw new Error('Failed to fetch booking')
        }
        const data = await response.json()
        setBooking(data.booking)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-600">
            {lang === 'th' ? 'กำลังโหลด...' : 'Loading...'}
          </p>
        </div>
      </main>
    )
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
          <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6 text-center">
            <h1 className="text-xl sm:text-2xl font-semibold text-red-900">
              {lang === 'th' ? 'เกิดข้อผิดพลาด' : 'Error'}
            </h1>
            <p className="mt-2 text-sm text-red-700">
              {error || (lang === 'th' ? 'ไม่พบการจอง' : 'Booking not found')}
            </p>
            <div className="mt-5 flex gap-3 justify-center">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
              >
                {pick(lang, bookingText.confirmPage.backToBooking)}
              </Link>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center justify-center rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-300"
              >
                {lang === 'th' ? 'กลับ' : 'Back'}
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl px-4">
        <BookingConfirmationCard
          referenceNumber={booking.referenceNumber || `BK-${bookingId?.slice(0, 8) || 'UNKNOWN'}`}
          bookingId={booking.id}
          status={booking.status}
          createdAt={booking.createdAt}
          confirmationSentAt={booking.confirmationSentAt}
          details={booking.details}
          paymentAmount={booking.paymentAmount ? Number(booking.paymentAmount) : undefined}
          paymentMethod={booking.paymentMethod}
          paymentDate={booking.paymentDate}
          userEmail={booking.user?.email}
          userName={booking.user?.name}
          lang={lang}
        />

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/user/bookings/${booking.id}`}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            {lang === 'th' ? 'ดูรายละเอียด' : 'View Details'}
          </Link>
          <Link
            href="/user/bookings"
            className="inline-flex items-center justify-center rounded-md bg-slate-200 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-300 transition-colors"
          >
            {lang === 'th' ? 'ประวัติการจอง' : 'Booking History'}
          </Link>
          <Link
            href="/booking"
            className="inline-flex items-center justify-center rounded-md bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            {lang === 'th' ? 'จองใหม่' : 'New Booking'}
          </Link>
        </div>
      </div>
    </main>
  )
}

export default ConfirmationPage