import { auth } from "@/auth"
import { db } from "@/lib/db"
import { encryptCredential, decryptCredential } from "@/lib/encryption"
import { NextRequest, NextResponse } from "next/server"

// GET credentials for a specific gateway (masked for security)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const gateway = await db.paymentGateway.findUnique({
      where: { id },
      include: { credentials: true },
    })

    if (!gateway) {
      return NextResponse.json(
        { error: "Gateway not found" },
        { status: 404 }
      )
    }

    // Return masked credentials (showing last 4 chars only for security)
    const masked = maskCredentials(gateway.credentials)

    return NextResponse.json({
      gateway,
      credentials: masked,
    })
  } catch (error: any) {
    console.error("Error fetching credentials:", error)
    return NextResponse.json(
      { error: "Failed to fetch credentials", details: error?.message },
      { status: 500 }
    )
  }
}

// POST/PUT to update credentials
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { type, credentials } = body

    if (!type || !credentials) {
      return NextResponse.json(
        { error: "Type and credentials are required" },
        { status: 400 }
      )
    }

    // Verify gateway exists
    const gateway = await db.paymentGateway.findUnique({
      where: { id },
    })

    if (!gateway) {
      return NextResponse.json(
        { error: "Gateway not found" },
        { status: 404 }
      )
    }

    // Prepare encrypted credentials based on type
    const encryptedData: Record<string, any> = {
      gatewayId: id,
    }

    // Set isConfigured flag based on which credentials are provided
    let isConfigured = false

    if (type === "stripe") {
      if (credentials.stripeSecretKey) {
        encryptedData.stripeSecretKey = encryptCredential(
          credentials.stripeSecretKey
        )
        isConfigured = true
      }
      if (credentials.stripePublicKey) {
        encryptedData.stripePublicKey = credentials.stripePublicKey // Public key doesn't need encryption
      }
      if (credentials.stripeAccountId) {
        encryptedData.stripeAccountId = encryptCredential(
          credentials.stripeAccountId
        )
      }
    } else if (type === "paypal") {
      if (credentials.paypalClientId && credentials.paypalSecret) {
        encryptedData.paypalClientId = encryptCredential(
          credentials.paypalClientId
        )
        encryptedData.paypalSecret = encryptCredential(credentials.paypalSecret)
        isConfigured = true
      }
      if (credentials.paypalAccountId) {
        encryptedData.paypalAccountId = encryptCredential(
          credentials.paypalAccountId
        )
      }
      if (credentials.paypalMode) {
        encryptedData.paypalMode = credentials.paypalMode
      }
    } else if (type === "bank_transfer") {
      if (
        credentials.bankAccountNumber &&
        credentials.bankAccountName &&
        credentials.bankBankName
      ) {
        encryptedData.bankAccountNumber = encryptCredential(
          credentials.bankAccountNumber
        )
        encryptedData.bankAccountName = encryptCredential(
          credentials.bankAccountName
        )
        encryptedData.bankBankName = credentials.bankBankName
        isConfigured = true
      }
      // Thailand-specific fields
      if (credentials.bankSwiftCode) {
        encryptedData.bankSwiftCode = encryptCredential(
          credentials.bankSwiftCode.toUpperCase()
        )
      }
      if (credentials.bankBankBranch) {
        encryptedData.bankBankBranch = encryptCredential(
          credentials.bankBankBranch
        )
      }
      // International transfer fields
      if (credentials.bankIban) {
        encryptedData.bankIban = encryptCredential(credentials.bankIban)
      }
      if (credentials.bankRoutingNumber) {
        encryptedData.bankRoutingNumber = encryptCredential(
          credentials.bankRoutingNumber
        )
      }
    }

    encryptedData.isConfigured = isConfigured
    encryptedData.verificationStatus = "PENDING"

    // Upsert credentials
    const result = await db.paymentGatewayCredential.upsert({
      where: { gatewayId: id },
      create: encryptedData as any,
      update: encryptedData as any,
    })

    // Log this action
    await logCredentialChange(id, "UPDATE", user.id, req)

    // Return masked result
    const masked = maskCredentials(result)

    return NextResponse.json(masked, { status: 200 })
  } catch (error: any) {
    console.error("Error updating credentials:", error)
    return NextResponse.json(
      { error: "Failed to update credentials", details: error?.message },
      { status: 500 }
    )
  }
}

// Helper function to mask credentials for display
function maskCredentials(
  credentials: any
): Record<string, any> | null {
  if (!credentials) return null

  return {
    id: credentials.id,
    gatewayId: credentials.gatewayId,
    isConfigured: credentials.isConfigured,
    verificationStatus: credentials.verificationStatus,
    lastVerified: credentials.lastVerified,
    createdAt: credentials.createdAt,
    updatedAt: credentials.updatedAt,
    // Masked values - show only last 4 chars
    stripePublicKey: maskValue(credentials.stripePublicKey),
    stripeSecretKey: credentials.stripeSecretKey ? "****" : null,
    stripeAccountId: credentials.stripeAccountId ? "****" : null,
    paypalClientId: credentials.paypalClientId ? "****" : null,
    paypalSecret: credentials.paypalSecret ? "****" : null,
    paypalAccountId: credentials.paypalAccountId ? "****" : null,
    paypalMode: credentials.paypalMode,
    bankAccountName: credentials.bankAccountName ? "****" : null,
    bankAccountNumber: credentials.bankAccountNumber ? "****" : null,
    bankBankName: credentials.bankBankName,
    // Thailand-specific (masked)
    bankSwiftCode: credentials.bankSwiftCode ? "****" : null,
    bankBankBranch: credentials.bankBankBranch ? "****" : null,
    // International transfers (masked)
    bankIban: credentials.bankIban ? "****" : null,
    bankRoutingNumber: credentials.bankRoutingNumber ? "****" : null,
  }
}

function maskValue(value: string | null | undefined): string | null {
  if (!value) return null
  if (value.length <= 4) return "****"
  return value.slice(-4).padStart(value.length, "*")
}

// Helper function to log credential changes
async function logCredentialChange(
  gatewayId: string,
  action: string,
  adminId: string,
  req: NextRequest
) {
  try {
    await db.paymentGatewayAuditLog.create({
      data: {
        gatewayId,
        action,
        adminId,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "",
        userAgent: req.headers.get("user-agent") || "",
        changedFields: action === "UPDATE" ? ["credentials"] : [],
      },
    })
  } catch (error) {
    console.error("Failed to log credential change:", error)
    // Don't throw - logging shouldn't break the request
  }
}
