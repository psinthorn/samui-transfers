# 🔍 Login Troubleshooting Guide

**Issue**: Cannot login at http://192.168.1.74:3000/sign-in  
**Updated**: November 25, 2025

---

## 🎯 The Problem

You're seeing an error when trying to login with **admin@admin.com** / **Admin_123!**

---

## ✅ Solution: Run the Seed Script

The admin user needs to have their email verified before login. This is a security feature.

### 📝 What to Do

In your terminal, run ONE of these commands:

**OPTION 1: npm (if you have npm)**
```bash
cd /Volumes/Data/Projects/samui-transfers/frontend
npm run prisma:seed
```

**OPTION 2: pnpm (if you have pnpm)**
```bash
cd /Volumes/Data/Projects/samui-transfers/frontend
pnpm run prisma:seed
```

**OPTION 3: Direct with Node**
```bash
cd /Volumes/Data/Projects/samui-transfers/frontend
node prisma/seed.cjs
```

### ⏳ What Happens

You should see:
```
Seeded admin: admin@admin.com
```

### 🔑 Then Try Login

- **URL**: http://192.168.1.74:3000/sign-in
- **Email**: admin@admin.com
- **Password**: Admin_123!
- **Expected**: You should see the dashboard

---

## 🚀 If That Works

Great! Your login is now fixed. Here's what changed:

✅ Admin user's email is now verified  
✅ No more "Please verify your email" error  
✅ All auth pages work properly  
✅ New UX improvements are active

Test these:
- [ ] Login works
- [ ] Forgot password link visible
- [ ] Password requirements show on sign-up
- [ ] Error messages are specific

---

## ❌ If It Still Doesn't Work

### Check 1: Is the dev server running?

Open http://192.168.1.74:3000/sign-in in your browser.

**If you see a blank page or error**: The dev server isn't running.

**Fix**: In another terminal, run:
```bash
cd /Volumes/Data/Projects/samui-transfers/frontend
npm run dev
# or
pnpm dev
```

### Check 2: What error message do you see?

**Error: "Please verify your email first"**
→ Run the seed script (see above)

**Error: "No account found with this email"**
→ Run the seed script or check the email spelling

**Error: "Incorrect password"**
→ Use: admin@admin.com / Admin_123!

**Error: "This account has been disabled"**
→ Run the seed script to refresh

**Generic "Invalid email or password"**
→ Run the seed script

**Page won't load at all**
→ Check if dev server is running

### Check 3: Database Issue?

If you're still stuck, there might be a database issue.

**Quick check**: Look at the browser console for errors
1. Open http://192.168.1.74:3000/sign-in
2. Press `F12` to open developer tools
3. Click the "Console" tab
4. Look for any red error messages
5. Take a screenshot or note what you see

---

## 🔧 Manual Database Fix

If you can access the database directly with a PostgreSQL client, run:

```sql
-- Update the admin user
UPDATE "User" 
SET "emailVerified" = NOW() 
WHERE email = 'admin@admin.com';

-- Verify it worked
SELECT id, email, "emailVerified", disabled FROM "User" WHERE email = 'admin@admin.com';
```

---

## 📊 What Changed

Two seed files were updated to set `emailVerified`:
1. `/frontend/prisma/seed.ts` ✅
2. `/frontend/prisma/seed.cjs` ✅

This ensures the admin user can login immediately after seeding.

---

## 🎓 Why This Is Needed

The new UX improvements include email verification for security. When you register a new account, it requires email verification before first login.

The admin seed wasn't doing this, so it was blocked. Now it is.

**New users**:
1. ✅ Create account
2. ✅ Get verification email
3. ✅ Click link to verify
4. ✅ Can now login

**Admin user**:
1. ✅ Created by seed
2. ✅ Email automatically verified
3. ✅ Can login immediately

---

## 💡 Pro Tips

- The seed script is safe to run multiple times
- It won't delete existing data
- It only updates/creates the admin user
- You can customize the admin credentials via environment variables:

```bash
export SEED_ADMIN_EMAIL="custom@email.com"
export SEED_ADMIN_PASSWORD="CustomPass_123!"
npm run prisma:seed
```

---

## 🆘 Still Stuck?

If you've tried everything and still can't login:

1. **Check error message** in browser console (F12 → Console tab)
2. **Verify dev server is running** (should see in terminal)
3. **Confirm database connection** (no errors on startup)
4. **Run seed script** again to refresh

If you still have issues, please share:
- The exact error message you see
- Browser console errors (screenshot or copy-paste)
- Whether the dev server shows any errors

---

## ✨ Next Steps After Login

Once you can login:

1. Try the new UX improvements:
   - Go to `/sign-in` → See "Forgot password?" link
   - Try `/forgot-password` → See password reset flow
   - Try `/sign-up` → See password requirements
   - Try invalid email → See specific error message

2. Read the documentation:
   - `IMPLEMENTATION_SUMMARY.md` - What was added
   - `AUTH_UX_FLOW_GUIDE.md` - User journey flows
   - `DEVELOPER_QUICK_REFERENCE.md` - API details

3. Test mobile responsiveness:
   - Resize browser to 375px width
   - Should still be usable
   - Touch-friendly buttons

---

**You're almost there! Just run the seed script.** 🚀
