import { NextRequest } from 'next/server'
import { successResponse } from '@/app/api/utils/api-response'
import openApiSpec from '@/app/api/openapi'

/**
 * GET /api/docs/openapi
 * Returns the OpenAPI specification for the API
 */
export async function GET(req: NextRequest) {
  return successResponse(
    openApiSpec,
    'OpenAPI specification retrieved successfully'
  )
}
