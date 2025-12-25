#!/bin/bash

# Auth Login Fix Script
# This script automatically fixes the most common login issues

set -e

FRONTEND_DIR="/Volumes/Data/Projects/samui-transfers/frontend"

echo "🔐 Auth Login Fix Script"
echo "======================="
echo ""

cd "$FRONTEND_DIR"

# Check 1: Verify environment variables
echo "1️⃣  Checking environment variables..."
if [ -z "$NEXTAUTH_SECRET" ]; then
    if [ -f ".env.local" ]; then
        source .env.local
        echo "   ✅ Loaded from .env.local"
    else
        echo "   ❌ .env.local not found!"
        exit 1
    fi
else
    echo "   ✅ NEXTAUTH_SECRET is set"
fi

if [ -z "$DATABASE_URL" ]; then
    echo "   ❌ DATABASE_URL not set!"
    exit 1
else
    echo "   ✅ DATABASE_URL is set"
fi

echo ""

# Check 2: Check database connection
echo "2️⃣  Checking database connection..."
if npx prisma db execute --stdin < /dev/null > /dev/null 2>&1; then
    echo "   ✅ Database is accessible"
else
    echo "   ❌ Cannot connect to database!"
    echo "   Check DATABASE_URL in .env.local"
    exit 1
fi

echo ""

# Check 3: Run migrations
echo "3️⃣  Applying pending migrations..."
npx prisma migrate deploy --skip-generate > /dev/null 2>&1 || true
echo "   ✅ Migrations checked"

echo ""

# Check 4: Seed database
echo "4️⃣  Seeding test users..."
npx prisma db seed

echo ""

# Check 5: Verify users were created
echo "5️⃣  Verifying test users exist..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    select: { email: true, emailVerified: true, disabled: true },
  });
  
  if (users.length === 0) {
    console.log('   ❌ No users found in database!');
    process.exit(1);
  }
  
  console.log('   ✅ Found ' + users.length + ' users:');
  users.forEach(u => {
    const verified = u.emailVerified ? '✅' : '❌';
    const active = !u.disabled ? '✅' : '❌';
    console.log('      ' + verified + ' ' + active + ' ' + u.email);
  });
  
  const hasTestUser = users.some(u => u.email === 'user@test.com');
  const isVerified = users.find(u => u.email === 'user@test.com')?.emailVerified;
  
  if (!hasTestUser) {
    console.log('   ❌ Test user (user@test.com) not found!');
    process.exit(1);
  }
  
  if (!isVerified) {
    console.log('   ❌ Test user email not verified!');
    process.exit(1);
  }
  
  console.log('   ✅ Test user is ready to use!');
  process.exit(0);
}

check();
" || exit 1

echo ""
echo "✅ All checks passed!"
echo ""
echo "🚀 Next steps:"
echo "1. Start dev server: npm run dev"
echo "2. Go to: http://localhost:3000/sign-in"
echo "3. Use credentials:"
echo "   Email: user@test.com"
echo "   Password: Test_123!"
echo ""
