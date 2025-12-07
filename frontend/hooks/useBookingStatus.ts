import { useState, useEffect, useCallback, useRef } from 'react'

export interface BookingStatusResponse {
  id: string
  status: string
  paymentStatus: string
  currentStep: number
  steps: Array<{
    step: number
    title: string
    description?: string
    completed: boolean
    timestamp?: Date
  }>
  estimatedCompletionTime?: Date
  lastUpdate: Date
}

/**
 * Hook for real-time booking status tracking
 * Features:
 * - Polls for booking status updates every 10 seconds
 * - Automatic retry on failure
 * - Stop polling when booking is completed/cancelled
 * - Manual refresh capability
 */
export function useBookingStatus(bookingId: string) {
  const [status, setStatus] = useState<BookingStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch status
  const fetchStatus = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch(`/api/bookings/${bookingId}/status`)

      if (!response.ok) {
        throw new Error('Failed to fetch booking status')
      }

      const data: BookingStatusResponse = await response.json()
      setStatus(data)
      setLoading(false)

      // Stop polling if booking is completed or cancelled
      if (data.status === 'COMPLETED' || data.status === 'CANCELLED') {
        setIsPolling(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }, [bookingId])

  // Start polling
  useEffect(() => {
    // Fetch immediately
    fetchStatus()

    // Set up polling interval
    if (isPolling) {
      intervalRef.current = setInterval(fetchStatus, 10000) // Poll every 10 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [bookingId, isPolling, fetchStatus])

  // Manual refresh
  const refresh = useCallback(async () => {
    await fetchStatus()
  }, [fetchStatus])

  // Stop polling
  const stopPolling = useCallback(() => {
    setIsPolling(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [])

  // Resume polling
  const resumePolling = useCallback(() => {
    setIsPolling(true)
  }, [])

  return {
    status,
    loading,
    error,
    isPolling,
    refresh,
    stopPolling,
    resumePolling,
  }
}
