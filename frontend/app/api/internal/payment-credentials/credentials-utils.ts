import { db } from "@/lib/db"
import { decryptCredential } from "@/lib/encryption"

/**
 * Server-side function to get decrypted credentials
 * Call this directly from your payment processing code
 */
export async function getDecryptedCredentials(type: string) {
  try {
    const gateway = await db.paymentGateway.findUnique({
      where: { type },
      include: { credentials: true },
    })

    if (!gateway || !gateway.credentials?.isConfigured) {
      throw new Error(`Credentials not configured for ${type}`)
    }

    return decryptGatewayCredentials(type, gateway.credentials)
  } catch (error) {
    console.error(`Error getting decrypted credentials for ${type}:`, error)
    throw error
  }
}

export function decryptGatewayCredentials(
  type: string,
  credentials: any
): Record<string, string> {
  const result: Record<string, string> = {}

  if (type === "stripe") {
    if (credentials.stripePublicKey) {
      result.publicKey = credentials.stripePublicKey // Already public, no decrypt needed
    }
    if (credentials.stripeSecretKey) {
      result.secretKey = decryptCredential(credentials.stripeSecretKey)
    }
    if (credentials.stripeAccountId) {
      result.accountId = decryptCredential(credentials.stripeAccountId)
    }
  } else if (type === "paypal") {
    if (credentials.paypalClientId) {
      result.clientId = decryptCredential(credentials.paypalClientId)
    }
    if (credentials.paypalSecret) {
      result.secret = decryptCredential(credentials.paypalSecret)
    }
    if (credentials.paypalAccountId) {
      result.accountId = decryptCredential(credentials.paypalAccountId)
    }
    if (credentials.paypalMode) {
      result.mode = credentials.paypalMode
    }
  } else if (type === "bank_transfer") {
    if (credentials.bankAccountName) {
      result.accountName = decryptCredential(credentials.bankAccountName)
    }
    if (credentials.bankAccountNumber) {
      result.accountNumber = decryptCredential(credentials.bankAccountNumber)
    }
    if (credentials.bankRoutingNumber) {
      result.routingNumber = decryptCredential(credentials.bankRoutingNumber)
    }
    if (credentials.bankIban) {
      result.iban = decryptCredential(credentials.bankIban)
    }
    if (credentials.bankBankName) {
      result.bankName = credentials.bankBankName
    }
  }

  return result
}
