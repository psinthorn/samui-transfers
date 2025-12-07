'use client'

import React, { useState, useCallback } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { BookingHistoryFilters } from '@/hooks/useBookingHistory'

interface BookingFiltersProps {
  onFiltersChange: (filters: BookingHistoryFilters) => void
  loading?: boolean
  lang?: string
}

export const BookingFilters: React.FC<BookingFiltersProps> = ({
  onFiltersChange,
  loading = false,
  lang = 'en',
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Apply filters with debounce
  const applyFilters = useCallback(() => {
    const filters: BookingHistoryFilters = {}
    if (searchTerm) filters.search = searchTerm
    if (statusFilter) filters.status = statusFilter
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate
    onFiltersChange(filters)
  }, [searchTerm, statusFilter, startDate, endDate, onFiltersChange])

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  // Handle search submission
  const handleSearchSubmit = () => {
    applyFilters()
  }

  // Handle filter changes
  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
  }

  // Handle date changes
  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value)
    } else {
      setEndDate(value)
    }
  }

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setStartDate('')
    setEndDate('')
    onFiltersChange({})
  }

  const statuses = [
    { value: 'PENDING', label: lang === 'th' ? 'รอการยืนยัน' : 'Pending' },
    { value: 'CONFIRMED', label: lang === 'th' ? 'ยืนยันแล้ว' : 'Confirmed' },
    { value: 'COMPLETED', label: lang === 'th' ? 'เสร็จสิ้น' : 'Completed' },
    { value: 'CANCELLED', label: lang === 'th' ? 'ยกเลิก' : 'Cancelled' },
  ]

  const hasActiveFilters = searchTerm || statusFilter || startDate || endDate

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 space-y-4">
      {/* Search Bar */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {lang === 'th' ? 'ค้นหา' : 'Search'}
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={
                lang === 'th'
                  ? 'ค้นหาหมายเลขอ้างอิงหรือสถานที่...'
                  : 'Search by reference or location...'
              }
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
              disabled={loading}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSearchSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
          >
            {lang === 'th' ? 'ค้นหา' : 'Search'}
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {lang === 'th' ? 'สถานะ' : 'Status'}
        </label>
        <select
          value={statusFilter}
          onChange={(e) => {
            handleStatusChange(e.target.value)
            applyFilters()
          }}
          disabled={loading}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{lang === 'th' ? 'ทั้งหมด' : 'All Statuses'}</option>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        <Filter className="w-4 h-4" />
        {showAdvanced
          ? lang === 'th'
            ? 'ซ่อนตัวเลือกเพิ่มเติม'
            : 'Hide Advanced'
          : lang === 'th'
          ? 'แสดงตัวเลือกเพิ่มเติม'
          : 'Show Advanced'}
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {lang === 'th' ? 'จากวันที่' : 'From Date'}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  handleDateChange('start', e.target.value)
                  applyFilters()
                }}
                disabled={loading}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {lang === 'th' ? 'ถึงวันที่' : 'To Date'}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  handleDateChange('end', e.target.value)
                  applyFilters()
                }}
                disabled={loading}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display & Clear */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <div className="flex gap-2 flex-wrap">
            {searchTerm && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {lang === 'th' ? 'ค้นหา: ' : 'Search: '}
                {searchTerm}
              </span>
            )}
            {statusFilter && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {statusFilter}
              </span>
            )}
            {(startDate || endDate) && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {startDate && `${startDate.slice(5)}`}
                {startDate && endDate && ' - '}
                {endDate && `${endDate.slice(5)}`}
              </span>
            )}
          </div>
          <button
            onClick={clearFilters}
            disabled={loading}
            className="text-slate-600 hover:text-slate-900 disabled:text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
