/**
 * OpenAPI 3.0 Specification for Samui Transfers API
 * Generated: December 8, 2025
 * Base URL: /api
 */

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Samui Transfers API',
    version: '1.0.0',
    description: 'Comprehensive API for managing speedboat transfers, tours, events, and bookings',
    contact: {
      name: 'API Support',
      url: 'https://samui-transfers.com',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'Production API',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token in Authorization header',
      },
    },
    schemas: {
      Speedboat: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          registrationNumber: { type: 'string' },
          capacity: { type: 'integer' },
          basePrice: { type: 'number' },
          location: { type: 'string' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      TourPackage: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          duration: { type: 'integer', description: 'Duration in minutes' },
          minGroupSize: { type: 'integer' },
          maxGroupSize: { type: 'integer' },
          isPublished: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      SpecialEvent: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          eventDate: { type: 'string', format: 'date-time' },
          maxAttendees: { type: 'integer' },
          status: { type: 'string', enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          serviceType: { type: 'string', enum: ['TRANSFER', 'BOAT', 'TOUR', 'EVENT', 'PACKAGE'] },
          status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] },
          paymentStatus: { type: 'string', enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] },
          paymentAmount: { type: 'number' },
          isBundle: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Driver: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          licenseNumber: { type: 'string' },
          licenseExpiry: { type: 'string', format: 'date' },
          status: { type: 'string', enum: ['available', 'busy', 'offline', 'deleted'] },
          isBoatOperator: { type: 'boolean' },
          isTourGuide: { type: 'boolean' },
          acceptingRides: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' },
          message: { type: 'string' },
          error: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              data: { type: 'array' },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                  total: { type: 'integer' },
                  pages: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    '/speedboats': {
      get: {
        tags: ['Speedboats'],
        summary: 'List all speedboats',
        description: 'Retrieve a paginated list of speedboats with optional filtering',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'location', in: 'query', schema: { type: 'string' } },
          { name: 'minCapacity', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          200: {
            description: 'Speedboats retrieved successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } },
          },
          500: { description: 'Server error' },
        },
      },
      post: {
        tags: ['Speedboats'],
        summary: 'Create a new speedboat',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'registrationNumber', 'capacity'],
                properties: {
                  name: { type: 'string' },
                  registrationNumber: { type: 'string' },
                  capacity: { type: 'integer' },
                  location: { type: 'string' },
                  basePrice: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Speedboat created successfully' },
          400: { description: 'Invalid request data' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/speedboats/{id}': {
      get: {
        tags: ['Speedboats'],
        summary: 'Get speedboat details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Speedboat retrieved successfully' },
          404: { description: 'Speedboat not found' },
        },
      },
      put: {
        tags: ['Speedboats'],
        summary: 'Update speedboat',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: {
          200: { description: 'Speedboat updated successfully' },
          404: { description: 'Speedboat not found' },
        },
      },
      delete: {
        tags: ['Speedboats'],
        summary: 'Delete speedboat (soft delete)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Speedboat deleted successfully' },
          404: { description: 'Speedboat not found' },
        },
      },
    },
    '/drivers': {
      get: {
        tags: ['Drivers'],
        summary: 'List all drivers',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'isBoatOperator', in: 'query', schema: { type: 'boolean' } },
          { name: 'isTourGuide', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'Drivers retrieved successfully' },
          500: { description: 'Server error' },
        },
      },
      post: {
        tags: ['Drivers'],
        summary: 'Register a new driver',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'licenseNumber'],
                properties: {
                  userId: { type: 'string' },
                  licenseNumber: { type: 'string' },
                  licenseExpiry: { type: 'string', format: 'date' },
                  isBoatOperator: { type: 'boolean' },
                  isTourGuide: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Driver registered successfully' },
          400: { description: 'Invalid request data' },
          409: { description: 'License already registered' },
        },
      },
    },
    '/drivers/{id}': {
      get: {
        tags: ['Drivers'],
        summary: 'Get driver details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Driver retrieved successfully' },
          404: { description: 'Driver not found' },
        },
      },
      patch: {
        tags: ['Drivers'],
        summary: 'Update driver information',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: {
          200: { description: 'Driver updated successfully' },
          404: { description: 'Driver not found' },
        },
      },
      delete: {
        tags: ['Drivers'],
        summary: 'Delete driver (soft delete)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Driver deleted successfully' },
          404: { description: 'Driver not found' },
        },
      },
    },
    '/bookings/bundle': {
      get: {
        tags: ['Bookings'],
        summary: 'List bundle bookings',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'userId', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Bundle bookings retrieved successfully' },
          500: { description: 'Server error' },
        },
      },
      post: {
        tags: ['Bookings'],
        summary: 'Create multi-service booking bundle',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'services'],
                properties: {
                  userId: { type: 'string' },
                  services: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        serviceType: { type: 'string', enum: ['BOAT', 'TOUR', 'EVENT'] },
                        serviceBookingId: { type: 'string' },
                      },
                    },
                  },
                  bundleDiscount: { type: 'number', description: 'Discount percentage' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Bundle created successfully' },
          400: { description: 'Invalid request data' },
          404: { description: 'Service not found' },
        },
      },
    },
    '/bookings/bundle/{id}': {
      get: {
        tags: ['Bookings'],
        summary: 'Get bundle booking details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Bundle booking retrieved successfully' },
          404: { description: 'Bundle not found' },
        },
      },
      patch: {
        tags: ['Bookings'],
        summary: 'Update bundle booking',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: {
          200: { description: 'Bundle updated successfully' },
          404: { description: 'Bundle not found' },
        },
      },
      delete: {
        tags: ['Bookings'],
        summary: 'Cancel bundle booking',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  cancellationReason: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Bundle cancelled successfully' },
          404: { description: 'Bundle not found' },
        },
      },
    },
    '/service-rates': {
      get: {
        tags: ['Rates'],
        summary: 'List service rates',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'serviceType', in: 'query', schema: { type: 'string' } },
          { name: 'vehicleType', in: 'query', schema: { type: 'string' } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'Service rates retrieved successfully' },
        },
      },
      post: {
        tags: ['Rates'],
        summary: 'Create service rate',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['serviceType', 'vehicleType', 'basePrice', 'distanceRate'],
                properties: {
                  serviceType: { type: 'string' },
                  vehicleType: { type: 'string' },
                  basePrice: { type: 'number' },
                  distanceRate: { type: 'number' },
                  minDistance: { type: 'integer' },
                  maxDistance: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Service rate created successfully' },
          400: { description: 'Invalid request data' },
        },
      },
    },
    '/service-rates/{id}': {
      get: {
        tags: ['Rates'],
        summary: 'Get service rate details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Service rate retrieved successfully' },
          404: { description: 'Service rate not found' },
        },
      },
      put: {
        tags: ['Rates'],
        summary: 'Update service rate',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: {
          200: { description: 'Service rate updated successfully' },
          404: { description: 'Service rate not found' },
        },
      },
      delete: {
        tags: ['Rates'],
        summary: 'Delete service rate',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Service rate deleted successfully' },
          404: { description: 'Service rate not found' },
        },
      },
    },
  },
}

export default openApiSpec
