# Authentication Troubleshooting Guide

## Issue: Sign-in Redirects Back to `/sign-in?callbackUrl=%2Fadmin`

### Root Causes & Solutions

#### 1. **Session/JWT Token Not Being Set**

**Symptom:** After successful sign-in, user is redirected back to sign-in page

**Fix:** Ensure these environment variables are set in Vercel:
- `NEXTAUTH_SECRET` - Must be set (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Must match your domain exactly (e.g., `https://www.samui-transfers.com`)
- `DATABASE_URL` - Must be valid PostgreSQL connection

**Debug:**
1. Check browser DevTools → Application → Cookies
2. Look for these cookies:
   - `next-auth.jwt` (JWT token)
   - `next-auth.session-token` (session)
   - `__Secure-next-auth.jwt` (production)
   - `__Secure-next-auth.session-token` (production)

If these cookies are NOT present, the session wasn't created.

---

#### 2. **User Email Not Verified**

**Symptom:** Sign-in fails with "Please verify your email before signing in"

**Fix:**
1. Go to `/verify-email`
2. Request email resend
3. Check email inbox
4. Click verification link
5. Try signing in again

**Vercel Check:** 
- Ensure SMTP email variables are set correctly
- Check function logs for email sending errors

---

#### 3. **Admin User Role Not Set**

**Symptom:** Can sign in but `/admin` redirect fails

**Fix:** Verify in database:
```sql
SELECT id, email, role, emailVerified FROM "User" WHERE email = 'admin@example.com';
```

Ensure:
- `role` = `ADMIN` (not `USER`)
- `emailVerified` is NOT NULL

---

#### 4. **Middleware Blocking Authenticated Requests**

**Symptom:** User stays on sign-in page even with valid session

**Fix:** Clear browser cookies and try signing in again
```javascript
// In browser console:
document.cookie.split(";").forEach(c => {
  document.cookie = c.split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;";
});
```

Then sign out completely and sign in again.

---

### Complete Debugging Checklist

#### Step 1: Verify Environment Variables
```bash
# Check Vercel Settings → Environment Variables has:
✓ NEXTAUTH_SECRET
✓ NEXTAUTH_URL (exact domain)
✓ DATABASE_URL
✓ EMAIL configuration
```

#### Step 2: Test Database Connection
```sql
-- In your database, verify user exists and is verified:
SELECT id, email, emailVerified, role FROM "User" WHERE email = 'user@test.com';
```

Expected output:
```
id          | email        | emailVerified | role
------------|--------------|---------------|------
abc123      | user@test.com| 2024-12-01   | ADMIN
```

#### Step 3: Check Browser Cookies After Sign-In
1. Sign in at `/sign-in`
2. Open DevTools (F12)
3. Go to Application → Cookies
4. Look for `next-auth.jwt` or session cookies
5. If missing → Session creation failed

#### Step 4: Check Vercel Function Logs
1. Go to https://vercel.com/dashboard/[project]/functions
2. Check logs for `/api/auth/callback/credentials`
3. Look for errors during session creation

#### Step 5: Test Local Authentication (if applicable)
```bash
cd frontend

# Set up .env.local
DATABASE_URL=your_connection_string
NEXTAUTH_SECRET=any-secret-for-local
NEXTAUTH_URL=http://localhost:3000

# Run locally
npm run dev

# Test at http://localhost:3000/sign-in
```

---

### Quick Fix Summary

**If stuck on `/sign-in?callbackUrl=%2Fadmin`:**

1. ✅ Clear all cookies (sign out everywhere)
2. ✅ Check NEXTAUTH_SECRET is set in Vercel
3. ✅ Check NEXTAUTH_URL matches your domain exactly
4. ✅ Verify user email is verified in database
5. ✅ Verify user role is `ADMIN` in database
6. ✅ Try signing in again (fresh session)

---

### Production vs Local Differences

| Aspect | Local | Production (Vercel) |
|--------|-------|-------------------|
| NEXTAUTH_URL | http://localhost:3000 | https://your-domain.com |
| Cookie | next-auth.jwt | __Secure-next-auth.jwt |
| Database | Local PostgreSQL | Neon/Railway Cloud |
| Secret | Any value | Must be set |

---

### Advanced: Force Session Refresh

If cookies are set but redirect fails:

**Option 1: Browser Console**
```javascript
window.location.href = '/admin'
```

**Option 2: Check Session**
```javascript
// In browser (requires @next-auth/react):
import { useSession } from 'next-auth/react'
const { data: session, status } = useSession()
console.log({ session, status })
```

**Expected output:**
```javascript
{
  session: {
    user: {
      email: 'admin@example.com',
      role: 'ADMIN'
    }
  },
  status: 'authenticated'
}
```

---

### Contact Support

If issue persists:
1. Export browser console logs
2. Check Vercel function logs
3. Verify database records
4. Share environment variable names (not values) that are set
