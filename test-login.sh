#!/bin/bash

# 🧪 Authentication Testing Script
# This script tests the complete login flow

echo "🔐 Authentication Testing Script"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
PROD_URL="https://www.samui-transfers.com"

# Check if local or production
if [ "$1" == "prod" ]; then
  BASE_URL=$PROD_URL
  echo "📍 Testing against: $PROD_URL"
else
  echo "📍 Testing against: $BASE_URL (local)"
  echo "   Use './test-login.sh prod' for production testing"
fi

echo ""
echo "Step 1️⃣  - Check Database Connection"
echo "======================================"

RESPONSE=$(curl -s "$BASE_URL/api/debug")
if echo "$RESPONSE" | grep -q "emailVerified.*verified"; then
  echo -e "${GREEN}✓${NC} Database connected"
  echo "✓ Test user verified"
  echo ""
else
  echo -e "${RED}✗${NC} Database issue detected"
  echo "$RESPONSE" | head -20
  exit 1
fi

echo "Step 2️⃣  - Clear Browser Cookies"
echo "===================================="
echo "⚠️  Before testing, please clear cookies:"
echo ""
if [ "$BASE_URL" == "http://localhost:3000" ]; then
  echo "   Dev Tools → Application → Cookies → localhost:3000 → Delete All"
else
  echo "   Dev Tools → Application → Cookies → .samui-transfers.com → Delete All"
fi
echo ""
read -p "Press Enter when ready..."
echo ""

echo "Step 3️⃣  - Test Sign In"
echo "======================="
echo "📋 Test Credentials:"
echo "   Email: adminx@admin.com"
echo "   Password: Adminx"
echo ""
echo "🌐 Sign in URL: $BASE_URL/sign-in"
echo ""
echo "📝 Please:"
echo "   1. Open DevTools (F12)"
echo "   2. Go to Console tab"
echo "   3. Go to Application → Cookies"
echo "   4. Navigate to sign-in page"
echo "   5. Enter credentials"
echo "   6. Click Sign In"
echo "   7. Look for:"
echo "      - 'next-auth.session-token' cookie being set ✓"
echo "      - Page redirects to /dashboard ✓"
echo ""

read -p "Did you see the redirect to /dashboard? (yes/no): " ANSWER

if [ "$ANSWER" == "yes" ]; then
  echo ""
  echo -e "${GREEN}============================================${NC}"
  echo -e "${GREEN}✓ LOGIN TEST PASSED!${NC}"
  echo -e "${GREEN}============================================${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Test admin panel: $BASE_URL/admin"
  echo "  2. Test dashboard: $BASE_URL/dashboard"
  echo "  3. Try logging out"
  echo "  4. Try logging back in"
else
  echo ""
  echo -e "${RED}============================================${NC}"
  echo -e "${RED}✗ LOGIN TEST FAILED${NC}"
  echo -e "${RED}============================================${NC}"
  echo ""
  echo "Debugging steps:"
  echo "  1. Check DevTools Console for errors"
  echo "  2. Check Network tab - look for POST /api/auth/callback/credentials"
  echo "  3. Verify cookies are set (should see 'next-auth.session-token')"
  echo "  4. Check .env.local has NEXTAUTH_URL and DATABASE_URL"
  echo ""
  echo "Common issues:"
  echo "  - NEXTAUTH_URL not set → sessions won't persist"
  echo "  - DATABASE_URL pointing to wrong database → auth fails"
  echo "  - Browser cookies disabled → sessions can't be stored"
  echo "  - Hostname mismatch (localhost vs 127.0.0.1) → cookie issues"
fi
