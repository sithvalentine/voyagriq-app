# Staging URL Configuration Checklist

**Staging URL**: https://voyagriq-app-git-staging-james-burns-projects-286e4ef4.vercel.app

---

## ✅ CHECKLIST FOR THIS STAGING URL

### 1. Vercel Environment Variables

Go to: https://vercel.com/james-burns-projects-286e4ef4/voyagriq-app/settings/environment-variables

Verify these 13 required variables have **"Preview"** checkbox selected:

#### Supabase (3 vars)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

#### Stripe (7 vars)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_PRICE_STARTER`
- [ ] `STRIPE_PRICE_STANDARD`
- [ ] `STRIPE_PRICE_PREMIUM`
- [ ] `STRIPE_PRICE_STARTER_ANNUAL`
- [ ] `STRIPE_PRICE_STANDARD_ANNUAL`
- [ ] `STRIPE_PRICE_PREMIUM_ANNUAL`
- [ ] `STRIPE_WEBHOOK_SECRET`

#### App Config (2 vars)
- [ ] `NEXT_PUBLIC_APP_URL` - MUST be set to: `https://voyagriq-app-git-staging-james-burns-projects-286e4ef4.vercel.app`
- [ ] `NODE_ENV` - Should be `production` (Vercel sets this automatically)

**⚠️ CRITICAL**: Make sure `NEXT_PUBLIC_APP_URL` is NOT set to `localhost`!

---

### 2. Stripe Webhook Endpoint

Go to: https://dashboard.stripe.com/test/webhooks

Check if you have an endpoint with this **EXACT URL**:
```
https://voyagriq-app-git-staging-james-burns-projects-286e4ef4.vercel.app/api/webhooks/stripe
```

#### If endpoint DOES NOT exist:

1. Click **Add endpoint**
2. Enter URL: `https://voyagriq-app-git-staging-james-burns-projects-286e4ef4.vercel.app/api/webhooks/stripe`
3. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
4. Click **Add endpoint**
5. **IMPORTANT**: Click on the endpoint → Click "Reveal" under **Signing secret**
6. Copy the secret (starts with `whsec_...`)
7. Go back to Vercel env vars
8. Update `STRIPE_WEBHOOK_SECRET` to this NEW secret
9. Make sure "Preview" is checked for this variable
10. Redeploy (see step 3 below)

#### If endpoint DOES exist:

1. Click on the endpoint
2. Verify the URL exactly matches (no typos)
3. Click "Reveal" under **Signing secret**
4. Does this secret match what's in Vercel's `STRIPE_WEBHOOK_SECRET`?
   - If NO: Update Vercel's `STRIPE_WEBHOOK_SECRET` and redeploy

---

### 3. Redeploy After Changes

If you made any changes to environment variables or webhook configuration:

```bash
cd /Users/james/claude/voyagriq-app
git commit --allow-empty -m "Trigger staging redeploy"
git push origin staging
```

Or use Vercel Dashboard:
1. Go to Deployments
2. Find the staging deployment
3. Click "..." → Redeploy
4. Uncheck "Use existing build cache"

---

## 🧪 TEST THE PAYMENT FLOW

### Step 1: Open in Incognito Window
```
https://voyagriq-app-git-staging-james-burns-projects-286e4ef4.vercel.app/register?tier=premium&interval=annual
```

### Step 2: Fill Registration Form
- Full Name: Test User
- Email: test@example.com (or your email)
- Agency Name: Test Agency
- Password: TestPass123!

### Step 3: Click "Subscribe to Premium Annual"

**What should happen**:
- ✅ Redirected to Stripe Checkout
- ✅ Form shows "VoyagrIQ Premium Annual" or "$2,388.00 USD per year"

**If you get an error before Stripe**:
- Check browser console (F12)
- Look for error messages
- Common: "Price ID not configured" = Missing `STRIPE_PRICE_PREMIUM_ANNUAL` env var

### Step 4: Complete Payment

Use Stripe test card:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/34)
- CVC: 123
- ZIP: 12345

Click "Pay"

**What should happen**:
- ✅ Payment succeeds
- ✅ Redirected back to: `https://voyagriq-app-git-staging...vercel.app/subscription/success`
- ✅ Can access dashboard
- ✅ Subscription shows as "Active"

---

## 🐛 IF PAYMENT FAILS

### Check 1: Vercel Logs

1. Go to: https://vercel.com/james-burns-projects-286e4ef4/voyagriq-app
2. Click **Logs** tab
3. Filter by your staging deployment
4. Look for errors containing:
   - `[create-checkout]` - Checkout session creation
   - `[stripe-webhook]` - Webhook processing
   - `ERROR` or `⚠️`

### Check 2: Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/payments
2. Find your test payment
3. Was it successful?
4. Go to: https://dashboard.stripe.com/test/events
5. Look for `checkout.session.completed` event
6. Click on it → Go to **Webhooks** tab
7. Status:
   - **Succeeded** (green) = Webhook delivered successfully
   - **Failed** (red) = Click to see error message

### Check 3: Common Errors

**Error: "No such price"**
- Cause: `STRIPE_PRICE_PREMIUM_ANNUAL` not set or incorrect
- Solution: Verify the annual price ID exists in Stripe Dashboard → Products

**Error: "Webhook signature verification failed"**
- Cause: `STRIPE_WEBHOOK_SECRET` doesn't match the webhook endpoint
- Solution: Get the signing secret from Stripe webhook endpoint and update Vercel

**Error: "redirect_uri_mismatch" or redirect fails**
- Cause: `NEXT_PUBLIC_APP_URL` is set to localhost or wrong URL
- Solution: Set to `https://voyagriq-app-git-staging-james-burns-projects-286e4ef4.vercel.app`

**Payment succeeds but subscription not activated**
- Cause: Webhook not reaching your app or failing to process
- Check: Stripe webhook deliveries (see Check 2 above)

---

## 📊 VERIFICATION COMMANDS

After attempting a payment, run these to diagnose:

### Check if env vars loaded correctly:
Visit this URL in browser (after we add the endpoint):
```
https://voyagriq-app-git-staging-james-burns-projects-286e4ef4.vercel.app/api/check-env
```

Should show all vars as `true` except showing the actual `NEXT_PUBLIC_APP_URL`

### Check Stripe products locally:
```bash
cd /Users/james/claude/voyagriq-app
npx tsx scripts/test-stripe-config.ts
```

Should show all 5 products including the 3 annual ones.

---

## ✅ SUCCESS CRITERIA

When everything is working, you should be able to:

- [ ] Navigate to staging URL
- [ ] Click "Subscribe to Premium Annual"
- [ ] Get redirected to Stripe Checkout
- [ ] See correct price: $2,388/year
- [ ] Complete payment with test card
- [ ] Get redirected back to success page
- [ ] Access dashboard with active subscription
- [ ] See subscription tier as "premium" in account
- [ ] Stripe webhook delivery shows "Succeeded"
- [ ] Vercel logs show successful webhook processing

---

## 🆘 TELL ME

After you check the webhook endpoint and env vars, let me know:

1. **Does the webhook endpoint exist for this staging URL?** (Yes/No)
2. **If yes, does the signing secret match Vercel's `STRIPE_WEBHOOK_SECRET`?**
3. **What happens when you try a test payment?** (exact error or behavior)
4. **What do Vercel logs show?** (any error messages?)

I'll help you debug from there!
