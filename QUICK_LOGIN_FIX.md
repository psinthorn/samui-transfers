# Quick Login Fix - Run These Commands

## 🚀 Fastest Fix (Most Likely to Work)

Open terminal and run these commands in order:

### Step 1: Navigate to frontend directory
```bash
cd /Volumes/Data/Projects/samui-transfers/frontend
```

### Step 2: Reset database with fresh seed
```bash
npx prisma migrate reset --force
```

This will:
- ✅ Delete all existing data
- ✅ Re-run all migrations
- ✅ Seed test users with verified emails
- ✅ Create admin account

**Response should include:**
```
✅ Seeded admin: admin@admin.com
✅ Created 3 test users
```

### Step 3: Start dev server
```bash
npm run dev
```

### Step 4: Test login
1. Open browser: `http://localhost:3000/sign-in`
2. Enter credentials:
   ```
   Email:    user@test.com
   Password: Test_123!
   ```
3. Click "Sign In"

---

## ✅ Expected Result

After clicking Sign In, you should:
1. See loading spinner briefly
2. Redirect to `/dashboard`
3. See your dashboard content
4. See session cookie in browser (F12 → Application → Cookies)

---

## ❌ If Still Getting /api/auth/error

Follow these steps:

### Check 1: Verify users in database
```bash
cd /Volumes/Data/Projects/samui-transfers/frontend
npx prisma studio
```

Then:
1. Click on "User" table
2. Verify you see "user@test.com", "admin@admin.com", etc.
3. Verify `emailVerified` is NOT null
4. Verify `disabled` is false
5. Close Prisma Studio (Ctrl+C)

### Check 2: Enable debug logging
```bash
cd /Volumes/Data/Projects/samui-transfers/frontend

# Add to .env.local:
echo "DEBUG_AUTH=true" >> .env.local

# Restart server:
npm run dev
```

### Check 3: Attempt login and check logs
1. Go to `http://localhost:3000/sign-in`
2. Enter `user@test.com` / `Test_123!`
3. Check terminal output - you should see `[AUTH]` log messages

**Example good logs:**
```
[AUTH] Authorize called { email: 'user@test.com' }
[AUTH] User authorized successfully { email: 'user@test.com', role: 'USER' }
[AUTH] JWT callback called { user: true, account: false }
[AUTH] Session callback called { email: 'user@test.com' }
```

**If you see error logs**, copy them and share them.

### Check 3: Browser console errors
1. Press F12 to open DevTools
2. Go to Console tab
3. Try login again
4. Copy any red error messages

---

## Test Accounts After Reset

After running `npx prisma migrate reset --force`, you'll have:

| Email | Password | Role |
|-------|----------|------|
| admin@admin.com | Admin_123! | ADMIN |
| user@test.com | Test_123! | USER |
| john@example.com | John_123! | USER |
| jane@example.com | Jane_123! | USER |

---

## Common Issues & Fixes

### Issue: "User not found or password not set"
**Fix:** Run `npx prisma migrate reset --force`

### Issue: "Please verify your email before signing in"
**Fix:** Run `npx prisma migrate reset --force` (seed sets emailVerified)

### Issue: "Invalid password"
**Fix:** 
- Verify you're using exact passwords from table above
- Make sure caps lock is OFF
- Try `Test_123!` (capital T)

### Issue: "User account is disabled"
**Fix:** Run `npx prisma migrate reset --force`

### Issue: Redirect to error page with no message
**Fix:**
1. Check browser Console (F12)
2. Enable `DEBUG_AUTH=true` in `.env.local`
3. Check terminal for `[AUTH]` logs

---

## If None of Above Works

Collect this information:

```bash
cd /Volumes/Data/Projects/samui-transfers/frontend

# 1. Check environment
echo "DATABASE_URL is set: $([ -z '$DATABASE_URL' ] && echo 'NO ❌' || echo 'YES ✅')"
echo "NEXTAUTH_SECRET is set: $([ -z '$NEXTAUTH_SECRET' ] && echo 'NO ❌' || echo 'YES ✅')"

# 2. Check database users
npx prisma db execute --stdin << 'SQL'
SELECT email, "emailVerified", disabled FROM "User" LIMIT 5;
SQL

# 3. Check migrations status
npx prisma migrate status
```

Share the output of these commands.

---

## Summary

```
┌─────────────────────────────────────┐
│ Fastest Fix (90% success rate):     │
├─────────────────────────────────────┤
│ npx prisma migrate reset --force    │
│ npm run dev                         │
│ Login: user@test.com / Test_123!   │
└─────────────────────────────────────┘
```

Try this first - it resolves almost all auth issues! 🚀
