import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// List of public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up", "/about-us", "/contact", "/faqs", "/privacy", "/terms", "/why-choose-us", "/service-rate"]

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/admin", "/booking"]

export function middleware(req: NextRequest) {
  const { nextUrl } = req
  const path = nextUrl.pathname

  // Skip middleware for API routes and static assets
  if (path.startsWith("/api/") || path.match(/\.(jpg|jpeg|png|gif|css|js|svg|ico|webp)$/)) {
    return NextResponse.next()
  }

  // Get session from cookies (lightweight check without calling auth())
  const sessionCookie = req.cookies.get("next-auth.session-token")?.value || req.cookies.get("__Secure-next-auth.session-token")?.value

  // For protected routes without a session, redirect to sign-in
  const isProtectedRoute = PROTECTED_ROUTES.some(route => path.startsWith(route))
  if (isProtectedRoute && !sessionCookie) {
    const callbackUrl = `${nextUrl.pathname}${nextUrl.search}`
    const url = new URL("/sign-in", nextUrl)
    url.searchParams.set("callbackUrl", callbackUrl)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from /sign-in and /sign-up
  if ((path === "/sign-in" || path === "/sign-up") && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next|.*\\.).*)",
  ],
}
