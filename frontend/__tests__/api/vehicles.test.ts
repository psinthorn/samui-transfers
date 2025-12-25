import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { prisma } from '@/lib/prisma'

/**
 * Vehicles CRUD API Test Suite
 *
 * Tests for complete CRUD operations on the Vehicles API
 * Including validation, filtering, pagination, and error handling
 */

describe('/api/vehicles', () => {
  let vehicleId: string
  let createdVehicles: string[] = []

  // Helper function to make API requests
  const makeRequest = async (method: string, path: string, body?: any) => {
    const response = await fetch(`http://localhost:3000${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    return response.json()
  }

  // Cleanup after each test
  afterEach(async () => {
    // Clean up created vehicles
    for (const id of createdVehicles) {
      try {
        await prisma.vehicle.delete({ where: { id } })
      } catch (e) {
        // Vehicle might already be deleted
      }
    }
    createdVehicles = []
  })

  describe('POST /api/vehicles - Create Vehicle', () => {
    it('should create a vehicle with required fields', async () => {
      const response = await makeRequest('POST', '/api/vehicles', {
        name: 'Test Minibus',
        vehicleType: 'minibus',
        capacity: 8,
        homePort: 'Koh Samui',
      })

      expect(response.success).toBe(true)
      expect(response.data).toHaveProperty('id')
      expect(response.data.name).toBe('Test Minibus')
      expect(response.data.vehicleType).toBe('minibus')
      expect(response.data.capacity).toBe(8)
      expect(response.data.homePort).toBe('Koh Samui')
      expect(response.data.isActive).toBe(true)
      expect(response.data.status).toBe('AVAILABLE')

      createdVehicles.push(response.data.id)
    })

    it('should create a vehicle with all optional fields', async () => {
      const response = await makeRequest('POST', '/api/vehicles', {
        name: 'Luxury SUV',
        vehicleType: 'suv',
        capacity: 5,
        homePort: 'Airport',
        registrationNumber: 'ABC-1234',
        color: 'black',
        yearOfManufacture: 2023,
        status: 'AVAILABLE',
        isActive: true,
        fuelType: 'Diesel',
        fuelCapacity: 80,
      })

      expect(response.success).toBe(true)
      expect(response.data.registrationNumber).toBe('ABC-1234')
      expect(response.data.color).toBe('black')
      expect(response.data.yearOfManufacture).toBe(2023)
      expect(response.data.fuelType).toBe('Diesel')
      expect(response.data.fuelCapacity).toBe(80)

      createdVehicles.push(response.data.id)
    })

    it('should reject vehicle with missing required name', async () => {
      const response = await makeRequest('POST', '/api/vehicles', {
        vehicleType: 'minibus',
        capacity: 8,
        homePort: 'Samui',
      })

      expect(response.success).toBe(false)
      expect(response.statusCode).toBe(400)
      expect(response.error).toContain('required')
    })

    it('should reject vehicle with missing vehicleType', async () => {
      const response = await makeRequest('POST', '/api/vehicles', {
        name: 'Test',
        capacity: 8,
        homePort: 'Samui',
      })

      expect(response.success).toBe(false)
      expect(response.statusCode).toBe(400)
    })

    it('should reject vehicle with invalid capacity (zero)', async () => {
      const response = await makeRequest('POST', '/api/vehicles', {
        name: 'Invalid Vehicle',
        vehicleType: 'sedan',
        capacity: 0,
        homePort: 'Samui',
      })

      expect(response.success).toBe(false)
      expect(response.statusCode).toBe(400)
      expect(response.error).toContain('positive')
    })

    it('should reject vehicle with negative capacity', async () => {
      const response = await makeRequest('POST', '/api/vehicles', {
        name: 'Invalid Vehicle',
        vehicleType: 'sedan',
        capacity: -5,
        homePort: 'Samui',
      })

      expect(response.success).toBe(false)
      expect(response.statusCode).toBe(400)
      expect(response.error).toContain('positive')
    })

    it('should reject vehicle with non-integer capacity', async () => {
      const response = await makeRequest('POST', '/api/vehicles', {
        name: 'Invalid Vehicle',
        vehicleType: 'sedan',
        capacity: 4.5,
        homePort: 'Samui',
      })

      expect(response.success).toBe(false)
      expect(response.statusCode).toBe(400)
      expect(response.error).toContain('positive integer')
    })

    it('should reject vehicle with invalid vehicleType', async () => {
      const response = await makeRequest('POST', '/api/vehicles', {
        name: 'Invalid Vehicle',
        vehicleType: 'spaceship',
        capacity: 8,
        homePort: 'Samui',
      })

      expect(response.success).toBe(false)
      expect(response.statusCode).toBe(400)
      expect(response.error).toContain('vehicle type')
    })

    it('should reject vehicle with invalid year of manufacture', async () => {
      const response = await makeRequest('POST', '/api/vehicles', {
        name: 'Invalid Vehicle',
        vehicleType: 'minibus',
        capacity: 8,
        homePort: 'Samui',
        yearOfManufacture: 1800,
      })

      expect(response.success).toBe(false)
      expect(response.statusCode).toBe(400)
      expect(response.error).toContain('year')
    })

    it('should reject vehicle with duplicate registration number', async () => {
      // Create first vehicle
      const firstResponse = await makeRequest('POST', '/api/vehicles', {
        name: 'Vehicle 1',
        vehicleType: 'minibus',
        capacity: 8,
        homePort: 'Samui',
        registrationNumber: 'DUPLICATE-123',
      })

      createdVehicles.push(firstResponse.data.id)

      // Try to create second with same registration
      const secondResponse = await makeRequest('POST', '/api/vehicles', {
        name: 'Vehicle 2',
        vehicleType: 'sedan',
        capacity: 4,
        homePort: 'Airport',
        registrationNumber: 'DUPLICATE-123',
      })

      expect(secondResponse.success).toBe(false)
      expect(secondResponse.statusCode).toBe(409)
      expect(secondResponse.error).toContain('registration')
    })

    it('should accept valid vehicle types', async () => {
      const types = ['minibus', 'suv', 'sedan', 'pickup', 'van', 'bus', 'truck', 'other']

      for (const type of types) {
        const response = await makeRequest('POST', '/api/vehicles', {
          name: `Vehicle ${type}`,
          vehicleType: type,
          capacity: 8,
          homePort: 'Samui',
        })

        expect(response.success).toBe(true)
        createdVehicles.push(response.data.id)
      }
    })
  })

  describe('GET /api/vehicles - List Vehicles', () => {
    beforeEach(async () => {
      // Create test vehicles
      const vehicles = [
        {
          name: 'Minibus A',
          vehicleType: 'minibus',
          capacity: 8,
          homePort: 'Koh Samui',
          status: 'AVAILABLE',
          isActive: true,
        },
        {
          name: 'SUV B',
          vehicleType: 'suv',
          capacity: 5,
          homePort: 'Airport',
          status: 'AVAILABLE',
          isActive: true,
        },
        {
          name: 'Sedan C',
          vehicleType: 'sedan',
          capacity: 4,
          homePort: 'Koh Samui',
          status: 'MAINTENANCE',
          isActive: true,
        },
        {
          name: 'Van D',
          vehicleType: 'van',
          capacity: 10,
          homePort: 'Port',
          status: 'AVAILABLE',
          isActive: false,
        },
      ]

      for (const vehicle of vehicles) {
        const created = await prisma.vehicle.create({ data: vehicle })
        createdVehicles.push(created.id)
      }
    })

    it('should list all vehicles', async () => {
      const response = await makeRequest('GET', '/api/vehicles')

      expect(response.success).toBe(true)
      expect(response.data).toHaveProperty('data')
      expect(response.data).toHaveProperty('pagination')
      expect(Array.isArray(response.data.data)).toBe(true)
      expect(response.data.data.length).toBeGreaterThan(0)
    })

    it('should list vehicles with pagination', async () => {
      const response = await makeRequest('GET', '/api/vehicles?page=1&limit=2')

      expect(response.success).toBe(true)
      expect(response.data.pagination.page).toBe(1)
      expect(response.data.pagination.limit).toBe(2)
      expect(response.data.pagination.total).toBeGreaterThan(0)
      expect(response.data.data.length).toBeLessThanOrEqual(2)
    })

    it('should filter vehicles by vehicleType', async () => {
      const response = await makeRequest('GET', '/api/vehicles?vehicleType=minibus')

      expect(response.success).toBe(true)
      expect(response.data.data.every((v: any) => v.vehicleType === 'minibus')).toBe(true)
    })

    it('should filter vehicles by status', async () => {
      const response = await makeRequest('GET', '/api/vehicles?status=AVAILABLE')

      expect(response.success).toBe(true)
      expect(response.data.data.every((v: any) => v.status === 'AVAILABLE')).toBe(true)
    })

    it('should filter vehicles by homePort', async () => {
      const response = await makeRequest('GET', '/api/vehicles?homePort=Koh%20Samui')

      expect(response.success).toBe(true)
      expect(response.data.data.every((v: any) => v.homePort === 'Koh Samui')).toBe(true)
    })

    it('should filter vehicles by isActive=true', async () => {
      const response = await makeRequest('GET', '/api/vehicles?isActive=true')

      expect(response.success).toBe(true)
      expect(response.data.data.every((v: any) => v.isActive === true)).toBe(true)
    })

    it('should filter vehicles by isActive=false', async () => {
      const response = await makeRequest('GET', '/api/vehicles?isActive=false')

      expect(response.success).toBe(true)
      expect(response.data.data.every((v: any) => v.isActive === false)).toBe(true)
    })

    it('should apply multiple filters', async () => {
      const response = await makeRequest(
        'GET',
        '/api/vehicles?vehicleType=minibus&status=AVAILABLE&homePort=Koh%20Samui'
      )

      expect(response.success).toBe(true)
      expect(response.data.data.every((v: any) => 
        v.vehicleType === 'minibus' && 
        v.status === 'AVAILABLE' && 
        v.homePort === 'Koh Samui'
      )).toBe(true)
    })

    it('should return empty array when filter matches nothing', async () => {
      const response = await makeRequest('GET', '/api/vehicles?vehicleType=spaceship')

      expect(response.success).toBe(true)
      expect(response.data.data).toEqual([])
    })
  })

  describe('GET /api/vehicles/{id} - Get Single Vehicle', () => {
    beforeEach(async () => {
      const created = await prisma.vehicle.create({
        data: {
          name: 'Test Vehicle',
          vehicleType: 'minibus',
          capacity: 8,
          homePort: 'Samui',
          registrationNumber: 'TEST-001',
          color: 'white',
          yearOfManufacture: 2023,
          fuelType: 'Diesel',
          fuelCapacity: 60,
        },
      })
      vehicleId = created.id
      createdVehicles.push(vehicleId)
    })

    it('should retrieve a single vehicle by ID', async () => {
      const response = await makeRequest('GET', `/api/vehicles/${vehicleId}`)

      expect(response.success).toBe(true)
      expect(response.data.id).toBe(vehicleId)
      expect(response.data.name).toBe('Test Vehicle')
      expect(response.data.registrationNumber).toBe('TEST-001')
    })

    it('should return 404 for non-existent vehicle', async () => {
      const response = await makeRequest('GET', `/api/vehicles/nonexistent-id`)

      expect(response.success).toBe(false)
      expect(response.statusCode).toBe(404)
      expect(response.error).toContain('not found')
    })

    it('should include all vehicle fields', async () => {
      const response = await makeRequest('GET', `/api/vehicles/${vehicleId}`)

      expect(response.data).toHaveProperty('id')
      expect(response.data).toHaveProperty('name')
      expect(response.data).toHaveProperty('vehicleType')
      expect(response.data).toHaveProperty('capacity')
      expect(response.data).toHaveProperty('homePort')
      expect(response.data).toHaveProperty('status')
      expect(response.data).toHaveProperty('isActive')
      expect(response.data).toHaveProperty('createdAt')
      expect(response.data).toHaveProperty('updatedAt')
    })
  })

  describe('PUT /api/vehicles/{id} - Update Vehicle', () => {
    beforeEach(async () => {
      const created = await prisma.vehicle.create({
        data: {
          name: 'Original Name',
          vehicleType: 'minibus',
          capacity: 8,
          homePort: 'Koh Samui',
          status: 'AVAILABLE',
          isActive: true,
        },
      })
      vehicleId = created.id
      createdVehicles.push(vehicleId)
    })

    it('should update vehicle name', async () => {
      const response = await makeRequest('PUT', `/api/vehicles/${vehicleId}`, {
        name: 'Updated Name',
      })

      expect(response.success).toBe(true)
      expect(response.data.name).toBe('Updated Name')
    })

    it('should update vehicle status', async () => {
      const response = await makeRequest('PUT', `/api/vehicles/${vehicleId}`, {
        status: 'MAINTENANCE',
      })

      expect(response.success).toBe(true)
      expect(response.data.status).toBe('MAINTENANCE')
    })

    it('should update current location', async () => {
      const response = await makeRequest('PUT', `/api/vehicles/${vehicleId}`, {
        currentLocation: 'Airport',
      })

      expect(response.success).toBe(true)
      expect(response.data.currentLocation).toBe('Airport')
    })

    it('should update multiple fields', async () => {
      const response = await makeRequest('PUT', `/api/vehicles/${vehicleId}`, {
        name: 'New Name',
        status: 'MAINTENANCE',
        currentLocation: 'Port',
        mileage: 50000,
      })

      expect(response.success).toBe(true)
      expect(response.data.name).toBe('New Name')
      expect(response.data.status).toBe('MAINTENANCE')
      expect(response.data.currentLocation).toBe('Port')
      expect(response.data.mileage).toBe(50000)
    })

    it('should not allow empty update', async () => {
      const response = await makeRequest('PUT', `/api/vehicles/${vehicleId}`, {})

      expect(response.success).toBe(false)
      expect(response.statusCode).toBe(400)
    })

    it('should reject invalid capacity update', async () => {
      const response = await makeRequest('PUT', `/api/vehicles/${vehicleId}`, {
        capacity: 0,
      })

      expect(response.success).toBe(false)
      expect(response.statusCode).toBe(400)
    })

    it('should return 404 for non-existent vehicle', async () => {
      const response = await makeRequest('PUT', `/api/vehicles/nonexistent-id`, {
        name: 'New Name',
      })

      expect(response.success).toBe(false)
      expect(response.statusCode).toBe(404)
    })

    it('should update maintenance dates', async () => {
      const response = await makeRequest('PUT', `/api/vehicles/${vehicleId}`, {
        lastMaintenanceDate: '2025-11-15',
        nextMaintenanceDate: '2026-02-15',
      })

      expect(response.success).toBe(true)
      expect(response.data.lastMaintenanceDate).toBeDefined()
      expect(response.data.nextMaintenanceDate).toBeDefined()
    })

    it('should allow changing registration number if not duplicate', async () => {
      const response = await makeRequest('PUT', `/api/vehicles/${vehicleId}`, {
        registrationNumber: 'NEW-REG-001',
      })

      expect(response.success).toBe(true)
      expect(response.data.registrationNumber).toBe('NEW-REG-001')
    })

    it('should reject duplicate registration number', async () => {
      // Create another vehicle with a registration
      const other = await prisma.vehicle.create({
        data: {
          name: 'Other',
          vehicleType: 'sedan',
          capacity: 4,
          homePort: 'Samui',
          registrationNumber: 'EXISTING-REG',
        },
      })
      createdVehicles.push(other.id)

      // Try to update first vehicle with same registration
      const response = await makeRequest('PUT', `/api/vehicles/${vehicleId}`, {
        registrationNumber: 'EXISTING-REG',
      })

      expect(response.success).toBe(false)
      expect(response.statusCode).toBe(409)
    })
  })

  describe('DELETE /api/vehicles/{id} - Delete Vehicle', () => {
    beforeEach(async () => {
      const created = await prisma.vehicle.create({
        data: {
          name: 'Vehicle to Delete',
          vehicleType: 'minibus',
          capacity: 8,
          homePort: 'Samui',
          status: 'AVAILABLE',
          isActive: true,
        },
      })
      vehicleId = created.id
    })

    it('should soft delete a vehicle (marks inactive)', async () => {
      const response = await makeRequest('DELETE', `/api/vehicles/${vehicleId}`)

      expect(response.success).toBe(true)
      expect(response.data.isActive).toBe(false)
      expect(response.data.status).toBe('RETIRED')
    })

    it('should return 404 for non-existent vehicle', async () => {
      const response = await makeRequest('DELETE', `/api/vehicles/nonexistent-id`)

      expect(response.success).toBe(false)
      expect(response.statusCode).toBe(404)
    })

    it('deleted vehicle should not appear in active list', async () => {
      await makeRequest('DELETE', `/api/vehicles/${vehicleId}`)

      // Vehicle should still exist (soft delete)
      const getResponse = await makeRequest('GET', `/api/vehicles/${vehicleId}`)
      expect(getResponse.success).toBe(true)
      expect(getResponse.data.isActive).toBe(false)
    })

    it('should be able to soft-delete multiple vehicles', async () => {
      const vehicle2 = await prisma.vehicle.create({
        data: {
          name: 'Vehicle 2',
          vehicleType: 'sedan',
          capacity: 4,
          homePort: 'Samui',
        },
      })

      const response1 = await makeRequest('DELETE', `/api/vehicles/${vehicleId}`)
      const response2 = await makeRequest('DELETE', `/api/vehicles/${vehicle2.id}`)

      expect(response1.success).toBe(true)
      expect(response2.success).toBe(true)
      expect(response1.data.isActive).toBe(false)
      expect(response2.data.isActive).toBe(false)
    })
  })

  describe('Edge Cases & Combined Operations', () => {
    it('should handle rapid create-read-update-delete sequence', async () => {
      // Create
      const createResponse = await makeRequest('POST', '/api/vehicles', {
        name: 'Sequential Test',
        vehicleType: 'minibus',
        capacity: 8,
        homePort: 'Samui',
      })
      expect(createResponse.success).toBe(true)
      const id = createResponse.data.id

      // Read
      const readResponse = await makeRequest('GET', `/api/vehicles/${id}`)
      expect(readResponse.success).toBe(true)

      // Update
      const updateResponse = await makeRequest('PUT', `/api/vehicles/${id}`, {
        currentLocation: 'Updated',
      })
      expect(updateResponse.success).toBe(true)

      // Delete
      const deleteResponse = await makeRequest('DELETE', `/api/vehicles/${id}`)
      expect(deleteResponse.success).toBe(true)

      createdVehicles.push(id)
    })

    it('should handle special characters in vehicle names', async () => {
      const response = await makeRequest('POST', '/api/vehicles', {
        name: "Van's Paradise #1",
        vehicleType: 'van',
        capacity: 10,
        homePort: "Koh Samui's Main Port",
      })

      expect(response.success).toBe(true)
      expect(response.data.name).toBe("Van's Paradise #1")
      createdVehicles.push(response.data.id)
    })

    it('should handle unicode characters in fields', async () => {
      const response = await makeRequest('POST', '/api/vehicles', {
        name: 'รถขนาดใหญ่',
        vehicleType: 'bus',
        capacity: 50,
        homePort: 'เกาะสมุย',
        color: 'สีเทา',
      })

      expect(response.success).toBe(true)
      createdVehicles.push(response.data.id)
    })
  })
})
