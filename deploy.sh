#!/bin/bash
# ============================================
# Founders & Footsteps — One-Command Deploy
# ============================================
# Usage: 
#   DATABASE_URL="postgresql://..." bash deploy.sh
# ============================================

set -e

echo "🏗️  Founders & Footsteps — Deployment"
echo "======================================"

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set!"
  echo ""
  echo "Get it from: https://console.neon.tech → Connection Details"
  echo "Then run:"
  echo '  DATABASE_URL="postgresql://..." bash deploy.sh'
  exit 1
fi

echo "✅ DATABASE_URL is set"

# Push schema to Neon
echo ""
echo "📊 Pushing database schema to Neon..."
npx drizzle-kit push

echo ""
echo "✅ Database schema applied!"

# Deploy to Vercel
echo ""
echo "🚀 Deploying to Vercel..."
echo "   (Make sure you're logged in: vercel login)"

# Set env vars and deploy
vercel env add DATABASE_URL production <<< "$DATABASE_URL" 2>/dev/null || true
vercel env add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY production <<< "pk_test_replace_me" 2>/dev/null || true
vercel env add PAYSTACK_SECRET_KEY production <<< "sk_test_replace_me" 2>/dev/null || true

vercel deploy --prod

echo ""
echo "============================================"
echo "🎉 DEPLOYED SUCCESSFULLY!"
echo "============================================"
echo ""
echo "Admin login:"
echo "  Email:    admin@yourdomain.com"
echo "  Password: your-admin-password"
echo ""
