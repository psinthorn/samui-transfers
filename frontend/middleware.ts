import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// List of public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up", "/about-us", "/contact", "/faqs", "/privacy", "/terms", "/why-choose-us", "/service-rate", "/Denied", "/forgot-password", "/reset-password", "/verify-email"]

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/admin", "/booking"]

export function middleware(req: NextRequest) {
  const { nextUrl } = req
  const path = nextUrl.pathname

  // Skip middleware for API routes and static assets
  if (path.startsWith("/api/") || path.match(/\.(jpg|jpeg|png|gif|css|js|svg|ico|webp)$/)) {
    return NextResponse.next()
  }

  // Get session token from cookies (both session and JWT tokens)
  // Check multiple possible cookie names for maximum compatibility
  const sessionToken = 
    req.cookies.get("next-auth.session-token")?.value || 
    req.cookies.get("__Secure-next-auth.session-token")?.value ||
    req.cookies.get("next-auth.jwt")?.value ||
    req.cookies.get("__Secure-next-auth.jwt")?.value

  const hasSession = !!sessionToken
  
  if (process.env.DEBUG_AUTH || process.env.NODE_ENV === "development") {
    const allCookies = req.cookies.getAll().map(c => c.name)
    console.log(`[Middleware] Path: ${path}`)
    console.log(`[Middleware] Has session: ${hasSession}`)
    console.log(`[Middleware] Cookie names:`, allCookies)
    if (sessionToken) {
      console.log(`[Middleware] Session token found (${sessionToken.substring(0, 20)}...)`)
    }
  }

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => path === route || path.startsWith(route + "/"))

  // If already on public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes without a session, redirect to sign-in
  const isProtectedRoute = PROTECTED_ROUTES.some(route => path.startsWith(route))
  if (isProtectedRoute && !hasSession) {
    if (process.env.DEBUG_AUTH || process.env.NODE_ENV === "development") {
      console.log(`[Middleware] Protected route without session: ${path}, redirecting to sign-in`)
    }
    const callbackUrl = `${nextUrl.pathname}${nextUrl.search}`
    const url = new URL("/sign-in", nextUrl)
    url.searchParams.set("callbackUrl", callbackUrl)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from /sign-in and /sign-up  
  if ((path === "/sign-in" || path === "/sign-up") && hasSession) {
    if (process.env.DEBUG_AUTH || process.env.NODE_ENV === "development") {
      console.log(`[Middleware] User already authenticated on ${path}, redirecting to /dashboard`)
    }
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next|.*\\.).*)",
  ],
}
