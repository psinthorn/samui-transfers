'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Plus, Edit2, Trash2, Loader2, Check, X } from 'lucide-react'

interface Vehicle {
  id: string
  name: string
  vehicleType: string
  capacity: number
  homePort: string
  registrationNumber?: string
  color?: string
  yearOfManufacture?: number
  status: string
  isActive: boolean
  currentLocation?: string
  fuelType?: string
  fuelCapacity?: number
  mileage?: number
  lastMaintenanceDate?: string
  nextMaintenanceDate?: string
  createdAt: string
  updatedAt: string
}

interface VehicleFormData {
  name: string
  vehicleType: string
  capacity: string
  homePort: string
  registrationNumber: string
  color: string
  yearOfManufacture: string
  status: string
  fuelType: string
  fuelCapacity: string
}

const VEHICLE_TYPES = ['minibus', 'suv', 'sedan', 'pickup', 'van', 'bus', 'truck', 'other']
const STATUSES = ['AVAILABLE', 'MAINTENANCE', 'RETIRED', 'OUT_OF_SERVICE']
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid']

export default function VehiclesManagementPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [searchPort, setSearchPort] = useState<string>('')

  const [formData, setFormData] = useState<VehicleFormData>({
    name: '',
    vehicleType: '',
    capacity: '',
    homePort: '',
    registrationNumber: '',
    color: '',
    yearOfManufacture: '',
    status: 'AVAILABLE',
    fuelType: '',
    fuelCapacity: '',
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch vehicles with filters
  const fetchVehicles = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: pageNumber.toString(),
        limit: pageSize.toString(),
      })

      if (filterType) params.append('vehicleType', filterType)
      if (filterStatus) params.append('status', filterStatus)
      if (searchPort) params.append('homePort', searchPort)

      const response = await fetch(`/api/vehicles?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch vehicles')
      }

      setVehicles(data.data.data)
      setTotalPages(data.data.pagination?.pages || 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicles')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [pageNumber, filterType, filterStatus, searchPort])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate required fields
      if (!formData.name || !formData.vehicleType || !formData.capacity || !formData.homePort) {
        throw new Error('Please fill in all required fields')
      }

      const url = editingId ? `/api/vehicles/${editingId}` : '/api/vehicles'
      const method = editingId ? 'PUT' : 'POST'

      const payload: any = {
        name: formData.name,
        vehicleType: formData.vehicleType,
        capacity: parseInt(formData.capacity),
        homePort: formData.homePort,
        status: formData.status,
      }

      if (formData.registrationNumber) payload.registrationNumber = formData.registrationNumber
      if (formData.color) payload.color = formData.color
      if (formData.yearOfManufacture) payload.yearOfManufacture = parseInt(formData.yearOfManufacture)
      if (formData.fuelType) payload.fuelType = formData.fuelType
      if (formData.fuelCapacity) payload.fuelCapacity = parseFloat(formData.fuelCapacity)

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save vehicle')
      }

      setSuccess(editingId ? 'Vehicle updated successfully!' : 'Vehicle created successfully!')
      setShowForm(false)
      setEditingId(null)
      setFormData({
        name: '',
        vehicleType: '',
        capacity: '',
        homePort: '',
        registrationNumber: '',
        color: '',
        yearOfManufacture: '',
        status: 'AVAILABLE',
        fuelType: '',
        fuelCapacity: '',
      })

      // Refresh list
      await fetchVehicles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vehicle')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (vehicle: Vehicle) => {
    setFormData({
      name: vehicle.name,
      vehicleType: vehicle.vehicleType,
      capacity: vehicle.capacity.toString(),
      homePort: vehicle.homePort,
      registrationNumber: vehicle.registrationNumber || '',
      color: vehicle.color || '',
      yearOfManufacture: vehicle.yearOfManufacture?.toString() || '',
      status: vehicle.status,
      fuelType: vehicle.fuelType || '',
      fuelCapacity: vehicle.fuelCapacity?.toString() || '',
    })
    setEditingId(vehicle.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete vehicle')
      }

      setSuccess('Vehicle deleted successfully!')
      await fetchVehicles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vehicle')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      name: '',
      vehicleType: '',
      capacity: '',
      homePort: '',
      registrationNumber: '',
      color: '',
      yearOfManufacture: '',
      status: 'AVAILABLE',
      fuelType: '',
      fuelCapacity: '',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800'
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800'
      case 'RETIRED':
        return 'bg-red-100 text-red-800'
      case 'OUT_OF_SERVICE':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Vehicle Management</h1>
          <p className="mt-1 text-slate-600">Manage your fleet of vehicles and transportation assets</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
          }}
          className="bg-[#005B9A] hover:bg-[#003d6b]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Vehicle Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005B9A]"
                  placeholder="e.g., Minibus A"
                  disabled={isSubmitting}
                />
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Vehicle Type *
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005B9A]"
                  disabled={isSubmitting}
                >
                  <option value="">Select type...</option>
                  {VEHICLE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Capacity *
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005B9A]"
                  placeholder="e.g., 8"
                  min="1"
                  disabled={isSubmitting}
                />
              </div>

              {/* Home Port */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Home Port *
                </label>
                <input
                  type="text"
                  value={formData.homePort}
                  onChange={(e) => setFormData({ ...formData, homePort: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005B9A]"
                  placeholder="e.g., Koh Samui"
                  disabled={isSubmitting}
                />
              </div>

              {/* Registration Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005B9A]"
                  placeholder="e.g., กข-1234"
                  disabled={isSubmitting}
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005B9A]"
                  placeholder="e.g., White"
                  disabled={isSubmitting}
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Year of Manufacture
                </label>
                <input
                  type="number"
                  value={formData.yearOfManufacture}
                  onChange={(e) => setFormData({ ...formData, yearOfManufacture: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005B9A]"
                  placeholder="e.g., 2023"
                  min="1900"
                  max={new Date().getFullYear()}
                  disabled={isSubmitting}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005B9A]"
                  disabled={isSubmitting}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fuel Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fuel Type
                </label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005B9A]"
                  disabled={isSubmitting}
                >
                  <option value="">Select fuel type...</option>
                  {FUEL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fuel Capacity */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fuel Capacity (Liters)
                </label>
                <input
                  type="number"
                  value={formData.fuelCapacity}
                  onChange={(e) => setFormData({ ...formData, fuelCapacity: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005B9A]"
                  placeholder="e.g., 60"
                  step="0.1"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#005B9A] hover:bg-[#003d6b]"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? 'Update Vehicle' : 'Create Vehicle'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Vehicle Type
            </label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value)
                setPageNumber(1)
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005B9A]"
            >
              <option value="">All Types</option>
              {VEHICLE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value)
                setPageNumber(1)
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005B9A]"
            >
              <option value="">All Status</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Home Port
            </label>
            <input
              type="text"
              value={searchPort}
              onChange={(e) => {
                setSearchPort(e.target.value)
                setPageNumber(1)
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005B9A]"
              placeholder="Search by port..."
            />
          </div>
        </div>
      </div>

      {/* Vehicles List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#005B9A]" />
        </div>
      ) : vehicles.length > 0 ? (
        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{vehicle.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                    {!vehicle.isActive && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {vehicle.vehicleType.charAt(0).toUpperCase() + vehicle.vehicleType.slice(1)} • 
                    Capacity: {vehicle.capacity} • 
                    Home Port: {vehicle.homePort}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-600 sm:grid-cols-4">
                    {vehicle.registrationNumber && (
                      <div>
                        <span className="font-medium">Reg:</span> {vehicle.registrationNumber}
                      </div>
                    )}
                    {vehicle.color && (
                      <div>
                        <span className="font-medium">Color:</span> {vehicle.color}
                      </div>
                    )}
                    {vehicle.yearOfManufacture && (
                      <div>
                        <span className="font-medium">Year:</span> {vehicle.yearOfManufacture}
                      </div>
                    )}
                    {vehicle.mileage !== undefined && (
                      <div>
                        <span className="font-medium">Mileage:</span> {vehicle.mileage} km
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(vehicle)}
                    disabled={isSubmitting}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(vehicle.id)}
                    disabled={isSubmitting}
                    className="text-red-600 hover:text-red-700 hover:border-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-slate-600">
              Page {pageNumber} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                disabled={pageNumber === 1 || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setPageNumber(Math.min(totalPages, pageNumber + 1))}
                disabled={pageNumber === totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-600">No vehicles found. Create one to get started!</p>
        </div>
      )}
    </div>
  )
}
