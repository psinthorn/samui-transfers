# Email Verification 500 Error - Troubleshooting Guide

## Problem
When trying to resend verification email or send verification email on production, you get:
```
/api/auth/resend-verification-email:1  Failed to load resource: the server responded with a status of 500 ()
```

## Common Causes and Solutions

### 1. **Missing SMTP Configuration** (Most Common)
**Symptoms:**
- 500 error when trying to send any email
- Works locally but fails on Vercel

**Root Cause:**
Email credentials not configured in Vercel environment variables.

**Solution:**

Go to Vercel Dashboard and add these environment variables:

```
SMTP_HOST=smtp.gmail.com                    (or your email provider's SMTP host)
SMTP_PORT=587                               (typically 587 for TLS or 465 for SSL)
SMTP_USER=your-email@gmail.com              (your email address)
SMTP_PASS=your-app-password                 (NOT your Gmail password - use app password)
SMTP_SECURE=false                           (false for port 587, true for port 465)
COMPANY_EMAIL=noreply@samui-transfers.com   (sender email)
COMPANY_NAME=Samui Transfers                (sender name)
```

**For Gmail Users:**
1. Enable 2-Factor Authentication
2. Go to myaccount.google.com/apppasswords
3. Generate app-specific password
4. Use this password as SMTP_PASS (NOT your Gmail password)

**For Other Email Providers:**
Contact your email provider for SMTP credentials.

---

### 2. **Incorrect SMTP Credentials**
**Symptoms:**
- 500 error consistently
- Error message mentions authentication failure in logs

**Solution:**
1. Verify SMTP credentials are correct
2. Check if credentials are URL-encoded (special characters need encoding)
3. Test credentials locally first:
   ```bash
   cd frontend
   SMTP_HOST=... SMTP_USER=... SMTP_PASS=... npm run dev
   ```

---

### 3. **Database Error** (Less Common)
**Symptoms:**
- Works for some users but not others
- Error mentioning database in logs

**Possible Causes:**
- VerificationToken table doesn't exist
- User not found in database
- Database connection string incorrect

**Solution:**
1. Verify database connection is working:
   ```bash
   npx prisma db push
   ```
2. Check if VerificationToken table exists:
   ```bash
   npx prisma studio
   ```
3. Verify DATABASE_URL is set correctly

---

### 4. **Email Sending Service Down**
**Symptoms:**
- Works intermittently
- Error mentioning connection timeout

**Solution:**
1. Check if your email provider's SMTP server is up
2. Try a different port (587 vs 465)
3. Check firewall/network restrictions

---

## How to Debug

### 1. **Check Vercel Logs**
```bash
# View real-time logs
vercel logs

# Look for error messages in the log output
# Recent fix includes detailed logging at each step
```

### 2. **Check Browser Console**
- Open DevTools (F12)
- Look at Network tab
- Click on the failed request to resend-verification-email
- Check Response tab for error message

### 3. **Local Testing**
```bash
# Test locally with production environment variables
cd frontend
cp .env.local .env.local.backup

# Add your actual SMTP credentials to .env.local
# Then restart dev server
npm run dev
```

---

## Detailed Error Messages

With the latest fix, you should now see more detailed error messages:

### Missing SMTP Configuration
```
SMTP configuration missing:
- SMTP_HOST: ✗ missing
- SMTP_USER: ✗ missing  
- SMTP_PASS: ✗ missing
```

**Action:** Add these variables to Vercel environment variables

### Email Sending Failed
```
Error sending verification email to user@example.com: [specific SMTP error]
```

**Action:** Check SMTP credentials and email provider limits

### Database Error
```
Error creating verification token: [specific database error]
```

**Action:** Check database connection and VerificationToken table

---

## Verification Checklist

Before deploying to production, verify:

- [ ] SMTP_HOST is set in Vercel environment
- [ ] SMTP_USER is set in Vercel environment
- [ ] SMTP_PASS is set in Vercel environment (app password, not Gmail password)
- [ ] SMTP_PORT is correct (usually 587)
- [ ] SMTP_SECURE matches port (false for 587, true for 465)
- [ ] COMPANY_EMAIL is set
- [ ] COMPANY_NAME is set
- [ ] DATABASE_URL is set correctly
- [ ] Test email sends successfully locally
- [ ] Test resend email works locally
- [ ] Build succeeds: `pnpm build`

---

## Step-by-Step Fix for 500 Error

### If you just deployed and getting 500:

1. **Check Vercel Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Verify all SMTP variables are set
   - Redeploy after adding variables

2. **Check Logs**
   ```bash
   vercel logs
   # Look for "SMTP configuration missing" error
   ```

3. **Test Email Sending**
   - Once variables are set, redeploy
   - Try resending verification email
   - Check browser console for response

4. **If Still Failing**
   - Check email provider (Gmail, Outlook, etc.)
   - Verify app password is being used (not regular password)
   - Check if SMTP port is correct for your provider
   - Try testing with Mailtrap (free service)

---

## Using Mailtrap for Testing

If you want to test without real email credentials:

1. Sign up at mailtrap.io (free tier available)
2. Get your Mailtrap credentials
3. Set these in .env.local:
   ```
   MAILTRAP_HOST=live.smtp.mailtrap.io
   MAILTRAP_PORT=587
   MAILTRAP_USER=your_username@mailtrap.io
   MAILTRAP_PASS=your_password
   ```
4. The app automatically detects Mailtrap and uses it

---

## Support Contact

If you continue to have issues:

1. **Check Vercel Logs:**
   ```bash
   vercel logs --tail
   ```

2. **Look for Detailed Error Message:**
   The error should now show the specific problem

3. **Contact Support:**
   - Email: support@samui-transfers.com
   - Include: Error message, Vercel logs, and which email provider you're using

---

## Recent Improvements

The latest deployment includes:

✅ **Better Error Logging** - Each step is logged
✅ **SMTP Configuration Validation** - Tells you which variables are missing
✅ **Detailed Error Messages** - You'll see the actual problem
✅ **Frontend Error Display** - Error from server shown to user
✅ **Separated Error Handling** - Database errors vs email errors vs config errors

These improvements make it much easier to diagnose and fix the issue quickly.

---

## Summary

**Most Common Fix:**
```
Add these to Vercel Environment Variables:
- SMTP_HOST
- SMTP_USER  
- SMTP_PASS
- SMTP_PORT
- SMTP_SECURE

Then redeploy.
```

**If it Still Doesn't Work:**
- Check Vercel logs for detailed error message
- Verify SMTP credentials are correct
- Try with Mailtrap for testing
- Contact support with the error message
