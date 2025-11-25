# 📋 Technical Documentation

## 🏗️ Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   Next.js 15    │◄──►│   API Routes    │◄──►│   PostgreSQL    │
│   React 19      │    │   Prisma ORM    │    │   (Neon Cloud)  │
│   TypeScript    │    │   NextAuth v5   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Integrations  │    │   Email System  │    │   External APIs │
│   Stripe        │    │   Nodemailer    │    │   OpenAI GPT-4  │
│   Google Maps   │    │   SMTP          │    │   Google Maps   │
│   WhatsApp      │    │   PDF Gen       │    │   Places API    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Technologies

#### Frontend Stack
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19 with TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui components
- **State Management**: React Context (Language, Source, Destination)
- **Maps**: Google Maps JavaScript API with Places API
- **Authentication**: NextAuth v5 client integration

#### Backend Stack
- **API**: Next.js API Routes (serverless functions)
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: NextAuth v5 with OAuth providers
- **Email**: Nodemailer with SMTP transport
- **AI**: OpenAI GPT-4 integration
- **File Generation**: PDFKit for vouchers, QR codes

#### Infrastructure
- **Hosting**: Vercel (Frontend + API)
- **Database**: Neon (PostgreSQL cloud)
- **Email**: Webhostbox SMTP
- **Storage**: Vercel Edge Functions
- **CDN**: Vercel global CDN

## 🗂️ Database Schema

### Core Models

#### User Model
```prisma
model User {
  id                String    @id @default(cuid())
  name              String?
  email             String?   @unique
  emailVerified     DateTime?
  image             String?
  password          String?
  role              String    @default("USER")
  disabled          Boolean   @default(false)
  preferredLanguage String    @default("en")
  marketingEmails   Boolean   @default(false)
  
  // Relations
  accounts          Account[]
  sessions          Session[]
  bookings          Booking[]
  auditActorLogs    AuditLog[] @relation("AuditActor")
  auditTargetLogs   AuditLog[] @relation("AuditTarget")
}
```

#### Booking Model
```prisma
model Booking {
  id            String        @id @default(cuid())
  userId        String
  user          User          @relation(fields: [userId], references: [id])
  requestNumber String?
  details       Json          // Flexible booking data
  status        BookingStatus @default(PENDING)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

enum BookingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}
```

#### ChatbotContext Model
```prisma
model ChatbotContext {
  id        String   @id @default(cuid())
  key       String   // e.g., "ai-agent-default"
  locale    String   @default("en")
  content   String   // AI context text
  title     String?
  enabled   Boolean  @default(true)
}
```

### Indexes Strategy
- User: `role`, `disabled`, `createdAt`
- Booking: `status`, `userId + createdAt`, `createdAt`
- AuditLog: `targetUserId + createdAt`, `actorId + createdAt`
- ChatbotContext: `key`, `locale`, `enabled`

## 🛡️ Security Implementation

### Authentication Flow
1. **OAuth Integration**: Google/GitHub via NextAuth v5
2. **Session Management**: JWT tokens with secure httpOnly cookies
3. **Role-Based Access**: Admin/User roles with middleware protection
4. **Password Security**: Bcrypt hashing for credential accounts

### API Security
- **Rate Limiting**: In-memory rate limiter for booking endpoints
- **Input Validation**: Zod schemas for all API inputs
- **CSRF Protection**: Next.js built-in CSRF protection
- **SQL Injection**: Prisma ORM prevents SQL injection
- **XSS Protection**: React's built-in XSS prevention

### Data Protection
- **Environment Variables**: Sensitive keys in environment
- **Database Encryption**: TLS connections to Neon PostgreSQL
- **Email Security**: SMTP with authentication
- **Audit Logging**: User actions tracked in AuditLog model

## 🔌 API Endpoints

### Public Endpoints
```typescript
POST /api/booking          // Create new booking
POST /api/ai-agent         // AI chat interaction  
POST /api/contact          // Contact form submission
GET  /api/auth/*           // NextAuth routes
```

### Protected Endpoints
```typescript
// Admin Only
GET  /api/admin/agent-context     // List AI contexts
POST /api/admin/agent-context     // Create AI context
PUT  /api/admin/agent-context     // Update AI context
DELETE /api/admin/agent-context   // Delete AI context

// Authenticated Users
GET  /api/bookings/[id]/voucher   // Generate booking voucher PDF
```

### Server Actions
```typescript
// Admin Actions
updateBookingStatus()      // Change booking status
updateUserRole()           // Change user role
toggleUserDisabled()       // Enable/disable user

// User Actions  
sendMyVoucher()           // Email voucher to customer
updateProfile()           // Update user profile
```

## 🎨 Component Architecture

### Layout Structure
```
app/
├── layout.tsx              // Root layout with providers
├── page.tsx               // Home page with booking
├── admin/
│   ├── layout.tsx         // Admin-only layout
│   └── */page.tsx         // Admin pages
├── dashboard/
│   ├── layout.tsx         // User dashboard layout  
│   └── */page.tsx         // Dashboard pages
└── */page.tsx             // Public pages
```

### Key Components
- **SearchSection**: Pickup/dropoff selection with Google Places
- **GoogleMapsSection**: Interactive map with route display
- **BookingForm**: Multi-step booking wizard
- **AIChat**: Floating AI assistant
- **AdminClient**: Admin dashboard components
- **ProfileForm**: User profile management

### Context Providers
- **LanguageContext**: EN/TH language switching
- **SourceContext**: Pickup location state
- **DestinationContext**: Dropoff location state
- **SessionProvider**: NextAuth session management

## 📧 Email System

### Email Templates
- **Booking Confirmation**: Professional branded template
- **Status Updates**: Pending/Confirmed/Completed/Cancelled
- **Voucher Delivery**: PDF attachment with QR codes
- **Admin Notifications**: Internal booking alerts

### Template Features
- **Responsive Design**: Mobile-friendly layout
- **Brand Consistency**: Company logo and colors
- **Localization**: English/Thai content
- **CTAs**: View booking, Message us, WhatsApp links
- **Legal Compliance**: Terms, privacy, unsubscribe

### SMTP Configuration
```env
SMTP_HOST=bh-ht-6.webhostbox.net
SMTP_PORT=587
SMTP_USER=smtp@samui-transfers.com
SMTP_PASS=SmTSS0991087999
```

## 🚀 Performance Optimizations

### Frontend Optimization
- **Dynamic Imports**: Maps components loaded on-demand
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Route-based splitting
- **Tree Shaking**: Unused code elimination

### Database Optimization
- **Strategic Indexes**: Query-optimized indexes
- **Connection Pooling**: Prisma connection pooling
- **Query Optimization**: Efficient Prisma queries
- **Caching**: Consider Redis for session storage

### Build Optimization
- **Bundle Analysis**: Regular bundle size monitoring  
- **Compression**: Gzip/Brotli compression
- **CDN**: Vercel global CDN
- **Edge Functions**: Serverless edge deployment

## 🔧 Development Workflow

### Local Development
```bash
cd frontend
pnpm install
pnpm prisma generate
pnpm dev
```

### Database Management
```bash
pnpm prisma migrate dev     # Apply migrations
pnpm prisma generate        # Generate client
pnpm prisma studio         # Database GUI
pnpm prisma db seed        # Seed data
```

### Production Deployment
```bash
pnpm build                 # Production build
pnpm start                 # Production server
```

### Environment Setup
- **Development**: localhost:3000 with hot reload
- **Production**: Vercel deployment with edge functions
- **Database**: Neon PostgreSQL with connection pooling
- **Monitoring**: Vercel analytics and error tracking

## 📊 Monitoring & Analytics

### Application Monitoring
- **Error Tracking**: Console logging in development
- **Performance**: Vercel Speed Insights
- **Analytics**: Configurable with Google Analytics
- **Uptime**: Vercel deployment monitoring

### Business Metrics
- **Bookings**: Created, confirmed, completed rates
- **Users**: Registration, authentication, retention
- **Revenue**: Payment processing (when Stripe integrated)
- **AI Usage**: Chat interactions and context effectiveness

## 🔮 Future Enhancements

### Planned Integrations
- **Payment**: Stripe checkout implementation
- **SMS**: Twilio or AWS SNS for notifications  
- **Real-time**: WebSocket for live chat
- **Mobile**: React Native app development
- **Analytics**: Advanced business intelligence

### Scalability Considerations
- **Multi-tenancy**: Support multiple locations
- **Microservices**: Extract AI/payment services
- **Caching**: Redis for improved performance
- **Load Balancing**: Horizontal scaling strategy