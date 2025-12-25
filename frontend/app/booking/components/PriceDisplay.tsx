'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, TrendingDown } from 'lucide-react'

interface Vehicle {
  id: string
  name: string
  capacity: number
}

interface PriceDisplayProps {
  vehicle?: Vehicle | null
  carType?: string | null
  carModel?: string | null
  serviceType: 'transfer' | 'tour' | 'event'
  passengers: number
  distance?: number
  basePrice: number | null
  distanceCharge?: number
  totalPrice: number | null
  isLoading?: boolean
  error?: string | null
}

export default function PriceDisplay({
  vehicle,
  carType,
  carModel,
  serviceType,
  passengers,
  distance,
  basePrice,
  distanceCharge = 0,
  totalPrice,
  isLoading = false,
  error = null,
}: PriceDisplayProps) {
  if (!vehicle && !carModel) {
    return (
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-500">Select a vehicle to see pricing</p>
        </CardContent>
      </Card>
    )
  }

  const pricePerPerson = totalPrice ? Math.round(totalPrice / passengers) : 0
  const displayVehicleName = carModel || vehicle?.name || 'Unknown Vehicle'

  const getServiceTypeLabel = () => {
    switch (serviceType) {
      case 'transfer':
        return 'Vehicle Transfer'
      case 'tour':
        return 'Tour Package'
      case 'event':
        return 'Special Event'
      default:
        return 'Service'
    }
  }

  return (
    <div className="w-full space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Price Summary</h2>
        <p className="text-gray-600">Cost breakdown for your booking</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {displayVehicleName}
          </CardTitle>
          <CardDescription>
            {getServiceTypeLabel()} • {passengers} passenger{passengers !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading && (
            <div className="text-center py-6">
              <div className="inline-block">
                <div className="animate-spin">⏳</div>
              </div>
              <p className="text-gray-600 mt-2">Calculating price...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {!isLoading && !error && basePrice !== null && (
            <div className="space-y-4">
              {/* Price Breakdown */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Base Price:</span>
                  <span className="font-medium">{basePrice.toLocaleString()} THB</span>
                </div>

                {serviceType === 'transfer' && distance && distanceCharge > 0 && (
                  <>
                    <div className="border-t pt-3 flex items-center justify-between">
                      <span className="text-gray-700">Distance Charge:</span>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{distance} km</div>
                        <div className="font-medium text-red-600">+ {distanceCharge.toLocaleString()} THB</div>
                      </div>
                    </div>
                  </>
                )}

                {serviceType === 'tour' && passengers > 1 && (
                  <div className="border-t pt-3 flex items-center justify-between">
                    <span className="text-gray-700">Group Discount:</span>
                    <span className="font-medium text-green-600">
                      {pricePerPerson < basePrice ? '✓ Applied' : 'None'}
                    </span>
                  </div>
                )}

                <div className="border-t pt-3 flex items-center justify-between text-lg">
                  <span className="font-semibold">Total Price:</span>
                  <span className="font-bold text-blue-600 text-2xl">
                    {totalPrice?.toLocaleString()} THB
                  </span>
                </div>
              </div>

              {/* Per Person Breakdown */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Price per person</p>
                    <p className="text-xs text-blue-600">÷ {passengers} passenger{passengers !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-700">
                      {pricePerPerson.toLocaleString()} THB
                    </p>
                    <p className="text-xs text-blue-600">per person</p>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                <p className="text-sm font-semibold text-gray-700">Service Details:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {vehicle && (
                    <>
                      <li>✓ Vehicle: <strong>{vehicle.name}</strong></li>
                      <li>✓ Capacity: <strong>{vehicle.capacity} passengers</strong></li>
                    </>
                  )}
                  {carModel && (
                    <li>✓ Vehicle: <strong>{carModel}</strong></li>
                  )}
                  <li>✓ Type: <strong>{getServiceTypeLabel()}</strong></li>
                  {distance && (
                    <li>✓ Distance: <strong>{distance} km</strong></li>
                  )}
                </ul>
              </div>

              {/* Value Indicator */}
              {pricePerPerson < 1500 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2">
                  <TrendingDown className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Great value!</p>
                    <p className="text-xs text-green-700">
                      {pricePerPerson < 800 ? 'Excellent price for this service' : 'Competitive pricing'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Currency Note */}
      <p className="text-xs text-gray-500 text-center">
        All prices are in Thai Baht (THB) • No hidden charges
      </p>
    </div>
  )
}
