# Dev Environment Setup - Complete Guide

**Date**: January 8, 2026
**Status**: 🚧 IN PROGRESS

---

## Overview

We've separated development and production environments to ensure:
- ✅ Dev accounts cannot access production
- ✅ Test data doesn't pollute production database
- ✅ Safe testing without affecting real customers
- ✅ Industry-standard environment isolation

---

## Environment Architecture

### **Development (localhost)**
- **URL**: http://localhost:3000
- **Supabase**: https://fzxbxzzhakzbfrspehpe.supabase.co (NEW)
- **Stripe**: Test mode keys
- **Dev Mode**: Enabled (bypasses Stripe)
- **Database**: Separate dev database

### **Production (voyagriq.com)**
- **URL**: https://voyagriq.com
- **Supabase**: https://ossvcumgkwsjqrpngkhy.supabase.co (EXISTING)
- **Stripe**: Live mode keys (when configured)
- **Dev Mode**: Disabled (never accessible)
- **Database**: Production database with real customers

---

## Setup Steps

### Step 1: Get Supabase Dev Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Open the **voyagriq-dev** project: `fzxbxzzhakzbfrspehpe.supabase.co`
3. Navigate to: **Settings** → **API**
4. Copy the following:
   - **Project URL**: `https://fzxbxzzhakzbfrspehpe.supabase.co`
   - **anon/public key**: (copy the `anon` key)
   - **service_role key**: (copy the `service_role` key - keep secret!)

### Step 2: Run Database Schema in Dev Project

1. Open [Supabase SQL Editor](https://app.supabase.com/project/fzxbxzzhakzbfrspehpe/sql)
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL editor
5. Click **Run** (bottom right)
6. Verify all tables were created (should see success messages)

### Step 3: Configure Local Environment

1. Update `.env.development` with your dev Supabase keys:
   ```bash
   # Open the file
   nano .env.development

   # Replace these lines:
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_DEV_ANON_KEY_HERE
   SUPABASE_SERVICE_ROLE_KEY=YOUR_DEV_SERVICE_ROLE_KEY_HERE
   ```

2. Copy to `.env.local` for local development:
   ```bash
   cp .env.development .env.local
   ```

### Step 4: Verify Production Environment Variables (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com)
2. Open your **voyagriq-app** project
3. Go to **Settings** → **Environment Variables**
4. Verify these are set to **PRODUCTION** values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ossvcumgkwsjqrpngkhy.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[production anon key]
   SUPABASE_SERVICE_ROLE_KEY=[production service role key]
   ```

---

## Database Schema Setup

The schema includes:

### Core Tables:
- ✅ `profiles` - User accounts and subscription data
- ✅ `trips` - Trip data with costs and metadata
- ✅ `tags` - Custom trip tags
- ✅ `team_members` - Team collaboration
- ✅ `white_label_settings` - Custom branding
- ✅ `api_keys` - API access keys
- ✅ `scheduled_reports` - Automated reporting
- ✅ `webhook_events` - Stripe webhook idempotency

### Security:
- ✅ Row Level Security (RLS) policies
- ✅ Automatic profile creation trigger
- ✅ Updated timestamp triggers
- ✅ Foreign key constraints

### Performance:
- ✅ Indexes on frequently queried columns
- ✅ GIN index for tag arrays
- ✅ Optimized joins with proper relationships

---

## Testing the Setup

### Test Development Environment:

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Visit**: http://localhost:3000

3. **Create a test account**:
   - Click "Start your 14-day free trial"
   - Use test email: `dev-test@example.com`
   - Create account

4. **Verify dev mode works**:
   - Log in with test account
   - Click "🔧 Dev Mode Quick Login" (should be visible)
   - Enable dev mode
   - Verify you can access app without Stripe

5. **Check Supabase**:
   - Go to Supabase dev project
   - Open **Table Editor** → **profiles**
   - Verify your test account appears

### Test Production Environment:

1. **Visit**: https://voyagriq.com

2. **Verify dev mode is hidden**:
   - Go to login page
   - Confirm NO "🔧 Dev Mode Quick Login" button
   - Confirm dev mode toggle is NOT in account page

3. **Verify authentication**:
   - Try to access `/trips` without login
   - Should redirect to login or Stripe checkout

4. **Check production database**:
   - Go to Supabase production project
   - Verify dev test accounts do NOT appear

---

## Environment Isolation Verification

### ✅ Dev accounts cannot access production:
- Dev accounts are in separate Supabase project
- Production Supabase doesn't know about dev accounts
- Authentication fails if dev user tries production URL

### ✅ Dev mode only works on localhost:
- `isLocalhost` check prevents enabling on production
- Dev mode UI hidden on production domains
- Dev mode localStorage flag ignored on production

### ✅ Separate databases:
- Dev: `fzxbxzzhakzbfrspehpe.supabase.co`
- Prod: `ossvcumgkwsjqrpngkhy.supabase.co`
- No data sharing between environments

---

## File Structure

```
voyagriq-app/
├── .env.local                    # Local dev (gitignored, you create this)
├── .env.development              # Dev template (committed)
├── .env.production.template      # Production template (committed)
├── supabase/
│   ├── schema.sql               # Complete database schema
│   └── migrations/              # Migration files (if needed)
└── DEV-ENVIRONMENT-SETUP.md     # This file
```

---

## Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution**: Make sure `.env.local` exists and has valid keys from dev project

### Issue: Dev mode not appearing on localhost
**Solution**:
1. Check hostname is exactly `localhost` or `127.0.0.1`
2. Clear browser cache/localStorage
3. Restart dev server

### Issue: Can't log in on localhost
**Solution**:
1. Check `.env.local` has correct dev Supabase URL
2. Verify dev project has schema applied
3. Check browser console for errors

### Issue: Dev account appears in production
**Solution**:
1. This should NOT happen with separate projects
2. Verify Vercel uses production Supabase URL
3. Check account in Supabase - might be in wrong project

---

## Security Checklist

- [ ] Dev Supabase project has schema applied
- [ ] Local `.env.local` uses dev Supabase URL
- [ ] Vercel production vars use production Supabase URL
- [ ] Dev mode UI hidden on production
- [ ] Test account created in dev doesn't appear in prod
- [ ] Production login requires Stripe (no bypass)
- [ ] Service role keys kept secret (not in git)

---

## Next Steps

### Immediate:
1. ✅ Get dev Supabase anon and service role keys
2. ✅ Run schema.sql in dev Supabase project
3. ✅ Update `.env.development` with real keys
4. ✅ Copy to `.env.local`
5. ⏳ Test dev environment
6. ⏳ Test production environment
7. ⏳ Verify isolation

### Future:
- Consider setting up staging environment
- Implement data migration tools (dev → prod if needed)
- Set up CI/CD to prevent dev keys in production
- Add environment detection logging

---

## Environment Variables Reference

### Required in DEVELOPMENT (.env.local):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://fzxbxzzhakzbfrspehpe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[dev anon key]
SUPABASE_SERVICE_ROLE_KEY=[dev service role key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[test publishable key]
STRIPE_SECRET_KEY=[test secret key]
```

### Required in PRODUCTION (Vercel):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ossvcumgkwsjqrpngkhy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[prod anon key]
SUPABASE_SERVICE_ROLE_KEY=[prod service role key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[live publishable key]
STRIPE_SECRET_KEY=[live secret key]
```

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify environment variables are loaded
4. Test with fresh browser session (incognito)

---

**Status**: 🚧 Awaiting completion of Step 1 (get dev Supabase keys)
**Next Action**: User needs to provide dev Supabase anon and service role keys
