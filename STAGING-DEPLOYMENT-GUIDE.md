# VoyagrIQ Staging Deployment Guide

**Date**: January 6, 2026
**Status**: ✅ Security Verified | Focus on Stripe Configuration

---

## ✅ PART 1: SECURITY STATUS - VERIFIED!

### Status: All RLS Policies Are Working Correctly! 🎉

I ran comprehensive security tests and confirmed:
- ✅ Users can only see their own data
- ✅ Users cannot access other users' data
- ✅ Users cannot modify other users' data
- ✅ Users cannot delete other users' data
- ✅ Users can modify/delete their own data
- ✅ Data isolation is working correctly across all operations

**Test Results:**
```
✅ PASS: Data Isolation - SELECT
✅ PASS: Cross-User Access Prevention - SELECT by ID
✅ PASS: Cross-User Modification Prevention - UPDATE
✅ PASS: Cross-User Deletion Prevention - DELETE
✅ PASS: Own Data Modification - UPDATE
✅ PASS: Own Data Deletion - DELETE
```

### Optional: Re-verify RLS (If You Want to Double-Check)

You can run the test yourself:
```bash
cd /Users/james/claude/voyagriq-app
npx tsx scripts/test-rls-policies.ts
```

**Your database is secure - proceed to PART 2 for Stripe configuration!**

---

## 💳 PART 2: FIX STRIPE TEST PAYMENTS

### Problem
Test payments aren't working in Vercel staging environment even though you entered the keys.

### Possible Causes & Solutions

#### Cause 1: Missing or Incorrect Environment Variables

**Check these in Vercel Dashboard:**

1. Go to: https://vercel.com/dashboard
2. Select your `voyagriq-app` project
3. Go to **Settings** → **Environment Variables**
4. Verify ALL of these are set:

##### Required Stripe Variables (Test Mode)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_STANDARD=price_...
STRIPE_PRICE_PREMIUM=price_...
```

##### Required Supabase Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

##### Required App Variables
```
NEXT_PUBLIC_APP_URL=https://your-staging-url.vercel.app
```

**IMPORTANT:** Make sure these are set for the correct environment:
- If testing on staging: Set for **Preview** environment
- If testing on production: Set for **Production** environment

#### Cause 2: Stripe Webhook Not Configured

The webhook is critical for activating subscriptions after payment.

**Set up Stripe Webhook:**

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **Add endpoint**
3. Enter endpoint URL:
   ```
   https://your-vercel-url.vercel.app/api/webhooks/stripe
   ```
4. Select these events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)
7. Add it to Vercel as `STRIPE_WEBHOOK_SECRET`

#### Cause 3: Missing Stripe Price IDs

You need to create Products and Prices in Stripe Dashboard.

**Create Stripe Products:**

1. Go to: https://dashboard.stripe.com/test/products
2. Create 3 products:

**Product 1: Starter**
- Name: `VoyagrIQ Starter`
- Description: `Perfect for independent travel advisors`
- Click **Add price**:
  - Monthly: `$49.00 USD` → Copy price ID → Set as `STRIPE_PRICE_STARTER`
  - Annual: `$588.00 USD` → Copy price ID → Set as `STRIPE_PRICE_STARTER_ANNUAL`

**Product 2: Standard**
- Name: `VoyagrIQ Standard`
- Description: `For growing agencies`
- Click **Add price**:
  - Monthly: `$99.00 USD` → Copy price ID → Set as `STRIPE_PRICE_STANDARD`
  - Annual: `$1,188.00 USD` → Copy price ID → Set as `STRIPE_PRICE_STANDARD_ANNUAL`

**Product 3: Premium**
- Name: `VoyagrIQ Premium`
- Description: `For established agencies with high volume`
- Click **Add price**:
  - Monthly: `$199.00 USD` → Copy price ID → Set as `STRIPE_PRICE_PREMIUM`
  - Annual: `$2,388.00 USD` → Copy price ID → Set as `STRIPE_PRICE_PREMIUM_ANNUAL`

#### Cause 4: Environment Variables Not Redeployed

After adding/changing environment variables in Vercel, you MUST redeploy.

**Trigger a new deployment:**

Option A - Push to GitHub:
```bash
cd /Users/james/claude/voyagriq-app
git commit --allow-empty -m "Trigger redeploy after env var updates"
git push origin main
```

Option B - Manual redeploy in Vercel:
1. Go to Vercel Dashboard → Deployments
2. Click the three dots on latest deployment
3. Click **Redeploy**

---

## 🧪 PART 3: TEST THE PAYMENT FLOW

### Test User Registration with Payment

1. Open your staging URL in an **incognito/private window**
2. Go to the Register/Pricing page
3. Select a tier (e.g., Starter)
4. Fill in registration details
5. Click the subscribe button

### Use Stripe Test Cards

**Successful Payment:**
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**Payment Declined:**
```
Card Number: 4000 0000 0000 0002
```

**Requires Authentication (3D Secure):**
```
Card Number: 4000 0025 0000 3155
```

### Expected Flow

1. **Registration form submitted** → Creates user in Supabase
2. **Redirects to Stripe Checkout** → User enters payment info
3. **Payment succeeds** → Stripe sends webhook to your app
4. **Webhook activates subscription** → Updates user profile in Supabase
5. **User redirected to success page** → Can now access the app

### Check the Logs

**Vercel Logs:**
1. Go to Vercel Dashboard → Your project
2. Click **Logs** tab
3. Look for:
   - `[create-checkout]` - Checkout session creation
   - `[stripe-webhook]` - Webhook events received
   - Any errors with `ERROR` or `⚠️`

**Stripe Logs:**
1. Go to: https://dashboard.stripe.com/test/logs
2. Look for:
   - `checkout.session.completed` events
   - Webhook delivery attempts
   - Any failed webhooks (red indicators)

---

## 🐛 TROUBLESHOOTING

### Issue: "Price ID not configured for tier"

**Problem:** Missing Stripe price IDs in environment variables

**Solution:**
1. Verify all 6 price IDs are set in Vercel (3 monthly + 3 annual)
2. Redeploy the app

### Issue: "Webhook signature verification failed"

**Problem:** `STRIPE_WEBHOOK_SECRET` is incorrect or missing

**Solution:**
1. Get the signing secret from Stripe Dashboard → Webhooks
2. Update `STRIPE_WEBHOOK_SECRET` in Vercel
3. Redeploy

### Issue: Payment succeeds but subscription not activated

**Problem:** Webhook not reaching your app OR webhook processing is failing

**Solution:**
1. Check Stripe Dashboard → Webhooks → View logs
2. If webhook shows "Failed" → Check error message
3. If webhook shows "Succeeded" but user not activated → Check Vercel logs for errors in webhook handler
4. Common issue: RLS policies blocking the webhook from updating the database (this is why we fixed RLS first!)

### Issue: "User profile not found"

**Problem:** Profile trigger didn't create the profile in Supabase when user registered

**Solution:**
1. Check Supabase → Authentication → Users
2. Verify user exists
3. Check Supabase → Table Editor → profiles
4. If user exists but no profile → Run this SQL:
   ```sql
   INSERT INTO profiles (id, email, full_name, subscription_tier, subscription_status)
   VALUES (
     'user-uuid-here',
     'user@email.com',
     'User Name',
     'trial',
     'trialing'
   );
   ```

### Issue: "Rate limit exceeded"

**Problem:** Too many requests from the same IP (security feature)

**Solution:**
- Wait 15 minutes, or
- Test from a different network/device, or
- Temporarily disable rate limiting in [rate-limit.ts](lib/rate-limit.ts) for testing

---

## ✅ VERIFICATION CHECKLIST

Before going to production, verify:

- [ ] RLS policies applied to all 7 tables in Supabase
- [ ] All environment variables set in Vercel
- [ ] Stripe webhook configured and receiving events
- [ ] Test payment successful with test card
- [ ] User can register and access dashboard after payment
- [ ] Subscription shows as "active" in user profile
- [ ] User can see their own data (trips, tags, etc.)
- [ ] User CANNOT see other users' data (test with 2 accounts)

---

## 📞 NEED HELP?

If you encounter any issues while following this guide, let me know:
1. What step you're on
2. The exact error message you see
3. Screenshots of Vercel logs or Stripe logs (if applicable)

I'll help you debug and get everything working!
