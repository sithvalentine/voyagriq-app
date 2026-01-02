# Supabase Authentication Setup - VoyagrIQ

## Overview

We've implemented **real Supabase authentication** to replace the localStorage-based demo system. This provides secure, production-ready user authentication with email/password login and automatic profile management.

---

## What Was Implemented

### 1. **AuthContext** ([contexts/AuthContext.tsx](contexts/AuthContext.tsx))
- Manages Supabase authentication state
- Provides auth functions: `signUp`, `signIn`, `signOut`, `resetPassword`
- Listens for auth state changes automatically
- Returns `user`, `session`, and `loading` state

### 2. **Login Page** ([app/login/page.tsx](app/login/page.tsx))
- Updated to use Supabase authentication
- Shows error messages for failed login attempts
- Redirects to `/trips` on successful login
- Includes loading state during authentication

### 3. **Register Page** ([app/register/page.tsx](app/register/page.tsx))
- Updated to use Supabase authentication
- Creates user account with email verification
- Shows success message and redirects to login
- Button text updated to "Start 14-Day Free Trial"

### 4. **TierContext** ([contexts/TierContext.tsx](contexts/TierContext.tsx))
- Now fetches user profile data from Supabase `profiles` table
- Automatically loads subscription tier, trial dates, and user info
- Updates tier in database when changed
- No more localStorage for user data (only devMode setting)

### 5. **RequireAuth Component** ([components/RequireAuth.tsx](components/RequireAuth.tsx))
- Updated to use Supabase Auth instead of TierContext
- Checks `user` object from AuthContext
- Redirects non-authenticated users to homepage

### 6. **Provider Setup** ([components/Providers.tsx](components/Providers.tsx))
- Added AuthProvider as the outermost provider
- Order: `AuthProvider` → `TierProvider` → `CurrencyProvider`
- This ensures auth state is available to all components

### 7. **Auth Callback Route** ([app/auth/callback/route.ts](app/auth/callback/route.ts))
- Handles email verification redirects from Supabase
- Exchanges verification code for session
- Redirects to `/trips` after verification

---

## How It Works

### User Registration Flow

1. User fills out registration form at `/register`
2. `AuthContext.signUp()` creates account in Supabase Auth
3. Database trigger automatically creates profile in `profiles` table:
   ```sql
   -- Trigger in supabase/schema.sql creates profile on signup
   CREATE TRIGGER create_profile_for_new_user
   AFTER INSERT ON auth.users
   FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();
   ```
4. User receives email verification link
5. Clicking link redirects to `/auth/callback` which verifies the account
6. User is redirected to `/trips` and can start using the app

### User Login Flow

1. User enters email/password at `/login`
2. `AuthContext.signIn()` authenticates with Supabase
3. On success, redirects to `/trips`
4. `TierContext` automatically loads user profile from database
5. User's subscription tier, trial dates, and settings are restored

### Profile Data Loading

When a user signs in, `TierContext` automatically:
1. Detects auth state change via `useAuth()`
2. Fetches profile from `profiles` table using user ID
3. Updates local state with:
   - Subscription tier (`starter`, `standard`, or `premium`)
   - Trial start/end dates
   - Full name and email
   - Subscription status (trial or active)

### Protected Routes

Pages like `/trips`, `/settings`, etc. use the `RequireAuth` component:

```tsx
export default function TripsPage() {
  return (
    <RequireAuth>
      {/* Your protected content */}
    </RequireAuth>
  );
}
```

Or check auth state directly:

```tsx
const { user, loading } = useAuth();
const { currentTier, isTrialExpired } = useTier();

if (!user) {
  // Not logged in - redirect or show message
}
```

---

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Database Schema

The `profiles` table stores user subscription data:

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'starter',
  subscription_status TEXT DEFAULT 'trial',
  trial_start_date TIMESTAMPTZ DEFAULT NOW(),
  trial_end_date TIMESTAMPTZ,
  -- More fields...
);
```

---

## Testing the Authentication

### Test 1: Register New Account

1. Visit `http://localhost:3000/register`
2. Fill out form with valid email and password
3. Click "Start 14-Day Free Trial"
4. Check your email for verification link
5. Click verification link
6. Should redirect to `/trips` logged in

### Test 2: Login with Existing Account

1. Visit `http://localhost:3000/login`
2. Enter email/password
3. Click "Sign In"
4. Should redirect to `/trips` logged in
5. Check that your profile data is loaded (name, tier, trial status)

### Test 3: Protected Routes

1. While logged out, try to visit `/trips`
2. Should auto-redirect to homepage `/`
3. After login, `/trips` should be accessible

### Test 4: Logout

1. Click logout button in navigation
2. Should redirect to homepage
3. Try to access `/trips` again - should redirect to `/`

---

## Key Differences from Old System

| Feature | Old (localStorage) | New (Supabase Auth) |
|---------|-------------------|---------------------|
| **Authentication** | Fake (always succeeds) | Real Supabase Auth |
| **User Data** | Stored in localStorage | Stored in Supabase database |
| **Email Verification** | None | Required via Supabase |
| **Session Management** | Manual localStorage | Automatic via Supabase SDK |
| **Security** | Client-side only | Server-validated tokens |
| **Password Reset** | Not available | Available via `resetPassword()` |
| **Multi-device** | No | Yes (sessions sync across devices) |

---

## Next Steps

### 1. Enable Email Confirmation (Optional)

In Supabase Dashboard:
1. Go to **Authentication → Email Auth**
2. Toggle "Enable email confirmations"
3. Users must verify email before logging in

### 2. Customize Email Templates

In Supabase Dashboard:
1. Go to **Authentication → Email Templates**
2. Customize:
   - Confirmation email
   - Password reset email
   - Magic link email

### 3. Add OAuth Providers (Optional)

Enable Google, GitHub, or other OAuth providers:
1. Go to **Authentication → Providers**
2. Enable desired providers
3. Add OAuth credentials
4. Update `AuthContext` to support social login:
   ```ts
   const signInWithGoogle = async () => {
     await supabase.auth.signInWithOAuth({ provider: 'google' });
   };
   ```

### 4. Implement Password Reset

Create `/forgot-password` page:
```tsx
const { resetPassword } = useAuth();
await resetPassword(email); // Sends reset email
```

Create `/reset-password` page to handle the reset token.

### 5. Add Row Level Security (RLS) Policies

The schema already includes RLS policies for security:
- Users can only read their own profile
- Users can only update their own profile
- Users can only see their own trips, tags, team members, etc.

---

## Troubleshooting

### Error: "useAuth must be used within an AuthProvider"

**Cause**: Component trying to use `useAuth()` before `AuthProvider` is mounted.

**Fix**: Ensure `<AuthProvider>` wraps all components in `Providers.tsx`:
```tsx
<AuthProvider>
  <TierProvider>
    <CurrencyProvider>
      {children}
    </CurrencyProvider>
  </TierProvider>
</AuthProvider>
```

**If error persists**: Restart the dev server to clear cache:
```bash
# Kill all dev servers
pkill -f "next dev"

# Restart
cd trip-cost-insights
npm run dev
```

### Error: "Invalid login credentials"

- Check that email is verified (check email inbox)
- Verify correct password
- Check Supabase Dashboard → Authentication → Users to see user status

### Profile not loading after login

- Check browser console for errors
- Verify `profiles` table exists in Supabase
- Check that trigger `create_profile_for_new_user` exists
- Manually check profile exists: `SELECT * FROM profiles WHERE email = 'your-email';`

---

## Files Changed

- ✅ `contexts/AuthContext.tsx` - Created
- ✅ `contexts/TierContext.tsx` - Updated to use Supabase
- ✅ `app/login/page.tsx` - Updated to use Supabase Auth
- ✅ `app/register/page.tsx` - Updated to use Supabase Auth
- ✅ `app/auth/callback/route.ts` - Created for email verification
- ✅ `components/RequireAuth.tsx` - Updated to use Supabase Auth
- ✅ `components/Providers.tsx` - Added AuthProvider

---

## Status

✅ **COMPLETE** - Supabase authentication is fully implemented and ready for testing!

**Next Task**: Test the authentication flow end-to-end and verify everything works.
