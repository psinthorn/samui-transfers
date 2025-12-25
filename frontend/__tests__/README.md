# Testing Documentation Index

**Last Updated:** December 8, 2025

## Quick Links

- **[API Testing Guide](./API_TESTING_GUIDE.md)** - Complete testing setup and execution guide
- **Test Files:**
  - `__tests__/api/integration.test.ts` - API endpoint integration tests
  - `__tests__/api/helpers.ts` - Test utilities and mock factories
  - `__tests__/utils/validation.test.ts` - Utility function tests

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run API tests only
npm run test:api

# Watch mode (re-run on changes)
npm run test:watch
```

## Test Coverage Goals

- **API Endpoints:** 90%+
- **Business Logic:** 85%+
- **Utilities:** 95%+
- **Overall:** 85%+

## Test Categories

### 1. Integration Tests (`__tests__/api/integration.test.ts`)

Comprehensive tests for all API endpoints:

- **Speedboat API** - CRUD operations, filtering, pagination
- **Driver Management** - Registration, updates, filtering
- **Service Rates** - Create, update, delete rates
- **Bookings** - Multi-service bundle operations
- **Error Handling** - Authorization, validation, not found

### 2. Unit Tests (`__tests__/utils/validation.test.ts`)

Tests for utility functions and business logic:

- Price calculations
- Date validation
- Capacity validation
- String validation (email, phone, license)
- Role and permission checks
- Pagination logic
- Sorting and filtering
- Enum validation

### 3. Helper Functions (`__tests__/api/helpers.ts`)

Reusable utilities for tests:

- Authentication header creation
- Mock data factories
- API request wrapper
- Response validators
- Data validation functions
- Retry mechanisms

## Adding New Tests

### Step 1: Create Test File

```typescript
// __tests__/api/new-feature.test.ts
describe('New Feature API', () => {
  it('should work correctly', async () => {
    // test implementation
  })
})
```

### Step 2: Use Helpers

```typescript
import {
  createMockSpeedboat,
  makeRequest,
  adminHeaders,
  isSuccessResponse,
} from './helpers'

const boat = createMockSpeedboat()
const response = await makeRequest('/speedboats', 'POST', boat, adminHeaders)
expect(isSuccessResponse(response)).toBe(true)
```

### Step 3: Run Tests

```bash
npm test
npm run test:coverage
```

## Configuration Files

- **jest.config.js** - Jest configuration
- **jest.setup.js** - Test environment setup
- **tsconfig.json** - TypeScript configuration for tests

## Best Practices

1. **Clear naming** - Describe what the test does
2. **Arrange-Act-Assert** - Structure each test clearly
3. **Mock data** - Use factories for consistency
4. **Independent tests** - Each test should be standalone
5. **Error testing** - Test both success and failure paths
6. **Permissions** - Test authorization boundaries
7. **Edge cases** - Test boundary conditions

## Common Test Patterns

### Testing CRUD Operations

```typescript
it('should create, read, update, delete', async () => {
  // Create
  const createResp = await makeRequest('/endpoint', 'POST', data, headers)
  const id = createResp.body.data.id

  // Read
  const readResp = await makeRequest(`/endpoint/${id}`, 'GET', null, headers)
  expect(isSuccessResponse(readResp)).toBe(true)

  // Update
  const updateResp = await makeRequest(`/endpoint/${id}`, 'PUT', updates, headers)
  expect(isSuccessResponse(updateResp)).toBe(true)

  // Delete
  const deleteResp = await makeRequest(`/endpoint/${id}`, 'DELETE', null, headers)
  expect([200, 204].includes(deleteResp.status)).toBe(true)
})
```

### Testing Authorization

```typescript
it('should enforce authorization', async () => {
  // Admin can do it
  const adminResp = await makeRequest('/admin', 'POST', data, adminHeaders)
  expect([200, 201].includes(adminResp.status)).toBe(true)

  // User cannot
  const userResp = await makeRequest('/admin', 'POST', data, userHeaders)
  expect(isUnauthorized(userResp)).toBe(true)
})
```

### Testing Error Cases

```typescript
it('should validate input', async () => {
  const invalidData = { /* missing required fields */ }
  const response = await makeRequest('/endpoint', 'POST', invalidData, headers)
  expect(isValidationError(response)).toBe(true)
})
```

## Coverage Reports

Generate and view coverage:

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

The report shows:
- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

## Continuous Integration

Tests should pass before:
- Pushing to remote
- Creating pull requests
- Deploying to production

### Pre-commit Hook

```bash
npm test && npm run test:coverage
```

## Troubleshooting

### Tests Failing

1. Check test output for error messages
2. Verify test data is correct
3. Ensure API endpoints exist
4. Check authentication headers
5. Review mock implementations

### Timeout Issues

Increase timeout in jest.config.js or individual tests:

```typescript
jest.setTimeout(30000)

it('slow test', async () => {
  // ...
}, 30000)
```

### Module Not Found

Check moduleNameMapper in jest.config.js points to correct paths.

### Database Issues

Ensure test database is seeded:

```bash
npm run prisma:seed
npx prisma db push
```

## Next Steps

1. Run existing tests: `npm test`
2. Check coverage: `npm run test:coverage`
3. Add tests for new features
4. Maintain 85%+ coverage target
5. Review test failures in CI/CD

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [API Testing Best Practices](https://www.testing-library.com/docs/)

## Summary

Phase 2.20 has delivered:

✅ **Jest Configuration** - Full test environment setup  
✅ **Integration Tests** - 40+ API endpoint tests  
✅ **Unit Tests** - Validation and utility function tests  
✅ **Test Helpers** - Mock factories and request utilities  
✅ **Test Guide** - Comprehensive testing documentation  
✅ **Coverage Reporting** - Code coverage analysis tools  

**Next Phase:** Phase 3 - Advanced Testing & Performance
