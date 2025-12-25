# Payment Credentials - Code Examples

## 🎯 Common Scenarios

### Scenario 1: Process Stripe Payment

**File**: `app/api/payments/stripe/charge.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { getDecryptedCredentials } from "@/app/api/internal/payment-credentials/[type]/route"

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, paymentMethodId } = await req.json()
    
    // ✅ Get decrypted Stripe credentials
    const creds = await getDecryptedCredentials("stripe")
    
    // Initialize Stripe with secret key
    const stripe = require("stripe")(creds.secretKey, {
      apiVersion: "2024-04-10"
    })
    
    // Process payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency || "thb",
      payment_method: paymentMethodId,
      confirm: true,
      return_url: "https://yoursite.com/payment/success"
    })
    
    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status
    })
  } catch (error: any) {
    console.error("Stripe payment error:", error.message)
    // ❌ Don't log decrypted credentials!
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    )
  }
}
```

### Scenario 2: Process PayPal Payment

**File**: `app/api/payments/paypal/create-order.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { getDecryptedCredentials } from "@/app/api/internal/payment-credentials/[type]/route"

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, description } = await req.json()
    
    // ✅ Get decrypted PayPal credentials
    const creds = await getDecryptedCredentials("paypal")
    
    const paypal = require("@paypal/checkout-server-sdk")
    
    // Create environment based on mode
    const environment = creds.mode === "LIVE" 
      ? new paypal.core.LiveEnvironment(creds.clientId, creds.secret)
      : new paypal.core.SandboxEnvironment(creds.clientId, creds.secret)
    
    const client = new paypal.core.PayPalHttpClient(environment)
    
    const request = new paypal.orders.OrdersCreateRequest()
    request.prefer("return=representation")
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency || "THB",
            value: amount.toString()
          },
          description: description
        }
      ]
    })
    
    const response = await client.execute(request)
    
    return NextResponse.json({
      success: true,
      orderId: response.result.id,
      status: response.result.status
    })
  } catch (error: any) {
    console.error("PayPal error:", error.message)
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    )
  }
}
```

### Scenario 3: Retrieve Bank Details for Customer

**File**: `app/api/payments/bank-details.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { getDecryptedCredentials } from "@/app/api/internal/payment-credentials/[type]/route"

export async function GET(req: NextRequest) {
  try {
    // ✅ Get decrypted bank credentials
    const creds = await getDecryptedCredentials("bank_transfer")
    
    // Format for customer display
    const bankDetails = {
      bankName: creds.bankName,
      accountName: creds.accountName,
      accountNumber: maskAccountNumber(creds.accountNumber),
      // Include full details if needed for transfer
      fullAccountNumber: creds.accountNumber, // Use carefully!
      iban: creds.iban || null,
      routingNumber: creds.routingNumber || null,
      instructions: `Please transfer to ${creds.accountName} at ${creds.bankName}`
    }
    
    return NextResponse.json(bankDetails)
  } catch (error: any) {
    console.error("Bank details error:", error.message)
    return NextResponse.json(
      { error: "Unable to retrieve bank details" },
      { status: 500 }
    )
  }
}

function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return "****"
  return accountNumber.slice(-4).padStart(accountNumber.length, "*")
}
```

### Scenario 4: Display Payment Methods to Customer

**File**: `components/PaymentMethodSelector.tsx`

```typescript
"use client"

import { useEffect, useState } from "react"

interface PaymentGateway {
  id: string
  type: string
  displayName: string
  icon: string
  processingTime?: string
  fees?: string
}

export function PaymentMethodSelector() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMethod, setSelectedMethod] = useState<string>("")
  
  useEffect(() => {
    // Fetch only PUBLIC payment gateways
    fetch("/api/payment-gateways")
      .then(res => res.json())
      .then(data => {
        setGateways(data)
        if (data.length > 0) {
          setSelectedMethod(data[0].type)
        }
      })
      .finally(() => setLoading(false))
  }, [])
  
  if (loading) return <div>Loading payment methods...</div>
  
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Select Payment Method</h3>
      
      {gateways.map((gateway) => (
        <label
          key={gateway.id}
          className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
        >
          <input
            type="radio"
            name="payment_method"
            value={gateway.type}
            checked={selectedMethod === gateway.type}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="w-4 h-4"
          />
          
          <div className="flex-1">
            <div className="font-medium">
              {gateway.icon} {gateway.displayName}
            </div>
            {gateway.processingTime && (
              <div className="text-sm text-gray-500">
                Processing: {gateway.processingTime}
              </div>
            )}
            {gateway.fees && (
              <div className="text-sm text-gray-500">
                Fees: {gateway.fees}
              </div>
            )}
          </div>
        </label>
      ))}
      
      {/* Render payment form based on selected method */}
      {selectedMethod === "stripe" && <StripeForm />}
      {selectedMethod === "paypal" && <PayPalForm />}
      {selectedMethod === "bank_transfer" && <BankTransferForm />}
    </div>
  )
}

function StripeForm() {
  return <div>Stripe payment form...</div>
}

function PayPalForm() {
  return <div>PayPal payment form...</div>
}

function BankTransferForm() {
  // This will fetch and display bank details
  return <BankDetailsDisplay />
}

function BankDetailsDisplay() {
  const [details, setDetails] = useState<any>(null)
  
  useEffect(() => {
    fetch("/api/payments/bank-details")
      .then(res => res.json())
      .then(setDetails)
  }, [])
  
  if (!details) return <div>Loading bank details...</div>
  
  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h4 className="font-semibold mb-4">{details.bankName}</h4>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-600">Account Name:</span>
          <span className="ml-2 font-mono">{details.accountName}</span>
        </div>
        <div>
          <span className="text-gray-600">Account Number:</span>
          <span className="ml-2 font-mono">{details.accountNumber}</span>
        </div>
        {details.iban && (
          <div>
            <span className="text-gray-600">IBAN:</span>
            <span className="ml-2 font-mono">{details.iban}</span>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-600 mt-4">{details.instructions}</p>
    </div>
  )
}
```

### Scenario 5: Admin - Update Credentials Programmatically

**File**: `scripts/update-credentials.ts`

```typescript
import { db } from "@/lib/db"
import { encryptCredential } from "@/lib/encryption"

/**
 * Run with: npx ts-node scripts/update-credentials.ts
 * 
 * This script can be used to:
 * - Migrate from environment variables to database
 * - Bulk update credentials
 * - Set up initial credentials
 */

async function updateCredentials() {
  console.log("🔐 Updating payment credentials...")
  
  // Update Stripe credentials
  const stripeGateway = await db.paymentGateway.findUnique({
    where: { type: "stripe" }
  })
  
  if (stripeGateway) {
    const creds = await db.paymentGatewayCredential.upsert({
      where: { gatewayId: stripeGateway.id },
      create: {
        gatewayId: stripeGateway.id,
        stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
        stripeSecretKey: process.env.STRIPE_SECRET_KEY
          ? encryptCredential(process.env.STRIPE_SECRET_KEY)
          : null,
        isConfigured: !!process.env.STRIPE_SECRET_KEY,
        verificationStatus: "PENDING"
      },
      update: {
        stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
        stripeSecretKey: process.env.STRIPE_SECRET_KEY
          ? encryptCredential(process.env.STRIPE_SECRET_KEY)
          : undefined,
        isConfigured: !!process.env.STRIPE_SECRET_KEY,
        verificationStatus: "PENDING"
      }
    })
    console.log("✅ Stripe credentials updated")
  }
  
  // Update PayPal credentials
  const paypalGateway = await db.paymentGateway.findUnique({
    where: { type: "paypal" }
  })
  
  if (paypalGateway) {
    const creds = await db.paymentGatewayCredential.upsert({
      where: { gatewayId: paypalGateway.id },
      create: {
        gatewayId: paypalGateway.id,
        paypalClientId: process.env.PAYPAL_CLIENT_ID
          ? encryptCredential(process.env.PAYPAL_CLIENT_ID)
          : null,
        paypalSecret: process.env.PAYPAL_SECRET
          ? encryptCredential(process.env.PAYPAL_SECRET)
          : null,
        paypalMode: (process.env.PAYPAL_MODE as "SANDBOX" | "LIVE") || "SANDBOX",
        isConfigured: !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_SECRET,
        verificationStatus: "PENDING"
      },
      update: {
        paypalClientId: process.env.PAYPAL_CLIENT_ID
          ? encryptCredential(process.env.PAYPAL_CLIENT_ID)
          : undefined,
        paypalSecret: process.env.PAYPAL_SECRET
          ? encryptCredential(process.env.PAYPAL_SECRET)
          : undefined,
        paypalMode: process.env.PAYPAL_MODE as "SANDBOX" | "LIVE" || undefined,
        isConfigured: !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_SECRET,
        verificationStatus: "PENDING"
      }
    })
    console.log("✅ PayPal credentials updated")
  }
  
  console.log("✨ All credentials updated!")
}

updateCredentials().catch(console.error)
```

### Scenario 6: Test Credentials System

**File**: `app/api/test/credentials.ts` (Testing only - remove in production!)

```typescript
/**
 * Test endpoint to verify credentials are encrypted/decrypted correctly
 * 
 * ⚠️ REMOVE THIS ENDPOINT IN PRODUCTION!
 * 
 * Usage: GET /api/test/credentials?type=stripe
 */

import { NextRequest, NextResponse } from "next/server"
import { getDecryptedCredentials } from "@/app/api/internal/payment-credentials/[type]/route"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  // Security check - only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    )
  }
  
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") || "stripe"
  
  try {
    console.log(`Testing credentials for: ${type}`)
    
    // Get from database (encrypted)
    const gateway = await db.paymentGateway.findUnique({
      where: { type },
      include: { credentials: true }
    })
    
    if (!gateway) {
      return NextResponse.json(
        { error: `Gateway ${type} not found` },
        { status: 404 }
      )
    }
    
    const encrypted = gateway.credentials
    
    console.log("Encrypted credentials format:", encrypted)
    
    // Decrypt
    const decrypted = await getDecryptedCredentials(type)
    
    console.log("Decrypted successfully:", Object.keys(decrypted))
    
    return NextResponse.json({
      gateway: {
        id: gateway.id,
        type: gateway.type,
        displayName: gateway.displayName
      },
      encryptedStatus: {
        isConfigured: encrypted?.isConfigured,
        verificationStatus: encrypted?.verificationStatus
      },
      decryptedKeys: Object.keys(decrypted),
      // ⚠️ Only for testing - never expose in production!
      decryptedValues: {
        ...decrypted,
        // Mask sensitive values even in test
        secretKey: decrypted.secretKey ? "***" : null,
        secret: decrypted.secret ? "***" : null
      }
    })
  } catch (error: any) {
    console.error(`Error testing ${type} credentials:`, error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

---

## 🔑 Key Patterns

### Pattern 1: Always Use Server-Side for Decryption

✅ **Correct** (Server action/API route):
```typescript
const creds = await getDecryptedCredentials("stripe")
// Now you have plaintext in server memory
```

❌ **Wrong** (Frontend):
```typescript
// Never do this!
const creds = await fetch("/api/get-decrypted-creds")
// Exposes secrets to browser
```

### Pattern 2: Never Log Decrypted Values

✅ **Correct**:
```typescript
console.log("Processing payment with Stripe")
// Safe - doesn't expose credentials
```

❌ **Wrong**:
```typescript
console.log("Credentials:", creds)
// Exposes secret key to logs!
```

### Pattern 3: Use for API Calls Only

✅ **Correct**:
```typescript
const creds = await getDecryptedCredentials("paypal")
const client = new PayPalClient(creds.clientId, creds.secret)
const result = await client.createPayment()
// Credentials only used briefly, then memory cleared
```

❌ **Wrong**:
```typescript
const creds = await getDecryptedCredentials("paypal")
return creds // Sending plaintext to frontend!
```

### Pattern 4: Error Handling

✅ **Correct**:
```typescript
try {
  const creds = await getDecryptedCredentials("stripe")
  const intent = await stripe.paymentIntents.create(config)
} catch (error) {
  console.error("Payment processing failed")
  // Don't log the error details which might contain creds
  return NextResponse.json(
    { error: "Payment failed" },
    { status: 500 }
  )
}
```

❌ **Wrong**:
```typescript
try {
  const creds = await getDecryptedCredentials("stripe")
  // ...
} catch (error) {
  console.error("Full error:", error) // Might expose credentials!
}
```

---

## 📚 Complete Function Reference

### getDecryptedCredentials(type: string)

```typescript
import { getDecryptedCredentials } from "@/app/api/internal/payment-credentials/[type]/route"

const creds = await getDecryptedCredentials("stripe")
// Returns: {
//   publicKey: "pk_...",
//   secretKey: "sk_...",
//   accountId: "acct_..."
// }
```

### Admin API: Save Credentials

```typescript
const response = await fetch(`/api/admin/payment-gateways/${gatewayId}/credentials`, {
  method: "POST",
  body: JSON.stringify({
    type: "stripe",
    credentials: {
      stripePublicKey: "pk_live_...",
      stripeSecretKey: "sk_live_...",
      stripeAccountId: "acct_..."
    }
  })
})

// Returns masked credentials:
// {
//   id: "...",
//   isConfigured: true,
//   stripeSecretKey: "****"
// }
```

---

**Created**: December 7, 2025
**Security Level**: 🔐 Production Grade
**Testing**: ✅ Use test endpoints before production
