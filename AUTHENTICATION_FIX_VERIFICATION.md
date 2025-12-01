# Authentication Redirect Fix - Verification Guide

## Summary of Changes Made

### 1. **Improved `auth.ts`**
✅ Added comprehensive debug logging
✅ Added error handling to callbacks
✅ Added explicit `basePath: "/api/auth"` configuration
✅ Added try-catch blocks in JWT and session callbacks
✅ Log initialization config on startup

**Impact:** Better error tracking and Vercel-specific configuration

### 2. **Simplified `app/sign-in/page.tsx`**
✅ Changed from `redirect: false` to `redirect: true`
✅ Removed complex two-phase redirect logic
✅ Let NextAuth handle redirects directly
✅ Kept error handling and user feedback

**Impact:** More reliable redirect using NextAuth's built-in mechanism

### 3. **Enhanced `middleware.ts`**
✅ Added better debugging for cookie detection
✅ Added conditional logging based on DEBUG_AUTH env var
✅ Improved cookie name logging
✅ Better error messages

**Impact:** Easier debugging in Vercel logs

## Pre-Deployment Checklist

### ✅ CRITICAL: Vercel Environment Variables

Before deploying, verify these variables are set in Vercel:

```
NEXTAUTH_SECRET=<strong-random-value>
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
DATABASE_URL=<your-database-url>
SMTP_SSL_HOST=<your-smtp-host>
SMTP_SSL_PORT=<your-smtp-port>
SMTP_SSL_USER=<your-smtp-user>
SMTP_SSL_PASS=<your-smtp-password>
```

**IMPORTANT:** 
- `NEXTAUTH_URL` must match your actual Vercel domain or custom domain
- No trailing slashes
- Must be HTTPS in production
- Must match the domain users will use to access the app

### ✅ Optional: Enable Debug Logging

To troubleshoot issues on Vercel, add to environment variables:
```
DEBUG_AUTH=true
```

This will log additional information to Vercel's function logs.

## Step-by-Step Verification

### Step 1: Test Locally First

```bash
# Install dependencies
npm install

# Set environment variables
cat > .env.local << EOF
DATABASE_URL=<your-local-db-or-dev-db>
NEXTAUTH_SECRET=test-secret-for-local-testing-only
NEXTAUTH_URL=http://localhost:3000
EOF

# Run local dev server
npm run dev
```

**Manual Test:**
1. Open http://localhost:3000/sign-in
2. Enter valid test credentials
3. Check browser console for debug logs
4. Verify redirect happens to /dashboard
5. Check cookies in DevTools → Application → Cookies
6. Look for `next-auth.jwt` or similar cookie

**Expected Behavior:**
- Login succeeds
- Redirected to /dashboard or /admin (depending on role)
- Cookie is set in browser
- No console errors

### Step 2: Test on Vercel Preview Deployment

1. Push changes to GitHub
2. Create a preview deployment on Vercel
3. Verify all env vars are set
4. Visit preview URL and test login:
   ```
   https://your-branch-name.your-project.vercel.app/sign-in
   ```

**Manual Test:**
1. Enter valid credentials
2. Check browser DevTools Network tab:
   - POST to `/api/auth/callback/credentials` should return 200 or 307
   - Response should have Set-Cookie header
3. Check Application tab → Cookies:
   - Should see `__Secure-next-auth.session-token` or `__Secure-next-auth.jwt`
   - Domain should match your Vercel domain
4. Verify redirect to /dashboard happens
5. Check Vercel function logs for debug output

**Vercel Logs:**
```bash
# View logs in Vercel CLI
vercel logs <your-deployment-url>

# Or view in Vercel dashboard: Deployments → Select deployment → Functions
```

### Step 3: Test Admin Redirect

1. Login with an ADMIN account
2. Navigate to /admin
3. Should see admin dashboard
4. If role is not ADMIN, should redirect to /Denied

### Step 4: Test Protected Routes

1. After logout, try to directly access:
   - `/dashboard` → should redirect to `/sign-in?callbackUrl=/dashboard`
   - `/admin` → should redirect to `/sign-in?callbackUrl=/admin`
   - `/booking` → should redirect to `/sign-in?callbackUrl=/booking`

2. Complete login
3. Should redirect back to the originally requested page

### Step 5: Test Session Persistence

1. Login successfully
2. Refresh page (F5)
3. Should remain logged in
4. Navigate between pages
5. Session should persist

### Step 6: Test Cookie Security

In browser DevTools → Application → Cookies → Check __Secure cookie:
- ✅ HttpOnly should be checked
- ✅ Secure should be checked (HTTPS only)
- ✅ SameSite should be set to appropriate value
- ✅ Domain should match your site

## Troubleshooting Guide

### ❌ Problem: Redirect not working on Vercel but works locally

**Likely Causes:**
1. `NEXTAUTH_URL` not set or incorrect
2. Domain mismatch in cookies
3. Custom domain not configured properly in Vercel

**Solutions:**
1. Verify `NEXTAUTH_URL` in Vercel dashboard
2. Check Set-Cookie header includes correct domain
3. Verify custom domain DNS settings in Vercel

### ❌ Problem: User stays on /sign-in after login

**Likely Causes:**
1. Cookie not being set
2. Middleware not detecting cookie
3. CSRF token mismatch
4. Session callback error

**Solutions:**
1. Check Network tab for Set-Cookie header
2. Check Application tab for cookies
3. Add `DEBUG_AUTH=true` to env vars
4. Check Vercel logs for errors in auth callbacks
5. Verify JWT callback is completing successfully

### ❌ Problem: "User not found" error even with valid credentials

**Likely Causes:**
1. Database connection issue
2. User email has typo/case mismatch
3. User account not verified
4. User account disabled

**Solutions:**
1. Check `DATABASE_URL` in Vercel
2. Verify user exists in database
3. Check user email verification status
4. Check if user account is disabled

### ❌ Problem: Cookies showing as non-HttpOnly or non-Secure

**Likely Causes:**
1. Using HTTP instead of HTTPS in production
2. `trustHost: true` not set
3. Domain configuration issue

**Solutions:**
1. Ensure deployment uses HTTPS
2. Verify `trustHost: true` is in auth.ts
3. Check Vercel domain configuration

## Debugging with Environment Variables

Add to Vercel deployment:

```
DEBUG_AUTH=true          # Enable auth debugging
NODE_DEBUG=*            # Enable all Node.js debugging (use sparingly)
```

Then check logs with:
```bash
vercel logs --follow <deployment-url>
```

## Test Credentials (For Testing)

Create test users with different roles:
- Regular USER for testing /dashboard access
- ADMIN user for testing /admin access
- Unverified user for testing email verification flow

## Rollback Plan

If issues occur after deployment:

1. **Quick Rollback:**
   ```bash
   # Revert the commit
   git revert <commit-hash>
   git push origin main
   # Vercel will auto-deploy
   ```

2. **Previous Working Version:**
   - Check git history for last known working commit
   - Redeploy that version

3. **Manual Fix:**
   - Roll back auth.ts to use `redirect: false` if needed
   - Restore original middleware.ts
   - Test locally before re-deploying

## Success Criteria

✅ User can login with valid credentials
✅ User is redirected to /dashboard (or /admin for admin users)
✅ Session persists across page refreshes
✅ Protected routes redirect to /sign-in for unauthenticated users
✅ After login, user can access originally requested page via callbackUrl
✅ Cookies are properly set and secure (HttpOnly, Secure flags)
✅ No console errors during login flow
✅ Admin redirect works correctly (redirects to /Denied if not admin)

## Production Deployment

Once all tests pass:

1. Merge PR to main branch
2. Vercel auto-deploys production
3. Monitor logs for 24 hours
4. Test with real users
5. Document any issues encountered

## Additional Monitoring

Set up monitoring for:
- `/api/auth/callback/credentials` endpoint response times
- Login failure rate
- Session creation errors
- Database connection errors

Use Vercel Analytics or similar tools to track:
- Page load times after login
- Redirect success rates
- Error rates

## Questions or Issues?

If you encounter any problems:

1. Check this verification guide first
2. Review the diagnostic document
3. Check Vercel logs with `vercel logs`
4. Review browser console and Network tab
5. Enable `DEBUG_AUTH=true` for more logs
6. Check git diff to see what changed
