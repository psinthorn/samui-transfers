# Vercel Environment Variables Configuration

## CRITICAL - Must Be Set Before Deploying

### Step 1: Log Into Vercel Dashboard
```
https://vercel.com/dashboard
```

### Step 2: Select Your Project
```
Project Name: samui-transfers
```

### Step 3: Go to Settings → Environment Variables

### Step 4: Add These Variables

---

## REQUIRED Variables

### 1. NEXTAUTH_SECRET ⭐ CRITICAL
**Value:** A strong random string (minimum 32 characters)

```
Generate one with:
  openssl rand -base64 32

Or use:
  https://generate-secret.vercel.app/32
```

**Example:**
```
NEXTAUTH_SECRET=abcd1234efgh5678ijkl9012mnop3456qrst5678uvwx9012
```

**Applies to:** All environments (Production, Preview, Development)

---

### 2. NEXTAUTH_URL ⭐ CRITICAL - THE MOST IMPORTANT ONE!
**Value:** Your Vercel deployment URL or custom domain

**Option A: Vercel Default Domain**
```
NEXTAUTH_URL=https://samui-transfers.vercel.app
```

**Option B: Custom Domain (if you have one)**
```
NEXTAUTH_URL=https://transfers.yourdomain.com
```

**Option C: Production vs Preview (different for each)**
```
# For Production
NEXTAUTH_URL=https://samui-transfers.vercel.app

# For Preview
NEXTAUTH_URL=https://preview-branch.samui-transfers.vercel.app
```

**Important:**
- ✅ MUST use HTTPS in production
- ✅ NO trailing slash
- ✅ Must match exactly what users will use to access
- ❌ NOT localhost (that's for local dev)
- ❌ NO /api/auth suffix (just the domain)

**Applies to:** Production and Preview

---

### 3. DATABASE_URL ⭐ CRITICAL
**Value:** Your PostgreSQL connection string

**Format:**
```
DATABASE_URL=postgresql://username:password@host:port/database_name
```

**Example:**
```
DATABASE_URL=postgresql://user:p@ssw0rd@db.example.com:5432/samui_transfers
```

**Applies to:** Production and Preview

---

## OPTIONAL Variables

### 4. DEBUG_AUTH
**Value:** `true` or `false`

Enable additional debug logging for authentication troubleshooting.

```
DEBUG_AUTH=true
```

**Use when:** Debugging authentication issues
**Remove when:** Debugging complete (not needed in production)

**Applies to:** Production (optional) and Preview (recommended)

---

### 5. Email Configuration (if not already set)

```
EMAIL_FROM=noreply@samui-transfers.com
SMTP_SSL_HOST=smtp.gmail.com
SMTP_SSL_PORT=465
SMTP_SSL_USER=your-email@gmail.com
SMTP_SSL_PASS=your-app-password
```

**Applies to:** All environments

---

## How to Set Environment Variables in Vercel

### Method 1: Vercel Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Click your project name
3. Click "Settings" tab
4. Click "Environment Variables" 
5. Add each variable:
   - **Name:** (e.g., `NEXTAUTH_SECRET`)
   - **Value:** (e.g., `abcd1234...`)
   - **Select environments:** Choose which ones (Production, Preview, etc.)
6. Click "Save"

### Method 2: Vercel CLI

```bash
# Install Vercel CLI (if not already done)
npm install -g vercel

# Login to Vercel
vercel login

# Set environment variable
vercel env add NEXTAUTH_SECRET
# Follow prompts to enter value and select environments

# Set other variables
vercel env add NEXTAUTH_URL
vercel env add DATABASE_URL
```

### Method 3: .env.production (Local)

Create file: `frontend/.env.production`

```
NEXTAUTH_SECRET=<your-value>
NEXTAUTH_URL=https://samui-transfers.vercel.app
DATABASE_URL=<your-db-url>
```

Then push to GitHub and redeploy.

---

## Verification Checklist

After setting environment variables:

- [ ] NEXTAUTH_SECRET is set to a strong random value (32+ chars)
- [ ] NEXTAUTH_URL matches your Vercel domain exactly (no trailing slash)
- [ ] DATABASE_URL is set correctly (test connection if possible)
- [ ] All variables are marked for correct environments (Production/Preview)
- [ ] No typos in variable names (case-sensitive!)
- [ ] No extra spaces in values
- [ ] Vercel has redeployed after changes (should auto-redeploy)

---

## Testing After Setting Variables

### 1. Check Variables Were Applied
```bash
# View environment variables in Vercel
vercel env list
```

### 2. Check Deployed Code
Go to your Vercel deployment URL:
```
https://samui-transfers.vercel.app/sign-in
```

### 3. Test Login Flow
1. Enter valid test credentials
2. Click Sign In
3. Watch for redirect to /dashboard
4. Check browser cookies (F12 → Application → Cookies)

### 4. Check Logs If Issues
```bash
# View function logs
vercel logs https://samui-transfers.vercel.app --follow

# Look for auth-related messages
# Should see: [AUTH] entries if DEBUG_AUTH=true
```

---

## Common Mistakes

### ❌ Mistake #1: NEXTAUTH_URL has trailing slash
```
❌ https://samui-transfers.vercel.app/
✅ https://samui-transfers.vercel.app
```

### ❌ Mistake #2: NEXTAUTH_URL uses http instead of https
```
❌ http://samui-transfers.vercel.app
✅ https://samui-transfers.vercel.app
```

### ❌ Mistake #3: NEXTAUTH_URL includes /api/auth
```
❌ https://samui-transfers.vercel.app/api/auth
✅ https://samui-transfers.vercel.app
```

### ❌ Mistake #4: NEXTAUTH_URL is localhost
```
❌ http://localhost:3000  (this is for LOCAL dev only)
✅ https://samui-transfers.vercel.app (for Vercel)
```

### ❌ Mistake #5: Variable not applied to correct environment
```
❌ NEXTAUTH_SECRET only set for "Development"
✅ NEXTAUTH_SECRET set for "Production" and "Preview"
```

### ❌ Mistake #6: Typo in variable name
```
❌ NEXT_AUTH_SECRET (wrong: underscore instead of AUTH_SECRET)
✅ NEXTAUTH_SECRET (correct)
```

---

## For Different Domains (Multiple Environments)

If you have multiple domains (preview, staging, production):

### Option 1: Separate Deployments
Each deployment has its own NEXTAUTH_URL:
- Preview: `https://preview.samui-transfers.vercel.app`
- Staging: `https://staging.samui-transfers.vercel.app`
- Production: `https://samui-transfers.vercel.app`

### Option 2: Custom Domains
Each environment uses custom domain:
- Preview: `https://dev.samui-transfers.com`
- Staging: `https://staging.samui-transfers.com`
- Production: `https://samui-transfers.com`

Set appropriate NEXTAUTH_URL for each.

---

## Quick Setup Script

If you're comfortable with terminal:

```bash
#!/bin/bash

# Set environment variables via CLI
vercel env add NEXTAUTH_SECRET
# When prompted:
# - Value: (paste your 32+ char random string)
# - Environments: Select all (Production, Preview, Development)

vercel env add NEXTAUTH_URL
# When prompted:
# - Value: https://samui-transfers.vercel.app
# - Environments: Production, Preview

vercel env add DATABASE_URL
# When prompted:
# - Value: (paste your database URL)
# - Environments: All
```

---

## Support Resources

- **Vercel Docs:** https://vercel.com/docs/concepts/projects/environment-variables
- **NextAuth Docs:** https://next-auth.js.org/deployment/vercel
- **Test Secret Generator:** https://generate-secret.vercel.app/32

---

## Final Confirmation

Once all environment variables are set:

1. ✅ Vercel auto-redeploys your app
2. ✅ New deployment includes environment variables
3. ✅ Test login at your Vercel URL
4. ✅ User should redirect to /dashboard after login
5. ✅ Session persists on page refresh

**Status:** Ready to test! 🚀

---

## TLDR (Too Long; Didn't Read)

**One thing that's critical:**
```
NEXTAUTH_URL must match your Vercel domain exactly
Example: https://samui-transfers.vercel.app

If this is wrong, authentication will NOT work on Vercel.
```

**Second thing that's critical:**
```
NEXTAUTH_SECRET must be a strong random string
Generate with: openssl rand -base64 32
```

**Third thing:**
```
DATABASE_URL must be correct
Test connection if possible
```

That's it! 🎉
