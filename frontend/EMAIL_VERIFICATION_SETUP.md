/**
 * Email Verification System - Troubleshooting Guide
 * 
 * This document explains the email verification system and how to fix common issues.
 */

# Email Verification System Setup

## Current Status

### ✅ What's Fixed
1. **EMAIL_FROM Configuration** - Updated to `your-email@gmail.com`
2. **Test Users Created** - Updated seed.ts with auto-verified test users
3. **Verification Flow** - Email sending function is correctly configured

### ✅ Test Credentials (Auto-Verified)

```
Email: admin@admin.com
Password: Admin_123!
Role: ADMIN

Email: user@test.com
Password: Test_123!
Role: USER

Email: john@example.com
Password: John_123!
Role: USER

Email: jane@example.com
Password: Jane_123!
Role: USER
```

All these users have `emailVerified = true` and can log in immediately.

## How Email Verification Works

### Registration Flow
1. User signs up at `/sign-up`
2. `registerAction()` creates user with `emailVerified: null`
3. `sendVerificationEmail()` sends verification email
4. Email contains link: `/verify-email?token=XXX&email=user@example.com`
5. User clicks link
6. `verifyEmailToken()` validates token and sets `emailVerified: new Date()`
7. User can now log in

### Verification Flow
```
User Signs Up
    ↓
registerAction() creates user (emailVerified: null)
    ↓
sendVerificationEmail() sends email with link
    ↓
User clicks link in email
    ↓
verifyEmailToken() validates & updates emailVerified
    ↓
User can login
```

## Email Configuration

### Current Setup
```bash
# .env.local
EMAIL_FROM=your-email@gmail.com
```

### Key Email Functions
1. **sendVerificationEmail()** - Sends verification link (lib/email.ts:272)
2. **sendPasswordResetEmail()** - Sends password reset link (lib/email.ts:351)
3. **verifyEmailToken()** - Marks email as verified (lib/email.ts:440)

### Email Transporter
- Uses Mailtrap for development (if configured)
- Falls back to SMTP (production)
- Configuration in `getEmailTransporter()` (lib/email.ts:1)

## Testing Email Verification

### Quick Test
1. Register new account at `/sign-up`
2. System creates user with `emailVerified: null`
3. Check email for verification link
4. Click link to verify
5. Try to login - should work!

### Without Email (Development)
Use test credentials above - they're pre-verified ✅

## Login Check

### auth.ts (Line 38-40)
The authorization check for email verification:

```typescript
if (!user.emailVerified) {
  throw new Error("Please verify your email before signing in")
}
```

This check:
- ✅ **IS ENABLED** - Production requirement
- ✅ **ALLOWS** - Pre-verified users (test accounts)
- ❌ **BLOCKS** - Unverified users from login

## Troubleshooting

### Issue: "Please verify your email before signing in"
**Cause:** User's `emailVerified` is NULL  
**Solution:** 
- Use test credentials (already verified)
- OR complete email verification
- OR check inbox for verification email

### Issue: Email not received
**Cause:** EMAIL_FROM doesn't exist on mail server  
**Solution:** Update EMAIL_FROM to real email in `.env.local`

### Issue: Token expired
**Cause:** User took >24 hours to verify  
**Solution:** Resend verification at `/verify-email` page

## Database

### User Table
```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  emailVerified   DateTime? // NULL = not verified, DATE = verified
  password        String?
  // ... other fields
}
```

### Verification Token Table
```prisma
model VerificationToken {
  identifier String      // User email
  token      String      @unique
  expires    DateTime    // 24 hours from creation
  @@unique([identifier, token])
}
```

## Running with Email

### Step 1: Update EMAIL_FROM
```bash
# .env.local
EMAIL_FROM=your-real-email@gmail.com
```

### Step 2: Restart Server
```bash
npm run dev
```

### Step 3: Test Registration
1. Go to `/sign-up`
2. Create account with new email
3. Check inbox for verification email
4. Click link to verify
5. Login with new account

## Production Checklist

- [ ] EMAIL_FROM points to real email
- [ ] SMTP credentials configured correctly
- [ ] Email templates reviewed
- [ ] Verification email tested
- [ ] Password reset email tested
- [ ] Token expiry set to 24 hours
- [ ] Rate limiting enabled on endpoints
- [ ] Email domain SPF/DKIM configured (optional but recommended)

