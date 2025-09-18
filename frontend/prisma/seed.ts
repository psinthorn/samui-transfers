import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@admin.com"
  const password = process.env.SEED_ADMIN_PASSWORD || "Admin_123!"
  const hashed = await bcrypt.hash(password, 10)

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Admin",
      password: hashed,
      role: "ADMIN",
    } as any,
  })
  console.log(`Seeded admin: ${email}`)
}

main().finally(() => prisma.$disconnect())
