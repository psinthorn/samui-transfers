'use client'

import React, { Suspense } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { BookingFilters } from '@/components/booking/BookingFilters'
import { BookingListItem } from '@/components/booking/BookingListItem'
import { useBookingHistory, BookingHistoryFilters } from '@/hooks/useBookingHistory'
import { Loader2, AlertCircle, Package } from 'lucide-react'
import Link from 'next/link'

const BookingHistoryContent = () => {
  const { lang } = useLanguage()
  const {
    bookings,
    total,
    page,
    pageSize,
    hasMore,
    loading,
    error,
    applyFilters,
    nextPage,
    prevPage,
    totalPages = Math.ceil(total / pageSize),
  } = useBookingHistory()

  const handleFiltersChange = (filters: BookingHistoryFilters) => {
    applyFilters(filters)
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            {lang === 'th' ? 'ประวัติการจอง' : 'Booking History'}
          </h1>
          <p className="text-slate-600">
            {lang === 'th'
              ? 'ดูและจัดการการจองทั้งหมดของคุณ'
              : 'View and manage all your bookings'}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <BookingFilters
            onFiltersChange={handleFiltersChange}
            loading={loading}
            lang={lang}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 flex gap-4">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">
                {lang === 'th' ? 'เกิดข้อผิดพลาด' : 'Error'}
              </h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-600">
              {lang === 'th' ? 'กำลังโหลด...' : 'Loading...'}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-8 sm:p-12 text-center">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {lang === 'th' ? 'ไม่พบการจอง' : 'No Bookings Found'}
            </h3>
            <p className="text-slate-600 mb-6">
              {lang === 'th'
                ? 'คุณยังไม่มีการจองใดๆ หรือไม่มีการจองตามเกณฑ์ที่คุณค้นหา'
                : 'You have no bookings yet or no bookings match your search'}
            </p>
            <Link
              href="/booking"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              {lang === 'th' ? 'จองใหม่' : 'Create New Booking'}
            </Link>
          </div>
        )}

        {/* Bookings List */}
        {!loading && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingListItem
                key={booking.id}
                id={booking.id}
                referenceNumber={booking.referenceNumber}
                status={booking.status}
                createdAt={booking.createdAt}
                details={booking.details}
                paymentAmount={booking.paymentAmount ? Number(booking.paymentAmount) : undefined}
                paymentStatus={booking.paymentStatus}
                lang={lang}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && total > pageSize && (
          <div className="mt-8 flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg">
            <p className="text-sm text-slate-600">
              {lang === 'th' ? 'แสดง' : 'Showing'}{' '}
              <span className="font-semibold">{(page - 1) * pageSize + 1}</span>
              {lang === 'th' ? 'ถึง' : '-'}
              <span className="font-semibold">{Math.min(page * pageSize, total)}</span>
              {lang === 'th' ? 'จาก' : ' of '}
              <span className="font-semibold">{total}</span>
              {lang === 'th' ? 'รายการ' : ''}
            </p>
            <div className="flex gap-2">
              <button
                onClick={prevPage}
                disabled={page === 1 || loading}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {lang === 'th' ? 'ก่อนหน้า' : 'Previous'}
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum = page - 2 + i
                  if (pageNum < 1) return null
                  if (pageNum > totalPages) return null
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        // goToPage(pageNum)
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        pageNum === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={nextPage}
                disabled={!hasMore || loading}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {lang === 'th' ? 'ต่อไป' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function BookingHistoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingHistoryContent />
    </Suspense>
  )
}
