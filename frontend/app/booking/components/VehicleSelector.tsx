'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Fuel, Calendar } from 'lucide-react'

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

interface VehicleSelectorProps {
  vehicles: Vehicle[]
  selectedVehicleId: string | null
  onSelect: (vehicleId: string) => void
  isLoading?: boolean
}

const VEHICLE_TYPE_ICONS: Record<string, string> = {
  minibus: '🚌',
  suv: '🚙',
  sedan: '🚗',
  pickup: '🛻',
  van: '🚐',
  bus: '🚌',
  truck: '🚚',
}

const VEHICLE_TYPE_COLORS: Record<string, string> = {
  minibus: 'bg-blue-100 text-blue-800',
  suv: 'bg-green-100 text-green-800',
  sedan: 'bg-purple-100 text-purple-800',
  pickup: 'bg-orange-100 text-orange-800',
  van: 'bg-yellow-100 text-yellow-800',
  bus: 'bg-indigo-100 text-indigo-800',
  truck: 'bg-red-100 text-red-800',
}

export default function VehicleSelector({
  vehicles,
  selectedVehicleId,
  onSelect,
  isLoading = false,
}: VehicleSelectorProps) {
  const vehicleTypes = Array.from(new Set(vehicles.map(v => v.vehicleType)))
  const allVehicles = [
    ...vehicleTypes,
  ]

  const getFilteredVehicles = (type: string | null) => {
    if (!type || type === 'all') return vehicles
    return vehicles.filter(v => v.vehicleType === type)
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      AVAILABLE: 'bg-green-100 text-green-800',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800',
      OUT_OF_SERVICE: 'bg-red-100 text-red-800',
      RETIRED: 'bg-gray-100 text-gray-800',
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  const [selectedTab, setSelectedTab] = React.useState('all')

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Select Your Vehicle</h2>
        <p className="text-gray-600">Choose from our fleet of comfortable vehicles</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 gap-2 mb-6">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All Vehicles
          </TabsTrigger>
          {vehicleTypes.map(type => (
            <TabsTrigger key={type} value={type} className="text-xs sm:text-sm">
              {VEHICLE_TYPE_ICONS[type] || '🚗'} {type.charAt(0).toUpperCase() + type.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {['all', ...vehicleTypes].map(type => (
          <TabsContent key={type} value={type || 'all'}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredVehicles(type === 'all' ? null : type).map(vehicle => (
                <Card
                  key={vehicle.id}
                  onClick={() => onSelect(vehicle.id)}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedVehicleId === vehicle.id
                      ? 'ring-2 ring-blue-500 shadow-lg'
                      : 'hover:shadow-md'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelect(vehicle.id)
                    }
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {VEHICLE_TYPE_ICONS[vehicle.vehicleType] || '🚗'} {vehicle.name}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {vehicle.registrationNumber}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusBadge(vehicle.status)}>
                        {vehicle.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      {/* Capacity */}
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          <strong>{vehicle.capacity}</strong> passenger{vehicle.capacity !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Type & Color */}
                      <div className="flex items-center gap-2">
                        <Badge className={VEHICLE_TYPE_COLORS[vehicle.vehicleType]}>
                          {vehicle.vehicleType.toUpperCase()}
                        </Badge>
                        {vehicle.color && (
                          <span className="text-xs text-gray-600">• {vehicle.color}</span>
                        )}
                      </div>

                      {/* Fuel & Base */}
                      <div className="flex items-center justify-between text-sm">
                        {vehicle.fuelType && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Fuel className="w-4 h-4" />
                            <span>{vehicle.fuelType}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Home: {vehicle.homePort}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {getFilteredVehicles(type === 'all' ? null : type).length === 0 && (
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-500">No vehicles available in this category</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {selectedVehicleId && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ <strong>{vehicles.find(v => v.id === selectedVehicleId)?.name}</strong> selected
          </p>
        </div>
      )}
    </div>
  )
}
