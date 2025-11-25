import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Seed admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@admin.com"
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin_123!"
  const adminHashed = await bcrypt.hash(adminPassword, 10)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      emailVerified: new Date(),
    },
    create: {
      email: adminEmail,
      name: "Admin User",
      password: adminHashed,
      role: "ADMIN",
      emailVerified: new Date(),
    } as any,
  })
  console.log(`✅ Seeded admin: ${adminEmail}`)

  // Seed test users with verified emails
  const testUsers = [
    {
      email: "user@test.com",
      name: "Test User",
      password: "Test_123!",
      role: "USER",
    },
    {
      email: "john@example.com",
      name: "John Doe",
      password: "John_123!",
      role: "USER",
    },
    {
      email: "jane@example.com",
      name: "Jane Smith",
      password: "Jane_123!",
      role: "USER",
    },
  ]

  for (const testUser of testUsers) {
    const hashedPassword = await bcrypt.hash(testUser.password, 10)
    await prisma.user.upsert({
      where: { email: testUser.email },
      update: {
        emailVerified: new Date(),
      },
      create: {
        email: testUser.email,
        name: testUser.name,
        password: hashedPassword,
        role: testUser.role as "USER" | "ADMIN",
        emailVerified: new Date(), // Auto-verified for testing
      } as any,
    })
    console.log(`✅ Seeded user: ${testUser.email}`)
  }

  console.log("\n✨ Database seeding complete!")
}

main().finally(() => prisma.$disconnect())
