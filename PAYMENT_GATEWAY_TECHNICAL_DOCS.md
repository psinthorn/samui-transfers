# Payment Gateway Management - Technical Documentation

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                   Admin Dashboard                       │
│                    (/admin page)                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │  Payment Gateways Card     │
        │  (Link to /admin/...)      │
        └────────────┬───────────────┘
                     │
                     ▼
    ┌────────────────────────────────────────┐
    │  PaymentGatewayManager Component       │
    │  (UI for managing gateways)            │
    └────────────┬───────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────────┐
    │ Admin API Route                │
    │ PUT /api/admin/payment-gates   │
    └────────────┬────────────────────┘
                 │
                 ▼
    ┌────────────────────────────────┐
    │  PostgreSQL Database           │
    │  PaymentGateway table          │
    └────────────────────────────────┘
```

### Customer Flow

```
Customer on Payment Page
    ▼
Fetch from /api/payment-gateways
    ▼
Filter: isPublic=true && enabled=true
    ▼
Return sorted by displayOrder (cached 5 min)
    ▼
PaymentGateway Component
    ▼
Render buttons for available methods
    ▼
Customer selects method
    ▼
Display relevant payment form
```

## 📚 API Documentation

### Admin API Endpoint
```
PUT /api/admin/payment-gateways
```

**Authentication:** Admin only (session + role check)

**Request Body:**
```typescript
{
  id: string;           // Required: Gateway ID
  isPublic?: boolean;   // Optional: Visibility toggle
  enabled?: boolean;    // Optional: Active status
  displayOrder?: number; // Optional: Display position
  processingTime?: string; // Optional: Processing info
  fees?: string;        // Optional: Fee info
}
```

**Response:**
```typescript
{
  id: string;
  type: string;
  displayName: string;
  description?: string;
  isPublic: boolean;
  enabled: boolean;
  displayOrder: number;
  icon?: string;
  processingTime?: string;
  fees?: string;
  metadata?: JSON;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

**Error Codes:**
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (not admin)
- `400`: Bad request (missing ID)
- `500`: Server error

### Public API Endpoint
```
GET /api/payment-gateways
```

**Authentication:** None (public)

**Cache:** 5 minutes (max-age=300)

**Response:**
```typescript
[
  {
    id: string;
    type: string;           // "stripe" | "paypal" | "bank_transfer"
    displayName: string;
    description?: string;
    icon?: string;
    processingTime?: string;
    fees?: string;
    metadata?: JSON;
  }
]
```

**Filtering:**
- Only returns: `isPublic: true AND enabled: true`
- Sorted by: `displayOrder ASC`
- No auth required
- Safe for public consumption

## 🗄️ Database Schema

### PaymentGateway Model

```prisma
model PaymentGateway {
  id                String    @id @default(cuid())
  type              String    @unique           // Primary key-like field
  displayName       String                      // User-friendly name
  description       String?                     // Short description
  
  isPublic          Boolean   @default(true)   // Visibility toggle
  enabled           Boolean   @default(true)   // Active status
  displayOrder      Int       @default(0)      // Sort order (1-3)
  
  icon              String?                     // Emoji or icon URL
  processingTime    String?                     // "Instant", "1-3 days", etc
  fees              String?                     // Fee description
  metadata          Json?                       // Extensible config data
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([type])
  @@index([isPublic])
  @@index([enabled])
  @@index([displayOrder])
}
```

### Indexes
- `type`: For unique lookups
- `isPublic`: For filtering public methods
- `enabled`: For filtering active methods
- `displayOrder`: For sorting results

## 🔐 Security Implementation

### Authentication & Authorization

**Admin API Route:**
```typescript
// Check session exists
const session = await auth()
if (!session?.user) return 401

// Check admin role
const user = await db.user.findUnique({
  where: { id: session.user.id }
})
if (!user || user.role !== "ADMIN") return 403
```

**Public API Route:**
- No authentication required
- Caching enabled (5 min)
- Only public data returned

### Access Control Matrix

| User Type | Admin Page | Admin API | Public API |
|-----------|-----------|-----------|-----------|
| **Public** | ❌ 401 | ❌ 401 | ✅ 200 |
| **User** | ❌ 403 | ❌ 403 | ✅ 200 |
| **Admin** | ✅ 200 | ✅ 200 | ✅ 200 |

## 🎯 Component Architecture

### PaymentGatewayManager Component

**Location:** `components/admin/PaymentGatewayManager.tsx`

**Props:** None (uses internal state)

**State:**
```typescript
gateways: PaymentGateway[]
loading: boolean
saving: boolean
editingId: string | null
editingOrder: Record<string, number>
```

**Features:**
- Fetch on mount: `GET /api/admin/payment-gateways`
- Toggle public: `PUT /api/admin/payment-gateways` (isPublic)
- Toggle enabled: `PUT /api/admin/payment-gateways` (enabled)
- Reorder: Multiple `PUT` calls to update displayOrder
- Error handling with user feedback

**UI Elements:**
- Eye icon (toggle public)
- Status button (active/disabled)
- Up/Down arrows (reorder)
- Gateway info card (icon, name, description, details)
- Summary card (active count)

### PaymentGateway Component (Updated)

**Location:** `components/payments/PaymentGateway.tsx`

**Changes from Static:**
- ❌ Hard-coded methods
- ✅ Dynamic fetch from `/api/payment-gateways`
- ✅ Loading state
- ✅ Error handling
- ✅ Responsive grid (1/2/3 columns)

**New Hooks:**
```typescript
const [gateways, setGateways] = useState<Gateway[]>([])
const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  // Fetch gateways on mount
  const response = await fetch("/api/payment-gateways", {
    cache: "no-store"
  })
  const data = await response.json()
  setGateways(data)
  if (data.length > 0) {
    setSelectedMethod(data[0].type as PaymentMethod)
  }
}, [onError])
```

## 📈 Performance Considerations

### Caching Strategy

**Public API (5 minute TTL):**
```
GET /api/payment-gateways
Cache-Control: public, max-age=300
```

**Rationale:**
- Gateways change infrequently
- Reduces database load
- Customer sees mostly consistent list
- 5 minutes is good balance

**Cache Invalidation:**
- Automatically expires after 5 minutes
- Manual invalidation coming in future
- On deployment, restart invalidates cache

### Database Queries

**Admin Route:**
```prisma
// Fetch all gateways
findMany({
  orderBy: { displayOrder: "asc" }
})
// Indexes: displayOrder, enabled, isPublic (used in updates)
```

**Public Route:**
```prisma
// Fetch only public & enabled
findMany({
  where: { isPublic: true, enabled: true },
  select: { /* limited fields */ },
  orderBy: { displayOrder: "asc" }
})
// Indexes: isPublic, enabled, displayOrder (used in query)
```

## 🧪 Testing Strategies

### Unit Tests (Recommended)

```typescript
describe('PaymentGatewayManager', () => {
  it('should toggle public visibility', async () => {
    // Test eye icon toggle
    // Verify API call
    // Check state update
  })
  
  it('should toggle enabled status', async () => {
    // Test status button
    // Verify API call
    // Check visual feedback
  })
  
  it('should reorder gateways', async () => {
    // Test up/down arrows
    // Verify multiple API calls
    // Check new order displayed
  })
})
```

### Integration Tests

```typescript
describe('Payment Gateway API', () => {
  it('GET /api/payment-gateways should return public gateways', () => {
    // Fetch from public API
    // Verify only isPublic=true && enabled=true
    // Check cache header
  })
  
  it('PUT /api/admin/payment-gateways should update gateway', () => {
    // Authenticate as admin
    // Send update request
    // Verify database change
    // Verify response
  })
})
```

### End-to-End Tests

```typescript
describe('Payment Gateway Management Flow', () => {
  it('admin should hide payment method from customers', () => {
    // Admin: navigate to /admin/payment-gateways
    // Admin: click eye icon
    // Customer: check payment page
    // Verify method is gone
  })
})
```

## 🔄 Data Flow Examples

### Example 1: Admin Hides Bank Transfer

```javascript
// Admin UI
togglePublic("bank_transfer_id", true) // currently public

// API Request
PUT /api/admin/payment-gateways
{
  id: "bank_transfer_id",
  isPublic: false  // toggle from true to false
}

// Database Update
UPDATE PaymentGateway
SET isPublic = false
WHERE id = "bank_transfer_id"

// Customer Experience
GET /api/payment-gateways
// Response does NOT include bank_transfer
// Payment page shows only 2 options: Stripe, PayPal
```

### Example 2: Admin Reorders Methods

```javascript
// Before
1. Stripe (displayOrder: 1)
2. PayPal (displayOrder: 2)
3. Bank Transfer (displayOrder: 3)

// Admin clicks down arrow on Stripe
// System swaps displayOrder values

// API Requests (2 calls)
PUT /api/admin/payment-gateways
{ id: "stripe_id", displayOrder: 2 }

PUT /api/admin/payment-gateways
{ id: "paypal_id", displayOrder: 1 }

// After
1. PayPal (displayOrder: 1)
2. Stripe (displayOrder: 2)
3. Bank Transfer (displayOrder: 3)
```

## 🚀 Deployment Notes

### Pre-Deployment

1. **Run Migration:**
   ```bash
   npm run prisma:migrate:deploy
   ```

2. **Seed Gateways:**
   ```bash
   npm run db:seed
   # or manually in script
   ```

3. **Test Admin Page:**
   ```
   /admin/payment-gateways should be accessible
   ```

### Post-Deployment

1. **Verify in Production:**
   - Admin can toggle gateways
   - Customers see only public methods
   - API caching works

2. **Monitor:**
   - Check API response times
   - Verify database indexes
   - Monitor cache hit ratio

## 📋 Future Enhancements

1. **Gateway Configuration UI**
   - Let admin set custom icons
   - Edit display name/description in UI
   - Manage fees percentage

2. **Analytics**
   - Track which gateways customers use
   - Success rates per gateway
   - Revenue by payment method

3. **Regional Settings**
   - Different gateways per country
   - Currency-specific configuration

4. **Gateway-Specific Settings**
   - Store API keys securely
   - Per-gateway webhook configuration
   - Feature flags (e.g., 3D Secure)

5. **Audit Logging**
   - Track who changed what
   - When changes were made
   - Rollback capability

---

**Documentation Version:** 1.0
**Last Updated:** December 7, 2025
**Maintained By:** Development Team
