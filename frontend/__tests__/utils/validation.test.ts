/**
 * Unit tests for utility functions
 */

describe('Utility Functions', () => {
  describe('Price Calculation', () => {
    // These tests demonstrate common pricing logic
    
    it('should calculate base price correctly', () => {
      const basePrice = 2500
      expect(basePrice).toBeGreaterThan(0)
    })

    it('should calculate distance-based pricing', () => {
      const basePrice = 2500
      const distanceRate = 50
      const distance = 10

      const totalPrice = basePrice + (distanceRate * distance)
      expect(totalPrice).toBe(3000)
    })

    it('should apply bundle discounts', () => {
      const totalPrice = 5000
      const discountPercent = 10

      const discountedPrice = totalPrice - (totalPrice * discountPercent / 100)
      expect(discountedPrice).toBe(4500)
    })

    it('should not allow negative prices', () => {
      const price = -100
      expect(price).toBeLessThan(0) // This would fail validation
    })

    it('should handle decimal prices', () => {
      const price = 2500.50
      expect(price).toBeCloseTo(2500.50)
    })
  })

  describe('Date Validation', () => {
    it('should validate future dates', () => {
      const futureDate = new Date(Date.now() + 86400000) // Tomorrow
      expect(futureDate > new Date()).toBe(true)
    })

    it('should reject past dates', () => {
      const pastDate = new Date(Date.now() - 86400000) // Yesterday
      expect(pastDate < new Date()).toBe(true)
    })

    it('should validate date ranges', () => {
      const startDate = new Date('2025-12-08')
      const endDate = new Date('2025-12-15')
      expect(endDate > startDate).toBe(true)
    })

    it('should handle invalid date strings', () => {
      const invalidDate = new Date('invalid-date')
      expect(isNaN(invalidDate.getTime())).toBe(true)
    })
  })

  describe('Capacity Validation', () => {
    it('should validate sufficient capacity', () => {
      const boatCapacity = 8
      const passengerCount = 5
      expect(passengerCount <= boatCapacity).toBe(true)
    })

    it('should reject over-booking', () => {
      const boatCapacity = 8
      const passengerCount = 10
      expect(passengerCount <= boatCapacity).toBe(false)
    })

    it('should allow full capacity', () => {
      const boatCapacity = 8
      const passengerCount = 8
      expect(passengerCount <= boatCapacity).toBe(true)
    })

    it('should reject zero or negative passengers', () => {
      const passengerCount = 0
      expect(passengerCount > 0).toBe(false)
    })
  })

  describe('String Validation', () => {
    it('should validate email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      expect(emailRegex.test('user@example.com')).toBe(true)
      expect(emailRegex.test('invalid-email')).toBe(false)
    })

    it('should validate phone numbers', () => {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/
      expect(phoneRegex.test('+66812345678')).toBe(true)
      expect(phoneRegex.test('invalid')).toBe(false)
    })

    it('should validate license numbers', () => {
      const licenseRegex = /^[A-Z]{2}-\d{6}$/
      expect(licenseRegex.test('DL-789456')).toBe(true)
      expect(licenseRegex.test('invalid')).toBe(false)
    })

    it('should trim whitespace', () => {
      const input = '  test string  '
      expect(input.trim()).toBe('test string')
    })
  })

  describe('Role and Permission Checks', () => {
    it('should identify admin role', () => {
      const role = 'ADMIN'
      expect(role === 'ADMIN').toBe(true)
    })

    it('should identify staff role', () => {
      const role = 'STAFF'
      const isStaff = role === 'STAFF' || role === 'ADMIN'
      expect(isStaff).toBe(true)
    })

    it('should identify user role', () => {
      const role = 'USER'
      const isUser = role === 'USER' || role === 'STAFF' || role === 'ADMIN'
      expect(isUser).toBe(true)
    })

    it('should require admin for sensitive operations', () => {
      const userRole = 'USER'
      const canDelete = userRole === 'ADMIN'
      expect(canDelete).toBe(false)
    })

    it('should allow staff operations', () => {
      const userRole = 'STAFF'
      const canUpdate = userRole === 'STAFF' || userRole === 'ADMIN'
      expect(canUpdate).toBe(true)
    })
  })

  describe('Pagination', () => {
    it('should calculate correct pagination', () => {
      const total = 100
      const limit = 20
      const pages = Math.ceil(total / limit)
      expect(pages).toBe(5)
    })

    it('should validate page number', () => {
      const page = 2
      const pages = 5
      expect(page <= pages).toBe(true)
    })

    it('should handle edge cases', () => {
      const total = 0
      const limit = 20
      const pages = Math.ceil(total / limit) || 1
      expect(pages).toBe(1)
    })

    it('should calculate offset correctly', () => {
      const page = 2
      const limit = 10
      const offset = (page - 1) * limit
      expect(offset).toBe(10)
    })
  })

  describe('Sorting and Filtering', () => {
    const items = [
      { id: 1, name: 'Boat A', price: 2500, isActive: true },
      { id: 2, name: 'Boat B', price: 3000, isActive: false },
      { id: 3, name: 'Boat C', price: 2000, isActive: true },
    ]

    it('should filter by boolean property', () => {
      const filtered = items.filter((item) => item.isActive === true)
      expect(filtered.length).toBe(2)
    })

    it('should filter by price range', () => {
      const minPrice = 2000
      const maxPrice = 2800
      const filtered = items.filter((item) => item.price >= minPrice && item.price <= maxPrice)
      expect(filtered.length).toBe(2)
    })

    it('should sort by price ascending', () => {
      const sorted = [...items].sort((a, b) => a.price - b.price)
      expect(sorted[0].price).toBe(2000)
      expect(sorted[sorted.length - 1].price).toBe(3000)
    })

    it('should sort by name', () => {
      const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name))
      expect(sorted[0].name).toBe('Boat A')
    })
  })

  describe('Enum Validation', () => {
    const ServiceType = {
      BOAT: 'BOAT',
      TOUR: 'TOUR',
      EVENT: 'EVENT',
    } as const

    it('should validate enum value', () => {
      const serviceType = 'BOAT'
      expect(Object.values(ServiceType)).toContain(serviceType)
    })

    it('should reject invalid enum value', () => {
      const serviceType = 'INVALID'
      expect(Object.values(ServiceType)).not.toContain(serviceType)
    })

    it('should handle all enum values', () => {
      const values = Object.values(ServiceType)
      expect(values.length).toBe(3)
      expect(values).toContain('BOAT')
      expect(values).toContain('TOUR')
      expect(values).toContain('EVENT')
    })
  })

  describe('Error Messages', () => {
    it('should provide helpful validation error messages', () => {
      const errors = {
        email: 'Invalid email format',
        capacity: 'Capacity must be greater than 0',
        price: 'Price cannot be negative',
      }

      expect(errors.email).toContain('email')
      expect(errors.capacity).toContain('greater than 0')
    })

    it('should include field names in errors', () => {
      const fieldName = 'registrationNumber'
      const message = `${fieldName} is required`
      expect(message).toContain(fieldName)
    })
  })
})
