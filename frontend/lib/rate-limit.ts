import { NextRequest, NextResponse } from "next/server"

// In-memory rate limiter (for development)
// For production, use a proper solution like Upstash Redis or similar
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  window?: number // Time window in seconds (default: 60)
  limit?: number // Max requests per window (default: 5)
}

/**
 * Rate limiting utility for API routes
 * Extract a unique identifier from the request (IP, user ID, email, etc.)
 * 
 * @example
 * const rateLimited = await rateLimit(req, { window: 60, limit: 5 })
 * if (rateLimited) {
 *   return NextResponse.json({ error: "Too many requests" }, { status: 429 })
 * }
 */
export async function rateLimit(
  req: NextRequest,
  options: RateLimitOptions = {}
): Promise<boolean> {
  const { window = 60, limit = 5 } = options

  // Get client IP or identifier
  const identifier =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown"

  const now = Date.now()
  const key = `${identifier}`

  let record = rateLimitStore.get(key)

  // Initialize or reset if window has passed
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + window * 1000,
    })
    return false
  }

  // Increment counter
  record.count += 1

  // Check if limit exceeded
  if (record.count > limit) {
    return true // Rate limited
  }

  return false // Not rate limited
}

/**
 * Rate limit headers for response
 */
export function getRateLimitHeaders(
  req: NextRequest,
  options: RateLimitOptions = {}
) {
  const { window = 60, limit = 5 } = options

  const identifier =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown"

  const key = `${identifier}`
  const record = rateLimitStore.get(key)

  return {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": Math.max(
      0,
      limit - (record?.count ?? 0)
    ).toString(),
    "X-RateLimit-Reset": record?.resetTime
      ? new Date(record.resetTime).toISOString()
      : new Date(Date.now() + window * 1000).toISOString(),
  }
}

/**
 * Middleware wrapper for rate limiting
 */
export async function withRateLimit(
  handler: (req: NextRequest) => Promise<Response>,
  options: RateLimitOptions = {}
) {
  return async (req: NextRequest) => {
    const isRateLimited = await rateLimit(req, options)

    if (isRateLimited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(req, options),
        }
      )
    }

    const response = await handler(req)

    // Add rate limit headers to response
    Object.entries(getRateLimitHeaders(req, options)).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }
}

/**
 * Cleanup old entries periodically
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute
