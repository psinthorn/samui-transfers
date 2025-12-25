import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse, handleApiError } from '@/app/api/utils/api-response'
import { requireFields, validateId } from '@/app/api/utils/validation'

/**
 * GET /api/vehicles
 * Retrieve vehicles with optional filtering and pagination
 *
 * Query Parameters:
 * - vehicleType: Filter by vehicle type (minibus, suv, sedan, etc.)
 * - status: Filter by status (AVAILABLE, MAINTENANCE, RETIRED, OUT_OF_SERVICE)
 * - homePort: Filter by home port/location
 * - isActive: Filter by active status (true/false)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 *
 * Response:
 * - Returns paginated list of vehicles with metadata
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Filters
    const vehicleType = searchParams.get('vehicleType')
    const status = searchParams.get('status')
    const homePort = searchParams.get('homePort')
    const isActive = searchParams.get('isActive')

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return errorResponse('Invalid pagination parameters', 400)
    }

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (vehicleType) where.vehicleType = vehicleType
    if (status) where.status = status
    if (homePort) where.homePort = homePort
    if (isActive === 'true') where.isActive = true
    if (isActive === 'false') where.isActive = false

    // Get total count
    const total = await prisma.vehicle.count({ where })

    // Fetch vehicles
    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    return successResponse(
      {
        data: vehicles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      'Vehicles retrieved successfully'
    )
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return handleApiError(error)
  }
}

/**
 * POST /api/vehicles
 * Create a new vehicle
 *
 * Request Body (Required):
 * - name: Vehicle name/identifier (string)
 * - vehicleType: Type of vehicle (string: minibus, suv, sedan, pickup, etc.)
 * - capacity: Maximum passenger capacity (integer, > 0)
 * - homePort: Base location (string)
 *
 * Optional Fields:
 * - registrationNumber: License plate (string, unique)
 * - color: Vehicle color (string)
 * - yearOfManufacture: Year manufactured (integer)
 * - status: Initial status (AVAILABLE, MAINTENANCE, RETIRED, OUT_OF_SERVICE)
 * - isActive: Active status (boolean, default: true)
 * - fuelType: Type of fuel (string)
 * - fuelCapacity: Tank size in liters (decimal)
 * - currentLocation: Current location (string)
 *
 * Response:
 * - Returns created vehicle object with 201 status
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate required fields
    requireFields(body, ['name', 'vehicleType', 'capacity', 'homePort'])

    const {
      name,
      vehicleType,
      capacity,
      homePort,
      registrationNumber,
      color,
      yearOfManufacture,
      status = 'AVAILABLE',
      isActive = true,
      currentLocation,
      fuelType,
      fuelCapacity,
      mileage = 0,
    } = body

    // Validate capacity is positive integer
    if (!Number.isInteger(capacity) || capacity <= 0) {
      return errorResponse('Capacity must be a positive integer', 400)
    }

    // Validate year if provided
    if (yearOfManufacture && (!Number.isInteger(yearOfManufacture) || yearOfManufacture < 1900 || yearOfManufacture > new Date().getFullYear())) {
      return errorResponse('Year of manufacture must be a valid year', 400)
    }

    // Validate status
    const validStatuses = ['AVAILABLE', 'MAINTENANCE', 'RETIRED', 'OUT_OF_SERVICE']
    if (!validStatuses.includes(status)) {
      return errorResponse(`Status must be one of: ${validStatuses.join(', ')}`, 400)
    }

    // Validate vehicle type
    const validVehicleTypes = ['minibus', 'suv', 'sedan', 'pickup', 'van', 'bus', 'truck', 'other']
    if (!validVehicleTypes.includes(vehicleType.toLowerCase())) {
      return errorResponse(`Vehicle type must be one of: ${validVehicleTypes.join(', ')}`, 400)
    }

    // Check for duplicate registration number if provided
    if (registrationNumber) {
      const existing = await prisma.vehicle.findUnique({
        where: { registrationNumber },
      })
      if (existing) {
        return errorResponse('A vehicle with this registration number already exists', 409)
      }
    }

    // Create vehicle
    const vehicle = await prisma.vehicle.create({
      data: {
        name,
        vehicleType: vehicleType.toLowerCase(),
        capacity,
        homePort,
        registrationNumber: registrationNumber || null,
        color: color || null,
        yearOfManufacture: yearOfManufacture || null,
        status,
        isActive,
        currentLocation: currentLocation || null,
        fuelType: fuelType || null,
        fuelCapacity: fuelCapacity ? parseFloat(fuelCapacity) : null,
        mileage: mileage || 0,
      },
    })

    return successResponse(vehicle, 'Vehicle created successfully', 201)
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return handleApiError(error)
  }
}
