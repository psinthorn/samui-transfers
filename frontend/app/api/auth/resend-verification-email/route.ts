import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, error: "Email already verified" },
        { status: 400 }
      )
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Delete any existing verification tokens for this email
    await db.verificationToken.deleteMany({
      where: { identifier: email },
    })

    // Create new verification token
    await db.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: tokenExpiry,
      },
    })

    // Send verification email
    await sendVerificationEmail({
      email,
      name: user.name || email,
      token: verificationToken,
    })

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully",
    })
  } catch (error) {
    console.error("Resend verification email error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to resend verification email" },
      { status: 500 }
    )
  }
}
