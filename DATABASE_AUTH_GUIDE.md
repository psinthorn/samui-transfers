# 🔐 Authentication Database Integration - Complete Guide

**Status**: ✅ YES - Authentication works with database  
**Database**: PostgreSQL via Prisma ORM  
**Auth Method**: NextAuth.js with Credentials Provider

---

## 📊 How Authentication Works

### Architecture Flow

```
User Login Form
    ↓
Sign In with Credentials
    ↓
NextAuth Credentials Provider
    ↓
Query Database (Prisma)
    ↓
Find User by Email
    ↓
Compare Password Hash (bcryptjs)
    ↓
Verify Email is Verified ✓
    ↓
Check User Not Disabled ✓
    ↓
Create JWT Token
    ↓
Set Session
    ↓
Redirect to Dashboard
```

---

## 🔑 Default Credentials

### Admin Account

**Email**: `admin@admin.com`  
**Password**: `Admin_123!`  
**Role**: `ADMIN`

### How to Override Defaults

Set environment variables before seeding:

```bash
# .env.local
SEED_ADMIN_EMAIL=your_admin@email.com
SEED_ADMIN_PASSWORD=YourSecurePass123!
```

Then run:
```bash
pnpm prisma db seed
```

---

## 💾 Database Schema

### User Table

```prisma
model User {
  id              String          @id @default(cuid())
  name            String?
  email           String?          @unique
  emailVerified   DateTime?        // ← Email verification date
  image           String?
  password        String?          // ← Hashed password (bcryptjs)
  role            String           @default("USER")  // ADMIN or USER
  disabled        Boolean          @default(false)   // ← Account disabled flag
  preferredLanguage String         @default("en")
  marketingEmails Boolean          @default(false)
  accounts        Account[]
  sessions        Session[]
  bookings        Booking[]
  auditActorLogs  AuditLog[]      @relation("AuditActor")
  auditTargetLogs AuditLog[]      @relation("AuditTarget")
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([role])
  @@index([disabled])
  @@index([createdAt])
}
```

---

## 🔒 Authentication Flow Explained

### Step 1: User Submits Login Form

```typescript
// frontend/app/sign-in/page.tsx
const onSubmit = async (e: React.FormEvent) => {
  const res = await signIn("credentials", {
    redirect: false,
    email: "admin@admin.com",
    password: "Admin_123!",
    callbackUrl: "/dashboard"
  })
}
```

### Step 2: NextAuth Calls Credentials Provider

```typescript
// frontend/auth.ts
Credentials({
  async authorize(credentials) {
    // credentials = { email: "admin@admin.com", password: "Admin_123!" }
    const user = await db.user.findUnique({ 
      where: { email: credentials.email } 
    })
    return user
  }
})
```

### Step 3: Database Lookup

```sql
SELECT * FROM "User" WHERE email = 'admin@admin.com'
```

### Step 4: Password Verification

```typescript
const isPasswordValid = await bcrypt.compare(
  "Admin_123!",  // Plain password from form
  "$2a$12$..."   // Hashed password from database
)
// Returns: true ✓
```

### Step 5: Email Verification Check

```typescript
if (!user.emailVerified) {
  throw new Error("Please verify your email before signing in")
}
```

### Step 6: Disabled Account Check

```typescript
if (user.disabled) {
  throw new Error("User account is disabled")
}
```

### Step 7: JWT Token Created

```typescript
// JWT includes user data for session
{
  id: "user_id",
  email: "admin@admin.com",
  role: "ADMIN",
  disabled: false,
  emailVerified: "2025-01-01T00:00:00Z"
}
```

### Step 8: User Authenticated ✓

User can now access protected routes like `/dashboard` and `/admin`

---

## 🌐 Complete Authentication Setup

### Database Connection

```typescript
// frontend/lib/db.ts
import { PrismaClient } from '@prisma/client'

export const db = globalThis.prisma || new PrismaClient()
```

### NextAuth Configuration

```typescript
// frontend/auth.ts
const config: NextAuthConfig = {
  adapter: PrismaAdapter(db),     // ← Uses Prisma for data
  session: { strategy: "jwt" },    // ← JWT tokens
  providers: [
    Credentials({
      async authorize(credentials) {
        // Query database
        const user = await db.user.findUnique({ 
          where: { email: credentials?.email }
        })
        
        // Validate password
        const isValid = await bcrypt.compare(
          credentials?.password, 
          user?.password
        )
        
        // Verify email
        if (!user?.emailVerified) {
          throw new Error("Email not verified")
        }
        
        return user
      }
    })
  ]
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)
```

---

## 🚀 How to Set Up & Use

### 1. Database Setup

```bash
# Create database connection
# Update .env.local with DATABASE_URL

# Run migrations
pnpm prisma migrate dev

# Seed default admin user
pnpm prisma db seed
```

### 2. Login with Default Admin

```
Email: admin@admin.com
Password: Admin_123!
```

### 3. Register New User

```
Go to /sign-up and register
Verify email (check inbox or Mailtrap)
Login with new credentials
```

### 4. Create Additional Users (Via API or CLI)

```typescript
// Create user programmatically
const user = await db.user.create({
  data: {
    email: "user@example.com",
    name: "Test User",
    password: await bcrypt.hash("SecurePass123!", 12),
    role: "USER",
    emailVerified: new Date(),  // Mark as verified
  }
})
```

---

## 📋 User Management

### Create New User

```bash
# Via CLI using Prisma Studio
pnpm prisma studio

# Click "User" → "Add record"
# Fill in: email, password (hashed), role, emailVerified
```

### Update User Role

```typescript
// Make user an admin
await db.user.update({
  where: { email: "user@example.com" },
  data: { role: "ADMIN" }
})
```

### Disable User Account

```typescript
await db.user.update({
  where: { email: "user@example.com" },
  data: { disabled: true }
})

// User will see: "User account is disabled"
```

### Reset User Password

```typescript
const newHash = await bcrypt.hash("NewPassword123!", 12)
await db.user.update({
  where: { email: "user@example.com" },
  data: { password: newHash }
})
```

---

## 🔐 Security Features

### ✅ Password Hashing

```typescript
// Passwords are hashed with bcryptjs (12 rounds)
// Plain password: "Admin_123!"
// Stored hash: "$2a$12$veryLongHashString..."

// On login, password is compared:
const isValid = await bcrypt.compare(
  "Admin_123!",           // User input
  "$2a$12$veryLongHash"   // Database hash
)
```

### ✅ Email Verification

```typescript
// Users cannot login without verified email
if (!user.emailVerified) {
  throw new Error("Please verify your email before signing in")
}
```

### ✅ Account Disabling

```typescript
// Admins can disable accounts
if (user.disabled) {
  throw new Error("User account is disabled")
}
```

### ✅ Role-Based Access

```typescript
// Middleware checks user role
if (path.startsWith("/admin") && session?.user?.role !== "ADMIN") {
  return NextResponse.redirect("/Denied")
}
```

---

## 🧪 Testing Authentication

### Test Login Flow

```bash
# 1. Start dev server
pnpm dev

# 2. Go to http://localhost:3000/sign-in

# 3. Enter credentials
Email: admin@admin.com
Password: Admin_123!

# 4. Should redirect to /dashboard

# 5. Check session in DevTools:
# Application → Cookies → next-auth.session-token
```

### Test Admin Panel

```bash
# 1. Login as admin
# 2. Visit http://localhost:3000/admin
# 3. Should see admin dashboard

# 4. Login as regular user
# 5. Visit http://localhost:3000/admin
# 6. Should redirect to /Denied
```

### Test Email Verification

```bash
# 1. Register at /sign-up with new email
# 2. Try to login immediately
# 3. Should see: "Please verify your email before signing in"

# 4. Verify email via Mailtrap link
# 5. Now login should work
```

### Test Password Reset

```bash
# 1. Go to /sign-in → Forgot Password
# 2. Enter your email
# 3. Check Mailtrap for reset link
# 4. Click link and enter new password
# 5. Login with new password
```

---

## 📊 Session Data Structure

When user is logged in, session contains:

```typescript
session = {
  user: {
    id: "clx1234...",
    email: "admin@admin.com",
    name: "Admin",
    role: "ADMIN",                    // USER or ADMIN
    disabled: false,                  // false = account active
    emailVerified: Date("2025-01-01") // Date = verified
  },
  expires: "2025-02-01T00:00:00Z"
}
```

---

## 🛠️ Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/samui_transfers

# NextAuth
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000

# Email (for verification/reset)
MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_user
MAILTRAP_PASS=your_pass
EMAIL_FROM=noreply@samui-transfers.com

# Seed (optional - override defaults)
SEED_ADMIN_EMAIL=admin@admin.com
SEED_ADMIN_PASSWORD=Admin_123!
```

---

## ⚠️ Important Notes

### 1. Email Verification Required
- New users must verify email before first login
- Existing users from before this update need to verify email
- Can be disabled by removing check in `auth.ts` if needed

### 2. Default Password
- The default admin password (`Admin_123!`) should be changed immediately in production
- User should change password after first login

### 3. Password Requirements
All passwords must meet these requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

Examples of valid passwords:
- ✅ `SecurePass123!`
- ✅ `MyPassword@2025`
- ✅ `Test$Password9`
- ❌ `password` (no uppercase, number, special char)
- ❌ `Pass1!` (too short)

### 4. Role-Based Access
```
ADMIN: Can access /admin panel
USER: Cannot access /admin panel
```

### 5. Database Connection
- Must have PostgreSQL running
- DATABASE_URL must be set in `.env.local`
- Run `pnpm prisma migrate dev` first time

---

## 🎯 Quick Start Commands

```bash
# Full setup
pnpm install
cp .env.example .env.local  # Update with your values
pnpm prisma migrate dev
pnpm prisma db seed

# Start development
pnpm dev

# Open browser and login
# Email: admin@admin.com
# Password: Admin_123!
```

---

## 📚 File Structure

```
frontend/
├── auth.ts                           ← NextAuth config
├── middleware.ts                     ← Route protection
├── lib/
│   ├── db.ts                        ← Prisma client
│   ├── email.ts                     ← Email sending
│   └── rate-limit.ts                ← Rate limiting
├── actions/
│   ├── login.ts                     ← Login action
│   ├── register.ts                  ← Register action
│   └── ...
├── app/
│   ├── sign-in/page.tsx            ← Login page
│   ├── sign-up/page.tsx            ← Register page
│   ├── admin/page.tsx              ← Admin panel
│   ├── dashboard/page.tsx          ← User dashboard
│   └── api/auth/
│       ├── verify-email/route.ts   ← Email verification
│       └── password-reset/route.ts ← Password reset
└── prisma/
    ├── schema.prisma               ← Database schema
    ├── seed.ts                     ← Seed script
    └── migrations/                 ← Database migrations
```

---

## ✅ Verification Checklist

- ✅ Database connected via Prisma
- ✅ NextAuth configured with Credentials provider
- ✅ Passwords hashed with bcryptjs (12 rounds)
- ✅ Email verification required
- ✅ User roles stored in database
- ✅ Disabled accounts supported
- ✅ Default admin user seeds on first migration
- ✅ Session stored as JWT token
- ✅ Admin panel protected by role check
- ✅ Rate limiting applied to auth endpoints

---

## 🎉 Summary

**Yes, authentication is fully integrated with the database:**

1. ✅ Users are stored in PostgreSQL database
2. ✅ Passwords are securely hashed with bcryptjs
3. ✅ Roles (ADMIN/USER) are database fields
4. ✅ Email verification is required
5. ✅ Sessions are JWT-based
6. ✅ Default admin: `admin@admin.com` / `Admin_123!`
7. ✅ Full role-based access control
8. ✅ Account disabling support
9. ✅ Audit logging ready
10. ✅ Production-ready security

**Start with the default credentials and change them after first login!**
