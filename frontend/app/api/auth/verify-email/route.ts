import { NextRequest, NextResponse } from "next/server"
import { verifyEmailToken } from "@/lib/email"
import { db } from "@/lib/db"
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting: 5 requests per 15 minutes
    const isRateLimited = await rateLimit(req, { window: 900, limit: 5 })
    if (isRateLimited) {
      return NextResponse.json(
        { success: false, error: "Too many verification attempts. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(req, { window: 900, limit: 5 }),
        }
      )
    }

    const { email, token } = await req.json()

    if (!email || !token) {
      return NextResponse.json(
        { success: false, error: "Email and token are required" },
        { status: 400 }
      )
    }

    // Verify the token and update user's emailVerified
    await verifyEmailToken(email, token)

    return NextResponse.json(
      { success: true, message: "Email verified successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Email verification error:", error)
    
    if (error instanceof Error && error.message.includes("expired")) {
      return NextResponse.json(
        { success: false, error: "Verification token has expired" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Invalid or expired token" },
      { status: 400 }
    )
  }
}

/**
 * Resend verification email
 */
export async function PUT(req: NextRequest) {
  try {
    // Apply rate limiting: 3 requests per 10 minutes
    const isRateLimited = await rateLimit(req, { window: 600, limit: 3 })
    if (isRateLimited) {
      return NextResponse.json(
        { success: false, error: "Too many resend attempts. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(req, { window: 600, limit: 3 }),
        }
      )
    }

    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, error: "Email is already verified" },
        { status: 400 }
      )
    }

    // Generate new verification token
    const crypto = await import("crypto")
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Delete old tokens and create new one
    await db.verificationToken.deleteMany({ where: { identifier: email } })
    await db.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: verificationTokenExpires,
      },
    })

    // Send verification email
    const { sendVerificationEmail } = await import("@/lib/email")
    await sendVerificationEmail({
      email,
      name: user.name || email,
      token: verificationToken,
    })

    return NextResponse.json(
      { success: true, message: "Verification email sent" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Resend verification email error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to resend verification email" },
      { status: 500 }
    )
  }
}
