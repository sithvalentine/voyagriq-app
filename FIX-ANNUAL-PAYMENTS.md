# ✅ FIX FOUND: Add Annual Price IDs to Vercel

## 🎯 Problem Identified

Your **annual price IDs are missing** from Vercel environment variables. The build logs show:

```
annual: { starter: undefined, standard: undefined, premium: undefined }
```

This is why the "Premium Annual" subscription fails!

---

## ✅ Solution: Add These 3 Environment Variables

Go to: https://vercel.com/james-burns-projects-286e4ef4/voyagriq-app/settings/environment-variables

Add these **3 NEW variables**:

### 1. STRIPE_PRICE_STARTER_ANNUAL
- **Name**: `STRIPE_PRICE_STARTER_ANNUAL`
- **Value**: `price_1Sm2iUCmKbjtfkiOOoFqDwKA`
- **Environments**: Check ☑️ **Preview** and ☑️ **Production**

### 2. STRIPE_PRICE_STANDARD_ANNUAL
- **Name**: `STRIPE_PRICE_STANDARD_ANNUAL`
- **Value**: `price_1Sm2iVCmKbjtfkiOgbQMvA0i`
- **Environments**: Check ☑️ **Preview** and ☑️ **Production**

### 3. STRIPE_PRICE_PREMIUM_ANNUAL
- **Name**: `STRIPE_PRICE_PREMIUM_ANNUAL`
- **Value**: `price_1Sm2iWCmKbjtfkiOxejT0ihi`
- **Environments**: Check ☑️ **Preview** and ☑️ **Production**

---

## 🚀 After Adding Variables

### Redeploy Staging

```bash
cd /Users/james/claude/voyagriq-app
git commit --allow-empty -m "Trigger redeploy with annual price IDs"
git push origin staging
```

**OR** use Vercel Dashboard → Deployments → Redeploy (uncheck "Use build cache")

---

## 🧪 Test the Fix

1. Wait for deployment to complete (1-2 minutes)

2. Check env vars are loaded:
   ```
   https://voyagriq-app-git-staging-james-burns-projects-286e4ef4.vercel.app/api/check-env
   ```

   Should now show:
   ```json
   "stripe_prices_annual": {
     "STRIPE_PRICE_STARTER_ANNUAL": "✅ price_1Sm2iUCmKbjtfkiOOoFqDwKA",
     "STRIPE_PRICE_STANDARD_ANNUAL": "✅ price_1Sm2iVCmKbjtfkiOgbQMvA0i",
     "STRIPE_PRICE_PREMIUM_ANNUAL": "✅ price_1Sm2iWCmKbjtfkiOxejT0ihi"
   }
   ```

3. Test annual payment:
   ```
   https://voyagriq-app-git-staging-james-burns-projects-286e4ef4.vercel.app/register?tier=premium&interval=annual
   ```

   - Click "Subscribe to Premium Annual"
   - Should redirect to Stripe Checkout
   - Should show "$2,388.00 USD per year"
   - Complete with test card: `4242 4242 4242 4242`
   - Should activate subscription

---

## 📊 Price Overview

Your Stripe account has these annual prices configured correctly:

| Tier | Price/Year | Price ID |
|------|-----------|----------|
| Starter | $588/year | `price_1Sm2iUCmKbjtfkiOOoFqDwKA` |
| Standard | $1,188/year | `price_1Sm2iVCmKbjtfkiOgbQMvA0i` |
| Premium | $2,388/year | `price_1Sm2iWCmKbjtfkiOxejT0ihi` |

---

## ✅ Summary

**Root Cause**: Missing environment variables in Vercel
**Solution**: Add 3 annual price ID variables
**Time to Fix**: ~2 minutes
**Status**: Ready to deploy!

Once you add these variables and redeploy, annual payments will work! 🎉
