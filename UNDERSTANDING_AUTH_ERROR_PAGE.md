# Understanding the /api/auth/error Redirect

## What is `/api/auth/error`?

This is a **NextAuth error page** that gets shown when the authentication process fails. It's part of NextAuth's standard configuration.

### Why Are You Seeing It?

When you attempt to login and see this URL:
```
http://localhost:3000/api/auth/error
```

It means one of these occurred:

1. **Credentials Provider Failed** - The user validation threw an error
2. **Callback Failed** - The JWT or session callback threw an error
3. **Unknown Error** - NextAuth encountered an unhandled error

---

## How to See the Actual Error

The error message is usually passed as a query parameter. Check the full URL:

```
http://localhost:3000/api/auth/error?error=SomeErrorCode
```

### Common Error Codes

| Error Code | Meaning | Fix |
|-----------|---------|-----|
| `AccessDenied` | User validation failed | Check user exists and emailVerified is set |
| `CredentialsSignin` | Wrong email/password | Verify credentials are correct |
| `Callback` | JWT/Session callback failed | Check terminal for [AUTH] logs |
| `Default` | Unknown error | Check browser console (F12) |

---

## Current Configuration

Your auth configuration in `/auth.ts` has this error handling:

```typescript
pages: {
  signIn: "/sign-in",
  error: "/sign-in"  // ← Redirects errors back to sign-in page
}
```

This means:
- ✅ Sign in page is `/sign-in`
- ✅ Errors redirect back to `/sign-in` (good UX)
- ⚠️ But the error message might not be shown properly

---

## Why Error Message Might Not Show

In your sign-in page (`/app/sign-in/page.tsx`), there's code to handle errors:

```tsx
const urlError = params?.get("error") || null

{(error || urlError) && (
  <div className="p-4 rounded-lg bg-red-50 border-l-4 border-[#D94141]">
    <p className="font-medium">{error || invalidMsg}</p>
  </div>
)}
```

**Problem:** The error page (`/api/auth/error`) might be loading instead of the sign-in page with the error message.

---

## How to Get More Details

### Option 1: Browser Console (Fastest)
```
1. Press F12
2. Go to Console tab
3. Look for error messages (red text)
4. Look for logs starting with "[AUTH]"
5. Screenshot and share
```

### Option 2: Enable Debug Logging
```bash
# Add to .env.local:
DEBUG_AUTH=true

# Restart server:
npm run dev

# Attempt login, check terminal for [AUTH] logs
```

### Option 3: Network Tab
```
1. Press F12
2. Go to Network tab
3. Attempt login
4. Find the request to `/api/auth/callback/credentials`
5. Click on it
6. Check Response tab for error details
```

### Option 4: Check the Error Page Itself
The `/api/auth/error` page might display the error. Try:
```
http://localhost:3000/api/auth/error
http://localhost:3000/api/auth/error?error=CredentialsSignin
```

You might see a NextAuth error page with more details.

---

## Troubleshooting Flow

```
┌─ Redirected to /api/auth/error
│
├─ Step 1: Check browser console (F12)
│  ├─ See JavaScript errors? → Fix them
│  └─ No JS errors? → Continue
│
├─ Step 2: Enable DEBUG_AUTH=true
│  ├─ See [AUTH] logs? → Check log messages
│  │  ├─ "User not found" → Reseed database
│  │  ├─ "Email not verified" → Reseed database
│  │  ├─ "Invalid password" → Check credentials
│  │  └─ Other → Research error message
│  └─ No [AUTH] logs? → Might be Node/middleware issue
│
├─ Step 3: Check Network tab (F12)
│  ├─ Request to /api/auth/callback/credentials? → Check response
│  └─ Different request? → Middleware might be blocking
│
└─ Step 4: Check database
   ├─ User exists? → npx prisma studio
   └─ Email verified? → npx prisma migrate reset --force
```

---

## Code That Might Fail

The login flow in `/app/sign-in/page.tsx`:

```tsx
const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)
  startTransition(async () => {
    try {
      await signIn("credentials", { 
        email, 
        password, 
        redirect: true,  // ← NextAuth handles redirect
        callbackUrl      // ← Where to redirect after login
      })
    } catch (err) {
      console.error("SignIn error:", err)
      setError(invalidMsg)
    }
  })
}
```

**Potential issues:**
1. `signIn("credentials", ...)` is throwing an error before redirect
2. User validation in `auth.ts` is throwing an error
3. JWT callback is throwing an error
4. Session callback is throwing an error

---

## How to Debug Each Step

### Step 1: Test User Validation
```javascript
// In browser console after running the fixes:
fetch('/api/auth/callback/credentials', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: 'username=user@test.com&password=Test_123!',
})
.then(r => r.text())
.then(t => console.log(t))
```

This will show you what the credentials endpoint returns.

### Step 2: Test Database Query
```bash
cd /Volumes/Data/Projects/samui-transfers/frontend

node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findUnique({ where: { email: 'user@test.com' } })
  .then(u => console.log(u))
  .catch(e => console.error(e))
"
```

### Step 3: Test Password Hash
```bash
node -e "
const bcrypt = require('bcryptjs');
const hash = '\$2a\$10\$...'; // Get from database
const pwd = 'Test_123!';
bcrypt.compare(pwd, hash).then(m => console.log(m ? '✅ Match' : '❌ No match'))
"
```

---

## The Fix (Summary)

The `/api/auth/error` redirect happens because the authentication is **failing somewhere in the chain**.

**99% of the time, it's because:**

1. **Test user doesn't exist**
   ```bash
   npx prisma migrate reset --force
   ```

2. **User email not verified**
   ```bash
   npx prisma migrate reset --force
   ```

3. **Wrong password**
   - Try: `user@test.com` / `Test_123!`

4. **Environment variable missing**
   - Check: `NEXTAUTH_SECRET` and `DATABASE_URL` in `.env.local`

---

## Quick Debug Commands

Copy-paste these one by one:

```bash
# 1. Check env vars
grep -E "NEXTAUTH_SECRET|DATABASE_URL" /Volumes/Data/Projects/samui-transfers/frontend/.env.local

# 2. Check database
cd /Volumes/Data/Projects/samui-transfers/frontend
npx prisma db execute --stdin << 'SQL'
SELECT count(*) as "User Count", 
       sum(case when "emailVerified" IS NOT NULL then 1 else 0 end) as "Verified Count"
FROM "User";
SQL

# 3. Reset and seed (nuclear option)
npx prisma migrate reset --force

# 4. Start server
npm run dev
```

After these, try login with `user@test.com` / `Test_123!`

---

## Still Stuck?

Provide these:

1. Full URL shown in browser (including query parameters)
2. Terminal output (with DEBUG_AUTH=true)
3. Browser console errors (F12 → Console)
4. Network request/response (F12 → Network → /api/auth/callback/credentials)
5. Output of:
   ```bash
   npx prisma db execute --stdin << 'SQL'
   SELECT email, "emailVerified", disabled FROM "User" LIMIT 3;
   SQL
   ```

I can then provide a **specific fix** for your situation. 🎯
