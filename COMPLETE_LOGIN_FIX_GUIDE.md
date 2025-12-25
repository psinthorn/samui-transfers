# 🔐 Complete Login Error Resolution Guide

## TL;DR - Quick Start

If you're getting redirected to `/api/auth/error` when trying to login:

```bash
cd /Volumes/Data/Projects/samui-transfers/frontend

# Run this ONE command:
npx prisma migrate reset --force

# Then:
npm run dev

# Then login with:
# Email: user@test.com
# Password: Test_123!
```

**Success rate: 90%+**

---

## 📋 Table of Contents

1. [Understanding the Problem](#understanding-the-problem)
2. [Quick Diagnostic](#quick-diagnostic)
3. [Solution Paths](#solution-paths)
4. [Detailed Troubleshooting](#detailed-troubleshooting)
5. [Reference Information](#reference-information)

---

## Understanding the Problem

### What's Happening?

```
Your Login Attempt:
┌─────────────────────────┐
│ /sign-in page           │
│ Email: user@test.com    │
│ Password: Test_123!     │
│ Click "Sign In"         │
└────────────┬────────────┘
             │
             v
    ┌─────────────────────┐
    │ NextAuth processes  │
    │ credentials         │
    └────────┬────────────┘
             │
             │ ❌ ERROR HAPPENS HERE
             │
             v
┌────────────────────────────┐
│ /api/auth/error (BAD)      │
│ Login Failed ❌             │
└────────────────────────────┘
```

### Why It Happens

NextAuth's Credentials Provider validates users by calling the `authorize` function in `/auth.ts`:

```typescript
async authorize(credentials) {
  // 1. Check if user exists in database
  const user = await db.user.findUnique({ where: { email } })
  if (!user) throw new Error("User not found")  // ← Could fail here
  
  // 2. Check if email is verified
  if (!user.emailVerified) throw new Error("Email not verified")  // ← Or here
  
  // 3. Check password
  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) throw new Error("Invalid password")  // ← Or here
  
  // 4. Return user (success)
  return { id: user.id, email: user.email, ... }  // ✅ Success
}
```

**Any of these checks failing will redirect to `/api/auth/error`.**

---

## Quick Diagnostic

### Run This

```bash
cd /Volumes/Data/Projects/samui-transfers/frontend

# Check 1: Environment setup
echo "=== Environment ==="
[ -f ".env.local" ] && echo "✅ .env.local exists" || echo "❌ .env.local missing"
grep -q "NEXTAUTH_SECRET" .env.local && echo "✅ NEXTAUTH_SECRET set" || echo "❌ NEXTAUTH_SECRET missing"
grep -q "DATABASE_URL" .env.local && echo "✅ DATABASE_URL set" || echo "❌ DATABASE_URL missing"

echo ""
echo "=== Database ==="

# Check 2: Database connection
if npx prisma db execute --stdin < /dev/null > /dev/null 2>&1; then
  echo "✅ Database connected"
else
  echo "❌ Database NOT connected - Check DATABASE_URL"
  exit 1
fi

# Check 3: Users exist
echo ""
npx prisma db execute --stdin << 'SQL'
SELECT 
  (SELECT count(*) FROM "User") as "Total Users",
  (SELECT count(*) FROM "User" WHERE "emailVerified" IS NOT NULL) as "Verified Users",
  (SELECT count(*) FROM "User" WHERE disabled = false) as "Active Users"
SQL

# Check 4: Specific test user
echo ""
echo "=== Test User Status ==="
npx prisma db execute --stdin << 'SQL'
SELECT 
  email,
  name,
  CASE WHEN "emailVerified" IS NOT NULL THEN 'YES ✅' ELSE 'NO ❌' END as "Email Verified",
  CASE WHEN disabled = false THEN 'YES ✅' ELSE 'NO ❌' END as "Active",
  CASE WHEN password IS NOT NULL THEN 'YES ✅' ELSE 'NO ❌' END as "Has Password"
FROM "User" 
WHERE email LIKE '%test.com%' OR email LIKE '%admin%'
LIMIT 5;
SQL
```

This will show you the **exact status** of your database setup.

### What to Look For

**Good (Login should work):**
```
✅ Database connected
Total Users: 4
Verified Users: 4
Active Users: 4

email: user@test.com
Email Verified: YES ✅
Active: YES ✅
Has Password: YES ✅
```

**Bad (Login will fail):**
```
❌ Database NOT connected  ← Fix: Check DATABASE_URL
Total Users: 0             ← Fix: npx prisma migrate reset --force
Verified Users: 0          ← Fix: npx prisma migrate reset --force
Active Users: 0            ← Fix: npx prisma migrate reset --force
```

---

## Solution Paths

### Path A: Database Not Set Up (Most Common)

**Symptoms:**
- No users in database
- Zero migration errors but can't login
- Database connection works but is empty

**Solution:**
```bash
cd /Volumes/Data/Projects/samui-transfers/frontend

# Reset database and seed
npx prisma migrate reset --force

# This will:
# ✅ Delete all existing data (careful!)
# ✅ Re-run all migrations
# ✅ Run seed.ts to create test users
# ✅ Set emailVerified = NOW() for all users

# Expected output:
# Environment variables loaded from .env.local
# Database reset successful
# 🌱 Seeding database...
# ✅ Seeded admin: admin@admin.com
# ✅ Created 3 test users
# ✅ SEED COMPLETED SUCCESSFULLY

# Restart server
npm run dev

# Try login: user@test.com / Test_123!
```

### Path B: Database Exists But Users Missing

**Symptoms:**
- Database has some data
- No test users (or admin user missing)
- Don't want to delete existing data

**Solution:**
```bash
cd /Volumes/Data/Projects/samui-transfers/frontend

# Just run seed (keeps existing data)
npx prisma db seed

# This will:
# ✅ Keep all existing data
# ✅ Create/update test users
# ✅ Set emailVerified for test users

# Restart server
npm run dev

# Try login: user@test.com / Test_123!
```

### Path C: Users Exist But Email Not Verified

**Symptoms:**
- Users exist in database
- Error: "Please verify your email before signing in"
- Don't want to reseed

**Solution (Option 1 - Via SQL):**
```bash
cd /Volumes/Data/Projects/samui-transfers/frontend

# Update the test user's email verification
npx prisma db execute --stdin << 'SQL'
UPDATE "User" 
SET "emailVerified" = NOW() 
WHERE email IN ('user@test.com', 'admin@admin.com', 'john@example.com', 'jane@example.com');
SQL

# Restart server
npm run dev

# Try login: user@test.com / Test_123!
```

**Solution (Option 2 - Via Prisma Studio):**
```bash
cd /Volumes/Data/Projects/samui-transfers/frontend

# Open database GUI
npx prisma studio

# Steps:
# 1. Click "User" table
# 2. Click on "user@test.com" row
# 3. Find "emailVerified" field
# 4. Change from null to current date/time
# 5. Save
# 6. Close Prisma Studio (Ctrl+C)

# Restart server
npm run dev

# Try login: user@test.com / Test_123!
```

### Path D: Environment Variables Missing

**Symptoms:**
- Can connect to database
- Users exist but login still fails
- No [AUTH] logs in terminal

**Solution:**
```bash
# Check .env.local exists
cd /Volumes/Data/Projects/samui-transfers/frontend
cat .env.local

# Should have these:
# DATABASE_URL=postgresql://...
# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=7799a51de...

# If NEXTAUTH_SECRET is missing, generate one:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env.local:
# NEXTAUTH_SECRET=<paste-the-output-above>

# Restart server
npm run dev
```

### Path E: Debug Logging for Unknown Errors

**When:** You've tried paths A-D but still getting error page

**Solution:**
```bash
cd /Volumes/Data/Projects/samui-transfers/frontend

# 1. Enable debug logging
echo "DEBUG_AUTH=true" >> .env.local

# 2. Restart server with increased output
npm run dev 2>&1 | tee auth.log

# 3. Attempt login with: user@test.com / Test_123!

# 4. Check output:
# Look for [AUTH] logs:
# [AUTH] Authorize called { email: 'user@test.com' }
# [AUTH] User authorized successfully { ... }

# OR look for errors:
# [AUTH] Authorization error { error: 'message' }

# 5. Share the [AUTH] logs - they pinpoint the exact issue
```

---

## Detailed Troubleshooting

### Checking Each Component

#### Component 1: Environment Variables

```bash
cd /Volumes/Data/Projects/samui-transfers/frontend

# Check they're set
source .env.local
echo "DATABASE_URL length: ${#DATABASE_URL}"
echo "NEXTAUTH_SECRET length: ${#NEXTAUTH_SECRET}"
echo "NEXTAUTH_URL: $NEXTAUTH_URL"

# Expected:
# DATABASE_URL length: 100+  (not empty)
# NEXTAUTH_SECRET length: 64  (32 bytes as hex)
# NEXTAUTH_URL: http://localhost:3000
```

#### Component 2: Database Connection

```bash
cd /Volumes/Data/Projects/samui-transfers/frontend

# Test connection
npx prisma db execute --stdin << 'SQL'
SELECT NOW() as "Current Time";
SQL

# Expected:
# Current Time: 2025-12-10 XX:XX:XX+XX

# If error, DATABASE_URL is wrong
```

#### Component 3: Migrations

```bash
# Check status
npx prisma migrate status

# Expected:
# Database has not recorded any migrations.
# OR
# Following migrations have been applied:
# 20250101000000_init
# 20250102000000_...

# If "Database has not recorded any migrations" but files exist:
npx prisma migrate deploy
```

#### Component 4: Test Users

```bash
# Check with Prisma Studio (visual)
npx prisma studio

# OR check with SQL
npx prisma db execute --stdin << 'SQL'
SELECT email, name, role, 
       CASE WHEN "emailVerified" IS NOT NULL THEN 'Verified' ELSE 'Not Verified' END,
       CASE WHEN disabled THEN 'Disabled' ELSE 'Active' END
FROM "User"
ORDER BY "createdAt" DESC
LIMIT 10;
SQL
```

#### Component 5: Password Verification

```bash
cd /Volumes/Data/Projects/samui-transfers/frontend

# Test if password hashing works
node -e "
const bcrypt = require('bcryptjs');

// Test with a known hash
const password = 'Test_123!';
const hash = '\$2a\$10\$1...'; // Replace with actual hash from DB

bcrypt.compare(password, hash)
  .then(match => console.log(match ? '✅ Password matches' : '❌ Password does NOT match'))
  .catch(err => console.error('Error:', err.message));
"
```

---

## Reference Information

### Test Credentials (After Reset)

```
┌─────────────────────────────────────────────────┐
│ Admin Account                                   │
├─────────────────────────────────────────────────┤
│ Email:    admin@admin.com                       │
│ Password: Admin_123!                            │
│ Role:     ADMIN                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Regular User Accounts                           │
├─────────────────────────────────────────────────┤
│ Email:    user@test.com                         │
│ Password: Test_123!                             │
│ Role:     USER                                  │
│                                                 │
│ Email:    john@example.com                      │
│ Password: John_123!                             │
│ Role:     USER                                  │
│                                                 │
│ Email:    jane@example.com                      │
│ Password: Jane_123!                             │
│ Role:     USER                                  │
└─────────────────────────────────────────────────┘
```

### Files Involved in Auth

```
/frontend/
├── auth.ts                    ← Main NextAuth config
├── app/api/auth/[...nextauth]/route.ts  ← NextAuth router
├── app/sign-in/page.tsx       ← Sign-in UI
├── app/sign-up/page.tsx       ← Sign-up UI
├── actions/login.ts           ← Server action for login
├── lib/auth.ts                ← Auth utilities
├── .env.local                 ← Environment variables
└── prisma/
    ├── schema.prisma          ← Database schema
    └── seed.ts                ← Test data creator
```

### Key Commands

```bash
# Reset database (DANGEROUS - deletes all data)
npx prisma migrate reset --force

# Just seed (keeps existing data)
npx prisma db seed

# View/edit database
npx prisma studio

# Check migrations
npx prisma migrate status

# Run specific migration
npx prisma migrate deploy

# Test database connection
npx prisma db execute --stdin < /dev/null

# Run dev server with debug
DEBUG_AUTH=true npm run dev
```

---

## Decision Tree

```
Start: Try login, see /api/auth/error

├─ Have you ever run: npx prisma migrate reset --force?
│  ├─ NO → Run it now! (Path A)
│  └─ YES → Continue
│
├─ Does database have users?
│  ├─ NO → Run: npx prisma db seed (Path B)
│  └─ YES → Continue
│
├─ Are test users email verified?
│  ├─ NO → Run: npx prisma db execute ... (Path C)
│  └─ YES → Continue
│
├─ Are .env.local variables set correctly?
│  ├─ NO → Fix variables (Path D)
│  └─ YES → Continue
│
└─ Enable debug logging & check logs (Path E)
   └─ Share logs for specific fix
```

---

## Success Checklist

- [ ] `.env.local` has `NEXTAUTH_SECRET` and `DATABASE_URL`
- [ ] Database is accessible (no connection errors)
- [ ] Test users exist in database (verified via Prisma Studio or SQL)
- [ ] Email addresses are marked as verified (`emailVerified` IS NOT NULL)
- [ ] Users are not disabled (`disabled` = false)
- [ ] Dev server running without errors
- [ ] Can access `/sign-in` page without JavaScript errors
- [ ] Test credentials work: `user@test.com` / `Test_123!`
- [ ] Redirected to `/dashboard` after successful login
- [ ] Session cookie exists in browser

---

## Getting Help

If you're still stuck, provide:

1. **Command output:**
   ```bash
   cd /Volumes/Data/Projects/samui-transfers/frontend
   npx prisma db execute --stdin << 'SQL'
   SELECT count(*) FROM "User";
   SELECT * FROM "User" LIMIT 3;
   SQL
   ```

2. **Environment check:**
   ```bash
   grep -E "NEXTAUTH_SECRET|NEXTAUTH_URL|DATABASE_URL" .env.local
   ```

3. **Migration status:**
   ```bash
   npx prisma migrate status
   ```

4. **Debug logs** (with `DEBUG_AUTH=true` in `.env.local`):
   ```bash
   npm run dev 2>&1 | head -100
   ```

5. **Exact error URL** shown in browser

With this information, I can provide a **targeted fix**. 🎯

---

## Success Message

When everything works, you'll see:

```
✅ Logged in successfully
✅ Redirected to /dashboard
✅ Session cookie in browser
✅ User data available in session

Ready to continue with Phase 4!
```

Good luck! 🚀
