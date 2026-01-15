# Resend Email Setup - VoyagrIQ

Complete guide to setting up automated post-purchase and renewal emails using Resend.

---

## What You'll Get

✅ **Post-Purchase Welcome Email** - Sent immediately after successful payment
✅ **Renewal Confirmation Email** - Sent on monthly/annual subscription renewals
✅ **Professional branded emails** from `noreply@voyagriq.com`
✅ **Includes value proposition** and support contact (james@voyagriq.com)

---

## Quick Setup (5 minutes)

### Step 1: Sign Up for Resend

1. Go to [resend.com](https://resend.com)
2. Click "Get Started"
3. Sign up with your email
4. Verify your email address

**Pricing**: 3,000 emails/month FREE (100/day limit)

---

### Step 2: Get Your API Key

1. Log in to Resend dashboard
2. Go to **API Keys** (left sidebar)
3. Click "Create API Key"
4. Name: `VoyagrIQ Production`
5. Permission: **Full Access** (recommended) or **Sending access** (minimum)
6. Click "Create"
7. **Copy the API key** - starts with `re_`

⚠️ **Important**: Save this key immediately - you can't view it again!

---

### Step 3: Verify Your Domain

To send emails from `@voyagriq.com`, you need to verify your domain:

1. In Resend dashboard, go to **Domains** (left sidebar)
2. Click "Add Domain"
3. Enter: `voyagriq.com`
4. Click "Add"

Resend will show you DNS records to add.

---

### Step 4: Add DNS Records to Vercel

Resend will give you **3 DNS records** to add. Here's how to add them in Vercel:

**In Vercel Dashboard:**
1. Go to your VoyagrIQ project
2. Settings → Domains
3. Click on `voyagriq.com`
4. Scroll to "DNS Records"
5. For each record from Resend, click "Add Record":

**Typical records you'll add:**
```
Type: TXT
Name: _resend
Value: resend-verify=xxxxxxxxxx

Type: MX
Name: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10

Type: TXT
Name: @
Value: v=spf1 include:amazonses.com ~all
```

**Important**:
- Copy values exactly as shown in Resend
- Leave "Priority" blank unless it's an MX record
- Wait 5-10 minutes for DNS propagation

---

### Step 5: Verify Domain in Resend

1. Go back to Resend → Domains
2. Click "Verify" next to `voyagriq.com`
3. Wait 30-60 seconds
4. If it fails, wait 5 minutes and try again

✅ **Success**: You'll see a green checkmark when verified

---

### Step 6: Add API Key to Vercel

**In Vercel Dashboard:**
1. Your Project → Settings → Environment Variables
2. Click "Add New"
3. Fill in:
   - **Key**: `RESEND_API_KEY`
   - **Value**: `re_your_key_here` (paste the key from Step 2)
   - **Environment**: Select all (Production, Preview, Development)
4. Click "Save"

**Also add to local development:**
```bash
cd /Users/james/claude/voyagriq-app
echo "RESEND_API_KEY=re_your_key_here" >> .env.local
```

---

### Step 7: Deploy to Production

The email system is already implemented in your code. Just deploy:

```bash
git add .
git commit -m "Add Resend email integration for post-purchase and renewal emails"
git push origin main
```

Vercel will automatically deploy with the new environment variable.

---

## How It Works

### When Emails Are Sent:

**1. Post-Purchase Welcome Email**
- **Trigger**: Immediately after successful payment
- **Event**: `checkout.session.completed` webhook from Stripe
- **Includes**:
  - Welcome message
  - How VoyagrIQ helps their business
  - Quick start guide
  - Support email: james@voyagriq.com

**2. Renewal Confirmation Email**
- **Trigger**: When subscription renews (monthly or annual)
- **Event**: `invoice.payment_succeeded` webhook from Stripe (with `billing_reason: 'subscription_cycle'`)
- **Includes**:
  - Renewal confirmation
  - Amount charged
  - Subscription details
  - Support email: james@voyagriq.com

### Email Flow:

```
Customer subscribes → Stripe processes payment → Stripe webhook fires
→ Your webhook handler updates database → Sends email via Resend
→ Customer receives email in 1-2 seconds
```

---

## Testing the Email System

### Test in Development:

1. Make sure you have API key in `.env.local`
2. Use Stripe test mode
3. Complete a test purchase
4. Check your webhook logs: `vercel logs --follow`
5. Look for: `[stripe-webhook] Sending welcome email to: ...`

### Test in Production:

Use Stripe test mode in production:
1. Create a test subscription at `voyagriq.com/pricing`
2. Use test card: `4242 4242 4242 4242`
3. Check the email address you used during signup
4. Should receive welcome email within 1-2 seconds

### Check Email Logs:

In Resend dashboard:
1. Go to **Emails** (left sidebar)
2. See all sent emails with delivery status
3. Click any email to see:
   - Delivered / Bounced / Opened
   - Full email preview
   - Delivery timeline

---

## Email Templates

### Welcome Email Includes:

- Gradient header with "Welcome to VoyagrIQ!"
- Thank you message with their tier name
- **"How VoyagrIQ Helps Your Business"** section:
  - Save Time
  - Increase Accuracy
  - Gain Insights
  - Professional Reports
  - Scale Efficiently
- "Get Started" button linking to /trips
- Pro tip about CSV bulk import
- **Support section** with james@voyagriq.com
- Footer with subscription details

### Renewal Email Includes:

- "Subscription Renewed ✓" header
- Confirmation message
- Payment details table (plan, billing, amount)
- "Payment Successful" badge
- Benefits reminder
- **Support section** with james@voyagriq.com
- Links to account management and trips

---

## Customization

### Change Email Content:

Edit the email templates in:
```
/Users/james/claude/voyagriq-app/lib/email.ts
```

Functions:
- `sendPurchaseWelcomeEmail()` - Welcome email template
- `sendRenewalEmail()` - Renewal email template

### Change Sender Email:

In `lib/email.ts`, line 11:
```typescript
from?: string = 'VoyagrIQ <noreply@voyagriq.com>'
```

Change to any verified email address.

### Add More Email Types:

You can add more email functions in `lib/email.ts`:
- Trial expiration warnings
- Feature announcements
- Usage reports
- Payment failure notifications

---

## Troubleshooting

### "Domain not verified"
- Wait 10 minutes for DNS propagation
- Check DNS records in Vercel match Resend exactly
- Try "Verify" button in Resend again

### "API key invalid"
- Make sure you copied the full key (starts with `re_`)
- Check it's saved in Vercel environment variables
- Redeploy after adding the key

### Email not sent
- Check Vercel logs: `vercel logs --follow`
- Look for errors in webhook processing
- Verify Resend API key is set
- Check Resend dashboard → Emails for delivery status

### Email goes to spam
- Make sure domain is verified in Resend
- All 3 DNS records must be added correctly
- SPF and DKIM records properly configured
- First few emails might go to spam until reputation builds

### Customer didn't receive email
1. Check Resend dashboard → Emails
2. Find the email by recipient address
3. Check delivery status:
   - **Delivered**: Email reached their server (check spam folder)
   - **Bounced**: Invalid email address
   - **Pending**: Still being delivered

---

## Monitoring

### Check Email Delivery:

**Resend Dashboard**:
- Real-time delivery status
- Open rates (if tracking enabled)
- Bounce rates
- Email previews

**Vercel Logs**:
```bash
vercel logs --follow
```
Look for:
```
[stripe-webhook] Sending welcome email to: customer@example.com
✅ Email sent successfully: { to: 'customer@example.com', subject: '...', id: 're_xxxxx' }
```

### Email Metrics:

Track in Resend dashboard:
- Total emails sent
- Delivery rate
- Bounce rate
- Open rate (optional)
- Click rate (optional)

---

## Rate Limits

**Free Tier**:
- 3,000 emails/month
- 100 emails/day
- Perfect for starting out

**If you exceed limits**:
- Emails will queue or fail
- Upgrade to paid plan:
  - **Starter**: $20/month for 50k emails
  - **Pro**: $80/month for 250k emails

**Current usage**: With welcome + renewal emails, you can support:
- ~1,500 customers/month (2 emails each)
- Should upgrade when reaching 1,000+ active subscribers

---

## Security Best Practices

✅ **Do**:
- Keep API key in environment variables only
- Never commit API key to git
- Use separate API keys for dev/production
- Monitor Resend dashboard for suspicious activity
- Enable 2FA on Resend account

❌ **Don't**:
- Share API keys
- Commit keys to version control
- Use production keys in development
- Send marketing emails without consent
- Include sensitive data in emails

---

## Production Checklist

Before going live, verify:

- [ ] Resend account created
- [ ] Domain `voyagriq.com` verified in Resend
- [ ] All 3 DNS records added to Vercel
- [ ] API key added to Vercel environment variables
- [ ] Test email sent successfully
- [ ] Welcome email template reviewed
- [ ] Renewal email template reviewed
- [ ] Support email (james@voyagriq.com) is correct
- [ ] Deployed to production
- [ ] Test purchase completed successfully
- [ ] Received welcome email in inbox

---

## Cost Breakdown

**Resend Pricing**:
- **Free**: 3,000 emails/month ($0)
- **Starter**: 50k emails/month ($20)
- **Pro**: 250k emails/month ($80)

**Estimated Costs by Customer Count**:
- 0-1,500 customers/month: FREE
- 1,500-25,000 customers/month: $20/month
- 25,000+ customers/month: $80/month

**ROI**:
- Professional branded emails
- Automated customer onboarding
- Reduced support requests (clear instructions in email)
- Better customer retention (renewal confirmations)

---

## Alternative Email Services

If you prefer a different service:

**Alternatives to Resend**:
1. **SendGrid** - 100 emails/day free
2. **Postmark** - 100 emails/month free
3. **AWS SES** - Very cheap but complex setup
4. **Mailgun** - 5k emails/month free (first 3 months)

To switch providers, update `lib/email.ts` with new SDK.

---

## Support

**Setup Issues?**
Email: james@voyagriq.com

**Resend Support**:
- Docs: [resend.com/docs](https://resend.com/docs)
- Support: [resend.com/support](https://resend.com/support)
- Status: [status.resend.com](https://status.resend.com)

---

**Setup Complete! 🎉**

Your customers will now receive:
1. Welcome email immediately after purchase
2. Renewal confirmation on each billing cycle
3. Clear support contact for any issues

This creates a better customer experience and reduces support burden.
