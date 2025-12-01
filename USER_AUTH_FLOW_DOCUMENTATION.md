# User Authentication Flow Documentation

## Overview

The Samui Transfers application uses NextAuth.js v5 with JWT-based authentication strategy for secure user management.

---

## Sign-In Flow (USER Role)

### 1. **Initial Sign-In Page**
```
URL: /sign-in
Default redirect: /dashboard
```

**User enters:**
- Email
- Password

### 2. **Authentication Process**
```typescript
// Sign-in page submits credentials to NextAuth
const res = await signIn("credentials", { 
  redirect: false, 
  email, 
  password, 
  callbackUrl: "/dashboard"
})
```

**Backend checks:**
- ✓ Email exists in database
- ✓ Email is verified (emailVerified is not NULL)
- ✓ Password matches (bcrypt comparison)
- ✓ User account is not disabled
- ✓ Password is not null

### 3. **JWT Token Creation**
If all checks pass:
```typescript
{
  id: "user_id_xxx",
  email: "user@example.com",
  name: "User Name",
  role: "USER",
  disabled: false,
  emailVerified: "2024-12-01T00:00:00Z"
}
```

### 4. **Session Storage**
Token is stored in cookies:
- **Local/Dev**: `next-auth.jwt`
- **Production**: `__Secure-next-auth.jwt` (secure, httpOnly)

### 5. **Redirect to Dashboard**
```
window.location.href = "/dashboard"  (500ms delay)
↓
Middleware checks for valid session cookie
↓
Dashboard page loads (shows user content)
```

### 6. **Dashboard Display**
```
Welcome back, [User Name]! 👋

Quick Actions:
- New Booking → /booking
- My Bookings → /dashboard/bookings
- Profile → /dashboard/profile
- Settings → /dashboard/settings
```

---

## Sign-In Flow (ADMIN Role)

### Process
1. Admin enters credentials at `/sign-in?callbackUrl=%2Fadmin`
2. Same authentication checks as USER
3. Token includes `role: "ADMIN"`
4. Redirected to `/admin` (500ms delay for session)
5. Middleware allows access to `/admin`
6. Admin page checks `user.role === "ADMIN"`
7. Admin dashboard loads

### URL Flow
```
/sign-in?callbackUrl=%2Fadmin
  ↓
(admin@example.com + password)
  ↓
/admin
  ↓
(Admin Dashboard)
```

---

## Protected Routes

### Middleware Protection
Routes protected by middleware (Edge Runtime):
```typescript
const PROTECTED_ROUTES = ["/dashboard", "/admin", "/booking"]
```

**If no valid session cookie:**
- Redirect to `/sign-in?callbackUrl=[original_path]`

**If valid session cookie:**
- Allow access (further checks at page level)

### Page-Level Protection
Dashboard pages also check authentication:

```typescript
// /app/dashboard/page.tsx
const session = await auth()
if (!session?.user) {
  redirect("/sign-in?callbackUrl=/dashboard")
}
```

**Checks at each page:**
- ✓ `/dashboard` - Requires any logged-in user
- ✓ `/dashboard/profile` - Requires authentication
- ✓ `/dashboard/settings` - Requires authentication
- ✓ `/dashboard/bookings` - Requires authentication
- ✓ `/admin` - Requires ADMIN role
- ✓ `/booking` - Requires authentication

---

## Email Verification

### Registration Flow
1. User signs up at `/sign-up`
2. Password is hashed (bcryptjs, 12 salt rounds)
3. User created with `emailVerified: null`
4. Verification token generated
5. Email sent with verification link

### Email Verification Flow
1. User clicks email link
2. Token validated
3. `emailVerified` set to current timestamp
4. Token deleted from database
5. User can now sign in

### Sign-In Check
```typescript
if (!user.emailVerified) {
  throw new Error("Please verify your email before signing in")
}
```

---

## Session Management

### Session Duration
- **JWT Strategy**: No expiration by default
- **Configured in auth.ts**: Session strategy set to `"jwt"`

### Session Storage
```typescript
session: { strategy: "jwt" }
```

### Session Access
```typescript
// On server
const session = await auth()
session.user.role  // "USER" or "ADMIN"

// On client
const { data: session } = useSession()
```

---

## Middleware Behavior

### Public Routes (No Auth Required)
```typescript
["/", "/sign-in", "/sign-up", "/about-us", "/contact", 
 "/faqs", "/privacy", "/terms", "/why-choose-us", 
 "/service-rate", "/Denied", "/forgot-password", 
 "/reset-password", "/verify-email"]
```

### Protected Routes (Auth Required)
```typescript
["/dashboard", "/admin", "/booking"]
```

### Middleware Logic
1. Skip for API routes (`/api/*`)
2. Skip for static assets (`.jpg`, `.css`, etc.)
3. Check for public route → Allow
4. Check for session token → If missing, redirect to sign-in
5. Check if authenticated user on sign-in page → Redirect to dashboard

---

## Cookie Details

### Local Development
```
Name: next-auth.jwt
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
HttpOnly: false
Secure: false
SameSite: Lax
```

### Production (Vercel)
```
Name: __Secure-next-auth.jwt
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
HttpOnly: true (secure, not accessible to JS)
Secure: true (HTTPS only)
SameSite: Lax
```

---

## Troubleshooting

### Issue: Stuck on Sign-In Page After Authentication

**Possible Causes:**
1. Session token not being set
2. `NEXTAUTH_SECRET` not configured in Vercel
3. `NEXTAUTH_URL` doesn't match domain
4. Database connection issue

**Solution:**
1. Clear browser cookies: `localStorage.clear()`
2. Check Vercel environment variables
3. Verify database has correct user record
4. Check browser DevTools → Application → Cookies for session token

### Issue: Email Verification Required

**Message:** "Please verify your email before signing in"

**Solution:**
1. Go to `/verify-email`
2. Request email resend
3. Check email (check spam folder)
4. Click verification link
5. Try signing in again

### Issue: Access Denied on Admin Page

**Cause:** User role is not `ADMIN`

**Check:**
```sql
SELECT role FROM "User" WHERE email = 'admin@example.com';
```

**Fix:**
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

---

## Security Features

✅ **Password Hashing**: bcryptjs with 12 salt rounds
✅ **JWT Signing**: Uses NEXTAUTH_SECRET
✅ **HTTPS Only Cookies**: Production uses secure flag
✅ **Email Verification**: Required before sign-in
✅ **CSRF Protection**: NextAuth built-in
✅ **Rate Limiting**: Applied to auth endpoints
✅ **Account Disabled**: Users can be disabled
✅ **Role-Based Access**: ADMIN vs USER checks

---

## Configuration Files

### `/frontend/auth.ts`
- NextAuth configuration
- JWT callbacks
- Credential provider setup

### `/frontend/middleware.ts`
- Route protection
- Cookie checking
- Redirect logic

### `/frontend/.env` / `.env.local`
```
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000  # Local
NEXTAUTH_URL=https://domain.com      # Production
```

---

## API Routes

### Sign-In
```
POST /api/auth/callback/credentials
Body: { email, password, callbackUrl }
Response: { error } or session cookie set
```

### Sign-Out
```
POST /api/auth/signout
Response: Redirects to home page
```

### Session
```
GET /api/auth/session
Response: { user: {...}, expires: "..." }
```

### Email Verification
```
POST /api/auth/verify-email
Body: { email, token }
Response: { success, message }
```

---

## Best Practices

1. **Always check authentication** before displaying protected content
2. **Use `redirect()` in Server Components** for auth failures
3. **Store secrets in Vercel Environment Variables**, never in code
4. **Verify email verification status** before allowing sign-in
5. **Use role-based checks** for admin-only pages
6. **Handle auth errors gracefully** with user-friendly messages
7. **Test auth flows locally** before deploying to production

---

## Sign-In Redirect Summary

| Scenario | From | To | Delay |
|----------|------|-----|-------|
| User sign-in | /sign-in | /dashboard | 500ms |
| Admin sign-in | /sign-in?callbackUrl=%2Fadmin | /admin | 500ms |
| No auth on /dashboard | /dashboard | /sign-in?callbackUrl=/dashboard | Middleware |
| Authenticated user on /sign-in | /sign-in | /dashboard | Middleware |
| Email not verified | Try sign-in | Error message | None |
| Account disabled | Try sign-in | Error message | None |
