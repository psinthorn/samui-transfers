# Vercel Deployment Checklist - Account Creation Fix

## 🔴 Problem
Account creation fails on Vercel production deployment

## ✅ Required Environment Variables (Must be set in Vercel)

Add these in Vercel Project Settings → Environment Variables:

### Critical Authentication Variables
```
NEXTAUTH_SECRET = [Generate with: openssl rand -base64 32]
NEXTAUTH_URL = https://your-domain.vercel.app
```

### Database
```
DATABASE_URL = [Your PostgreSQL connection string from Neon/Railway/etc]
```

### Email Configuration
```
EMAIL_FROM = your-email@gmail.com
SMTP_SSL_HOST = smtp.yourhost.com
SMTP_SSL_PORT = 465
SMTP_SSL_USER = your_user
SMTP_SSL_PASS = your_pass
```

### Company Details
```
COMPANY_NAME = Samui Transfers
COMPANY_ADDRESS = 9/38 Moo 6, Bo Phut, Ko Samui, Surat Thani 84320, Thailand
BOOKING_EMAIL = booking@samui-transfers.com
SUPPORT_EMAIL = support@samui-transfers.com
```

## 🔧 Steps to Fix

1. **Generate NEXTAUTH_SECRET** (if you don't have one):
   ```bash
   openssl rand -base64 32
   ```

2. **In Vercel Console** (https://vercel.com/dashboard):
   - Go to your project settings
   - Click "Environment Variables"
   - Add `NEXTAUTH_SECRET` with the generated value
   - Add `NEXTAUTH_URL` with your Vercel domain (e.g., https://samui-transfers.vercel.app)
   - Add `DATABASE_URL` with your database connection string
   - Add email configuration variables

3. **Redeploy**:
   - After adding environment variables, redeploy your application
   - Go to Deployments → Click the latest deployment → Redeploy

4. **Test**:
   - Try creating a new account at `/sign-up`
   - Check Vercel logs for errors if it still fails

## 📝 Key Files for Account Creation
- `/app/sign-up/[[...sign-up]]/page.tsx` - Sign-up UI
- `/actions/register.ts` - Registration server action
- `/lib/db.ts` - Database connection
- `/auth.ts` - NextAuth configuration

## 🐛 Debugging Tips

If registration still fails:

1. **Check Vercel Logs**:
   - Go to Function logs to see detailed errors

2. **Common Issues**:
   - ❌ Missing `DATABASE_URL` → Add it to Vercel
   - ❌ Missing `NEXTAUTH_SECRET` → Generate and add it
   - ❌ Wrong `NEXTAUTH_URL` → Must match your domain (https!)
   - ❌ Database not accessible → Test connection string
   - ❌ Email configuration issues → Check SMTP variables

3. **Database Migrations**:
   - Ensure all tables exist on your production database
   - Run: `npm run build` locally to ensure schema is valid

## ✨ LocalDevelopment (for testing)
If testing locally, ensure `.env.local` has:
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=any-secret-for-local
NEXTAUTH_URL=http://localhost:3000
```

Then run:
```bash
cd frontend
npm install
npm run build
npm start
```
