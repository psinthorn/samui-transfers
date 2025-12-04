"use client"

import React, { useState } from "react"
import Link from "next/link"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import PaymentGateway from "@/components/payments/PaymentGateway"

export default function BookingCheckoutPage() {
  const [showPayment, setShowPayment] = useState(false)
  const [bookingData] = useState({
    id: "BK-" + Date.now().toString().slice(-6),
    pickupLocation: "Koh Samui Airport",
    dropoffLocation: "Chaweng Town",
    date: new Date().toISOString().split("T")[0],
    time: "14:30",
    passengers: 2,
    amount: 1600,
    currency: "THB",
  })

  const [formData, setFormData] = useState({
    email: "passenger@example.com",
    fullName: "John Doe",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePaymentSuccess = () => {
    console.log("✓ Payment successful!")
  }

  const handlePaymentError = (error: any) => {
    console.error("✗ Payment error:", error)
  }

  const isFormValid = formData.email && formData.fullName

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/booking" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Bookings
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">Review details and proceed to secure payment</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Reference Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
              <h2 className="text-sm font-semibold text-gray-600 mb-2">BOOKING REFERENCE</h2>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 font-mono text-2xl font-bold text-blue-600 text-center">
                {bookingData.id}
              </div>
            </div>

            {/* Trip Summary Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Summary</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">FROM</p>
                    <p className="text-lg font-semibold text-gray-900">{bookingData.pickupLocation}</p>
                  </div>
                  <div className="text-gray-400 mt-6">→</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">TO</p>
                    <p className="text-lg font-semibold text-gray-900">{bookingData.dropoffLocation}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">DATE</p>
                    <p className="font-semibold text-gray-900">{bookingData.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">TIME</p>
                    <p className="font-semibold text-gray-900">{bookingData.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">PASSENGERS</p>
                    <p className="font-semibold text-gray-900">{bookingData.passengers}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">SERVICE</p>
                    <p className="font-semibold text-gray-900">Standard</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    ℹ️ Confirmation and receipt will be sent to this email address
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            {showPayment && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Method</h2>
                <PaymentGateway
                  bookingId={bookingData.id}
                  amount={bookingData.amount}
                  currency={bookingData.currency}
                  email={formData.email}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </div>
            )}
          </div>

          {/* Sidebar - Summary & CTA */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              {/* Price Summary */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">Price Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ride Fare</span>
                    <span className="font-semibold text-gray-900">800 THB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">× {bookingData.passengers} Passengers</span>
                    <span className="font-semibold text-gray-900">×2</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="font-semibold text-gray-900">0 THB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (7%)</span>
                    <span className="font-semibold text-gray-900">112 THB</span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total Amount</span>
                      <div className="text-right">
                        <div className="text-xs text-gray-600 mb-1">THB</div>
                        <div className="text-3xl font-bold text-blue-600">
                          {bookingData.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {!showPayment ? (
                <Button
                  onClick={() => setShowPayment(true)}
                  disabled={!isFormValid}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-300 text-white py-3 rounded-lg font-semibold transition shadow-md"
                >
                  {!isFormValid ? "Fill contact info" : "Proceed to Payment"}
                </Button>
              ) : (
                <Button
                  onClick={() => setShowPayment(false)}
                  variant="outline"
                  className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 mb-3"
                >
                  ← Edit Booking
                </Button>
              )}

              {/* Security Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center mb-3">SECURE PAYMENT</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    <span>🔒</span>
                    <span>SSL</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    <span>✓</span>
                    <span>PCI</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    <span>🛡️</span>
                    <span>Secure</span>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 mb-2">Need help?</p>
                <p className="text-sm font-semibold text-blue-900">+66 99 108 7999</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
