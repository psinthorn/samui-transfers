'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock } from 'lucide-react'

interface DateTimePickerProps {
  selectedDate: Date | null
  selectedTime: string | null
  onDateChange: (date: Date) => void
  onTimeChange: (time: string) => void
  minDate?: Date
  timeSlots?: string[]
}

// Generate time slots at 30-minute intervals from 6 AM to 10 PM
const DEFAULT_TIME_SLOTS = Array.from({ length: 32 }, (_, i) => {
  const hours = Math.floor(6 + i * 0.5)
  const minutes = (i % 2) * 30
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}).filter(time => {
  const [h, m] = time.split(':').map(Number)
  return h < 22 // Until 10 PM (22:00)
})

export default function DateTimePicker({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  minDate = new Date(),
  timeSlots = DEFAULT_TIME_SLOTS,
}: DateTimePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [viewMonth, setViewMonth] = useState(minDate)

  // Get number of days in a month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  // Check if date is today or in the future
  const isValidDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today
  }

  // Check if date is before min date
  const isBeforeMinDate = (date: Date) => {
    const minDateOnly = new Date(minDate)
    minDateOnly.setHours(0, 0, 0, 0)
    return date < minDateOnly
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day)
    if (isValidDate(newDate)) {
      onDateChange(newDate)
      setShowCalendar(false)
    }
  }

  const handlePrevMonth = () => {
    setViewMonth(
      new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1)
    )
  }

  const handleNextMonth = () => {
    setViewMonth(
      new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)
    )
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewMonth)
    const firstDay = getFirstDayOfMonth(viewMonth)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-10"></div>
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day)
      const isSelected = selectedDate &&
        selectedDate.toDateString() === date.toDateString()
      const isDisabled = isBeforeMinDate(date)

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          disabled={isDisabled}
          className={`h-10 rounded text-sm font-medium transition-colors ${
            isSelected
              ? 'bg-blue-500 text-white'
              : isDisabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'hover:bg-gray-200'
          }`}
        >
          {day}
        </button>
      )
    }

    return days
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">When do you need the vehicle?</h2>
        <p className="text-gray-600">Select your departure date and time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Picker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Departure Date
            </CardTitle>
            <CardDescription>
              {selectedDate ? selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Select a date'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!showCalendar ? (
              <Button
                onClick={() => setShowCalendar(true)}
                variant="outline"
                className="w-full text-left justify-start"
              >
                {selectedDate
                  ? selectedDate.toLocaleDateString()
                  : 'Click to select date'}
              </Button>
            ) : (
              <div className="space-y-4">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={handlePrevMonth}
                    className="px-3 py-1 hover:bg-gray-200 rounded"
                  >
                    ←
                  </button>
                  <span className="font-semibold">
                    {monthNames[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="px-3 py-1 hover:bg-gray-200 rounded"
                  >
                    →
                  </button>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="h-10 flex items-center justify-center font-semibold text-sm text-gray-600">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {renderCalendar()}
                </div>

                <Button
                  onClick={() => setShowCalendar(false)}
                  variant="outline"
                  className="w-full"
                >
                  Confirm Date
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time Picker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Departure Time
            </CardTitle>
            <CardDescription>
              {selectedTime ? `${selectedTime}` : 'Select a time'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map(time => (
                <Button
                  key={time}
                  onClick={() => onTimeChange(time)}
                  variant={selectedTime === time ? 'default' : 'outline'}
                  className="text-sm"
                  size="sm"
                >
                  {time}
                </Button>
              ))}
            </div>

            {selectedTime && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  ✓ Departure: <strong>{selectedDate?.toLocaleDateString()} at {selectedTime}</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
