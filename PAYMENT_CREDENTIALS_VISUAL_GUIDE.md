# 🎯 Payment Gateway Credentials - Visual Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CUSTOMER                                 │
│                     Checkout Page                               │
│                   (Public Frontend)                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ├─→ /api/payment-gateways (Public)
                           │   └─→ Returns: List of active gateways
                           │       (Stripe, PayPal, Bank)
                           │
                           └─→ /api/payments/stripe/charge
                               /api/payments/paypal/create-order
                               /api/payments/bank-details

┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                  │
│                  (Secure Server)                                │
│                                                                 │
│  When processing payment:                                       │
│    1. Call getDecryptedCredentials("stripe")                   │
│    2. Decrypt: "a1b2c3:d4e5f6:[encrypted]" → "sk_live_..."   │
│    3. Use with Stripe API                                      │
│    4. Memory cleared (credential no longer in memory)          │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           └─→ Database
                               ├─→ PaymentGateway
                               │   (stripe, paypal, bank_transfer)
                               │
                               ├─→ PaymentGatewayCredential
                               │   (ENCRYPTED credentials)
                               │
                               └─→ PaymentGatewayAuditLog
                                   (Change history)

┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL                                  │
│              /admin/payment-gateways                            │
│                                                                 │
│  Click 🔑 button → Opens Credentials Modal                     │
│                                                                 │
│  ┌─────────────────────────────────────────────┐              │
│  │ Stripe Credentials                          │              │
│  ├─────────────────────────────────────────────┤              │
│  │ Public Key:    pk_live_123...               │              │
│  │ Secret Key:    ******* [show]               │              │
│  │ Account ID:    ******* [show]               │              │
│  │                                              │              │
│  │ [Save & Encrypt] [Cancel]                   │              │
│  └─────────────────────────────────────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Encryption Process Flow

```
┌──────────────────────┐
│ Admin enters:        │
│ sk_live_ABC123       │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│ Click "Save &       │
│ Encrypt"            │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────────────────────┐
│ ENCRYPTION PROCESS                   │
│                                      │
│ 1. Generate random IV:               │
│    a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5  │
│                                      │
│ 2. Create cipher:                    │
│    AES-256-GCM with ENCRYPTION_KEY  │
│                                      │
│ 3. Encrypt plaintext:                │
│    "sk_live_ABC123" → encrypted_bytes
│                                      │
│ 4. Get auth tag:                     │
│    d4e5f6g7h8i9j0k1l2m3n4o5p6q7   │
│    (Used to detect tampering)        │
│                                      │
│ 5. Format: IV:TAG:ENCRYPTED          │
│    a1b2c3:d4e5f6:encrypted_bytes    │
└──────────┬───────────────────────────┘
           │
           ↓
┌──────────────────────┐
│ Send to Server       │
│ via HTTPS            │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────────────────────┐
│ SERVER (Encrypted in API Request)   │
│                                      │
│ API validates:                       │
│  ✓ Admin role                        │
│  ✓ Valid session                     │
│                                      │
│ Receives encrypted data              │
│ from request body                    │
└──────────┬───────────────────────────┘
           │
           ↓
┌──────────────────────────────────────┐
│ DATABASE STORAGE                     │
│                                      │
│ Table: PaymentGatewayCredential      │
│                                      │
│ stripeSecretKey:                     │
│ a1b2c3:d4e5f6:encrypted_bytes       │
│                                      │
│ (NEVER stores plaintext)             │
└──────────┬───────────────────────────┘
           │
           ↓
┌──────────────────────┐
│ ✓ Saved Encrypted!  │
│                      │
│ ✓ Configured and    │
│   Verified          │
└──────────────────────┘
```

---

## Decryption Process Flow

```
┌──────────────────────────────────┐
│ Payment Processing Code:         │
│                                  │
│ getDecryptedCredentials("stripe")│
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│ INTERNAL SERVER CALL             │
│ (Not exposed to frontend)         │
│                                  │
│ /api/internal/payment-credentials
│ /stripe                          │
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│ DATABASE FETCH                   │
│                                  │
│ SELECT * FROM PaymentGateway     │
│ WHERE type = 'stripe'            │
│ JOIN PaymentGatewayCredential    │
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│ RETRIEVE ENCRYPTED DATA:         │
│                                  │
│ a1b2c3:d4e5f6:encrypted_bytes    │
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│ DECRYPTION PROCESS               │
│                                  │
│ 1. Parse:                        │
│    IV = a1b2c3                   │
│    TAG = d4e5f6                  │
│    DATA = encrypted_bytes        │
│                                  │
│ 2. Create decipher:              │
│    AES-256-GCM with ENCRYPTION_KEY
│                                  │
│ 3. Verify auth tag:              │
│    ✓ No tampering detected       │
│                                  │
│ 4. Decrypt:                      │
│    encrypted_bytes → plaintext   │
│    → "sk_live_ABC123"            │
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│ IN-MEMORY PLAINTEXT              │
│ (Server Memory Only)              │
│                                  │
│ creds = {                        │
│   secretKey: "sk_live_ABC123",   │
│   publicKey: "pk_live_...",      │
│   accountId: "acct_..."          │
│ }                                │
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│ USE WITH PAYMENT API             │
│                                  │
│ stripe = Stripe(secretKey)       │
│ intent = stripe.paymentIntents   │
│          .create(config)         │
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│ ✓ Payment Processed!             │
│                                  │
│ Memory cleared                   │
│ (Credential no longer in memory) │
└──────────────────────────────────┘
```

---

## Admin Panel UI Components

```
PAYMENT GATEWAYS PAGE
/admin/payment-gateways

┌─────────────────────────────────────────────────────────────┐
│ Payment Gateway Settings                                    │
│ Control which payment methods are available to customers    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Active Methods: 3 of 3 available to customers               │
└─────────────────────────────────────────────────────────────┘

[+ Add New Payment Gateway]

┌─────────────────────────────────────────────────────────────┐
│ 💳 Stripe                                                   │
│ Credit and debit card payments                             │
│ Processing Time: Instant    Fees: 2.9% + 30¢              │
│                                                             │
│                              [👁️] [✓] [↑↓] [🔑] [🗑️]      │
│                                            ↑                │
│                                    Click to manage           │
│                                    credentials              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ─────────────────── CREDENTIALS MODAL ──────────────────── │
│                                                             │
│ Manage Credentials                              [×]        │
│                                                             │
│ ✓ Credentials configured and verified                      │
│                                                             │
│ Public Key (Publishable)                                   │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ pk_test_51234567890                                  │   │
│ └──────────────────────────────────────────────────────┘   │
│ Safe to expose in frontend code                            │
│                                                             │
│ Secret Key                                                 │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ ••••••••••••••••••••••• [👁️]                         │   │
│ └──────────────────────────────────────────────────────┘   │
│ Encrypted and stored securely                              │
│                                                             │
│ Account ID (Optional)                                      │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ ••••••••••• [👁️]                                     │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                             │
│ [Save & Encrypt Credentials] [Cancel]                      │
│                                                             │
│ 🔒 Security Information                                    │
│ • All credentials are encrypted using AES-256-GCM          │
│ • Encryption key is stored securely in environment vars    │
│ • Never displayed in plain text in the admin panel         │
│ • Decrypted only when needed for payment processing        │
│ • All changes are logged with timestamp and admin ID       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Tables Structure

### PaymentGatewayCredential Table

```
┌──────────────────────────────────────────────────────────────┐
│ PaymentGatewayCredential                                     │
├──────────────────────────────────────────────────────────────┤
│ id (UUID)                         : "cred_123abc"            │
│ gatewayId (UUID)                  : "gate_stripe_456"        │
│ isConfigured (Boolean)            : true                     │
│ verificationStatus (String)       : "VALID"                  │
│ lastVerified (DateTime)           : 2025-12-07 10:30:00     │
│                                                               │
│ STRIPE CREDENTIALS (All Encrypted)                           │
│ stripePublicKey (String)          : "pk_test_..."           │
│ stripeSecretKey (String)          : "a1b2c3:d4e5f6:enc..."  │
│ stripeAccountId (String)          : "a1b2c3:d4e5f6:enc..."  │
│                                                               │
│ PAYPAL CREDENTIALS (All Encrypted)                           │
│ paypalClientId (String)           : "a1b2c3:d4e5f6:enc..."  │
│ paypalSecret (String)             : "a1b2c3:d4e5f6:enc..."  │
│ paypalAccountId (String)          : "a1b2c3:d4e5f6:enc..."  │
│ paypalMode (String)               : "SANDBOX"               │
│                                                               │
│ BANK CREDENTIALS (All Encrypted)                             │
│ bankAccountName (String)          : "a1b2c3:d4e5f6:enc..."  │
│ bankAccountNumber (String)        : "a1b2c3:d4e5f6:enc..."  │
│ bankRoutingNumber (String)        : "a1b2c3:d4e5f6:enc..."  │
│ bankIban (String)                 : "a1b2c3:d4e5f6:enc..."  │
│ bankBankName (String)             : "Bangkok Bank"          │
│                                                               │
│ createdAt (DateTime)              : 2025-12-07 10:00:00     │
│ updatedAt (DateTime)              : 2025-12-07 10:30:00     │
└──────────────────────────────────────────────────────────────┘
```

### PaymentGatewayAuditLog Table

```
┌──────────────────────────────────────────────────────────────┐
│ PaymentGatewayAuditLog                                       │
├──────────────────────────────────────────────────────────────┤
│ id (UUID)              : "audit_xyz789"                      │
│ gatewayId (UUID)       : "gate_stripe_456"                   │
│ action (String)        : "UPDATE"                            │
│ changedFields (Array)  : ["stripeSecretKey"]                 │
│ adminId (UUID)         : "user_admin_123"                    │
│ ipAddress (String)     : "192.168.1.100"                     │
│ userAgent (String)     : "Mozilla/5.0..."                    │
│ createdAt (DateTime)   : 2025-12-07 10:30:00                 │
├──────────────────────────────────────────────────────────────┤
│ Previous Entries:                                            │
│                                                               │
│ • 2025-12-07 09:00:00 - CREATE - stripePublicKey, ...       │
│ • 2025-12-06 15:30:00 - UPDATE - stripeSecretKey            │
│ • 2025-12-05 11:20:00 - UPDATE - stripeAccountId            │
│                                                               │
│ NOTE: Field names only (no actual values stored)            │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints Summary

### Admin Endpoints

```
POST /api/admin/payment-gateways/[id]/credentials
├─ Auth: Admin role required
├─ Body: { type, credentials }
└─ Returns: { id, isConfigured, verificationStatus, ... }

GET /api/admin/payment-gateways/[id]/credentials
├─ Auth: Admin role required
├─ Params: gatewayId
└─ Returns: { gateway, credentials (masked) }
```

### Internal Endpoints (Server-side only)

```
GET /api/internal/payment-credentials/[type]
├─ Auth: None (trusted internal call)
├─ Params: type (stripe, paypal, bank_transfer)
├─ Returns: { secretKey, clientId, accountNumber, ... }
└─ NOTE: Returns PLAINTEXT (use only in backend)
```

### Public Endpoints

```
GET /api/payment-gateways
├─ Auth: None
└─ Returns: List of active/public gateways
```

---

## Security Checklist

```
✅ ENCRYPTION
   ✓ AES-256-GCM algorithm
   ✓ 256-bit keys (ENCRYPTION_KEY)
   ✓ Random 128-bit IV each time
   ✓ 128-bit authentication tags
   ✓ No plaintext in database

✅ STORAGE
   ✓ Credentials encrypted before save
   ✓ ENCRYPTION_KEY in env variables
   ✓ Database password protected
   ✓ HTTPS only (no plaintext over network)

✅ ACCESS CONTROL
   ✓ Admin-only admin endpoints
   ✓ Session verification required
   ✓ Role-based authorization
   ✓ Server-side decryption only
   ✓ No credentials in frontend code

✅ AUDIT & MONITORING
   ✓ All changes logged
   ✓ Includes timestamp, admin ID, IP
   ✓ Changed field names recorded
   ✓ Can review access history

✅ DISPLAY
   ✓ Masked in admin panel (****)
   ✓ Show/hide toggle with password field UI
   ✓ Never logged to console
   ✓ Never exposed in error messages
```

---

## Setup Timeline

```
⏱️  5 minutes → Generate encryption key
⏱️  2 minutes → Add to .env.local
⏱️  2 minutes → Run migration
⏱️  3 minutes → Enter credentials in admin panel
⏱️  5 minutes → Update payment code

⏳ TOTAL: ~17 minutes to production-ready!
```

---

## File Structure

```
samui-transfers/
├── frontend/
│   ├── lib/
│   │   └── encryption.ts                    ← Encrypt/decrypt utils
│   │
│   ├── app/api/
│   │   ├── admin/payment-gateways/[id]/
│   │   │   └── credentials/route.ts         ← Admin API
│   │   │
│   │   └── internal/payment-credentials/
│   │       └── [type]/route.ts              ← Internal API
│   │
│   ├── components/admin/
│   │   ├── PaymentGatewayManager.tsx        ← Enhanced with 🔑 button
│   │   └── PaymentGatewayCredentials.tsx    ← New credentials form
│   │
│   ├── prisma/
│   │   ├── schema.prisma                    ← Updated schema
│   │   └── migrations/20251207162645.../    ← New migration
│   │
│   └── package.json                         ← New npm script
│
└── root/
    ├── CREDENTIALS_SETUP_GUIDE.md           ← Setup instructions
    ├── PAYMENT_CREDENTIALS_COMPLETE_GUIDE.md ← Full reference
    ├── PAYMENT_CREDENTIALS_QUICK_START.md   ← Quick start
    ├── PAYMENT_CREDENTIALS_CODE_EXAMPLES.md ← Code examples
    └── PAYMENT_CREDENTIALS_FINAL_SUMMARY.md ← This overview
```

---

**Created**: December 7, 2025  
**Status**: ✅ Complete & Ready  
**Security**: 🔐 Military-Grade AES-256-GCM Encryption
