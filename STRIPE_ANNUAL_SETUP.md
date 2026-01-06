# Stripe Annual Pricing Setup Guide

This guide walks you through setting up annual pricing in Stripe for both TEST (development) and LIVE (production) environments.

## Overview

Your app now supports two billing intervals:
- **Monthly**: Regular monthly billing ($49, $99, $199/month)
  - Starter & Standard: Include 14-day free trial
  - Premium: No free trial
- **Annual**: Pay for 12 months, get 14 months of service (2 months free!)
  - Starter: $588/year ($42/month effective) - **NO free trial**
  - Standard: $1,188/year ($84/month effective) - **NO free trial**
  - Premium: $2,388/year ($170/month effective) - No free trial

## Phase 1: Test Mode Setup (Development) ✅

**You've already done this!** Your dev environment (trip-cost-insights) has these test price IDs configured:

```bash
# Dev Environment (.env.local) - TEST MODE
STRIPE_PRICE_STARTER=price_1Sm2iUCmKbjtfkiOz7XfTd0w
STRIPE_PRICE_STANDARD=price_1Sm2iVCmKbjtfkiOe2DTkKsg
STRIPE_PRICE_PREMIUM=price_1Sm2iWCmKbjtfkiOqlN0mxZA

STRIPE_PRICE_STARTER_ANNUAL=price_1Sm2iUCmKbjtfkiOOoFqDwKA
STRIPE_PRICE_STANDARD_ANNUAL=price_1Sm2iVCmKbjtfkiOgbQMvA0i
STRIPE_PRICE_PREMIUM_ANNUAL=price_1Sm2iWCmKbjtfkiOxejT0ihi
```

These are TEST price IDs that work with test credit cards (4242 4242 4242 4242).

---

## Phase 2: Production Setup (Live Mode) - DO THIS NOW

### Step 1: Switch Stripe Dashboard to Live Mode

1. Go to https://dashboard.stripe.com
2. In the top left corner, **toggle from "Test mode" to "Live mode"**
3. You should see "Viewing live data" indicator

### Step 2: Create Live Products & Prices (OPTION A - Manual)

**Create each product manually in Stripe Dashboard:**

#### Starter Tier
1. Go to Products → Create product
2. **Product Details:**
   - Name: `VoyagrIQ Starter`
   - Description: `25 trips per month, perfect for solo advisors`
3. **Monthly Price:**
   - Click "Add another price"
   - Price: `$49.00 USD`
   - Billing period: `Monthly`
   - Free trial: `14 days`
   - Click "Save"
   - **Copy the Price ID** (starts with `price_`)
4. **Annual Price:**
   - Click "Add another price" again
   - Price: `$588.00 USD` (49 × 12)
   - Billing period: `Yearly`
   - Free trial: **NONE** (leave blank)
   - Click "Save"
   - **Copy the Price ID** (starts with `price_`)

#### Standard Tier
1. Create product: `VoyagrIQ Standard`
2. Description: `50 trips per month, ideal for growing teams`
3. **Monthly Price:** `$99.00` with 14-day trial → Copy Price ID
4. **Annual Price:** `$1,188.00` (99 × 12) with **NO trial** → Copy Price ID

#### Premium Tier
1. Create product: `VoyagrIQ Premium`
2. Description: `100 trips per month, white-label reports, API access`
3. **Monthly Price:** `$199.00` → **No free trial** → Copy Price ID
4. **Annual Price:** `$2,388.00` (199 × 12) → **No free trial** → Copy Price ID

### Step 2: Create Live Products & Prices (OPTION B - Script - RECOMMENDED)

**Use the automated script (faster and less error-prone):**

1. Make sure you have your **LIVE Stripe secret key**:
   - Go to Stripe Dashboard → Developers → API keys (in LIVE mode)
   - Copy the "Secret key" (starts with `sk_live_`)

2. **Temporarily** add it to your dev `.env.local`:
   ```bash
   # TEMPORARILY use LIVE key to create products
   STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
   ```

3. Run the setup script:
   ```bash
   cd "/Users/james/claude/Travel Reporting/trip-cost-insights"
   npx ts-node scripts/setup-stripe-products.ts
   ```

4. The script will output your LIVE price IDs:
   ```
   📝 Add these to your .env.local file:

   # Monthly prices
   STRIPE_PRICE_STARTER=price_xxxxxxxxxxxxx
   STRIPE_PRICE_STANDARD=price_xxxxxxxxxxxxx
   STRIPE_PRICE_PREMIUM=price_xxxxxxxxxxxxx

   # Annual prices (Pay 12 months, get 14)
   STRIPE_PRICE_STARTER_ANNUAL=price_xxxxxxxxxxxxx
   STRIPE_PRICE_STANDARD_ANNUAL=price_xxxxxxxxxxxxx
   STRIPE_PRICE_PREMIUM_ANNUAL=price_xxxxxxxxxxxxx
   ```

5. **Copy these price IDs** - you'll need them for production!

6. **IMPORTANT:** Change your dev `.env.local` back to TEST mode:
   ```bash
   # Change back to TEST key (use your actual test key)
   STRIPE_SECRET_KEY=sk_test_[your_test_key_here]
   ```

---

## Phase 3: Configure Production Environment

### Where to Add LIVE Price IDs

You need to add these to **Vercel** (or wherever your production app is deployed):

#### Option A: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project (e.g., `voyagriq-app` or whatever it's called)
3. Go to **Settings** → **Environment Variables**
4. Add these variables for **Production** environment:

```bash
# Stripe LIVE Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY

# Monthly Price IDs (LIVE)
STRIPE_PRICE_STARTER=price_xxxxxxxxxxxxx
STRIPE_PRICE_STANDARD=price_xxxxxxxxxxxxx
STRIPE_PRICE_PREMIUM=price_xxxxxxxxxxxxx

# Annual Price IDs (LIVE) - ADD THESE NEW ONES
STRIPE_PRICE_STARTER_ANNUAL=price_xxxxxxxxxxxxx
STRIPE_PRICE_STANDARD_ANNUAL=price_xxxxxxxxxxxxx
STRIPE_PRICE_PREMIUM_ANNUAL=price_xxxxxxxxxxxxx

# Webhook Secret (LIVE)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET
```

5. Make sure each variable is set for **Production** environment only
6. Click **Save**

#### Option B: Vercel CLI

```bash
# Set each variable via CLI
vercel env add STRIPE_PRICE_STARTER_ANNUAL production
# Enter the value when prompted: price_xxxxxxxxxxxxx

vercel env add STRIPE_PRICE_STANDARD_ANNUAL production
# Enter the value when prompted: price_xxxxxxxxxxxxx

vercel env add STRIPE_PRICE_PREMIUM_ANNUAL production
# Enter the value when prompted: price_xxxxxxxxxxxxx
```

---

## Phase 4: Update Production Code

### Step 1: Copy Dev Changes to Production

You need to copy the updated files from dev to production:

```bash
# Copy pricing page changes
cp "/Users/james/claude/Travel Reporting/trip-cost-insights/app/pricing/page.tsx" \
   "/Users/james/claude/app/pricing/page.tsx"

# Copy registration page changes
cp "/Users/james/claude/Travel Reporting/trip-cost-insights/app/register/page.tsx" \
   "/Users/james/claude/app/register/page.tsx"

# Copy API route changes
cp "/Users/james/claude/Travel Reporting/trip-cost-insights/app/api/stripe/create-checkout/route.ts" \
   "/Users/james/claude/app/api/stripe/create-checkout/route.ts"

# Copy stripe lib changes
cp "/Users/james/claude/Travel Reporting/trip-cost-insights/lib/stripe.ts" \
   "/Users/james/claude/lib/stripe.ts"

# Update .env.local.example for documentation
cp "/Users/james/claude/Travel Reporting/trip-cost-insights/.env.local.example" \
   "/Users/james/claude/.env.local.example"
```

### Step 2: Commit and Push to Production

```bash
cd "/Users/james/claude"

# Check what files changed
git status

# Add all changed files
git add app/pricing/page.tsx
git add app/register/page.tsx
git add app/api/stripe/create-checkout/route.ts
git add lib/stripe.ts
git add .env.local.example

# Commit with descriptive message
git commit -m "Add annual billing support with 2 months free discount

- Update pricing page to show monthly/annual toggle
- Display discounted monthly rate for annual plans ($42, $84, $170)
- Pass billing interval to registration and checkout
- Add annual price IDs to Stripe integration
- Update environment variable examples"

# Push to main branch (triggers Vercel deployment)
git push origin main
```

---

## Phase 5: Set Up Webhook (Production)

Your production app needs to receive webhook events from Stripe when payments succeed.

### Configure Webhook in Stripe Dashboard

1. Go to https://dashboard.stripe.com (LIVE mode)
2. Go to **Developers** → **Webhooks**
3. Click **Add endpoint**
4. **Endpoint URL:** `https://your-production-domain.com/api/webhooks/stripe`
   - Example: `https://voyagriq.com/api/webhooks/stripe`
5. **Events to listen to:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
6. Click **Add endpoint**
7. **Copy the Signing Secret** (starts with `whsec_`)
8. Add it to Vercel environment variables:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET
   ```

---

## Phase 6: Testing Production (CRITICAL!)

### Test with Stripe Test Cards (in LIVE mode Dashboard)

Even in live mode, you can test without real charges:

1. Go to Stripe Dashboard → **Developers** → **Test in live mode**
2. Use test card: **4242 4242 4242 4242**
3. Any future date, any CVC

### Test Flow:

1. Go to your production pricing page: `https://your-domain.com/pricing`
2. Toggle between Monthly and Annual
3. Verify prices change correctly:
   - Monthly: $49, $99, $199
   - Annual: $42, $84, $170
4. Click "Get Started" on Annual plan
5. Register → Should show "$42/month" with "Billed $588 annually"
6. Complete Stripe checkout with test card
7. Verify:
   - Account created in Supabase
   - Subscription created in Stripe
   - User can log in and access dashboard

---

## Verification Checklist

### Dev Environment (Test Mode) ✅
- [ ] Monthly prices work ($49, $99, $199)
- [ ] Annual toggle shows discounted prices ($42, $84, $170)
- [ ] Registration page reflects correct price
- [ ] Checkout works with test card 4242 4242 4242 4242
- [ ] Webhook receives events

### Production Environment (Live Mode)
- [ ] LIVE Stripe keys configured in Vercel
- [ ] All 6 price IDs added (3 monthly + 3 annual)
- [ ] Code pushed to production
- [ ] Vercel deployment successful
- [ ] Webhook endpoint configured
- [ ] Monthly billing works in production
- [ ] Annual billing works in production
- [ ] Registration shows correct prices
- [ ] Test transaction completes successfully

---

## Price ID Reference

### Test Mode (Dev)
```bash
# Monthly
STRIPE_PRICE_STARTER=price_1Sm2iUCmKbjtfkiOz7XfTd0w
STRIPE_PRICE_STANDARD=price_1Sm2iVCmKbjtfkiOe2DTkKsg
STRIPE_PRICE_PREMIUM=price_1Sm2iWCmKbjtfkiOqlN0mxZA

# Annual
STRIPE_PRICE_STARTER_ANNUAL=price_1Sm2iUCmKbjtfkiOOoFqDwKA
STRIPE_PRICE_STANDARD_ANNUAL=price_1Sm2iVCmKbjtfkiOgbQMvA0i
STRIPE_PRICE_PREMIUM_ANNUAL=price_1Sm2iWCmKbjtfkiOxejT0ihi
```

### Live Mode (Production)
```bash
# You'll get these after running the script in Step 2
# They will start with price_ but have different IDs than test mode
```

---

## Troubleshooting

### "Price ID not configured" error
- Check that all 6 price IDs are set in Vercel environment variables
- Redeploy after adding new variables

### Webhook not receiving events
- Verify webhook URL matches your production domain
- Check webhook signing secret is correct
- Look at Stripe Dashboard → Webhooks → Recent deliveries for errors

### Annual price showing wrong amount
- Clear browser cache
- Check that you're using the correct formula: `Math.round(price * 12 / 14)`
- Verify the Stripe price is set to yearly interval

---

## Support

- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Documentation: https://stripe.com/docs
- Vercel Dashboard: https://vercel.com/dashboard
