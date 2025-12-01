# 🚀 Quick Reference - Authentication & Credentials

## ✅ YES - Authentication Works With Database

---

## 🔑 Default Credentials

### Admin Account
```
Email:    admin@admin.com
Password: Admin_123!
Role:     ADMIN (access to /admin panel)
```

### Regular User Account
```
Register via: http://localhost:3000/sign-up
Role: USER (access to dashboard only)
```

---

## 🗄️ Database Integration

| Component | Status | Details |
|-----------|--------|---------|
| Database | ✅ PostgreSQL | Via Prisma ORM |
| User Storage | ✅ User Table | Stores email, password, role |
| Password Hashing | ✅ bcryptjs | 12 rounds, cryptographically secure |
| Authentication | ✅ NextAuth.js | Credentials provider |
| Sessions | ✅ JWT Tokens | Stored in memory, not database |
| Email Verification | ✅ Required | Must verify before login |

---

## 🔐 How It Works (Simple)

```
1. User enters: admin@admin.com / Admin_123!
   ↓
2. NextAuth looks up user in database
   ↓
3. Finds: User with email = "admin@admin.com"
   ↓
4. Compares passwords:
   Input: "Admin_123!"
   Stored: "$2a$12$veryLongHashedString..."
   ↓
5. Check email is verified: ✓
6. Check account not disabled: ✓
   ↓
7. Create JWT session token
   ↓
8. Redirect to dashboard ✓
```

---

## 📍 Key Files

### Authentication Setup
- `frontend/auth.ts` - NextAuth configuration
- `frontend/middleware.ts` - Route protection
- `frontend/lib/db.ts` - Database connection

### User Pages
- `/sign-in` - Login page
- `/sign-up` - Register page
- `/dashboard` - User dashboard (protected)
- `/admin` - Admin panel (protected, ADMIN role only)

### Database
- `frontend/prisma/schema.prisma` - User table schema
- `frontend/prisma/seed.ts` - Seeds default admin user

---

## 🧪 Test It Now

```bash
# 1. Start dev server
pnpm dev

# 2. Open browser
open http://localhost:3000/sign-in

# 3. Enter credentials
Email:    admin@admin.com
Password: Admin_123!

# 4. Click "Sign In"

# 5. Should redirect to /dashboard
```

---

## 🔄 Complete Auth Flow

```
┌─────────────────────────────────────────────┐
│          LOGIN PAGE (/sign-in)              │
├─────────────────────────────────────────────┤
│ Email:    [admin@admin.com...............]  │
│ Password: [Admin_123!......................]│
│ [Sign In Button]                            │
└─────────────────────────────────────────────┘
         ↓ Form Submitted
┌─────────────────────────────────────────────┐
│      NextAuth Credentials Provider          │
├─────────────────────────────────────────────┤
│ • Extract email & password from form        │
│ • Validate inputs                           │
│ • Query database for user                   │
└─────────────────────────────────────────────┘
         ↓ Database Lookup
┌─────────────────────────────────────────────┐
│        PostgreSQL User Table                │
├─────────────────────────────────────────────┤
│ email: "admin@admin.com"                    │
│ password: "$2a$12$hashstring..."            │
│ role: "ADMIN"                               │
│ emailVerified: 2025-01-01                   │
│ disabled: false                             │
└─────────────────────────────────────────────┘
         ↓ Verification
┌─────────────────────────────────────────────┐
│      Password Verification (bcryptjs)       │
├─────────────────────────────────────────────┤
│ Input:  "Admin_123!"                        │
│ Stored: "$2a$12$hashstring..."              │
│ Result: ✓ MATCH                             │
│                                             │
│ ✓ Email verified? YES                       │
│ ✓ Account disabled? NO                      │
│ ✓ All checks pass!                          │
└─────────────────────────────────────────────┘
         ↓ Create Session
┌─────────────────────────────────────────────┐
│      JWT Token Generated                    │
├─────────────────────────────────────────────┤
│ {                                           │
│   "id": "user_id",                          │
│   "email": "admin@admin.com",               │
│   "role": "ADMIN",                          │
│   "disabled": false,                        │
│   "emailVerified": Date,                    │
│   "iat": 1234567890,                        │
│   "exp": 1234654290                         │
│ }                                           │
└─────────────────────────────────────────────┘
         ↓ Session Stored
┌─────────────────────────────────────────────┐
│      Browser Session Stored                 │
├─────────────────────────────────────────────┤
│ Cookie: next-auth.session-token = "jwt..." │
│ Expires: 24 hours                           │
└─────────────────────────────────────────────┘
         ↓ Redirect
┌─────────────────────────────────────────────┐
│      Redirect to Dashboard                  │
├─────────────────────────────────────────────┤
│ User sees dashboard at /dashboard ✓         │
│ User can access /admin (ADMIN role) ✓       │
└─────────────────────────────────────────────┘
```

---

## 🛡️ Security Features

### Password Security
- ✅ Hashed with bcryptjs (12 rounds)
- ✅ Never stored in plain text
- ✅ Minimum 8 characters
- ✅ Requires uppercase, lowercase, number, special char

### Login Security
- ✅ Email verification required
- ✅ Rate limiting (5 attempts per 15 minutes)
- ✅ Account can be disabled
- ✅ Session expires in 24 hours

### Access Control
- ✅ Admin panel requires ADMIN role
- ✅ Server-side verification (not client-side)
- ✅ Middleware checks all protected routes

---

## 📊 User Roles

### ADMIN
- Full access to admin panel `/admin`
- Can manage users, bookings, settings
- Can change user roles
- Can disable user accounts

### USER
- Access to user dashboard `/dashboard`
- Can book transfers
- Can view own bookings
- Cannot access admin panel

---

## 🔧 Common Tasks

### Change Admin Password (After First Login)

1. Login with: `admin@admin.com` / `Admin_123!`
2. Go to Settings
3. Change password to something secure
4. Save

### Create Additional Admin Users

```bash
# Use Prisma Studio
pnpm prisma studio

# Click User → Add new
# Fill in:
# - email: new_admin@email.com
# - password: hash with bcryptjs
# - role: ADMIN
# - emailVerified: Set to current date
# - disabled: false
```

### Disable a User Account

```bash
# Via Prisma Studio
pnpm prisma studio
# Find user → Click row → Set disabled: true
```

### Reset User Password

1. Use "/forgot-password" link on login page
2. Enter email
3. Check email for reset link
4. Click link and set new password

---

## 🚨 Important Notes

### First Time Setup
1. Seed default admin user: `pnpm prisma db seed`
2. Login with: `admin@admin.com` / `Admin_123!`
3. Change password immediately
4. Create additional admin accounts as needed

### Email Verification
- New users must verify email before login
- Verification link sent to email
- Link expires in 24 hours
- Can resend verification email

### Production Checklist
- [ ] Change default admin password
- [ ] Configure email service (Mailtrap/SendGrid)
- [ ] Set strong NEXTAUTH_SECRET
- [ ] Use HTTPS (NEXTAUTH_URL must be https://)
- [ ] Set DATABASE_URL to production database
- [ ] Create backup admin accounts
- [ ] Enable security monitoring

---

## 🎯 URLs & Routes

### Public Routes
```
/ - Home page
/sign-in - Login
/sign-up - Register
/about-us - About page
/contact - Contact page
/faqs - FAQ page
```

### Protected Routes (Requires Login)
```
/dashboard - User dashboard
/dashboard/bookings - My bookings
/dashboard/profile - My profile
/dashboard/settings - Settings
```

### Admin Routes (Requires ADMIN Role)
```
/admin - Admin dashboard
/admin/users - User management
/admin/bookings - All bookings
/admin/documentation - Help docs
```

---

## 💡 Next Steps

1. ✅ Read this guide completely
2. ✅ Test login with default credentials
3. ✅ Change admin password
4. ✅ Register a test user account
5. ✅ Test role-based access
6. ✅ Configure email service
7. ✅ Deploy to production

---

## 📞 Troubleshooting

### Can't Login
- Check email spelling
- Check password (case-sensitive)
- Verify email (check inbox)
- Check if account is disabled
- Check if password meets requirements

### Can't Access Admin Panel
- Check user role is ADMIN
- Logout and login again
- Check browser cookies
- Clear browser cache

### Email Not Received
- Check spam folder
- Check email configuration
- Verify email service is running
- Check logs for errors

### Database Connection Error
- Check DATABASE_URL in .env.local
- Verify PostgreSQL is running
- Check database credentials
- Run: `pnpm prisma migrate dev`

---

## ✨ Summary

**Authentication Status**: ✅ FULLY FUNCTIONAL

- Default Admin: `admin@admin.com` / `Admin_123!`
- Database: PostgreSQL (Prisma)
- Passwords: Securely hashed (bcryptjs)
- Sessions: JWT-based tokens
- Email: Verification required
- Roles: ADMIN and USER
- Security: Production-ready

**Ready to use!** 🚀
