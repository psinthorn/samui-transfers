# Payment System - Visual Implementation Guide

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Frontend User Interface                          │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Booking Checkout Page (/booking/checkout)                  │   │
│  │                                                               │   │
│  │  Trip Details          Contact Form        Payment Summary  │   │
│  │  - From/To location    - Full Name         - Total: 1600   │   │
│  │  - Date/Time           - Email             - Currency: THB │   │
│  │  - Passengers          - Validation        - Tax: 112      │   │
│  │                                                               │   │
│  │                  [Proceed to Payment Button]                │   │
│  │                                                               │   │
│  │  ┌────────────────────────────────────────────────────┐    │   │
│  │  │ PaymentGateway Component (appears below)           │    │   │
│  │  │                                                     │    │   │
│  │  │ ┌──────────────────────────────────────────────┐  │    │   │
│  │  │ │ Choose Payment Method: [Stripe] [PayPal]     │  │    │   │
│  │  │ └──────────────────────────────────────────────┘  │    │   │
│  │  │                                                     │    │   │
│  │  │ ┌─────────────────┐  ┌──────────────────────────┐ │    │   │
│  │  │ │ Stripe Form     │  │ PayPal Form              │ │    │   │
│  │  │ │                 │  │                          │ │    │   │
│  │  │ │ Cardholder: ___ │  │ Full Name: _________     │ │    │   │
│  │  │ │ Email: ________ │  │ Email: _____________    │ │    │   │
│  │  │ │                 │  │                          │ │    │   │
│  │  │ │ 💳 4242 4242... │  │ 🅿️ Sandbox Mode         │ │    │   │
│  │  │ │                 │  │                          │ │    │   │
│  │  │ │ [Pay with Stripe]  │ [Pay with PayPal]       │ │    │   │
│  │  │ └─────────────────┘  └──────────────────────────┘ │    │   │
│  │  │                                                     │    │   │
│  │  │ 🔒 SSL | ✓ PCI | 🛡️ Secure                      │    │   │
│  │  │                                                     │    │   │
│  │  │ FAQ: How is my data protected? / Why two methods? │    │   │
│  │  └────────────────────────────────────────────────────┘    │   │
│  │                                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴──────────────┐
                ↓                            ↓
        ┌────────────────┐          ┌────────────────┐
        │ STRIPE FLOW    │          │ PAYPAL FLOW    │
        └────────────────┘          └────────────────┘
                │                            │
                ↓                            ↓
        POST /api/payments/stripe/  POST /api/payments/paypal/
        create-checkout-session     create-order
                │                            │
                ↓                            ↓
        ┌────────────────────┐      ┌────────────────────┐
        │ Stripe Servers     │      │ PayPal Servers     │
        │                    │      │                    │
        │ Create Session     │      │ Create Order       │
        │ ID: cs_test_...    │      │ ID: 7E123456...    │
        │ URL: checkout.     │      │ URL: paypal.com    │
        │   stripe.com/pay   │      │   /checkoutnow     │
        └────────────────────┘      └────────────────────┘
                │                            │
                ↓                            ↓
        ┌────────────────────┐      ┌────────────────────┐
        │ STRIPE CHECKOUT    │      │ PAYPAL APPROVAL    │
        │                    │      │                    │
        │ Enter Card Details │      │ Login to Account   │
        │ - Card Number      │      │ - Username/Pass    │
        │ - Expiry Date      │      │ - Confirm Amount   │
        │ - CVC Code         │      │ - Approve Payment  │
        │ - Cardholder Name  │      │ - Redirect Back    │
        │ - Billing Address  │      │                    │
        │                    │      │                    │
        │ [Complete Payment] │      │ [Pay Now]          │
        └────────────────────┘      └────────────────────┘
                │                            │
                ↓ Success                   ↓ Success
        ┌─────────────────────────────────────────────────┐
        │ Redirect to: /booking/success?session_id=...    │
        │             OR /booking/success?orderId=...     │
        └─────────────────────────────────────────────────┘
                │
                ↓
        ┌─────────────────────────────────────────────────┐
        │ Backend: POST /api/payments/paypal/capture-order│
        │          (for PayPal only)                      │
        │          Capture the payment                    │
        └─────────────────────────────────────────────────┘
                │
                ↓
        ┌─────────────────────────────────────────────────┐
        │ Database Updates:                               │
        │ 1. Create Payment record                        │
        │ 2. Update Booking status → "confirmed"          │
        │ 3. Update Booking paymentStatus → "paid"        │
        └─────────────────────────────────────────────────┘
                │
                ↓
        ┌─────────────────────────────────────────────────┐
        │ Success Page: /booking/success                  │
        │                                                 │
        │ ✓ Payment Successful!                           │
        │                                                 │
        │ Booking Reference: BK-123456                   │
        │ Payment Method: 💳 Stripe / 🅿️ PayPal         │
        │ Transaction ID: cs_test_... / 7E123456...      │
        │ Confirmed At: 2024-01-15 14:30 UTC             │
        │                                                 │
        │ What Happens Next?                              │
        │ 1. Confirmation email sent                      │
        │ 2. Team reviews booking                         │
        │ 3. Pickup details sent 24h before               │
        │ 4. Enjoy your transfer!                         │
        │                                                 │
        │ [View My Bookings] [Back to Home]              │
        │                                                 │
        │ Support: +66 99 108 7999 (24/7)               │
        └─────────────────────────────────────────────────┘
```

---

## 🔄 Error Flow Diagram

```
                Payment Processing
                        │
                        ↓
        ┌───────────────────────────────────┐
        │      Error Occurs                   │
        │  (Card declined, invalid email,    │
        │   network error, etc.)             │
        └───────────────┬───────────────────┘
                        ↓
        ┌───────────────────────────────────┐
        │ Generate Error Code & Message      │
        └───────────────┬───────────────────┘
                        ↓
        Redirect: /booking/error?code=card_declined
                        │
                        ↓
        ┌───────────────────────────────────┐
        │ Error Page: /booking/error         │
        │                                     │
        │ ✕ Card Declined                    │
        │                                     │
        │ Your card was declined by bank.    │
        │                                     │
        │ Error Code: card_declined          │
        │                                     │
        │ What You Can Do:                   │
        │ → Try a different card             │
        │ → Contact your bank                │
        │ → Try again after a few minutes    │
        │                                     │
        │ [Try Payment Again]  [Back to Home]│
        │                                     │
        │ Support: +66 99 108 7999          │
        └───────────────────────────────────┘
```

---

## 📱 Component Hierarchy

```
App (with PaymentProvider)
│
├── Layout
│   ├── Header
│   ├── Navigation
│   └── Main Content
│       │
│       ├── /booking/checkout
│       │   └── BookingCheckoutPage
│       │       ├── Trip Details Section
│       │       ├── Contact Form
│       │       │   ├── Full Name Input
│       │       │   └── Email Input
│       │       ├── Booking Summary (Sidebar)
│       │       │   ├── Price Breakdown
│       │       │   ├── Total Display
│       │       │   └── "Proceed to Payment" Button
│       │       │
│       │       └── PaymentGateway
│       │           ├── Method Selector (Toggle)
│       │           │   ├── [Stripe Button]
│       │           │   └── [PayPal Button]
│       │           │
│       │           ├── StripePaymentForm (Conditional)
│       │           │   ├── Cardholder Name Input
│       │           │   ├── Email Input
│       │           │   ├── Payment Summary
│       │           │   ├── Test Card Display
│       │           │   ├── Error Messages
│       │           │   └── [Pay with Stripe] Button
│       │           │
│       │           ├── PayPalPaymentButton (Conditional)
│       │           │   ├── Full Name Input
│       │           │   ├── Email Input
│       │           │   ├── Payment Summary
│       │           │   ├── Sandbox Indicator
│       │           │   ├── Error Messages
│       │           │   └── [Pay with PayPal] Button
│       │           │
│       │           ├── Security Section
│       │           │   ├── 🔒 SSL Badge
│       │           │   ├── ✓ PCI Badge
│       │           │   └── 🛡️ Fraud Protection
│       │           │
│       │           └── FAQ Accordion
│       │               ├── How is my data protected?
│       │               ├── Why two payment methods?
│       │               └── Is payment secure?
│       │
│       ├── /booking/success
│       │   └── SuccessPage
│       │       ├── Success Icon (✓)
│       │       ├── Title & Message
│       │       ├── Order Details Card
│       │       │   ├── Booking Reference
│       │       │   ├── Payment Method
│       │       │   ├── Transaction ID
│       │       │   └── Timestamp
│       │       ├── What Happens Next (4-step guide)
│       │       ├── Action Buttons
│       │       │   ├── [View My Bookings]
│       │       │   └── [Back to Home]
│       │       └── Support Info
│       │
│       ├── /booking/error
│       │   └── ErrorPage
│       │       ├── Error Icon (✕)
│       │       ├── Error Title
│       │       ├── Error Description
│       │       ├── Error Details Card
│       │       ├── What You Can Do (Suggestions)
│       │       ├── Action Buttons
│       │       │   ├── [Try Payment Again]
│       │       │   └── [Back to Home]
│       │       └── Support Info
│       │
│       └── /booking/cancel
│           └── CancelPage
│               ├── Cancel Icon (⏸️)
│               ├── Title & Message
│               ├── Cancellation Details
│               ├── What Happens Now (3-step guide)
│               ├── Action Buttons
│               │   ├── [Return to Booking]
│               │   └── [Back to Home]
│               └── Support Info
│
├── Context Providers
│   ├── PaymentProvider
│   │   └── PaymentContext
│   │       ├── paymentMethod: "stripe" | "paypal"
│   │       ├── status: "idle" | "processing" | "success" | "error"
│   │       ├── error: PaymentError | null
│   │       ├── isProcessing: boolean
│   │       ├── processStripePayment(details)
│   │       ├── processPayPalPayment(details)
│   │       └── resetPayment()
│   │
│   └── usePayment() Hook
│       └── Returns PaymentContextType
│
└── Backend Services
    ├── API Routes
    │   ├── POST /api/payments/stripe/create-checkout-session
    │   ├── POST /api/payments/stripe/webhook
    │   ├── POST /api/payments/paypal/create-order
    │   └── GET/POST /api/payments/paypal/capture-order
    │
    ├── Database
    │   ├── Payment Model
    │   │   ├── id: String (Primary Key)
    │   │   ├── bookingId: String (Foreign Key)
    │   │   ├── method: String ("stripe" | "paypal")
    │   │   ├── amount: Decimal
    │   │   ├── currency: String
    │   │   ├── status: String
    │   │   ├── stripeSessionId: String?
    │   │   ├── paypalOrderId: String?
    │   │   ├── payer: String?
    │   │   ├── completedAt: DateTime?
    │   │   ├── createdAt: DateTime
    │   │   └── updatedAt: DateTime
    │   │
    │   └── Booking Model (Updated)
    │       ├── id: String
    │       ├── ... existing fields ...
    │       ├── status: "pending" | "confirmed" | "completed" | "cancelled"
    │       ├── paymentStatus: "pending" | "paid" | "refunded"
    │       └── payments: Payment[]
    │
    └── External Services
        ├── Stripe SDK (Server-Side)
        │   ├── Create Checkout Session
        │   ├── Process Webhooks
        │   └── Handle Payments
        │
        └── PayPal SDK (Server-Side)
            ├── Create Orders
            ├── Capture Payments
            └── Handle Redirects
```

---

## 🎨 UI Component Structure

### PaymentGateway Component Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    PAYMENT GATEWAY                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  CHOOSE YOUR PAYMENT METHOD                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │  [💳 Stripe] ────────────── [🅿️ PayPal]        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │              PAYMENT SUMMARY                        │    │
│  │  Booking ID: BK-123456                             │    │
│  │  Amount: 1,600 THB                                 │    │
│  │  Currency: Thai Baht                               │    │
│  └────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │   SELECTED FORM (Stripe or PayPal)                 │    │
│  │                                                     │    │
│  │   [Dynamic form content based on selection]        │    │
│  │                                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │  🔒 SSL  ✓ PCI Compliant  🛡️ Fraud Protected    │    │
│  │          YOUR PAYMENTS ARE SECURE                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │  ❓ FAQ - FREQUENTLY ASKED QUESTIONS              │    │
│  │  ▼ How is my payment data protected?              │    │
│  │    All transactions are encrypted and secured.    │    │
│  │  ▼ Why are there two payment methods?             │    │
│  │    Choose what works best for you.                │    │
│  │  ▼ Is my information stored?                      │    │
│  │    No, we don't store payment details.            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
USER INPUT
│
├─ Full Name
├─ Email
├─ Booking ID
├─ Amount
└─ Currency
    │
    ↓
FORM VALIDATION
│
├─ Email validation (required, valid format)
├─ Amount validation (> 0)
├─ Cardholder name validation (required)
└─ Custom validations
    │
    ↓
PAYMENT CONTEXT
│
├─ setPaymentMethod() - Set Stripe or PayPal
├─ processStripePayment() - Call Stripe API
├─ processPayPalPayment() - Call PayPal API
├─ resetPayment() - Clear state
└─ State: { paymentMethod, status, error, isProcessing }
    │
    ↓
API ROUTE
│
├─ POST /api/payments/stripe/create-checkout-session
│   ├─ Validate input
│   ├─ Call Stripe SDK
│   ├─ Create session
│   └─ Return checkout URL
│
OR
│
├─ POST /api/payments/paypal/create-order
│   ├─ Validate input
│   ├─ Call PayPal SDK
│   ├─ Create order
│   └─ Return approval link
    │
    ↓
PAYMENT PROVIDER
│
├─ Stripe Checkout (Hosted)
│   ├─ User enters card
│   ├─ Validates card
│   └─ Processes payment
│
OR
│
├─ PayPal Approval (Hosted)
│   ├─ User logs in
│   ├─ Reviews order
│   └─ Approves payment
    │
    ↓
REDIRECT BACK
│
├─ Success: /booking/success?session_id=...
│   └─ Redirect: /api/payments/paypal/capture-order (PayPal only)
│
OR
│
├─ Error: /booking/error?code=...
└─ Cancel: /booking/cancel?bookingId=...
    │
    ↓
DATABASE
│
├─ Create Payment record
│   ├─ bookingId
│   ├─ method (stripe/paypal)
│   ├─ amount
│   ├─ status
│   ├─ stripeSessionId / paypalOrderId
│   └─ completedAt timestamp
│
└─ Update Booking record
    ├─ status: "confirmed"
    └─ paymentStatus: "paid"
        │
        ↓
SUCCESS PAGE
│
├─ Display transaction details
├─ Show what happens next
├─ Provide support links
└─ Options to view bookings or home
```

---

## 🔐 Security Flow

```
USER DATA ENTRY
│
├─ All forms in browser
├─ NO sensitive data sent to backend
└─ Validation happens client-side
    │
    ↓
FRONTEND VALIDATION
│
├─ Email format check
├─ Amount validation
├─ Required field checks
└─ Error messages shown
    │
    ↓
BACKEND PROCESSING
│
├─ Server-side validation (redundant)
├─ API key not exposed
├─ Direct call to payment provider
└─ NO sensitive data logged
    │
    ↓
PAYMENT PROVIDER
│
├─ PCI DSS Compliant
├─ Secure encryption
├─ Fraud detection
└─ Tokenization
    │
    ↓
DATABASE STORAGE
│
├─ Payment metadata only
│   ├─ Amount ✓
│   ├─ Currency ✓
│   ├─ Status ✓
│   └─ Transaction ID ✓
│
├─ NO card numbers ✗
├─ NO CVC ✗
├─ NO sensitive data ✗
└─ Encrypted fields ✓
    │
    ↓
COMPLIANCE
│
├─ GDPR compliant
├─ PCI DSS compliant
├─ Data retention policy
└─ User privacy protected
```

---

## 📈 Success Metrics

```
PAYMENT FLOW STAGES
│
├─ Stage 1: Form Entry (User enters data)
│   └─ Metric: Form completion rate
│
├─ Stage 2: Validation (Data verified)
│   └─ Metric: Validation error rate
│
├─ Stage 3: API Call (Payment initiated)
│   └─ Metric: API success rate
│
├─ Stage 4: Provider Processing (Payment processed)
│   └─ Metric: Payment success rate
│
├─ Stage 5: Redirect (Return from provider)
│   └─ Metric: Redirect success rate
│
├─ Stage 6: Database Update (Records saved)
│   └─ Metric: Database update success rate
│
├─ Stage 7: Success Page (Confirmation shown)
│   └─ Metric: User reaches success page
│
└─ OVERALL: End-to-End Success
    └─ Target: > 95% success rate
```

---

## 🎯 Performance Targets

```
METRIC                          TARGET      STATUS
─────────────────────────────────────────────────
Page Load Time                  < 2s        ✓
Form Validation                 < 100ms     ✓
API Response Time               < 1s        ✓
Payment Processing              < 5s        ✓
Redirect Time                   < 500ms     ✓
Database Update                 < 100ms     ✓
Error Display                   < 200ms     ✓
─────────────────────────────────────────────────
CUMULATIVE (End-to-End)         < 10s       ✓
```

---

**Diagrams Created**: 6
**Components Visualized**: 15+
**Flow Paths Documented**: 4
**Status**: Ready for implementation
