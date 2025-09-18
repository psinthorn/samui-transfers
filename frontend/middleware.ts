import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Lightweight middleware that only redirects authenticated users away from /sign-in.
// We avoid importing the central auth config to keep the Edge bundle free of Node-only deps (e.g., bcrypt).
export default function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req
  const path = nextUrl.pathname

  // Detect presence of an Auth.js/NextAuth session cookie (v4/v5, dev/prod names)
  const hasSessionCookie =
    cookies.has("next-auth.session-token") ||
    cookies.has("__Secure-next-auth.session-token") ||
    cookies.has("authjs.session-token") ||
    cookies.has("__Secure-authjs.session-token")

  // 1) Redirect authenticated users away from /sign-in
  if (path === "/sign-in") {
    if (hasSessionCookie) {
      const url = new URL("/dashboard", nextUrl)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // 2) Protect /dashboard, /admin, and /booking routes (auth required)
  const isProtected = path.startsWith("/dashboard") || path.startsWith("/admin") || path.startsWith("/booking")
  if (isProtected && !hasSessionCookie) {
    const callback = `${nextUrl.pathname}${nextUrl.search}`
    const url = new URL(`/sign-in`, nextUrl)
    url.searchParams.set("callbackUrl", callback)
    return NextResponse.redirect(url)
  }

  // 3) Enforce ADMIN role on /admin when authenticated
  if (path.startsWith("/admin") && hasSessionCookie) {
    // role cookie is a lightweight hint set by the client after login
    const role = cookies.get("role")?.value
    if (role && role !== "ADMIN") {
      const url = new URL(`/Denied`, nextUrl)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/sign-in", "/dashboard/:path*", "/admin/:path*", "/booking/:path*"],
}
