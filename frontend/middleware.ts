import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/auth"

// List of public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up", "/about-us", "/contact", "/faqs", "/privacy", "/terms", "/why-choose-us", "/service-rate"]

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/admin", "/booking"]

export async function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req
  const path = nextUrl.pathname

  // Skip middleware for API routes and static assets
  if (path.startsWith("/api/") || path.match(/\.(jpg|jpeg|png|gif|css|js|svg|ico|webp)$/)) {
    return NextResponse.next()
  }

  // Get session for authentication check
  let session = null
  try {
    const authResult = await auth()
    session = authResult
  } catch (error) {
    console.error("Auth middleware error:", error)
  }

  // 1) Redirect authenticated users away from /sign-in and /sign-up
  if ((path === "/sign-in" || path === "/sign-up") && session?.user) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  // 2) Protect routes that require authentication
  const isProtectedRoute = PROTECTED_ROUTES.some(route => path.startsWith(route))
  if (isProtectedRoute && !session?.user) {
    const callbackUrl = `${nextUrl.pathname}${nextUrl.search}`
    const url = new URL("/sign-in", nextUrl)
    url.searchParams.set("callbackUrl", callbackUrl)
    return NextResponse.redirect(url)
  }

  // 3) Enforce ADMIN role on /admin routes
  if (path.startsWith("/admin") && session?.user) {
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/Denied", nextUrl))
    }
  }

  // 4) Prevent access if user is disabled
  if (session?.user && (session.user as any).disabled) {
    return NextResponse.redirect(new URL("/sign-in?error=UserDisabled", nextUrl))
  }

  // 5) Protect email verification page - redirect if already verified
  if (path === "/verify-email" && session?.user && session.user.email) {
    // Check if email is already verified
    if (session.user.emailVerified) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl))
    }
  }

  return NextResponse.next()
}

export const config = {
  // Apply middleware to all routes except static assets and api
  matcher: [
    "/((?!_next|.*\\.).*)", // Match all routes except Next.js internals and static files
  ],
}
