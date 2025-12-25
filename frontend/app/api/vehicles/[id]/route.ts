import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse, handleApiError } from '@/app/api/utils/api-response'
import { validateId } from '@/app/api/utils/validation'

/**
 * GET /api/vehicles/[id]
 * Retrieve a specific vehicle by ID
 *
 * URL Parameters:
 * - id: Vehicle ID (string)
 *
 * Response:
 * - Returns vehicle object with all details
 * - 404 if vehicle not found
 */
type Params = Promise<{ id: string }>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params

    // Validate ID format
    validateId(id)

    // Fetch vehicle
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    })

    if (!vehicle) {
      return errorResponse('Vehicle not found', 404)
    }

    return successResponse(vehicle, 'Vehicle retrieved successfully')
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    return handleApiError(error)
  }
}

/**
 * PUT /api/vehicles/[id]
 * Update a vehicle
 *
 * URL Parameters:
 * - id: Vehicle ID (string)
 *
 * Request Body (Optional - at least one field):
 * - name: Vehicle name/identifier
 * - vehicleType: Type of vehicle
 * - capacity: Maximum passenger capacity
 * - homePort: Base location
 * - registrationNumber: License plate
 * - color: Vehicle color
 * - yearOfManufacture: Year manufactured
 * - status: Current status
 * - isActive: Active status
 * - currentLocation: Current location
 * - lastMaintenanceDate: Last maintenance date
 * - nextMaintenanceDate: Next scheduled maintenance
 * - maintenanceNotes: Maintenance notes
 * - safetyInspectionDate: Safety inspection date
 * - safetyInspectionValid: Safety inspection validity
 * - insuranceExpiry: Insurance expiry date
 * - fuelType: Type of fuel
 * - fuelCapacity: Tank size
 * - fuelConsumption: Average consumption per km
 * - mileage: Current odometer reading
 *
 * Response:
 * - Returns updated vehicle object
 * - 404 if vehicle not found
 * - 400 if validation fails
 */
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params
    const body = await req.json()

    // Validate ID format
    validateId(id)

    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    })

    if (!vehicle) {
      return errorResponse('Vehicle not found', 404)
    }

    // Validate updateable fields
    const {
      name,
      vehicleType,
      capacity,
      homePort,
      registrationNumber,
      color,
      yearOfManufacture,
      status,
      isActive,
      currentLocation,
      lastMaintenanceDate,
      nextMaintenanceDate,
      maintenanceNotes,
      safetyInspectionDate,
      safetyInspectionValid,
      insuranceExpiry,
      fuelType,
      fuelCapacity,
      fuelConsumption,
      mileage,
      maintenanceUntil,
    } = body

    // Check for empty update
    if (Object.keys(body).length === 0) {
      return errorResponse('No fields to update', 400)
    }

    // Validate specific fields if provided
    if (capacity !== undefined) {
      if (!Number.isInteger(capacity) || capacity <= 0) {
        return errorResponse('Capacity must be a positive integer', 400)
      }
    }

    if (yearOfManufacture !== undefined) {
      if (!Number.isInteger(yearOfManufacture) || yearOfManufacture < 1900 || yearOfManufacture > new Date().getFullYear()) {
        return errorResponse('Year of manufacture must be a valid year', 400)
      }
    }

    if (status !== undefined) {
      const validStatuses = ['AVAILABLE', 'MAINTENANCE', 'RETIRED', 'OUT_OF_SERVICE']
      if (!validStatuses.includes(status)) {
        return errorResponse(`Status must be one of: ${validStatuses.join(', ')}`, 400)
      }
    }

    if (vehicleType !== undefined) {
      const validVehicleTypes = ['minibus', 'suv', 'sedan', 'pickup', 'van', 'bus', 'truck', 'other']
      if (!validVehicleTypes.includes(vehicleType.toLowerCase())) {
        return errorResponse(`Vehicle type must be one of: ${validVehicleTypes.join(', ')}`, 400)
      }
    }

    // Check for duplicate registration if changing it
    if (registrationNumber && registrationNumber !== vehicle.registrationNumber) {
      const existing = await prisma.vehicle.findUnique({
        where: { registrationNumber },
      })
      if (existing) {
        return errorResponse('A vehicle with this registration number already exists', 409)
      }
    }

    // Build update data object (only include provided fields)
    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (vehicleType !== undefined) updateData.vehicleType = vehicleType.toLowerCase()
    if (capacity !== undefined) updateData.capacity = capacity
    if (homePort !== undefined) updateData.homePort = homePort
    if (registrationNumber !== undefined) updateData.registrationNumber = registrationNumber
    if (color !== undefined) updateData.color = color
    if (yearOfManufacture !== undefined) updateData.yearOfManufacture = yearOfManufacture
    if (status !== undefined) updateData.status = status
    if (isActive !== undefined) updateData.isActive = isActive
    if (currentLocation !== undefined) updateData.currentLocation = currentLocation
    if (maintenanceUntil !== undefined) updateData.maintenanceUntil = maintenanceUntil ? new Date(maintenanceUntil) : null
    if (lastMaintenanceDate !== undefined) updateData.lastMaintenanceDate = lastMaintenanceDate ? new Date(lastMaintenanceDate) : null
    if (nextMaintenanceDate !== undefined) updateData.nextMaintenanceDate = nextMaintenanceDate ? new Date(nextMaintenanceDate) : null
    if (maintenanceNotes !== undefined) updateData.maintenanceNotes = maintenanceNotes
    if (safetyInspectionDate !== undefined) updateData.safetyInspectionDate = safetyInspectionDate ? new Date(safetyInspectionDate) : null
    if (safetyInspectionValid !== undefined) updateData.safetyInspectionValid = safetyInspectionValid
    if (insuranceExpiry !== undefined) updateData.insuranceExpiry = insuranceExpiry ? new Date(insuranceExpiry) : null
    if (fuelType !== undefined) updateData.fuelType = fuelType
    if (fuelCapacity !== undefined) updateData.fuelCapacity = fuelCapacity ? parseFloat(fuelCapacity) : null
    if (fuelConsumption !== undefined) updateData.fuelConsumption = fuelConsumption ? parseFloat(fuelConsumption) : null
    if (mileage !== undefined) updateData.mileage = mileage

    // Update vehicle
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData,
    })

    return successResponse(updatedVehicle, 'Vehicle updated successfully')
  } catch (error) {
    console.error('Error updating vehicle:', error)
    return handleApiError(error)
  }
}

/**
 * DELETE /api/vehicles/[id]
 * Soft delete a vehicle (mark as inactive)
 *
 * URL Parameters:
 * - id: Vehicle ID (string)
 *
 * Response:
 * - Returns soft-deleted vehicle object with isActive: false
 * - 404 if vehicle not found
 *
 * Note: This is a soft delete. The record remains in the database
 * but is marked as inactive. To retrieve only active vehicles,
 * filter with isActive: true in GET requests.
 */
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params

    // Validate ID format
    validateId(id)

    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    })

    if (!vehicle) {
      return errorResponse('Vehicle not found', 404)
    }

    // Soft delete: mark as inactive and set maintenance until now
    const deletedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        isActive: false,
        status: 'RETIRED',
        maintenanceUntil: new Date(),
      },
    })

    return successResponse(deletedVehicle, 'Vehicle deleted successfully')
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return handleApiError(error)
  }
}
