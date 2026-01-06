# Payment Failure Debugging Guide

**Status**: Payment attempt is failing on staging

---

## 🔍 WHERE IS IT FAILING?

Please tell me at which step the failure occurs:

### Step 1: Registration Form
- [ ] Can you fill out the registration form?
- [ ] Can you click "Subscribe to Premium Annual"?
- Error message: _______________

### Step 2: Redirect to Stripe
- [ ] Does it redirect to Stripe Checkout?
- [ ] Or does it show an error before redirecting?
- Error message: _______________

### Step 3: Stripe Checkout Page
- [ ] Can you enter payment details?
- [ ] What happens when you click "Pay"?
- Error message: _______________

### Step 4: Redirect Back
- [ ] Does it redirect back to your app?
- [ ] Does it show success or error page?
- Error message: _______________

---

## 🔎 CHECK 1: Browser Console

1. Open browser console (F12 → Console tab)
2. Try the payment again
3. Look for error messages (red text)
4. Copy any errors you see here: _______________

---

## 🔎 CHECK 2: Vercel Runtime Logs

1. Go to: https://vercel.com/james-burns-projects-286e4ef4/voyagriq-app
2. Click **Logs** tab
3. Filter by your staging deployment
4. Try the payment again
5. Look for logs containing:
   - `[create-checkout]` - Shows if checkout session creation failed
   - `ERROR` or `⚠️` - Shows actual error
6. Copy the error here: _______________

---

## 🔎 CHECK 3: Environment Variables Loaded

Visit this URL to see what's actually loaded in staging:
```
https://voyagriq-app-git-staging-james-burns-projects-286e4ef4.vercel.app/api/check-env
```

**Expected to see:**
```json
{
  "stripe_prices_annual": {
    "STRIPE_PRICE_STARTER_ANNUAL": "✅ price_1Sm2iUCmKbjtfkiOOoFqDwKA",
    "STRIPE_PRICE_STANDARD_ANNUAL": "✅ price_1Sm2iVCmKbjtfkiOgbQMvA0i",
    "STRIPE_PRICE_PREMIUM_ANNUAL": "✅ price_1Sm2iWCmKbjtfkiOxejT0ihi"
  },
  "summary": {
    "status": "✅ All required vars set"
  }
}
```

**If any show "❌ Missing"**, that's the problem!

---

## 🔎 CHECK 4: Network Tab

1. Open browser DevTools (F12 → Network tab)
2. Try the payment again
3. Look for the request to `/api/stripe/create-checkout`
4. Click on it → Response tab
5. What does the response say? _______________

---

## 🚨 COMMON ERRORS & SOLUTIONS

### Error: "No such price: undefined"
**Cause**: Annual price ID not set in Vercel
**Solution**: Add `STRIPE_PRICE_PREMIUM_ANNUAL` to Vercel env vars

### Error: "Price ID not configured for tier: premium"
**Cause**: Price ID is empty string or missing
**Solution**: Verify price ID is set correctly in Vercel

### Error: "Missing tier" or "Invalid tier"
**Cause**: Something wrong with the registration form submission
**Solution**: Check browser console for JavaScript errors

### Error: "User profile not found. Please try again in a moment."
**Cause**: Profile wasn't created yet (timing issue)
**Solution**: The code has retry logic, but if it fails after 10 retries, there's a profile trigger issue

### Error: "Webhook signature verification failed"
**Cause**: Wrong webhook secret (only affects post-payment, not the payment itself)
**Solution**: Update webhook secret in Vercel

### Error: "Rate limit exceeded"
**Cause**: Too many attempts from same IP
**Solution**: Wait 15 minutes or test from different IP

---

## 🧪 TEST LOCALLY FIRST

Let's verify it works locally before debugging staging:

```bash
cd /Users/james/claude/voyagriq-app
npm run dev
```

Then visit:
```
http://localhost:3000/register?tier=premium&interval=annual
```

Try the payment flow locally:
- Does it work locally? (Yes/No): _______________
- If no, same error as staging? (Yes/No): _______________

---

## 📋 INFORMATION I NEED

To help debug, please provide:

1. **Exact error message** (from browser or Vercel logs)
2. **Which step fails** (form submission / redirect / payment / return)
3. **Check-env output** (from the URL above)
4. **Does it work locally?** (Yes/No)
5. **Screenshot** (if possible)

With this information, I can pinpoint the exact issue!
