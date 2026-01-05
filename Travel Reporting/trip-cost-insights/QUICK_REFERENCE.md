# VoyagrIQ - Quick Reference

## 🚀 Starting Development

```bash
# 1. Switch to test environment
./switch-env.sh test

# 2. Start the server
npm run dev

# 3. Start Stripe webhook listener (in another terminal)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 4. Visit http://localhost:3000
```

## 🔄 Environment Switching

```bash
# Switch to TEST (development)
./switch-env.sh test
npm run dev

# Switch to PRODUCTION (deployment)
./switch-env.sh production
npm run build

# Check current environment
./switch-env.sh status
```

## 💳 Test Credit Cards (Stripe Test Mode)

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success ✅ |
| 4000 0000 0000 9995 | Declined ❌ |

**CVC**: Any 3 digits | **Expiry**: Any future date | **ZIP**: Any 5 digits

## 🎯 Subscription Tiers

| Tier | Price | Trips | Users | Trial |
|------|-------|-------|-------|-------|
| Starter | $49/mo | 25 | 1 | 14 days |
| Standard | $99/mo | 50 | 10 | 14 days |
| Premium | $199/mo | 100 | 20 | None |

## 📝 Important Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production

# Environment
./switch-env.sh test     # Switch to test mode
./switch-env.sh production # Switch to production mode
./switch-env.sh status   # Check current environment

# Stripe Testing
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 🔧 Dev Mode (Skip Payment Checks)

**Enable Dev Mode**: Visit http://localhost:3000/enable-dev-mode

**Disable Dev Mode**: Visit http://localhost:3000/disable-dev-mode

**What it does**: Bypasses Stripe payment checks so you can test the app without completing payment. Only works in development environment.

**When to use**:
- Testing features without creating test payments
- Working on UI/UX without payment flow
- Quick development iteration

**Manual method**:
```javascript
// In browser console (F12)
localStorage.setItem('voyagriq-dev-mode', 'true');
document.cookie = 'voyagriq-dev-mode=true; path=/; max-age=31536000';
```

## 📞 Support

**Documentation**: See `ENVIRONMENT_SETUP.md` for detailed guide
