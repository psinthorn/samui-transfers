'use client'

import React, { useState } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import { useCancelBooking } from '@/hooks/useCancelBooking'

interface CancellationDialogProps {
  bookingId: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: (response: any) => void
  hoursUntilPickup?: number
  lang?: string
}

export const CancellationDialog: React.FC<CancellationDialogProps> = ({
  bookingId,
  isOpen,
  onClose,
  onSuccess,
  hoursUntilPickup = 0,
  lang = 'en',
}) => {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const { cancelBooking, loading, error, success, cancellationResponse } =
    useCancelBooking(bookingId)

  const handleCancel = async () => {
    await cancelBooking({ reason, description })
  }

  const handleClose = () => {
    if (!loading) {
      setReason('')
      setDescription('')
      onClose()
    }
  }

  const handleSuccess = () => {
    if (onSuccess && cancellationResponse) {
      onSuccess(cancellationResponse)
    }
    handleClose()
  }

  if (!isOpen) return null

  // Success state
  if (success && cancellationResponse) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6 sm:p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 text-green-600">
              <svg
                className="h-full w-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {lang === 'th' ? 'ยกเลิกสำเร็จ' : 'Cancellation Successful'}
            </h3>
            <p className="text-slate-600 text-sm mb-4">
              {lang === 'th'
                ? 'การจองของคุณได้รับการยกเลิกแล้ว'
                : 'Your booking has been cancelled'}
            </p>

            {/* Refund Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-medium text-green-900 mb-2">
                {lang === 'th' ? 'ข้อมูลเงินคืน' : 'Refund Information'}
              </p>
              <div className="space-y-1 text-sm text-green-800">
                <p>
                  {lang === 'th' ? 'จำนวนเงินคืน: ' : 'Refund Amount: '}
                  <span className="font-bold">
                    ฿{cancellationResponse.booking.refundAmount.toFixed(2)}
                  </span>
                </p>
                <p>
                  {lang === 'th' ? 'สถานะ: ' : 'Status: '}
                  <span className="font-bold">
                    {cancellationResponse.booking.refundStatus}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={handleSuccess}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              {lang === 'th' ? 'ตกลง' : 'OK'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {lang === 'th' ? 'ยกเลิกการจอง' : 'Cancel Booking'}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {lang === 'th'
                  ? 'การยกเลิกนี้ไม่สามารถย้อนกลับได้'
                  : 'This action cannot be undone'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Message */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800">
          {lang === 'th'
            ? `คุณเหลือเวลา ${hoursUntilPickup} ชั่วโมงก่อนการรับ เงินของคุณจะถูกคืนภายใน 3-5 วันธุรกิจ`
            : `You have ${hoursUntilPickup} hours until pickup. Your refund will be processed within 3-5 business days.`}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4 mb-6">
          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {lang === 'th' ? 'เหตุผลในการยกเลิก' : 'Cancellation Reason'}
              <span className="text-red-600">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">
                {lang === 'th' ? 'เลือกเหตุผล' : 'Select a reason'}
              </option>
              <option value="CHANGE_OF_PLANS">
                {lang === 'th' ? 'เปลี่ยนแผน' : 'Change of plans'}
              </option>
              <option value="FOUND_ALTERNATIVE">
                {lang === 'th' ? 'พบทางเลือกอื่น' : 'Found alternative'}
              </option>
              <option value="SCHEDULE_CONFLICT">
                {lang === 'th' ? 'ขัดแย้งกับตารางเวลา' : 'Schedule conflict'}
              </option>
              <option value="TRAVEL_CANCELLED">
                {lang === 'th' ? 'การเดินทางยกเลิก' : 'Travel cancelled'}
              </option>
              <option value="OTHER">
                {lang === 'th' ? 'อื่นๆ' : 'Other'}
              </option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {lang === 'th' ? 'รายละเอียดเพิ่มเติม' : 'Additional Details'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              placeholder={
                lang === 'th'
                  ? 'บอกเราเพิ่มเติมเกี่ยวกับเหตุผลของคุณ (ไม่บังคับ)'
                  : 'Tell us more about your reason (optional)'
              }
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
          </button>
          <button
            onClick={handleCancel}
            disabled={loading || !reason}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {lang === 'th' ? 'กำลังยกเลิก...' : 'Cancelling...'}
              </>
            ) : (
              lang === 'th' ? 'ยกเลิกการจอง' : 'Confirm Cancellation'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
