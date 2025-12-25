import { db } from "@/lib/db"

export async function seedPaymentGateways() {
  try {
    // Check if gateways already exist
    const count = await db.paymentGateway.count()
    if (count > 0) {
      console.log("Payment gateways already seeded")
      return
    }

    // Create default payment gateways
    const gateways = await db.paymentGateway.createMany({
      data: [
        {
          type: "stripe",
          displayName: "Credit Card",
          description: "Pay with Visa, Mastercard, or other card",
          isPublic: true,
          enabled: true,
          displayOrder: 1,
          icon: "💳",
          processingTime: "Instant",
          fees: "2.9% + ฿5 per transaction",
          metadata: {
            provider: "stripe",
            currencies: ["THB", "USD"],
          },
        },
        {
          type: "paypal",
          displayName: "PayPal",
          description: "Quick and secure payment with PayPal",
          isPublic: true,
          enabled: true,
          displayOrder: 2,
          icon: "🅿️",
          processingTime: "Instant",
          fees: "3.5% + ฿5 per transaction",
          metadata: {
            provider: "paypal",
            currencies: ["THB", "USD"],
          },
        },
        {
          type: "bank_transfer",
          displayName: "Bank Transfer",
          description: "Direct bank transfer (1-3 business days)",
          isPublic: true,
          enabled: true,
          displayOrder: 3,
          icon: "🏦",
          processingTime: "1-3 business days",
          fees: "No fees",
          metadata: {
            provider: "bank_transfer",
            currencies: ["THB"],
            banks: ["SCB", "KBank", "Bangkok Bank"],
          },
        },
      ],
    })

    console.log(`✓ Seeded ${gateways.count} payment gateways`)
    return gateways
  } catch (error) {
    console.error("Error seeding payment gateways:", error)
    throw error
  }
}
