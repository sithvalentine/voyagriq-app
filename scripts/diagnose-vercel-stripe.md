# Diagnosing Stripe Payment Issues When Env Vars Are Set

Since you have 15 environment variables already configured in Vercel, the issue is likely one of these:

## Most Common Issues (When Env Vars Exist)

### Issue 1: Wrong STRIPE_WEBHOOK_SECRET

**Symptom**: Payment succeeds on Stripe, but subscription doesn't activate in your app

**Why**: Your local `.env.local` has a webhook secret from Stripe CLI (`whsec_W4dNq1n4aLyUnz3rqAxPqvNLv05TqLy2`), but Vercel needs a webhook secret from a Stripe Dashboard endpoint.

**How to check**:
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Look for an endpoint with your Vercel URL: `https://voyagriq-app-xxx.vercel.app/api/webhooks/stripe`
3. Does it exist?
   - **NO** → You need to create it (see solution below)
   - **YES** → Check if the signing secret in Vercel matches the one shown in Stripe

**Solution if endpoint doesn't exist**:
1. Click **Add endpoint**
2. URL: `https://your-actual-vercel-url.vercel.app/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
4. Copy the **Signing secret**
5. Update `STRIPE_WEBHOOK_SECRET` in Vercel with this NEW secret
6. Redeploy

### Issue 2: NEXT_PUBLIC_APP_URL Points to Localhost

**Symptom**: Stripe redirects fail, or success/cancel URLs don't work

**Why**: If `NEXT_PUBLIC_APP_URL` in Vercel is set to `http://localhost:3000`, the Stripe redirects won't work.

**How to check**:
- In Vercel env vars, what is `NEXT_PUBLIC_APP_URL` set to?
- Should be: `https://your-vercel-url.vercel.app` (NOT localhost)

**Solution**:
1. Update `NEXT_PUBLIC_APP_URL` in Vercel to your actual Vercel URL
2. Redeploy

### Issue 3: Environment Variables Not Applied to Correct Environment

**Symptom**: Works in production deployment but not preview, or vice versa

**Why**: Vercel has separate env vars for Production, Preview, and Development

**How to check**:
- Which Vercel URL are you testing?
  - `voyagriq.com` or `voyagriq-app.vercel.app` = **Production**
  - `voyagriq-app-git-xxx.vercel.app` or `voyagriq-app-xxx.vercel.app` = **Preview**
- Are the env vars set for the correct environment?

**Solution**:
1. Make sure all 15 env vars are checked for the environment you're testing
2. If testing preview deployments, check the "Preview" checkbox for all vars
3. Redeploy

### Issue 4: Cached Build After Adding Env Vars

**Symptom**: Recently added env vars but they're not being picked up

**Why**: Vercel might be using a cached build

**Solution**:
1. Go to Vercel Dashboard → Deployments
2. Click latest deployment → **Redeploy**
3. Make sure "Use existing build cache" is **UNCHECKED**

### Issue 5: Annual Price IDs Missing

**Symptom**: Monthly payments work but annual doesn't (or "Price ID not configured" error)

**Why**: Your code expects 6 price IDs (3 monthly + 3 annual) but you might only have 3 set

**How to check**:
Do you have these 6 env vars in Vercel?
- `STRIPE_PRICE_STARTER` (monthly)
- `STRIPE_PRICE_STANDARD` (monthly)
- `STRIPE_PRICE_PREMIUM` (monthly)
- `STRIPE_PRICE_STARTER_ANNUAL`
- `STRIPE_PRICE_STANDARD_ANNUAL`
- `STRIPE_PRICE_PREMIUM_ANNUAL`

**Solution**:
- If annual vars are missing, your code will fall back to empty strings
- Either add the annual price IDs, or only offer monthly subscriptions for now

## How to Debug Live

### Check Vercel Runtime Logs

1. Go to: https://vercel.com/james-burns-projects-286e4ef4/voyagriq-app
2. Click **Logs** tab
3. Try a test payment
4. Look for:
   - `[create-checkout]` logs - Shows if checkout session was created
   - `[stripe]` logs - Shows which price IDs are loaded
   - Any ERROR messages

### Check Stripe Dashboard Logs

1. Go to: https://dashboard.stripe.com/test/logs
2. Try a test payment
3. Look for:
   - `checkout.session.completed` event - Did payment succeed?
   - Webhook delivery - Did webhook reach your app?
   - Any failed webhooks (red indicators)

### Check Stripe Webhook Deliveries

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on your Vercel endpoint
3. Click **View logs**
4. After a test payment, check:
   - Did Stripe attempt to deliver the webhook?
   - Status: "Succeeded" (✅) or "Failed" (❌)?
   - If failed, click to see error message

## Quick Diagnostic Questions

To help me pinpoint the exact issue, answer these:

1. **Where does the payment flow break?**
   - [ ] Can't even load the pricing page
   - [ ] Pricing page loads but clicking "Subscribe" does nothing
   - [ ] Gets to Stripe Checkout but shows an error
   - [ ] Payment succeeds on Stripe but subscription not activated in app
   - [ ] Other: _______________

2. **Which Vercel URL are you testing?**
   - Full URL: _______________
   - Is it Production or Preview?

3. **Do you see any error messages?**
   - Where: (browser console / page / Vercel logs)
   - Message: _______________

4. **Stripe webhook endpoint:**
   - Does it exist in Stripe Dashboard? (Yes/No)
   - If yes, is the URL correct? _______________
   - Recent deliveries show: (Succeeded / Failed / None)

5. **Environment variables in Vercel:**
   - Which environments are they set for? (Production / Preview / Both)
   - What is `NEXT_PUBLIC_APP_URL` set to? _______________

## Expected Working Flow

For reference, here's what should happen:

1. User clicks "Subscribe to Starter" on pricing page
2. Browser sends POST to `/api/stripe/create-checkout`
3. Server creates Stripe checkout session with correct price ID
4. User redirected to Stripe Checkout page
5. User enters test card: `4242 4242 4242 4242`
6. Payment succeeds on Stripe
7. Stripe sends webhook to `/api/webhooks/stripe`
8. Webhook updates user profile in Supabase (activates subscription)
9. User redirected to `/subscription/success`
10. User can access dashboard with active subscription

**Where does your flow break?**
