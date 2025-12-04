# 🚀 Vercel Deployment Guide - Complete Setup

**Status:** ✅ Complete  
**Last Updated:** December 4, 2024  
**For:** Deploying to Vercel with full payment integration

---

## 📋 Pre-Deployment Checklist

- [ ] All code committed to git
- [ ] Local testing completed successfully
- [ ] Environment variables configured
- [ ] Stripe production keys obtained
- [ ] PayPal live credentials obtained
- [ ] Resend API key configured
- [ ] Database migrations applied
- [ ] All tests passing

---

## 🔑 Required Environment Variables

### Stripe Configuration

**Stripe Public Key** (safe to expose)
```
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
```

**Stripe Secret Key** (keep secret!)
```
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
```

**Stripe Webhook Secret** (for webhook verification)
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### PayPal Configuration

**PayPal Client ID** (safe to expose)
```
NEXT_PUBLIC_PAYPAL_CLIENT_ID=xxxxxxxxxxxxx
```

**PayPal Client Secret** (keep secret!)
```
PAYPAL_CLIENT_SECRET=xxxxxxxxxxxxx
```

**PayPal Webhook ID** (for webhook verification)
```
PAYPAL_WEBHOOK_ID=xxxxxxxxxxxxx
```

### Email Service Configuration

**Resend API Key** (keep secret!)
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**From Email** (can be public)
```
NEXT_PUBLIC_FROM_EMAIL=payments@yourdomain.com
```

### Database Configuration

**Database URL**
```
DATABASE_URL=postgresql://user:password@host:port/database
```

### NextAuth Configuration

**Auth Secret** (for session encryption)
```
NEXTAUTH_SECRET=your-secret-key-here
```

**Auth URL**
```
NEXTAUTH_URL=https://yourdomain.com
```

---

## 📊 Step-by-Step Deployment

### Step 1: Get Stripe Production Keys

```
1. Go to: https://dashboard.stripe.com
2. Login with your account
3. Click "Settings" in left sidebar
4. Go to "API keys" tab
5. Find "Production keys" section
6. Copy "Publishable key" (pk_live_...)
   - This goes in: NEXT_PUBLIC_STRIPE_PUBLIC_KEY
7. Click "Reveal test data" toggle
8. Copy "Secret key" (sk_live_...)
   - This goes in: STRIPE_SECRET_KEY
9. Go to "Webhooks" tab
10. Click "Add endpoint"
11. Endpoint URL: https://yourdomain.com/api/payments/stripe/webhook
12. Events to send:
    ✅ payment_intent.succeeded
    ✅ payment_intent.payment_failed
    ✅ charge.refunded
13. Click "Add endpoint"
14. Click endpoint to view details
15. Copy "Signing secret"
    - This goes in: STRIPE_WEBHOOK_SECRET
```

### Step 2: Get PayPal Live Credentials

```
1. Go to: https://developer.paypal.com
2. Login with your account
3. Go to "Apps & Credentials" tab
4. Toggle to "Live" mode (not Sandbox)
5. Under "REST API apps" section
6. Click your app name
7. Copy "Client ID"
   - This goes in: NEXT_PUBLIC_PAYPAL_CLIENT_ID
8. Click "Show" next to Secret
9. Copy the Secret
   - This goes in: PAYPAL_CLIENT_SECRET
10. Go to "Webhooks" in left menu
11. Click "Create webhook"
12. Webhook URL: https://yourdomain.com/api/payments/paypal/webhook
13. Select events:
    ✅ CHECKOUT.ORDER.APPROVED
    ✅ CHECKOUT.ORDER.COMPLETED
    ✅ PAYMENT.CAPTURE.COMPLETED
    ✅ PAYMENT.CAPTURE.REFUNDED
14. Click "Create webhook"
15. Copy "ID"
    - This goes in: PAYPAL_WEBHOOK_ID
```

### Step 3: Get Resend API Key

```
1. Go to: https://resend.com
2. Create account or login
3. Go to "API Keys" in left sidebar
4. Click "Create API Key"
5. Name it: "Samui Transfers Production"
6. Copy the key
   - This goes in: RESEND_API_KEY
7. Go to "Domains" tab
8. Add your domain: yourdomain.com
9. Follow verification steps (DNS records)
10. Go back to "Sending Domain"
11. Add your from email: payments@yourdomain.com
    - This goes in: NEXT_PUBLIC_FROM_EMAIL
```

### Step 4: Prepare Database Connection

**Option A: Neon Postgres (Recommended)**
```
1. Go to: https://neon.tech
2. Create account or login
3. Create new project
4. Copy connection string
   - This goes in: DATABASE_URL
5. Keep connection string secret!
```

**Option B: Supabase**
```
1. Go to: https://supabase.com
2. Create account or login
3. Create new project
4. Go to "Project Settings"
5. Find "Database" section
6. Copy "Connection pooling" URL
   - This goes in: DATABASE_URL
```

### Step 5: Connect to Vercel

```
1. Go to: https://vercel.com
2. Click "Add New..." → "Project"
3. Import repository: samui-transfers
4. Configure project:
   - Framework: Next.js (should auto-detect)
   - Root directory: ./frontend
5. Click "Deploy"
6. Wait for deployment to complete
```

### Step 6: Add Environment Variables to Vercel

```
In Vercel Dashboard:

1. Go to: Project Settings
2. Click "Environment Variables" in left sidebar
3. Add each variable:

   STRIPE VARIABLES:
   ✅ NEXT_PUBLIC_STRIPE_PUBLIC_KEY = pk_live_...
   ✅ STRIPE_SECRET_KEY = sk_live_...
   ✅ STRIPE_WEBHOOK_SECRET = whsec_...

   PAYPAL VARIABLES:
   ✅ NEXT_PUBLIC_PAYPAL_CLIENT_ID = xxx
   ✅ PAYPAL_CLIENT_SECRET = xxx
   ✅ PAYPAL_WEBHOOK_ID = xxx

   EMAIL VARIABLES:
   ✅ RESEND_API_KEY = re_...
   ✅ NEXT_PUBLIC_FROM_EMAIL = payments@yourdomain.com

   DATABASE:
   ✅ DATABASE_URL = postgresql://...

   AUTH:
   ✅ NEXTAUTH_SECRET = [generate new strong key]
   ✅ NEXTAUTH_URL = https://yourdomain.com

4. For each variable, select:
   - Environment: Production, Preview, Development
   - Click "Save"

5. After all variables added:
   - Click "Redeploy" to apply variables
```

### Step 7: Configure Custom Domain

```
In Vercel Dashboard:

1. Go to: Project Settings
2. Click "Domains" in left sidebar
3. Add domain: yourdomain.com
4. Vercel provides nameserver records
5. Add records to your domain registrar:
   - NS records (Vercel will show exact values)
   - Or use CNAME record if preferred
6. Wait 24-48 hours for DNS propagation
7. Verify domain shows "Valid Configuration"
```

### Step 8: Apply Database Migrations

```
In terminal:

# Connect to production database
DATABASE_URL=postgresql://... npm run migrate:prod

# Or manually:
1. Connect to Neon/Supabase dashboard
2. Go to SQL editor
3. Run migration files from prisma/migrations/
4. Or use Prisma command:

   DATABASE_URL=postgresql://... \
   npx prisma migrate deploy
```

### Step 9: Verify Deployment

```
1. Visit: https://yourdomain.com
2. Check page loads without errors
3. Test login flow
4. Create test booking
5. Test Stripe payment with test card: 4242 4242 4242 4242
6. Verify payment appears in admin dashboard
7. Check email received with receipt
8. Test PayPal payment
9. Verify webhook events logged

If any step fails, check Vercel logs:
- Go to: Deployments
- Click latest deployment
- View "Runtime logs" or "Build logs"
```

---

## 🔍 Troubleshooting Deployment

### Issue: "Environment variable not found"

```
Solution:
1. Check variable name matches exactly
2. Ensure no typos in environment variable name
3. For NEXT_PUBLIC_* variables:
   - Must be prefixed with NEXT_PUBLIC_
   - Exposed to browser, don't put secrets here
4. Trigger new deployment after adding variables:
   - Go to Deployments
   - Click "Redeploy" on latest
```

### Issue: "Database connection failed"

```
Solution:
1. Verify DATABASE_URL is correct
2. Check database accepts connections from Vercel IPs
3. For Neon: Go to Project Settings → Connection Pooling
   - Use Connection Pooling URL (not Direct Connection)
4. Test connection locally:
   - DATABASE_URL=xxx npm run test:db
5. Check database credentials
6. Verify database exists and has migrations applied
```

### Issue: "Stripe webhook not receiving events"

```
Solution:
1. Verify STRIPE_WEBHOOK_SECRET is set
2. Check webhook endpoint is correct:
   - Should be: https://yourdomain.com/api/payments/stripe/webhook
3. In Stripe Dashboard → Webhooks:
   - Click your endpoint
   - Check "Recent deliveries"
   - Click failed delivery to see error details
4. Test webhook manually:
   - Click "Send test event"
   - Select event type: payment_intent.succeeded
   - Check logs for delivery
5. Verify your API route handles webhook correctly
```

### Issue: "PayPal payments failing"

```
Solution:
1. Verify you're using LIVE credentials (not Sandbox)
2. Check NEXT_PUBLIC_PAYPAL_CLIENT_ID is correct
3. Verify PAYPAL_CLIENT_SECRET is set
4. In PayPal Dashboard:
   - Go to Apps & Credentials
   - Toggle to "Live" mode
   - Confirm app shows LIVE indicator
5. Test with small amount ($0.01)
6. Check browser console for PayPal SDK errors
```

### Issue: "Emails not sending"

```
Solution:
1. Verify RESEND_API_KEY is set
2. Check NEXT_PUBLIC_FROM_EMAIL matches Resend domain
3. In Resend Dashboard:
   - Go to Domains
   - Verify yourdomain.com is verified
   - Check DNS records are correct
4. Verify from email is whitelisted:
   - payments@yourdomain.com should be allowed
5. Test email sending:
   - Create test payment
   - Check logs for email service output
   - Check spam folder for test emails
6. Check Resend quota not exceeded
```

### Issue: "502 Bad Gateway errors"

```
Solution:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Check database connection is working
4. Look for timeouts in API routes
5. Verify third-party API services (Stripe, PayPal) are up
6. Check for memory or resource limits:
   - Optimize queries
   - Check for infinite loops
   - Monitor function execution time
7. Restart deployment:
   - Go to Deployments
   - Click "Redeploy"
```

---

## ✅ Production Checklist

After deployment, verify:

- [ ] Website loads at custom domain
- [ ] HTTPS shows padlock in browser
- [ ] Login flow works
- [ ] Booking creation works
- [ ] Stripe payment processes successfully
- [ ] PayPal payment processes successfully
- [ ] Payment appears in admin dashboard
- [ ] Receipt email received
- [ ] Webhook events logged
- [ ] Admin can view payments
- [ ] Admin can process refunds
- [ ] Error pages display correctly
- [ ] Database queries are fast
- [ ] No 502 errors in logs
- [ ] Stripe webhooks showing successful deliveries
- [ ] PayPal webhooks showing successful deliveries

---

## 📊 Environment Variable Checklist

```
Stripe (Production):
  ✅ NEXT_PUBLIC_STRIPE_PUBLIC_KEY
  ✅ STRIPE_SECRET_KEY
  ✅ STRIPE_WEBHOOK_SECRET

PayPal (Live):
  ✅ NEXT_PUBLIC_PAYPAL_CLIENT_ID
  ✅ PAYPAL_CLIENT_SECRET
  ✅ PAYPAL_WEBHOOK_ID

Email (Resend):
  ✅ RESEND_API_KEY
  ✅ NEXT_PUBLIC_FROM_EMAIL

Database:
  ✅ DATABASE_URL

Authentication:
  ✅ NEXTAUTH_SECRET
  ✅ NEXTAUTH_URL

Additional:
  ✅ NODE_ENV = production
  ✅ ENVIRONMENT = production
```

---

## 🚀 Monitoring & Maintenance

### Daily Checks
- [ ] No 502 errors in logs
- [ ] Payment success rate >99%
- [ ] Webhook deliveries successful
- [ ] Response times <2 seconds

### Weekly Checks
- [ ] Review failed payments
- [ ] Check Stripe/PayPal dashboards
- [ ] Review webhook events
- [ ] Monitor database growth

### Monthly Checks
- [ ] Update dependencies
- [ ] Review security logs
- [ ] Analyze payment trends
- [ ] Backup database

---

## 🔐 Security Notes

### DO
```
✅ Use production Stripe/PayPal keys
✅ Use strong NEXTAUTH_SECRET (64+ chars)
✅ Keep DATABASE_URL secret
✅ Keep API keys secret
✅ Enable HTTPS (Vercel does this by default)
✅ Use environment variables for all secrets
✅ Monitor webhook deliveries
✅ Enable rate limiting
```

### DON'T
```
❌ Commit .env files to git
❌ Use sandbox credentials in production
❌ Expose secret keys in frontend
❌ Log sensitive payment information
❌ Disable HTTPS
❌ Share database connection strings
❌ Use weak secrets
❌ Deploy without testing
```

---

## 📞 Support Resources

- **Stripe Support:** https://support.stripe.com
- **PayPal Developer Forum:** https://www.paypal.com/developer/community
- **Resend Docs:** https://resend.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs

---

## 🎯 Final Deployment Command

Once everything is configured:

```bash
# From project root
git push origin main

# Vercel will automatically:
# 1. Detect changes
# 2. Build project
# 3. Run tests (if configured)
# 4. Deploy to production
# 5. Apply environment variables
# 6. Trigger webhooks (optional)
```

---

**Version:** 1.0  
**Status:** ✅ Ready for deployment  
**Last Updated:** December 4, 2024
