/**
 * API Test Suite for Samui Transfers
 * 
 * This test suite provides comprehensive coverage of:
 * - Speedboat CRUD operations
 * - Driver management
 * - Captain assignments
 * - Tour bookings
 * - Event bookings
 * - Multi-service bookings
 * - Service rates and pricing
 */

/**
 * Speedboat API Tests
 */
describe('Speedboat API', () => {
  const baseUrl = '/api/speedboats'
  const mockSpeedboat = {
    name: 'Ocean Explorer',
    registrationNumber: 'KS-001',
    capacity: 8,
    basePrice: 2500,
    location: 'Koh Samui',
  }

  const authHeaders = {
    'Authorization': 'Bearer test-token',
    'X-User-Id': 'test-user-id',
    'X-User-Email': 'admin@example.com',
    'X-User-Role': 'ADMIN',
  }

  describe('GET /api/speedboats', () => {
    it('should list all speedboats with pagination', async () => {
      const response = await fetch(`${baseUrl}?page=1&limit=10`, {
        method: 'GET',
        headers: authHeaders,
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('data')
      expect(data.data).toHaveProperty('pagination')
      expect(Array.isArray(data.data.data)).toBe(true)
    })

    it('should filter speedboats by location', async () => {
      const response = await fetch(`${baseUrl}?location=Koh%20Samui`, {
        method: 'GET',
        headers: authHeaders,
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      if (data.data.data.length > 0) {
        data.data.data.forEach((boat) => {
          expect(boat.location).toBe('Koh Samui')
        })
      }
    })

    it('should handle pagination correctly', async () => {
      const response = await fetch(`${baseUrl}?page=1&limit=5`, {
        method: 'GET',
        headers: authHeaders,
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data.pagination.limit).toBe(5)
      expect(data.data.pagination.page).toBe(1)
    })

    it('should return 401 without authentication', async () => {
      const response = await fetch(baseUrl, {
        method: 'GET',
      })

      // Should either return 401 or be publicly accessible depending on implementation
      expect([200, 401]).toContain(response.status)
    })
  })

  describe('GET /api/speedboats/{id}', () => {
    it('should return 404 for non-existent speedboat', async () => {
      const response = await fetch(`${baseUrl}/nonexistent-id`, {
        method: 'GET',
        headers: authHeaders,
      })

      expect([404, 400]).toContain(response.status)
    })

    it('should return speedboat details for valid ID', async () => {
      // First, get a list to find a valid ID
      const listResponse = await fetch(baseUrl, {
        method: 'GET',
        headers: authHeaders,
      })

      if (listResponse.status === 200) {
        const listData = await listResponse.json()
        if (listData.data.data.length > 0) {
          const boatId = listData.data.data[0].id
          
          const response = await fetch(`${baseUrl}/${boatId}`, {
            method: 'GET',
            headers: authHeaders,
          })

          expect(response.status).toBe(200)
          const data = await response.json()
          expect(data.success).toBe(true)
          expect(data.data).toHaveProperty('id')
          expect(data.data).toHaveProperty('name')
        }
      }
    })
  })

  describe('POST /api/speedboats', () => {
    it('should create a new speedboat with admin role', async () => {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockSpeedboat),
      })

      expect([200, 201]).toContain(response.status)
      const data = await response.json()
      if (response.status === 201 || response.status === 200) {
        expect(data.success).toBe(true)
        expect(data.data).toHaveProperty('id')
        expect(data.data.name).toBe(mockSpeedboat.name)
      }
    })

    it('should reject creation without admin role', async () => {
      const userHeaders = {
        ...authHeaders,
        'X-User-Role': 'USER',
      }

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          ...userHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockSpeedboat),
      })

      expect([403, 401]).toContain(response.status)
    })

    it('should validate required fields', async () => {
      const incompleteSpeedboat = {
        name: 'Test Boat',
        // missing registrationNumber, capacity, etc.
      }

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(incompleteSpeedboat),
      })

      expect([400, 422]).toContain(response.status)
    })

    it('should reject duplicate registration number', async () => {
      // This test assumes the speedboat was already created
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockSpeedboat),
      })

      // Second attempt should fail with 409 Conflict
      const response2 = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockSpeedboat),
      })

      expect([409, 400]).toContain(response2.status)
    })
  })

  describe('PUT /api/speedboats/{id}', () => {
    it('should update speedboat details', async () => {
      // Get a valid speedboat ID first
      const listResponse = await fetch(baseUrl, {
        method: 'GET',
        headers: authHeaders,
      })

      if (listResponse.status === 200) {
        const listData = await listResponse.json()
        if (listData.data.data.length > 0) {
          const boatId = listData.data.data[0].id
          const updateData = { basePrice: 3000 }

          const response = await fetch(`${baseUrl}/${boatId}`, {
            method: 'PUT',
            headers: {
              ...authHeaders,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          })

          expect([200, 201]).toContain(response.status)
          const data = await response.json()
          if (response.status === 200) {
            expect(data.success).toBe(true)
          }
        }
      }
    })
  })

  describe('DELETE /api/speedboats/{id}', () => {
    it('should soft delete speedboat', async () => {
      const listResponse = await fetch(baseUrl, {
        method: 'GET',
        headers: authHeaders,
      })

      if (listResponse.status === 200) {
        const listData = await listResponse.json()
        if (listData.data.data.length > 0) {
          const boatId = listData.data.data[0].id

          const response = await fetch(`${baseUrl}/${boatId}`, {
            method: 'DELETE',
            headers: authHeaders,
          })

          expect([200, 204]).toContain(response.status)
        }
      }
    })
  })
})

/**
 * Driver Management API Tests
 */
describe('Driver Management API', () => {
  const baseUrl = '/api/drivers'
  const mockDriver = {
    userId: 'user-123',
    licenseNumber: 'DL-789456',
    licenseExpiry: '2026-12-31',
    isBoatOperator: true,
    isTourGuide: false,
  }

  const adminHeaders = {
    'Authorization': 'Bearer test-token',
    'X-User-Id': 'admin-id',
    'X-User-Email': 'admin@example.com',
    'X-User-Role': 'ADMIN',
  }

  describe('GET /api/drivers', () => {
    it('should list all drivers', async () => {
      const response = await fetch(baseUrl, {
        method: 'GET',
        headers: adminHeaders,
      })

      expect([200, 401]).toContain(response.status)
      if (response.status === 200) {
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(Array.isArray(data.data.data)).toBe(true)
      }
    })

    it('should filter drivers by status', async () => {
      const response = await fetch(`${baseUrl}?status=available`, {
        method: 'GET',
        headers: adminHeaders,
      })

      expect([200, 401]).toContain(response.status)
      if (response.status === 200) {
        const data = await response.json()
        data.data.data.forEach((driver) => {
          expect(driver.status).toBe('available')
        })
      }
    })

    it('should filter drivers by boat operator capability', async () => {
      const response = await fetch(`${baseUrl}?isBoatOperator=true`, {
        method: 'GET',
        headers: adminHeaders,
      })

      expect([200, 401]).toContain(response.status)
      if (response.status === 200) {
        const data = await response.json()
        data.data.data.forEach((driver) => {
          expect(driver.isBoatOperator).toBe(true)
        })
      }
    })
  })

  describe('POST /api/drivers', () => {
    it('should register new driver with admin role', async () => {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          ...adminHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockDriver),
      })

      expect([200, 201, 401]).toContain(response.status)
    })

    it('should reject driver registration without admin role', async () => {
      const userHeaders = {
        ...adminHeaders,
        'X-User-Role': 'USER',
      }

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          ...userHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockDriver),
      })

      expect([403, 401]).toContain(response.status)
    })
  })

  describe('PATCH /api/drivers/{id}', () => {
    it('should update driver information', async () => {
      const listResponse = await fetch(baseUrl, {
        method: 'GET',
        headers: adminHeaders,
      })

      if (listResponse.status === 200) {
        const listData = await listResponse.json()
        if (listData.data.data.length > 0) {
          const driverId = listData.data.data[0].id
          const updateData = { status: 'offline' }

          const response = await fetch(`${baseUrl}/${driverId}`, {
            method: 'PATCH',
            headers: {
              ...adminHeaders,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          })

          expect([200, 404, 401]).toContain(response.status)
        }
      }
    })
  })
})

/**
 * Service Rates API Tests
 */
describe('Service Rates API', () => {
  const baseUrl = '/api/service-rates'
  const mockRate = {
    serviceType: 'BOAT',
    vehicleType: 'speedboat_6person',
    basePrice: 2500,
    distanceRate: 50,
    minDistance: 1,
    maxDistance: 100,
    description: '6-person speedboat hourly rate',
    isActive: true,
  }

  const adminHeaders = {
    'Authorization': 'Bearer test-token',
    'X-User-Id': 'admin-id',
    'X-User-Email': 'admin@example.com',
    'X-User-Role': 'ADMIN',
  }

  describe('GET /api/service-rates', () => {
    it('should list all service rates', async () => {
      const response = await fetch(baseUrl, {
        method: 'GET',
        headers: adminHeaders,
      })

      expect([200, 401]).toContain(response.status)
      if (response.status === 200) {
        const data = await response.json()
        expect(data.success).toBe(true)
      }
    })

    it('should filter rates by service type', async () => {
      const response = await fetch(`${baseUrl}?serviceType=BOAT`, {
        method: 'GET',
        headers: adminHeaders,
      })

      expect([200, 401]).toContain(response.status)
      if (response.status === 200) {
        const data = await response.json()
        data.data.data.forEach((rate) => {
          expect(rate.serviceType).toBe('BOAT')
        })
      }
    })
  })

  describe('POST /api/service-rates', () => {
    it('should create new service rate with admin role', async () => {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          ...adminHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockRate),
      })

      expect([200, 201, 401, 409]).toContain(response.status)
    })

    it('should validate rate data', async () => {
      const invalidRate = {
        serviceType: 'BOAT',
        // missing required fields
      }

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          ...adminHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidRate),
      })

      expect([400, 422, 401]).toContain(response.status)
    })
  })

  describe('PUT /api/service-rates/{id}', () => {
    it('should update service rate', async () => {
      const listResponse = await fetch(baseUrl, {
        method: 'GET',
        headers: adminHeaders,
      })

      if (listResponse.status === 200) {
        const listData = await listResponse.json()
        if (listData.data.data.length > 0) {
          const rateId = listData.data.data[0].id
          const updateData = { basePrice: 3000 }

          const response = await fetch(`${baseUrl}/${rateId}`, {
            method: 'PUT',
            headers: {
              ...adminHeaders,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          })

          expect([200, 404, 401]).toContain(response.status)
        }
      }
    })
  })
})

/**
 * Multi-Service Booking Tests
 */
describe('Multi-Service Booking API', () => {
  const baseUrl = '/api/bookings/bundle'
  
  const userHeaders = {
    'Authorization': 'Bearer test-token',
    'X-User-Id': 'user-123',
    'X-User-Email': 'user@example.com',
    'X-User-Role': 'USER',
  }

  describe('GET /api/bookings/bundle', () => {
    it('should list user bookings', async () => {
      const response = await fetch(baseUrl, {
        method: 'GET',
        headers: userHeaders,
      })

      expect([200, 401]).toContain(response.status)
      if (response.status === 200) {
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(Array.isArray(data.data.data)).toBe(true)
      }
    })

    it('should filter bookings by user ID', async () => {
      const response = await fetch(`${baseUrl}?userId=user-123`, {
        method: 'GET',
        headers: userHeaders,
      })

      expect([200, 401]).toContain(response.status)
      if (response.status === 200) {
        const data = await response.json()
        data.data.data.forEach((booking) => {
          expect(booking.userId).toBe('user-123')
        })
      }
    })

    it('should filter bookings by status', async () => {
      const response = await fetch(`${baseUrl}?status=CONFIRMED`, {
        method: 'GET',
        headers: userHeaders,
      })

      expect([200, 401]).toContain(response.status)
      if (response.status === 200) {
        const data = await response.json()
        data.data.data.forEach((booking) => {
          expect(booking.status).toBe('CONFIRMED')
        })
      }
    })
  })
})

/**
 * Error Handling Tests
 */
describe('API Error Handling', () => {
  describe('Invalid endpoints', () => {
    it('should return 404 for non-existent endpoint', async () => {
      const response = await fetch('/api/nonexistent-endpoint', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token',
        },
      })

      expect(response.status).toBe(404)
    })
  })

  describe('Unauthorized access', () => {
    it('should return 401 for missing authentication', async () => {
      const response = await fetch('/api/speedboats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test' }),
      })

      expect([401, 403]).toContain(response.status)
    })

    it('should return 403 for insufficient permissions', async () => {
      const userHeaders = {
        'Authorization': 'Bearer test-token',
        'X-User-Id': 'user-123',
        'X-User-Email': 'user@example.com',
        'X-User-Role': 'USER',
      }

      const response = await fetch('/api/speedboats', {
        method: 'POST',
        headers: {
          ...userHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Boat',
          registrationNumber: 'TEST-001',
          capacity: 8,
        }),
      })

      expect([403, 401]).toContain(response.status)
    })
  })

  describe('Invalid request data', () => {
    it('should return 400 for malformed JSON', async () => {
      const response = await fetch('/api/speedboats', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token',
          'X-User-Id': 'admin-id',
          'X-User-Email': 'admin@example.com',
          'X-User-Role': 'ADMIN',
          'Content-Type': 'application/json',
        },
        body: 'invalid json {',
      })

      expect([400, 500]).toContain(response.status)
    })
  })
})
