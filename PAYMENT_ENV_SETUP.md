# Payment Gateway Configuration Guide

## Environment Variables Required

### 1. Stripe Configuration

Get these from: https://dashboard.stripe.com/apikeys

```env
# Public key (safe to expose to frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Secret key (KEEP PRIVATE - server-only)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Webhook signing secret
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 2. PayPal Configuration

Get these from: https://developer.paypal.com/dashboard

```env
# PayPal Client ID (sandbox for testing)
PAYPAL_CLIENT_ID=your-client-id-here

# PayPal Client Secret (keep private)
PAYPAL_CLIENT_SECRET=your-client-secret-here

# Mode: 'sandbox' for testing, 'live' for production
PAYPAL_MODE=sandbox
```

### 3. Payment Configuration

```env
# Currency code for payments
PAYMENT_CURRENCY=THB

# Redirect URLs after payment
PAYMENT_SUCCESS_URL=/booking/success
PAYMENT_CANCEL_URL=/booking/cancel
```

---

## Setup Instructions

### For Local Development (.env.local)

1. **Get Stripe Test Keys:**
   - Go to https://dashboard.stripe.com/apikeys
   - Copy "Publishable key" → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy "Secret key" → `STRIPE_SECRET_KEY`
   - Go to Webhooks → Add endpoint for `http://localhost:3000/api/payments/stripe/webhook`
   - Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET`

2. **Get PayPal Sandbox Keys:**
   - Go to https://developer.paypal.com/dashboard
   - Create an app (if not exists)
   - Copy "Client ID" → `PAYPAL_CLIENT_ID`
   - Copy "Secret" → `PAYPAL_CLIENT_SECRET`
   - Set `PAYPAL_MODE=sandbox`

3. **Add to .env.local:**
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   PAYPAL_MODE=sandbox
   PAYMENT_CURRENCY=THB
   PAYMENT_SUCCESS_URL=/booking/success
   PAYMENT_CANCEL_URL=/booking/cancel
   ```

### For Vercel Production

1. Go to https://vercel.com/dashboard → samui-transfers → Settings → Environment Variables

2. Add all variables with:
   - **For Preview & Production:** Use test keys initially
   - **For Production Only:** Use live keys when ready

3. Variables to add:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY    (public - both test and live)
   STRIPE_SECRET_KEY                     (secret - server only)
   STRIPE_WEBHOOK_SECRET                 (secret - server only)
   PAYPAL_CLIENT_ID                      (public)
   PAYPAL_CLIENT_SECRET                  (secret)
   PAYPAL_MODE                           (sandbox for testing, live for prod)
   PAYMENT_CURRENCY                      (THB)
   PAYMENT_SUCCESS_URL                   (/booking/success)
   PAYMENT_CANCEL_URL                    (/booking/cancel)
   ```

---

## Important Security Notes

⚠️ **NEVER commit these to Git:**
- `STRIPE_SECRET_KEY` - Keep private!
- `STRIPE_WEBHOOK_SECRET` - Keep private!
- `PAYPAL_CLIENT_SECRET` - Keep private!

✅ **SAFE to expose:**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - This is for frontend only

---

## Testing Keys (Stripe)

Use these test cards when `STRIPE_PUBLISHABLE_KEY` starts with `pk_test_`:

| Card Number | Expiry | CVC | Result |
|------------|--------|-----|--------|
| 4242 4242 4242 4242 | Any future date | Any 3 digits | Success ✓ |
| 4000 0000 0000 0002 | Any future date | Any 3 digits | Card declined ✗ |
| 5555 5555 5555 4444 | Any future date | Any 3 digits | Success (Mastercard) ✓ |

---

## Testing PayPal (Sandbox)

When `PAYPAL_MODE=sandbox`:

1. Use sandbox buyer account from https://developer.paypal.com/dashboard
2. Login with sandbox credentials
3. Complete payment flow
4. Money stays in sandbox (not real)

---

## Webhook Configuration

### Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://www.samui-transfers.com/api/payments/stripe/webhook`
3. Events to listen: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy signing secret → `STRIPE_WEBHOOK_SECRET`

### PayPal Webhook

1. Go to https://developer.paypal.com/webhooks
2. Create webhook for payment events
3. URL: `https://www.samui-transfers.com/api/payments/paypal/webhook`
4. Events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`

---

## Verification Checklist

- [ ] Stripe test keys added to .env.local
- [ ] PayPal sandbox keys added to .env.local
- [ ] PAYPAL_MODE set to 'sandbox'
- [ ] Dev server started: `npm run dev`
- [ ] Can complete test payment with test card
- [ ] Payment recorded in database
- [ ] Webhook test successful
- [ ] All variables added to Vercel
- [ ] Vercel redeployed successfully
- [ ] Production payment test with live keys
