#!/bin/bash

# Environment Switcher for VoyagrIQ
# Usage: ./switch-env.sh [test|production]

if [ "$1" = "test" ]; then
    echo "🔧 Switching to TEST environment..."
    cp .env.test .env.local
    echo "✅ Environment switched to TEST"
    echo ""
    echo "📝 Test Mode Features:"
    echo "  - Uses Stripe TEST keys (no real charges)"
    echo "  - Test cards: 4242 4242 4242 4242"
    echo "  - Localhost URL: http://localhost:3000"
    echo "  - Dev tools enabled"
    echo ""
    echo "⚠️  Remember to:"
    echo "  1. Create test products in Stripe Dashboard (TEST mode)"
    echo "  2. Update STRIPE_PRICE_* variables in .env.test"
    echo "  3. Run: stripe listen --forward-to localhost:3000/api/webhooks/stripe"
    echo "  4. Copy webhook secret to .env.test"
    echo ""
elif [ "$1" = "production" ]; then
    echo "🚀 Switching to PRODUCTION environment..."
    cp .env.production .env.local
    echo "✅ Environment switched to PRODUCTION"
    echo ""
    echo "📝 Production Mode Features:"
    echo "  - Uses Stripe LIVE keys (REAL CHARGES!)"
    echo "  - Production URL: Update in .env.production"
    echo "  - Analytics enabled"
    echo "  - Dev tools disabled"
    echo ""
    echo "⚠️  CRITICAL - Before deploying:"
    echo "  1. Update NEXT_PUBLIC_APP_URL with your domain"
    echo "  2. Create webhook in Stripe Dashboard (LIVE mode)"
    echo "  3. Update STRIPE_WEBHOOK_SECRET in .env.production"
    echo "  4. Deploy to Vercel/Netlify"
    echo ""
elif [ "$1" = "status" ]; then
    echo "📊 Current Environment Status:"
    echo ""
    if grep -q "pk_test_" .env.local 2>/dev/null; then
        echo "  Environment: TEST ✓"
        echo "  Stripe Mode: Test (safe for development)"
    elif grep -q "pk_live_" .env.local 2>/dev/null; then
        echo "  Environment: PRODUCTION ⚠️"
        echo "  Stripe Mode: Live (real charges!)"
    else
        echo "  Environment: Unknown"
        echo "  Status: .env.local not found or invalid"
    fi
    echo ""
    if [ -f .env.local ]; then
        echo "  NODE_ENV: $(grep NODE_ENV .env.local | cut -d'=' -f2)"
        echo "  APP_URL: $(grep NEXT_PUBLIC_APP_URL .env.local | cut -d'=' -f2)"
        echo ""
    fi
else
    echo "Usage: ./switch-env.sh [test|production|status]"
    echo ""
    echo "Commands:"
    echo "  test        - Switch to TEST environment (development)"
    echo "  production  - Switch to PRODUCTION environment (live)"
    echo "  status      - Check current environment"
    echo ""
    echo "Examples:"
    echo "  ./switch-env.sh test       # Start developing"
    echo "  ./switch-env.sh production # Deploy to production"
    echo "  ./switch-env.sh status     # Check current mode"
fi
