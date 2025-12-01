import { NextResponse } from "next/server"

export async function POST() {
  try {
    const { db } = await import("@/lib/db")
    
    console.log("🔧 Updating test user...")

    const updated = await db.user.update({
      where: { email: "adminx@admin.com" },
      data: {
        emailVerified: new Date(),
        disabled: false
      }
    })

    console.log("✅ User updated:", updated)

    return NextResponse.json({
      success: true,
      message: "Test user updated",
      user: {
        email: updated.email,
        emailVerified: updated.emailVerified,
        disabled: updated.disabled,
        role: updated.role
      }
    })
  } catch (error) {
    console.error("❌ Error:", error)
    return NextResponse.json({
      success: false,
      error: (error as any)?.message
    }, { status: 500 })
  }
}
