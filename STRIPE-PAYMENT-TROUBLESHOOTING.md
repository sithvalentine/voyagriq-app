# Stripe Payment Troubleshooting Guide for Vercel

**Date**: January 6, 2026
**Status**: Local Stripe configuration ✅ Working | Vercel configuration ❓ Needs verification

---

## ✅ CONFIRMED WORKING

Based on test results, your **local environment** has:
- ✅ All required environment variables
- ✅ Valid Stripe API connection
- ✅ Valid price IDs for all 3 tiers
- ✅ Checkout session creation working
- ✅ Webhook signature verification working
- ✅ RLS policies properly configured in Supabase

## 🔍 TROUBLESHOOTING VERCEL PAYMENTS

Since payments work locally but not in Vercel, here are the most common issues:

---

### Issue 1: Environment Variables Not Set in Vercel

**Problem**: Vercel doesn't automatically copy your `.env.local` file

**Solution**: Manually add ALL these variables to Vercel

#### Step-by-Step: Add Environment Variables to Vercel

1. Go to: https://vercel.com/dashboard
2. Click your `voyagriq-app` project
3. Go to **Settings** → **Environment Variables**
4. For each variable below, click **Add New**
5. Select the correct environment:
   - **Preview**: For testing on preview deployments (staging)
   - **Production**: For live production site
   - **Development**: Not needed (only for local dev)

#### Variables to Add (copy from your .env.local):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ossvcumgkwsjqrpngkhy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zc3ZjdW1na3dzanFycG5na2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMDk4ODIsImV4cCI6MjA4MjY4NTg4Mn0.Rz8GqPiHytqmCiBUwf-SCeJ5E-v7kzMAn3zUqvh9HAc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zc3ZjdW1na3dzanFycG5na2h5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzEwOTg4MiwiZXhwIjoyMDgyNjg1ODgyfQ.k8mb7aZ3FG2VKgIg9fY1-AWw54qiek7Jdpu16M7X1X8

# Stripe (TEST MODE - use your actual test keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Stripe Price IDs (Monthly)
STRIPE_PRICE_STARTER=price_1SlZMXCmKbjtfkiOSqRZiY3X
STRIPE_PRICE_STANDARD=price_1SlZNVCmKbjtfkiOTcXFr9mZ
STRIPE_PRICE_PREMIUM=price_1SlZOOCmKbjtfkiOiForv6R1

# Stripe Webhook Secret (SEE ISSUE 2 BELOW - THIS ONE IS DIFFERENT!)
STRIPE_WEBHOOK_SECRET=whsec_XXXXXX

# App URL (IMPORTANT: Use your actual Vercel URL!)
NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app
```

**⚠️ CRITICAL**:
- For `NEXT_PUBLIC_APP_URL`, use your ACTUAL Vercel deployment URL
- The webhook secret for Vercel will be DIFFERENT from local (see Issue 2)

After adding all variables, **trigger a new deployment** (push to git or redeploy in Vercel).

---

### Issue 2: Webhook Secret Mismatch

**Problem**: Your local webhook secret (`whsec_W4dNq1n4aLyUnz3rqAxPqvNLv05TqLy2`) is for **Stripe CLI local forwarding**. Vercel needs a webhook secret for a **Stripe Dashboard webhook endpoint**.

**How Webhooks Work**:
- **Local Dev**: Stripe CLI forwards webhooks to `localhost:3000` with a CLI secret
- **Vercel**: Stripe Dashboard sends webhooks to `https://your-app.vercel.app` with a different secret

#### Solution: Create Vercel Webhook Endpoint

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **Add endpoint**
3. Enter your Vercel URL:
   ```
   https://your-vercel-url.vercel.app/api/webhooks/stripe
   ```
4. Under **Events to send**, select these:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Click **Add endpoint**
6. Click on the newly created endpoint
7. Click **Reveal** under **Signing secret**
8. Copy the secret (starts with `whsec_...`)
9. Update `STRIPE_WEBHOOK_SECRET` in Vercel with this NEW secret
10. Redeploy your app

---

### Issue 3: Wrong Vercel Environment Selected

**Problem**: You added env vars to "Production" but are testing on a "Preview" deployment

**Solution**: Make sure env vars are added to the correct environment

- If your Vercel URL is `voyagriq-app-xyz123.vercel.app` (preview branch):
  → Add env vars to **Preview** environment

- If your Vercel URL is `voyagriq.com` (production domain):
  → Add env vars to **Production** environment

---

### Issue 4: Env Vars Added But Not Redeployed

**Problem**: Vercel doesn't automatically reload env vars - you must redeploy

**Solution**: Trigger a new deployment after adding/changing env vars

**Option A - Push to Git:**
```bash
cd /Users/james/claude/voyagriq-app
git commit --allow-empty -m "Redeploy with updated env vars"
git push origin main
```

**Option B - Manual Redeploy:**
1. Go to Vercel Dashboard → Deployments
2. Find the latest deployment
3. Click "..." menu → **Redeploy**
4. Make sure "Use existing build cache" is **unchecked**

---

## 🧪 TESTING THE FIX

### 1. Check Vercel Build Logs

After deploying, check if env vars are loaded:

1. Go to Vercel Dashboard → Deployments → Latest deployment
2. Click on the deployment
3. Go to **Build Logs**
4. Look for any Stripe-related errors
5. You should see a log like:
   ```
   [stripe] Loaded price IDs: { monthly: { starter: 'price_...', ... } }
   ```

### 2. Test a Payment

1. Open your Vercel URL in an **incognito window**
2. Go to `/register` or `/pricing`
3. Select a tier (e.g., Starter Monthly)
4. Fill in registration details
5. Click Subscribe
6. You should be redirected to Stripe Checkout
7. Use test card: `4242 4242 4242 4242`
8. Complete payment
9. You should be redirected back to your app with active subscription

### 3. Check Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/events
2. Look for `checkout.session.completed` event
3. Click on it
4. Go to **Webhooks** tab
5. You should see your webhook endpoint with "Succeeded" status

If webhook shows "Failed", click it to see the error message.

### 4. Check Vercel Runtime Logs

1. Go to Vercel Dashboard → Your project → **Logs** tab
2. Filter by: `api/webhooks/stripe`
3. Look for logs like:
   - `[stripe-webhook] Event received (verified): checkout.session.completed`
   - `[stripe-webhook] Successfully activated subscription for user: ...`

---

## 🐛 COMMON ERROR MESSAGES

### Error: "Price ID not configured for tier"

**Cause**: `STRIPE_PRICE_*` env vars missing or incorrect in Vercel

**Solution**:
1. Verify all 3 price IDs are set in Vercel env vars
2. Run locally to confirm price IDs are correct: `npx tsx scripts/test-stripe-config.ts`
3. Redeploy

### Error: "Webhook signature verification failed"

**Cause**: `STRIPE_WEBHOOK_SECRET` is wrong or not set in Vercel

**Solution**:
1. Create webhook endpoint in Stripe Dashboard (see Issue 2 above)
2. Copy the signing secret
3. Update `STRIPE_WEBHOOK_SECRET` in Vercel
4. Redeploy

### Error: "User profile not found"

**Cause**: User was created but profile wasn't auto-created (trigger issue)

**Solution**:
1. Verify the profile trigger exists in Supabase:
   ```sql
   -- Run in Supabase SQL Editor
   SELECT * FROM pg_trigger WHERE tgname = 'create_profile_for_user';
   ```
2. If missing, run: `/Users/james/claude/voyagriq-app/supabase/migrations/verify_profile_trigger.sql`

### Error: "Payment succeeded but subscription not activated"

**Cause**: Webhook not reaching your app OR webhook processing failed

**Solution**:
1. Check Stripe Dashboard → Webhooks → Your endpoint → Recent deliveries
2. If shows "Failed" → Click to see error (usually signature verification issue)
3. If shows "Succeeded" but user not activated → Check Vercel logs for webhook processing errors
4. Common issue: RLS blocking the webhook update (but we verified RLS is working!)

---

## ✅ VERIFICATION CHECKLIST

Before declaring success, verify:

- [ ] All env vars added to Vercel (at least 10 variables)
- [ ] `NEXT_PUBLIC_APP_URL` uses actual Vercel URL (not localhost)
- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` updated with Dashboard webhook secret (not CLI secret)
- [ ] New deployment triggered after env var changes
- [ ] Build logs show no Stripe-related errors
- [ ] Test registration flow works (can reach Stripe Checkout)
- [ ] Test payment completes successfully
- [ ] User redirected back to app after payment
- [ ] User can access dashboard (subscription activated)
- [ ] Stripe webhook shows "Succeeded" in Dashboard
- [ ] Vercel logs show webhook received and processed

---

## 📞 NEXT STEPS

1. **Add env vars to Vercel** (Issue 1)
2. **Create webhook endpoint** (Issue 2)
3. **Redeploy** (Issue 4)
4. **Test a payment** (Testing section)
5. **Check logs** if it fails (Troubleshooting section)

If you still have issues after following this guide, please provide:
- Your Vercel deployment URL
- Screenshot of Vercel env vars (blur sensitive values)
- Screenshot of Stripe webhook delivery attempt
- Copy of Vercel runtime logs during payment attempt

I'll help you debug further!
