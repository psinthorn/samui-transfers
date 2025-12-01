# Email Verification Flow Documentation

## Overview
This document describes the complete email verification flow for new user registrations in the Samui Transfers application.

## User Journey

### 1. Registration Page (`/sign-up`)
- User enters: Name, Email, Password
- Frontend validates password requirements (8+ chars, uppercase, lowercase, number, special char)
- On submit: `registerAction()` is called

### 2. Backend Registration (`actions/register.ts`)
**What happens:**
- Input validation using Zod schema
- Check if email already exists
- Hash password with bcrypt (12 salt rounds)
- Generate verification token: `crypto.randomBytes(32).toString("hex")`
- Store token in `VerificationToken` model with 24-hour expiry
- Create user with `emailVerified: null` (unverified)
- Send verification email via Nodemailer

**Response:**
```json
{
  "success": true,
  "message": "Registration successful! Please check your email to verify your account.",
  "redirectUrl": "/verify-email"
}
```

### 3. Registration Success Page (`/registration-success`)
**Purpose:** Show user clear instructions about email verification

**What users see:**
- ✅ Success message: "Registration Successful! 🎉"
- 📧 Email confirmation showing their email address
- 📋 Numbered step-by-step instructions:
  1. Verification link sent to email
  2. Click link to verify
  3. Link expires in 24 hours
  4. Sign in after verification
- ⏰ Time warning: "Link expires in 24 hours"
- 🔄 Resend button for users who didn't receive email
- 💡 Help text: "Check your spam or junk folder"
- 🔗 "Back to Sign In" button

**URL Parameters:**
- `email`: Pre-populated from registration to show user which email was used

**Features:**
- Bilingual support (English/Thai)
- Responsive design (mobile-first)
- Visual indicators and color coding
- Accessibility features

### 4. Email Verification Email
**Template:** `lib/email.ts` - `sendVerificationEmail()`

**Email Content:**
- Subject: "Verify Your Email - Samui Transfers"
- Contains clickable verification link
- Link format: `{baseUrl}/verify-email?token={token}&email={email}`
- Includes support contact information
- Professional HTML formatting
- Responsive design

**Key Details:**
- Token is a random 32-byte hex string
- Embedded in email verification URL
- 24-hour expiry from creation

### 5. Verify Email Page (`/verify-email`)
**Purpose:** Process verification when user clicks link in email

**URL Parameters:**
- `token`: Verification token from email
- `email`: Email address to verify

**Verification Process:**
1. Auto-verifies token validity
2. Shows loading state during verification
3. On success:
   - Searches `VerificationToken` for matching token and email
   - Confirms token hasn't expired
   - Updates user's `emailVerified` to current timestamp
   - Auto-redirects to `/sign-in` after 3 seconds
   - Shows success message

4. On error:
   - Shows error message
   - Offers "Request new verification link" button
   - Links back to resend flow

**Status Messages:**
- `loading`: "Verifying your email..."
- `success`: "✓ Email verified! Redirecting to sign in..."
- `error`: Shows specific error with resend option
- `invalid`: "Invalid or expired verification link"

### 6. Resend Verification Email (`/api/auth/resend-verification-email`)
**Purpose:** Allow users to request a new verification email

**When Available:**
- From `/registration-success` page
- From `/verify-email` error state
- Only if email not yet verified

**What Happens:**
1. User provides email address
2. API validates email exists and isn't already verified
3. Generates new verification token
4. Deletes any old tokens for that email
5. Creates fresh token with new 24-hour expiry
6. Sends verification email
7. Returns success/error to frontend

**Error Cases:**
- User not found
- Email already verified
- Email sending failed

**Frontend Response:**
- Shows success message: "✓ Email resent successfully"
- Shows error message with details
- Re-enables button after attempt

## Database Models

### VerificationToken
```prisma
model VerificationToken {
  identifier String    // Email address
  token      String    // Unique verification token
  expires    DateTime  // Expiry timestamp (24 hours)
  
  @@unique([identifier, token])
}
```

### User (relevant fields)
```prisma
model User {
  id            String
  email         String   @unique
  emailVerified DateTime? // null = not verified, DateTime = verification time
  name          String?
  password      String?
  // ... other fields
}
```

## Email Configuration

**Environment Variables Required:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
COMPANY_EMAIL=noreply@samui-transfers.com
COMPANY_NAME=Samui Transfers
```

**Email Service:** Nodemailer with SMTP

## Security Considerations

### Token Security
- ✅ Cryptographically random (32 bytes of entropy)
- ✅ Unique per verification attempt
- ✅ Expires after 24 hours
- ✅ Can't be reused (deleted after verification)
- ✅ Email-bound (requires matching email)

### User Protection
- ✅ Password hashing: bcrypt with 12 rounds
- ✅ Email verification required before sign-in
- ✅ Unverified users can't create bookings
- ✅ Token only valid with matching email

### Attack Prevention
- ✅ Old tokens deleted when resending
- ✅ Rate limiting on resend endpoint (implementation: consider adding)
- ✅ Database constraints prevent duplicate emails
- ✅ URL-encoded email in links

## User Experience Improvements

### Clear Messaging
- ✅ Registration success page shows what to do next
- ✅ Step-by-step instructions with numbered list
- ✅ Email address shown for confirmation
- ✅ Expiry time warning (24 hours)
- ✅ Spam folder help text

### Accessibility
- ✅ Bilingual support (English/Thai)
- ✅ Color-coded sections (blue for info, green for success, etc.)
- ✅ Semantic HTML
- ✅ Mobile-responsive design
- ✅ Clear visual hierarchy

### Error Recovery
- ✅ "Request new verification link" button always available
- ✅ Support contact information displayed
- ✅ Clear error messages
- ✅ Easy navigation back to sign-in

## Testing Checklist

### Registration Flow
- [ ] User can register with valid email
- [ ] User sees registration success page
- [ ] Email shown is correct
- [ ] Can see resend button

### Email Reception
- [ ] Email arrives within reasonable time
- [ ] Email contains clickable verification link
- [ ] Email looks professional and clear
- [ ] Support contact info is visible

### Email Verification
- [ ] Clicking link verifies email successfully
- [ ] User redirected to sign-in after 3 seconds
- [ ] Verified users can now sign in
- [ ] Can't verify twice

### Resend Functionality
- [ ] Resend button sends new email
- [ ] Old tokens are invalidated
- [ ] Success message appears
- [ ] New tokens work for verification

### Error Cases
- [ ] Invalid tokens show error
- [ ] Expired tokens show error
- [ ] Mismatched emails show error
- [ ] Already verified users see appropriate message
- [ ] Missing email parameter handled gracefully

## Troubleshooting

### Email Not Received
1. Check spam/junk folder
2. Verify email address at registration
3. Try resend button
4. Contact support at support@samui-transfers.com

### Verification Link Expired
- Register again, or
- Use resend button from registration-success page

### Can't Sign In After Verification
- Confirm email shows as verified in database
- Check that `User.emailVerified` is not null
- Verify JWT token includes user data

### Token Issues
- Database: Check `VerificationToken` table for matching token/email
- Time: Verify server time is correct for expiry check
- Encoding: URL decode token/email from query params

## Future Improvements

1. **Rate Limiting:** Add throttling on resend endpoint
2. **Email Templates:** More sophisticated HTML templates with branding
3. **Expiry Extension:** Allow extending token expiry if still valid
4. **Verification Delivery:** Track email delivery status
5. **SMS Verification:** Option for SMS verification code
6. **Batch Verification:** Verify multiple emails if user has multiple
7. **Re-verification:** Require re-verification if email changes

## Deployment Notes

### Vercel Deployment
- Ensure `NEXTAUTH_SECRET` is set
- Ensure `NEXTAUTH_URL` is set
- Ensure SMTP environment variables are set
- Test email sending before going live
- Monitor email delivery logs

### Production Checklist
- [ ] SMTP credentials configured in Vercel
- [ ] Email domain authenticated (SPF/DKIM)
- [ ] Support contact email verified and monitored
- [ ] Email templates tested end-to-end
- [ ] Rate limiting configured
- [ ] Database backups configured
- [ ] Monitoring/alerting for failed emails set up
