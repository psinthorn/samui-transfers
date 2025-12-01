import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email"
import bcrypt from "bcryptjs"
import { confirmPasswordSchema } from "@/schemas"
import crypto from "crypto"
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit"

/**
 * Request password reset
 */
export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting: 3 requests per 15 minutes
    const isRateLimited = await rateLimit(req, { window: 900, limit: 3 })
    if (isRateLimited) {
      return NextResponse.json(
        { success: false, error: "Too many password reset requests. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(req, { window: 900, limit: 3 }),
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
      // Don't reveal if email exists for security
      return NextResponse.json(
        { success: true, message: "If an account exists, a password reset link will be sent" },
        { status: 200 }
      )
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store reset token
    await db.verificationToken.create({
      data: {
        identifier: `reset:${email}`,
        token: resetToken,
        expires: resetTokenExpires,
      },
    })

    // Send reset email
    await sendPasswordResetEmail({
      email,
      name: user.name || email,
      token: resetToken,
    })

    return NextResponse.json(
      { success: true, message: "If an account exists, a password reset link will be sent" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Password reset request error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process password reset request" },
      { status: 500 }
    )
  }
}

/**
 * Verify reset token and update password
 */
export async function PUT(req: NextRequest) {
  try {
    // Apply rate limiting: 5 requests per 10 minutes
    const isRateLimited = await rateLimit(req, { window: 600, limit: 5 })
    if (isRateLimited) {
      return NextResponse.json(
        { success: false, error: "Too many password reset attempts. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(req, { window: 600, limit: 5 }),
        }
      )
    }

    const { email, token, password, confirmPassword } = await req.json()

    if (!email || !token || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      )
    }

    // Validate password
    const passwordValidation = confirmPasswordSchema.safeParse({
      password,
      confirmPassword,
    })

    if (!passwordValidation.success) {
      return NextResponse.json(
        { success: false, error: passwordValidation.error.issues[0]?.message || "Invalid password" },
        { status: 400 }
      )
    }

    // Verify reset token
    const resetToken = await db.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: `reset:${email}`,
          token,
        },
      },
    })

    if (!resetToken || resetToken.expires < new Date()) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    // Update user password
    const hashedPassword = await bcrypt.hash(password, 12)
    await db.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    // Delete reset token
    await db.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: `reset:${email}`,
          token,
        },
      },
    })

    return NextResponse.json(
      { success: true, message: "Password reset successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to reset password" },
      { status: 500 }
    )
  }
}
