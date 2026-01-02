# Stripe Setup Guide for VoyagrIQ

Complete this guide to enable payments in your application.

---

## Step 1: Create Stripe Account

1. Go to https://stripe.com/register
2. Sign up with your email
3. Complete the account verification
4. You'll land in the Stripe Dashboard

---

## Step 2: Create Three Products

You need to create 3 subscription products that match your pricing tiers.

### Product 1: VoyagrIQ Starter

1. In Stripe Dashboard, go to **Products** → **+ Add product**
2. Fill in:
   - **Name:** `VoyagrIQ Starter`
   - **Description:** `For solo travel advisors handling up to 25 trips per month`
   - **Pricing model:** Recurring
   - **Price:** `$49.00`
   - **Billing period:** Monthly
   - **Currency:** USD
3. Click **Save product**
4. **COPY THE PRICE ID** - it starts with `price_...`
   - Example: `price_1QaBC123xyz456DEF789`
   - Save this as **STRIPE_PRICE_STARTER**

### Product 2: VoyagrIQ Standard

1. Click **+ Add product** again
2. Fill in:
   - **Name:** `VoyagrIQ Standard`
   - **Description:** `For growing agencies with up to 50 trips and 10 team members`
   - **Pricing model:** Recurring
   - **Price:** `$99.00`
   - **Billing period:** Monthly
   - **Currency:** USD
3. Click **Save product**
4. **COPY THE PRICE ID**
   - Save this as **STRIPE_PRICE_STANDARD**

### Product 3: VoyagrIQ Premium

1. Click **+ Add product** again
2. Fill in:
   - **Name:** `VoyagrIQ Premium`
   - **Description:** `For larger agencies with unlimited trips and users`
   - **Pricing model:** Recurring
   - **Price:** `$199.00`
   - **Billing period:** Monthly
   - **Currency:** USD
3. Click **Save product**
4. **COPY THE PRICE ID**
   - Save this as **STRIPE_PRICE_PREMIUM**

---

## Step 3: Get API Keys

### Publishable Key (for frontend)

1. Go to **Developers** → **API Keys**
2. Find the **Publishable key** section
3. Copy the key starting with `pk_test_...`
4. Save this as **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**

### Secret Key (for backend)

1. On the same page, find the **Secret key** section
2. Click **Reveal test key**
3. Copy the key starting with `sk_test_...`
4. Save this as **STRIPE_SECRET_KEY**

⚠️ **IMPORTANT:** Never commit the secret key to version control!

---

## Step 4: Set Up Webhook

Webhooks allow Stripe to notify your app about subscription events (payments, cancellations, etc.)

### For Local Development:

1. Go to **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. **Endpoint URL:** `http://localhost:3000/api/stripe/webhook`
4. **Description:** `Local development webhook`
5. **Events to send:** Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **Add endpoint**
7. **COPY THE SIGNING SECRET** (starts with `whsec_...`)
8. Save this as **STRIPE_WEBHOOK_SECRET**

### For Production (After Deployment):

1. Repeat the same steps above
2. But use your production URL: `https://your-domain.com/api/stripe/webhook`
3. Get a new signing secret for production
4. Update your production environment variables

---

## Step 5: Update Environment Variables

Now update your `.env.local` file with all the values you copied:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51abc123...
STRIPE_SECRET_KEY=sk_test_51xyz789...
STRIPE_PRICE_STARTER=price_1QaBC123xyz456DEF789
STRIPE_PRICE_STANDARD=price_1QaBC123xyz456DEF790
STRIPE_PRICE_PREMIUM=price_1QaBC123xyz456DEF791
STRIPE_WEBHOOK_SECRET=whsec_abc123xyz789...
```

Replace the placeholder values with your actual Stripe values.

---

## Step 6: Test Your Setup

### Test with Stripe Test Cards

Stripe provides test card numbers that simulate different scenarios:

**Successful Payment:**
- Card number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Payment Requires Authentication (3D Secure):**
- Card number: `4000 0025 0000 3155`

**Payment Declined:**
- Card number: `4000 0000 0000 0002`

### Testing Steps:

1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click **Start 14-Day Free Trial**
4. Sign up for an account
5. Choose a plan (Starter/Standard/Premium)
6. Use the test card: `4242 4242 4242 4242`
7. Complete checkout
8. Verify:
   - You're redirected to `/trips`
   - Check Stripe Dashboard → **Payments** to see the test payment
   - Check Stripe Dashboard → **Customers** to see the new customer
   - Check Stripe Dashboard → **Subscriptions** to see the active subscription

---

## Step 7: Verify Webhook Is Working

1. Complete a test subscription (steps above)
2. Go to Stripe Dashboard → **Developers** → **Webhooks**
3. Click on your webhook endpoint
4. Check the **Events** section
5. You should see events like:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `invoice.payment_succeeded`
6. Each event should show `Succeeded` status

If you see `Failed` status, click on the event to see error details.

---

## Step 8: Production Setup

When you're ready to go live:

### Switch to Live Mode

1. In Stripe Dashboard, toggle from **Test mode** to **Live mode** (top right)
2. Repeat Steps 2-4 in Live mode to get production keys
3. Create webhook endpoint with your production URL
4. Update your production environment variables with **live** keys (starting with `pk_live_` and `sk_live_`)

### Stripe Activation Checklist

Before accepting real payments, Stripe requires you to:
- Provide business details
- Add bank account for payouts
- Verify your identity
- Accept Stripe's terms of service

Stripe will guide you through this in the Dashboard.

---

## Troubleshooting

### "No such price" error

- Double-check your price IDs in `.env.local`
- Make sure you copied the full price ID (starts with `price_`)
- Verify you're using test mode keys with test mode price IDs

### Webhook events not received

- Check that your dev server is running on `http://localhost:3000`
- Verify the webhook URL in Stripe matches exactly
- Check the webhook signing secret is correct
- Look at webhook event details in Stripe Dashboard for error messages

### "Invalid API Key" error

- Make sure you copied the full API key
- Check for extra spaces or characters
- Verify you're using the correct environment (test vs live)
- Restart your dev server after changing `.env.local`

### Subscription not showing in app

- Check browser console for errors
- Verify RLS policies are set up in Supabase
- Check Supabase `profiles` table to see if `subscription_tier` was updated
- Look at webhook event logs in Stripe Dashboard

---

## Next Steps

Once Stripe is working:
- ✅ Complete the second SQL migration (API keys table)
- ✅ Test the complete signup → payment → app access flow
- ✅ Review PRODUCTION_SETUP.md for deployment instructions

---

## Useful Resources

- [Stripe Testing Cards](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Dashboard](https://dashboard.stripe.com)
