# 📧 Email Configuration - Error Explanation & Solution

**Error:** 550 Sender Verify Failed  
**Cause:** Invalid sender email address  
**Fix Time:** 5 minutes  
**Difficulty:** ⭐ Easy  

---

## 🔴 The Problem

```
Error: Can't send mail - all recipients were rejected: 
550-Verification failed for <noreply@samui-transfers.com>
550-No Such User Here
550 Sender verify failed
```

### What This Means
The SMTP mail server **rejected** your email because:
- The sender email `noreply@samui-transfers.com` **doesn't exist**
- The server can't verify who is sending this email
- Your authentication credentials don't match the sender address

---

## 📍 Where The Problem Is

### File: `/lib/email.ts`

**Line 340 & 430:**
```typescript
from: process.env.EMAIL_FROM || "noreply@samui-transfers.com",
         ↑                     ↑
    Env variable          Fallback (PROBLEM!)
```

### File: `.env.local`

```bash
EMAIL_FROM=noreply@samui-transfers.com  # ← This doesn't exist!
```

---

## 🎯 The Solution

### Quick Fix (30 seconds)

**Change this line in `.env.local`:**

```bash
# ❌ WRONG:
EMAIL_FROM=noreply@samui-transfers.com

# ✅ CORRECT (pick one):
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM=info@samui-transfers.com
EMAIL_FROM=admin@company.com
```

**Important:** Use a real email address that actually exists!

### Then Restart Server
```bash
# Stop: Ctrl+C
# Restart: npm run dev
```

---

## 💡 Visual Explanation

### How It Works (Current - Broken)

```
┌─────────────────────────────────────┐
│  User Request Password Reset        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  sendPasswordResetEmail() function   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Sender Email: noreply@samui...     │
│  (Checked in .env.local or         │
│   defaults to fallback)             │
└──────────────┬──────────────────────┘
               │
               ▼
        [SMTP Server]
       ❌ REJECTED ❌
   "This email doesn't exist!"
```

### How It Works (Fixed)

```
┌─────────────────────────────────────┐
│  User Request Password Reset        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  sendPasswordResetEmail() function   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Sender Email: your-email@gmail.com │
│  (From .env.local)                  │
└──────────────┬──────────────────────┘
               │
               ▼
        [SMTP Server]
       ✅ ACCEPTED ✅
   "Email verified - sending..."
```

---

## 🛠️ Three Ways to Fix

### Option 1: Change .env.local (Easiest)

```bash
# Edit .env.local

# Find this:
EMAIL_FROM=noreply@samui-transfers.com

# Replace with your Gmail:
EMAIL_FROM=john@gmail.com

# Save and restart: npm run dev
```

**Pro:** Quickest fix  
**Con:** Must have a real Gmail account

---

### Option 2: Use Mailtrap (Best for Testing)

```bash
# 1. Sign up free: https://mailtrap.io
# 2. Copy credentials from dashboard
# 3. Update .env.local:

MAILTRAP_HOST=live.mailtrap.io
MAILTRAP_PORT=587
MAILTRAP_USER=abc@live.mailtrap.io  # From Mailtrap dashboard
MAILTRAP_PASS=password              # From Mailtrap dashboard
EMAIL_FROM=test@example.com         # Your test email

# 4. Restart server
```

**Pro:** Perfect for development/testing  
**Con:** Need to check Mailtrap inbox instead of real email

---

### Option 3: Update Code (Fallback Logic)

**In `/lib/email.ts`, change line 340 & 430:**

```typescript
// OLD (problematic):
from: process.env.EMAIL_FROM || "noreply@samui-transfers.com",

// NEW (safer fallback):
from: process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@samui-transfers.com",
```

This tries:
1. `EMAIL_FROM` env variable (if set)
2. `SMTP_USER` (usually your actual email)
3. Fallback to "noreply@..." (last resort)

**Pro:** More robust code  
**Con:** Still need to set SMTP_USER

---

## 📊 Configuration Comparison

| Service | Setup Time | Cost | Good For |
|---------|-----------|------|----------|
| **Gmail** | 5 min | Free | Development |
| **Mailtrap** | 5 min | Free | Testing |
| **SendGrid** | 15 min | Free tier | Production |
| **AWS SES** | 20 min | ~$0.10/1000 | Scale |

---

## ✅ Step-by-Step Fix

### Step 1: Identify Current Config
```bash
# Check .env.local
grep EMAIL_FROM .env.local

# Should show:
# EMAIL_FROM=noreply@samui-transfers.com ← PROBLEM
```

### Step 2: Choose an Email

**Using Gmail?**
```bash
EMAIL_FROM=yourname@gmail.com
```

**Using Mailtrap?**
```bash
EMAIL_FROM=your-test-email@example.com
```

**Using company email?**
```bash
EMAIL_FROM=admin@samui-transfers.com  # If this exists!
```

### Step 3: Update .env.local
```bash
# Edit file and change:
EMAIL_FROM=your-chosen-email@example.com

# Save the file
```

### Step 4: Restart Server
```bash
# In terminal:
# Press Ctrl+C to stop
# Then run:
npm run dev
```

### Step 5: Test It
```
1. Go to: http://localhost:3000/forgot-password
2. Enter email: test@example.com
3. Click: Send Reset Link
4. Should see: "Check your email"
5. Check your inbox for reset email
```

---

## 🎯 Expected Results

### ❌ Before (Current Problem)
```
POST /api/auth/password-reset 500 in 6967ms
Error: Can't send mail
550 Sender verify failed
```

### ✅ After (Fixed)
```
POST /api/auth/password-reset 200 in 500ms
✓ Email sent successfully
```

---

## 🧪 Testing Checklist

- [ ] Updated EMAIL_FROM in .env.local
- [ ] EMAIL_FROM is a real email address
- [ ] Server restarted (npm run dev)
- [ ] Navigated to /forgot-password
- [ ] Entered test email
- [ ] Clicked "Send Reset Link"
- [ ] Saw success message
- [ ] Email arrived in inbox
- [ ] No 500 error in console

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: Forgot to Restart Server
```bash
# Changed .env.local
# Didn't restart server
# Same error persists!
```
**Fix:** Press Ctrl+C and `npm run dev`

### ❌ Mistake 2: Used Non-Existent Email
```bash
EMAIL_FROM=noreply@company.com  # This doesn't exist!
```
**Fix:** Use a real email like `your-email@gmail.com`

### ❌ Mistake 3: Didn't Set EMAIL_FROM
```bash
# .env.local doesn't have EMAIL_FROM set
# Code uses fallback "noreply@samui-transfers.com"
# That doesn't exist!
```
**Fix:** Always add `EMAIL_FROM=...` to .env.local

### ❌ Mistake 4: Wrong SMTP Credentials
```bash
SMTP_USER=wrong@email.com
SMTP_PASS=wrong_password
```
**Fix:** Double-check credentials from your email provider

---

## 📞 If Still Stuck

**Use Mailtrap (guaranteed to work):**

1. Go to: https://mailtrap.io
2. Create free account
3. Click on "Inbox" project
4. Copy these lines from "Integrations → Nodemailer":
   ```
   MAILTRAP_HOST=...
   MAILTRAP_PORT=...
   MAILTRAP_USER=...
   MAILTRAP_PASS=...
   ```
5. Paste into .env.local
6. Add: `EMAIL_FROM=test@example.com`
7. Restart: `npm run dev`
8. Test password reset

**This will definitely work for testing.**

---

## 🎓 Understanding the Error

### SMTP Error Code 550
```
550 = Permanent Failure
    ↓
Sender address rejected
    ↓
The mail server won't accept this sender
```

### Why It Happens
1. **Sender doesn't exist** (most common)
2. **SPF/DKIM records missing** (advanced)
3. **Authentication failed** (credentials wrong)
4. **Domain not verified** (configuration)

### How It's Resolved
1. **Use a real email** (quick fix ✓)
2. **Match SMTP credentials** (medium fix)
3. **Setup SPF/DKIM** (advanced fix)

---

## 📋 Final Checklist

- [ ] I understand the error (550 Sender verify failed)
- [ ] I identified the problem (noreply@samui-transfers.com doesn't exist)
- [ ] I have a solution (Gmail, Mailtrap, or SendGrid)
- [ ] I updated .env.local with real email
- [ ] I restarted the server
- [ ] I tested password reset
- [ ] Email now works ✓

---

**Problem:** 550 Sender Verify Failed  
**Reason:** Fake sender email doesn't exist  
**Solution:** Use real email in EMAIL_FROM  
**Time to Fix:** 5 minutes  
**Status:** ✅ Fixable  

