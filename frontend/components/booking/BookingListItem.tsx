'use client'

import React from 'react'
import { Calendar, MapPin, Users, FileText } from 'lucide-react'
import { formatBookingDetails, getStatusColor, getStatusLabel } from '@/lib/booking'
import Link from 'next/link'

interface BookingListItemProps {
  id: string
  referenceNumber?: string
  status: string
  createdAt: string | Date
  details: any
  paymentAmount?: number
  paymentStatus?: string
  lang?: string
  onViewDetails?: (id: string) => void
}

export const BookingListItem: React.FC<BookingListItemProps> = ({
  id,
  referenceNumber,
  status,
  createdAt,
  details,
  paymentAmount,
  paymentStatus,
  lang = 'en',
  onViewDetails,
}) => {
  const bookingDetails = formatBookingDetails(details)
  const bookingDate = new Date(createdAt)

  return (
    <Link
      href={`/user/bookings/${id}`}
      className="block bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow p-4 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Reference & Status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-xs sm:text-sm font-bold text-slate-900 font-mono">
              {referenceNumber || `BK-${id.slice(0, 8).toUpperCase()}`}
            </p>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(status)}`}>
              {getStatusLabel(status, lang)}
            </span>
            {paymentStatus && (
              <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                {lang === 'th' ? 'ชำระ: ' : 'Payment: '}
                {paymentStatus}
              </span>
            )}
          </div>

          {/* Booking Date */}
          <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {bookingDate.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US')}
            {' • '}
            {bookingDate.toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Booking Details - Hidden on mobile, shown on sm and up */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-4 flex-1">
          {/* Pickup */}
          <div className="min-w-0">
            <p className="text-xs text-slate-600 font-medium mb-1">
              {lang === 'th' ? 'จุดรับ' : 'Pickup'}
            </p>
            <p className="text-sm text-slate-900 truncate flex items-start gap-1">
              <MapPin className="w-4 h-4 flex-shrink-0 text-green-600 mt-0.5" />
              <span className="truncate">{bookingDetails.pickupLocation}</span>
            </p>
          </div>

          {/* Dropoff */}
          <div className="min-w-0">
            <p className="text-xs text-slate-600 font-medium mb-1">
              {lang === 'th' ? 'จุดส่ง' : 'Dropoff'}
            </p>
            <p className="text-sm text-slate-900 truncate flex items-start gap-1">
              <MapPin className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
              <span className="truncate">{bookingDetails.dropoffLocation}</span>
            </p>
          </div>

          {/* Vehicle & Passengers */}
          <div>
            <p className="text-xs text-slate-600 font-medium mb-1">
              {lang === 'th' ? 'ยานพาหนะ' : 'Vehicle'}
            </p>
            <p className="text-sm text-slate-900 capitalize">
              {bookingDetails.vehicleType}
              {bookingDetails.passengerCount > 0 && (
                <>
                  {' • '}
                  <Users className="w-4 h-4 inline" />
                  {bookingDetails.passengerCount}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Mobile View - Locations and Details */}
        <div className="sm:hidden space-y-2">
          <div>
            <p className="text-xs text-slate-600 font-medium mb-1">
              {lang === 'th' ? 'จากจุดรับไปยังจุดส่ง' : 'Route'}
            </p>
            <p className="text-sm text-slate-900 flex items-center gap-2">
              <span className="truncate">{bookingDetails.pickupLocation}</span>
              <span className="text-slate-400">→</span>
              <span className="truncate">{bookingDetails.dropoffLocation}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 font-medium mb-1">
              {lang === 'th' ? 'ยานพาหนะ' : 'Vehicle'}
            </p>
            <p className="text-sm text-slate-900 capitalize">
              {bookingDetails.vehicleType}
              {bookingDetails.passengerCount > 0 && ` • ${bookingDetails.passengerCount} passengers`}
            </p>
          </div>
        </div>

        {/* Amount & Action */}
        {paymentAmount !== undefined && (
          <div className="text-right">
            <p className="text-sm sm:text-base font-bold text-slate-900">
              ฿{paymentAmount.toFixed(2)}
            </p>
            <p className="text-xs text-slate-600">
              {lang === 'th' ? 'ดูรายละเอียด' : 'View details'}
            </p>
          </div>
        )}
      </div>
    </Link>
  )
}
