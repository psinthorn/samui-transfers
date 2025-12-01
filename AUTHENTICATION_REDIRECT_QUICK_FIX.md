# Authentication Redirect - Quick Troubleshooting Checklist

## Immediate Actions

### Step 1: Check Browser Console (Press F12)
After logging in, look for logs starting with:
- `🔐 [SignIn]` - Sign-in process logs
- `✅ [SignIn]` - Success message
- `❌ [SignIn]` - Error message
- `🔄 [SignIn]` - Redirect in progress

**If you see ❌ error:**
→ Note the exact error message and check **Section: Error Messages** below

**If you see ✅ success but no redirect:**
→ Check that after 1-2 seconds you see `🔄 [SignIn] Performing redirect`
→ If not, browser is stuck - try clearing cache and retry

---

### Step 2: Check Browser Cookies (DevTools → Application → Cookies)
After successful login, you should see ONE of these:
```
✓ next-auth.session-token
✓ __Secure-next-auth.session-token
✓ next-auth.jwt
✓ __Secure-next-auth.jwt
```

**If NO cookies appear:**
→ Session not being created
→ Check **Section: No Cookies After Login**

**If cookies exist:**
→ Continue to Step 3

---

### Step 3: Check Vercel Environment Variables
```bash
vercel env list
```

Must show (with ✓):
```
NEXTAUTH_SECRET ✓
NEXTAUTH_URL ✓
DATABASE_URL ✓
```

**If any are missing (✗):**
→ Go to Vercel Dashboard → Settings → Environment Variables
→ Add the missing variables
→ Redeploy: `git push origin rbac`

**If all present:**
→ Continue to Step 4

---

### Step 4: Verify NEXTAUTH_URL Matches Your Domain
```
Your actual URL:    https://my-app.vercel.app
NEXTAUTH_URL value: must be https://my-app.vercel.app (exact match)
```

**If they don't match:**
→ Update NEXTAUTH_URL in Vercel to match exactly
→ Redeploy

**If they match:**
→ Check Vercel logs (Section: Step 5)

---

### Step 5: Check Vercel Logs
```bash
vercel logs --tail
```

Try logging in again and watch logs for:

**Expected logs:**
```
[Middleware] Path: /dashboard, Session: ✓
[Dashboard] Session: { exists: true, user: { email: "...", role: "USER" } }
```

**If seeing rejection:**
```
[Middleware] Path: /dashboard, Session: ✗
[Middleware] Protected route without session: /dashboard, redirecting to sign-in
```

→ Session not persisting - check cookies in Step 2

---

## Error Messages & Solutions

### Error: "Email not found"
**Cause:** User account doesn't exist in database
**Solution:**
```bash
npx prisma studio
# Go to User table → Check if your test user exists
# If not, register again
```

### Error: "Please verify your email before signing in"
**Cause:** User's email not verified
**Solution:**
1. Go to `/registration-success?email=your@email.com`
2. Click "Resend verification email"
3. Check your email inbox/spam
4. Click verification link
5. Try login again

### Error: "Invalid password"
**Cause:** Password is wrong
**Solution:** Click "Forgot Password" to reset

### Error: "User account is disabled"
**Cause:** Admin disabled this user
**Solution:** Contact your administrator

### Error: "Failed to resend verification email"
**Cause:** SMTP not configured or credentials wrong
**Solution:** Check **EMAIL_VERIFICATION_500_ERROR_FIX.md** guide

---

## No Cookies After Login

**This is the most common issue.**

### Check 1: NEXTAUTH_SECRET
```bash
vercel env list | grep NEXTAUTH_SECRET
```

Should show: `NEXTAUTH_SECRET ✓ Production, Preview`

**If missing:**
1. Generate a secret:
   ```bash
   openssl rand -base64 32
   # Copy the output
   ```
2. Go to Vercel Dashboard → Settings → Environment Variables
3. Add: `NEXTAUTH_SECRET` = (paste the generated value)
4. Redeploy: `git push origin rbac`

### Check 2: NEXTAUTH_URL
```bash
vercel env list | grep NEXTAUTH_URL
```

Must match your exact production URL:
```
✓ https://my-app.vercel.app
✗ https://my-app.vercel.app/ (trailing slash)
✗ my-app.vercel.app (missing https)
✗ http://my-app.vercel.app (http instead of https)
```

**If wrong:**
1. Update to correct URL
2. Redeploy

### Check 3: Clear Browser Data
1. DevTools → Application → Storage
2. Clear all cookies and cache
3. Clear local storage
4. Try login again

### Check 4: Test in Incognito/Private Mode
1. Open new Private/Incognito window
2. Go to your app
3. Try login
4. Check cookies appear

If it works in private mode but not normal mode:
→ Clear browser cache and cookies (see Check 3)

---

## For Admin Redirect Issues

### Problem: Login succeeds but redirected to `/Denied`

**Check:**
1. Verify user's role in database:
   ```bash
   npx prisma studio
   # Go to User table
   # Find your user
   # Check role field = "ADMIN"
   ```

2. If role is "ADMIN", check auth callbacks include role:
   ```typescript
   // In auth.ts - jwt callback should have:
   token.role = user.role as "USER" | "ADMIN"
   
   // In auth.ts - session callback should have:
   session.user.role = token.role as "USER" | "ADMIN"
   ```

3. If role is missing from token/session:
   → Redeploy to pick up latest code
   → Try login again

---

## For User Redirect Issues

### Problem: Login succeeds but stays on `/sign-in` or redirects to `/Denied`

**Check:**
1. User's role must be "USER" (not "ADMIN"):
   ```bash
   npx prisma studio
   # User table → check role = "USER"
   ```

2. Verify middleware allows `/dashboard`:
   ```typescript
   // In middleware.ts
   const PROTECTED_ROUTES = ["/dashboard", "/admin", "/booking"]
   // Should include /dashboard
   ```

3. If everything looks right:
   → Redeploy
   → Clear browser cache
   → Try login again

---

## Still Not Working?

### Final Checklist Before Asking for Help

- [ ] Can see `🔐 [SignIn]` logs in browser console
- [ ] `✅ [SignIn] Sign in successful` appears in console
- [ ] Auth cookies appear in DevTools after login
- [ ] NEXTAUTH_SECRET is set in Vercel
- [ ] NEXTAUTH_URL matches your domain exactly
- [ ] DATABASE_URL is set and working
- [ ] User exists in database with verified email
- [ ] User's role is correct (USER or ADMIN)
- [ ] Tried in private/incognito window
- [ ] Cleared all browser cache and cookies
- [ ] Redeployed after environment changes

### Gather This Information

Before contacting support, collect:

```
1. Browser console logs (copy everything with 🔐, ✅, ❌, 🔄)
2. Vercel logs: `vercel logs --tail` output
3. Error message (exact text if any)
4. User details: email, role (USER or ADMIN)
5. Actual URL you're trying: https://...
6. NEXTAUTH_URL value: https://...
7. Environment (local vs production)
8. Steps to reproduce exactly
```

### Contact Support
Email: support@samui-transfers.com

Provide all information from "Gather This Information" section above.

---

## Quick Reference

| Problem | First Check | Second Check |
|---------|-------------|--------------|
| No redirect after login | Browser console logs | Browser cookies |
| 500 error during login | SMTP configuration | Error message in Vercel logs |
| Stuck on /sign-in | Clear cache/cookies | NEXTAUTH_SECRET set? |
| Redirected to /Denied | User role in DB | Auth callbacks include role |
| Session lost after reload | Cookies set? | NEXTAUTH_URL correct? |

---

## Success Indicators

After fixing, you should see:

✅ Log in successfully
✅ See console log: `✅ [SignIn] Sign in successful`
✅ Automatically redirected to `/dashboard` (or `/admin`)
✅ Dashboard loads (if user)
✅ Admin panel loads (if admin)
✅ Session persists after page reload
✅ Can access protected routes without re-login
✅ Logout works properly

---

## For Development/Testing

If testing locally:

```bash
cd frontend

# Set local environment
cat > .env.local << 'EOF'
NEXTAUTH_SECRET=test-secret-for-local-development
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@localhost:5432/samui
EOF

# Start dev server
npm run dev

# Open http://localhost:3000
# Test login - should work without issues
```

If it works locally but fails on production:
→ Environment variables are the issue
→ Double-check Vercel environment variables
