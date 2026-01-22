# Frequently Asked Questions (FAQ)

Quick answers to common questions about VoyagrIQ.

---

## General Questions

### What is VoyagrIQ?

VoyagrIQ is a travel cost intelligence platform that helps travel agencies track trips, analyze costs, calculate commissions, and optimize pricing. Think of it as your financial analytics tool specifically designed for travel agencies.

### Who is VoyagrIQ for?

- **Solo travel advisors** managing client trips
- **Small to medium agencies** tracking multiple advisors
- **Large agencies** with complex pricing needs
- **Corporate travel departments** managing employee travel

### Do I need technical knowledge to use VoyagrIQ?

No! VoyagrIQ is designed to be user-friendly. If you can use Excel or email, you can use VoyagrIQ. We provide:
- Simple forms for entering trips
- Clear dashboards showing your data
- One-click exports to familiar formats (Excel, PDF)
- Step-by-step guides for every feature

---

## Account & Billing

### How do I sign up?

1. Go to [voyagriq.com/pricing](https://voyagriq.com/pricing)
2. Choose your plan (Starter, Standard, or Premium)
3. Click "Get Started"
4. Enter your email and create a password
5. Add payment information
6. Start your free trial!

### Is there a free trial?

**Yes!** We offer a 14-day free trial on:
- **Starter Plan** (monthly only)
- **Standard Plan** (monthly only)

**No trial** on:
- Annual plans (but you get 2 months free!)
- Premium Plan (no trial, but you can upgrade from Standard anytime)

### How does billing work?

**Monthly Plans**:
- Billed on the same day each month
- Example: Sign up January 15 → billed 15th of each month
- Cancel anytime, no long-term commitment

**Annual Plans**:
- Pay for 12 months upfront
- Get 14 months of service (2 months free!)
- Saves you approximately 14% vs. monthly
- Example: Pay $588 ($49 × 12), get 14 months = $42/month effective

### Can I change my plan later?

**Yes!** You can:
- **Upgrade anytime**: Takes effect immediately, prorated charge
- **Downgrade anytime**: Takes effect at next billing cycle
- **Switch monthly ↔ annual**: Contact support for assistance

### What payment methods do you accept?

- All major credit cards (Visa, Mastercard, Amex, Discover)
- ACH bank transfer (annual plans only)
- Processed securely through Stripe

### How do I cancel?

1. Go to "Account" → "Subscription"
2. Click "Manage Subscription"
3. Click "Cancel Plan"
4. Confirm cancellation

**What happens**:
- You keep access until end of billing period
- No refunds for unused time
- Your data is archived (not deleted)
- Can reactivate anytime within 90 days

---

## Features & Limits

### Are trips really unlimited?

**Yes!** All plans include unlimited trip tracking. The differences between plans are:
- **Data retention**: How long we keep your trips
- **Team size**: How many users can access your account
- **Advanced features**: Export formats, API access, white-labeling

### What's the difference in data retention?

| Plan | Retention | What This Means |
|------|-----------|-----------------|
| **Starter** | 6 months | Trips older than 6 months are archived |
| **Standard** | 2 years | Trips older than 2 years are archived |
| **Premium** | 5 years | Trips older than 5 years are archived |
| **Enterprise** | Unlimited | We keep all your trips forever |

**Archived trips** can be restored by upgrading to a higher plan.

### Can I import my existing trip data?

**Yes!** On Standard, Premium, and Enterprise plans:

1. Download our [CSV template](https://voyagriq.com/trip-import-template.csv)
2. Fill in your trip data
3. Go to "Data" → "Bulk Import"
4. Upload your CSV file
5. Review and confirm import

We can import from:
- Excel spreadsheets
- CSV files
- Other travel agency software (contact support)

### Can multiple people use my account?

**Team access** by plan:
- **Starter**: 1 user (just you)
- **Standard**: Up to 10 team members
- **Premium**: Up to 20 team members
- **Enterprise**: Unlimited team members

**Team features** (Standard+):
- Individual logins for each person
- Role-based permissions
- Activity tracking (who added/edited trips)
- Collaborative reports

### Do you have an API?

**Yes!** API access is available on:
- **Premium** plan
- **Enterprise** plan

Use our API to:
- Integrate with your existing software
- Automate trip entry from booking systems
- Export data to accounting software
- Build custom dashboards

See [API Documentation](../API_REFERENCE.md) for details.

---

## Using VoyagrIQ

### How do I add my first trip?

**Quick method**:
1. Click "Add Trip" in the navigation
2. Fill in: Client name, destination, dates, travelers, cost
3. Click "Save"

**Detailed guide**: See [User Guide - Adding Trips](../USER_GUIDE.md#adding-a-new-trip)

### How does commission calculation work?

VoyagrIQ automatically calculates your commission using this priority:

1. **Client-specific override** (if you set one for this client)
2. **Client type default** (e.g., all corporate clients get 13%)
3. **Your default rate** (set in Settings)
4. **System default** (15% if nothing is set)

**Example**:
- Default rate: 15%
- Corporate client rate: 13%
- Acme Corp override: 10%
- Trip for Acme Corp uses: **10%**

### What are vendor pricing rules?

Vendor pricing rules let you automatically apply markups, discounts, or negotiated rates for specific vendors.

**Example**:
- You negotiate 10% discount with Hilton Hotels
- Create a "Hilton Hotels" vendor rule: 10% discount
- Every Hilton booking automatically gets the discount

**Available on**: Standard, Premium, Enterprise

See [User Guide - Vendor Pricing](../USER_GUIDE.md#setting-up-vendor-pricing)

### What are client pricing overrides?

Client overrides let you set custom commission rates or fees for specific clients.

**Example**:
- Your VIP client "John Smith" gets 12% commission (instead of standard 15%)
- Create a "John Smith" client override: 12% commission rate
- All John's trips automatically use 12%

**Available on**: Premium, Enterprise

See [User Guide - Client Pricing](../USER_GUIDE.md#managing-client-pricing)

### Can I export my data?

**Yes!** Export options by plan:

| Plan | Export Formats |
|------|----------------|
| **Starter** | CSV (Excel-compatible) |
| **Standard** | CSV, Excel, PDF |
| **Premium** | CSV, Excel, PDF (white-labeled) |
| **Enterprise** | All formats + custom exports |

**How to export**:
1. Go to "Trips" or "Reports"
2. Click "Export"
3. Choose your format
4. Download file

### Can I customize reports with my branding?

**Yes!** White-label branding is available on:
- **Premium** plan (PDF reports only)
- **Enterprise** plan (entire platform)

**What you can customize**:
- Your logo
- Your company colors
- Your company name and contact info
- Footer text

**How to set up**:
1. Go to "Settings" → "White-Label"
2. Upload your logo
3. Choose your colors
4. Add company info
5. Save

All future PDF reports will use your branding!

---

## Security & Privacy

### Is my data secure?

**Yes!** We use enterprise-grade security:
- **Encryption**: All data encrypted in transit (HTTPS) and at rest
- **Authentication**: Secure login with password hashing
- **Isolation**: You can only see your own data
- **Backups**: Daily automated backups
- **Infrastructure**: Hosted on Vercel and Supabase (SOC 2 compliant)

### Who can see my trips?

**Only you** (and your team members if you have a multi-user plan).

- We use Row Level Security (RLS) to isolate your data
- Even our engineers can't see your trips
- No sharing or selling of your data
- GDPR and CCPA compliant

### Where is my data stored?

- **Database**: Supabase (AWS infrastructure)
- **Hosting**: Vercel (global CDN)
- **Payments**: Stripe (PCI-compliant)
- **Location**: US data centers (other regions available for Enterprise)

### Can I delete my data?

**Yes!** You have full control:

**Delete individual trips**:
1. Go to trip
2. Click delete icon
3. Confirm deletion

**Delete your account**:
1. Go to "Account" → "Settings"
2. Click "Delete Account"
3. Confirm deletion
4. All your data is permanently removed within 30 days

**Export before deleting**:
- We recommend exporting your data first
- Once deleted, we cannot recover your data

---

## Technical Questions

### What browsers do you support?

VoyagrIQ works best on:
- **Chrome** (recommended)
- **Firefox**
- **Safari**
- **Edge**

Minimum versions:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Do you have a mobile app?

Not yet! But VoyagrIQ is mobile-responsive:
- Works on phones and tablets
- Use your mobile browser
- All features available
- Optimized for touch

**Native mobile apps** (iOS/Android) are on our roadmap for 2026.

### Can I use VoyagrIQ offline?

No, VoyagrIQ requires an internet connection. This ensures:
- Your data is always synced
- Team members see real-time updates
- Automatic backups
- Security and data isolation

### Do you integrate with other software?

**Current integrations**:
- **Stripe** (payment processing)
- **Excel/Google Sheets** (via CSV export)

**Coming soon**:
- QuickBooks
- Xero
- Salesforce
- HubSpot

**API available** (Premium+):
- Build your own integrations
- Connect to your existing systems
- See [API Documentation](../API_REFERENCE.md)

---

## Troubleshooting

### I forgot my password

1. Go to [voyagriq.com/login](https://voyagriq.com/login)
2. Click "Forgot Password?"
3. Enter your email
4. Check your email for reset link
5. Click link and create new password

### I'm not receiving emails

**Check**:
1. Spam/junk folder
2. Email address in your profile is correct
3. Add noreply@voyagriq.com to your contacts

**Still not working?**
- Contact support: james@voyagriq.com

### My export isn't working

**Try**:
1. Refresh the page
2. Try a different export format
3. Check if you have trips in the selected date range
4. Clear your browser cache

**Still not working?**
- Contact support with:
  - Your browser and version
  - What you're trying to export
  - Any error messages you see

### The page is loading slowly

**Possible causes**:
1. Slow internet connection
2. Too many browser tabs open
3. Large amount of data being loaded

**Try**:
1. Refresh the page
2. Clear browser cache
3. Close unnecessary tabs
4. Try a different browser

---

## Getting Help

### How do I contact support?

**Email**: james@voyagriq.com

**Response times**:
- Starter: Within 48 hours
- Standard: Within 24 hours
- Premium: Within 4 hours
- Enterprise: Within 2 hours + dedicated manager

### What should I include in a support request?

Help us help you faster:

1. **Describe the issue**
   - What were you trying to do?
   - What happened instead?

2. **Include details**
   - Your plan (Starter/Standard/Premium)
   - Browser and version
   - Screenshot if possible

3. **Steps to reproduce**
   - What did you click?
   - In what order?

### Do you offer training?

**Self-service** (all plans):
- [User Guide](../USER_GUIDE.md)
- [Video tutorials](#) (coming soon)
- Knowledge base articles

**Live training** (Enterprise only):
- 1-on-1 onboarding session
- Team training webinars
- On-site training available

### Can you help me import my data?

**Yes!**

**Standard/Premium**:
- Use our CSV bulk import tool
- See [User Guide - Importing Data](#)

**Enterprise**:
- White-glove data migration service
- We handle everything for you
- Includes data cleaning and validation

Contact support to get started.

---

## Pricing Questions

### Why should I choose annual billing?

**Benefits of annual**:
- **Save 14%**: Get 2 months free (pay for 12, get 14)
- **Lock in pricing**: No price increases for 12 months
- **One payment**: No monthly billing

**Example savings**:
- Standard monthly: $99 × 12 = $1,188/year
- Standard annual: $99 × 12 = $1,188 (but you get 14 months)
- Effective monthly cost: $84.86/month
- **You save**: $168/year!

### What happens if I exceed my team limit?

**Example**: You have Standard (10 users) but want to add an 11th person.

**Options**:
1. **Upgrade to Premium** (20 users)
2. **Remove an existing user** (free up a spot)
3. **Upgrade to Enterprise** (unlimited users)

You can't exceed your plan's limit.

### Do you offer discounts?

**Yes!**

**Annual plans**: Automatic 14% savings (2 months free)

**Non-profits**: 20% discount on all plans
- Contact james@voyagriq.com with proof of non-profit status

**Multiple agencies**: Volume discounts for 5+ accounts
- Contact sales for custom pricing

### Do you offer refunds?

**Trial period** (14 days):
- Cancel anytime during trial
- No charge if you cancel before trial ends
- Full refund if charged by mistake

**After trial**:
- No refunds for unused time
- Can cancel anytime (access until end of billing period)
- Data archived for 90 days (can reactivate)

---

## Still have questions?

**Email us**: james@voyagriq.com

**Check these resources**:
- [User Guide](../USER_GUIDE.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Best Practices](BEST_PRACTICES.md)

We typically respond within 24 hours!
