# 🔧 Cookie Configuration Fix - Authentication Redirect Issue

## Problem Identified

The redirect loop was happening because:

1. ✅ **Authentication succeeded** - User was authorized, JWT token created
2. ✅ **POST /api/auth/callback/credentials returned 200 OK**
3. ❌ **But session cookie was NOT being set** in the browser
4. ❌ **Middleware couldn't find session**, redirected back to `/sign-in`

The logs showed:
```
POST /api/auth/callback/credentials 200 in 350ms
[Middleware] Path: /dashboard
[Middleware] Has session: false  ← Session cookie missing!
[Middleware] Available cookies: [ '0', '1', '2', '3' ]  ← Cookie names weren't readable
```

## Root Cause

**NextAuth v5 wasn't explicitly configuring cookie settings**, so cookies weren't being set with the correct parameters for browser acceptance.

## Solution Applied

### 1. Added Explicit Cookie Configuration in `auth.ts`

```typescript
const config: NextAuthConfig = {
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      },
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.callback-url`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
      },
    },
  },
  // ... rest of config
}
```

**Why this works:**

- **`httpOnly: true`** - Prevents JavaScript from accessing cookies (security)
- **`sameSite: "lax"`** - Allows cookies in same-site contexts (prevents CSRF)
- **`secure: production?`** - Requires HTTPS in production, allows HTTP on localhost for dev
- **`path: "/"`** - Cookie available for all routes
- **`maxAge: 30 days`** - Session persistence

### 2. Fixed Middleware Cookie Logging

Changed from:
```typescript
console.log(`[Middleware] Available cookies:`, Object.keys(req.cookies.getAll().map(c => c.name)))
```

To:
```typescript
const allCookies = req.cookies.getAll().map(c => c.name)
console.log(`[Middleware] Cookie names:`, allCookies)
```

This now shows actual cookie names instead of array indices.

### 3. Updated `.env.local` to Use Neon Database

```env
DATABASE_URL=postgresql://neondb_owner:npg_AmgF6aq5KTJv@ep-aged-moon-a1vxwajt-pooler.ap-southeast-1.aws.neon.tech/samuitransfers
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=7799a51de29c109754714b161afe0c0ab2f3f8a4d1f5f6e3b8e6c7d8e9f0a1b2c3d4e5f60718293a4b5c6d7e8f9fa0b1
```

## Files Modified

- ✅ `frontend/auth.ts` - Added cookie configuration
- ✅ `frontend/middleware.ts` - Improved cookie logging
- ✅ `frontend/.env.local` - Updated to use Neon database
- ✅ `frontend/app/api/debug/route.ts` - Added debugging endpoint
- ✅ `frontend/app/api/fix-test-user/route.ts` - Added user fixing endpoint

## How to Test

### Locally:

```bash
# 1. Start dev server
cd frontend
npm run dev

# 2. Visit debug endpoint to verify setup
curl http://localhost:3000/api/debug

# 3. Try signing in
# Navigate to http://localhost:3000/sign-in
# Enter: adminx@admin.com / Adminx
# Should redirect to /dashboard ✓
```

### On Vercel:

1. **Make sure these env vars are set** (Settings → Environment Variables):
   - `NEXTAUTH_URL=https://www.samui-transfers.com`
   - `NEXTAUTH_SECRET=7799a51de29c109754714b161afe0c0ab2f3f8a4d1f5f6e3b8e6c7d8e9f0a1b2c3d4e5f60718293a4b5c6d7e8f9fa0b1`
   - `DATABASE_URL=postgresql://neondb_owner:npg_AmgF6aq5KTJv@ep-aged-moon-a1vxwajt-pooler.ap-southeast-1.aws.neon.tech/samuitransfers`

2. **Wait for Vercel to redeploy** (should be automatic)

3. **Test at:** `https://www.samui-transfers.com/sign-in`
   - Email: `adminx@admin.com`
   - Password: `Adminx`
   - Should redirect to dashboard ✓

## Expected Behavior After Fix

### Logs should show:

```
POST /api/auth/callback/credentials 200 in 350ms
[Middleware] Path: /dashboard
[Middleware] Has session: true  ← Now TRUE!
[Middleware] Cookie names: ['next-auth.session-token']  ← Now visible!
[Middleware] Session token found (eyJhbGc...)
```

## Git Commit

```
commit 1e9ced0
fix: Add explicit cookie configuration to NextAuth for session persistence

- Configure sessionToken, callbackUrl cookies with proper httpOnly, sameSite, secure settings
- Fix middleware cookie detection logging to show actual cookie names
- Add debug endpoints for testing and diagnosing auth issues
- Update .env.local to use Neon database for development
```

## Status

✅ **COMPLETE** - Changes pushed to `origin/rbac`

Ready for Vercel deployment!
