# 🛠️ QA Testing Tools & Environment Setup

**Purpose:** Configure staging environment for comprehensive testing  
**Audience:** QA Engineers, DevOps  
**Version:** 1.0  
**Date:** December 7, 2025

---

## 🎯 Overview

This guide walks through setting up the complete QA testing environment with all necessary tools, services, and configurations.

---

## 📦 Required Tools

### Essential Tools

| Tool | Purpose | Installation |
|------|---------|--------------|
| **Node.js** | Runtime | `brew install node@18` |
| **npm** | Package manager | Included with Node.js |
| **Git** | Version control | `brew install git` |
| **PostgreSQL** | Database | Docker or `brew install postgresql` |
| **Postman** | API testing | https://www.postman.com |
| **cURL** | CLI requests | Pre-installed on macOS |

### Testing & Monitoring Tools

| Tool | Purpose | Link |
|------|---------|------|
| **Stripe CLI** | Webhook testing | https://stripe.com/docs/stripe-cli |
| **Twilio Console** | SMS testing | https://console.twilio.com |
| **Prisma Studio** | Database UI | Built-in (`npx prisma studio`) |
| **Chrome DevTools** | Browser debugging | F12 in Chrome |
| **Mailhog/Ethereal** | Email testing | https://www.mailhog.io |

### Optional Tools

| Tool | Purpose |
|------|---------|
| **Artillery** | Load testing |
| **OWASP ZAP** | Security testing |
| **Lighthouse** | Performance auditing |
| **Accessibility Checker** | a11y testing |

---

## 🗂️ Project Setup

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-org/samui-transfers.git
cd samui-transfers

# Switch to development branch
git checkout rbac

# Install dependencies
npm install

# Install Stripe CLI
brew install stripe/stripe-cli/stripe
```

### 2. Environment Variables

Create `.env.local` for staging:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/samui_transfers_staging"

# Stripe (use test keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdef
STRIPE_SECRET_KEY=sk_test_987654321fedcba0
STRIPE_WEBHOOK_SECRET=whsec_test_abcdef1234567890

# Twilio (use test credentials - no real SMS sent)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567

# Email (use Ethereal for staging)
EMAIL_FROM=noreply@test.samui-transfers.local
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_ethereal_email
SMTP_PASS=your_ethereal_password

# Cron Jobs
CRON_SECRET=your_super_secret_cron_key_123

# Application
NEXTAUTH_SECRET=generated_secret_string_here
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Database Setup

```bash
# Create database
createdb samui_transfers_staging

# Run migrations
npx prisma migrate deploy

# Seed test data (optional)
npx prisma db seed

# View database UI
npx prisma studio
```

### 4. Start Application

```bash
# Development mode
npm run dev

# Or production build
npm run build
npm start
```

Application runs on: `http://localhost:3000`

---

## 🧪 Testing Tools Setup

### Postman Configuration

1. **Import API Collection**
   - Open Postman
   - File → Import → Select `postman_collection.json` from project
   - Or manually create collection with endpoints

2. **Create Environment**
   - New Environment → Name: "Staging"
   - Variables:
     ```json
     {
       "base_url": "http://localhost:3000/api",
       "auth_token": "{{token}}",
       "admin_token": "{{admin_token}}"
     }
     ```

3. **API Endpoints for Testing**
   ```
   GET    /api/admin/activity
   GET    /api/admin/activity/[resourceType]/[resourceId]
   GET    /api/admin/drivers
   POST   /api/admin/drivers
   PATCH  /api/drivers/location
   GET    /api/drivers/assignments
   POST   /api/drivers/assignments
   PATCH  /api/drivers/assignments
   POST   /api/webhooks/stripe
   ```

### Stripe CLI Setup

1. **Install**
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login**
   ```bash
   stripe login
   # Follow prompts to authenticate
   ```

3. **Test Webhook Forwarding**
   ```bash
   # Start webhook listener
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   
   # This will output webhook signing secret:
   # whsec_test_abcdef1234567890
   # Add this to .env.local as STRIPE_WEBHOOK_SECRET
   ```

4. **Trigger Test Events**
   ```bash
   # Successful payment
   stripe trigger payment_intent.succeeded
   
   # Failed payment
   stripe trigger payment_intent.payment_failed
   
   # Refund
   stripe trigger charge.refunded
   ```

### Twilio Setup

1. **Get Test Credentials**
   - Go to https://console.twilio.com
   - Find Account SID and Auth Token
   - Create a test phone number
   - Add to .env.local

2. **Send Test SMS**
   ```bash
   curl -X POST https://api.twilio.com/2010-04-01/Accounts/{AccountSID}/Messages.json \
     -d "To=+1234567890&From=+15551234567&Body=Test+message" \
     -u {AccountSID}:{AuthToken}
   ```

### Email Testing Setup

Use Ethereal (free fake SMTP service) for testing:

1. **Create Account**
   - Go to https://ethereal.email
   - Click "Create Ethereal Account"
   - You get instant test account

2. **Get Credentials**
   - Email: generated@ethereal.email
   - Password: generated_password
   - Add to .env.local

3. **View Sent Emails**
   - All sent emails appear at https://ethereal.email
   - Check delivery, formatting, links

---

## 🔐 Test Accounts

### Create Test Users

```bash
# Via API
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.samui-transfers.local",
    "password": "TestAdmin123!",
    "name": "Test Admin",
    "role": "ADMIN"
  }'

# Or via Prisma Studio
npx prisma studio
# Navigate to User table and add manually
```

### Test Account Credentials

```
Admin Account:
  Email: admin@test.samui-transfers.local
  Password: TestAdmin123!
  Role: ADMIN

Driver Account:
  Email: driver@test.samui-transfers.local
  Password: TestDriver123!
  Role: DRIVER

Customer Account:
  Email: customer@test.samui-transfers.local
  Password: TestCustomer123!
  Role: USER

Test Stripe Card:
  Number: 4242 4242 4242 4242
  Expiry: 12/25
  CVC: 123
  Name: Test Card

Test Card (Decline):
  Number: 4000000000000002
  Expiry: 12/25
  CVC: 123
  Name: Test Decline
```

---

## 🏃 Running Tests

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- lib/driver/service.test.ts

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### API Testing with cURL

```bash
# Get activity logs (admin required)
curl -X GET http://localhost:3000/api/admin/activity \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json"

# Create driver
curl -X POST http://localhost:3000/api/admin/drivers \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "licenseNumber": "AB123456",
    "licenseExpiry": "2026-12-31",
    "vehicleType": "sedan",
    "registrationNumber": "กk 1234"
  }'

# Update driver location
curl -X PATCH http://localhost:3000/api/drivers/location \
  -H "Authorization: Bearer {driver_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 13.7563,
    "longitude": 100.5018
  }'
```

### Manual Browser Testing

1. **Open Application**
   - Go to http://localhost:3000
   - Open Chrome DevTools (F12)
   - Check Console for errors

2. **Test Admin Panel**
   - Login with admin account
   - Navigate to Admin Dashboard
   - Test each feature (Activity Log, Drivers, etc.)

3. **Test Mobile (DevTools)**
   - Toggle device toolbar (Cmd+Shift+M)
   - Test on iPhone 12 (375x667)
   - Test on iPad (768x1024)
   - Test on Android (360x800)

---

## 📊 Monitoring & Logging

### Application Logs

```bash
# View application logs in development
npm run dev
# Logs appear in terminal

# Production logs (if deployed)
# Use cloud provider's log aggregation (e.g., Vercel)
```

### Database Logs

```bash
# View database activity
npx prisma studio
# Check Queries tab for SQL execution

# Or use psql directly
psql samui_transfers_staging
\dt -- list tables
SELECT * FROM "ActivityLog" LIMIT 10;
```

### Browser Console

```javascript
// Check for JavaScript errors in DevTools Console

// Check network requests in DevTools Network tab
// Look for failed requests (4xx, 5xx)

// Monitor performance in Performance tab
// Record and analyze for slow interactions
```

---

## 🐛 Debugging

### TypeScript Errors

```bash
# Check for type errors
npx tsc --noEmit

# Show detailed errors
npx tsc --noEmit --pretty false
```

### Runtime Errors

```bash
# With detailed logging
DEBUG=* npm run dev

# With Prisma logging
PrismaLogs=true npm run dev
```

### Database Issues

```bash
# Reset database (WARNING: Clears all data)
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# View current schema
npx prisma db push
```

---

## 🚀 Load Testing with Artillery

### Install

```bash
npm install -g artillery
```

### Create Load Test File

```yaml
# load-test.yml
config:
  target: http://localhost:3000
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Ramp up"

scenarios:
  - name: "Activity Log Query"
    flow:
      - get:
          url: "/api/admin/activity?limit=50"
          headers:
            Authorization: "Bearer {token}"
```

### Run Load Test

```bash
artillery run load-test.yml
```

---

## 🔐 Security Testing

### Check for Vulnerabilities

```bash
# Check dependencies for known vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# OWASP dependency check
npm install -g snyk
snyk test
```

### Manual Security Checks

1. **Test CORS**
   - From non-localhost domain, try calling API
   - Should be rejected if not allowed

2. **Test Authentication**
   - Try accessing admin endpoints without token
   - Should receive 401 Unauthorized

3. **Test Authorization**
   - Login as regular user
   - Try accessing admin endpoints
   - Should receive 403 Forbidden

---

## 📈 Performance Testing

### Chrome DevTools Lighthouse

1. Open Chrome DevTools (F12)
2. Click "Lighthouse" tab
3. Click "Analyze page load"
4. Results show:
   - Performance score
   - Accessibility score
   - Best Practices score
   - SEO score

### React DevTools Profiler

```bash
# Install React DevTools extension for Chrome
# Open DevTools → Components tab
# Click Profiler tab
# Record interactions
# Analyze render times
```

### Network Performance

1. DevTools → Network tab
2. Throttle connection (Fast 3G, Slow 3G)
3. Reload page
4. Check if performance acceptable

---

## 🎯 Test Execution Commands

### Daily Development

```bash
# Start application
npm run dev

# In another terminal, open Prisma Studio
npx prisma studio

# In another terminal, start Stripe webhook listener
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Open browser
open http://localhost:3000
```

### Before Committing

```bash
# Type check
npx tsc --noEmit

# Build
npm run build

# Test
npm test

# Lint
npm run lint
```

### Before Deploying

```bash
# Full build
npm run build

# Run tests with coverage
npm test -- --coverage

# Check for vulnerabilities
npm audit

# Check TypeScript errors
npx tsc --noEmit
```

---

## 📋 Environment Checklist

Before starting QA:

- [ ] Node.js 18+ installed
- [ ] npm dependencies installed
- [ ] Database created and migrated
- [ ] .env.local configured with test credentials
- [ ] Application running on localhost:3000
- [ ] Stripe CLI configured and listening
- [ ] Twilio credentials configured
- [ ] Email testing service set up
- [ ] Test accounts created
- [ ] Postman imported and configured
- [ ] Chrome DevTools ready
- [ ] Monitoring tools active

---

## 🆘 Troubleshooting

### Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Database Connection Error

```bash
# Check PostgreSQL is running
brew services list

# Start PostgreSQL
brew services start postgresql

# Check connection string in .env.local
```

### Stripe Webhook Not Working

```bash
# Restart Stripe listener
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Verify webhook secret matches .env.local
# Re-trigger test event
stripe trigger payment_intent.succeeded
```

### Email Not Sending

```bash
# Check SMTP credentials in .env.local
# Go to https://ethereal.email to view sent emails
# Check application logs for error messages
```

---

## 📞 Support

For issues during testing:

1. **Check logs** - Application and database logs usually have details
2. **Check DevTools** - Network and Console tabs in browser
3. **Review .env.local** - Ensure all credentials are correct
4. **Restart services** - Kill and restart application
5. **Reset database** - `npx prisma migrate reset` (careful!)
6. **Check documentation** - README and TROUBLESHOOTING.md

---

## 📚 Additional Resources

### Documentation Files
- `README.md` - Project overview
- `IMPLEMENTATION_REPORT_FEATURES_5_7.md` - Code details
- `TESTING_GUIDE.md` - Testing strategies
- `TROUBLESHOOTING_LOGIN.md` - Auth issues
- `API_REFERENCE.md` - API documentation

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Twilio SMS API](https://www.twilio.com/docs/sms)

---

## ✅ Ready for Testing!

Once environment is set up:

1. ✅ All tools installed
2. ✅ Database migrated
3. ✅ Application running
4. ✅ Test accounts created
5. ✅ Webhooks configured

**You're ready to start executing the QA test plan!**

---

**Last Updated:** December 7, 2025  
**Version:** 1.0  
**Status:** Ready for QA Team
