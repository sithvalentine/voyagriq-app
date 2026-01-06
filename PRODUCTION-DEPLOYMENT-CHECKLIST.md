# Production Deployment Checklist

**CRITICAL**: Complete ALL items before deploying to production.

---

## 🚨 BLOCKER: Stripe Live Mode Setup (Required)

Before production deployment, you MUST configure Stripe in LIVE mode:

### Step 1: Create Live Mode Products

Go to Stripe Dashboard → **LIVE MODE** (toggle in top-left) → Products

Create 6 products (3 monthly + 3 annual):

#### Monthly Plans:
1. **VoyagrIQ Starter - Monthly**
   - Price: $49/month
   - Billing: Recurring monthly
   - Copy the Price ID → Will be your `STRIPE_PRICE_STARTER`

2. **VoyagrIQ Standard - Monthly**
   - Price: $99/month
   - Billing: Recurring monthly
   - Copy the Price ID → Will be your `STRIPE_PRICE_STANDARD`

3. **VoyagrIQ Premium - Monthly**
   - Price: $199/month
   - Billing: Recurring monthly
   - Copy the Price ID → Will be your `STRIPE_PRICE_PREMIUM`

#### Annual Plans:
4. **VoyagrIQ Starter - Annual**
   - Price: $588/year (2 months free)
   - Billing: Recurring yearly
   - Copy the Price ID → Will be your `STRIPE_PRICE_STARTER_ANNUAL`

5. **VoyagrIQ Standard - Annual**
   - Price: $1,188/year (2 months free)
   - Billing: Recurring yearly
   - Copy the Price ID → Will be your `STRIPE_PRICE_STANDARD_ANNUAL`

6. **VoyagrIQ Premium - Annual**
   - Price: $2,388/year (2 months free)
   - Billing: Recurring yearly
   - Copy the Price ID → Will be your `STRIPE_PRICE_PREMIUM_ANNUAL`

### Step 2: Get Live Mode API Keys

Go to Stripe Dashboard → **LIVE MODE** → Developers → API Keys

Copy these keys:
- **Publishable key**: `pk_live_...`
- **Secret key**: `sk_live_...` (⚠️ NEVER commit to git!)

### Step 3: Configure Live Webhook

Go to Stripe Dashboard → **LIVE MODE** → Webhooks → Add endpoint

1. **Endpoint URL**: `https://YOUR-PRODUCTION-DOMAIN.com/api/webhooks/stripe`
2. **Events to send**:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_failed`
   - ✅ `invoice.payment_succeeded`
3. Click "Add endpoint"
4. Copy the **Signing secret**: `whsec_...`

### Step 4: Update Vercel Production Environment Variables

Go to: https://vercel.com/james-burns-projects-286e4ef4/voyagriq-app/settings/environment-variables

**Set these for PRODUCTION environment ONLY:**

```bash
# Stripe LIVE Mode Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXX
STRIPE_SECRET_KEY=sk_live_XXXXXXXXXXXXX

# Stripe LIVE Mode Price IDs - Monthly
STRIPE_PRICE_STARTER=price_XXXXXXXXXXXXX
STRIPE_PRICE_STANDARD=price_XXXXXXXXXXXXX
STRIPE_PRICE_PREMIUM=price_XXXXXXXXXXXXX

# Stripe LIVE Mode Price IDs - Annual
STRIPE_PRICE_STARTER_ANNUAL=price_XXXXXXXXXXXXX
STRIPE_PRICE_STANDARD_ANNUAL=price_XXXXXXXXXXXXX
STRIPE_PRICE_PREMIUM_ANNUAL=price_XXXXXXXXXXXXX

# Stripe LIVE Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXX

# Production URL
NEXT_PUBLIC_APP_URL=https://YOUR-PRODUCTION-DOMAIN.com
```

⚠️ **CRITICAL**: Make sure these are set ONLY for **Production** environment, NOT Preview!

---

## ✅ Pre-Deployment Verification

### Security Checklist
- [x] Debug endpoint deleted (`app/api/check-env/route.ts`)
- [x] `.env.local` in `.gitignore`
- [x] `.env.local` NOT committed to git
- [ ] Supabase service role key secured (only in Vercel env vars)
- [ ] All Stripe keys are LIVE mode (start with `pk_live_` and `sk_live_`)
- [ ] RLS policies tested and working
- [ ] Middleware protecting all sensitive routes

### Functionality Checklist
- [ ] Test payment with real card on staging (test mode)
- [ ] Verify webhook receives events
- [ ] Test all 3 tiers (Starter, Standard, Premium)
- [ ] Test monthly and annual billing
- [ ] Test PDF export for all tiers
- [ ] Test trip CRUD operations
- [ ] Verify email confirmation works
- [ ] Test password reset flow

### Environment Variables Checklist
Verify these are set in Vercel **PRODUCTION** environment:

**Supabase** (same for test and prod):
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

**Stripe LIVE Mode**:
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with `pk_live_`)
- [ ] `STRIPE_SECRET_KEY` (starts with `sk_live_`)
- [ ] `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)
- [ ] `STRIPE_PRICE_STARTER`
- [ ] `STRIPE_PRICE_STANDARD`
- [ ] `STRIPE_PRICE_PREMIUM`
- [ ] `STRIPE_PRICE_STARTER_ANNUAL`
- [ ] `STRIPE_PRICE_STANDARD_ANNUAL`
- [ ] `STRIPE_PRICE_PREMIUM_ANNUAL`

**App Config**:
- [ ] `NEXT_PUBLIC_APP_URL` (production domain)
- [ ] `NODE_ENV=production`

---

## 🚀 Deployment Steps

### 1. Final Code Review
```bash
# Check for console.logs that might leak sensitive data
grep -r "console.log.*userId\|console.log.*customer" app/ lib/

# Check for TODO comments
grep -r "TODO\|FIXME" app/ lib/ components/

# Verify build passes
npm run build
```

### 2. Deploy to Production
```bash
# Make sure you're on main branch
git checkout main

# Pull latest
git pull origin main

# Push to trigger production deployment
git push origin main
```

### 3. Monitor Deployment
1. Watch Vercel deployment logs
2. Check for any build errors
3. Verify environment variables loaded correctly

### 4. Post-Deployment Testing (CRITICAL!)

#### Test with Real Payment
1. Go to production site
2. Register with real email
3. Select a plan
4. Use a REAL credit card (will be charged!)
5. Complete checkout
6. Verify:
   - ✅ Subscription activates
   - ✅ Webhook processes correctly
   - ✅ Can access protected pages
   - ✅ Tier features work correctly

#### Test Webhook Delivery
1. Go to Stripe Dashboard → LIVE MODE → Webhooks
2. Click your webhook endpoint
3. Check "Recent events"
4. Verify events are being delivered successfully (200 status)

#### Monitor for Errors
1. Check Vercel logs: https://vercel.com/.../logs
2. Check Stripe webhook logs
3. Check Supabase logs
4. Look for any 500 errors or exceptions

---

## 🔄 Rollback Plan

If something goes wrong:

### Quick Rollback (Vercel)
1. Go to Vercel Dashboard → Deployments
2. Find last known good deployment
3. Click "..." → "Redeploy"
4. Select "Redeploy with existing build"

### Emergency: Revert to Previous Version
```bash
# Find last good commit
git log --oneline

# Revert to that commit
git reset --hard <commit-hash>

# Force push (⚠️ use with caution)
git push origin main --force
```

### Stripe Rollback
If you need to switch back to test mode temporarily:
1. Update Vercel env vars back to test keys
2. Redeploy
3. Payments will go to test mode (no real charges)

---

## 📊 Post-Launch Monitoring (First 48 Hours)

### Every Hour:
- [ ] Check Vercel logs for errors
- [ ] Check Stripe webhook delivery status
- [ ] Monitor failed payment rate
- [ ] Check user registration success rate

### Every 4 Hours:
- [ ] Review database performance
- [ ] Check API response times
- [ ] Monitor server resource usage
- [ ] Review user feedback/support tickets

### Every 24 Hours:
- [ ] Analyze conversion funnel
- [ ] Review payment success metrics
- [ ] Check for any security incidents
- [ ] Plan optimizations based on real data

---

## 🆘 Emergency Contacts

- **Stripe Support**: https://support.stripe.com (Live chat available)
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support

---

## ✅ Sign-Off

Before deploying to production, confirm:

- [ ] I have created all 6 Stripe LIVE mode products
- [ ] I have updated Vercel production env vars with LIVE keys
- [ ] I have configured the LIVE webhook endpoint
- [ ] I have tested the payment flow on staging
- [ ] I understand the rollback procedure
- [ ] I am ready to monitor the deployment

**Deployed By**: ________________
**Date**: ________________
**Time**: ________________
**Production URL**: ________________

---

## 📝 Notes

Use this section to document any issues encountered or deviations from the checklist:

---

**Last Updated**: January 6, 2026
**Version**: 1.0
