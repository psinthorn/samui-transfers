# Payment Gateway Credentials Setup Guide

## Overview

The payment gateway system now supports secure storage and management of sensitive credentials for:
- **Stripe** (Public Key, Secret Key, Account ID)
- **PayPal** (Client ID, Secret, Account ID, Mode)
- **Bank Transfer** (Account details, routing numbers, IBAN)

All credentials are encrypted using **AES-256-GCM** before being stored in the database.

## Prerequisites

### 1. Set Environment Variable for Encryption

You must set the `ENCRYPTION_KEY` environment variable with a 64-character hex string (32 bytes):

```bash
# Generate a secure encryption key
npm run generate:encryption-key

# Output example:
# ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

Add this to your `.env.local`:

```env
ENCRYPTION_KEY=your_generated_key_here
```

### 2. Run Database Migration

```bash
npm run prisma:migrate dev
```

This creates three new tables:
- `PaymentGatewayCredential` - Stores encrypted credentials
- `PaymentGatewayAuditLog` - Logs all credential changes

## Admin Panel Usage

### Accessing Credentials Manager

1. Navigate to `/admin/payment-gateways`
2. For each payment gateway (Stripe, PayPal, Bank Transfer), click the **🔑 Key icon** button
3. This opens a modal to manage that gateway's credentials

### Stripe Setup

Required fields:
- **Public Key** (Publishable Key): `pk_live_...` or `pk_test_...`
- **Secret Key**: `sk_live_...` or `sk_test_...` (encrypted in DB)

Optional fields:
- **Account ID**: Your Stripe Account ID

### PayPal Setup

Required fields:
- **Mode**: Select "SANDBOX" (testing) or "LIVE" (production)
- **Client ID**: From PayPal app
- **Secret**: Client secret from PayPal app

Optional fields:
- **Account ID**: Your PayPal merchant account ID

### Bank Transfer Setup

Required fields:
- **Bank Name**: e.g., "Bangkok Bank", "Kasikornbank"
- **Account Name**: Account holder name
- **Account Number**: Bank account number

Optional fields:
- **Routing Number**: Bank routing/branch code
- **IBAN**: For international transfers

## Usage in Code

### For Backend Payment Processing

```typescript
// In your payment processing code
import { getDecryptedCredentials } from "@/app/api/internal/payment-credentials/[type]/route"

// For Stripe
const stripeCredentials = await getDecryptedCredentials("stripe")
const stripe = require("stripe")(stripeCredentials.secretKey)

// For PayPal
const paypalCredentials = await getDecryptedCredentials("paypal")
const { clientId, secret, mode } = paypalCredentials

// For Bank Transfer
const bankCredentials = await getDecryptedCredentials("bank_transfer")
console.log(`Account: ${bankCredentials.accountName}`)
console.log(`Number: ${bankCredentials.accountNumber}`)
```

### For Frontend (Public Keys Only)

```typescript
// Get only public/non-sensitive credentials
const response = await fetch("/api/payment-gateways/stripe/credentials")
const creds = await response.json()
// creds.publicKey is safe to use in frontend
```

## Security Features

✅ **Encryption**
- All sensitive data encrypted with AES-256-GCM
- 128-bit authentication tags prevent tampering
- Random IV for each encryption

✅ **Access Control**
- Admin-only credentials management
- Session verification required
- Role-based access control

✅ **Audit Logging**
- All credential changes logged
- Includes timestamp, admin ID, IP address
- Changed field names (not values) recorded

✅ **Display Masking**
- Admin panel masks credentials (shows only last 4 chars)
- Secret keys never shown as plain text
- "****" placeholder for hidden values

✅ **Database Security**
- Encrypted before storage
- No plaintext secrets in database
- Decryption only on demand

## API Endpoints

### Admin: Get/Set Credentials

```
GET/POST /api/admin/payment-gateways/[id]/credentials
```

**Authentication**: Admin role required

**GET Response**:
```json
{
  "gateway": { /* gateway object */ },
  "credentials": {
    "id": "...",
    "gatewayId": "...",
    "isConfigured": true,
    "verificationStatus": "VALID",
    "stripePublicKey": "pk_live_...",
    "stripeSecretKey": "****",
    "stripeAccountId": "****"
  }
}
```

**POST Body**:
```json
{
  "type": "stripe",
  "credentials": {
    "stripePublicKey": "pk_live_...",
    "stripeSecretKey": "sk_live_...",
    "stripeAccountId": "acct_..."
  }
}
```

### Internal: Get Decrypted Credentials

```
GET /api/internal/payment-credentials/[type]
```

**Response** (fully decrypted, for backend use only):
```json
{
  "publicKey": "pk_live_...",
  "secretKey": "sk_live_...",
  "accountId": "acct_..."
}
```

## Troubleshooting

### "ENCRYPTION_KEY environment variable is not set"

**Solution**: Add `ENCRYPTION_KEY` to `.env.local`

```bash
npm run generate:encryption-key
# Copy the output and add to .env.local
```

### "Credentials not configured" Error

**Solution**: Go to admin panel and save credentials for that gateway

### Decryption Fails

**Possible causes**:
- `ENCRYPTION_KEY` changed since credentials were saved
- Corrupted encrypted data
- Database was restored from different environment

**Solution**: Re-enter and save credentials in admin panel

## Migration from Hardcoded Credentials

If you have hardcoded credentials in environment variables:

1. Generate `ENCRYPTION_KEY`:
   ```bash
   npm run generate:encryption-key
   ```

2. Add to `.env.local`

3. In admin panel, enter credentials for each gateway

4. Remove old hardcoded credentials from `.env` files

5. Update payment processing code to use:
   ```typescript
   import { getDecryptedCredentials } from "@/app/api/internal/payment-credentials/[type]/route"
   ```

## Best Practices

1. ✅ Use **SANDBOX** mode for Stripe and PayPal testing
2. ✅ Change credentials periodically
3. ✅ Monitor audit logs for suspicious activity
4. ✅ Keep `ENCRYPTION_KEY` secure (don't commit to Git)
5. ✅ Never share credentials in logs or error messages
6. ✅ Use strong passwords/keys from payment providers
7. ❌ Don't store credentials in Git
8. ❌ Don't log decrypted credentials
9. ❌ Don't expose internal credentials API to frontend

## Database Schema

```prisma
model PaymentGatewayCredential {
  id                String    @id @default(cuid())
  gatewayId         String    @unique
  gateway           PaymentGateway
  
  // Encrypted fields
  stripePublicKey   String?
  stripeSecretKey   String?
  stripeAccountId   String?
  paypalClientId    String?
  paypalSecret      String?
  paypalAccountId   String?
  paypalMode        String?
  bankAccountName   String?
  bankAccountNumber String?
  bankRoutingNumber String?
  bankIban          String?
  bankBankName      String?
  
  // Status
  isConfigured      Boolean
  lastVerified      DateTime?
  verificationStatus String?
  
  createdAt         DateTime
  updatedAt         DateTime
}

model PaymentGatewayAuditLog {
  id                String
  gatewayId         String
  action            String     // CREATE, UPDATE, DELETE
  changedFields     String[]
  adminId           String?
  ipAddress         String?
  userAgent         String?
  createdAt         DateTime
}
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review audit logs for what changed
3. Check server console logs for encryption errors
