# SendGrid Branded Email Setup - VoyagrIQ

**Goal**: Send emails from `@voyagriq.com` addresses (noreply, support, etc.)

---

## Quick Setup Checklist

- [ ] Sign up for SendGrid (free tier)
- [ ] Get API key and add to Vercel
- [ ] Verify domain in SendGrid
- [ ] Add DNS records to Vercel
- [ ] Verify sender email
- [ ] Test email sending
- [ ] Configure Supabase SMTP (optional)

---

## Step 1: Sign Up for SendGrid

1. Go to [sendgrid.com](https://sendgrid.com)
2. Click "Try for Free"
3. Sign up with your email
4. Verify your email

**Free Tier**: 100 emails/day forever (enough to start)

---

## Step 2: Get API Key

**In SendGrid Dashboard:**
1. Settings → API Keys
2. Create API Key
3. Name: `VoyagrIQ Production`
4. Permission: **Full Access**
5. Copy key (starts with `SG.`)

**Save this key** - you can't view it again!

---

## Step 3: Add to Vercel Environment Variables

**In Vercel Dashboard:**
1. Your Project → Settings → Environment Variables
2. Add new:
   - **Key**: `SENDGRID_API_KEY`
   - **Value**: `SG.your_key_here`
   - **Environment**: All (Production, Preview, Development)
3. Save

---

## Step 4: Verify Domain (Critical for Branded Emails)

**In SendGrid:**
1. Settings → Sender Authentication
2. Click "Authenticate Your Domain"
3. Select: "I want to use my own DNS host"
4. Domain: `voyagriq.com`
5. Use: "Automated Security" (recommended)
6. Click Next

SendGrid will show you **3-5 DNS records** to add.

**Example Records:**
```
Type: CNAME
Name: s1._domainkey
Value: s1.domainkey.u12345.wl123.sendgrid.net

Type: CNAME
Name: s2._domainkey
Value: s2.domainkey.u12345.wl123.sendgrid.net

Type: CNAME
Name: em1234
Value: u12345.wl123.sendgrid.net
```

---

## Step 5: Add DNS Records to Vercel

**In Vercel Dashboard:**
1. Your Project → Settings → Domains
2. Click `voyagriq.com`
3. Scroll to "DNS Records"
4. For each CNAME from SendGrid:
   - Click "Add Record"
   - Type: CNAME
   - Name: (copy from SendGrid)
   - Value: (copy from SendGrid)
   - Save

**Important**: Copy the exact values from SendGrid!

---

## Step 6: Verify Domain in SendGrid

1. Go back to SendGrid tab
2. Click "Verify" button
3. Wait 30-60 seconds for DNS propagation
4. If it fails, wait 5 minutes and try again

✅ **Success**: You'll see "Domain Authenticated" with a green checkmark

---

## Step 7: Create Sender Email

**In SendGrid:**
1. Settings → Sender Authentication → Single Sender Verification
2. Click "Create New Sender"
3. Fill in:
   - **From Name**: VoyagrIQ
   - **From Email**: `noreply@voyagriq.com`
   - **Reply To**: `support@voyagriq.com` (optional)
   - **Company**: VoyagrIQ
   - **Address**: Your business address
4. Click "Create"
5. Check email and verify the sender

---

## Step 8: Test Email Sending

Run the test script:

```bash
cd /Users/james/claude/voyagriq-app

# Add API key to .env.local
echo "SENDGRID_API_KEY=SG.your_key_here" >> .env.local

# Run test (replace with your email)
node scripts/test-sendgrid.js your-email@example.com
```

**Expected output:**
```
📧 Sending test email...
   To: your-email@example.com
   From: noreply@voyagriq.com

✅ Email sent successfully!

Check your inbox (and spam folder) for the test email.
If you received it, your branded email setup is complete! 🎉
```

---

## Step 9: Configure Supabase (Optional)

To send password reset emails from `@voyagriq.com`:

**In Supabase Dashboard:**
1. Authentication → Email Templates
2. SMTP Settings
3. Configure:
   - **Host**: `smtp.sendgrid.net`
   - **Port**: `587`
   - **Username**: `apikey` (literally "apikey")
   - **Password**: Your SendGrid API key (`SG.xxx`)
   - **Sender Email**: `noreply@voyagriq.com`
   - **Sender Name**: `VoyagrIQ`
4. Save

Now all auth emails (password resets, confirmations) will come from `noreply@voyagriq.com`!

---

## What You Can Now Do

✅ Send emails from:
- `noreply@voyagriq.com` - Automated emails
- `support@voyagriq.com` - Support responses
- `hello@voyagriq.com` - Marketing emails
- Any `@voyagriq.com` address you verify

✅ Professional sender reputation
✅ Email analytics and tracking
✅ Branded authentication emails
✅ System alerts from your domain

---

## Troubleshooting

### "Domain not verified"
- Wait 5-10 minutes for DNS propagation
- Double-check CNAME records in Vercel match SendGrid exactly
- Make sure you copied the full value (including subdomain)

### "Sender not verified"
- Check email for verification link
- Make sure you created sender in SendGrid
- Email must be from verified domain (@voyagriq.com)

### Test email not received
- Check spam folder
- Verify sender email in SendGrid first
- Make sure domain is authenticated
- Check SendGrid Activity Feed for error details

### 403 Forbidden Error
- Domain not verified yet
- Sender email not verified
- API key doesn't have "Full Access" permission

---

## Free Tier Limits

**SendGrid Free Tier:**
- 100 emails per day
- 3,000 emails per month
- Perfect for starting out

**When to upgrade:**
- Essentials: $19.95/mo for 50k emails
- Pro: $89.95/mo for 100k emails

---

## Email Types You'll Send

1. **Transactional** (Supabase auth):
   - Password resets
   - Email confirmations
   - Magic link logins

2. **System Alerts** (lib/alerts.ts):
   - Critical errors
   - Webhook failures
   - System monitoring

3. **Product Emails** (future):
   - Welcome emails
   - Usage reports
   - Billing notifications

4. **Marketing** (separate tool):
   - Use Mailchimp/ConvertKit for bulk campaigns
   - SendGrid for transactional only

---

## Security Notes

- Keep API key secret (never commit to git)
- Use environment variables only
- Monitor SendGrid activity for suspicious usage
- Set up 2FA on SendGrid account

---

**Setup Time**: 15-20 minutes
**Cost**: $0/month (free tier)
**Difficulty**: Easy (DNS records are the trickiest part)

---

**Questions?**
- SendGrid Docs: [docs.sendgrid.com](https://docs.sendgrid.com)
- Vercel DNS: [vercel.com/docs/projects/domains](https://vercel.com/docs/projects/domains)
