'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, CheckCircle2, Loader2, ArrowRight, MapPin, Users, DollarSign } from 'lucide-react'
import { useSourceContext } from '@/context/SourceContext'
import { useDestinationContext } from '@/context/DestinationContext'
import { useLanguage } from '@/context/LanguageContext'
import InputItem from '@/components/Home/InputItem'
import VehicleSelector from './components/VehicleSelector'
import DateTimePicker from './components/DateTimePicker'
import PassengerForm from './components/PassengerForm'
import PriceDisplay from './components/PriceDisplay'
import RateCalculate from '@/components/utilities/RateCalculate'
import { CarListData } from '@/data/CarListData'

interface Vehicle {
  id: string
  name: string
  vehicleType: string
  capacity: number
  homePort: string
  status: string
  color?: string
  fuelType?: string
  registrationNumber?: string
}

interface ServiceRate {
  vehicleType: string
  basePrice: number
  distanceRate: number
  minDistance: number
}

export default function BookingPage() {
  // Location Context
  const { source } = useSourceContext()
  const { destination } = useDestinationContext()
  const { lang } = useLanguage()

  // Step 1: Location Selection
  const [pickupPoint, setPickupPoint] = useState<string>('')
  const [dropoffPoint, setDropoffPoint] = useState<string>('')
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [distance, setDistance] = useState<number | null>(null)

  // Step 2: Vehicle Selection
  const [selectedCarType, setSelectedCarType] = useState<string | null>(null)
  const [selectedCarModel, setSelectedCarModel] = useState<string | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehiclesLoading, setVehiclesLoading] = useState(true)
  const [vehiclesError, setVehiclesError] = useState<string | null>(null)

  // Step 3: Date & Time
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  // Step 4: Passengers & Contact
  const [passengers, setPassengers] = useState(1)
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')

  // Step 5: Pricing
  const [serviceRates, setServiceRates] = useState<ServiceRate[]>([])
  const [basePrice, setBasePrice] = useState<number | null>(null)
  const [distanceCharge, setDistanceCharge] = useState(0)
  const [totalPrice, setTotalPrice] = useState<number | null>(null)

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState<'location' | 'vehicle' | 'datetime' | 'passenger' | 'price' | 'confirm'>('location')

  // Sync context locations to form when they change
  useEffect(() => {
    if (source && destination) {
      const srcLabel = (source as any)?.label || (source as any)?.name || ''
      const dstLabel = (destination as any)?.label || (destination as any)?.name || ''
      
      setPickupPoint(srcLabel)
      setDropoffPoint(dstLabel)
      setPickupCoords({ lat: (source as any).lat, lng: (source as any).lng })
      setDropoffCoords({ lat: (destination as any).lat, lng: (destination as any).lng })
      
      setActiveStep('vehicle')
    }
  }, [source, destination])

  // Load pending booking data from sessionStorage (from home page vehicle selection)
  useEffect(() => {
    try {
      const pendingData = sessionStorage.getItem('pendingBookingData')
      if (pendingData) {
        const data = JSON.parse(pendingData)
        
        // Pre-fill location data
        if (data.pickupPoint) setPickupPoint(data.pickupPoint)
        if (data.dropoffPoint) setDropoffPoint(data.dropoffPoint)
        if (data.distance) setDistance(data.distance)
        
        // Pre-fill vehicle data
        if (data.carType) setSelectedCarType(data.carType)
        if (data.carModel) setSelectedCarModel(data.carModel)
        
        // Clear the session data after loading
        sessionStorage.removeItem('pendingBookingData')
      }
    } catch (error) {
      console.error('Error loading pending booking data:', error)
    }
  }, [])


  // Calculate distance when pickup/dropoff coords are available
  useEffect(() => {
    if (!pickupCoords || !dropoffCoords) {
      setDistance(null)
      return
    }

    const g = typeof window !== 'undefined' ? window.google : undefined
    if (!g?.maps) return

    const service = new g.maps.DistanceMatrixService()
    service.getDistanceMatrix(
      {
        origins: [new g.maps.LatLng(pickupCoords.lat, pickupCoords.lng)],
        destinations: [new g.maps.LatLng(dropoffCoords.lat, dropoffCoords.lng)],
        travelMode: g.maps.TravelMode.DRIVING,
      },
      (response: any, status: any) => {
        if (status === g.maps.DistanceMatrixStatus.OK && response?.rows[0]?.elements[0]) {
          const distanceInMeters = response.rows[0].elements[0].distance.value
          const distanceInKm = distanceInMeters / 1000
          setDistance(Math.round(distanceInKm * 100) / 100)
        }
      }
    )
  }, [pickupCoords, dropoffCoords])

  // Fetch service rates on mount
  useEffect(() => {
    const fetchServiceRates = async () => {
      try {
        const response = await fetch('/api/service-rates')
        const data = await response.json()
        if (response.ok) {
          setServiceRates(data.data)
        }
      } catch (err) {
        console.error('Failed to fetch service rates:', err)
      }
    }

    fetchServiceRates()
  }, [])

  // Calculate pricing when car type, passengers, or distance changes
  useEffect(() => {
    if (!selectedCarType || !distance) {
      setTotalPrice(null)
      return
    }

    const selectedCar = CarListData.find(car => car.type === selectedCarType)
    if (!selectedCar) return

    const calculatedRate = Math.round(RateCalculate({ distance }, selectedCar.rate) || 0)
    const perPersonTotal = calculatedRate * passengers

    setBasePrice(calculatedRate)
    setTotalPrice(perPersonTotal)
  }, [selectedCarType, passengers, distance])

  // Validate form steps
  const hasLocationData = pickupPoint && dropoffPoint && distance !== null
  const isStep1Valid = selectedCarType !== null
  const isStep2Valid = selectedDate !== null && selectedTime !== null
  const isStep3Valid = contactEmail.includes('@') && contactPhone.length >= 9 && passengers > 0
  const isStep4Valid = totalPrice !== null && totalPrice > 0

  const handleSubmitBooking = async () => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      // Combine date and time
      const [hours, minutes] = selectedTime!.split(':').map(Number)
      const departureDateTime = new Date(selectedDate!)
      departureDateTime.setHours(hours, minutes, 0, 0)

      const bookingData = {
        customerEmail: contactEmail,
        customerPhone: contactPhone,
        carType: selectedCarType,
        carModel: selectedCarModel,
        bookingDate: selectedDate!.toISOString().split('T')[0],
        departureDateTime: departureDateTime.toISOString(),
        numberOfPassengers: passengers,
        pickupLocation: pickupPoint,
        dropoffLocation: dropoffPoint,
        estimatedDistance: distance || 0,
        serviceType: 'transfer',
        basePrice: basePrice || 0,
        totalPrice: totalPrice || 0,
        specialRequests: specialRequests,
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }

      setSubmitSuccess(true)
      setBookingId(data.data?.id)
      setActiveStep('confirm')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  // If location is not selected, show location selector
  if (!hasLocationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-900">Book Your Transfer</p>
            <h2 className="text-4xl font-bold text-blue-900 mt-2">Select Your Route</h2>
          </div>

          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                Start Here
              </CardTitle>
              <CardDescription>
                Select your pickup and drop-off locations to get started
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  📍 Pickup Location
                </label>
                <InputItem type="source" mapsReady={true} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  📍 Drop-off Location
                </label>
                <InputItem type="destination" mapsReady={true} />
              </div>

              {source && destination && distance && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Distance:</span>
                      <span className="text-2xl font-bold text-blue-600">{distance} km</span>
                    </div>
                    <button
                      onClick={() => setActiveStep('vehicle')}
                      className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (submitSuccess && bookingId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-green-500 bg-green-50">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
              <CardTitle className="text-3xl text-green-800">Booking Confirmed!</CardTitle>
              <CardDescription className="text-lg text-green-700 mt-2">
                Your transfer has been successfully booked
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Booking Reference */}
              <div className="bg-white rounded-lg p-6 border-2 border-green-200">
                <p className="text-sm text-gray-600 mb-2">Booking Reference Number</p>
                <p className="text-3xl font-bold text-green-700 font-mono">
                  BK-{bookingId.substring(0, 8).toUpperCase()}
                </p>
              </div>

              {/* Booking Details */}
              <div className="bg-white rounded-lg p-6 space-y-4">
                <div className="border-b pb-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Booking Details</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="font-semibold">{selectedCarModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-semibold">{selectedDate?.toLocaleDateString()} {selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Passengers:</span>
                      <span className="font-semibold">{passengers}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Total Price</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalPrice?.toLocaleString()} THB
                  </p>
                </div>
              </div>

              {/* Contact Confirmation */}
              <div className="bg-blue-50 rounded-lg p-6">
                <p className="text-sm text-blue-800 mb-3">
                  ✓ A confirmation email has been sent to <strong>{contactEmail}</strong>
                </p>
                <p className="text-sm text-blue-700">
                  Keep your booking reference safe. You'll need it for check-in.
                </p>
              </div>

              {/* Next Steps */}
              <div className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                  View My Booking
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    // Reset form
                    setSubmitSuccess(false)
                    setBookingId(null)
                    setSelectedCarType(null)
                    setSelectedCarModel(null)
                    setSelectedDate(null)
                    setSelectedTime(null)
                    setPassengers(1)
                    setContactEmail('')
                    setContactPhone('')
                    setSpecialRequests('')
                    setActiveStep('vehicle')
                  }}
                >
                  Create Another Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Your Transfer</h1>
          <p className="text-lg text-gray-600">
            Choose a vehicle, select your dates, and confirm your booking in just a few steps
          </p>
        </div>

        {/* Step Tabs */}
        <Tabs value={activeStep} onValueChange={(value) => setActiveStep(value as any)} className="mb-8">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="vehicle">
              <span className="hidden sm:inline">1. Vehicle</span>
              <span className="sm:hidden">Vehicle</span>
            </TabsTrigger>
            <TabsTrigger value="datetime">
              <span className="hidden sm:inline">2. Date & Time</span>
              <span className="sm:hidden">Date</span>
            </TabsTrigger>
            <TabsTrigger value="passenger">
              <span className="hidden sm:inline">3. Passenger</span>
              <span className="sm:hidden">Passenger</span>
            </TabsTrigger>
            <TabsTrigger value="price">
              <span className="hidden sm:inline">4. Price</span>
              <span className="sm:hidden">Price</span>
            </TabsTrigger>
            <TabsTrigger value="confirm">
              <span className="hidden sm:inline">5. Confirm</span>
              <span className="sm:hidden">Confirm</span>
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Vehicle Selection */}
          <TabsContent value="vehicle" className="bg-white rounded-lg p-8 shadow-lg">
            {/* Journey Summary */}
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-4">Your Journey</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600">Pickup</p>
                    <p className="text-sm font-medium text-gray-900">{pickupPoint}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600">Drop-off</p>
                    <p className="text-sm font-medium text-gray-900">{dropoffPoint}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pt-2 border-t border-blue-200">
                  <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600">Distance</p>
                    <p className="text-sm font-medium text-gray-900">{distance?.toFixed(2)} km</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Selection */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Select Your Vehicle</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CarListData.map((car) => {
                  const fare = Math.round(RateCalculate({ distance: distance || 0 }, car.rate) || 0)
                  const formatter = new Intl.NumberFormat(lang === 'th' ? 'th-TH' : 'en-US', {
                    style: 'currency',
                    currency: 'THB',
                    maximumFractionDigits: 0,
                  })

                  const isSelected = selectedCarType === car.type

                  return (
                    <button
                      key={car.ID}
                      onClick={() => {
                        setSelectedCarType(car.type)
                        setSelectedCarModel(car.model)
                      }}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 shadow-md'
                          : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{car.model}</h4>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{car.seat} seats • {car.Luggage} luggage</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Distance:</span>
                          <span className="font-medium text-gray-900">{distance?.toFixed(2)} km</span>
                        </div>
                        <div className="flex items-end justify-between pt-2 border-t border-gray-200">
                          <span className="text-xs text-gray-600">Est. Fare:</span>
                          <span className="text-lg font-bold text-blue-600">{formatter.format(fare)}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {isStep1Valid && (
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={() => setActiveStep('datetime')}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Continue to Date & Time <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Step 2: Date & Time */}
          <TabsContent value="datetime" className="bg-white rounded-lg p-8 shadow-lg">
            <DateTimePicker
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
            />

            <div className="mt-8 flex justify-between">
              <Button
                onClick={() => setActiveStep('vehicle')}
                variant="outline"
                size="lg"
              >
                ← Back
              </Button>
            {isStep2Valid && (
                <Button
                  onClick={() => setActiveStep('passenger')}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue to Passenger Info <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Step 3: Passenger Form */}
          <TabsContent value="passenger" className="bg-white rounded-lg p-8 shadow-lg">
            <PassengerForm
              passengers={passengers}
              onPassengersChange={setPassengers}
              contactEmail={contactEmail}
              onEmailChange={setContactEmail}
              contactPhone={contactPhone}
              onPhoneChange={setContactPhone}
              additionalNotes={specialRequests}
              onNotesChange={setSpecialRequests}
              maxCapacity={99}
            />

            <div className="mt-8 flex justify-between">
              <Button
                onClick={() => setActiveStep('datetime')}
                variant="outline"
                size="lg"
              >
                ← Back
              </Button>
              {isStep3Valid && (
                <Button
                  onClick={() => setActiveStep('price')}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Review Price <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Step 4: Price Display */}
          <TabsContent value="price" className="bg-white rounded-lg p-8 shadow-lg">
            <PriceDisplay
              carType={selectedCarType}
              carModel={selectedCarModel}
              serviceType="transfer"
              passengers={passengers}
              distance={distance}
              basePrice={basePrice}
              totalPrice={totalPrice}
              error={submitError}
            />

            <div className="mt-8 flex justify-between">
              <Button
                onClick={() => setActiveStep('passenger')}
                variant="outline"
                size="lg"
              >
                ← Back
              </Button>
              {isStep4Valid && (
                <Button
                  onClick={() => setActiveStep('confirm')}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Confirm Booking <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Step 5: Confirmation */}
          <TabsContent value="confirm" className="bg-white rounded-lg p-8 shadow-lg">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Booking</CardTitle>
                <CardDescription>Please verify all details before confirming</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Route */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Route</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Pickup:</span> <span className="font-medium">{pickupPoint}</span></div>
                    <div><span className="text-gray-600">Drop-off:</span> <span className="font-medium">{dropoffPoint}</span></div>
                    <div><span className="text-gray-600">Distance:</span> <span className="font-medium">{distance} km</span></div>
                  </div>
                </div>

                {/* Vehicle */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Vehicle</h3>
                  <p className="text-gray-700">{selectedCarModel}</p>
                </div>

                {/* Date & Time */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Departure</h3>
                  <p className="text-gray-700">
                    {selectedDate?.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} at {selectedTime}
                  </p>
                </div>

                {/* Passengers */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Passengers</h3>
                  <p className="text-gray-700">{passengers} person{passengers !== 1 ? 's' : ''}</p>
                </div>

                {/* Contact Info */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                  <p className="text-gray-700">Email: {contactEmail}</p>
                  <p className="text-gray-700">Phone: {contactPhone}</p>
                </div>

                {specialRequests && (
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Special Requests</h3>
                    <p className="text-gray-700">{specialRequests}</p>
                  </div>
                )}

                {/* Price */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Total Price</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {totalPrice?.toLocaleString()} THB
                  </p>
                </div>

                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-700">{submitError}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-8 flex justify-between">
              <Button
                onClick={() => setActiveStep('price')}
                variant="outline"
                size="lg"
              >
                ← Back
              </Button>
              <Button
                onClick={handleSubmitBooking}
                disabled={isSubmitting}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Booking...
                  </>
                ) : (
                  'Confirm & Create Booking'
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

