import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      console.warn("Resend verification email: Email is required")
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      )
    }

    console.log(`Resend verification email requested for: ${email}`)

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.warn(`Resend verification email: User not found for email: ${email}`)
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      console.warn(`Resend verification email: Email already verified for: ${email}`)
      return NextResponse.json(
        { success: false, error: "Email already verified" },
        { status: 400 }
      )
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    console.log(`Generated new verification token for: ${email}`)

    // Delete any existing verification tokens for this email
    try {
      await db.verificationToken.deleteMany({
        where: { identifier: email },
      })
      console.log(`Deleted old verification tokens for: ${email}`)
    } catch (deleteError) {
      console.error(`Error deleting old tokens for ${email}:`, deleteError)
      // Don't fail if we can't delete old tokens
    }

    // Create new verification token
    try {
      await db.verificationToken.create({
        data: {
          identifier: email,
          token: verificationToken,
          expires: tokenExpiry,
        },
      })
      console.log(`Created new verification token in DB for: ${email}`)
    } catch (createError) {
      console.error(`Error creating verification token for ${email}:`, createError)
      throw new Error(`Failed to create verification token: ${createError}`)
    }

    // Send verification email
    try {
      await sendVerificationEmail({
        email,
        name: user.name || email,
        token: verificationToken,
      })
      console.log(`Successfully sent verification email to: ${email}`)
    } catch (emailError) {
      console.error(`Error sending verification email to ${email}:`, emailError)
      throw new Error(`Failed to send verification email: ${emailError}`)
    }

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully",
    })
  } catch (error) {
    console.error("Resend verification email error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to resend verification email"
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
