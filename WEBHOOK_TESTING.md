# Testing Stripe Webhooks

## ✅ Webhook Handler Status
The webhook handler is now properly configured and working at:
- **Endpoint**: `/api/webhooks/stripe`
- **Location**: `app/api/webhooks/stripe/route.ts`

## 🧪 Testing Locally with Stripe CLI

### Step 1: Install Stripe CLI (if not already installed)
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### Step 2: Login to Stripe
```bash
stripe login
```
This will open your browser to authenticate with Stripe.

### Step 3: Forward Webhooks to Local Server
```bash
# Make sure your dev server is running on port 3000
npm run dev

# In a new terminal, forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**IMPORTANT**: Copy this `whsec_xxx` secret and add it to your `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Step 4: Test Webhook Events

In another terminal, trigger test events:

```bash
# Test checkout.session.completed (most important!)
stripe trigger checkout.session.completed

# Test subscription events
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted

# Test payment events
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

### Step 5: Verify Webhook Processing

Check your terminal where `stripe listen` is running. You should see:
```
✓ Received: checkout.session.completed
✓ Sent to localhost:3000/api/webhooks/stripe
✓ Response: 200 OK
```

Also check your dev server logs for:
```
[stripe-webhook] Event received: checkout.session.completed
[stripe-webhook] Successfully updated profile for user: xxx
```

## 🚀 Production Webhook Setup

### Step 1: Deploy Your App
Deploy to Vercel/Netlify/etc and get your production URL:
```
https://your-domain.com
```

### Step 2: Create Production Webhook in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter endpoint URL:
   ```
   https://your-domain.com/api/webhooks/stripe
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. **Copy the signing secret** (starts with `whsec_`)
7. Add to your production environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### Step 3: Test Production Webhook

After deploying and configuring the webhook:

1. Go to Stripe Dashboard → Webhooks → Your endpoint
2. Click "Send test webhook"
3. Choose `checkout.session.completed`
4. Verify response is `200 OK`

## 🔍 Troubleshooting

### Webhook Returns 400 "No signature"
- **Cause**: Missing or invalid `stripe-signature` header
- **Fix**: Make sure you're using Stripe CLI or actual Stripe webhooks, not manual curl requests

### Webhook Returns 500 "Database update failed"
- **Cause**: Profile not found or database connection issue
- **Fix**: Check that the userId in the event metadata matches a real user in your database

### Webhook Times Out
- **Cause**: Webhook processing taking too long
- **Fix**: Check Supabase connection and database performance

### No Events Received
- **Cause**: Webhook not properly configured or wrong URL
- **Fix**: Double-check the webhook URL matches your deployed app

## 📊 What the Webhook Does

When Stripe sends events, the webhook:

1. **Verifies signature** - Ensures request is from Stripe
2. **Processes event** - Handles different event types:
   - `checkout.session.completed` → Sets `stripe_customer_id` (grants access!)
   - `customer.subscription.updated` → Updates subscription status
   - `customer.subscription.deleted` → Marks subscription as canceled
   - `invoice.payment_failed` → Marks account as past_due
   - `invoice.payment_succeeded` → Reactivates account
3. **Updates database** - Modifies the `profiles` table in Supabase
4. **Returns 200 OK** - Acknowledges receipt to Stripe

## ✅ Verification Checklist

- [ ] Webhook endpoint responds (returns 400 "No signature" when testing without Stripe CLI)
- [ ] Stripe CLI can forward events to local server
- [ ] `checkout.session.completed` event updates `stripe_customer_id` in database
- [ ] User can access app after webhook processes payment
- [ ] Production webhook configured in Stripe Dashboard
- [ ] Production webhook secret added to environment variables
