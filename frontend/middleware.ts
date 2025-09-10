import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/components/utilities/auth'

// Define route patterns and required roles
const roleProtectedRoutes: { pattern: RegExp; roles: string[] }[] = [
  { pattern: /^\/Admin(\/.*)?$/, roles: ['ADMIN'] },
]

export async function middleware(req: NextRequest) {
  const { nextUrl } = req
  const pathname = nextUrl.pathname

  // Only check protected routes
  const protection = roleProtectedRoutes.find(r => r.pattern.test(pathname))
  if (!protection) return NextResponse.next()

  const session = await auth()
  if (!session?.user) {
    const url = new URL('/sign-in', req.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  const userRole = (session.user as any).role || 'USER'
  if (!protection.roles.includes(userRole)) {
    return NextResponse.redirect(new URL('/Denied', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/Admin/:path*'],
}
