# Authentication Redirect Issues - Debugging Guide

## Problem
After successful login, users are not being redirected to their dashboard or admin panel:
- **Users** should redirect to `/dashboard`
- **Admins** should redirect to `/admin`

## Root Causes

### 1. **Session Not Being Persisted** (Most Common)
**Symptom:** Login succeeds, but redirect doesn't happen or goes to sign-in instead

**Causes:**
- Session cookie not being set by NextAuth
- Cookie not being sent in subsequent requests
- NEXTAUTH_SECRET not set correctly
- NEXTAUTH_URL mismatch

**Check:**
```
Browser DevTools → Application → Cookies → Look for:
- next-auth.session-token
- next-auth.jwt
- __Secure-next-auth.session-token
```

If these cookies are NOT present after login, the session isn't being created.

---

### 2. **Cookie Domain/Path Issues**
**Symptom:** Cookie set on local but not on production

**Causes:**
- NEXTAUTH_URL doesn't match actual domain
- Cookie domain mismatch between environments
- Production using HTTPS but cookies set for HTTP

**Solution:**
In Vercel environment variables, set:
```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-here
```

Make sure NEXTAUTH_URL matches your actual domain exactly (with protocol).

---

### 3. **NextAuth Configuration Issues**
**Symptom:** Session exists but role/data is missing

**Check** `auth.ts` has:
```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id
      token.email = user.email
      token.role = user.role as "USER" | "ADMIN"
    }
    return token
  },
  async session({ session, token }) {
    if (session.user && token) {
      session.user.id = token.id as string
      session.user.role = token.role as "USER" | "ADMIN"
    }
    return session
  }
}
```

Both callbacks are needed for JWT strategy.

---

### 4. **Redirect Logic Not Working**
**Symptom:** Login works but no redirect happens

**Check:**
1. Sign-in page is using `window.location.href` (hard redirect)
2. Delay is sufficient (800ms used now)
3. Middleware isn't blocking the redirect

---

## How to Debug

### Step 1: Check Console Logs
The code now includes detailed logging. Open DevTools and look for:

**On Sign-In Page:**
```
🔐 [SignIn] Attempting sign in with: { email: "...", callbackUrl: "..." }
🔐 [SignIn] Sign in response: { error: null, ok: true, status: 200, url: "..." }
✅ [SignIn] Sign in successful, redirecting to: /dashboard
🔄 [SignIn] Performing redirect to: /dashboard
```

**If you see error instead:**
```
❌ [SignIn] Sign in failed: [specific error message]
```

Note the exact error message.

### Step 2: Check Browser Console Network
1. Open DevTools → Network tab
2. Filter for `/api/auth/callback/credentials`
3. Check Response → Should see session data
4. Check Cookies → After this request, new auth cookies should appear

### Step 3: Check Vercel Logs
```bash
vercel logs --tail
```

Look for:
- `[Middleware]` logs showing session detection
- `[Dashboard]` or `[Admin]` logs showing whether session is loaded
- Any errors in auth callbacks

### Step 4: Check Server-Side Session
Add this to dashboard page temporarily to verify session:
```typescript
console.log('Session data:', JSON.stringify(session, null, 2))
```

Then check server logs on Vercel.

---

## Common Issues and Fixes

### Issue 1: Cookie Not Set After Login

**Symptom:** Login succeeds in console but no auth cookies appear

**Diagnosis:**
1. Check NEXTAUTH_SECRET is set
2. Check NEXTAUTH_URL is correct
3. Run locally to verify it works

**Fix:**
```bash
# Local testing
cd frontend

# Add to .env.local
NEXTAUTH_SECRET=super-secret-key-for-testing
NEXTAUTH_URL=http://localhost:3000

npm run dev
# Test login - should see cookies
```

If it works locally but not on Vercel, issue is environment variables.

---

### Issue 2: Login Shows Success But Stays on Sign-In

**Symptom:** Console shows success but no redirect

**Diagnosis:**
1. Check if redirect delay is working
2. Check if middleware is blocking
3. Check if session is being created

**Fix:**
1. Increase delay:
```typescript
setTimeout(() => {
  window.location.href = callbackUrl
}, 1500)  // Increase from 800 to 1500
```

2. Check middleware logs in Vercel

---

### Issue 3: Admin Gets Redirected to `/Denied`

**Symptom:** Admin login succeeds but gets "/Denied" page

**Cause:** User's role is not set as "ADMIN"

**Fix:**
1. Check database - user.role should be "ADMIN"
2. Check JWT callback includes role:
```typescript
token.role = user.role as "USER" | "ADMIN"
```
3. Check session callback includes role:
```typescript
session.user.role = token.role as "USER" | "ADMIN"
```

**Database Check:**
```bash
npx prisma studio
# Go to User table
# Find your user and check role field = "ADMIN"
```

---

### Issue 4: Server Returns 401 Unauthorized

**Symptom:** Login attempt returns 401

**Cause:** Credentials invalid or user not found

**Fix:**
1. Check user exists in database
2. Check email/password are correct
3. Check email is verified
4. Check user not disabled

**Verify:**
```bash
npx prisma studio
# Go to User table
# Find user and check:
# - email matches
# - emailVerified is not null
# - disabled is false
```

---

## Step-by-Step Fix for Production

### 1. **Verify Environment Variables**
```bash
vercel env list
```

Should show:
```
NEXTAUTH_SECRET ✓ Production, Preview
NEXTAUTH_URL ✓ Production, Preview
DATABASE_URL ✓ Production, Preview
```

If any are missing, add them.

### 2. **Check NEXTAUTH_URL Format**
Make sure it's EXACTLY your domain:
```
✓ https://your-domain.com
✓ https://app.your-domain.com
✗ https://your-domain.com/
✗ http://your-domain.com (for HTTPS site)
✗ your-domain.com (missing protocol)
```

### 3. **Verify Database Connection**
```bash
npx prisma db execute
# Should connect successfully
```

### 4. **Check User in Database**
```bash
npx prisma studio
# Go to User table
# Verify your test user:
# - emailVerified is set (not null)
# - password is set
# - disabled = false
# - role = "USER" or "ADMIN"
```

### 5. **Test Login**
1. Go to `/sign-in`
2. Open DevTools Console
3. Look for logs starting with `🔐 [SignIn]`
4. If you see `✅ [SignIn] Sign in successful`, wait for redirect
5. If stuck on sign-in after 2 seconds, issue is redirect or session

### 6. **Check Middleware**
If not redirected but session exists:
1. Check `[Middleware]` logs in Vercel
2. Should see `Session: ✓` for protected routes
3. If showing `Session: ✗`, session cookie not being sent

### 7. **Force Redeploy**
Sometimes the session strategy needs a fresh build:
```bash
git push origin rbac --force-with-lease
# Then redeploy on Vercel
```

---

## Testing Checklist

After fixes, verify:

- [ ] Can login with valid credentials
- [ ] See `✅ [SignIn] Sign in successful` in console
- [ ] Get redirected to `/dashboard` (for user)
- [ ] Get redirected to `/admin` (for admin)
- [ ] Dashboard loads without redirect loop
- [ ] Admin page loads without redirect loop
- [ ] Can access protected routes
- [ ] Logout and re-login works
- [ ] Login persists across page reloads
- [ ] Works on different browsers

---

## Advanced Debugging

### Enable NextAuth Debug Mode
```typescript
// In auth.ts
export const config: NextAuthConfig = {
  // ... other config
  debug: process.env.NEXTAUTH_DEBUG === "true",
}
```

Then set in Vercel:
```
NEXTAUTH_DEBUG=true
```

This will show very detailed logs.

### Test Session Manually
```bash
# After successful login, test session endpoint
curl -H "Cookie: next-auth.session-token=<your-token>" \
  https://your-domain.com/api/auth/session
```

Should return user data.

### Check Cookie Attributes
In DevTools, click on cookie and verify:
- ✓ Domain matches your site
- ✓ Path is "/"
- ✓ Expires is in future (not past)
- ✓ HttpOnly is checked
- ✓ Secure is checked (for HTTPS)
- ✓ SameSite is "Lax" or "Strict"

---

## Support Information

If you've gone through all these steps and still having issues, provide:

1. **Console logs** (from browser DevTools)
2. **Vercel logs** (from `vercel logs`)
3. **Error message** (exact text)
4. **Environment** (local vs production)
5. **User role** (USER or ADMIN)
6. **Steps to reproduce** (exact sequence)

Contact: support@samui-transfers.com

---

## Summary

**For most cases:**
1. Check environment variables are set in Vercel
2. Verify NEXTAUTH_URL matches your domain exactly
3. Check browser console for logs
4. If no logs, cookies not being set (environment issue)
5. If logs show success but no redirect, middleware/redirect issue

**Quick test:**
```bash
# This should show you're logged in
curl -I https://your-domain.com/dashboard
# Should be 200 OK, not 307 redirect to /sign-in
```
