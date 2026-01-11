# 🚨 CRITICAL: Production Database Cleanup Required

**Date**: January 8, 2026
**Status**: ⚠️ **ACTION REQUIRED**
**Severity**: **HIGH** - Blocks production launch

---

## Issue Discovered

**Production database contains 50 test accounts** from before environment separation was implemented.

### Problem:
- ❌ Test accounts can log into production
- ❌ `james@mintgoldwyn.com` and variations exist in production
- ❌ `test+` email accounts polluting production
- ❌ Defeats the purpose of dev/prod separation
- ❌ Could confuse real customers vs test accounts

### Impact:
- Test data mixed with production
- Unclear which accounts are real vs test
- Password reset attempts may fail (account doesn't exist in prod properly)
- Environment separation incomplete

---

## Verified Test Accounts in Production (50 total)

```
test+test12@example.com
test+test11@example.com
test+test10@example.com
test+test9@example.com
test+test8@example.com
test+test7@example.com
test+test6@example.com
test+test4@example.com
test+premium1@example.com
test+test11@test.com
test+test10@test.com
test+test9@test.com
test+test7@test.com
test+test6@test.com
test+test5@test.com
test+test4@test.com
test+test3@test.com
test+test2@test.com
test+test1@test.com
test@example.com
james+twentyone@mintgoldwyn.com
officialgalaxybeyond+test1@gmail.com
james+twenty@mintgoldwyn.com
james+nineteen@mintgoldwyn.com
james+one@mintgoldwyn.com
james+eighteen@mintgoldwyn.com
james+seventeen@mintgoldwyn.com
james+sixteen@mintgoldwyn.com
james+fifteen@mintgoldwyn.com
james+fourteen@mintgoldwyn.com
james+thirteen@mintgoldwyn.com
james+testtwelve@mintgoldwyn.com
james+testeleven@mintgoldwyn.com
james+testten@mintgoldwyn.com
james+eight@mintgoldwyn.com
james+seven@mintgoldwyn.com
james+six@mintgoldwyn.com
james+five@mintgoldwyn.com
james+four@mintgoldwyn.com
james+three@mintgoldwyn.com
mintgoldwyn@gmail.com
james+two@mintgoldwyn.com
test@test.com
james+testone@mintgoldwyn.com
james+test7@mintgoldwyn.com
james+test6@mintgoldwyn.com
james+test4@mintgoldwyn.com
james+test3@mintgoldwyn.com
james+test2@mintgoldwyn.com
james+test1@mintgoldwyn.com
```

---

## Solution: Clean Production Database

### Option 1: Automated Cleanup Script (Recommended)

**Script**: `scripts/clean-production-test-accounts.js`

#### What it does:
1. Connects to PRODUCTION Supabase
2. Lists all users
3. Identifies test accounts by pattern:
   - `test+*@*`
   - `james+test*@mintgoldwyn.com`
   - `james+*@mintgoldwyn.com` (all variations)
   - `*@test.com`
   - `test@example.com`
4. Shows you what will be deleted
5. Asks for confirmation (twice!)
6. Deletes only test accounts
7. Keeps any real customer accounts

#### How to run:

```bash
cd /Users/james/claude/voyagriq-app

# Review the script first
cat scripts/clean-production-test-accounts.js

# Run the cleanup
node scripts/clean-production-test-accounts.js
```

#### Safety features:
- ✅ Requires double confirmation
- ✅ Shows exactly what will be deleted
- ✅ Protected emails list (add real customers here)
- ✅ Test pattern matching (won't delete real emails)
- ✅ Detailed logging of what was deleted

---

### Option 2: Manual Cleanup (Supabase Dashboard)

If you prefer manual control:

1. **Go to Production Supabase**:
   - https://app.supabase.com/project/ossvcumgkwsjqrpngkhy/auth/users

2. **Delete test accounts manually**:
   - Click on each test account
   - Click "Delete user"
   - Confirm deletion

3. **Verify when done**:
   - Only real customer accounts remain
   - No test@ or james+test accounts

---

### Option 3: Fresh Production Database (Nuclear Option)

If production has no real customers yet:

1. **In Production Supabase**:
   - Go to: https://app.supabase.com/project/ossvcumgkwsjqrpngkhy/auth/users
   - Delete ALL users manually
   - This gives you a completely clean start

2. **Advantage**: Guaranteed clean database
3. **Disadvantage**: Manual work, risk of accidental deletion

---

## After Cleanup

### Verify Production is Clean:

```bash
cd /Users/james/claude/voyagriq-app

# Check production database
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://ossvcumgkwsjqrpngkhy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zc3ZjdW1na3dzanFycG5na2h5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzEwOTg4MiwiZXhwIjoyMDgyNjg1ODgyfQ.k8mb7aZ3FG2VKgIg9fY1-AWw54qiek7Jdpu16M7X1X8'
);
supabase.auth.admin.listUsers().then(({data}) => {
  console.log('Users in PRODUCTION:', data.users.length);
  data.users.forEach(u => console.log(' -', u.email));
});
"
```

Expected result after cleanup:
```
Users in PRODUCTION: 0
```

Or if you have real customers:
```
Users in PRODUCTION: 2
 - realcustomer1@example.com
 - realcustomer2@example.com
```

---

## Future Prevention

### ✅ From Now On:

1. **ALL testing** → Dev database (`fzxbxzzhakzbfrspehpe`)
   - Use localhost with `.env.local`
   - Dev mode enabled
   - Test accounts go here

2. **Production ONLY** → Real customers (`ossvcumgkwsjqrpngkhy`)
   - voyagriq.com
   - Live Stripe payments
   - Real users only

3. **No More Test Accounts in Production**
   - Don't register test accounts on voyagriq.com
   - Use localhost:3000 for all testing
   - Keep environments strictly separated

---

## Impact on Launch

### Before Cleanup:
- ❌ Cannot launch with test data in production
- ❌ Environment separation incomplete
- ❌ Confusion between test vs real accounts
- ❌ Grade: B (incomplete setup)

### After Cleanup:
- ✅ Clean production database
- ✅ Ready for real customers
- ✅ Environment separation complete
- ✅ Grade: A- (production ready)

---

## Recommended Action Plan

### Step 1: Decide Which Cleanup Method
- **Quick**: Use automated script
- **Safe**: Manual deletion in dashboard
- **Nuclear**: Delete all if no real customers

### Step 2: Run Cleanup
- Back up production first (Supabase automatic backups active)
- Run chosen cleanup method
- Verify results

### Step 3: Test Production is Clean
- Try logging in with `james@mintgoldwyn.com` → should fail (account doesn't exist)
- Check Supabase dashboard → 0 users
- Register a new test account on **localhost** → goes to dev DB only

### Step 4: Launch!
- Production is now clean and ready
- Only real customers from this point forward
- Environment separation verified

---

## Important Notes

### ⚠️ What Gets Deleted:
- User accounts (auth.users)
- Associated profiles (profiles table)
- Associated trips (trips table - cascade delete)
- All related data

### ⚠️ What's Preserved:
- Database schema and structure
- RLS policies
- Triggers and functions
- Stripe configuration
- Environment variables

### ⚠️ No Risk To:
- Production infrastructure
- Vercel deployment
- Stripe products/prices
- Domain configuration
- Dev database (completely separate)

---

## Questions & Answers

**Q: Will this affect Vercel or Stripe?**
A: No. Only cleans Supabase user accounts.

**Q: Can I undo this?**
A: No, deletion is permanent. But these are all test accounts anyway.

**Q: What about real customers?**
A: Script is designed to skip real emails. Add any real customers to PROTECTED_EMAILS array.

**Q: Is dev database affected?**
A: No. Dev database is completely separate. This only touches production.

**Q: Do I need to redeploy?**
A: No. This is just database cleanup, no code changes.

---

## Ready to Clean?

### Quick Start:

```bash
# Option 1: Automated (recommended)
cd /Users/james/claude/voyagriq-app
node scripts/clean-production-test-accounts.js

# Option 2: Manual
# Visit: https://app.supabase.com/project/ossvcumgkwsjqrpngkhy/auth/users
# Delete accounts one by one
```

---

**Status**: ⏳ Awaiting cleanup
**Priority**: HIGH - Complete before launch
**Estimated Time**: 5-10 minutes
**Risk**: LOW (only deletes test accounts)

---

**Prepared By**: Claude Code
**Date**: January 8, 2026
**Issue**: Production database contains test accounts
**Solution**: Run cleanup script to remove them
