'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Mail, Phone, FileText } from 'lucide-react'

interface PassengerFormProps {
  passengers: number
  onPassengersChange: (count: number) => void
  contactEmail: string
  onEmailChange: (email: string) => void
  contactPhone: string
  onPhoneChange: (phone: string) => void
  additionalNotes?: string
  onNotesChange?: (notes: string) => void
  maxCapacity?: number
}

export default function PassengerForm({
  passengers,
  onPassengersChange,
  contactEmail,
  onEmailChange,
  contactPhone,
  onPhoneChange,
  additionalNotes = '',
  onNotesChange,
  maxCapacity = 99,
}: PassengerFormProps) {
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValidPhone = (phone: string) => {
    // Accept Thai phone numbers with + prefix or local format
    const phoneRegex = /^(\+66|0)[1-9]\d{8}$/
    return phoneRegex.test(phone.replace(/[\s\-]/g, ''))
  }

  const passengerOptions = Array.from({ length: maxCapacity }, (_, i) => i + 1)

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Passenger & Contact Information</h2>
        <p className="text-gray-600">Tell us about your group and how to contact you</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Passenger Count */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Number of Passengers
            </CardTitle>
            <CardDescription>How many people in your group?</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-blue-600">{passengers}</span>
                <span className="text-sm text-gray-600">person{passengers !== 1 ? 's' : ''}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {passengerOptions.map(num => (
                  <Button
                    key={num}
                    onClick={() => onPassengersChange(num)}
                    variant={passengers === num ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                  >
                    {num}
                  </Button>
                ))}
              </div>

              {/* Quick select buttons for common groups */}
              <div className="pt-4 border-t">
                <p className="text-xs font-semibold text-gray-600 mb-2">Quick Select:</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onPassengersChange(1)}
                    variant="ghost"
                    size="sm"
                    className="text-xs flex-1"
                  >
                    Solo
                  </Button>
                  <Button
                    onClick={() => onPassengersChange(2)}
                    variant="ghost"
                    size="sm"
                    className="text-xs flex-1"
                  >
                    Couple
                  </Button>
                  <Button
                    onClick={() => onPassengersChange(4)}
                    variant="ghost"
                    size="sm"
                    className="text-xs flex-1"
                  >
                    Family
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Address
            </CardTitle>
            <CardDescription>We'll send confirmation here</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="your@email.com"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  contactEmail && !isValidEmail(contactEmail)
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />

              {contactEmail && !isValidEmail(contactEmail) && (
                <p className="text-sm text-red-600">Please enter a valid email address</p>
              )}

              {contactEmail && isValidEmail(contactEmail) && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  ✓ Valid email
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Phone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Phone Number
            </CardTitle>
            <CardDescription>For booking coordination</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => onPhoneChange(e.target.value)}
                placeholder="+66 812345678 or 0812345678"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  contactPhone && !isValidPhone(contactPhone)
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />

              {contactPhone && !isValidPhone(contactPhone) && (
                <p className="text-sm text-red-600">
                  Use Thai format: +66812345678 or 0812345678
                </p>
              )}

              {contactPhone && isValidPhone(contactPhone) && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  ✓ Valid phone
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Special Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Special Requests (Optional)
          </CardTitle>
          <CardDescription>Any special requirements or preferences?</CardDescription>
        </CardHeader>

        <CardContent>
          <textarea
            value={additionalNotes}
            onChange={(e) => onNotesChange?.(e.target.value)}
            placeholder="E.g., Child seat needed, early morning pickup, specific route preferences..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
          />
          <p className="text-xs text-gray-500 mt-2">
            {additionalNotes.length}/500 characters
          </p>
        </CardContent>
      </Card>

      {/* Summary */}
      {contactEmail && isValidEmail(contactEmail) && contactPhone && isValidPhone(contactPhone) && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm">
              <p className="text-green-800">
                <strong>✓ Booking Summary:</strong>
              </p>
              <ul className="list-disc list-inside text-green-700 space-y-1">
                <li><strong>{passengers}</strong> passenger{passengers !== 1 ? 's' : ''}</li>
                <li>Contact: <strong>{contactEmail}</strong></li>
                <li>Phone: <strong>{contactPhone}</strong></li>
                {additionalNotes && <li>Special requests noted</li>}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
