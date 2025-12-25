const { PrismaClient } = require("@prisma/client")
const { Decimal } = require("decimal.js")
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
      update: {
        emailVerified: new Date(),
      },
      create: {
        email,
        name: "Admin",
        password: hashed,
        role: "ADMIN",
        emailVerified: new Date(),
      },
    })
    console.log(`✅ Seeded admin: ${email}`)

    // Seed test users
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
          role: testUser.role,
          emailVerified: new Date(),
        },
      })
      console.log(`✅ Seeded user: ${testUser.email}`)
    }

    // ===== SEED CHATBOT CONTEXT =====
    console.log("\n🤖 Creating chatbot context...")

    const legacyContext = `
# Welcome to Samui Transfers #
Welcome to Samui-Transfers.com, your trusted local transfer service based right here on the beautiful island of Koh Samui, Thailand. As a locally owned and operated company, we specialize in providing safe, reliable, and comfortable transportation for travelers, families, and groups across the island.

# Our Mission #
At Samui Transfers, our mission is to make your journey as smooth and stress-free as possible. We understand that travel can be hectic, which is why we offer reliable and efficient transfer services tailored to your needs.

# Service Rate #
- Start from 350 THB
- After 5 km calculate base on distance
- Free cancellation up to 24 hours before your transfer
- No hidden fees, no extra charges
- 24/7 customer support
`

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

    const paymentGateways = [
      {
        name: "Stripe",
        type: "CARD",
        isActive: true,
      },
      {
        name: "PayPal",
        type: "DIGITAL_WALLET",
        isActive: true,
      },
      {
        name: "Bank Transfer",
        type: "BANK_TRANSFER",
        isActive: true,
      },
    ]

    for (const gateway of paymentGateways) {
      await prisma.paymentGateway.upsert({
        where: { name: gateway.name },
        update: { isActive: gateway.isActive },
        create: gateway,
      })
      console.log(`✅ Seeded PaymentGateway: ${gateway.name}`)
    }

    // ===== SEED VEHICLES =====
    console.log("\n🚗 Creating vehicles...")

    // Delete existing to clean slate
    await prisma.eventBooking.deleteMany()
    await prisma.eventRate.deleteMany()
    await prisma.specialEvent.deleteMany()
    await prisma.tourBooking.deleteMany()
    await prisma.tourSchedule.deleteMany()
    await prisma.tourRate.deleteMany()
    await prisma.tourPackage.deleteMany()
    await prisma.tourLocation.deleteMany()
    await prisma.speedboatBooking.deleteMany()
    await prisma.speedboatCaptainAssignment.deleteMany()
    await prisma.speedboatRate.deleteMany()
    await prisma.speedboat.deleteMany()
    await prisma.serviceRate.deleteMany()
    await prisma.vehicle.deleteMany()

    const vehiclesData = [
      // Minibuses
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
        fuelCapacity: new Decimal("100"),
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
        fuelCapacity: new Decimal("100"),
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
        fuelCapacity: new Decimal("100"),
        mileage: 12000,
      },

      // SUVs
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
        fuelCapacity: new Decimal("80"),
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
        fuelCapacity: new Decimal("80"),
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
        fuelCapacity: new Decimal("80"),
        mileage: 8500,
      },

      // Sedans
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
        fuelCapacity: new Decimal("70"),
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
        fuelCapacity: new Decimal("70"),
        mileage: 10500,
      },

      // Pickup Trucks
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
        fuelCapacity: new Decimal("85"),
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
        basePrice: new Decimal("800"),
        distanceRate: new Decimal("15"),
        minDistance: 5,
        description: "Standard minibus transfer for groups",
        isActive: true,
      },
      {
        vehicleType: "suv",
        basePrice: new Decimal("600"),
        distanceRate: new Decimal("12"),
        minDistance: 5,
        description: "Comfortable SUV transfer for up to 4 passengers",
        isActive: true,
      },
      {
        vehicleType: "sedan",
        basePrice: new Decimal("500"),
        distanceRate: new Decimal("10"),
        minDistance: 5,
        description: "Standard sedan transfer",
        isActive: true,
      },
      {
        vehicleType: "pickup",
        basePrice: new Decimal("550"),
        distanceRate: new Decimal("11"),
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
        fuelCapacity: new Decimal("150"),
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
        fuelCapacity: new Decimal("200"),
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
        fuelCapacity: new Decimal("180"),
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
        basePrice: new Decimal("2500"),
        pricePerPerson: new Decimal("300"),
        minCapacity: 2,
        maxCapacity: 6,
      },
      {
        speedboatId: speedboats[1].id,
        serviceType: "DAY_TRIP",
        duration: 480,
        basePrice: new Decimal("4000"),
        pricePerPerson: new Decimal("350"),
        minCapacity: 4,
        maxCapacity: 12,
      },
      {
        speedboatId: speedboats[2].id,
        serviceType: "SPECIAL_EVENT",
        duration: 300,
        basePrice: new Decimal("5500"),
        pricePerPerson: new Decimal("500"),
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
        islandsCovered: JSON.stringify(["Koh Samui"]),
        departureLocation: "Koh Samui Town",
        returnLocation: "Koh Samui Town",
        availableDays: JSON.stringify(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
        departureTime: "09:00",
        returnTime: "13:00",
        includedServices: JSON.stringify(["GUIDE", "TRANSPORTATION", "MEALS"]),
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
        islandsCovered: JSON.stringify(["Koh Samui"]),
        departureLocation: "Koh Samui Airport",
        returnLocation: "Koh Samui Airport",
        availableDays: JSON.stringify(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
        departureTime: "08:00",
        returnTime: "14:00",
        includedServices: JSON.stringify(["GUIDE", "TRANSPORTATION", "MEALS", "INSURANCE"]),
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
        islandsCovered: JSON.stringify(["Koh Samui", "Koh Phangan", "Koh Tao"]),
        departureLocation: "Nathon Pier",
        returnLocation: "Nathon Pier",
        availableDays: JSON.stringify(["TUESDAY", "THURSDAY", "SATURDAY"]),
        departureTime: "07:00",
        returnTime: "15:00",
        includedServices: JSON.stringify(["GUIDE", "MEALS", "SNORKEL_GEAR", "INSURANCE", "TRANSPORTATION"]),
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
        islandsCovered: JSON.stringify(["Koh Samui"]),
        departureLocation: "Koh Samui Marina",
        returnLocation: "Koh Samui Marina",
        availableDays: JSON.stringify(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
        departureTime: "17:30",
        returnTime: "20:30",
        includedServices: JSON.stringify(["MEALS", "GUIDE", "TRANSPORTATION"]),
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
      {
        tourPackageId: tourPackages[0].id,
        minGroupSize: 1,
        maxGroupSize: 3,
        pricePerPerson: new Decimal("900"),
      },
      {
        tourPackageId: tourPackages[0].id,
        minGroupSize: 4,
        maxGroupSize: 10,
        pricePerPerson: new Decimal("700"),
      },
      {
        tourPackageId: tourPackages[1].id,
        minGroupSize: 1,
        maxGroupSize: 2,
        pricePerPerson: new Decimal("1200"),
      },
      {
        tourPackageId: tourPackages[1].id,
        minGroupSize: 3,
        maxGroupSize: 6,
        pricePerPerson: new Decimal("950"),
      },
      {
        tourPackageId: tourPackages[1].id,
        minGroupSize: 7,
        maxGroupSize: 12,
        pricePerPerson: new Decimal("850"),
      },
      {
        tourPackageId: tourPackages[2].id,
        minGroupSize: 4,
        maxGroupSize: 8,
        pricePerPerson: new Decimal("1400"),
      },
      {
        tourPackageId: tourPackages[2].id,
        minGroupSize: 9,
        maxGroupSize: 20,
        pricePerPerson: new Decimal("1100"),
      },
      {
        tourPackageId: tourPackages[3].id,
        minGroupSize: 2,
        maxGroupSize: 4,
        pricePerPerson: new Decimal("1800"),
      },
      {
        tourPackageId: tourPackages[3].id,
        minGroupSize: 5,
        maxGroupSize: 8,
        pricePerPerson: new Decimal("1400"),
      },
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
        registrationFee: new Decimal("500"),
        includedItems: JSON.stringify(["WELCOME_DRINK", "DJ", "TRANSPORTATION"]),
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
        registrationFee: new Decimal("800"),
        includedItems: JSON.stringify(["WELCOME_DRINK", "FOOD", "DJ", "TRANSPORTATION"]),
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
        registrationFee: new Decimal("300"),
        includedItems: JSON.stringify(["GUIDE", "TRANSPORTATION"]),
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
        pricePerPerson: new Decimal("400"),
        minimumPartySize: 1,
        isActive: true,
      },
      {
        eventId: specialEvents[0].id,
        tierName: "REGULAR",
        description: "Standard price",
        validFrom: new Date("2025-01-30"),
        validUntil: new Date("2025-02-11"),
        pricePerPerson: new Decimal("500"),
        minimumPartySize: 1,
        isActive: true,
      },
      {
        eventId: specialEvents[0].id,
        tierName: "LAST_MINUTE",
        description: "Last minute price (24 hours before)",
        validFrom: new Date("2025-02-11"),
        validUntil: new Date("2025-02-12"),
        pricePerPerson: new Decimal("600"),
        minimumPartySize: 1,
        isActive: true,
      },
      {
        eventId: specialEvents[1].id,
        tierName: "EARLY_BIRD",
        description: "Early bird price",
        validFrom: new Date("2025-02-01"),
        validUntil: new Date("2025-02-15"),
        pricePerPerson: new Decimal("600"),
        minimumPartySize: 2,
        isActive: true,
      },
      {
        eventId: specialEvents[1].id,
        tierName: "REGULAR",
        description: "Standard price",
        validFrom: new Date("2025-02-16"),
        validUntil: new Date("2025-02-28"),
        pricePerPerson: new Decimal("800"),
        minimumPartySize: 2,
        isActive: true,
      },
      {
        eventId: specialEvents[2].id,
        tierName: "REGULAR",
        description: "Daily pass",
        validFrom: new Date("2025-02-01"),
        validUntil: new Date("2025-02-28"),
        pricePerPerson: new Decimal("300"),
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
    console.log(`  • Payment Gateways: ${paymentGateways.length}`)
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
      paymentGateways.length +
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

// Run main function
main().catch((error) => {
  console.error(error)
  process.exit(1)
})
# Welcome to Samui Transfers #
Welcome to Samui-Transfers.com, your trusted local transfer service based right here on the beautiful island of Koh Samui, Thailand. As a locally owned and operated company, we specialize in providing safe, reliable, and comfortable transportation for travelers, families, and groups across the island. Whether you're arriving at the airport, heading to your resort, or exploring the island’s stunning beaches and attractions, our fleet of well-maintained minivans and SUVs is ready to get you there on time—with a smile. At Samui Transfers, we pride ourselves on local knowledge, personalized service, and a deep commitment to making your travel experience smooth and stress-free. Our professional drivers are friendly, punctual, and familiar with every corner of the island, ensuring a seamless journey from pickup to drop-off. Let us take the wheel while you sit back, relax, and enjoy the ride on paradise island.
All the service is managed by our local team, so you can expect the best service and support during your trip.
Managed by F2 Co.,Ltd.

# Our Mission #
At Samui Transfers, our mission is to make your journey as smooth and stress-free as possible. We understand that travel can be hectic, which is why we offer reliable and efficient transfer services tailored to your needs. Our team of experienced drivers is committed to ensuring your safety and comfort while you explore the breathtaking beauty of Koh Samui.

# Service Rate #
- Start from 350 THB
- After 5 km calculate base on distance
- Free cancellation up to 24 hours before your transfer
- No hidden fees, no extra charges
- 24/7 customer support

# Frequently Asked Questions (FAQs) #

## Booking & Payment ##
Q: How do I book an airport transfer?
A: You can book directly through our website, call us, or send a message via WhatsApp or Line.

Q: What payment methods do you accept?
A: We accept cash, credit/debit cards, PayPal, and bank transfers.

Q: Can I modify or cancel my booking?
A: Yes, modifications are allowed up to 24 hours before your transfer. Cancellations may be subject to a fee.

Q: Do I need to book in advance?
A: We recommend booking at least 24 hours in advance to guarantee availability.

## Airport Pick-up & Drop-off ##
Q: Where will I meet my driver at the airport?
A: Your driver will be waiting at the arrivals area with a sign displaying your name.

Q: What happens if my flight is delayed?
A: We track flight schedules, so your driver will adjust the pickup time accordingly.

Q: Can I book a transfer from my hotel to the airport?
A: Yes, we provide one-way and round-trip services.

## Vehicles & Services ##
Q: What types of vehicles do you offer?
A: We offer private cars, minivan, and SUV.

Q: Is there a child seat available?
A: No, We're sorry.

Q: Do you offer shared transfers?
A: No, we only provide private transfers to ensure comfort and efficiency.

## Pricing & Additional Costs ##
Q: Are there any hidden fees?
A: No, our pricing is transparent with no hidden charges.

Q: Do you charge extra for night-time transfers?
A: No, our prices remain the same 24/7.

# Contact Information # 
- Phone: (+66) 099 108 7999
- Mobile: (+66) 099 108 7999
- WhatsApp: (+66) 099 108 7999
- Email: info@samui-transfers.com
- Follow us on Facebook: https://www.facebook.com/profile.php?id=61578880422159
- Address: 9/38 Moo 6 Tambol Bophut, Amphoe Koh Samui, Thailand, 84320

## Why Choose Us ##
We are committed to providing the best transfer experience on Koh Samui. Our local expertise, dedication to customer service, and focus on safety set us apart. Whether you're traveling solo, with family, or in a group, we have the right vehicle and service to meet your needs. Enjoy the beauty of Koh Samui with peace of mind, knowing that your transfers are in capable hands. Thank you for choosing Samui Transfers—let's make your journey unforgettable!
- Ready We’re always prepared for your trip.
- Reliable We’re always on time, every time.
- Safe Your safety is our top priority.
- Friendly Our drivers are here to help you.
- Fair Pricing Pay only for the distance you travel.

 ## Our Vehicles ##
        - **Minibus**: Our minivans are spacious, air-conditioned vehicles ideal for families, small groups, or travelers with extra luggage. Enjoy a comfortable ride with plenty of room for up to 7 passengers and their bags—perfect for airport transfers, tours, or group trips around Koh Samui.
        - **SUV**: Travel in style and comfort with our SUVs. Suitable for up to 4 passengers, these vehicles offer a smooth ride, extra luggage space, and are perfect for couples, small families, or business travelers.

## Our Services ##
        - Airport Transfers: Hassle-free transfers to and from Samui International Airport.
        - Hotel Transfers: Convenient pickups and drop-offs at your hotel or resort.
        - Private Tours: Customized tours around Koh Samui’s top attractions.
        - Group Transfers: Spacious vehicles for larger groups or families.

        ## Why Choose Samui Transfers? ##
        - Local Expertise: Our team knows Koh Samui inside out, ensuring you get the best routes and recommendations.
        - 24/7 Availability: We’re here for you around the clock, ready to assist with your transfer needs at any time.
        - Comfortable Vehicles: Our fleet is equipped with modern, air-conditioned vehicles for a pleasant journey.
        - Competitive Rates: Enjoy transparent pricing with no hidden fees, ensuring you get the best value for your money.
        - Safe and Secure: All our drivers are professionally trained and adhere to strict safety standards.
        - Customer Satisfaction: We pride ourselves on delivering exceptional service, with a focus on your comfort and convenience.

        ## Book Your Transfer Today ##
        Ready to experience the best transfer service on Koh Samui? Booking is easy! Visit our website at [Samui-Transfers.com](https://www.samui-transfers.com) or contact us directly via phone, WhatsApp, or Line. Our friendly team is here to assist you with any questions and help you plan your perfect transfer. Whether you need a quick airport pickup or a full day of exploring the island, Samui Transfers is your go-to choice for reliable and friendly service.

        ## Payment Methods ##
        We accept a variety of payment methods to make your booking process as convenient as possible. You can pay via:
        - Cash (Thai Baht)
        - QR Code (PromptPay)
        - PayPal
        - Bank Transfer 

        ## Terms and Conditions ##
        en: {
          legal: "Legal",
          title: "Terms & Conditions",
          intro: "Please review before booking.",
          sections: [
            { h: "Booking & Payments", items: [
              "Payment: 100% deposit required to confirm your booking.",
              "Pricing: All prices in THB; taxes/fees included unless stated otherwise.",
            ]},
            { h: "Cancellations & Changes", items: [
              "Cancellation: ≥ 72 hours before pickup — full refund of deposit.",
              "Cancellation: 24–72 hours before pickup — 70% refund within 5–7 business days.",
              "Cancellation: < 24 hours or no‑show — non‑refundable.",
              "Changes: One free change up to 24 hours before pickup (subject to availability; fare differences may apply).",
            ]},
            { h: "Pickup, Waiting & Delays", items: [
              "Waiting time: Airport pickups include 60 minutes free; other pickups include 15 minutes free. Extra waiting may incur charges or require a new booking.",
              "Delays: We monitor flight delays and will adjust pickup when possible. Significant delays may require rescheduling.",
              "Force majeure: Not liable for delays caused by events beyond our control (weather, traffic incidents, etc.).",
            ]},
            { h: "Passengers, Luggage & Safety", items: [
              "Passengers & luggage: Passenger count must match the booking. Oversized luggage or extra items may require a larger vehicle and additional fees.",
              "Child seats: Available on request; please specify in Notes so we can confirm availability.",
              "Conduct & safety: No smoking or open alcohol in vehicles. Seat belts are required at all times.",
            ]},
          ],
          accept: "By booking, you acknowledge and accept these terms. For questions, please contact support.",
          language: "Language",
        },
        th: {
          legal: "กฎหมาย",
          title: "ข้อตกลงและเงื่อนไข",
          intro: "โปรดอ่านก่อนทำการจอง",
          sections: [
            { h: "การจองและการชำระเงิน", items: [
              "การชำระเงิน: ต้องชำระเงินมัดจำ 100% เพื่อยืนยันการจอง",
              "ราคา: แสดงเป็นสกุลเงินบาท (THB) รวมภาษี/ค่าธรรมเนียมแล้ว เว้นแต่จะระบุเป็นอย่างอื่น",
            ]},
            { h: "การยกเลิกและการเปลี่ยนแปลง", items: [
              "การยกเลิก: ≥ 72 ชั่วโมงก่อนรับ — คืนมัดจำเต็มจำนวน",
              "การยกเลิก: 24–72 ชั่วโมงก่อนรับ — คืน 70% ภายใน 5–7 วันทำการ",
              "การยกเลิก: น้อยกว่า 24 ชั่วโมง หรือไม่มาใช้บริการ — ไม่สามารถขอคืนเงิน",
              "การเปลี่ยนแปลง: เปลี่ยนแปลงได้ฟรี 1 ครั้งภายใน 24 ชั่วโมงก่อนรับ (ขึ้นกับความพร้อม และอาจมีส่วนต่างราคา)",
            ]},
            { h: "การรับ-ส่ง เวลารอ และความล่าช้า", items: [
              "เวลารอ: รับที่สนามบินรวมเวลารอฟรี 60 นาที; จุดรับอื่น ๆ รวมฟรี 15 นาที อาจมีค่าใช้จ่ายเพิ่มเติมหากรอเกินกำหนดหรืออาจต้องทำการจองใหม่",
              "ความล่าช้า: เราติดตามเที่ยวบินและจะปรับเวลารับตามสมควร กรณีล่าช้าจำนวนมากอาจต้องเลื่อนเวลา",
              "เหตุสุดวิสัย: ไม่รับผิดชอบต่อความล่าช้าที่เกิดจากเหตุการณ์นอกเหนือการควบคุม",
            ]},
            { h: "ผู้โดยสาร สัมภาระ และความปลอดภัย", items: [
              "ผู้โดยสารและสัมภาระ: จำนวนผู้โดยสารต้องตรงตามการจอง สัมภาระขนาดใหญ่หรือต้องการพื้นที่เพิ่มอาจต้องใช้รถที่ใหญ่ขึ้นและมีค่าใช้จ่ายเพิ่มเติม",
              "ที่นั่งเด็ก: มีให้ตามคำขอ โปรดระบุในช่องหมายเหตุเพื่อยืนยันความพร้อม",
              "มารยาทและความปลอดภัย: ห้ามสูบบุหรี่หรือดื่มแอลกอฮอล์ในรถ ต้องคาดเข็มขัดนิรภัยตลอดเวลา",
            ]},
          ],
          accept: "เมื่อทำการจอง ถือว่าคุณยอมรับข้อตกลงและเงื่อนไขเหล่านี้ หากมีคำถามโปรดติดต่อฝ่ายสนับสนุน",
          language: "ภาษา",
        },

        ## Privacy Policy ##
        en: {
          legal: "Legal",
          title: "Privacy Policy",
          intro: "Your privacy and data protection.",
          sections: [
            { h: "Information we collect", items: [
              "Contact details: name, email, phone number.",
              "Trip details: pickup/drop-off, dates/times, passengers, notes.",
              "Technical: IP, device, and usage analytics (cookies).",
            ]},
            { h: "How we use your data", items: [
              "Provide and manage bookings and customer support.",
              "Send confirmations, updates, and service messages.",
              "Improve services, security, and site performance.",
            ]},
            { h: "Legal bases & retention", items: [
              "Contract performance (fulfilling your booking).",
              "Legitimate interests (service improvement, security).",
              "Consent where required (marketing, cookies).",
              "We keep data only as long as necessary for the purposes described or to comply with law.",
            ]},
            { h: "Sharing & third parties", items: [
              "Trusted providers (e.g., email, hosting, analytics) under data protection agreements.",
              "Authorities where required by law.",
              "We do not sell personal data.",
            ]},
            { h: "Your rights", items: [
              "Access, correct, delete, or export your data.",
              "Object to or restrict processing; withdraw consent at any time.",
              "Contact us to exercise rights or make a complaint.",
            ]},
          ],
          contact: "For privacy requests, contact: booking@samui-transfers.com",
          language: "Language",
        },
        th: {
          legal: "กฎหมาย",
          title: "นโยบายความเป็นส่วนตัว",
          intro: "ความเป็นส่วนตัวและการคุ้มครองข้อมูลของคุณ",
          sections: [
            { h: "ข้อมูลที่เราเก็บรวบรวม", items: [
              "ข้อมูลติดต่อ: ชื่อ อีเมล หมายเลขโทรศัพท์",
              "รายละเอียดการเดินทาง: จุดรับ–ส่ง วันที่/เวลา จำนวนผู้โดยสาร หมายเหตุ",
              "ข้อมูลทางเทคนิค: IP อุปกรณ์ และสถิติการใช้งาน (คุกกี้)",
            ]},
            { h: "วิธีที่เราใช้ข้อมูลของคุณ", items: [
              "ให้บริการและจัดการการจอง รวมถึงการสนับสนุนลูกค้า",
              "ส่งการยืนยัน อัปเดต และข้อความเกี่ยวกับการให้บริการ",
              "พัฒนาบริการ ความปลอดภัย และประสิทธิภาพของเว็บไซต์",
            ]},
            { h: "ฐานทางกฎหมายและระยะเวลาเก็บรักษา", items: [
              "การปฏิบัติตามสัญญา (เพื่อให้บริการตามการจองของคุณ)",
              "ผลประโยชน์โดยชอบด้วยกฎหมาย (การพัฒนาบริการ ความปลอดภัย)",
              "ความยินยอมเมื่อจำเป็น (การตลาด คุกกี้)",
              "เราจะเก็บข้อมูลเท่าที่จำเป็นตามวัตถุประสงค์ที่ระบุไว้หรือเพื่อปฏิบัติตามกฎหมาย",
            ]},
            { h: "การเปิดเผยข้อมูลและบุคคลที่สาม", items: [
              "ผู้ให้บริการที่เชื่อถือได้ (เช่น อีเมล โฮสติ้ง วิเคราะห์การใช้งาน) ภายใต้ข้อตกลงคุ้มครองข้อมูล",
              "หน่วยงานของรัฐเมื่อกฎหมายกำหนด",
              "เราไม่ขายข้อมูลส่วนบุคคล",
            ]},
            { h: "สิทธิของคุณ", items: [
              "ขอเข้าถึง แก้ไข ลบ หรือขอสำเนาข้อมูล",
              "คัดค้านหรือจำกัดการประมวลผล; ถอนความยินยอมได้ทุกเมื่อ",
              "ติดต่อเราเพื่อใช้สิทธิหรือยื่นเรื่องร้องเรียน",
            ]},
          ],
          contact: "สำหรับคำขอด้านความเป็นส่วนตัว ติดต่อ: booking@samui-transfers.com",
          language: "ภาษา",
        },
        `

  await prisma.chatbotContext.upsert({
    where: { key_locale: { key: "ai-agent-default", locale: "en" } },
    update: { content: legacyContext, enabled: true, title: "Default AI Agent Context (EN)" },
    create: { key: "ai-agent-default", locale: "en", content: legacyContext, enabled: true, title: "Default AI Agent Context (EN)" },
  })
  console.log("Seeded ChatbotContext: ai-agent-default/en")

  await prisma.chatbotContext.upsert({
    where: { key_locale: { key: "ai-agent-assistant", locale: "en" } },
    update: { content: legacyContext, enabled: true, title: "Assistant Agent Context (EN)" },
    create: { key: "ai-agent-assistant", locale: "en", content: legacyContext, enabled: true, title: "Assistant Agent Context (EN)" },
  })
  console.log("Seeded ChatbotContext: ai-agent-assistant/en")

  // Thai variants (using same content for now, you can edit in Admin UI)
  await prisma.chatbotContext.upsert({
    where: { key_locale: { key: "ai-agent-default", locale: "th" } },
    update: { content: legacyContext, enabled: true, title: "Default AI Agent Context (TH)" },
    create: { key: "ai-agent-default", locale: "th", content: legacyContext, enabled: true, title: "Default AI Agent Context (TH)" },
  })
  console.log("Seeded ChatbotContext: ai-agent-default/th")

  await prisma.chatbotContext.upsert({
    where: { key_locale: { key: "ai-agent-assistant", locale: "th" } },
    update: { content: legacyContext, enabled: true, title: "Assistant Agent Context (TH)" },
    create: { key: "ai-agent-assistant", locale: "th", content: legacyContext, enabled: true, title: "Assistant Agent Context (TH)" },
  })
  console.log("Seeded ChatbotContext: ai-agent-assistant/th")

  // Seed Payment Gateways
  await prisma.paymentGateway.upsert({
    where: { type: "stripe" },
    update: {},
    create: {
      type: "stripe",
      displayName: "Stripe",
      description: "Pay securely with credit or debit card via Stripe",
      isPublic: true,
      enabled: true,
      displayOrder: 1,
      icon: "💳",
      processingTime: "Instant",
      fees: "2.9% + 10 THB",
      metadata: {
        supportedCards: ["visa", "mastercard", "amex"],
        countries: ["TH", "US", "GB", "SG"],
      },
    },
  })
  console.log("Seeded PaymentGateway: Stripe")

  await prisma.paymentGateway.upsert({
    where: { type: "paypal" },
    update: {},
    create: {
      type: "paypal",
      displayName: "PayPal",
      description: "Fast and secure payments with your PayPal account",
      isPublic: true,
      enabled: true,
      displayOrder: 2,
      icon: "🅿️",
      processingTime: "1-2 hours",
      fees: "3.49% + 10 THB",
      metadata: {
        supportedRegions: ["TH", "US", "EU", "SG", "MY"],
        buyerProtection: true,
      },
    },
  })
  console.log("Seeded PaymentGateway: PayPal")

  await prisma.paymentGateway.upsert({
    where: { type: "bank_transfer" },
    update: {},
    create: {
      type: "bank_transfer",
      displayName: "Bank Transfer",
      description: "Direct transfer from your bank account (Manual verification required)",
      isPublic: true,
      enabled: true,
      displayOrder: 3,
      icon: "🏦",
      processingTime: "1-3 business days",
      fees: "Free",
      metadata: {
        requiresVerification: true,
        banks: ["Bangkok Bank", "Kasikornbank", "Krung Thai Bank", "CIMB Thai"],
        accountType: "checking_savings",
      },
    },
  })
  console.log("Seeded PaymentGateway: Bank Transfer")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
