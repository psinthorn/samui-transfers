/**
 * Verify all users in the database for development/testing
 * This allows existing test users to log in without requiring email verification
 * 
 * Run with: npx ts-node prisma/verify-all-users.ts
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  try {
    // Get all users without emailVerified
    const usersToVerify = await prisma.user.findMany({
      where: {
        emailVerified: null,
      },
    })

    if (usersToVerify.length === 0) {
      console.log("✅ All users are already verified!")
      return
    }

    console.log(`Found ${usersToVerify.length} unverified users. Verifying...`)

    // Mark all as verified
    const result = await prisma.user.updateMany({
      where: {
        emailVerified: null,
      },
      data: {
        emailVerified: new Date(),
      },
    })

    console.log(`✅ Verified ${result.count} users`)
    console.log("\nVerified users:")
    usersToVerify.forEach((user) => {
      console.log(`  - ${user.email} (${user.name || "No name"})`)
    })
  } catch (error) {
    console.error("❌ Error verifying users:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
