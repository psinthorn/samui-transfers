# 🔍 Authentication Redirect Issue - Immediate Troubleshooting

## ⚠️ CRITICAL: Have you set NEXTAUTH_URL in Vercel?

**This is the #1 reason login redirect fails!**

### Quick Check: Did You Do This?

1. ✅ Go to: https://vercel.com/dashboard
2. ✅ Click: Your project (samui-transfers)
3. ✅ Go to: Settings → Environment Variables
4. ✅ Add: `NEXTAUTH_URL=https://www.samui-transfers.com`
5. ✅ Save
6. ✅ Redeploy

**If you haven't done this, DO IT NOW before continuing!**

---

## 🔧 Why Still Not Redirecting? Diagnostic Steps

### Step 1: Verify Vercel Environment Variables

Go to Vercel Dashboard:
```
Project Settings → Environment Variables
```

Check these are ALL set:
```
✓ NEXTAUTH_URL = https://www.samui-transfers.com
✓ NEXTAUTH_SECRET = 7799a51de29c109754714b161afe0c0ab2f3f8a4d1f5f6e3b8e6c7d8e9f0a1b2c3d4e5f60718293a4b5c6d7e8f9fa0b1
✓ DATABASE_URL = postgresql://neondb_owner:npg_AmgF6aq5KTJv@...
```

**If ANY are missing → ADD THEM NOW**

---

### Step 2: Test Locally First

```bash
# Go to project root
cd /Volumes/Data/Projects/samui-transfers/frontend

# Make sure .env file has NEXTAUTH_URL set
cat .env | grep NEXTAUTH

# Should output:
# NEXTAUTH_SECRET="7799a51de29c109754714b161afe0c0ab2f3f8a4d1f5f6e3b8e6c7d8e9f0a1b2c3d4e5f60718293a4b5c6d7e8f9fa0b1"

# But for local, you need NEXTAUTH_URL too!
# Add to .env:
# NEXTAUTH_URL=http://localhost:3000

# Run dev server
npm run dev

# Visit: http://localhost:3000/sign-in
# Try to login
# Should redirect to /dashboard
```

---

### Step 3: Check Browser Console During Login

**In Browser (F12):**

1. Open DevTools (F12)
2. Go to Console tab
3. Try to login
4. Look for messages like:
   - `[AUTH]` messages if DEBUG_AUTH=true
   - `[SignIn]` messages
   - Any red error messages

**Common Console Errors:**
- `CSRF token mismatch` → NEXTAUTH_SECRET wrong
- `Unable to verify callback` → NEXTAUTH_URL wrong
- `No provider found` → auth.ts not loaded

---

### Step 4: Check Network Tab

**In Browser (F12):**

1. Go to Network tab
2. Clear network logs
3. Try to login
4. Look for POST request to: `/api/auth/callback/credentials`

**Check the Response:**
- Status should be: **200** or **307** (redirect)
- Response headers should include: **Set-Cookie**
- If you see error message → that's your problem

**Common Network Issues:**
- Status 400/401 → Credentials rejected (check database)
- Status 500 → Server error (check Vercel logs)
- No Set-Cookie → Cookie not being set (NEXTAUTH_URL wrong)

---

### Step 5: Check Cookies

**In Browser (F12):**

1. Go to Application tab
2. Go to Cookies
3. Look for cookies named:
   - `next-auth.jwt` 
   - `next-auth.session-token`
   - `__Secure-next-auth.jwt`
   - `__Secure-next-auth.session-token`

**If cookies are NOT there:**
- The login failed or Set-Cookie wasn't sent
- Check the Network tab response for Set-Cookie header

**If cookies ARE there:**
- Login succeeded but page didn't redirect
- Check for JavaScript errors in console
- Try refreshing the page

---

### Step 6: Check Vercel Logs

```bash
# Install Vercel CLI if needed
npm install -g vercel

# View Vercel logs (replace URL with your domain)
vercel logs https://www.samui-transfers.com --follow

# Or if you don't have custom domain yet:
# vercel logs https://samui-transfers.vercel.app --follow

# Watch for:
# - [AUTH] messages
# - Error messages
# - Database connection errors
# - NEXTAUTH_URL validation errors
```

---

## 🚨 Most Common Issues & Fixes

### ❌ Issue #1: NEXTAUTH_URL Not Set
**Symptom:** Login works but no redirect, cookies not set

**Fix:**
```
1. Go to Vercel Settings → Environment Variables
2. Add: NEXTAUTH_URL=https://www.samui-transfers.com
3. Redeploy
4. Wait 2-5 minutes
5. Test again
```

---

### ❌ Issue #2: Wrong NEXTAUTH_URL Format
**Symptom:** CSRF errors or "Unable to verify"

**Check your NEXTAUTH_URL:**
```
✅ CORRECT: https://www.samui-transfers.com
❌ WRONG: https://www.samui-transfers.com/
❌ WRONG: https://samui-transfers.com (missing www - if that's what users use)
❌ WRONG: https://samui-transfers.vercel.app (should use custom domain)
❌ WRONG: http://www.samui-transfers.com (must be https)
```

**Fix:** Set NEXTAUTH_URL to exactly match your domain

---

### ❌ Issue #3: NEXTAUTH_SECRET Wrong/Missing
**Symptom:** CSRF token errors, session validation fails

**Fix:**
```
Make sure in Vercel env vars:
NEXTAUTH_SECRET=7799a51de29c109754714b161afe0c0ab2f3f8a4d1f5f6e3b8e6c7d8e9f0a1b2c3d4e5f60718293a4b5c6d7e8f9fa0b1

Must be set for ALL environments:
✅ Production
✅ Preview
✅ Development
```

---

### ❌ Issue #4: Database Connection Fails
**Symptom:** Login button does nothing or "User not found"

**Fix:**
```
1. Check DATABASE_URL in Vercel
2. Verify it's correct:
   DATABASE_URL="postgresql://neondb_owner:npg_AmgF6aq5KTJv@ep-aged-moon-a1vxwajt-pooler.ap-southeast-1.aws.neon.tech/samuitransfers?sslmode=require&channel_binding=require"

3. Test connection:
   psql $DATABASE_URL -c "SELECT 1"
   
4. If connection fails:
   - Check database is running
   - Check credentials are correct
   - Check firewall allows connection
```

---

### ❌ Issue #5: Redirect Works Locally But Not On Vercel
**Symptom:** Works on `http://localhost:3000` but fails on production

**Likely Cause:** NEXTAUTH_URL not set on Vercel (different from local .env)

**Fix:**
```
Local development (.env):
NEXTAUTH_URL=http://localhost:3000

Vercel production (Settings → Env Vars):
NEXTAUTH_URL=https://www.samui-transfers.com

They are different! Both must be set in their respective places.
```

---

## 🧪 Quick Test Script

Run this to diagnose:

```bash
#!/bin/bash

echo "🔍 Authentication Diagnostic"
echo "======================================"

# Check if .env has NEXTAUTH_URL
echo ""
echo "1. Checking local .env..."
if grep -q "NEXTAUTH_URL" /Volumes/Data/Projects/samui-transfers/frontend/.env; then
    echo "   ✓ NEXTAUTH_URL found in .env"
    grep "NEXTAUTH_URL" /Volumes/Data/Projects/samui-transfers/frontend/.env
else
    echo "   ✗ NEXTAUTH_URL NOT found in .env"
    echo "   Add: NEXTAUTH_URL=http://localhost:3000"
fi

# Check if auth.ts has proper config
echo ""
echo "2. Checking auth.ts configuration..."
if grep -q "basePath: \"/api/auth\"" /Volumes/Data/Projects/samui-transfers/frontend/auth.ts; then
    echo "   ✓ basePath is configured"
else
    echo "   ⚠ basePath might not be configured"
fi

# Check sign-in page
echo ""
echo "3. Checking sign-in page..."
if grep -q "redirect: true" /Volumes/Data/Projects/samui-transfers/frontend/app/sign-in/page.tsx; then
    echo "   ✓ Using redirect: true (good!)"
else
    echo "   ⚠ Check redirect logic"
fi

echo ""
echo "======================================"
echo "Run this to test locally:"
echo "  cd /Volumes/Data/Projects/samui-transfers/frontend"
echo "  npm run dev"
echo ""
echo "Then visit: http://localhost:3000/sign-in"
```

---

## ✅ Checklist Before Contacting Support

- [ ] NEXTAUTH_URL set in Vercel to `https://www.samui-transfers.com`
- [ ] NEXTAUTH_SECRET set in Vercel
- [ ] DATABASE_URL set in Vercel
- [ ] Vercel deployment is up to date (show "Latest" deployment)
- [ ] Tested locally first with `npm run dev`
- [ ] Checked browser console for errors (F12 → Console)
- [ ] Checked Network tab for POST response status (F12 → Network)
- [ ] Checked cookies exist (F12 → Application → Cookies)
- [ ] Checked Vercel logs with `vercel logs`
- [ ] Waited 5+ minutes after setting env vars (deployment takes time)

---

## 🆘 If You've Done All That & Still Not Working

Please provide:

1. **Screenshot of Vercel env vars** (hide sensitive parts)
2. **Browser console errors** (F12 → Console, screenshot)
3. **Network response** (F12 → Network → POST /api/auth/callback/credentials → Response)
4. **Vercel logs** (`vercel logs <url>`)
5. **Local test result** (does `npm run dev` redirect work?)

---

## 📞 Getting Help

Reference files:
- `VERCEL_ENV_CONFIG.md` - Detailed Vercel setup
- `AUTHENTICATION_FIX_VERIFICATION.md` - Verification steps
- `DEPLOYMENT_CHECKLIST.md` - Complete checklist
- `QUICK_START.txt` - Quick reference

---

**Next Step:** Set NEXTAUTH_URL in Vercel if you haven't already! 🚀
