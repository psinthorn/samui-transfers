'use client'

import React from 'react'
import { CheckCircle2, Clock, MapPin, DollarSign } from 'lucide-react'
import { formatBookingDetails, getStatusLabel, getStatusColor } from '@/lib/booking'

interface BookingConfirmationCardProps {
  referenceNumber: string
  bookingId: string
  status: string
  createdAt: Date | string
  confirmationSentAt?: Date | string
  details: any
  paymentAmount?: number
  paymentMethod?: string
  paymentDate?: Date | string
  userEmail?: string
  userName?: string
  lang?: string
}

export const BookingConfirmationCard: React.FC<BookingConfirmationCardProps> = ({
  referenceNumber,
  bookingId,
  status,
  createdAt,
  confirmationSentAt,
  details,
  paymentAmount,
  paymentMethod,
  paymentDate,
  userEmail,
  userName,
  lang = 'en',
}) => {
  const bookingDetails = formatBookingDetails(details)
  const createdDate = new Date(createdAt)
  const confirmDate = confirmationSentAt ? new Date(confirmationSentAt) : null

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header with success icon */}
      <div className="bg-white rounded-t-lg border border-b-0 border-slate-200 p-6 sm:p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          {lang === 'th' ? 'การจองยืนยันแล้ว' : 'Booking Confirmed!'}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">
          {lang === 'th'
            ? 'ขอบคุณที่ใช้บริการ Samui Transfers'
            : 'Thank you for booking with Samui Transfers'}
        </p>
      </div>

      {/* Reference Number */}
      <div className="bg-blue-50 border-b border-slate-200 px-6 sm:px-8 py-4">
        <p className="text-xs text-slate-600 mb-1">
          {lang === 'th' ? 'หมายเลขอ้างอิงการจอง' : 'Booking Reference'}
        </p>
        <p className="text-lg sm:text-2xl font-bold text-blue-900 font-mono">
          {referenceNumber}
        </p>
      </div>

      {/* Confirmation Details */}
      <div className="bg-white border-b border-slate-200 px-6 sm:px-8 py-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Booking Date */}
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
              {lang === 'th' ? 'วันที่จอง' : 'Booking Date'}
            </p>
            <p className="text-slate-900">
              {createdDate.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {/* Confirmation Sent */}
          {confirmDate && (
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                {lang === 'th' ? 'ส่งการยืนยัน' : 'Confirmation Sent'}
              </p>
              <p className="text-slate-900">
                {confirmDate.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details */}
      <div className="bg-white border-b border-slate-200 px-6 sm:px-8 py-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {lang === 'th' ? 'รายละเอียดการจอง' : 'Booking Details'}
        </h2>
        <div className="space-y-4">
          {/* Pickup */}
          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                {lang === 'th' ? 'จุดรับ' : 'Pickup Location'}
              </p>
              <p className="text-slate-900 font-medium">{bookingDetails.pickupLocation}</p>
              {bookingDetails.pickupTime && (
                <p className="text-sm text-slate-600 mt-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {bookingDetails.pickupTime}
                </p>
              )}
            </div>
          </div>

          {/* Dropoff */}
          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                {lang === 'th' ? 'จุดส่ง' : 'Dropoff Location'}
              </p>
              <p className="text-slate-900 font-medium">{bookingDetails.dropoffLocation}</p>
            </div>
          </div>

          {/* Vehicle & Passengers */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                {lang === 'th' ? 'ประเภทยานพาหนะ' : 'Vehicle Type'}
              </p>
              <p className="text-slate-900 font-medium capitalize">
                {bookingDetails.vehicleType}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                {lang === 'th' ? 'จำนวนผู้โดยสาร' : 'Passengers'}
              </p>
              <p className="text-slate-900 font-medium">{bookingDetails.passengerCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      {paymentAmount && (
        <div className="bg-white border-b border-slate-200 px-6 sm:px-8 py-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {lang === 'th' ? 'ข้อมูลการชำระเงิน' : 'Payment Information'}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">
                {lang === 'th' ? 'จำนวนเงิน' : 'Amount'}:
              </span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {paymentAmount.toFixed(2)}
              </span>
            </div>
            {paymentMethod && (
              <div className="flex justify-between items-center">
                <span className="text-slate-600">
                  {lang === 'th' ? 'วิธีการชำระเงิน' : 'Payment Method'}:
                </span>
                <span className="font-medium text-slate-900 capitalize">
                  {paymentMethod}
                </span>
              </div>
            )}
            {paymentDate && (
              <div className="flex justify-between items-center">
                <span className="text-slate-600">
                  {lang === 'th' ? 'วันที่ชำระเงิน' : 'Payment Date'}:
                </span>
                <span className="font-medium text-slate-900">
                  {new Date(paymentDate).toLocaleDateString(
                    lang === 'th' ? 'th-TH' : 'en-US'
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Email */}
      <div className="bg-blue-50 border-b border-slate-200 px-6 sm:px-8 py-4 text-sm text-slate-700">
        {lang === 'th'
          ? `✓ ส่งการยืนยันไปยัง ${userEmail}`
          : `✓ Confirmation email sent to ${userEmail}`}
      </div>

      {/* Status Badge */}
      <div className="bg-white rounded-b-lg border border-t-0 border-slate-200 px-6 sm:px-8 py-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">
            {lang === 'th' ? 'สถานะ' : 'Status'}:
          </span>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
              status
            )}`}
          >
            {getStatusLabel(status, lang)}
          </span>
        </div>
      </div>

      {/* Important Notes */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-semibold text-amber-900 mb-2 text-sm">
          {lang === 'th' ? 'หมายเหตุสำคัญ' : 'Important Notes'}
        </h3>
        <ul className="text-sm text-amber-800 space-y-2">
          <li>
            • {lang === 'th'
              ? 'โปรดเก็บหมายเลขอ้างอิงนี้ไว้เพื่อใช้ในอนาคต'
              : 'Please save this reference number for future reference'}
          </li>
          <li>
            • {lang === 'th'
              ? 'คุณสามารถดูการจองของคุณในส่วนประวัติการจอง'
              : 'You can view this booking in your booking history'}
          </li>
          <li>
            • {lang === 'th'
              ? 'หากต้องการยกเลิก ต้องยกเลิกอย่างน้อย 2 ชั่วโมงก่อนเวลารับ'
              : 'Cancellations must be made at least 2 hours before pickup'}
          </li>
        </ul>
      </div>
    </div>
  )
}
