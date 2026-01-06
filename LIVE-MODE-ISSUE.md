# 🚨 CRITICAL: You're Using LIVE Stripe Mode!

## Problem Found

Your checkout session ID starts with `cs_live_` which means you're using **LIVE/PRODUCTION Stripe keys**, not test keys!

```
cs_live_a13lH2lZSji430ll0sPJ5rkxqYth6BhB36bXEclgKUznduCe0uYGSDF4PS
```

**This means:**
- ❌ Test cards (4242 4242 4242 4242) won't work
- ❌ You need REAL credit cards to test
- ⚠️  Any payments will be REAL charges!

## Why This Happened

Your Vercel environment has **LIVE Stripe keys** instead of **TEST keys**.

**Test keys** start with:
- `pk_test_...` (publishable key)
- `sk_test_...` (secret key)

**Live keys** start with:
- `pk_live_...` (publishable key)
- `sk_live_...` (secret key)

## ✅ Solution: Switch to Test Mode

### Step 1: Get Test Mode Keys

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Make sure you're in **TEST MODE** (toggle in top right)
3. Copy these keys:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...` (click "Reveal")

### Step 2: Update Vercel Environment Variables

Go to: https://vercel.com/james-burns-projects-286e4ef4/voyagriq-app/settings/environment-variables

Replace these with TEST mode keys:

1. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**
   - Current: Starts with `pk_live_...`
   - Change to: Your test publishable key from `.env.local` (starts with `pk_test_`)

2. **STRIPE_SECRET_KEY**
   - Current: Starts with `sk_live_...`
   - Change to: Your test secret key from `.env.local` (starts with `sk_test_`)

### Step 3: Update Webhook Secret (for Test Mode)

You'll also need a **test mode webhook**:

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Make sure you're in **TEST MODE**
3. Find or create webhook for your staging URL:
   ```
   https://voyagriq-app-git-staging-james-burns-projects-286e4ef4.vercel.app/api/webhooks/stripe
   ```
4. Get the **signing secret** (starts with `whsec_...`)
5. Update `STRIPE_WEBHOOK_SECRET` in Vercel

### Step 4: Redeploy

```bash
cd /Users/james/claude/voyagriq-app
git commit --allow-empty -m "Switch to test mode Stripe keys"
git push origin staging
```

---

## 🧪 After Fixing

You should see:
- Checkout session ID starting with `cs_test_...` (not `cs_live_`)
- Test card `4242 4242 4242 4242` will work
- No real charges

---

## ⚠️  When to Use Live Mode

Only use live/production keys when:
- You're ready to accept REAL payments
- You've tested everything thoroughly in test mode
- You understand you'll be charged Stripe fees
- You have proper terms of service and privacy policy

For now, use **TEST MODE** for all testing!

---

## Quick Check

After updating to test keys, visit:
```
https://voyagriq-app-git-staging-james-burns-projects-286e4ef4.vercel.app/api/check-env
```

The publishable key should show something like:
```
"NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": "✅ Set"
```

But when you test a payment, the session ID should start with `cs_test_` not `cs_live_`!
