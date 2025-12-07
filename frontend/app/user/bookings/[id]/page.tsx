'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { BookingConfirmationCard } from '@/components/booking/BookingConfirmationCard'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function BookingDetailsPage() {
  const { lang } = useLanguage()
  const params = useParams()
  const router = useRouter()
  const bookingId = params?.id as string

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
        const response = await fetch(`/api/bookings/${bookingId}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Booking not found')
          }
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
          <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
            <div className="flex gap-4 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-red-900">
                  {lang === 'th' ? 'เกิดข้อผิดพลาด' : 'Error'}
                </h1>
                <p className="mt-2 text-sm text-red-700">
                  {error || (lang === 'th' ? 'ไม่พบการจอง' : 'Booking not found')}
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-red-200">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 px-4 py-2 rounded-md hover:bg-red-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {lang === 'th' ? 'กลับ' : 'Go Back'}
              </button>
              <Link
                href="/user/bookings"
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-700 px-4 py-2 rounded-md hover:bg-slate-100 transition-colors"
              >
                {lang === 'th' ? 'ประวัติการจอง' : 'Booking History'}
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl px-4">
        {/* Navigation */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'th' ? 'กลับ' : 'Back'}
          </button>
        </div>

        {/* Booking Confirmation Card */}
        <BookingConfirmationCard
          referenceNumber={booking.referenceNumber || `BK-${booking.id.slice(0, 8).toUpperCase()}`}
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

        {/* Cancellation Info - if applicable */}
        {booking.status === 'CANCELLED' && booking.cancellationReason && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-6">
            <h3 className="font-semibold text-amber-900 mb-2">
              {lang === 'th' ? 'ข้อมูลการยกเลิก' : 'Cancellation Information'}
            </h3>
            <div className="space-y-2 text-sm text-amber-800">
              <p>
                <span className="font-medium">
                  {lang === 'th' ? 'เหตุผล: ' : 'Reason: '}
                </span>
                {booking.cancellationReason}
              </p>
              {booking.cancellationDate && (
                <p>
                  <span className="font-medium">
                    {lang === 'th' ? 'วันที่ยกเลิก: ' : 'Cancelled on: '}
                  </span>
                  {new Date(booking.cancellationDate).toLocaleDateString(
                    lang === 'th' ? 'th-TH' : 'en-US'
                  )}
                </p>
              )}
              {booking.refundAmount && (
                <p>
                  <span className="font-medium">
                    {lang === 'th' ? 'จำนวนเงินคืน: ' : 'Refund Amount: '}
                  </span>
                  ฿{Number(booking.refundAmount).toFixed(2)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {booking.status === 'CONFIRMED' && (
            <Link
              href={`/user/bookings/${booking.id}/edit`}
              className="inline-flex items-center justify-center rounded-md bg-slate-600 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
            >
              {lang === 'th' ? 'แก้ไข' : 'Edit'}
            </Link>
          )}
          <Link
            href="/user/bookings"
            className="inline-flex items-center justify-center rounded-md bg-slate-200 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-300 transition-colors"
          >
            {lang === 'th' ? 'ประวัติการจอง' : 'Back to History'}
          </Link>
          <Link
            href="/booking"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            {lang === 'th' ? 'จองใหม่' : 'New Booking'}
          </Link>
        </div>
      </div>
    </main>
  )
}
