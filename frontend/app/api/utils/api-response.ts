import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Return a successful JSON response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

/**
 * Return an error JSON response
 */
export function errorResponse(
  error: ApiError | Error | string,
  statusCode: number = 500
): NextResponse<ApiResponse> {
  const message = error instanceof Error ? error.message : String(error);
  const details = error instanceof ApiError ? error.details : undefined;

  return NextResponse.json(
    {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
      ...(details && { details }),
    },
    { status: statusCode }
  );
}

/**
 * Handle API errors with proper logging
 */
export function handleApiError(error: any): NextResponse<ApiResponse> {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return errorResponse(error, error.statusCode);
  }

  if (error.code === 'P2025') {
    // Prisma not found error
    return errorResponse(
      new ApiError(404, 'Resource not found'),
      404
    );
  }

  if (error.code === 'P2002') {
    // Prisma unique constraint error
    return errorResponse(
      new ApiError(409, 'Resource already exists'),
      409
    );
  }

  return errorResponse(
    new ApiError(500, 'Internal server error'),
    500
  );
}
