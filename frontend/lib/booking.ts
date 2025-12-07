import { db } from '@/lib/db'

/**
 * Generates a unique booking reference number
 * Format: BK-YYYY-XXXXXX (e.g., BK-2025-000142)
 */
export async function generateBookingReference(): Promise<string> {
  const year = new Date().getFullYear()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Count bookings created today
  const todayBookings = await db.booking.count({
    where: {
      createdAt: {
        gte: today,
      },
    },
  })

  // Generate number with padding (6 digits)
  const sequenceNumber = todayBookings + 1
  const paddedNumber = String(sequenceNumber).padStart(6, '0')

  return `BK-${year}-${paddedNumber}`
}

/**
 * Format booking reference for display
 */
export function formatBookingReference(reference: string): string {
  return reference || 'N/A'
}

/**
 * Get booking time remaining until pickup (in hours)
 */
export function getTimeUntilPickup(pickupTime: string | Date): number {
  const pickup = new Date(pickupTime)
  const now = new Date()
  return Math.ceil((pickup.getTime() - now.getTime()) / (1000 * 60 * 60))
}

/**
 * Check if booking can be cancelled (must have 2+ hours before pickup)
 */
export function canCancelBooking(pickupTime: string | Date): boolean {
  const hoursRemaining = getTimeUntilPickup(pickupTime)
  return hoursRemaining >= 2
}

/**
 * Format booking details for display
 */
export interface BookingDetailsDisplay {
  pickupLocation: string
  dropoffLocation: string
  pickupTime: string
  dropoffTime?: string
  passengerCount: number
  vehicleType: string
  notes?: string
}

export function formatBookingDetails(details: any): BookingDetailsDisplay {
  return {
    pickupLocation: details?.pickupLocation || 'N/A',
    dropoffLocation: details?.dropoffLocation || 'N/A',
    pickupTime: details?.pickupTime
      ? new Date(details.pickupTime).toLocaleString()
      : 'N/A',
    dropoffTime: details?.dropoffTime
      ? new Date(details.dropoffTime).toLocaleString()
      : undefined,
    passengerCount: details?.passengerCount || 0,
    vehicleType: details?.vehicleType || 'N/A',
    notes: details?.notes,
  }
}

/**
 * Get booking status badge color
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Get booking status display label
 */
export function getStatusLabel(status: string, lang: string = 'en'): string {
  const labels: Record<string, Record<string, string>> = {
    CONFIRMED: { en: 'Confirmed', th: 'ยืนยันแล้ว' },
    PENDING: { en: 'Pending', th: 'รอการยืนยัน' },
    COMPLETED: { en: 'Completed', th: 'เสร็จสิ้น' },
    CANCELLED: { en: 'Cancelled', th: 'ยกเลิก' },
  }

  return labels[status]?.[lang] || status
}
