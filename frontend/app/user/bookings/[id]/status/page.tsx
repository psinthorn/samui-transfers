'use client'

import React, { Suspense, useState } from 'react'
import { useParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useBookingStatus } from '@/hooks/useBookingStatus'
import { BookingTimeline } from '@/components/booking/BookingTimeline'
import { StatusBadge } from '@/components/booking/StatusBadge'
import { PaymentProofUploadDialog } from '@/components/customer/PaymentProofUploadDialog'
import { Loader2, AlertCircle, RefreshCw, Upload } from 'lucide-react'
import Link from 'next/link'

const BookingStatusContent = () => {
  const { lang } = useLanguage()
  const params = useParams()
  const bookingId = params?.id as string
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  const { status, loading, error, isPolling, refresh } = useBookingStatus(bookingId)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600">
          {lang === 'th' ? 'กำลังโหลด...' : 'Loading...'}
        </p>
      </div>
    )
  }

  if (error || !status) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 flex gap-4">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">
            {lang === 'th' ? 'เกิดข้อผิดพลาด' : 'Error'}
          </h3>
          <p className="text-red-700 text-sm mt-1">
            {error || (lang === 'th' ? 'ไม่สามารถโหลดสถานะ' : 'Failed to load status')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header with Status and Polling Info */}
      <div className="mb-8 bg-white border border-slate-200 rounded-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              {lang === 'th' ? 'สถานะการจอง' : 'Booking Status'}
            </h1>
            <p className="text-slate-600 text-sm">
              {lang === 'th' ? 'Booking ID: ' : 'Booking ID: '}
              <span className="font-mono font-medium">{bookingId.slice(0, 8)}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge
              status={status.status}
              paymentStatus={status.paymentStatus}
              size="lg"
              lang={lang}
            />
          </div>
        </div>

        {/* Polling Status */}
        <div className="flex items-center gap-2 text-sm">
          {isPolling ? (
            <>
              <div className="animate-pulse w-2 h-2 bg-green-600 rounded-full" />
              <span className="text-green-700">
                {lang === 'th' ? 'อัปเดตแบบเรียลไทม์ (ทุก 10 วินาที)' : 'Real-time updates (every 10s)'}
              </span>
            </>
          ) : (
            <span className="text-slate-600">
              {lang === 'th' ? 'เสร็จสิ้นการอัปเดต' : 'Updates stopped'}
            </span>
          )}
          <button
            onClick={refresh}
            className="ml-auto p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            title={lang === 'th' ? 'รีเฟรช' : 'Refresh'}
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Payment Proof Section - Show for PENDING payments */}
      {status.paymentStatus === "PENDING" && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-blue-900 mb-1">
                {lang === 'th' ? 'อัปโหลดหลักฐานการชำระเงิน' : 'Upload Payment Proof'}
              </h2>
              <p className="text-sm text-blue-800">
                {lang === 'th' 
                  ? 'ชำระเงินผ่านการโอนธนาคารแล้ว? อัปโหลดใบเสร็จของคุณด้านล่าง' 
                  : 'Paid via bank transfer? Upload your receipt below.'}
              </p>
            </div>
            <button
              onClick={() => setUploadDialogOpen(true)}
              className="px-4 py-2 bg-[#005B9A] text-white rounded-lg hover:bg-[#004480] transition-colors flex items-center gap-2 font-medium"
            >
              <Upload className="w-4 h-4" />
              {lang === 'th' ? 'อัปโหลด' : 'Upload'}
            </button>
          </div>
          
          {/* Show proof status if uploaded */}
          {status.paymentProofStatus && (
            <div className="mt-4 text-sm font-medium text-blue-700 bg-white rounded p-3">
              ✓ {lang === 'th' ? `หลักฐานที่อัปโหลด - ${status.paymentProofStatus}` : `Proof uploaded - ${status.paymentProofStatus}`}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Section - Show if payment completed */}
      {status.paymentStatus === "COMPLETED" && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6 sm:p-8">
          <p className="text-sm font-medium text-green-700">
            ✓ {lang === 'th' ? 'ยืนยันการชำระเงินแล้ว! การจองของคุณได้รับการยืนยัน' : "Payment verified! Your booking is confirmed."}
          </p>
        </div>
      )}

      {/* Timeline */}
      <BookingTimeline
        steps={status.steps}
        currentStep={status.currentStep}
        estimatedCompletionTime={status.estimatedCompletionTime}
        lang={lang}
      />

      {/* Additional Info */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Last Update */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <p className="text-sm font-medium text-slate-600 mb-2">
            {lang === 'th' ? 'อัปเดตล่าสุด' : 'Last Update'}
          </p>
          <p className="text-lg font-semibold text-slate-900">
            {new Date(status.lastUpdate).toLocaleTimeString(
              lang === 'th' ? 'th-TH' : 'en-US',
              {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }
            )}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            {new Date(status.lastUpdate).toLocaleDateString(
              lang === 'th' ? 'th-TH' : 'en-US'
            )}
          </p>
        </div>

        {/* Current Step */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <p className="text-sm font-medium text-slate-600 mb-2">
            {lang === 'th' ? 'ขั้นตอนปัจจุบัน' : 'Current Step'}
          </p>
          <p className="text-lg font-semibold text-slate-900">
            {status.currentStep}/{status.steps.length}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            {status.steps.find((s) => s.step === status.currentStep)?.title}
          </p>
        </div>
      </div>

      {/* Payment Proof Upload Dialog */}
      <PaymentProofUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        bookingId={bookingId}
        bookingReference={status.id}
        paymentAmount={0} // Will be fetched from booking details
        onUploadSuccess={() => {
          refresh()
        }}
      />
    </>
  )
}

export default function BookingStatusPage() {
  const { lang } = useLanguage()

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl px-4">
        {/* Back Link */}
        <Link
          href="/user/bookings"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-6 px-3 py-2 rounded-lg hover:bg-white transition-colors"
        >
          ← {lang === 'th' ? 'ประวัติการจอง' : 'Back to History'}
        </Link>

        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-600">
                {lang === 'th' ? 'กำลังโหลด...' : 'Loading...'}
              </p>
            </div>
          }
        >
          <BookingStatusContent />
        </Suspense>
      </div>
    </main>
  )
}
