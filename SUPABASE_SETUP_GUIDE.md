# Supabase Setup Guide for VoyagrIQ

This guide will help you connect your VoyagrIQ application to Supabase for production-ready data storage and authentication.

---

## Step 1: Get Your Supabase Credentials

1. **Go to your Supabase project dashboard**: https://app.supabase.com/projects
2. **Select your project** (or create a new one)
3. **Go to Project Settings** → **API**
4. **Copy the following values**:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbGc...`)
   - **service_role key** (starts with `eyJhbGc...`) - Keep this secret!

---

## Step 2: Configure Environment Variables

1. **Open the `.env.local` file** in the project root
2. **Replace the placeholder values** with your actual Supabase credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Save the file**

⚠️ **IMPORTANT**: Never commit `.env.local` to Git. It's already in `.gitignore`.

---

## Step 3: Create the Database Schema

1. **Go to your Supabase project** → **SQL Editor**
   - URL: https://app.supabase.com/project/YOUR_PROJECT_ID/sql
2. **Click "New Query"**
3. **Copy the entire contents** of `supabase/schema.sql`
4. **Paste into the SQL Editor**
5. **Click "Run"** (or press Cmd/Ctrl + Enter)

You should see: ✅ Success. No rows returned

This creates:
- ✅ User profiles table
- ✅ Trips table with all cost fields
- ✅ Tags table (Premium feature)
- ✅ Team members table (Standard+ feature)
- ✅ White-label settings table (Premium feature)
- ✅ API keys table (Premium feature)
- ✅ Scheduled reports table (Standard+ feature)
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Automatic triggers (e.g., profile creation on signup)

---

## Step 4: Configure Authentication

1. **Go to Authentication** → **Providers** in Supabase
2. **Enable Email provider** (already enabled by default)
3. **Configure Email Templates** (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize: Confirm Signup, Magic Link, Reset Password, etc.
4. **Set Site URL** (for email redirects):
   - Go to **Authentication** → **URL Configuration**
   - Site URL: `http://localhost:3000` (development)
   - For production: `https://yourdomain.com`

---

## Step 5: Test the Connection

1. **Restart your Next.js development server**:
   ```bash
   npm run dev
   ```

2. **Test database connection** by creating a simple test:
   - Go to http://localhost:3000
   - Try to sign up with a new account
   - Check Supabase dashboard → **Authentication** → **Users** to see if user was created
   - Check **Table Editor** → **profiles** to see if profile was auto-created

---

## Step 6: Migrate Existing Data (Optional)

If you have existing data in localStorage that you want to keep:

### Option A: Manual Export/Import
1. Export data from current app (CSV)
2. Import via Supabase Table Editor

### Option B: Migration Script (Advanced)
Create a migration script to read localStorage and insert into Supabase.

---

## Database Schema Overview

### Tables Created

| Table | Purpose | Tier Restriction |
|-------|---------|------------------|
| `profiles` | User accounts and subscription info | All |
| `trips` | Trip data with costs and analytics | All |
| `tags` | Custom trip tags | Premium |
| `team_members` | Team collaboration | Standard+ |
| `white_label_settings` | Custom branding for PDFs | Premium |
| `api_keys` | API authentication tokens | Premium |
| `scheduled_reports` | Automated report emails | Standard+ |

### Key Features

✅ **Row Level Security (RLS)**: Users can only access their own data
✅ **Automatic Timestamps**: `created_at` and `updated_at` auto-managed
✅ **UUID Primary Keys**: Better than auto-increment for distributed systems
✅ **Stored Costs in Cents**: Avoids floating-point precision issues
✅ **Generated Columns**: `trip_total_cost` auto-calculated
✅ **JSONB for Flexibility**: `custom_fields` for Premium users
✅ **Array Fields**: `tags` array for trip categorization
✅ **Foreign Keys**: Maintain data integrity with cascading deletes

---

## Environment Variables for Production

When deploying to Vercel/production, add these environment variables:

```bash
# Supabase (same as local)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (keep secret!)

# Production URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Stripe (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (SendGrid or AWS SES)
SENDGRID_API_KEY=SG...
EMAIL_FROM=noreply@voyagriq.com
```

---

## Verifying Setup

### Check Database Connection
```typescript
// Test in any component
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.from('trips').select('*').limit(1);
console.log('Connection test:', { data, error });
```

### Check Authentication
```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

---

## Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution**: Make sure `.env.local` exists and has the correct values. Restart dev server.

### Issue: "relation 'public.profiles' does not exist"
**Solution**: Run the schema.sql script in Supabase SQL Editor.

### Issue: "row-level security policy violation"
**Solution**: Make sure RLS policies are created. Check if user is authenticated.

### Issue: "Failed to fetch"
**Solution**: Check NEXT_PUBLIC_SUPABASE_URL is correct and starts with `https://`.

---

## Next Steps

After Supabase is connected:

1. ✅ **Implement Authentication Pages**
   - Sign up, login, password reset
   - Replace mock authentication

2. ✅ **Update Trip Management**
   - Fetch trips from Supabase instead of localStorage
   - Real-time updates with Supabase subscriptions

3. ✅ **Migrate localStorage Data**
   - Team members, tags, white-label settings

4. ✅ **Add Stripe Integration**
   - Subscription payments
   - Webhook handling

5. ✅ **Deploy to Production**
   - Vercel deployment
   - Configure production environment variables

---

## Useful Supabase Resources

- 📖 [Supabase Documentation](https://supabase.com/docs)
- 🔐 [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- 🔑 [Authentication Guide](https://supabase.com/docs/guides/auth)
- 📊 [Database Functions](https://supabase.com/docs/guides/database/functions)
- 🚀 [Next.js Integration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

## Support

If you encounter issues:
1. Check Supabase project logs: **Logs** → **Database** or **Auth**
2. Verify environment variables are loaded: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`
3. Check browser console for errors
4. Review Supabase documentation

---

**You're now ready to use Supabase with VoyagrIQ!** 🚀
