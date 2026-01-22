# VoyagrIQ User Guide

Welcome to VoyagrIQ! This guide will help you get the most out of your travel cost intelligence platform.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Managing Trips](#managing-trips)
3. [Understanding Analytics](#understanding-analytics)
4. [Setting Up Vendor Pricing](#setting-up-vendor-pricing)
5. [Managing Client Pricing](#managing-client-pricing)
6. [Exporting Reports](#exporting-reports)
7. [Account Settings](#account-settings)

---

## Getting Started

### Creating Your Account

1. Go to [voyagriq.com](https://voyagriq.com)
2. Click "Get Started" or "Sign Up"
3. Enter your email and create a password
4. Choose your subscription tier (14-day free trial on Starter & Standard)
5. Complete payment setup
6. You're ready to start tracking trips!

### First Login

After creating your account:
1. You'll see the dashboard with sample data
2. Take a tour of the main features
3. Start adding your first trip

---

## Managing Trips

### Adding a New Trip

**Method 1: Quick Add** (Fast entry)
1. Click the "Add Trip" button in the navigation
2. Fill in the basic information:
   - Client name
   - Destination
   - Travel dates
   - Number of travelers
   - Base cost
3. Click "Save Trip"

**Method 2: Detailed Entry** (Full information)
1. Go to "Trips" page
2. Click "New Trip"
3. Fill in all fields:
   - **Client Info**: Name, type (individual/corporate/group)
   - **Trip Details**: Destination, dates, travelers
   - **Costs**: Base cost, add-ons, vendor fees
   - **Commission**: Rate (auto-calculated if you have overrides)
   - **Vendors**: Airlines, hotels, etc.
4. Click "Save"

### Understanding Trip Fields

| Field | Description | Example |
|-------|-------------|---------|
| **Client Name** | Your customer's name or company | "John Smith" |
| **Destination** | Where they're traveling | "Paris, France" |
| **Departure Date** | When they leave | "2026-06-15" |
| **Return Date** | When they return | "2026-06-22" |
| **Travelers** | Number of people | 2 |
| **Base Cost** | Trip price before your commission | $5,000 |
| **Commission Rate** | Your percentage | 15% |
| **Your Commission** | Auto-calculated | $750 |
| **Net Revenue** | What you earn | $750 |

### Editing a Trip

1. Go to "Trips" page
2. Find the trip you want to edit
3. Click on the trip row
4. Make your changes
5. Click "Update Trip"

### Deleting a Trip

1. Go to "Trips" page
2. Find the trip
3. Click the delete icon (trash can)
4. Confirm deletion

**Note**: Deleted trips can't be recovered. Consider archiving instead if you might need the data later.

---

## Understanding Analytics

### Dashboard Overview

Your dashboard shows:
- **Total Revenue**: All commission earned
- **Average Commission**: Your typical earning per trip
- **Total Trips**: Number of bookings tracked
- **Top Destinations**: Where clients travel most
- **Top Clients**: Who books the most

### Using Analytics

**View by Time Period**
1. Go to "Analytics" page
2. Select date range (This Month, Last 3 Months, This Year, etc.)
3. See updated charts and graphs

**Understand Your Metrics**

- **Revenue Trend**: See if you're growing month-over-month
- **Destination Analysis**: Identify popular destinations
- **Vendor Spending**: Track which vendors you use most
- **Client Analysis**: See who your best clients are
- **Commission Rates**: Average rates you're earning

### What-If Scenarios

Test pricing changes before implementing them:

1. Go to "What-If" page
2. Select a scenario:
   - "What if I raise my commission by 2%?"
   - "What if I apply a 10% markup to hotels?"
3. See projected revenue impact
4. Make informed decisions

---

## Setting Up Vendor Pricing

**Available on**: Standard, Premium, Enterprise tiers

Vendor pricing lets you automatically apply markups, discounts, or negotiated rates when booking with specific vendors.

### Creating a Vendor Rule

1. Go to "Settings" → "Vendor Pricing"
2. Click "Add Vendor Rule"
3. Fill in the details:

**Example 1: Hilton Hotels Markup**
- **Vendor Name**: Hilton Hotels
- **Category**: Hotel
- **Rule Type**: Markup
- **Value**: 10% (add 10% to all Hilton bookings)
- **Status**: Active

**Example 2: United Airlines Discount**
- **Vendor Name**: United Airlines
- **Category**: Flight
- **Rule Type**: Discount
- **Value**: 5% (reduce price by 5%)
- **Status**: Active

**Example 3: Negotiated Rate**
- **Vendor Name**: Four Seasons
- **Category**: Hotel
- **Rule Type**: Negotiated Rate
- **Value**: $350/night (fixed rate)
- **Minimum Booking**: $1,000
- **Status**: Active

### Rule Types Explained

| Type | What It Does | Example |
|------|--------------|---------|
| **Markup** | Adds percentage to cost | 10% markup = $1,000 → $1,100 |
| **Discount** | Reduces cost by percentage | 5% discount = $1,000 → $950 |
| **Flat Fee** | Adds fixed dollar amount | $50 fee = $1,000 → $1,050 |
| **Negotiated Rate** | Uses special rate you've arranged | $350/night at Four Seasons |

### Tips for Vendor Rules

- ✅ **Start simple**: Add rules for your top 5 vendors first
- ✅ **Test inactive first**: Create rules as "Inactive" to test before applying
- ✅ **Use categories**: Group rules by vendor type (hotel, flight, etc.)
- ✅ **Set expiration dates**: For temporary promotional rates
- ❌ **Don't overlap**: Only one rule per vendor to avoid confusion

---

## Managing Client Pricing

**Available on**: Premium, Enterprise tiers

Client pricing lets you set custom commission rates for VIP clients, corporate accounts, or special agreements.

### Creating a Client Override

1. Go to "Settings" → "Client Pricing"
2. Click "Add Client Override"
3. Fill in the details:

**Example 1: VIP Client Lower Commission**
- **Client Name**: John Smith
- **Client Type**: Individual
- **Override Type**: Commission Rate
- **Value**: 12% (instead of your default 15%)
- **Description**: "VIP client - long-term relationship"
- **Status**: Active

**Example 2: Corporate Account**
- **Client Name**: Acme Corporation
- **Client ID**: CORP-001
- **Client Type**: Corporate
- **Override Type**: Commission Rate
- **Value**: 10%
- **Description**: "2026 corporate travel agreement"
- **Effective**: Jan 1, 2026 - Dec 31, 2026
- **Status**: Active

**Example 3: Premium Service Fee**
- **Client Name**: Sarah Johnson
- **Client Type**: Individual
- **Override Type**: Flat Fee
- **Value**: $75
- **Description**: "Premium concierge service fee"
- **Status**: Active

### Override Types

| Type | What It Does | When to Use |
|------|--------------|-------------|
| **Commission Rate** | Changes your commission % | VIP clients, corporate contracts |
| **Markup** | Adds percentage to trips | High-maintenance clients |
| **Discount** | Reduces trip cost | Loyalty programs, referrals |
| **Flat Fee** | Adds fixed service fee | Premium services, consulting |

### How Overrides Work

**Priority Order** (highest to lowest):
1. **Client-Specific Override**: "John Smith gets 12%"
2. **Client Type Default**: "All corporate clients get 13%"
3. **Agency Default**: "My standard rate is 15%"
4. **System Default**: "15% if nothing is set"

**Example**:
- Your default commission: 15%
- Corporate client default: 13%
- Acme Corp override: 10%

When you book a trip for Acme Corp, the system uses 10% (client override wins).

### Tips for Client Pricing

- ✅ **Document agreements**: Use the description field to note why you set each rate
- ✅ **Set expiration dates**: For temporary agreements or promotions
- ✅ **Review quarterly**: Check if VIP rates are still profitable
- ✅ **Use client types**: Set defaults for corporate/group before individual overrides
- ❌ **Don't over-discount**: Make sure you're still profitable

---

## Exporting Reports

### Quick Export (CSV)

**Available on**: All tiers

1. Go to "Trips" page
2. Click "Export" button
3. Select "CSV"
4. Opens in Excel or Google Sheets

**What you get**: Spreadsheet with all trip data

### Advanced Export (Excel)

**Available on**: Standard, Premium, Enterprise

1. Go to "Export Options" page
2. Select date range
3. Choose "Excel Format"
4. Click "Generate Report"

**What you get**: Formatted Excel file with:
- Summary statistics
- Trip details
- Commission calculations
- Charts and graphs

### PDF Reports

**Available on**: Standard, Premium, Enterprise

1. Go to "Reports" page
2. Select report type:
   - Monthly summary
   - Client report
   - Vendor analysis
   - Commission breakdown
3. Choose date range
4. Click "Generate PDF"

**What you get**: Professional PDF report ready to share with clients or stakeholders

### White-Label Reports

**Available on**: Premium, Enterprise

Make reports look like they're from YOUR agency:

1. Go to "Settings" → "White-Label"
2. Upload your logo
3. Set your brand colors
4. Add your company info
5. Save settings

Now all PDF reports show your branding instead of VoyagrIQ!

### Scheduled Reports

**Available on**: Standard, Premium, Enterprise

Get reports automatically:

1. Go to "Settings" → "Scheduled Reports"
2. Create new schedule:
   - **Frequency**: Weekly or Monthly
   - **Day**: Which day to receive
   - **Format**: PDF or Excel
   - **Email**: Where to send
3. Save

You'll automatically receive reports on your schedule!

---

## Account Settings

### Managing Your Subscription

1. Go to "Account" page
2. See current plan and usage
3. Click "Manage Subscription" to:
   - Upgrade or downgrade
   - Switch between monthly/annual
   - Update payment method
   - Cancel subscription

### Setting Your Default Commission

1. Go to "Settings" → "Agency Settings"
2. Enter your standard commission rate (e.g., 15%)
3. Set different rates by client type:
   - **Individual**: 15%
   - **Corporate**: 13%
   - **Group**: 12%
4. Save

These become your defaults for all new trips.

### Updating Your Profile

1. Go to "Account" → "Profile"
2. Update:
   - Name
   - Email
   - Phone
   - Agency name
3. Save changes

### Changing Your Password

1. Go to "Account" → "Security"
2. Enter current password
3. Enter new password
4. Confirm new password
5. Save

---

## Getting Help

### In-App Help

- **?** icon: Click for context-specific help
- **Tooltips**: Hover over fields for explanations
- **Sample data**: Every new account includes examples

### Support Resources

- **Email**: james@voyagriq.com
- **Response Time**:
  - Starter: 48 hours
  - Standard: 24 hours
  - Premium: 4 hours
  - Enterprise: 2 hours + dedicated manager

### Knowledge Base

Visit [docs/knowledge-base](knowledge-base/) for:
- [Frequently Asked Questions](knowledge-base/FAQ.md)
- [Common Issues & Solutions](knowledge-base/TROUBLESHOOTING.md)
- [Best Practices](knowledge-base/BEST_PRACTICES.md)
- [Pricing & Billing Info](knowledge-base/PRICING_BILLING.md)

---

## Tips for Success

### Start Simple

1. **Week 1**: Add your past trips
2. **Week 2**: Set up your top 5 vendors
3. **Week 3**: Configure client pricing for VIPs
4. **Week 4**: Review analytics and adjust

### Best Practices

✅ **Enter trips immediately** after booking
✅ **Review your dashboard** weekly
✅ **Update vendor rules** when you negotiate new rates
✅ **Check analytics** monthly to spot trends
✅ **Export reports** for tax season

### Common Workflows

**Booking a New Trip**
1. Enter trip details
2. System auto-calculates commission (based on your rules)
3. Confirm and save
4. Export invoice for client

**Monthly Review**
1. Go to Analytics
2. Check revenue vs. last month
3. Identify top clients and destinations
4. Adjust pricing if needed

**Tax Season**
1. Export all trips for the year (CSV)
2. Generate annual summary report (PDF)
3. Give to your accountant

---

## Video Tutorials

Coming soon! We're creating video tutorials for:
- Adding your first trip
- Setting up vendor pricing
- Creating client overrides
- Reading your analytics
- Exporting reports

---

**Need more help?** Contact us at james@voyagriq.com

**VoyagrIQ** - Making travel cost management simple.
