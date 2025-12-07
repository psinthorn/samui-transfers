import { useState, useCallback, useEffect } from 'react'

export interface BookingHistoryFilters {
  status?: string
  startDate?: string
  endDate?: string
  search?: string
}

export interface BookingHistoryResponse {
  bookings: any[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/**
 * Hook for fetching and managing user booking history
 * Features:
 * - Fetches bookings with pagination
 * - Filters by status, date range, search
 * - Automatic loading state management
 * - Error handling
 */
export function useBookingHistory() {
  const [bookings, setBookings] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<BookingHistoryFilters>({})

  // Fetch bookings
  const fetchBookings = useCallback(async (pageNum: number, filters: BookingHistoryFilters) => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        pageSize: pageSize.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.search && { search: filters.search }),
      })

      const response = await fetch(
        `/api/user/bookings?${queryParams.toString()}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const data: BookingHistoryResponse = await response.json()
      setBookings(data.bookings)
      setTotal(data.total)
      setPage(data.page)
      setHasMore(data.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  // Apply filters
  const applyFilters = useCallback((newFilters: BookingHistoryFilters) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }, [])

  // Go to next page
  const nextPage = useCallback(() => {
    if (hasMore) {
      const nextPageNum = page + 1
      setPage(nextPageNum)
      fetchBookings(nextPageNum, filters)
    }
  }, [page, hasMore, filters, fetchBookings])

  // Go to previous page
  const prevPage = useCallback(() => {
    if (page > 1) {
      const prevPageNum = page - 1
      setPage(prevPageNum)
      fetchBookings(prevPageNum, filters)
    }
  }, [page, filters, fetchBookings])

  // Go to specific page
  const goToPage = useCallback((pageNum: number) => {
    if (pageNum >= 1 && pageNum <= Math.ceil(total / pageSize)) {
      setPage(pageNum)
      fetchBookings(pageNum, filters)
    }
  }, [total, pageSize, filters, fetchBookings])

  // Refresh bookings
  const refresh = useCallback(() => {
    fetchBookings(page, filters)
  }, [page, filters, fetchBookings])

  // Fetch on filters or page change
  useEffect(() => {
    fetchBookings(page, filters)
  }, [page, filters])

  return {
    bookings,
    total,
    page,
    pageSize,
    hasMore,
    loading,
    error,
    filters,
    applyFilters,
    nextPage,
    prevPage,
    goToPage,
    refresh,
    setPageSize,
  }
}
