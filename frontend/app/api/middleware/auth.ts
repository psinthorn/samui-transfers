import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

/**
 * Auth middleware for API routes
 * Validates user session and extracts user context
 */

export interface AuthContext {
  userId: string
  email: string
  role: string
  isAdmin: boolean
  isStaff: boolean
  isUser: boolean
}

/**
 * Parse auth token from request headers
 */
export async function getAuthContext(req: NextRequest): Promise<AuthContext | null> {
  try {
    const headersList = await headers()
    const authHeader = headersList.get('authorization')

    if (!authHeader) {
      return null
    }

    // For now, we'll use a simple approach: extract from Authorization header
    // In production, you'd validate JWT tokens, session cookies, etc.
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return null
    }

    // TODO: Validate token and extract user info from session/JWT
    // This is a placeholder - integrate with your auth system
    // For now, we'll parse from a custom header if available

    const userIdHeader = headersList.get('x-user-id')
    const emailHeader = headersList.get('x-user-email')
    const roleHeader = headersList.get('x-user-role')

    if (!userIdHeader || !emailHeader) {
      return null
    }

    const role = roleHeader || 'USER'

    return {
      userId: userIdHeader,
      email: emailHeader,
      role,
      isAdmin: role === 'ADMIN',
      isStaff: role === 'ADMIN' || role === 'STAFF',
      isUser: true,
    }
  } catch (error) {
    console.error('Auth context error:', error)
    return null
  }
}

/**
 * Require authentication
 * Throws if user is not authenticated
 */
export async function requireAuth(req: NextRequest): Promise<AuthContext> {
  const auth = await getAuthContext(req)

  if (!auth) {
    throw new Error('Unauthorized')
  }

  return auth
}

/**
 * Require specific role
 * Throws if user doesn't have required role
 */
export async function requireRole(
  req: NextRequest,
  requiredRole: 'ADMIN' | 'STAFF' | 'USER'
): Promise<AuthContext> {
  const auth = await requireAuth(req)

  const hasRole =
    (requiredRole === 'ADMIN' && auth.isAdmin) ||
    (requiredRole === 'STAFF' && auth.isStaff) ||
    (requiredRole === 'USER' && auth.isUser)

  if (!hasRole) {
    throw new Error('Forbidden')
  }

  return auth
}

/**
 * Check if user owns resource (for user-specific resources)
 */
export async function requireOwnershipOrAdmin(
  req: NextRequest,
  resourceOwnerId: string
): Promise<AuthContext> {
  const auth = await requireAuth(req)

  if (!auth.isAdmin && auth.userId !== resourceOwnerId) {
    throw new Error('Forbidden')
  }

  return auth
}

/**
 * Wrap API handler with auth requirements
 * Usage: withAuth(handler, 'ADMIN') or withAuth(handler, 'USER')
 */
export function withAuth(
  handler: (req: NextRequest, context: any, auth: AuthContext) => Promise<Response>,
  requiredRole?: 'ADMIN' | 'STAFF' | 'USER'
) {
  return async (req: NextRequest, context: any) => {
    try {
      // Get auth context
      let auth: AuthContext | null = null

      if (requiredRole) {
        auth = await requireRole(req, requiredRole)
      } else {
        auth = await requireAuth(req)
      }

      if (!auth) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized', timestamp: new Date().toISOString() },
          { status: 401 }
        )
      }

      // Call handler with auth context
      return await handler(req, context, auth)
    } catch (error: any) {
      const message = error.message || 'Authorization failed'

      if (message === 'Unauthorized') {
        return NextResponse.json(
          { success: false, error: 'Unauthorized', timestamp: new Date().toISOString() },
          { status: 401 }
        )
      }

      if (message === 'Forbidden') {
        return NextResponse.json(
          { success: false, error: 'Forbidden', timestamp: new Date().toISOString() },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { success: false, error: message, timestamp: new Date().toISOString() },
        { status: 500 }
      )
    }
  }
}

/**
 * Simple wrapper for optional auth
 * Returns auth context if available, but doesn't require it
 */
export function withOptionalAuth(
  handler: (req: NextRequest, context: any, auth: AuthContext | null) => Promise<Response>
) {
  return async (req: NextRequest, context: any) => {
    try {
      const auth = await getAuthContext(req)
      return await handler(req, context, auth)
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message || 'Server error', timestamp: new Date().toISOString() },
        { status: 500 }
      )
    }
  }
}
