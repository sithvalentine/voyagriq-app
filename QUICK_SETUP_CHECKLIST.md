# Quick Setup Checklist

Since you already have Supabase working, here's what you need to complete:

## ✅ Step 1: Run Database Migrations

Go to your Supabase Dashboard → SQL Editor and run these 2 migrations:

### Migration 1: Row Level Security (CRITICAL)

Copy and paste this entire SQL script:

```sql
-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- CRITICAL: Run this migration before production launch
-- ============================================

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile (used by trigger)
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Verify RLS is enabled
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'profiles'
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✅ RLS is ENABLED on profiles table';
  ELSE
    RAISE WARNING '❌ RLS is NOT enabled on profiles table!';
  END IF;
END $$;
```

### Migration 2: API Keys Table

Copy and paste this entire SQL script:

```sql
-- ============================================
-- API KEYS TABLE
-- Store Premium user API keys securely in database
-- ============================================

-- Create api_keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  requests_count INTEGER DEFAULT 0,
  rate_limit INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT true
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON public.api_keys(is_active);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can insert own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can delete own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can update own API keys" ON public.api_keys;

-- RLS Policies
CREATE POLICY "Users can view own API keys"
ON public.api_keys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
ON public.api_keys FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
ON public.api_keys FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
ON public.api_keys FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

## ⚠️ Step 2: Set Up Stripe (Required for Payments)

You need Stripe to accept payments. Here's the quick version:

### A. Create Stripe Account
1. Go to https://stripe.com/register
2. Complete signup

### B. Create 3 Products (in TEST mode)
1. Go to Stripe Dashboard → Products
2. Click "+ Add product"

**Product 1:**
- Name: `VoyagrIQ Starter`
- Price: `$49.00 / month` (recurring)
- Click "Save product"
- **Copy the Price ID** (starts with `price_...`)

**Product 2:**
- Name: `VoyagrIQ Standard`
- Price: `$99.00 / month` (recurring)
- **Copy the Price ID**

**Product 3:**
- Name: `VoyagrIQ Premium`
- Price: `$199.00 / month` (recurring)
- **Copy the Price ID**

### C. Get API Keys
1. Go to Developers → API Keys
2. Copy:
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...)

### D. Set Up Webhook
1. Go to Developers → Webhooks
2. Click "+ Add endpoint"
3. Endpoint URL: `http://localhost:3000/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
5. Click "Add endpoint"
6. **Copy the Signing Secret** (whsec_...)

---

## 📝 Step 3: Update Your .env.local File

Open your `.env.local` file and update these lines with your actual Stripe values:

```bash
# Replace these placeholder values:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[YOUR_KEY_HERE]
STRIPE_SECRET_KEY=sk_test_[YOUR_KEY_HERE]
STRIPE_PRICE_STARTER=price_[YOUR_STARTER_PRICE_ID]
STRIPE_PRICE_STANDARD=price_[YOUR_STANDARD_PRICE_ID]
STRIPE_PRICE_PREMIUM=price_[YOUR_PREMIUM_PRICE_ID]
STRIPE_WEBHOOK_SECRET=whsec_[YOUR_WEBHOOK_SECRET]
```

---

## ✅ Step 4: Test Everything Works

Run the build command to make sure there are no errors:

```bash
npm run build
```

If it builds successfully, you're ready to test!

Start the dev server:
```bash
npm run dev
```

Then test:
1. Sign up for a new account
2. Try subscribing (use test card: `4242 4242 4242 4242`)
3. Verify you can access trips page

---

## 🚀 Ready for Production?

Once everything works locally, you can deploy to production:
1. See `PRODUCTION_SETUP.md` for full deployment guide
2. Use **LIVE** Stripe keys (pk_live_ and sk_live_) in production
3. Update webhook URL to your production domain

---

## Need Help?

- Check `PRODUCTION_SETUP.md` for detailed instructions
- Check `FIXES_COMPLETED.md` for what was fixed
- Stripe docs: https://stripe.com/docs
- Supabase docs: https://supabase.com/docs
