# API Testing Guide - Samui Transfers

**Version:** 1.0.0  
**Last Updated:** December 8, 2025

## Overview

This guide provides comprehensive instructions for testing the Samui Transfers API, including setup, running tests, and writing new tests.

## Table of Contents

1. [Setup](#setup)
2. [Running Tests](#running-tests)
3. [Test Structure](#test-structure)
4. [Writing Tests](#writing-tests)
5. [Test Helpers](#test-helpers)
6. [Coverage Reports](#coverage-reports)
7. [CI/CD Integration](#cicd-integration)
8. [Troubleshooting](#troubleshooting)

## Setup

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

The testing dependencies are already configured in `package.json`. Install them:

```bash
npm install
# or
pnpm install
```

### Configuration Files

- **jest.config.js** - Jest configuration for test runner
- **jest.setup.js** - Test environment setup and mocks
- **__tests__/api/helpers.ts** - Reusable test utilities and helpers

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

Monitor file changes and re-run tests automatically:

```bash
npm run test:watch
```

### Run API Tests Only

Execute only integration tests for API endpoints:

```bash
npm run test:api
```

### Generate Coverage Report

Analyze code coverage:

```bash
npm run test:coverage
```

This generates a coverage report in the `coverage/` directory with:
- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

View the HTML report:

```bash
open coverage/lcov-report/index.html
```

## Test Structure

### Directory Organization

```
__tests__/
├── api/
│   ├── integration.test.ts    # Main API integration tests
│   └── helpers.ts              # Test utilities and factories
└── utils/
    └── validation.test.ts       # Utility function tests
```

### Test Naming Convention

- Test files: `*.test.ts` or `*.test.tsx`
- Test suites: Descriptive names in `describe()` blocks
- Test cases: Clear action descriptions in `it()` statements

Example:
```typescript
describe('Speedboat API', () => {
  describe('GET /api/speedboats', () => {
    it('should list all speedboats with pagination', () => {
      // test implementation
    })
  })
})
```

## Writing Tests

### Basic Test Structure

```typescript
describe('Feature Name', () => {
  const baseUrl = '/api/endpoint'
  
  beforeEach(() => {
    // Setup before each test
  })

  afterEach(() => {
    // Cleanup after each test
  })

  it('should perform expected action', async () => {
    // Arrange
    const testData = { /* ... */ }
    
    // Act
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: authHeaders,
    })
    
    // Assert
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
  })
})
```

### API Testing Pattern

```typescript
it('should create a new resource', async () => {
  // 1. Prepare test data
  const newResource = createMockSpeedboat({
    name: 'Test Boat',
  })

  // 2. Make API request
  const response = await makeRequest(
    '/api/speedboats',
    'POST',
    newResource,
    adminHeaders
  )

  // 3. Assert response
  expect(response.status).toBe(201)
  expect(isCreatedResponse(response)).toBe(true)
  expect(isValidSpeedboat(response.body.data)).toBe(true)

  // 4. Verify data
  expect(response.body.data.name).toBe(newResource.name)
})
```

## Test Helpers

### Authentication Headers

```typescript
import {
  adminHeaders,
  staffHeaders,
  userHeaders,
  createAuthHeaders,
} from '__tests__/api/helpers'

// Use predefined headers
const response = await fetch('/api/speedboats', {
  headers: adminHeaders,
})

// Or create custom headers
const customHeaders = createAuthHeaders({
  userId: 'custom-user-123',
  role: 'STAFF',
})
```

### Mock Data Factories

Create consistent test data:

```typescript
import {
  createMockSpeedboat,
  createMockDriver,
  createMockTour,
  createMockEvent,
  createMockRate,
} from '__tests__/api/helpers'

// Create with defaults
const boat = createMockSpeedboat()

// Override specific fields
const customBoat = createMockSpeedboat({
  name: 'Custom Boat Name',
  capacity: 12,
})
```

### API Request Helper

```typescript
import { makeRequest } from '__tests__/api/helpers'

const response = await makeRequest(
  '/speedboats',
  'POST',
  {
    name: 'Test Boat',
    registrationNumber: 'KS-001',
    capacity: 8,
  },
  adminHeaders
)

// Response structure
console.log(response.status)      // HTTP status code
console.log(response.body)        // Response body (JSON or text)
console.log(response.headers)     // Response headers
```

### Validation Helpers

```typescript
import {
  isSuccessResponse,
  isCreatedResponse,
  isErrorResponse,
  isUnauthorized,
  isValidationError,
  hasPaginationStructure,
  isValidSpeedboat,
  isValidDriver,
  isValidRate,
} from '__tests__/api/helpers'

// Check response status
if (isSuccessResponse(response)) {
  // Handle success
}

// Validate response structure
if (isCreatedResponse(response)) {
  expect(response.body.data.id).toBeDefined()
}

// Check pagination
if (hasPaginationStructure(response.body.data)) {
  expect(response.body.data.pagination.page).toBe(1)
}

// Validate entity data
if (isValidSpeedboat(boat)) {
  console.log('Boat data is valid')
}
```

### Utility Functions

```typescript
import {
  isISO8601Date,
  isValidUUID,
  validateFieldTypes,
  sleep,
  retryRequest,
} from '__tests__/api/helpers'

// Date validation
if (isISO8601Date(dateString)) {
  // Valid ISO 8601 format
}

// ID validation
if (isValidUUID(id)) {
  // Valid UUID or CUID format
}

// Field type checking
const errors = validateFieldTypes(obj, {
  name: 'string',
  count: 'number',
  active: 'boolean',
})

// Retry failed requests
const result = await retryRequest(
  () => fetch('/api/endpoint'),
  3,  // max attempts
  100 // delay in ms
)
```

## Test Examples

### Testing CRUD Operations

```typescript
describe('Speedboat CRUD', () => {
  let boatId: string

  it('should create a speedboat', async () => {
    const boat = createMockSpeedboat()
    const response = await makeRequest('/speedboats', 'POST', boat, adminHeaders)
    
    expect(isCreatedResponse(response)).toBe(true)
    boatId = response.body.data.id
  })

  it('should read the created speedboat', async () => {
    const response = await makeRequest(`/speedboats/${boatId}`, 'GET', null, adminHeaders)
    
    expect(isSuccessResponse(response)).toBe(true)
    expect(response.body.data.id).toBe(boatId)
  })

  it('should update the speedboat', async () => {
    const updates = { basePrice: 3000 }
    const response = await makeRequest(`/speedboats/${boatId}`, 'PUT', updates, adminHeaders)
    
    expect(isSuccessResponse(response)).toBe(true)
    expect(response.body.data.basePrice).toBe(3000)
  })

  it('should delete the speedboat', async () => {
    const response = await makeRequest(`/speedboats/${boatId}`, 'DELETE', null, adminHeaders)
    
    expect([200, 204].includes(response.status)).toBe(true)
  })
})
```

### Testing Authorization

```typescript
describe('Authorization', () => {
  const boatData = createMockSpeedboat()

  it('should allow admins to create speedboats', async () => {
    const response = await makeRequest('/speedboats', 'POST', boatData, adminHeaders)
    expect([200, 201].includes(response.status)).toBe(true)
  })

  it('should deny users from creating speedboats', async () => {
    const response = await makeRequest('/speedboats', 'POST', boatData, userHeaders)
    expect(isUnauthorized(response)).toBe(true)
  })

  it('should require authentication', async () => {
    const response = await makeRequest('/speedboats', 'POST', boatData)
    expect([401, 403].includes(response.status)).toBe(true)
  })
})
```

### Testing Pagination

```typescript
describe('Pagination', () => {
  it('should paginate results', async () => {
    const response = await makeRequest(
      '/speedboats?page=1&limit=10',
      'GET',
      null,
      adminHeaders
    )
    
    expect(isSuccessResponse(response)).toBe(true)
    expect(hasPaginationStructure(response.body.data)).toBe(true)
    expect(response.body.data.pagination.limit).toBe(10)
  })

  it('should handle page boundaries', async () => {
    const response = await makeRequest(
      '/speedboats?page=999&limit=10',
      'GET',
      null,
      adminHeaders
    )
    
    // Should return success but with empty data or validation error
    expect([200, 400].includes(response.status)).toBe(true)
  })
})
```

### Testing Error Cases

```typescript
describe('Error Handling', () => {
  it('should validate required fields', async () => {
    const invalidBoat = { name: 'No other fields' }
    const response = await makeRequest('/speedboats', 'POST', invalidBoat, adminHeaders)
    
    expect(isValidationError(response)).toBe(true)
    expect(response.body).toHaveProperty('error')
  })

  it('should handle not found', async () => {
    const response = await makeRequest('/speedboats/nonexistent', 'GET', null, adminHeaders)
    expect(response.status).toBe(404)
  })

  it('should handle server errors gracefully', async () => {
    const response = await makeRequest('/speedboats', 'GET', null, adminHeaders)
    expect([200, 500]).toContain(response.status)
  })
})
```

## Coverage Reports

### Understanding Coverage

- **Statements**: Percentage of code statements executed
- **Branches**: Percentage of conditional branches tested
- **Functions**: Percentage of functions called
- **Lines**: Percentage of code lines executed

### Target Coverage Goals

```
API Endpoints:  90%+ coverage
Business Logic: 85%+ coverage
Utils:          95%+ coverage
Overall:        85%+ coverage
```

### View Coverage Report

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

### Improving Coverage

1. **Identify gaps**: Check the HTML report for red lines
2. **Add tests**: Write tests for uncovered branches
3. **Verify locally**: Run tests before committing

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

### Pre-commit Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
npm test
if [ $? -ne 0 ]; then
  echo "Tests failed. Commit aborted."
  exit 1
fi
```

Make it executable:

```bash
chmod +x .git/hooks/pre-commit
```

## Troubleshooting

### Tests Timeout

If tests timeout, increase Jest timeout:

```typescript
jest.setTimeout(30000) // 30 seconds

it('slow test', async () => {
  // ...
}, 30000)
```

### Module Not Found

Ensure moduleNameMapper in jest.config.js is correct:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

### Next.js Components in Tests

Mock Next.js features in jest.setup.js:

```typescript
jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))
```

### Database Connection Issues

For API tests, ensure the test database is running:

```bash
npm run prisma:seed
npx prisma db push
```

### Async/Await Issues

Always `await` async operations:

```typescript
// ✅ Correct
const response = await fetch(url)

// ❌ Wrong
const response = fetch(url)
```

## Best Practices

### ✅ Do's

- Write descriptive test names
- Use meaningful mock data
- Test both success and failure paths
- Keep tests independent
- Use helpers for common operations
- Test authorization boundaries
- Include edge cases

### ❌ Don'ts

- Don't hardcode IDs in tests
- Don't test implementation details
- Don't make tests interdependent
- Don't use `any` types
- Don't skip flaky tests (fix them)
- Don't test third-party libraries
- Don't leave console.logs in tests

## Next Steps

1. Run `npm test` to execute existing tests
2. Check coverage: `npm run test:coverage`
3. Add new tests for uncovered endpoints
4. Submit tests with each PR

## Support

For issues or questions:
- Review test examples in `__tests__/api/integration.test.ts`
- Check helper functions in `__tests__/api/helpers.ts`
- Consult Jest documentation: https://jestjs.io
