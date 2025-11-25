# 📖 Developer Quick Reference - New Auth Pages

## Files Created/Modified

### ✅ Created (3 new pages)
```
/frontend/app/verify-email/page.tsx       - Email verification
/frontend/app/forgot-password/page.tsx    - Forgot password request
/frontend/app/reset-password/page.tsx     - Reset password form
```

### ✏️ Modified (3 existing files)
```
/frontend/app/sign-in/page.tsx                           - Added forgot link + better errors
/frontend/app/sign-up/[[...sign-up]]/page.tsx          - Added password requirements
/frontend/data/content/auth.ts                          - Added 40+ i18n keys
```

---

## URL Patterns

### User Navigation
```
/sign-in                  - Main sign-in page
  └─> "Forgot password?" link
      └─> /forgot-password
          └─> [Email sent]
              └─> [User clicks email link]
                  └─> /reset-password?token=...&email=...
                      └─> [Success]
                          └─> /sign-in (auto-redirect)

/sign-up                  - Main registration page
  └─> [Email sent]
      └─> [User clicks email link]
          └─> /verify-email?token=...&email=...
              └─> [Success]
                  └─> /sign-in (auto-redirect)
```

---

## API Endpoints

### Email Verification
```typescript
// POST - Verify email with token
POST /api/auth/verify-email
Body: { email: string, token: string }
Response: { success: boolean, error?: string }

// PUT - Resend verification email
PUT /api/auth/verify-email
Body: { email: string }
Response: { success: boolean, error?: string }
```

### Password Reset
```typescript
// POST - Request password reset
POST /api/auth/password-reset
Body: { email: string }
Response: { success: boolean, error?: string }

// PUT - Confirm password reset
PUT /api/auth/password-reset
Body: { email: string, token: string, password: string }
Response: { success: boolean, error?: string }
```

---

## Rate Limiting

### Verify Email
- POST (verify): 5 per 15 minutes per IP
- PUT (resend): 3 per 10 minutes per IP

### Password Reset
- POST (request): 3 per 15 minutes per IP
- PUT (confirm): 5 per 10 minutes per IP

---

## i18n Keys Added

### Sign In Text
```typescript
forgotPassword: "Forgot password?"
emailNotFound: "No account found with this email"
emailNotVerified: "Please verify your email first..."
accountDisabled: "This account has been disabled..."
incorrectPassword: "Incorrect password. Try again."
resendVerificationEmail: "Resend verification email"
```

### Sign Up Text
```typescript
passwordRequirements: "Password requirements"
minChars: "At least 8 characters"
uppercase: "One uppercase letter (A-Z)"
lowercase: "One lowercase letter (a-z)"
number: "One number (0-9)"
special: "One special character (!@#$%^&*)"
```

---

## Password Requirements

All 5 must be true:
```javascript
password.length >= 8                 // ✓ At least 8 characters
/[A-Z]/.test(password)              // ✓ One uppercase (A-Z)
/[a-z]/.test(password)              // ✓ One lowercase (a-z)
/\d/.test(password)                 // ✓ One number (0-9)
/[^A-Za-z0-9]/.test(password)       // ✓ One special (!@#$%^&*)
```

---

## Testing URLs

```bash
# Test email verification flow
http://localhost:3000/verify-email?token=test&email=user@example.com

# Test password reset flow
http://localhost:3000/reset-password?token=test&email=user@example.com

# Test forgot password
http://localhost:3000/forgot-password
```

---

## Environment Variables (No New Ones Needed)

Uses existing:
```bash
DATABASE_URL          # PostgreSQL
NEXTAUTH_SECRET       # JWT signing
NEXTAUTH_URL          # Callback URL
MAILTRAP_HOST         # Email service
MAILTRAP_PORT
MAILTRAP_USER
MAILTRAP_PASS
```

---

## Deployment Checklist

- [ ] All files created/modified
- [ ] No TypeScript errors
- [ ] API endpoints working
- [ ] Email service configured
- [ ] Tested on staging
- [ ] Links in emails working
- [ ] Mobile responsive verified

---

**Ready to deploy! 🚀**
