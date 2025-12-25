# Payment Gateway Credentials System - Complete Solution

## 📋 Overview

Your payment gateway system now supports **secure credential storage and management** for multiple payment processors:

| Gateway | Supports | Fields |
|---------|----------|--------|
| **Stripe** | Credit/Debit Cards | Public Key, Secret Key, Account ID |
| **PayPal** | PayPal Wallet | Client ID, Secret, Account ID, Mode |
| **Bank Transfer** | Direct Banking | Account Name, Number, Routing, IBAN |

---

## 🔐 Security Architecture

### Encryption Method: AES-256-GCM

```
Original Credential
    ↓
AES-256 Encryption (32-byte key)
    ↓
Random IV (16 bytes)
    ↓
Authentication Tag (16 bytes)
    ↓
Format: IV:TAG:ENCRYPTED_DATA (all hex)
    ↓
Stored in Database
```

### Key Management

**Encryption Key Storage**:
- Stored in `ENCRYPTION_KEY` environment variable
- 64-character hex string (32 bytes)
- Never committed to Git
- Unique per deployment

**Key Generation**:
```bash
npm run generate:encryption-key
```

Output example:
```
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

## 📦 What Was Created

### 1. Database Tables

**PaymentGatewayCredential**
```prisma
model PaymentGatewayCredential {
  id                  String    @id @default(cuid())
  gatewayId           String    @unique
  
  // Stripe (encrypted)
  stripePublicKey     String?   // Public - safe in frontend
  stripeSecretKey     String?   // Encrypted
  stripeAccountId     String?   // Encrypted
  
  // PayPal (encrypted)
  paypalClientId      String?   // Encrypted
  paypalSecret        String?   // Encrypted
  paypalAccountId     String?   // Encrypted
  paypalMode          String?   // SANDBOX or LIVE
  
  // Bank (encrypted)
  bankAccountName     String?   // Encrypted
  bankAccountNumber   String?   // Encrypted
  bankRoutingNumber   String?   // Encrypted
  bankIban            String?   // Encrypted
  bankBankName        String?   // Not encrypted (public info)
  
  // Status tracking
  isConfigured        Boolean   @default(false)
  lastVerified        DateTime?
  verificationStatus  String?   // PENDING, VALID, INVALID
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}
```

**PaymentGatewayAuditLog**
```prisma
model PaymentGatewayAuditLog {
  id              String    @id @default(cuid())
  gatewayId       String
  action          String    // CREATE, UPDATE, DELETE
  changedFields   String[]  // Field names only (no values)
  adminId         String?
  ipAddress       String?
  userAgent       String?
  createdAt       DateTime  @default(now())
}
```

### 2. Utility Functions

**lib/encryption.ts**
- `encryptCredential(plaintext: string)` → Encrypted string
- `decryptCredential(encryptedText: string)` → Plaintext
- `generateEncryptionKey()` → New encryption key

### 3. API Endpoints

**Admin API - Manage Credentials**
```
POST   /api/admin/payment-gateways/[id]/credentials
GET    /api/admin/payment-gateways/[id]/credentials
```

**Internal API - Get Decrypted Credentials** (Backend only)
```
GET    /api/internal/payment-credentials/[type]
```

### 4. UI Components

**PaymentGatewayManager** (Enhanced)
- Added 🔑 Key icon button for each gateway
- Opens credentials modal on click
- Credential status indicator (Valid/Invalid/Pending)

**PaymentGatewayCredentials** (New)
- Form for entering/updating credentials
- Password field masking with show/hide toggle
- Separate forms for Stripe/PayPal/Bank
- Success/error notifications
- Security information display

---

## 🚀 Quick Start

### Step 1: Generate Encryption Key

```bash
npm run generate:encryption-key
```

Copy the output (the hex string after `ENCRYPTION_KEY=`)

### Step 2: Add to Environment

Create or update `.env.local`:

```env
# ... existing vars ...
ENCRYPTION_KEY=your_generated_key_here
```

### Step 3: Run Migration

```bash
npm run prisma:migrate dev
```

This creates the new tables in your database.

### Step 4: Configure Credentials

1. Go to `http://localhost:3000/admin/payment-gateways`
2. For each gateway, click the 🔑 Key button
3. Enter credentials and click "Save & Encrypt Credentials"
4. You'll see ✓ Credentials configured and verified

---

## 💾 Usage in Your Code

### Backend Payment Processing

```typescript
// pages/api/checkout/confirm.ts
import { getDecryptedCredentials } from "@/app/api/internal/payment-credentials/[type]/route"

export async function POST(req) {
  const paymentMethod = req.body.method // "stripe" or "paypal"
  
  if (paymentMethod === "stripe") {
    // Get decrypted Stripe credentials
    const creds = await getDecryptedCredentials("stripe")
    
    const stripe = require("stripe")(creds.secretKey)
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000,
      currency: "thb",
      // ... rest of config
    })
  }
  
  if (paymentMethod === "paypal") {
    const creds = await getDecryptedCredentials("paypal")
    
    const client = new paypal.core.PayPalHttpClient({
      clientId: creds.clientId,
      clientSecret: creds.secret,
      // mode: "SANDBOX" or "LIVE"
      mode: creds.mode
    })
  }
}
```

### Getting Public Keys Only (Frontend-safe)

```typescript
// For Stripe public key in frontend
export async function getServerSideProps() {
  const stripeGateway = await db.paymentGateway.findUnique({
    where: { type: "stripe" },
    include: { credentials: true }
  })
  
  return {
    props: {
      stripePublicKey: stripeGateway?.credentials?.stripePublicKey
    }
  }
}

// In your checkout component
export default function Checkout({ stripePublicKey }) {
  const stripe = require("@stripe/stripe-js")(stripePublicKey)
  // ... rest of component
}
```

---

## 🎛️ Admin Panel Interface

### Gateway List View

For each gateway (Stripe, PayPal, Bank Transfer):

```
[Icon] Gateway Name          [💚 Public] [✓ Active] [↑↓] [🔑] [🗑️]
```

Buttons:
- 💚 **Public** - Toggle visibility to customers
- ✓ **Active** - Enable/disable this payment method
- **↑↓** - Reorder display order
- **🔑** - **Manage Credentials** (NEW!)
- 🗑️ **Delete** - Remove gateway

### Credentials Modal

When you click the 🔑 button:

1. **Status Bar**
   - ✓ Configured and verified
   - ⚠️ Not configured
   - ✗ Invalid credentials

2. **Gateway-Specific Form**
   - Stripe: Public Key, Secret Key, Account ID
   - PayPal: Mode, Client ID, Secret, Account ID
   - Bank: Name, Account, Number, Routing, IBAN

3. **Security Features**
   - Password fields masked by default
   - Show/Hide toggle for viewing
   - Plaintext shown briefly on screen
   - Encrypted before database storage
   - Never shown in full in logs/errors

---

## 🔍 How It Works (Technical Details)

### 1. Saving Credentials (Admin Action)

```
User enters "sk_live_ABC123..." in form
    ↓
Click "Save & Encrypt"
    ↓
[Encryption function]
  - Generate random IV (16 bytes)
  - Create cipher: AES-256-GCM
  - Encrypt plaintext
  - Get auth tag
  - Format: IV:TAG:ENCRYPTED
    ↓
Send encrypted data to API
    ↓
[Server stores]
  - Save: "a1b2c3:d4e5f6:gh1ij2kl3mn4op5qr6st7uv8wx9yz0"
  - Into: PaymentGatewayCredential.stripeSecretKey
    ↓
✓ Saved (encrypted in database)
```

### 2. Using Credentials (Payment Processing)

```
Payment processing code calls:
  getDecryptedCredentials("stripe")
    ↓
[Server-side only]
  - Fetch from database
  - Parse IV:TAG:ENCRYPTED format
  - Create decipher: AES-256-GCM
  - Verify auth tag (TAMPER DETECTION)
  - Decrypt data
    ↓
Return plaintext: "sk_live_ABC123..."
    ↓
Use in Stripe/PayPal/Bank API
    ↓
NEVER expose to frontend or logs
```

### 3. Admin Viewing Credentials

```
Admin clicks "Manage Credentials"
    ↓
Fetch encrypted data from database
    ↓
[Masking function]
  - "sk_live_ABC123" → "****"
  - "11223344556677" → "****"
  - Admin sees: "Password field with ****"
    ↓
Admin can see/modify
  - If entering NEW values: They'll be encrypted
  - If viewing OLD values: They're masked
    ↓
✓ No plaintext secrets in admin panel
```

---

## 📊 Database State

### Before Setup
```
PaymentGateway
├─ Stripe
├─ PayPal
└─ Bank Transfer

PaymentGatewayCredential
└─ (empty - no credentials yet)
```

### After Setup
```
PaymentGateway
├─ Stripe ──────────┐
├─ PayPal  ────┐    │
└─ Bank        │    │
               ↓    ↓
PaymentGatewayCredential
├─ [Stripe Creds - encrypted]
├─ [PayPal Creds - encrypted]
└─ [Bank Creds - encrypted]
```

---

## 🛡️ Security Checklist

✅ **Encryption**
- [x] AES-256-GCM encryption
- [x] Random IV each encryption
- [x] Authentication tag (tamper detection)
- [x] Key stored in env variables

✅ **Access Control**
- [x] Admin-only endpoints
- [x] Session verification
- [x] Role-based authorization
- [x] Server-side only decryption

✅ **Display Security**
- [x] Credentials masked in admin panel
- [x] Secret keys never shown as plain text
- [x] Show/hide toggle password fields
- [x] Never logged to console

✅ **Audit Trail**
- [x] All changes logged
- [x] Includes timestamp, admin, IP
- [x] Logs changed field names (not values)
- [x] Query audit logs via database

✅ **Data Integrity**
- [x] Auth tags prevent tampering
- [x] Decryption fails if corrupted
- [x] Errors don't expose encryption details

---

## 🔧 Migration Path

If you have credentials hardcoded in `.env`:

### Before
```env
# Old approach - not secure!
STRIPE_SECRET_KEY=sk_live_ABC123
PAYPAL_CLIENT_ID=AZD_ABC123
```

### After
```env
# New approach - secure!
ENCRYPTION_KEY=a1b2c3d4...
# Remove old hardcoded keys!
```

### Steps
1. Generate encryption key: `npm run generate:encryption-key`
2. Add to `.env.local`
3. Run migration: `npm run prisma:migrate dev`
4. Go to admin panel and enter credentials
5. Remove old credentials from `.env` files
6. Update code to use `getDecryptedCredentials()`

---

## 🐛 Troubleshooting

### Error: "ENCRYPTION_KEY environment variable is not set"

**Problem**: Environment variable not configured

**Solution**:
```bash
npm run generate:encryption-key
# Add output to .env.local
```

### Error: "Credentials not configured"

**Problem**: Gateway has no credentials stored

**Solution**: 
1. Go to `/admin/payment-gateways`
2. Click 🔑 button for the gateway
3. Enter credentials and save

### Error: "Decryption failed: Invalid encrypted format"

**Problem**: Data is corrupted or encryption key changed

**Solution**:
- Check `ENCRYPTION_KEY` hasn't changed
- Re-enter credentials in admin panel
- If issue persists, may need database recovery

### Credentials showing as "****" everywhere

**Expected Behavior**: This is correct! Admin panel masks all credentials for security.

**If you need to verify**: You must use the decrypted credentials in backend code.

---

## 📈 Production Deployment

### Pre-deployment Checklist

- [ ] Generate new encryption key: `npm run generate:encryption-key`
- [ ] Add `ENCRYPTION_KEY` to production `.env`
- [ ] Run migration: `npm run prisma:migrate deploy`
- [ ] Configure credentials in admin panel
- [ ] Test payment processing with actual keys
- [ ] Verify audit logs are recording changes
- [ ] Remove any old hardcoded credential env vars
- [ ] Test fallback/error handling

### Key Rotation

To rotate encryption keys:

1. Generate new key: `npm run generate:encryption-key`
2. Create migration script to:
   - Read all old encrypted credentials
   - Decrypt with old `ENCRYPTION_KEY`
   - Re-encrypt with new `ENCRYPTION_KEY`
   - Update database
3. Deploy migration
4. Update `ENCRYPTION_KEY` in production env
5. Verify system still works

---

## 📚 Files Created/Modified

### New Files
```
lib/encryption.ts                                    # Encryption utilities
app/api/admin/payment-gateways/[id]/credentials/route.ts  # Admin API
app/api/internal/payment-credentials/[type]/route.ts      # Internal API
components/admin/PaymentGatewayCredentials.tsx       # Credentials UI
CREDENTIALS_SETUP_GUIDE.md                          # Setup guide
```

### Modified Files
```
prisma/schema.prisma                                # Added 2 new models
frontend/components/admin/PaymentGatewayManager.tsx # Added creds button & modal
frontend/package.json                               # Added npm script
```

### Database Migrations
```
prisma/migrations/20251207162645_add_payment_gateway_credentials/
```

---

## 🎯 Next Steps

1. **Generate encryption key**
   ```bash
   npm run generate:encryption-key
   ```

2. **Add to `.env.local`**
   ```env
   ENCRYPTION_KEY=<generated_key>
   ```

3. **Run migration**
   ```bash
   npm run prisma:migrate dev
   ```

4. **Start dev server**
   ```bash
   npm run dev
   ```

5. **Configure credentials**
   - Visit `/admin/payment-gateways`
   - Click 🔑 button for each gateway
   - Enter real or test credentials
   - Save

6. **Use in payment processing**
   - Import `getDecryptedCredentials`
   - Get decrypted creds when needed
   - Use with payment SDKs

---

## 💡 Tips & Best Practices

### Do's ✅
- Use **SANDBOX** mode for testing
- **Rotate credentials regularly**
- **Monitor audit logs** for changes
- **Test** payment processing after config changes
- **Keep encryption key secure**
- **Backup** your database with encrypted credentials

### Don'ts ❌
- Don't commit credentials to Git
- Don't log decrypted credentials
- Don't share encryption key
- Don't expose internal credentials API
- Don't use weak payment provider credentials
- Don't leave credentials at default values

---

## 📞 Support

If you encounter issues:

1. Check this document's troubleshooting section
2. Review server console logs
3. Check `PaymentGatewayAuditLog` table for changes
4. Verify `ENCRYPTION_KEY` is set correctly
5. Ensure database migration ran successfully

---

## Version Info

- Created: December 7, 2025
- Last Updated: December 7, 2025
- Encryption: AES-256-GCM
- Database: PostgreSQL with Prisma
- Framework: Next.js 15 with App Router
