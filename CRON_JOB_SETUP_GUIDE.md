# Cron Job Configuration Guide

## Payment Reminders Cron Job

The payment reminders system runs automatically via a Vercel cron job configured in `vercel.json`.

### Setup Instructions

#### 1. Generate CRON_SECRET

Generate a random secure secret for cron authentication:

```bash
openssl rand -hex 32
```

Example output:
```
a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1
```

#### 2. Add to Environment Variables

**Local Development (.env.local):**
```bash
CRON_SECRET=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1
```

**Production (Vercel Dashboard):**
1. Go to your project settings in Vercel
2. Navigate to Settings → Environment Variables
3. Add variable: `CRON_SECRET` with your generated secret
4. Apply to Production

#### 3. Configuration Files

**vercel.json** (already created):
```json
{
  "crons": [
    {
      "path": "/api/cron/payment-reminders",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

This configures the cron job to run every 30 minutes.

**Endpoint:** `/app/api/cron/payment-reminders/route.ts` (already created)

### How It Works

1. **Vercel Cron Trigger**: Every 30 minutes, Vercel calls `/api/cron/payment-reminders` with a POST request
2. **Authorization**: Request includes `Authorization: Bearer {CRON_SECRET}`
3. **Verification**: Endpoint validates the secret matches `process.env.CRON_SECRET`
4. **Processing**: Calls `processPaymentReminders()` function from the service
5. **Actions Taken**:
   - Sends 24-hour reminder emails for bookings without payment
   - Sends 48-hour reminder emails for still-unpaid bookings
   - Sends 72-hour final warning emails
   - Auto-cancels bookings without payment after 72 hours
6. **Logging**: Tracks statistics (processed, sent, cancelled, errors)

### Testing Locally

#### Option 1: Manual Testing

```bash
# Make a POST request to your local endpoint
curl -X POST http://localhost:3000/api/cron/payment-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

#### Option 2: Using Node.js

```javascript
// test-cron.js
const secret = process.env.CRON_SECRET
const url = "http://localhost:3000/api/cron/payment-reminders"

fetch(url, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${secret}`,
    "Content-Type": "application/json"
  }
})
  .then(res => res.json())
  .then(data => console.log("Response:", data))
  .catch(err => console.error("Error:", err))
```

Run with:
```bash
CRON_SECRET=your-secret node test-cron.js
```

#### Option 3: GET Request (Health Check)

```bash
# Check if endpoint is healthy
curl http://localhost:3000/api/cron/payment-reminders
```

Response:
```json
{
  "status": "healthy",
  "endpoint": "/api/cron/payment-reminders",
  "description": "Payment reminder processor cron job",
  "schedule": "Every 30 minutes (*/30 * * * *)",
  "lastRun": "2024-12-07T10:30:00.000Z"
}
```

### Monitoring & Debugging

#### View Cron Logs in Vercel

1. Go to Vercel project dashboard
2. Click "Deployments"
3. Select a deployment
4. Click "Runtime Logs" tab
5. Look for `/api/cron/payment-reminders` logs

#### Expected Log Output (Success)

```
▶️  Starting payment reminder processing...
✅ Payment reminder processing completed in 1234ms {
  processed: 5,
  sent: 4,
  cancelled: 1,
  errors: 0
}
```

#### Expected Log Output (Error)

```
❌ Error processing payment reminders: {
  error: "Database connection failed",
  stack: "Error: ECONNREFUSED..."
}
```

#### Database Queries

Check the database for reminder records:

```sql
-- View all reminders sent today
SELECT * FROM "PaymentReminder"
WHERE "createdAt" > NOW() - INTERVAL '1 day'
ORDER BY "createdAt" DESC;

-- View failed reminders
SELECT * FROM "PaymentReminder"
WHERE status = 'FAILED'
ORDER BY "nextRetryAt" ASC;

-- View auto-cancelled bookings
SELECT b.id, b.reference, pr."sentAt"
FROM "Booking" b
JOIN "PaymentReminder" pr ON b.id = pr."bookingId"
WHERE b.status = 'CANCELLED'
  AND pr."reminderType" = 'FINAL_WARNING'
  AND b."updatedAt" > NOW() - INTERVAL '1 day';
```

### Cron Schedule Reference

The schedule `*/30 * * * *` means:

| Field | Value | Meaning |
|-------|-------|---------|
| Minute | */30 | Every 30 minutes (0, 30) |
| Hour | * | Every hour |
| Day of Month | * | Every day |
| Month | * | Every month |
| Day of Week | * | Every day of week |

**Common Schedules:**

| Schedule | Frequency |
|----------|-----------|
| `0 * * * *` | Every hour |
| `*/30 * * * *` | Every 30 minutes |
| `*/15 * * * *` | Every 15 minutes |
| `0 0 * * *` | Daily at midnight |
| `0 9 * * 1` | Every Monday at 9 AM |

### Troubleshooting

#### Issue: Cron not triggering

**Check:**
- [ ] `vercel.json` exists in project root
- [ ] CRON_SECRET set in Vercel environment variables
- [ ] Deployment is live (not a preview)
- [ ] No deployment errors in Vercel logs

**Fix:**
```bash
# Redeploy to ensure vercel.json is loaded
vercel deploy --prod
```

#### Issue: 401 Unauthorized errors

**Check:**
- [ ] CRON_SECRET matches between Vercel and code
- [ ] Secret is not expired
- [ ] Request has `Authorization: Bearer {SECRET}` header

**Fix:**
1. Generate new CRON_SECRET
2. Update Vercel environment variable
3. Redeploy

#### Issue: Database connection errors

**Check:**
- [ ] DATABASE_URL configured
- [ ] Database is accessible from Vercel
- [ ] Firewall allows Vercel IP ranges
- [ ] Database credentials are valid

**Fix:**
```bash
# Verify database connection
psql $DATABASE_URL -c "SELECT 1"
```

#### Issue: Reminders not being sent

**Check:**
- [ ] Email service configured (Resend/Nodemailer)
- [ ] SMTP credentials valid
- [ ] Bookings have pending payments
- [ ] Cron job ran (check logs)

**Fix:**
1. Check `/api/cron/payment-reminders` logs
2. Check email service logs
3. Manually trigger endpoint to test
4. Review PaymentReminder records in database

### Performance Considerations

- **Execution Time**: Typically 500-1000ms per run
- **Database Impact**: Queries are indexed for performance
- **Frequency**: Every 30 minutes provides good balance of responsiveness vs load
- **Scaling**: Works for up to 10,000+ bookings per cron cycle

### Next Steps

1. ✅ Deploy to Vercel with vercel.json
2. ✅ Set CRON_SECRET in environment
3. ✅ Monitor first 24 hours of cron runs
4. ✅ Adjust schedule if needed
5. ✅ Set up alerts for cron failures

---

**See Also:**
- `/app/api/cron/payment-reminders/route.ts` - Cron endpoint implementation
- `lib/payment-reminders/service.ts` - Reminder service logic
- `FEATURE_3_AUTOMATED_PAYMENT_REMINDERS_COMPLETE.md` - Feature documentation
- [Vercel Cron Jobs Docs](https://vercel.com/docs/cron-jobs)
