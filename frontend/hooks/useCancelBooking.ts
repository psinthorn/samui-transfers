import { useState, useCallback } from 'react'

export interface CancellationRequest {
  reason: string
  description?: string
}

export interface CancellationResponse {
  success: boolean
  booking: {
    id: string
    status: string
    cancellationDate: Date
    refundAmount: number
    refundStatus: string
  }
}

/**
 * Hook for handling booking cancellation
 * Features:
 * - Validates cancellation eligibility (2+ hours before pickup)
 * - Processes refunds
 * - Sends notification emails
 * - Handles errors gracefully
 */
export function useCancelBooking(bookingId: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [cancellationResponse, setCancellationResponse] = useState<CancellationResponse | null>(null)

  const cancelBooking = useCallback(
    async (request: CancellationRequest) => {
      setLoading(true)
      setError(null)
      setSuccess(false)

      try {
        const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to cancel booking')
        }

        const data: CancellationResponse = await response.json()
        setCancellationResponse(data)
        setSuccess(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    },
    [bookingId]
  )

  const reset = useCallback(() => {
    setError(null)
    setSuccess(false)
    setCancellationResponse(null)
  }, [])

  return {
    cancelBooking,
    loading,
    error,
    success,
    cancellationResponse,
    reset,
  }
}
