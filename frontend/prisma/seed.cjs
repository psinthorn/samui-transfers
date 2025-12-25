const { PrismaClient, Prisma } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...\n")

  try {
    // ===== SEED USERS =====
    console.log("👥 Creating users...")

    const email = process.env.SEED_ADMIN_EMAIL || "admin@admin.com"
    const password = process.env.SEED_ADMIN_PASSWORD || "Admin_123!"
    const hashed = await bcrypt.hash(password, 10)

    await prisma.user.upsert({
      where: { email },
      update: { emailVerified: new Date() },
      create: {
        email,
        name: "Admin",
        password: hashed,
        role: "ADMIN",
        emailVerified: new Date(),
      },
    })
    console.log(`✅ Seeded admin: ${email}`)

    const testUsers = [
      { email: "user@test.com", name: "Test User", password: "Test_123!", role: "USER" },
      { email: "john@example.com", name: "John Doe", password: "John_123!", role: "USER" },
      { email: "jane@example.com", name: "Jane Smith", password: "Jane_123!", role: "USER" },
    ]

    for (const testUser of testUsers) {
      const hashedPassword = await bcrypt.hash(testUser.password, 10)
      await prisma.user.upsert({
        where: { email: testUser.email },
        update: { emailVerified: new Date() },
        create: {
          email: testUser.email,
          name: testUser.name,
          password: hashedPassword,
          role: testUser.role,
          emailVerified: new Date(),
        },
      })
    }
    console.log(`✅ Created ${testUsers.length} test users`)

    // ===== SEED CHATBOT CONTEXT =====
    console.log("\n🤖 Creating chatbot context...")

    const legacyContext = `# Welcome to Samui Transfers #
Welcome to Samui-Transfers.com, your trusted local transfer service on Koh Samui, Thailand.

# Our Mission #
At Samui Transfers, our mission is to make your journey smooth and stress-free.

# Service Rate #
- Start from 350 THB
- After 5 km calculate based on distance
- Free cancellation up to 24 hours before your transfer
- No hidden fees
- 24/7 customer support`

    const locales = ["en", "th"]
    const agents = ["ai-agent-default", "ai-agent-assistant"]

    for (const agent of agents) {
      for (const locale of locales) {
        await prisma.chatbotContext.upsert({
          where: { key_locale: { key: agent, locale } },
          update: { content: legacyContext },
          create: {
            key: agent,
            locale,
            content: legacyContext,
            title: `${agent} - ${locale}`,
            enabled: true,
          },
        })
      }
    }
    console.log(`✅ Created ${agents.length * locales.length} chatbot contexts`)

    // ===== SEED PAYMENT GATEWAYS =====
    console.log("💳 Creating payment gateways...")

    await prisma.paymentGateway.upsert({
      where: { type: "stripe" },
      update: { enabled: true },
      create: { type: "stripe", displayName: "Stripe", enabled: true },
    })

    await prisma.paymentGateway.upsert({
      where: { type: "paypal" },
      update: { enabled: true },
      create: { type: "paypal", displayName: "PayPal", enabled: true },
    })

    await prisma.paymentGateway.upsert({
      where: { type: "bank_transfer" },
      update: { enabled: true },
      create: { type: "bank_transfer", displayName: "Bank Transfer", enabled: true },
    })
    console.log(`✅ Created 3 payment gateways`)

    // ===== SEED VEHICLES =====
    console.log("\n🚗 Creating vehicles...")

    // Delete existing to clean slate
    await prisma.eventBooking.deleteMany()
    await prisma.eventRate.deleteMany()
    await prisma.specialEvent.deleteMany()
    await prisma.tourBooking.deleteMany()
    await prisma.tourSchedule.deleteMany()
    await prisma.tourLocation.deleteMany()
    await prisma.tourRate.deleteMany()
    await prisma.tourPackage.deleteMany()
    await prisma.speedboatBooking.deleteMany()
    await prisma.speedboatCaptainAssignment.deleteMany()
    await prisma.speedboatRate.deleteMany()
    await prisma.speedboat.deleteMany()
    await prisma.serviceRate.deleteMany()
    await prisma.vehicle.deleteMany()

    const vehiclesData = [
      {
        name: "Toyota Commuter - Minibus A",
        vehicleType: "minibus",
        capacity: 10,
        homePort: "Koh Samui Airport",
        registrationNumber: "กข-1234",
        color: "White",
        yearOfManufacture: 2023,
        status: "AVAILABLE",
        isActive: true,
        fuelType: "Diesel",
        fuelCapacity: "100",
        mileage: 5000,
      },
      {
        name: "Toyota Commuter - Minibus B",
        vehicleType: "minibus",
        capacity: 10,
        homePort: "Koh Samui Airport",
        registrationNumber: "กข-1235",
        color: "White",
        yearOfManufacture: 2023,
        status: "AVAILABLE",
        isActive: true,
        fuelType: "Diesel",
        fuelCapacity: "100",
        mileage: 4800,
      },
      {
        name: "Toyota Commuter - Minibus C",
        vehicleType: "minibus",
        capacity: 10,
        homePort: "Nathon Pier",
        registrationNumber: "กข-1236",
        color: "White",
        yearOfManufacture: 2022,
        status: "AVAILABLE",
        isActive: true,
        fuelType: "Diesel",
        fuelCapacity: "100",
        mileage: 12000,
      },
      {
        name: "Toyota Fortuner - SUV A",
        vehicleType: "suv",
        capacity: 4,
        homePort: "Koh Samui Airport",
        registrationNumber: "กข-2001",
        color: "Black",
        yearOfManufacture: 2023,
        status: "AVAILABLE",
        isActive: true,
        fuelType: "Diesel",
        fuelCapacity: "80",
        mileage: 3500,
      },
      {
        name: "Toyota Fortuner - SUV B",
        vehicleType: "suv",
        capacity: 4,
        homePort: "Lamai Beach",
        registrationNumber: "กข-2002",
        color: "Black",
        yearOfManufacture: 2023,
        status: "AVAILABLE",
        isActive: true,
        fuelType: "Diesel",
        fuelCapacity: "80",
        mileage: 2800,
      },
      {
        name: "Toyota Fortuner - SUV C",
        vehicleType: "suv",
        capacity: 4,
        homePort: "Nathon Pier",
        registrationNumber: "กข-2003",
        color: "Silver",
        yearOfManufacture: 2022,
        status: "AVAILABLE",
        isActive: true,
        fuelType: "Diesel",
        fuelCapacity: "80",
        mileage: 8500,
      },
      {
        name: "Toyota Camry - Sedan A",
        vehicleType: "sedan",
        capacity: 4,
        homePort: "Koh Samui Airport",
        registrationNumber: "กข-3001",
        color: "White",
        yearOfManufacture: 2023,
        status: "AVAILABLE",
        isActive: true,
        fuelType: "Petrol",
        fuelCapacity: "70",
        mileage: 2000,
      },
      {
        name: "Toyota Camry - Sedan B",
        vehicleType: "sedan",
        capacity: 4,
        homePort: "Lamai Beach",
        registrationNumber: "กข-3002",
        color: "Silver",
        yearOfManufacture: 2022,
        status: "AVAILABLE",
        isActive: true,
        fuelType: "Petrol",
        fuelCapacity: "70",
        mileage: 10500,
      },
      {
        name: "Toyota Hilux - Pickup A",
        vehicleType: "pickup",
        capacity: 5,
        homePort: "Koh Samui Airport",
        registrationNumber: "กข-4001",
        color: "Silver",
        yearOfManufacture: 2023,
        status: "AVAILABLE",
        isActive: true,
        fuelType: "Diesel",
        fuelCapacity: "85",
        mileage: 4200,
      },
    ]

    const vehicles = []
    for (const data of vehiclesData) {
      const vehicle = await prisma.vehicle.create({ data })
      vehicles.push(vehicle)
    }
    console.log(`✅ Created ${vehicles.length} vehicles`)

    // ===== SEED SERVICE RATES =====
    console.log("💰 Creating service rates...")

    const serviceRatesData = [
      {
        vehicleType: "minibus",
        basePrice: "800",
        distanceRate: "15",
        minDistance: 5,
        description: "Standard minibus transfer for groups",
        isActive: true,
      },
      {
        vehicleType: "suv",
        basePrice: "600",
        distanceRate: "12",
        minDistance: 5,
        description: "Comfortable SUV transfer for up to 4 passengers",
        isActive: true,
      },
      {
        vehicleType: "sedan",
        basePrice: "500",
        distanceRate: "10",
        minDistance: 5,
        description: "Standard sedan transfer",
        isActive: true,
      },
      {
        vehicleType: "pickup",
        basePrice: "550",
        distanceRate: "11",
        minDistance: 5,
        description: "Pickup truck with cargo space",
        isActive: true,
      },
    ]

    const serviceRates = []
    for (const data of serviceRatesData) {
      const rate = await prisma.serviceRate.create({ data })
      serviceRates.push(rate)
    }
    console.log(`✅ Created ${serviceRates.length} service rates`)

    // ===== SEED SPEEDBOATS & SPEEDBOAT RATES =====
    console.log("🚤 Creating speedboats...")

    const speedboatsData = [
      {
        name: "Express Phangan",
        boatType: "6-person",
        capacity: 6,
        crewSize: 2,
        color: "White",
        registrationNumber: "ทะ-3456",
        homePort: "Koh Samui Marina",
        status: "AVAILABLE",
        fuelType: "Petrol",
        fuelCapacity: "150",
      },
      {
        name: "Island Explorer",
        boatType: "12-person",
        capacity: 12,
        crewSize: 2,
        color: "Blue",
        registrationNumber: "ทะ-3457",
        homePort: "Nathon Pier",
        status: "AVAILABLE",
        fuelType: "Diesel",
        fuelCapacity: "200",
      },
      {
        name: "Luxury Cruiser",
        boatType: "luxury",
        capacity: 8,
        crewSize: 3,
        color: "Black",
        registrationNumber: "ทะ-3458",
        homePort: "Koh Samui Marina",
        status: "AVAILABLE",
        fuelType: "Diesel",
        fuelCapacity: "180",
      },
    ]

    const speedboats = []
    for (const data of speedboatsData) {
      const boat = await prisma.speedboat.create({ data })
      speedboats.push(boat)
    }
    console.log(`✅ Created ${speedboats.length} speedboats`)

    console.log("⚡ Creating speedboat rates...")

    const speedboatRatesData = [
      {
        speedboatId: speedboats[0].id,
        serviceType: "ISLAND_HOPPING",
        duration: 360,
        basePrice: "2500",
        pricePerPerson: "300",
        minCapacity: 2,
        maxCapacity: 6,
      },
      {
        speedboatId: speedboats[1].id,
        serviceType: "DAY_TRIP",
        duration: 480,
        basePrice: "4000",
        pricePerPerson: "350",
        minCapacity: 4,
        maxCapacity: 12,
      },
      {
        speedboatId: speedboats[2].id,
        serviceType: "SPECIAL_EVENT",
        duration: 300,
        basePrice: "5500",
        pricePerPerson: "500",
        minCapacity: 4,
        maxCapacity: 8,
      },
    ]

    const speedboatRates = []
    for (const data of speedboatRatesData) {
      const rate = await prisma.speedboatRate.create({ data })
      speedboatRates.push(rate)
    }
    console.log(`✅ Created ${speedboatRates.length} speedboat rates`)

    // ===== SEED TOUR PACKAGES & TOUR RATES =====
    console.log("🎫 Creating tour packages...")

    const tourPackagesData = [
      {
        name: "Koh Samui City Tour",
        slug: "koh-samui-city-tour",
        description: "Explore the vibrant city center, local markets, and iconic landmarks",
        summary: "Full day exploration of Koh Samui's main attractions",
        tourType: "CULTURAL",
        duration: 240,
        durationDays: 1,
        minGroupSize: 2,
        maxGroupSize: 10,
        defaultGroupSize: 5,
        islandsCovered: ["Koh Samui"],
        departureLocation: "Koh Samui Town",
        returnLocation: "Koh Samui Town",
        availableDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
        departureTime: "09:00",
        returnTime: "13:00",
        includedServices: ["GUIDE", "TRANSPORTATION", "MEALS"],
        isPublished: true,
        isActive: true,
      },
      {
        name: "Big Buddha & Waterfall",
        slug: "big-buddha-waterfall",
        description: "Visit the iconic Big Buddha temple and the beautiful Namuang waterfall",
        summary: "Temple and nature exploration",
        tourType: "CULTURAL",
        duration: 360,
        durationDays: 1,
        minGroupSize: 2,
        maxGroupSize: 12,
        defaultGroupSize: 6,
        islandsCovered: ["Koh Samui"],
        departureLocation: "Koh Samui Airport",
        returnLocation: "Koh Samui Airport",
        availableDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
        departureTime: "08:00",
        returnTime: "14:00",
        includedServices: ["GUIDE", "TRANSPORTATION", "MEALS", "INSURANCE"],
        isPublished: true,
        isActive: true,
      },
      {
        name: "Island Hopping Adventure",
        slug: "island-hopping",
        description: "Visit multiple islands including Koh Phangan and Koh Tao with snorkeling",
        summary: "Multi-island boat adventure",
        tourType: "ADVENTURE",
        duration: 480,
        durationDays: 1,
        minGroupSize: 4,
        maxGroupSize: 20,
        defaultGroupSize: 10,
        islandsCovered: ["Koh Samui", "Koh Phangan", "Koh Tao"],
        departureLocation: "Nathon Pier",
        returnLocation: "Nathon Pier",
        availableDays: ["TUESDAY", "THURSDAY", "SATURDAY"],
        departureTime: "07:00",
        returnTime: "15:00",
        includedServices: ["GUIDE", "MEALS", "SNORKEL_GEAR", "INSURANCE", "TRANSPORTATION"],
        isPublished: true,
        isActive: true,
      },
      {
        name: "Sunset Cruise Experience",
        slug: "sunset-cruise",
        description: "Romantic sunset cruise with dinner and drinks",
        summary: "Evening sunset experience on the water",
        tourType: "LUXURY",
        duration: 180,
        durationDays: 1,
        minGroupSize: 2,
        maxGroupSize: 8,
        defaultGroupSize: 4,
        islandsCovered: ["Koh Samui"],
        departureLocation: "Koh Samui Marina",
        returnLocation: "Koh Samui Marina",
        availableDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
        departureTime: "17:30",
        returnTime: "20:30",
        includedServices: ["MEALS", "GUIDE", "TRANSPORTATION"],
        isPublished: true,
        isActive: true,
      },
    ]

    const tourPackages = []
    for (const data of tourPackagesData) {
      const pkg = await prisma.tourPackage.create({ data })
      tourPackages.push(pkg)
    }
    console.log(`✅ Created ${tourPackages.length} tour packages`)

    console.log("⭐ Creating tour rates...")

    const tourRatesData = [
      { tourPackageId: tourPackages[0].id, minGroupSize: 1, maxGroupSize: 3, pricePerPerson: "900" },
      { tourPackageId: tourPackages[0].id, minGroupSize: 4, maxGroupSize: 10, pricePerPerson: "700" },
      { tourPackageId: tourPackages[1].id, minGroupSize: 1, maxGroupSize: 2, pricePerPerson: "1200" },
      { tourPackageId: tourPackages[1].id, minGroupSize: 3, maxGroupSize: 6, pricePerPerson: "950" },
      { tourPackageId: tourPackages[1].id, minGroupSize: 7, maxGroupSize: 12, pricePerPerson: "850" },
      { tourPackageId: tourPackages[2].id, minGroupSize: 4, maxGroupSize: 8, pricePerPerson: "1400" },
      { tourPackageId: tourPackages[2].id, minGroupSize: 9, maxGroupSize: 20, pricePerPerson: "1100" },
      { tourPackageId: tourPackages[3].id, minGroupSize: 2, maxGroupSize: 4, pricePerPerson: "1800" },
      { tourPackageId: tourPackages[3].id, minGroupSize: 5, maxGroupSize: 8, pricePerPerson: "1400" },
    ]

    const tourRates = []
    for (const data of tourRatesData) {
      const rate = await prisma.tourRate.create({ data })
      tourRates.push(rate)
    }
    console.log(`✅ Created ${tourRates.length} tour rates`)

    // ===== SEED SPECIAL EVENTS & EVENT RATES =====
    console.log("🎉 Creating special events...")

    const specialEventsData = [
      {
        name: "Full Moon Party",
        slug: "full-moon-party",
        description: "The famous Full Moon Party at Haad Rin Beach on Koh Phangan",
        theme: "BEACH_PARTY",
        venueType: "BEACH",
        venueLocation: "Haad Rin Beach, Koh Phangan",
        startDate: new Date("2025-02-12"),
        endDate: new Date("2025-02-13"),
        isRecurring: true,
        recurringPattern: "FULL_MOON",
        maxCapacity: 5000,
        registrationFee: "500",
        includedItems: ["WELCOME_DRINK", "DJ", "TRANSPORTATION"],
        entertainmentType: JSON.stringify(["DJ", "LIVE_BAND"]),
        mealOption: "AVAILABLE",
        barOption: "CASH_BAR",
        isPublished: true,
        isActive: true,
      },
      {
        name: "Green Mango Festival",
        slug: "green-mango-festival",
        description: "Annual music and culture festival in Koh Samui",
        theme: "CULTURAL",
        venueType: "MULTIPLE",
        venueLocation: "Chaweng Beach, Koh Samui",
        startDate: new Date("2025-03-01"),
        endDate: new Date("2025-03-03"),
        isRecurring: true,
        recurringPattern: "MONTHLY",
        maxCapacity: 3000,
        registrationFee: "800",
        includedItems: ["WELCOME_DRINK", "FOOD", "DJ", "TRANSPORTATION"],
        entertainmentType: JSON.stringify(["DJ", "LIVE_BAND", "PERFORMER"]),
        mealOption: "INCLUDED",
        barOption: "OPEN_BAR",
        isPublished: true,
        isActive: true,
      },
      {
        name: "Sunrise Yoga on the Beach",
        slug: "sunrise-yoga",
        description: "Daily sunrise yoga session with ocean views",
        theme: "CULTURAL",
        venueType: "BEACH",
        venueLocation: "Lamai Beach, Koh Samui",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-02-28"),
        isRecurring: true,
        recurringPattern: "CUSTOM",
        maxCapacity: 50,
        registrationFee: "300",
        includedItems: ["GUIDE", "TRANSPORTATION"],
        entertainmentType: JSON.stringify(["PERFORMER"]),
        mealOption: "AVAILABLE",
        barOption: "CASH_BAR",
        isPublished: true,
        isActive: true,
      },
    ]

    const specialEvents = []
    for (const data of specialEventsData) {
      const event = await prisma.specialEvent.create({ data })
      specialEvents.push(event)
    }
    console.log(`✅ Created ${specialEvents.length} special events`)

    console.log("💳 Creating event rates...")

    const eventRatesData = [
      {
        eventId: specialEvents[0].id,
        tierName: "EARLY_BIRD",
        description: "Early bird price (2 weeks before)",
        validFrom: new Date("2025-01-01"),
        validUntil: new Date("2025-01-29"),
        pricePerPerson: "400",
        minimumPartySize: 1,
        isActive: true,
      },
      {
        eventId: specialEvents[0].id,
        tierName: "REGULAR",
        description: "Standard price",
        validFrom: new Date("2025-01-30"),
        validUntil: new Date("2025-02-11"),
        pricePerPerson: "500",
        minimumPartySize: 1,
        isActive: true,
      },
      {
        eventId: specialEvents[0].id,
        tierName: "LAST_MINUTE",
        description: "Last minute price (24 hours before)",
        validFrom: new Date("2025-02-11"),
        validUntil: new Date("2025-02-12"),
        pricePerPerson: "600",
        minimumPartySize: 1,
        isActive: true,
      },
      {
        eventId: specialEvents[1].id,
        tierName: "EARLY_BIRD",
        description: "Early bird price",
        validFrom: new Date("2025-02-01"),
        validUntil: new Date("2025-02-15"),
        pricePerPerson: "600",
        minimumPartySize: 2,
        isActive: true,
      },
      {
        eventId: specialEvents[1].id,
        tierName: "REGULAR",
        description: "Standard price",
        validFrom: new Date("2025-02-16"),
        validUntil: new Date("2025-02-28"),
        pricePerPerson: "800",
        minimumPartySize: 2,
        isActive: true,
      },
      {
        eventId: specialEvents[2].id,
        tierName: "REGULAR",
        description: "Daily pass",
        validFrom: new Date("2025-02-01"),
        validUntil: new Date("2025-02-28"),
        pricePerPerson: "300",
        minimumPartySize: 1,
        isActive: true,
      },
    ]

    const eventRates = []
    for (const data of eventRatesData) {
      const rate = await prisma.eventRate.create({ data })
      eventRates.push(rate)
    }
    console.log(`✅ Created ${eventRates.length} event rates`)

    // Summary
    console.log("\n" + "=".repeat(60))
    console.log("✅ SEED COMPLETED SUCCESSFULLY")
    console.log("=".repeat(60))
    console.log("\n📊 SUMMARY:")
    console.log(`  • Admin User: 1`)
    console.log(`  • Test Users: ${testUsers.length}`)
    console.log(`  • Chatbot Contexts: ${agents.length * locales.length}`)
    console.log(`  • Payment Gateways: 3`)
    console.log(`  • Vehicles: ${vehicles.length}`)
    console.log(`  • Service Rates: ${serviceRates.length}`)
    console.log(`  • Speedboats: ${speedboats.length}`)
    console.log(`  • Speedboat Rates: ${speedboatRates.length}`)
    console.log(`  • Tour Packages: ${tourPackages.length}`)
    console.log(`  • Tour Rates: ${tourRates.length}`)
    console.log(`  • Special Events: ${specialEvents.length}`)
    console.log(`  • Event Rates: ${eventRates.length}`)

    const totalRecords =
      1 +
      testUsers.length +
      agents.length * locales.length +
      3 +
      vehicles.length +
      serviceRates.length +
      speedboats.length +
      speedboatRates.length +
      tourPackages.length +
      tourRates.length +
      specialEvents.length +
      eventRates.length

    console.log(`\n  🎉 TOTAL RECORDS: ${totalRecords}`)
    console.log("\n💾 All data has been saved to the database!")
    console.log("📝 Currency: Thai Baht (THB)")
    console.log("📍 Location: Koh Samui, Thailand")
    console.log("🌟 Status: All services ready for booking!")
  } catch (error) {
    console.error("❌ Seed failed:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
