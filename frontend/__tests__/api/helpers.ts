/**
 * Test Helper Functions
 * Provides utilities for API testing
 */

export interface TestContext {
  userId: string
  email: string
  role: 'ADMIN' | 'STAFF' | 'USER'
}

export const createAuthHeaders = (context: Partial<TestContext> = {}) => {
  const defaults: TestContext = {
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'USER',
    ...context,
  }

  return {
    'Authorization': 'Bearer test-token-' + context.userId,
    'X-User-Id': defaults.userId,
    'X-User-Email': defaults.email,
    'X-User-Role': defaults.role,
    'Content-Type': 'application/json',
  }
}

export const adminHeaders = createAuthHeaders({ role: 'ADMIN' })
export const staffHeaders = createAuthHeaders({ role: 'STAFF' })
export const userHeaders = createAuthHeaders({ role: 'USER' })

/**
 * Mock data factories
 */
export const createMockSpeedboat = (overrides = {}) => ({
  name: 'Test Boat',
  registrationNumber: `KS-${Math.random().toString(36).substring(7)}`,
  capacity: 8,
  basePrice: 2500,
  location: 'Koh Samui',
  isActive: true,
  ...overrides,
})

export const createMockDriver = (overrides = {}) => ({
  userId: `user-${Math.random().toString(36).substring(7)}`,
  licenseNumber: `DL-${Math.floor(Math.random() * 1000000)}`,
  licenseExpiry: '2026-12-31',
  isBoatOperator: true,
  isTourGuide: false,
  ...overrides,
})

export const createMockTour = (overrides = {}) => ({
  name: 'Island Hopping Tour',
  description: 'Visit 3 beautiful islands',
  duration: 480, // minutes
  maxCapacity: 20,
  basePrice: 1500,
  location: 'Koh Samui',
  isActive: true,
  ...overrides,
})

export const createMockEvent = (overrides = {}) => ({
  name: 'Private Beach Party',
  description: 'Exclusive beach celebration',
  eventDate: new Date(Date.now() + 86400000 * 7).toISOString(),
  capacity: 50,
  basePrice: 5000,
  location: 'Koh Samui',
  isActive: true,
  ...overrides,
})

export const createMockRate = (overrides = {}) => ({
  serviceType: 'BOAT',
  vehicleType: 'speedboat_6person',
  basePrice: 2500,
  distanceRate: 50,
  minDistance: 1,
  maxDistance: 100,
  description: 'Test rate',
  isActive: true,
  ...overrides,
})

/**
 * API Testing Utilities
 */
export const makeRequest = async (
  endpoint: string,
  method: string = 'GET',
  data?: any,
  headers?: Record<string, string>
) => {
  const url = `${endpoint.startsWith('/') ? '' : '/api/'}${endpoint}`
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
    options.body = JSON.stringify(data)
  }

  const response = await fetch(url, options)
  const contentType = response.headers.get('content-type')
  
  let body: any
  if (contentType?.includes('application/json')) {
    body = await response.json()
  } else {
    body = await response.text()
  }

  return {
    status: response.status,
    body,
    headers: response.headers,
  }
}

/**
 * Response validation helpers (use in tests with expect())
 */
export const isSuccessResponse = (response: any) => 
  response.status === 200 && response.body.success === true

export const isCreatedResponse = (response: any) => 
  response.status === 201 && response.body.success === true && response.body.data?.id

export const isErrorResponse = (response: any, statusCode: number) => 
  response.status === statusCode && response.body.success === false

export const isUnauthorized = (response: any) => 
  [401, 403].includes(response.status)

export const isValidationError = (response: any) => 
  [400, 422].includes(response.status)

/**
 * Data validation helpers (use in tests with expect())
 */
export const hasPaginationStructure = (data: any) => 
  data?.data && Array.isArray(data.data) &&
  data?.pagination && 
  data.pagination?.page !== undefined &&
  data.pagination?.limit !== undefined &&
  data.pagination?.total !== undefined &&
  data.pagination?.pages !== undefined

export const isValidSpeedboat = (boat: any) => 
  boat?.id && boat?.name && boat?.registrationNumber && 
  boat?.capacity && boat?.basePrice && boat?.location && 
  boat?.isActive !== undefined

export const isValidDriver = (driver: any) => 
  driver?.id && driver?.userId && driver?.licenseNumber && 
  driver?.isBoatOperator !== undefined

export const isValidRate = (rate: any) => 
  rate?.id && rate?.serviceType && rate?.basePrice > 0

/**
 * Test data cleanup
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const retryRequest = async (
  fn: () => Promise<any>,
  maxAttempts: number = 3,
  delayMs: number = 100
) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxAttempts - 1) throw error
      await sleep(delayMs * Math.pow(2, i))
    }
  }
}

/**
 * Batch testing utilities
 */
export const testEachEndpoint = (
  endpoints: Array<{ method: string; path: string }>,
  testFn: (endpoint: any) => Promise<void>
) => {
  return endpoints.map((endpoint) => ({
    name: `${endpoint.method} ${endpoint.path}`,
    test: () => testFn(endpoint),
  }))
}

/**
 * Assertion helpers (use in tests with expect())
 */
export const isISO8601Date = (dateString: string) => {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/
  return iso8601Regex.test(dateString)
}

export const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const cuidRegex = /^c[a-z0-9]{24}$/
  return uuidRegex.test(uuid) || cuidRegex.test(uuid)
}

export const validateFieldTypes = (
  object: Record<string, any>,
  expectedTypes: Record<string, string>
) => {
  const errors: string[] = []
  Object.entries(expectedTypes).forEach(([field, expectedType]) => {
    const actualType = typeof object[field]
    if (actualType !== expectedType) {
      errors.push(`${field}: expected ${expectedType} but got ${actualType}`)
    }
  })
  return errors.length === 0 ? null : errors
}
