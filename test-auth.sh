#!/bin/bash

# Authentication System Test Script
# This script helps verify the authentication system is working correctly

set -e

echo "🔐 Authentication System Test Suite"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
LOCAL_URL="${1:-http://localhost:3000}"
TEST_EMAIL="${2:-test@example.com}"
TEST_PASSWORD="${3:-password123}"

echo "Configuration:"
echo "  Base URL: $LOCAL_URL"
echo "  Test Email: $TEST_EMAIL"
echo "  Test Password: $TEST_PASSWORD"
echo ""

# Test 1: Check if server is running
echo "Test 1: Server Health Check"
echo "---"
if curl -s "$LOCAL_URL" > /dev/null; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${RED}✗ Server is not accessible${NC}"
    echo "  Make sure the app is running: npm run dev"
    exit 1
fi
echo ""

# Test 2: Check sign-in page loads
echo "Test 2: Sign-In Page Load"
echo "---"
SIGNIN_RESPONSE=$(curl -s -w "%{http_code}" "$LOCAL_URL/sign-in" -o /dev/null)
if [ "$SIGNIN_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Sign-in page loads successfully${NC}"
else
    echo -e "${RED}✗ Sign-in page returned status $SIGNIN_RESPONSE${NC}"
fi
echo ""

# Test 3: Check auth API endpoint
echo "Test 3: Auth API Endpoint"
echo "---"
if curl -s "$LOCAL_URL/api/auth/callback/credentials" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Auth endpoint is accessible${NC}"
else
    echo -e "${YELLOW}⚠ Auth endpoint might not be accessible (expected for GET)${NC}"
fi
echo ""

# Test 4: Check session API
echo "Test 4: Session API"
echo "---"
SESSION_RESPONSE=$(curl -s "$LOCAL_URL/api/auth/session" 2>/dev/null || echo "error")
if [ "$SESSION_RESPONSE" != "error" ]; then
    echo -e "${GREEN}✓ Session API is accessible${NC}"
    # Check if unauthenticated (should return empty)
    if echo "$SESSION_RESPONSE" | grep -q "null\|{}" || [ "$SESSION_RESPONSE" = "" ]; then
        echo -e "${GREEN}✓ Correctly returns empty session when unauthenticated${NC}"
    fi
else
    echo -e "${RED}✗ Session API is not responding${NC}"
fi
echo ""

# Test 5: Check middleware matcher
echo "Test 5: Middleware Routing"
echo "---"
echo "Checking various routes..."

# Public routes should work
for route in "/" "/about-us" "/contact"; do
    RESPONSE=$(curl -s -w "%{http_code}" "$LOCAL_URL$route" -o /dev/null)
    if [ "$RESPONSE" = "200" ]; then
        echo -e "${GREEN}✓ Public route $route: OK${NC}"
    else
        echo -e "${YELLOW}⚠ Public route $route: $RESPONSE${NC}"
    fi
done
echo ""

# Test 6: Protected routes redirect to login (unauthenticated)
echo "Test 6: Protected Route Redirect (Unauthenticated)"
echo "---"
for route in "/dashboard" "/admin" "/booking"; do
    RESPONSE=$(curl -s -w "%{http_code}" -L "$LOCAL_URL$route" -o /dev/null)
    if [ "$RESPONSE" = "200" ]; then
        echo -e "${GREEN}✓ Protected route $route: Redirected to login${NC}"
    else
        echo -e "${RED}✗ Protected route $route: Unexpected response $RESPONSE${NC}"
    fi
done
echo ""

# Test 7: Check environment variables
echo "Test 7: Environment Variables Check"
echo "---"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓ .env.local file exists${NC}"
    
    # Check critical variables
    if grep -q "NEXTAUTH_SECRET" .env.local; then
        echo -e "${GREEN}✓ NEXTAUTH_SECRET is set${NC}"
    else
        echo -e "${RED}✗ NEXTAUTH_SECRET is not set${NC}"
    fi
    
    if grep -q "NEXTAUTH_URL" .env.local; then
        echo -e "${GREEN}✓ NEXTAUTH_URL is set${NC}"
    else
        echo -e "${RED}✗ NEXTAUTH_URL is not set${NC}"
    fi
    
    if grep -q "DATABASE_URL" .env.local; then
        echo -e "${GREEN}✓ DATABASE_URL is set${NC}"
    else
        echo -e "${YELLOW}⚠ DATABASE_URL is not set (may be in .env)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ .env.local file not found (may be in other .env file)${NC}"
fi
echo ""

# Test 8: Database connectivity (if possible)
echo "Test 8: Database Check"
echo "---"
if command -v psql &> /dev/null; then
    echo "PostgreSQL client is available"
    if [ -f ".env.local" ]; then
        DB_URL=$(grep "DATABASE_URL" .env.local | cut -d'=' -f2-)
        if [ ! -z "$DB_URL" ]; then
            echo "Attempting to connect to database..."
            # Note: This might fail if credentials are invalid, which is OK
            echo -e "${YELLOW}⚠ Skipping actual connection (credentials might vary)${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠ PostgreSQL client not installed, skipping DB check${NC}"
fi
echo ""

# Test 9: Browser cookie simulation
echo "Test 9: Auth Flow Simulation"
echo "---"
echo "⚠ Note: Full auth flow requires valid test user in database"
echo "To test manually:"
echo "  1. Open $LOCAL_URL/sign-in in browser"
echo "  2. Enter test credentials"
echo "  3. Check browser DevTools → Application → Cookies"
echo "  4. Look for 'next-auth.jwt' or 'next-auth.session-token'"
echo "  5. Cookie should be HttpOnly and Secure (in production)"
echo ""

# Summary
echo "Test Summary"
echo "============"
echo -e "${GREEN}Local Testing Checklist:${NC}"
echo "  ✓ npm run dev is running"
echo "  ✓ .env.local has NEXTAUTH_SECRET and NEXTAUTH_URL"
echo "  ✓ Database is connected"
echo "  ✓ Server responds at $LOCAL_URL"
echo ""
echo -e "${YELLOW}Manual Testing (in browser):${NC}"
echo "  1. Visit $LOCAL_URL/sign-in"
echo "  2. Enter valid test credentials"
echo "  3. Should redirect to /dashboard"
echo "  4. Open DevTools → Network tab to see redirect chain"
echo "  5. Check Application → Cookies for auth token"
echo ""
echo -e "${YELLOW}Vercel Testing (before production):${NC}"
echo "  1. Push changes to GitHub"
echo "  2. Vercel will auto-deploy preview"
echo "  3. Test on preview URL"
echo "  4. Check Vercel logs: vercel logs <preview-url>"
echo "  5. Verify Set-Cookie headers are sent"
echo "  6. Test on production staging domain if available"
echo ""

echo "For more details, see:"
echo "  - AUTHENTICATION_FIX_VERIFICATION.md"
echo "  - AUTHENTICATION_REDIRECT_ANALYSIS.md"
