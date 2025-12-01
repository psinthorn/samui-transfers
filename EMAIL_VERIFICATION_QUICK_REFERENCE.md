# Email Verification - Quick Reference

## User Registration Flow

```
User Registration
      ↓
Sign-Up Form (/sign-up)
      ↓
Validate Input
      ↓
Create User (emailVerified: null)
      ↓
Create Verification Token (24hr expiry)
      ↓
Send Verification Email
      ↓
Redirect to Registration Success (/registration-success?email=...)
      ↓
Show Clear Instructions + Resend Button
      ↓
User Clicks Email Link
      ↓
Verify Email Page (/verify-email?token=...&email=...)
      ↓
Verify Token & Update User (emailVerified: now)
      ↓
Redirect to Sign-In (/sign-in)
      ↓
Sign In with Verified Email
      ↓
Access Dashboard (/dashboard)
```

## What User Sees

### After Registration (1-2 seconds delay)
- ✅ "Registration Successful! 🎉"
- 📧 "We've sent a verification email to: user@example.com"
- 📋 Step-by-step instructions (4 steps)
- ⏰ "Link expires in 24 hours"
- 🔄 Resend button
- 💡 "Check spam folder if you don't see it"
- 🔗 Back to Sign In button

### What's in the Email
1. **Subject:** "Verify Your Email - Samui Transfers"
2. **Body:**
   - Greeting with user's name
   - Clear instruction to click button
   - Clickable verification link
   - Token embedded in link (valid 24 hours)
   - Support contact info
   - Company branding

### After Clicking Verification Link
- ⏳ "Verifying..." (auto-processing)
- ✅ Success! "Email verified. Redirecting to sign in..."
- Auto-redirect to /sign-in (3 seconds)

## Key Pages

| Page | URL | Purpose |
|------|-----|---------|
| Sign Up | `/sign-up` | User registration form |
| Registration Success | `/registration-success?email=...` | Show instructions & resend option |
| Verify Email | `/verify-email?token=...&email=...` | Process verification link |
| Sign In | `/sign-in` | User login (after verification) |

## API Endpoints

### Verify Email Token
**POST** `/api/auth/verify-email`
- Verify token and mark email as verified
- Request: `{ token, email }`
- Response: `{ success, user }`

### Resend Verification Email
**POST** `/api/auth/resend-verification-email`
- Send new verification email
- Request: `{ email }`
- Response: `{ success, message, error }`

## Database Fields

### User Table
| Field | Type | Purpose |
|-------|------|---------|
| `id` | String (cuid) | Unique identifier |
| `email` | String @unique | User email |
| `emailVerified` | DateTime? | Null = unverified, DateTime = verification time |
| `password` | String | Hashed password |

### VerificationToken Table
| Field | Type | Purpose |
|-------|------|---------|
| `identifier` | String | Email address |
| `token` | String @unique | Verification token |
| `expires` | DateTime | When token expires |

## Important Details

### Token Generation
- **Algorithm:** `crypto.randomBytes(32).toString("hex")`
- **Length:** 64 hex characters (32 bytes entropy)
- **Expiry:** 24 hours from creation
- **Format in Email:** Embedded in URL as query parameter

### Password Hashing
- **Algorithm:** bcrypt
- **Salt Rounds:** 12
- **Time:** ~1-2 seconds per hash (intentional for security)

### Email Delivery
- **Service:** Nodemailer with SMTP
- **Provider:** Gmail/custom SMTP
- **Template:** HTML with responsive design
- **Languages:** English and Thai

## Troubleshooting

### If User Says "I didn't get an email"
1. ✅ Check spam/junk folder
2. ✅ Try "Resend verification email" button
3. ✅ Verify email address is correct
4. ✅ Wait 1-2 minutes (SMTP can be slow)
5. ✅ Check SMTP credentials in environment
6. ✅ Check email service logs

### If User Says "Link doesn't work"
1. ✅ Check token isn't expired (24 hour limit)
2. ✅ Check email matches registration email
3. ✅ Try requesting new email (resend button)
4. ✅ Clear browser cache/cookies
5. ✅ Try different browser

### If User Can't Sign In After Verification
1. ✅ Check `User.emailVerified` is not null in DB
2. ✅ Check JWT token includes user data
3. ✅ Check `NEXTAUTH_SECRET` is set
4. ✅ Clear browser cookies and try again

## Success Metrics

After clicking email link, user should:
- ✅ See success message immediately
- ✅ Be redirected to sign-in within 3 seconds
- ✅ Be able to sign in with verified email
- ✅ Access dashboard without re-verification

## Security Checklist

- ✅ Tokens are cryptographically random
- ✅ Tokens are unique per attempt
- ✅ Tokens expire after 24 hours
- ✅ Tokens are deleted after use
- ✅ Email must match registration email
- ✅ Passwords hashed with strong algorithm
- ✅ No plaintext passwords in logs
- ✅ SMTP credentials never exposed

## Support Contact
📧 support@samui-transfers.com
