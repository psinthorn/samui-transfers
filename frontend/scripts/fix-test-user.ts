import { db } from "@/lib/db"

async function fixTestUser() {
  try {
    console.log("Updating test user...")

    const updated = await db.user.update({
      where: { email: "adminx@admin.com" },
      data: {
        emailVerified: new Date(), // Set to now
        disabled: false // Ensure not disabled
      }
    })

    console.log("✅ User updated successfully:")
    console.log({
      email: updated.email,
      emailVerified: updated.emailVerified,
      disabled: updated.disabled,
      role: updated.role
    })
  } catch (error) {
    console.error("❌ Error updating user:", (error as any).message)
  }
}

fixTestUser()
