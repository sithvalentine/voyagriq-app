# Account Usage Guide - Dev vs Production

**Date**: January 8, 2026
**Status**: ✅ Environment Separation Complete

---

## Your Accounts After Cleanup

### Production Accounts (voyagriq.com)

These accounts exist in the **production database** and should be used on https://voyagriq.com:

1. **`mintgoldwyn@gmail.com`** - Admin account ✅
2. **`james@mintgoldwyn.com`** - Your primary account ✅
3. **`officialgalaxybeyond@gmail.com`** - Real account ✅
4. **`james.burnsmmm@gmail.com`** - Real account ✅

**These accounts can ONLY log in to production (voyagriq.com)**

---

### Development Accounts (localhost)

The **dev database is currently empty** (0 accounts).

For testing on localhost:3000, you need to **create new accounts** in the dev database.

**Recommended dev accounts to create:**
- `dev@example.com`
- `test@example.com`
- `james+dev@mintgoldwyn.com`
- Any account you want for testing

**These accounts will ONLY exist in dev and can ONLY log in to localhost**

---

## How to Use Each Environment

### For Production (voyagriq.com):

**Use these accounts:**
- Log in with `james@mintgoldwyn.com` or `mintgoldwyn@gmail.com`
- These are your real admin accounts
- Use for: Real customer testing, live payment testing, production checks

**DO NOT create test accounts here!**

---

### For Development (localhost:3000):

**Create new test accounts:**

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Visit: http://localhost:3000/register

3. Create a new account (examples):
   - `dev@example.com`
   - `test@example.com`
   - `james+dev@mintgoldwyn.com`

4. **Enable dev mode** (bypasses Stripe):
   - Click "🔧 Dev Mode Quick Login" button on login page
   - Or go to http://localhost:3000/account and toggle dev mode

**Use for:** All testing, development, trying new features

---

## The Issue You're Seeing

### Problem:
You're trying to register `james@mintgoldwyn.com` on **localhost**, but that account exists in **production**.

### Why It Happens:
Even though you're on localhost (which connects to the **dev database**), you previously had that email in the old shared database. Now:
- Dev database: 0 accounts (clean)
- Production database: 4 accounts (including `james@mintgoldwyn.com`)

### Solution:

**Option 1: Use a Different Email for Dev** (Recommended)
```
Email: james+dev@mintgoldwyn.com
Password: [your password]
```
- This creates a new account in dev database
- Completely separate from production
- Easy to remember it's for dev

**Option 2: Use Generic Test Email**
```
Email: dev@example.com
Password: [your password]
```
- Standard test email
- Clear it's for testing
- Easy to recreate

**Option 3: Remove james@mintgoldwyn.com from Production**
If you don't need that account in production:
- Delete it from production Supabase
- Then you can create it in dev
- **Not recommended** - you lose the production account

---

## Quick Reference

| Environment | URL | Database | Accounts |
|-------------|-----|----------|----------|
| **Production** | https://voyagriq.com | ossvcumgkwsjqrpngkhy | 4 real accounts |
| **Development** | http://localhost:3000 | fzxbxzzhakzbfrspehpe | 0 (create new ones) |

---

## Current Situation

### ✅ What Works:

**Production (voyagriq.com):**
- Log in with `james@mintgoldwyn.com` ✅
- Log in with `mintgoldwyn@gmail.com` ✅
- Real Stripe payments ✅
- 4 real accounts only ✅

**Development (localhost:3000):**
- Create new test accounts ✅
- Dev mode bypasses Stripe ✅
- Completely isolated from production ✅
- 0 accounts (fresh start) ✅

### ❌ What Doesn't Work:

**You CANNOT:**
- Use `james@mintgoldwyn.com` on localhost (it's in production DB)
- Use production accounts on localhost
- Use dev accounts on voyagriq.com
- Mix environments

---

## Recommended Dev Workflow

### Step 1: Create Your Dev Account
```bash
# Start dev server
npm run dev

# Visit localhost
open http://localhost:3000/register

# Register with dev email
Email: james+dev@mintgoldwyn.com
Password: [same as production for convenience]
```

### Step 2: Enable Dev Mode
```bash
# After registration, go to account page
open http://localhost:3000/account

# Toggle "Development Mode" ON
# This bypasses Stripe payments for testing
```

### Step 3: Test Features
```bash
# Create test trips
# Export reports
# Test all features
# Break things - it's dev!
```

### Step 4: Check Production
```bash
# When ready to verify production
open https://voyagriq.com

# Log in with james@mintgoldwyn.com
# Verify features work
# Test real payment flow (with real card)
```

---

## Email Naming Conventions

### Good Dev Email Patterns:

✅ `yourname+dev@domain.com` - Clear it's for dev
✅ `yourname+test@domain.com` - Clear it's for testing
✅ `dev@example.com` - Generic dev email
✅ `test@example.com` - Generic test email
✅ `yourname+[feature]@domain.com` - Feature-specific testing

### Bad Dev Email Patterns:

❌ `yourname@domain.com` - Too similar to production
❌ Real customer emails - Never use real emails in dev
❌ Production admin emails - Keep these separate

---

## Troubleshooting

### Error: "A user with this email address has already been registered"

**Cause:** That email exists in production database

**Solution:**
1. Check which environment you're on
   - localhost:3000 → Dev database
   - voyagriq.com → Production database
2. If on localhost, use a different email (e.g., add `+dev`)
3. If on voyagriq.com and it's your account, just log in!

### Error: "Invalid login credentials"

**Cause:** Account doesn't exist in that environment's database

**Solution:**
1. Check which environment you're on
2. If localhost, create the account first
3. If voyagriq.com, make sure you have a production account

### Dev Mode Not Showing

**Cause:** You're on production (voyagriq.com)

**Solution:**
- Dev mode ONLY works on localhost
- This is by design for security
- Use http://localhost:3000 for dev mode

---

## Summary

### ✅ For Testing → Use Localhost
- Create: `james+dev@mintgoldwyn.com`
- Database: Dev (fzxbxzzhakzbfrspehpe)
- Stripe: Bypassed with dev mode
- Break things: It's OK!

### ✅ For Production → Use voyagriq.com
- Use: `james@mintgoldwyn.com`
- Database: Production (ossvcumgkwsjqrpngkhy)
- Stripe: Real payments (live mode)
- Be careful: Real customers here!

---

## Next Steps

1. **Create Dev Account**:
   ```
   http://localhost:3000/register
   Email: james+dev@mintgoldwyn.com
   ```

2. **Enable Dev Mode**:
   ```
   http://localhost:3000/account
   Toggle "Development Mode" ON
   ```

3. **Test Everything**:
   ```
   - Create trips
   - Export reports
   - Test features
   - Find bugs
   ```

4. **Verify Production**:
   ```
   https://voyagriq.com
   Login: james@mintgoldwyn.com
   Test: Real payment flow
   ```

---

**Prepared By**: Claude Code
**Date**: January 8, 2026
**Purpose**: Clarify which accounts to use where
**Status**: ✅ Environment separation complete
