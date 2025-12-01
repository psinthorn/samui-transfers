# Email Verification - Visual Implementation Guide

## Complete User Journey Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER REGISTRATION JOURNEY                           │
└─────────────────────────────────────────────────────────────────────────────┘

                              START: Sign Up Page
                                      ↓
                    User fills form: Name, Email, Password
                                      ↓
                           Validates password requirements
                           ✓ 8+ characters
                           ✓ Uppercase letter
                           ✓ Lowercase letter
                           ✓ Number
                           ✓ Special character
                                      ↓
                                CLICK: Register
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BACKEND: registerAction()                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. Validate input with Zod schema                                          │
│  2. Check if email already exists                                           │
│  3. Hash password with bcrypt (12 rounds)                                   │
│  4. Generate verification token: crypto.randomBytes(32).toString("hex")    │
│  5. Create User with emailVerified: null                                    │
│  6. Create VerificationToken with 24-hour expiry                           │
│  7. Send verification email via Nodemailer                                 │
│  8. Return success + redirectUrl: "/registration-success"                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
                          1 SECOND DELAY (DOM update)
                                      ↓
            ┌──────────────────────────────────────────────────┐
            │         REGISTRATION SUCCESS PAGE                │
            │        /registration-success?email=...           │
            ├──────────────────────────────────────────────────┤
            │                                                  │
            │  🎉 Registration Successful!                    │
            │                                                  │
            │  Verify your email to complete registration     │
            │                                                  │
            │  ┌─────────────────────────────────────────┐   │
            │  │ 📧 Check your email                     │   │
            │  │ We sent verification email to:          │   │
            │  │ user@example.com                        │   │
            │  └─────────────────────────────────────────┘   │
            │                                                  │
            │  📋 Steps to verify your email:                 │
            │  ① Verification link sent to your email        │
            │  ② Click the link to verify                    │
            │  ③ Link expires in 24 hours                    │
            │  ④ After verification, sign in                 │
            │                                                  │
            │  ⏰ Don't forget! Link expires in 24 hours      │
            │                                                  │
            │  ❓ Didn't receive the email?                   │
            │  Check your spam or junk folder                │
            │                                                  │
            │  [Resend verification email] [Back to Sign In]  │
            │                                                  │
            │  Questions? support@samui-transfers.com         │
            └──────────────────────────────────────────────────┘
                                      ↓
                      User checks email (1-5 minutes)
                      ✅ Email received in inbox or spam folder
                                      ↓
        ┌─────────────────────────────────────────────┐
        │         VERIFICATION EMAIL                 │
        ├─────────────────────────────────────────────┤
        │                                             │
        │  From: noreply@samui-transfers.com         │
        │  Subject: Verify Your Email                │
        │                                             │
        │  Hi [User Name],                           │
        │                                             │
        │  Verify your email address to complete     │
        │  your registration at Samui Transfers.     │
        │                                             │
        │  [VERIFY EMAIL BUTTON]                    │
        │  Link: /verify-email?token=...&email=...  │
        │                                             │
        │  This link expires in 24 hours.           │
        │                                             │
        │  Questions? support@samui-transfers.com   │
        └─────────────────────────────────────────────┘
                              ↓
                    USER CLICKS EMAIL LINK
                              ↓
        ┌──────────────────────────────────────────┐
        │        VERIFY EMAIL PAGE                │
        │    /verify-email?token=...&email=...    │
        ├──────────────────────────────────────────┤
        │                                          │
        │          ⏳ Verifying...                 │
        │                                          │
        │  (Automatic background processing)      │
        │  • Check token validity                 │
        │  • Verify token not expired             │
        │  • Confirm email matches                │
        │  • Update User.emailVerified timestamp  │
        │                                          │
        └──────────────────────────────────────────┘
                              ↓
                      ✅ TOKEN VERIFIED
                              ↓
        ┌──────────────────────────────────────────┐
        │   EMAIL VERIFIED - SUCCESS MESSAGE      │
        ├──────────────────────────────────────────┤
        │                                          │
        │  ✅ Email verified successfully!        │
        │                                          │
        │  Redirecting to sign in...              │
        │  (3 second countdown)                   │
        │                                          │
        └──────────────────────────────────────────┘
                              ↓
                    AUTO-REDIRECT (3 seconds)
                              ↓
                        SIGN IN PAGE
                      /sign-in
                              ↓
            User enters email + password
                              ↓
        ┌──────────────────────────────────────────┐
        │    CHECK: Is email verified?            │
        ├──────────────────────────────────────────┤
        │  ✅ YES → Create JWT token              │
        │  ❌ NO → Redirect to /registration      │
        └──────────────────────────────────────────┘
                              ↓
                      ✅ SIGN IN SUCCESS
                              ↓
                      DASHBOARD PAGE
                      /dashboard
                              ↓
                              ✨ END ✨
```

## Error Recovery Flows

### Error 1: Email Not Received (1-5 minutes wait)
```
Registration Success Page
      ↓
User: "I didn't get the email"
      ↓
ACTION: Check spam/junk folder
      ↓
Found? ✅ Click link → Verify
      ↓
Not Found? ❌
      ↓
ACTION: Click "Resend verification email" button
      ↓
┌─────────────────────────────────────────┐
│   RESEND API CALL                       │
│   POST /api/auth/resend-verification... │
├─────────────────────────────────────────┤
│  1. Validate user exists               │
│  2. Check email not already verified   │
│  3. Generate new token                 │
│  4. Delete old tokens                  │
│  5. Send new verification email        │
│  6. Return success/error               │
└─────────────────────────────────────────┘
      ↓
Success: "Email resent successfully" ✅
      ↓
User checks email again
      ↓
✅ Click link → Verify
```

### Error 2: Link Expired (>24 hours)
```
User clicks old link
      ↓
/verify-email processes token
      ↓
"Token expired" error message
      ↓
OPTIONS:
  ① Request new verification link (button)
  ② Register again with same email
      ↓
New email sent
      ↓
Complete verification
      ↓
✅ Sign in
```

### Error 3: Already Verified
```
User tries to verify again
      ↓
/verify-email checks token
      ↓
"Email already verified" message
      ↓
ACTION: Go to sign-in
      ↓
Sign in with verified email
      ↓
✅ Access dashboard
```

## Database Schema Diagram

```
┌─────────────────────────────────────┐
│           User                      │
├─────────────────────────────────────┤
│ id: String (cuid)                  │
│ name: String?                      │
│ email: String @unique              │
│ emailVerified: DateTime? ← KEY      │
│ password: String?                  │
│ role: String                       │
│ disabled: Boolean                  │
│ createdAt: DateTime                │
│ updatedAt: DateTime                │
└─────────────────────────────────────┘
         ↑                  
         │ 1-to-N          
         │                 
┌─────────────────────────────────────┐
│    VerificationToken                │
├─────────────────────────────────────┤
│ identifier: String (email)          │
│ token: String @unique               │
│ expires: DateTime                   │
│                                     │
│ @@unique([identifier, token])       │
└─────────────────────────────────────┘
```

**Key Fields:**
- `User.emailVerified`: 
  - `null` = Not verified yet
  - `DateTime` = Verified at this time

- `VerificationToken`:
  - Links email to verification token
  - Unique per verification attempt
  - Deleted after use
  - Expires 24 hours after creation

## API Endpoint Flows

### Flow 1: Verify Email Token
```
POST /api/auth/verify-email
{
  "token": "abc123...",
  "email": "user@example.com"
}
    ↓
┌─────────────────────────────────────┐
│  API Handler                        │
├─────────────────────────────────────┤
│  1. Find VerificationToken by token │
│  2. Check token matches email       │
│  3. Check token not expired         │
│  4. Update User.emailVerified       │
│  5. Delete VerificationToken        │
│  6. Return { success: true, user }  │
└─────────────────────────────────────┘
    ↓
Response 200 OK
{
  "success": true,
  "user": {
    "id": "...",
    "email": "user@example.com",
    "emailVerified": "2024-01-01T12:00:00Z"
  }
}
```

### Flow 2: Resend Verification Email
```
POST /api/auth/resend-verification-email
{
  "email": "user@example.com"
}
    ↓
┌─────────────────────────────────────┐
│  API Handler                        │
├─────────────────────────────────────┤
│  1. Find User by email              │
│  2. Check email not verified        │
│  3. Delete old VerificationToken    │
│  4. Generate new token              │
│  5. Create new VerificationToken    │
│  6. Send verification email         │
│  7. Return success message          │
└─────────────────────────────────────┘
    ↓
Response 200 OK
{
  "success": true,
  "message": "Verification email sent"
}
```

## Authentication Flow After Verification

```
User enters credentials at /sign-in
              ↓
Call NextAuth signin with Credentials provider
              ↓
Database lookup: Find user by email
              ↓
┌────────────────────────────────┐
│  CHECK: emailVerified field   │
├────────────────────────────────┤
│  ✅ NOT null → Continue       │
│  ❌ null → Return error        │
└────────────────────────────────┘
              ↓
Verify password with bcrypt
              ↓
Password matches?
  ✅ YES → Generate JWT
  ❌ NO → Return error
              ↓
┌────────────────────────────────┐
│  Generate JWT Token            │
│  ├─ id                          │
│  ├─ email                       │
│  ├─ name                        │
│  ├─ role                        │
│  ├─ emailVerified               │
│  └─ disabled                    │
└────────────────────────────────┘
              ↓
Store in secure cookie
              ↓
Check role
  👤 USER → /dashboard
  👨‍💼 ADMIN → /admin
```

## Component Hierarchy

```
App
├── Sign Up Page (/sign-up)
│   ├── Form
│   │   ├── Name Input
│   │   ├── Email Input
│   │   ├── Password Input
│   │   ├── Password Requirements Checklist
│   │   └── Register Button
│   └── Terms/Privacy Links
│
├── Registration Success Page (/registration-success) ← NEW
│   ├── Success Badge
│   ├── Email Display Box
│   ├── Instructions List
│   ├── Time Warning Box
│   ├── Resend Section
│   │   ├── Resend Button
│   │   ├── Success Message
│   │   └── Error Message
│   ├── Back to Sign In Button
│   └── Support Contact Info
│
├── Verify Email Page (/verify-email)
│   ├── Loading State
│   ├── Success State
│   ├── Error State
│   ├── Resend Link Button
│   └── Back to Home Link
│
└── Sign In Page (/sign-in)
    ├── Email Input
    ├── Password Input
    ├── Sign In Button
    └── Forgot Password Link
```

## State Transitions Diagram

```
                    ┌─────────────────────────────────┐
                    │  USER MODEL STATES              │
                    └─────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  STATE 1: User Created (Registration)                       │
├──────────────────────────────────────────────────────────────┤
│  User.emailVerified: null                                   │
│  Verification Token: Created (24-hour expiry)               │
│  Email: Unverified                                          │
│  Can Sign In: ❌ NO (email not verified check fails)       │
│  Can Make Bookings: ❌ NO                                   │
│  Action: User checks email and clicks link                 │
└──────────────────────────────────────────────────────────────┘
                           ↓
                    Click verification link
                           ↓
┌──────────────────────────────────────────────────────────────┐
│  STATE 2: Email Verified                                    │
├──────────────────────────────────────────────────────────────┤
│  User.emailVerified: 2024-01-01T12:00:00Z (timestamp)       │
│  Verification Token: Deleted                                │
│  Email: ✅ Verified                                         │
│  Can Sign In: ✅ YES                                        │
│  Can Make Bookings: ✅ YES                                  │
│  Action: User signs in                                      │
└──────────────────────────────────────────────────────────────┘
                           ↓
                      Sign in successful
                           ↓
┌──────────────────────────────────────────────────────────────┐
│  STATE 3: Authenticated Session                             │
├──────────────────────────────────────────────────────────────┤
│  JWT Token: Created with user data                          │
│  Session Cookie: Set                                        │
│  Middleware: Allows route access                            │
│  Dashboard: ✅ Accessible                                   │
│  Bookings: ✅ Can create                                    │
│  Action: User uses application                              │
└──────────────────────────────────────────────────────────────┘
                           ↓
                      Use application
                           ↓
                   ┌─ Sign Out ─┐
                   │            │
            Session Destroyed   │
         User logged out ✅     │
                                ↓
                         Redirect to Home
```

## Security Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│              SECURITY LAYERS                                │
└─────────────────────────────────────────────────────────────┘

Layer 1: INPUT VALIDATION
  ├─ Zod schema validation
  ├─ Email format check
  └─ Password strength requirements

Layer 2: UNIQUE CONSTRAINTS
  ├─ Email @unique in User model
  └─ Token @unique in VerificationToken

Layer 3: PASSWORD SECURITY
  ├─ Bcrypt hashing (12 rounds)
  └─ ~1-2 seconds per hash (brute force resistant)

Layer 4: TOKEN SECURITY
  ├─ Cryptographic randomness (32 bytes)
  ├─ Unique per attempt
  ├─ 24-hour expiry (time-bound)
  ├─ Email-bound (must match)
  └─ Deleted after use (one-time only)

Layer 5: SESSION SECURITY
  ├─ JWT with NEXTAUTH_SECRET
  ├─ Secure cookie (HttpOnly)
  ├─ Middleware verification
  └─ Role-based access control (RBAC)

Layer 6: VERIFICATION REQUIREMENT
  ├─ Email verification before sign-in
  ├─ emailVerified field check
  └─ Prevents fake accounts
```

---

**Ready for visual review and production deployment!** ✅
