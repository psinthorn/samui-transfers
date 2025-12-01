# ✅ Vercel Environment Variable Setup - FINAL

## 🎯 Action Required: Set These 3 Variables in Vercel

Go to: **https://vercel.com/dashboard** → Select **samui-transfers** → **Settings** → **Environment Variables**

### Variable 1: NEXTAUTH_URL
- **Name:** `NEXTAUTH_URL`
- **Value:** `https://www.samui-transfers.com`
- **Environments:** Check ✓ Production and ✓ Preview
- **Click:** Save

### Variable 2: NEXTAUTH_SECRET
- **Name:** `NEXTAUTH_SECRET`
- **Value:** `7799a51de29c109754714b161afe0c0ab2f3f8a4d1f5f6e3b8e6c7d8e9f0a1b2c3d4e5f60718293a4b5c6d7e8f9fa0b1`
- **Environments:** Check ✓ Production and ✓ Preview
- **Click:** Save

### Variable 3: DATABASE_URL
- **Name:** `DATABASE_URL`
- **Value:** `postgresql://neondb_owner:npg_AmgF6aq5KTJv@ep-aged-moon-a1vxwajt-pooler.ap-southeast-1.aws.neon.tech/samuitransfers`
- **Environments:** Check ✓ Production and ✓ Preview
- **Click:** Save

## ⏱️ Wait for Redeployment

After saving, Vercel will automatically redeploy your app. This takes 2-5 minutes.

You'll see:
- The project card will show "Deploying..." status
- Then "Ready" when complete

## 🧪 Test After Deployment

Once redeployed:

1. **Open:** https://www.samui-transfers.com/sign-in
2. **Clear browser cookies** (if you have any)
3. **Enter:**
   - Email: `adminx@admin.com`
   - Password: `Adminx`
4. **Click:** Sign In
5. **Expected:** Redirect to https://www.samui-transfers.com/dashboard ✓

## 🔍 If Still Not Working

Check the browser DevTools (F12):

### Console Tab:
- Should NOT see errors about "NEXTAUTH_URL not set"
- Should NOT see "Invalid origin"

### Application → Cookies → .samui-transfers.com:
- Should see: `next-auth.session-token` cookie
- Should see: `__Secure-next-auth.session-token` (on production)

### Network Tab:
- Look for POST `/api/auth/callback/credentials`
- Response should be 200 OK or 307 redirect
- Should have `Set-Cookie` header with session token

## 📋 Verification Checklist

- [ ] NEXTAUTH_URL set to https://www.samui-transfers.com
- [ ] NEXTAUTH_SECRET set to the long string
- [ ] DATABASE_URL set to Neon connection string
- [ ] All 3 variables set for both Production and Preview
- [ ] Vercel finished redeploying (status shows "Ready")
- [ ] Browser cookies cleared
- [ ] Tried logging in with adminx@admin.com / Adminx
- [ ] Redirected to /dashboard successfully

## 🎉 Success!

If you can login and redirect to dashboard, the issue is FIXED!

The authentication flow is now:
1. User enters credentials
2. NextAuth validates against database ✓
3. JWT token created ✓
4. **Session cookie set with proper configuration** ✓ (THIS WAS THE FIX)
5. Middleware detects cookie ✓
6. User allowed to access /dashboard ✓
7. Session persists across page refreshes ✓

---

## 📞 Troubleshooting

| Problem | Solution |
|---------|----------|
| Still redirects to /sign-in | Check that NEXTAUTH_URL is exactly `https://www.samui-transfers.com` (with www, https, NO trailing slash) |
| See "Invalid origin" in console | NEXTAUTH_URL doesn't match current domain |
| No cookies set | Make sure you're using HTTPS (production URLs must be https://) |
| Can login but cookies disappear on refresh | NEXTAUTH_SECRET might be wrong or not set |
| Database connection error | DATABASE_URL pointing to wrong database or connection limit exceeded |

**Need help?** Check the logs at Vercel → Deployments → View Logs
