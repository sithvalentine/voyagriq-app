# How to Check Vercel Stripe Configuration

**Date**: January 8, 2026

---

## Quick Check: Is Production Using Live or Test Stripe Keys?

### Option 1: Check Vercel Dashboard (Most Reliable)

1. **Go to Vercel Dashboard**:
   - Visit: https://vercel.com
   - Navigate to your VoyagrIQ project
   - Click **Settings** → **Environment Variables**

2. **Look for Stripe Keys**:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   STRIPE_SECRET_KEY
   ```

3. **Identify Mode**:
   - **Test Mode**: Keys start with `pk_test_` or `sk_test_`
   - **Live Mode**: Keys start with `pk_live_` or `sk_live_`

### Option 2: Check Deployment Logs

1. **Go to your latest deployment**:
   - https://vercel.com/your-account/voyagriq-app/deployments
   - Click on the latest production deployment

2. **Check build logs**:
   - Look for `[stripe] Loaded price IDs:` output
   - This shows which price IDs are being used
   - Test prices typically start with `price_1Sl...` (from test mode)
   - Live prices would have different IDs

### Option 3: Test Checkout Flow

1. **Visit**: https://voyagriq.com/pricing
2. **Click** "Start Free Trial" on any plan
3. **Check URL** when redirected to Stripe:
   - Test mode: URL includes `test.` subdomain
   - Live mode: Regular Stripe checkout URL

### Option 4: Check JavaScript Console

1. **Visit**: https://voyagriq.com
2. **Open browser DevTools** (F12 or Cmd+Option+I)
3. **Go to Console tab**
4. **Look for Stripe-related logs**
5. Some Stripe API calls may reveal test vs live mode

---

## What You're Looking For

### ✅ If Production is Using LIVE Keys:

You'll see:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

**Status**: ✅ **Ready for real payments**

### ⚠️ If Production is Using TEST Keys:

You'll see:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**Status**: ⚠️ **Only test payments, need to switch to live**

---

## Expected Configuration

### For PRODUCTION (voyagriq.com):

```bash
# Stripe API Keys (SHOULD BE LIVE)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXXX...
STRIPE_SECRET_KEY=sk_live_XXXX...

# Stripe Price IDs (SHOULD BE LIVE)
STRIPE_PRICE_STARTER=price_LIVE_starter_monthly
STRIPE_PRICE_STANDARD=price_LIVE_standard_monthly
STRIPE_PRICE_PREMIUM=price_LIVE_premium_monthly
STRIPE_PRICE_STARTER_ANNUAL=price_LIVE_starter_annual
STRIPE_PRICE_STANDARD_ANNUAL=price_LIVE_standard_annual
STRIPE_PRICE_PREMIUM_ANNUAL=price_LIVE_premium_annual

# Webhook Secret (PRODUCTION)
STRIPE_WEBHOOK_SECRET=whsec_XXXX...

# Supabase (PRODUCTION)
NEXT_PUBLIC_SUPABASE_URL=https://ossvcumgkwsjqrpngkhy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### For DEVELOPMENT (localhost):

```bash
# Stripe API Keys (TEST)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SkAa1CmKbjtfkiO...
STRIPE_SECRET_KEY=sk_test_51SkAa1CmKbjtfkiO...

# Stripe Price IDs (TEST)
STRIPE_PRICE_STARTER=price_1SlZMXCmKbjtfkiOSqRZiY3X
STRIPE_PRICE_STANDARD=price_1SlZNVCmKbjtfkiOTcXFr9mZ
STRIPE_PRICE_PREMIUM=price_1SlZOOCmKbjtfkiOiForv6R1
STRIPE_PRICE_STARTER_ANNUAL=price_1Sm2iUCmKbjtfkiOOoFqDwKA
STRIPE_PRICE_STANDARD_ANNUAL=price_1Sm2iVCmKbjtfkiOgbQMvA0i
STRIPE_PRICE_PREMIUM_ANNUAL=price_1Sm2iWCmKbjtfkiOxejT0ihi

# Webhook Secret (DEV)
STRIPE_WEBHOOK_SECRET=whsec_W4dNq1n4aLyUnz3rqAxPqvNLv05TqLy2

# Supabase (DEV)
NEXT_PUBLIC_SUPABASE_URL=https://fzxbxzzhakzbfrspehpe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## How to Switch to Live Mode

If production is currently using test keys:

### Step 1: Get Live Stripe Keys

1. Go to: https://dashboard.stripe.com
2. **Switch to Live Mode** (toggle in top right)
3. Go to: **Developers** → **API keys**
4. Copy:
   - **Publishable key** (pk_live_...)
   - **Secret key** (sk_live_...) - Click "Reveal test key"

### Step 2: Create Live Products

1. In Stripe Dashboard (Live Mode):
2. Go to: **Products** → **Add product**
3. Create 3 products:

**Starter Plan**:
- Name: "Starter"
- Pricing:
  - Monthly: $49.00
  - Annual: $588.00 (2 months free)

**Standard Plan**:
- Name: "Standard"
- Pricing:
  - Monthly: $99.00
  - Annual: $1,188.00 (2 months free)

**Premium Plan**:
- Name: "Premium"
- Pricing:
  - Monthly: $199.00
  - Annual: $2,388.00 (2 months free)

4. **Note the price IDs** for each (6 total)

### Step 3: Create Production Webhook

1. In Stripe Dashboard (Live Mode)
2. Go to: **Developers** → **Webhooks**
3. Click **Add endpoint**
4. **Endpoint URL**: `https://voyagriq.com/api/webhooks/stripe`
5. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **Add endpoint**
7. **Copy the webhook secret** (whsec_...)

### Step 4: Update Vercel Environment Variables

1. Go to: https://vercel.com/your-account/voyagriq-app/settings/environment-variables
2. Find **Production** environment
3. Update the following variables:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_XXXX
STRIPE_SECRET_KEY = sk_live_XXXX
STRIPE_PRICE_STARTER = price_live_starter_monthly
STRIPE_PRICE_STANDARD = price_live_standard_monthly
STRIPE_PRICE_PREMIUM = price_live_premium_monthly
STRIPE_PRICE_STARTER_ANNUAL = price_live_starter_annual
STRIPE_PRICE_STANDARD_ANNUAL = price_live_standard_annual
STRIPE_PRICE_PREMIUM_ANNUAL = price_live_premium_annual
STRIPE_WEBHOOK_SECRET = whsec_live_XXXX
```

4. **Save** all changes
5. **Redeploy** production (Vercel will auto-deploy on next push, or trigger manual deploy)

### Step 5: Test Live Payments

⚠️ **IMPORTANT**: Use a real credit card (not a test card) for this test!

1. Visit: https://voyagriq.com/pricing
2. Click **Start Free Trial**
3. Enter real credit card details
4. Complete checkout
5. Verify:
   - Payment appears in Stripe Dashboard (Live Mode)
   - User account activated in production
   - Subscription shows "active" status

6. **Important**: Cancel the test subscription immediately after testing!

---

## Common Issues

### Issue: Keys are mixed (test publishable, live secret)
**Solution**: Both keys MUST be from the same mode (both test or both live)

### Issue: Price IDs don't match
**Solution**: Use live price IDs created in live mode, not test price IDs

### Issue: Webhook not receiving events
**Solution**:
1. Check webhook URL is correct
2. Verify webhook secret matches
3. Check Stripe Dashboard → Webhooks for failed deliveries

### Issue: Payments succeed but user not activated
**Solution**:
1. Check Vercel logs for webhook errors
2. Verify production Supabase URL is correct
3. Check webhook_events table for duplicate events

---

## Security Reminder

### ⚠️ NEVER Commit Stripe Keys to Git

- Live keys give full access to your Stripe account
- Keep keys in Vercel environment variables only
- Use `.env.local` for local development (gitignored)
- Rotate keys immediately if exposed

### ✅ Best Practices

1. **Test Mode First**: Always test in test mode before going live
2. **Separate Environments**: Dev uses test keys, production uses live keys
3. **Monitor Webhooks**: Check Stripe webhook logs regularly
4. **Set Up Alerts**: Get notified of failed payments or webhook errors
5. **Regular Audits**: Review Stripe activity monthly

---

## Quick Reference Card

| Environment | Stripe Mode | Publishable Key Starts With | Secret Key Starts With |
|-------------|-------------|----------------------------|------------------------|
| **Development** | Test | `pk_test_` | `sk_test_` |
| **Production** | Live | `pk_live_` | `sk_live_` |

| Price Type | Starter | Standard | Premium |
|------------|---------|----------|---------|
| **Monthly** | $49 | $99 | $199 |
| **Annual** | $588 (2 mo free) | $1,188 (2 mo free) | $2,388 (2 mo free) |

---

## Need Help?

1. **Stripe Documentation**: https://stripe.com/docs
2. **Stripe Support**: https://support.stripe.com
3. **Vercel Support**: https://vercel.com/support
4. **Check Deployment Logs**: https://vercel.com/your-account/voyagriq-app/deployments

---

**Last Updated**: January 8, 2026
**Status**: Awaiting verification of production Stripe configuration
