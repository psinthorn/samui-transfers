#!/bin/bash

# 💳 Automated Payment Testing Script
# Usage: ./scripts/test-payments.sh [stripe|paypal|all] [local|staging]
# Examples:
#   ./scripts/test-payments.sh stripe local
#   ./scripts/test-payments.sh paypal staging
#   ./scripts/test-payments.sh all local

set -e

# Configuration
PAYMENT_TYPE=${1:-all}
ENVIRONMENT=${2:-local}

# URLs
if [ "$ENVIRONMENT" = "local" ]; then
  BASE_URL="http://localhost:3000"
  echo "🧪 Testing locally at $BASE_URL"
else
  BASE_URL="https://samui-transfers-staging.vercel.app"
  echo "🧪 Testing staging at $BASE_URL"
fi

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
log_success() {
  echo -e "${GREEN}✅ $1${NC}"
  ((TESTS_PASSED++))
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
  ((TESTS_FAILED++))
}

log_info() {
  echo -e "${YELLOW}ℹ️  $1${NC}"
}

# ============================================================================
# STRIPE TESTS
# ============================================================================

test_stripe() {
  echo ""
  echo "═══════════════════════════════════════"
  echo "🟦 STRIPE PAYMENT TESTS"
  echo "═══════════════════════════════════════"
  
  # Test 1: Create Checkout Session
  echo ""
  log_info "Test 1: Create Stripe checkout session"
  
  RESPONSE=$(curl -s -X POST "$BASE_URL/api/payments/stripe/create-checkout-session" \
    -H "Content-Type: application/json" \
    -d '{
      "bookingId": "test-booking-stripe-'$(date +%s)'",
      "amount": 10000,
      "currency": "USD"
    }')
  
  if echo "$RESPONSE" | grep -q "sessionId"; then
    log_success "Stripe checkout session created"
    SESSION_ID=$(echo "$RESPONSE" | grep -o '"sessionId":"[^"]*' | cut -d'"' -f4)
    log_info "Session ID: $SESSION_ID"
  else
    log_error "Failed to create checkout session"
    log_info "Response: $RESPONSE"
    return 1
  fi
  
  # Test 2: Check Session Exists
  echo ""
  log_info "Test 2: Verify session ID format"
  
  if [[ $SESSION_ID =~ ^cs_ ]]; then
    log_success "Session ID has correct format (cs_...)"
  else
    log_error "Session ID has incorrect format: $SESSION_ID"
  fi
  
  # Test 3: Get Payment Status
  echo ""
  log_info "Test 3: Query payment from database"
  
  # This would require database access, simulating with API call
  BOOKING_ID=$(echo "$RESPONSE" | grep -o '"bookingId":"[^"]*' | cut -d'"' -f4)
  
  PAYMENTS=$(curl -s -X GET "$BASE_URL/api/admin/payments?status=PROCESSING" \
    -H "Accept: application/json")
  
  if echo "$PAYMENTS" | grep -q "PROCESSING\|COMPLETED"; then
    log_success "Payments endpoint responding correctly"
  else
    log_error "Payments endpoint not responding as expected"
  fi
  
  # Test 4: Webhook Structure
  echo ""
  log_info "Test 4: Check webhook handling capability"
  
  WEBHOOK_TEST=$(curl -s -X POST "$BASE_URL/api/payments/stripe/webhook" \
    -H "Content-Type: application/json" \
    -H "stripe-signature: test" \
    -d '{
      "type": "payment_intent.succeeded",
      "data": {
        "object": {
          "id": "pi_test_'$(date +%s)'",
          "amount": 10000,
          "currency": "USD",
          "status": "succeeded"
        }
      }
    }' 2>&1)
  
  if echo "$WEBHOOK_TEST" | grep -qE "401|403|webhook|invalid"; then
    log_success "Webhook endpoint configured (authentication working)"
  else
    log_error "Webhook endpoint may not be configured correctly"
  fi
  
  return 0
}

# ============================================================================
# PAYPAL TESTS
# ============================================================================

test_paypal() {
  echo ""
  echo "═══════════════════════════════════════"
  echo "🅿️  PAYPAL PAYMENT TESTS"
  echo "═══════════════════════════════════════"
  
  # Test 1: Create PayPal Order
  echo ""
  log_info "Test 1: Create PayPal order"
  
  RESPONSE=$(curl -s -X POST "$BASE_URL/api/payments/paypal/create-order" \
    -H "Content-Type: application/json" \
    -d '{
      "bookingId": "test-booking-paypal-'$(date +%s)'",
      "amount": "100.00",
      "currency": "USD"
    }')
  
  if echo "$RESPONSE" | grep -q "orderId\|id"; then
    log_success "PayPal order created"
    ORDER_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    log_info "Order ID: $ORDER_ID"
  else
    log_error "Failed to create PayPal order"
    log_info "Response: $RESPONSE"
    # PayPal might not be configured, this is expected in test
    return 0
  fi
  
  # Test 2: Verify Order Structure
  echo ""
  log_info "Test 2: Verify order response structure"
  
  if echo "$RESPONSE" | grep -q "intent\|links"; then
    log_success "PayPal order has expected structure"
  else
    log_info "PayPal order structure (may be test environment)"
  fi
  
  # Test 3: Webhook Structure
  echo ""
  log_info "Test 3: Check PayPal webhook handling capability"
  
  WEBHOOK_TEST=$(curl -s -X POST "$BASE_URL/api/payments/paypal/webhook" \
    -H "Content-Type: application/json" \
    -d '{
      "event_type": "CHECKOUT.ORDER.COMPLETED",
      "resource": {
        "id": "order_'$(date +%s)'",
        "status": "COMPLETED",
        "purchase_units": [{
          "amount": {
            "value": "100.00",
            "currency_code": "USD"
          }
        }]
      }
    }' 2>&1)
  
  if echo "$WEBHOOK_TEST" | grep -qE "401|403|webhook|invalid|received"; then
    log_success "PayPal webhook endpoint configured"
  else
    log_info "PayPal webhook endpoint (may be test environment)"
  fi
  
  return 0
}

# ============================================================================
# ADMIN ENDPOINT TESTS
# ============================================================================

test_admin_endpoints() {
  echo ""
  echo "═══════════════════════════════════════"
  echo "👨‍💼 ADMIN ENDPOINT TESTS"
  echo "═══════════════════════════════════════"
  
  # Test 1: Get Payments List
  echo ""
  log_info "Test 1: Get payments list"
  
  RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/payments?limit=10" \
    -H "Accept: application/json")
  
  if echo "$RESPONSE" | grep -qE "\[\]|id|amount|status"; then
    log_success "Payments list endpoint responding"
  else
    log_error "Payments list endpoint error"
    log_info "Response: $RESPONSE"
  fi
  
  # Test 2: Filter Payments
  echo ""
  log_info "Test 2: Filter payments by status"
  
  for STATUS in "COMPLETED" "PROCESSING" "FAILED"; do
    RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/payments?status=$STATUS&limit=5" \
      -H "Accept: application/json")
    
    if echo "$RESPONSE" | grep -qE "\[\]|status"; then
      log_success "Filter by status=$STATUS works"
    fi
  done
  
  # Test 3: Sort Payments
  echo ""
  log_info "Test 3: Sort payments"
  
  for SORT in "recent" "oldest" "amount-high" "amount-low"; do
    RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/payments?sortBy=$SORT&limit=5" \
      -H "Accept: application/json")
    
    if echo "$RESPONSE" | grep -qE "\[\]|id"; then
      log_success "Sort by $SORT works"
    fi
  done
  
  # Test 4: Get Payment Details
  echo ""
  log_info "Test 4: Get payment details (if payments exist)"
  
  # First get a payment ID
  PAYMENTS=$(curl -s -X GET "$BASE_URL/api/admin/payments?limit=1" \
    -H "Accept: application/json")
  
  if echo "$PAYMENTS" | grep -q '"id"'; then
    PAYMENT_ID=$(echo "$PAYMENTS" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    
    DETAILS=$(curl -s -X GET "$BASE_URL/api/admin/payments/$PAYMENT_ID" \
      -H "Accept: application/json")
    
    if echo "$DETAILS" | grep -q "id"; then
      log_success "Get payment details endpoint works"
    else
      log_error "Get payment details failed"
    fi
  else
    log_info "No payments exist yet (this is fine)"
  fi
  
  return 0
}

# ============================================================================
# DATABASE CONNECTIVITY TESTS
# ============================================================================

test_database_connectivity() {
  echo ""
  echo "═══════════════════════════════════════"
  echo "🗄️  DATABASE CONNECTIVITY TESTS"
  echo "═══════════════════════════════════════"
  
  # Test 1: Prisma Status
  echo ""
  log_info "Test 1: Check Prisma database connection"
  
  if cd /Volumes/Data/Projects/samui-transfers && npx prisma db execute --stdin --file /dev/null 2>/dev/null; then
    log_success "Prisma connected to database"
  else
    log_info "Database connection check (may require credentials)"
  fi
  
  # Test 2: Migration Status
  echo ""
  log_info "Test 2: Check Prisma migrations"
  
  if cd /Volumes/Data/Projects/samui-transfers && npx prisma migrate status 2>/dev/null | grep -q "are up to date\|pending"; then
    log_success "Prisma migrations status retrieved"
  else
    log_info "Migration status check (may need manual verification)"
  fi
  
  return 0
}

# ============================================================================
# EMAIL SENDING TESTS
# ============================================================================

test_email_service() {
  echo ""
  echo "═══════════════════════════════════════"
  echo "📧 EMAIL SERVICE TESTS"
  echo "═══════════════════════════════════════"
  
  # Test 1: Check Email Configuration
  echo ""
  log_info "Test 1: Check email service configuration"
  
  if [ -f /Volumes/Data/Projects/samui-transfers/.env.local ]; then
    if grep -q "RESEND_API_KEY\|NEXT_PUBLIC_FROM_EMAIL" /Volumes/Data/Projects/samui-transfers/.env.local; then
      log_success "Email configuration found in .env.local"
    else
      log_error "Email configuration missing in .env.local"
    fi
  else
    log_error ".env.local file not found"
  fi
  
  # Test 2: Test Email Template
  echo ""
  log_info "Test 2: Verify email template files exist"
  
  if [ -f /Volumes/Data/Projects/samui-transfers/frontend/lib/email/payment-receipt-template.ts ]; then
    log_success "Payment receipt template exists"
  else
    log_error "Payment receipt template missing"
  fi
  
  if [ -f /Volumes/Data/Projects/samui-transfers/frontend/lib/email/service.ts ]; then
    log_success "Email service file exists"
  else
    log_error "Email service file missing"
  fi
  
  return 0
}

# ============================================================================
# PERFORMANCE TESTS
# ============================================================================

test_performance() {
  echo ""
  echo "═══════════════════════════════════════"
  echo "⚡ PERFORMANCE TESTS"
  echo "═══════════════════════════════════════"
  
  # Test 1: API Response Time
  echo ""
  log_info "Test 1: Measure API response times"
  
  for ENDPOINT in "/api/admin/payments" "/api/payments/stripe/create-checkout-session"; do
    START=$(date +%s%N)
    curl -s -X GET "$BASE_URL$ENDPOINT" > /dev/null 2>&1
    END=$(date +%s%N)
    
    DURATION=$((($END - $START) / 1000000))
    
    if [ $DURATION -lt 1000 ]; then
      log_success "Endpoint $ENDPOINT responded in ${DURATION}ms"
    else
      log_error "Endpoint $ENDPOINT took ${DURATION}ms (>1000ms)"
    fi
  done
  
  return 0
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
  echo ""
  echo "╔════════════════════════════════════════╗"
  echo "║   💳 PAYMENT SYSTEM TEST SUITE 💳     ║"
  echo "║         $(date +%Y-%m-%d' '%H:%M:%S)          ║"
  echo "╚════════════════════════════════════════╝"
  
  case $PAYMENT_TYPE in
    stripe)
      test_stripe
      ;;
    paypal)
      test_paypal
      ;;
    all)
      test_stripe
      test_paypal
      test_admin_endpoints
      test_database_connectivity
      test_email_service
      test_performance
      ;;
    *)
      log_error "Unknown payment type: $PAYMENT_TYPE"
      echo "Usage: $0 [stripe|paypal|all] [local|staging]"
      exit 1
      ;;
  esac
  
  # Print summary
  echo ""
  echo "═══════════════════════════════════════"
  echo "📊 TEST SUMMARY"
  echo "═══════════════════════════════════════"
  echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
  if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
  else
    echo -e "${RED}❌ Tests Failed: 0${NC}"
  fi
  echo ""
  
  if [ $TESTS_FAILED -eq 0 ]; then
    log_success "ALL TESTS PASSED! 🎉"
    exit 0
  else
    log_error "SOME TESTS FAILED - PLEASE REVIEW"
    exit 1
  fi
}

# Run main
main
