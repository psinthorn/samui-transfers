# 🔐 Auth Login Error Debugging Guide

## Problem
When attempting to login via the form at `/sign-in`, you're being redirected to `/api/auth/error` instead of being authenticated.

---

## 🔍 Step 1: Check Database Seeding

The first step is to ensure test users exist in your database with verified emails.

### Step 1a: Reset and Seed Database

```bash
cd /Volumes/Data/Projects/samui-transfers/frontend

# Option 1: Reset everything (CAREFUL - deletes all data)
npx prisma migrate reset --force

# Option 2: Just reseed if migrations are up to date
npx prisma db seed
```

**Expected Output:**
```
🌱 Seeding database...
✅ Seeded admin: admin@admin.com
✅ Created 3 test users
```

### Step 1b: Verify Users in Database

Create a quick verification script:

```bash
# Create a temporary script to check users
cat > /tmp/check_users.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      disabled: true,
      createdAt: true,
    },
  });
  
  console.log('📋 Users in database:');
  console.table(users);
  
  process.exit(0);
}

main();
EOF

node /tmp/check_users.js
```

---

## 🔍 Step 2: Enable Debug Logging

The auth configuration already has debug logging. Enable it:

### Step 2a: Set Environment Variables

Add to your `.env.local`:
```bash
DEBUG_AUTH=true
NODE_ENV=development
```

### Step 2b: Restart Dev Server

```bash
cd /Volumes/Data/Projects/samui-transfers/frontend
npm run dev
```

### Step 2c: Check Terminal Output

When you attempt to login, you should see logs like:
```
[AUTH] Authorize called { email: 'user@test.com' }
[AUTH] User authorized successfully { email: 'user@test.com', role: 'USER' }
[AUTH] JWT callback called { user: true, account: false }
[AUTH] Session callback called { email: 'user@test.com' }
```

**If you see errors**, copy the full error message.

---

## 🔍 Step 3: Test Login Credentials

### Test Credentials (from seed):
```
Email: user@test.com
Password: Test_123!

OR

Email: admin@admin.com
Password: Admin_123!

OR

Email: john@example.com
Password: John_123!
```

### Test in Browser

1. Go to `http://localhost:3000/sign-in`
2. Enter one of the test credentials above
3. Click "Sign In"
4. Check:
   - Browser console (F12 → Console tab)
   - Terminal output (for [AUTH] logs)
   - Network tab (for `/api/auth/callback/credentials` request)

---

## 🔍 Step 4: Check Error Details

### If Redirect to /api/auth/error Happens:

NextAuth adds an error parameter. Check the URL:
```
http://localhost:3000/api/auth/error?error=SomeErrorCode
```

Common errors:
- `error=AccessDenied` → Credentials invalid or user check failed
- `error=CredentialsSignin` → Wrong email/password
- `error=Callback` → Callback function error
- `error=Default` → Unknown error

### Decode the Error

1. Open Browser DevTools (F12)
2. Go to Network tab
3. Try to login again
4. Find the request to `/api/auth/callback/credentials`
5. Check the response - it should show the error

### Check Cookies

1. Open Browser DevTools (F12)
2. Go to Application tab → Cookies
3. Look for `next-auth.session-token` (after successful login)
4. If it doesn't exist after login, the session callback failed

---

## 🔍 Step 5: Manual Auth Test

Create a test script to verify the entire auth flow:

```bash
cat > /tmp/test_auth.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuth() {
  console.log('🧪 Testing authentication flow...\n');
  
  // Test 1: Find user
  const email = 'user@test.com';
  const password = 'Test_123!';
  
  console.log(`1️⃣ Looking for user: ${email}`);
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log('❌ User not found! Run: npx prisma db seed');
    process.exit(1);
  }
  
  console.log(`✅ User found:`);
  console.log(`   - Email: ${user.email}`);
  console.log(`   - Name: ${user.name}`);
  console.log(`   - Role: ${user.role}`);
  console.log(`   - Email Verified: ${user.emailVerified ? '✅' : '❌'}`);
  console.log(`   - Disabled: ${user.disabled ? 'YES ❌' : 'NO ✅'}`);
  console.log(`   - Has Password: ${user.password ? '✅' : '❌'}`);
  
  // Test 2: Check password
  console.log(`\n2️⃣ Testing password: "${password}"`);
  
  if (!user.password) {
    console.log('❌ No password hash found!');
    process.exit(1);
  }
  
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (isPasswordValid) {
    console.log('✅ Password matches!');
  } else {
    console.log('❌ Password does NOT match');
    console.log('   Try: Admin_123! or John_123!');
  }
  
  // Test 3: Check all conditions
  console.log(`\n3️⃣ Checking all login conditions:`);
  
  const checks = [
    { name: 'User exists', pass: !!user },
    { name: 'Password hash exists', pass: !!user.password },
    { name: 'Email verified', pass: !!user.emailVerified },
    { name: 'User not disabled', pass: !user.disabled },
    { name: 'Password correct', pass: isPasswordValid },
  ];
  
  let allPass = true;
  checks.forEach(check => {
    console.log(`   ${check.pass ? '✅' : '❌'} ${check.name}`);
    if (!check.pass) allPass = false;
  });
  
  console.log(`\n${allPass ? '✅ LOGIN SHOULD WORK!' : '❌ LOGIN WILL FAIL'}`);
  
  process.exit(0);
}

testAuth().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
EOF

node /tmp/test_auth.js
```

---

## 🛠️ Step 6: Fix Common Issues

### Issue 1: "User not found or password not set"

**Cause:** Test user doesn't exist or has no password
**Fix:**
```bash
npx prisma migrate reset --force
```

### Issue 2: "Email not verified"

**Cause:** The seed didn't set `emailVerified` to a date
**Fix:**
```bash
# Option A: Reseed
npx prisma db seed

# Option B: Manual fix in database
# Connect to your database and update:
# UPDATE "User" SET "emailVerified" = NOW() WHERE email = 'user@test.com';
```

### Issue 3: "Invalid password"

**Cause:** Wrong password or password not hashed correctly
**Fix:**
```bash
# Re-seed the database
npx prisma db seed

# Then try: user@test.com / Test_123!
```

### Issue 4: "User account is disabled"

**Cause:** User was disabled (likely for testing)
**Fix:**
```bash
# Reseed or manually update:
# UPDATE "User" SET "disabled" = false WHERE email = 'user@test.com';
```

### Issue 5: JWT or Session Callback Error

**Cause:** Issue in the JWT or session callback logic
**Fix:** Check terminal output for `[AUTH]` logs, then review `/auth.ts` callbacks

---

## ✅ Complete Testing Checklist

Use this checklist to systematically verify everything:

- [ ] Database exists and is accessible
  ```bash
  npx prisma db execute --stdin < /dev/null
  ```

- [ ] All migrations are applied
  ```bash
  npx prisma migrate status
  ```

- [ ] Test users are seeded
  ```bash
  node /tmp/check_users.js
  ```

- [ ] Password hashing works
  ```bash
  node /tmp/test_auth.js
  ```

- [ ] Auth environment variables are set
  ```bash
  echo $NEXTAUTH_SECRET
  echo $NEXTAUTH_URL
  ```

- [ ] Dev server is running without errors
  ```bash
  npm run dev
  ```

- [ ] Debug logging is enabled
  ```bash
  DEBUG_AUTH=true npm run dev
  ```

- [ ] Login form loads without errors
  - Visit `http://localhost:3000/sign-in`
  - Check browser console for errors

- [ ] Test credentials work
  - Try: `user@test.com` / `Test_123!`
  - Check terminal output for [AUTH] logs

- [ ] Successful login redirects to dashboard
  - Should redirect to `/dashboard`
  - Should have session cookie

---

## 🚀 Quick Fix (Most Common Solution)

If you just set up the project or haven't seeded yet:

```bash
cd /Volumes/Data/Projects/samui-transfers/frontend

# 1. Reset database and run all migrations
npx prisma migrate reset --force

# 2. Restart dev server
npm run dev

# 3. Try login with:
# Email: user@test.com
# Password: Test_123!
```

**If this works**, you're done! ✅

**If it still fails**, run the test script above and share the output.

---

## 📊 Debug Information to Collect

If you still have issues, gather this information:

```bash
# 1. Check environment
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo "NEXTAUTH_URL=$NEXTAUTH_URL"
echo "DATABASE_URL length: ${#DATABASE_URL}"

# 2. Check database connection
npx prisma db execute --stdin <<< "SELECT 1"

# 3. Check users
node /tmp/check_users.js

# 4. Test auth flow
node /tmp/test_auth.js

# 5. Check migrations
npx prisma migrate status

# 6. Restart with debug logging
DEBUG_AUTH=true npm run dev 2>&1 | tee auth-debug.log
```

Then attempt login and share the output of `auth-debug.log`.

---

## 🎯 Resolution Path

**Path A (Database not seeded):**
```
Run: npx prisma migrate reset --force
├─ Deletes all data
├─ Creates fresh schema
├─ Seeds test users
└─ Login works!
```

**Path B (Database exists but users missing):**
```
Run: npx prisma db seed
├─ Keeps all existing data
├─ Creates/updates test users
└─ Login works!
```

**Path C (Email not verified):**
```
Run: Database query to set emailVerified
└─ Login works!
```

**Path D (Verify with debug logs):**
```
Enable DEBUG_AUTH=true
Attempt login
Check [AUTH] logs in terminal
Fix based on error message
```

---

## 🆘 Still Having Issues?

If none of the above works, please provide:

1. **Terminal output** from the test script
2. **Browser console errors** (F12 → Console)
3. **Network tab** screenshot (F12 → Network, attempt login, show request/response)
4. **Auth debug logs** (output from `DEBUG_AUTH=true npm run dev`)
5. **Exact error URL** you see (the `/api/auth/error?error=...` URL)

Then I can provide a targeted fix.

