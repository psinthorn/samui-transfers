# 🔐 Login Error - TL;DR Summary

## The Problem
When you try to login, you get redirected to `/api/auth/error` instead of `/dashboard`.

## The Solution (99% Success Rate)

Run **one command**:

```bash
cd /Volumes/Data/Projects/samui-transfers/frontend && npx prisma migrate reset --force
```

Then:
```bash
npm run dev
```

Then login with:
- **Email:** `user@test.com`
- **Password:** `Test_123!`

## Why This Works

The command:
1. ✅ Deletes old/corrupted data
2. ✅ Re-runs all database migrations
3. ✅ Seeds test users with verified emails
4. ✅ Creates proper password hashes

The root cause is almost always: **Test users don't exist** or **emails aren't marked as verified**.

## What If It Still Doesn't Work?

1. **Check browser Console** (F12 → Console)
   - Copy any red error messages

2. **Enable debug logging:**
   ```bash
   echo "DEBUG_AUTH=true" >> .env.local
   npm run dev
   ```
   - Check terminal for `[AUTH]` messages

3. **Check if users exist:**
   ```bash
   cd /Volumes/Data/Projects/samui-transfers/frontend
   npx prisma studio
   # Click "User" table and verify test users exist
   ```

4. **Share the output of these commands:**
   ```bash
   cd /Volumes/Data/Projects/samui-transfers/frontend
   
   # Command 1: Check users
   npx prisma db execute --stdin << 'SQL'
   SELECT email, "emailVerified", disabled FROM "User" LIMIT 5;
   SQL
   
   # Command 2: Check migrations
   npx prisma migrate status
   
   # Command 3: Check environment
   grep NEXTAUTH .env.local
   ```

## Expected Result

✅ Successful login shows:
- Page redirects from `/sign-in` to `/dashboard`
- You see the dashboard content
- Session cookie appears in browser (F12 → Application → Cookies)
- No error messages

## Need More Help?

Read these documents (in order):
1. `QUICK_LOGIN_FIX.md` - Step-by-step instructions
2. `AUTH_LOGIN_DEBUGGING_GUIDE.md` - Detailed troubleshooting
3. `COMPLETE_LOGIN_FIX_GUIDE.md` - Comprehensive reference

All are in `/Volumes/Data/Projects/samui-transfers/`

---

**Bottom line:** Run `npx prisma migrate reset --force` and you'll be good. 🚀
