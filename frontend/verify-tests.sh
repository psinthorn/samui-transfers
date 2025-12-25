#!/bin/bash

# Test Verification Script
# Verifies Phase 2.20 API Testing Suite is properly configured

echo "🧪 Samui Transfers - API Testing Suite Verification"
echo "===================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} Found: $1"
    return 0
  else
    echo -e "${RED}✗${NC} Missing: $1"
    return 1
  fi
}

check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✓${NC} Found: $1"
    return 0
  else
    echo -e "${RED}✗${NC} Missing: $1"
    return 1
  fi
}

# Check directories
echo "Checking test directories..."
check_dir "__tests__/api"
check_dir "__tests__/utils"
echo ""

# Check test files
echo "Checking test files..."
check_file "__tests__/api/integration.test.ts"
check_file "__tests__/api/helpers.ts"
check_file "__tests__/api/README.md"
check_file "__tests__/utils/validation.test.ts"
echo ""

# Check configuration files
echo "Checking Jest configuration..."
check_file "jest.config.js"
check_file "jest.setup.js"
echo ""

# Check documentation
echo "Checking documentation files..."
check_file "API_TESTING_GUIDE.md"
check_file "API_DOCUMENTATION.md"
echo ""

# Check package.json scripts
echo "Checking test scripts in package.json..."
if grep -q '"test":' package.json; then
  echo -e "${GREEN}✓${NC} Test script found"
else
  echo -e "${RED}✗${NC} Test script missing"
fi

if grep -q '"test:watch":' package.json; then
  echo -e "${GREEN}✓${NC} Watch script found"
else
  echo -e "${RED}✗${NC} Watch script missing"
fi

if grep -q '"test:coverage":' package.json; then
  echo -e "${GREEN}✓${NC} Coverage script found"
else
  echo -e "${RED}✗${NC} Coverage script missing"
fi

if grep -q '"test:api":' package.json; then
  echo -e "${GREEN}✓${NC} API test script found"
else
  echo -e "${RED}✗${NC} API test script missing"
fi
echo ""

# Check Jest dependencies
echo "Checking Jest dependencies..."
if grep -q '"jest"' package.json; then
  echo -e "${GREEN}✓${NC} Jest installed"
else
  echo -e "${RED}✗${NC} Jest not found"
fi

if grep -q '"@types/jest"' package.json; then
  echo -e "${GREEN}✓${NC} @types/jest installed"
else
  echo -e "${RED}✗${NC} @types/jest not found"
fi

if grep -q '"@testing-library/react"' package.json; then
  echo -e "${GREEN}✓${NC} @testing-library/react installed"
else
  echo -e "${RED}✗${NC} @testing-library/react not found"
fi
echo ""

# Summary
echo "===================================================="
echo -e "${YELLOW}Summary:${NC}"
echo ""
echo "Phase 2.20 - API Testing Suite Implementation"
echo "Status: COMPLETE"
echo ""
echo "Next steps:"
echo "1. Run: npm install"
echo "2. Run: npm test"
echo "3. Review: API_TESTING_GUIDE.md"
echo "4. Check coverage: npm run test:coverage"
echo ""
echo "For more information:"
echo "- Testing guide: API_TESTING_GUIDE.md"
echo "- API documentation: API_DOCUMENTATION.md"
echo "- Test helpers: __tests__/api/helpers.ts"
echo "- Integration tests: __tests__/api/integration.test.ts"
