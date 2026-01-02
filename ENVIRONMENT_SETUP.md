# Environment Setup Guide

## Quick Start - Switching Environments

### Switch to TEST mode (for development):
```bash
./switch-env.sh test
npm run dev
```

### Switch to PRODUCTION mode (for deployment):
```bash
./switch-env.sh production
npm run build
```

### Check current environment:
```bash
./switch-env.sh status
```

---

## Environment Files Explained

### `.env.test` - Development/Testing
- **Use for**: Local development and testing
- **Stripe Mode**: TEST (no real charges)
- **Test Cards**: 4242 4242 4242 4242
- **URL**: http://localhost:3000

### `.env.production` - Live/Production
- **Use for**: Production deployment
- **Stripe Mode**: LIVE (real charges!)
- **URL**: Your production domain
- **Important**: Never test with live keys locally

### `.env.local` - Active Environment
- This is the file Next.js actually uses
- Created by running `./switch-env.sh test` or `./switch-env.sh production`
- **DO NOT** edit this file directly - edit `.env.test` or `.env.production` instead

---

## First-Time Setup

### 1. Set Up TEST Environment

1. **Switch to test mode**:
   ```bash
   ./switch-env.sh test
   ```

2. **Create Stripe Test Products**:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Switch to **Test mode** (toggle in top right)
   - Go to Products → Create new products:
     - **Starter**: $49/month, 14-day trial
     - **Standard**: $99/month, 14-day trial
     - **Premium**: $199/month, no trial
   - Copy the **Price IDs** (price_test_xxx)

3. **Update `.env.test`** with your test price IDs:
   ```bash
   STRIPE_PRICE_STARTER=price_test_xxxxx
   STRIPE_PRICE_STANDARD=price_test_xxxxx
   STRIPE_PRICE_PREMIUM=price_test_xxxxx
   ```

4. **Set up Stripe webhook locally**:
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe

   # Login
   stripe login

   # Forward webhooks to local server
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

5. **Copy webhook secret** from the Stripe CLI output and add to `.env.test`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

6. **Switch to test mode again** to reload the new values:
   ```bash
   ./switch-env.sh test
   ```

7. **Start development server**:
   ```bash
   npm run dev
   ```

### 2. Set Up PRODUCTION Environment

1. **Create Stripe Live Products**:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Switch to **Live mode** (toggle in top right)
   - Go to Products → Create the same 3 products
   - Copy the **Price IDs** (price_xxx - without "test")

2. **Update `.env.production`**:
   - Update `NEXT_PUBLIC_APP_URL` with your production domain
   - Update `STRIPE_PRICE_*` variables with live price IDs
   - Update `STRIPE_WEBHOOK_SECRET` (see step 3)

3. **Deploy your app** (Vercel/Netlify/etc.)

4. **Create production webhook**:
   - Go to Stripe Dashboard → Webhooks (in LIVE mode)
   - Click "Add endpoint"
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the webhook signing secret

5. **Update your hosting environment variables** with all values from `.env.production`

---

## Common Tasks

### Testing Payment Flow Locally
```bash
./switch-env.sh test
npm run dev

# In another terminal:
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Use test card: 4242 4242 4242 4242
```

### Preparing for Production
```bash
# Switch to production mode
./switch-env.sh production

# Test build
npm run build

# If build succeeds, deploy
```

### Checking Current Mode
```bash
./switch-env.sh status
```

---

## Important Notes

### ⚠️ Security
- **NEVER** commit `.env.local` to git (it's in .gitignore)
- `.env.test` and `.env.production` are safe to commit (keys are meant to be shared)
- **NEVER** test with live Stripe keys locally
- Live keys start with `pk_live_` and `sk_live_`
- Test keys start with `pk_test_` and `sk_test_`

### 🔄 When to Switch Environments

**Use TEST mode when**:
- Developing new features locally
- Testing payment flow
- Debugging issues
- Running automated tests

**Use PRODUCTION mode when**:
- Building for deployment
- Deploying to production
- Testing production build locally (rare)

### 💡 Tips

1. **Always check your environment** before testing payments:
   ```bash
   ./switch-env.sh status
   ```

2. **If unsure**, use TEST mode - it's safer!

3. **Stripe CLI** is required for local webhook testing

4. **Never mix environments** - if you switch, restart your dev server

---

## Troubleshooting

### "localhost:3000 can't be reached"
- Make sure you ran `npm run dev`
- Check if another app is using port 3000

### "Stripe webhook not working"
- Make sure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Check that webhook secret in `.env.local` matches Stripe CLI output

### "Payment not working"
- Check environment: `./switch-env.sh status`
- In TEST mode: Use card 4242 4242 4242 4242
- In LIVE mode: Use real credit card

### "Environment didn't change"
- Run: `./switch-env.sh test` (or production)
- Restart dev server: Stop and run `npm run dev` again

---

## File Structure

```
.env.test         - Test environment config
.env.production   - Production environment config
.env.local        - Active environment (auto-generated, do not edit)
switch-env.sh     - Environment switcher script
```
