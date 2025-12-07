'use client'

import React from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import { getStatusColor, getStatusLabel } from '@/lib/booking'

interface StatusBadgeProps {
  status: string
  paymentStatus?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  lang?: string
  className?: string
}

const getStatusIcon = (status: string, size: string) => {
  const sizeClass =
    size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4'

  switch (status) {
    case 'CONFIRMED':
      return <CheckCircle2 className={`${sizeClass} text-green-600`} />
    case 'COMPLETED':
      return <CheckCircle2 className={`${sizeClass} text-green-600`} />
    case 'CANCELLED':
      return <XCircle className={`${sizeClass} text-red-600`} />
    case 'PENDING':
      return <Clock className={`${sizeClass} text-yellow-600`} />
    default:
      return <AlertCircle className={`${sizeClass} text-slate-600`} />
  }
}

const getSizeClass = (size: string) => {
  switch (size) {
    case 'lg':
      return 'px-4 py-2 text-base'
    case 'md':
      return 'px-3 py-1.5 text-sm'
    case 'sm':
      return 'px-2 py-1 text-xs'
    default:
      return 'px-3 py-1.5 text-sm'
  }
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  paymentStatus,
  size = 'md',
  showIcon = true,
  lang = 'en',
  className = '',
}) => {
  const baseClass = `inline-flex items-center gap-2 rounded-full font-semibold whitespace-nowrap ${getSizeClass(
    size
  )} ${getStatusColor(status)} ${className}`

  return (
    <div>
      <span className={baseClass}>
        {showIcon && getStatusIcon(status, size)}
        {getStatusLabel(status, lang)}
      </span>

      {/* Payment Status Badge */}
      {paymentStatus && (
        <div className="mt-2 text-xs">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium ${
              paymentStatus === 'COMPLETED'
                ? 'bg-green-100 text-green-800'
                : paymentStatus === 'FAILED'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {paymentStatus === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
            {paymentStatus === 'PENDING' && <RefreshCw className="w-3 h-3" />}
            {paymentStatus === 'FAILED' && <XCircle className="w-3 h-3" />}
            <span>
              {lang === 'th' ? 'ชำระ: ' : 'Payment: '}
              {paymentStatus}
            </span>
          </span>
        </div>
      )}
    </div>
  )
}
