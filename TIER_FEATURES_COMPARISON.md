# Tier Features Comparison - Visual Guide

## Quick Reference: What's Different Between Tiers?

### 📊 **Visual Differences at a Glance**

| Feature | Free | Starter | Standard | Premium |
|---------|------|---------|----------|---------|
| **Trip Limit** | 5/month | 25/month | 100/month | Unlimited |
| **Navigation Badge Color** | Gray | Blue | Purple | Amber |
| **BI Section on Trip Detail** | ❌ | ❌ | ✅ | ✅ |
| **Optimization Opportunities** | ❌ | ❌ | ✅ | ✅ |
| **PDF with BI Insights** | ❌ | ❌ | ✅ | ✅ |
| **Trip Limit Warning** | Shows at 80%+ | Shows at 80%+ | Shows at 80%+ | Never shows |
| **Account Page Upgrade CTA** | Shows | Shows | Shows | Hidden |

---

## Detailed Feature Breakdown by Page

### 1. **Navigation Bar** (All Pages)
**File:** [components/Navigation.tsx](components/Navigation.tsx#L10)

#### Free Tier
- Badge: Gray background (`bg-gray-100 text-gray-700`)
- Shows "Free"

#### Starter Tier
- Badge: Blue background (`bg-blue-100 text-blue-700`)
- Shows "Starter"

#### Standard Tier
- Badge: Purple background (`bg-purple-100 text-purple-700`)
- Shows "Standard"

#### Premium Tier
- Badge: Amber background (`bg-amber-100 text-amber-700`)
- Shows "Premium"

---

### 2. **Trip Detail Page** ([app/trips/[id]/page.tsx](app/trips/[id]/page.tsx))

#### Free & Starter Tiers
**What you see:**
- ✅ Trip Summary Header
- ✅ Key Metrics (4 cards)
- ✅ Cost Breakdown Charts (Pie + Bar)
- ✅ Detailed Cost Table
- ✅ Export buttons (CSV, Excel, PDF)
- ❌ **NO** Business Intelligence section
- ❌ **NO** Optimization Opportunities section
- ⚠️ Trip Limit Warning (if at 80%+ usage)

#### Standard & Premium Tiers
**What you see (EVERYTHING above, PLUS):**
- ✅ **Business Intelligence Section** ([line 305-360](app/trips/[id]/page.tsx#L305))
  - 6 insight cards in a grid:
    1. **Hotel/Flight Ratio** - e.g., "1.57x" with status (Optimal/High/Check)
    2. **Experience Investment** - e.g., "23%" with dollar amount
    3. **Transport Efficiency** - e.g., "48% of budget"
    4. **Top Cost Driver** - e.g., "Hotels"
    5. **Seasonality** - e.g., "Peak Season"
    6. **Benchmark** - Comparison text
  - Blue gradient background
  - 📊 icon at top

- ✅ **Cost Optimization Opportunities Section** ([line 363-415](app/trips/[id]/page.tsx#L363))
  - Only shows if opportunities found
  - 💡 icon at top
  - Colored left border (Red = High, Yellow = Medium, Blue = Low priority)
  - Shows:
    - Category (e.g., "Accommodation")
    - Issue description
    - Recommendation
    - Potential savings amount

---

### 3. **PDF Exports** ([lib/pdfGenerator.ts](lib/pdfGenerator.ts))

#### Free & Starter Tiers
**PDF Contents:**
- ✅ Trip header with basic info
- ✅ Cost breakdown table
- ✅ Pie chart (if many categories)
- ✅ Cost summary
- ❌ **NO** Business Intelligence section
- ❌ **NO** Optimization opportunities
- ❌ **NO** Advanced insights

#### Standard & Premium Tiers
**PDF Contents (EVERYTHING above, PLUS):**
- ✅ **Business Intelligence Section** ([line 289-357](lib/pdfGenerator.ts#L289))
  - Cost Efficiency rating with color
  - Hotel/Flight Ratio (e.g., "1.57x")
  - Experience Investment (formatted as currency)
  - Top 3 Optimization Opportunities with:
    - Priority level (colored)
    - Recommendation text
    - Priority: High/Medium/Low

#### Premium Only
- ✅ **White-label** option (can customize agency name)
- Note: Currently the white-label feature passes `agencyName` but doesn't fully customize branding

---

### 4. **Account Page** ([app/account/page.tsx](app/account/page.tsx))

#### All Tiers Show:
- ✅ Current plan name and price
- ✅ Tier badge (colored)
- ✅ Usage stats (trips, team members, revenue)
- ✅ Current plan features list

#### Free, Starter, Standard Only:
- ✅ **Upgrade CTA card** showing next tier
  - Shows next tier name, price, limits
  - "Upgrade Now" button

#### Premium Only:
- ❌ **NO upgrade CTA** (already at top tier)
- ✅ Shows "No restrictions" or similar message

---

### 5. **Trip Entry Form** ([components/TripEntryForm.tsx](components/TripEntryForm.tsx))

#### All Tiers:
- Check trip limits before allowing new trip
- If at limit, shows error message

**Limits:**
- Free: 5 trips → blocks at 5
- Starter: 25 trips → blocks at 25
- Standard: 100 trips → blocks at 100
- Premium: Unlimited → never blocks

---

## How to Test Standard Tier Features

### Step 1: Register with Standard Tier
1. Go to [/pricing](http://localhost:3000/pricing)
2. Click "Get Started" on **Standard** tier ($199/mo)
3. Fill out registration form
4. Submit → Tier saved to localStorage

### Step 2: Verify Navigation
- Check top-right of navigation bar
- Should see **purple badge** with "Standard"

### Step 3: View Trip Detail
1. Go to any trip detail page
2. Scroll down past the main metrics

**You should see:**

**Business Intelligence Section** (blue gradient box):
```
📊 Business Intelligence

[Hotel/Flight Ratio]  [Experience Investment]  [Transport Efficiency]
1.57x                 23%                      48%
✓ Optimal balance     $3,450 in activities    of budget

[Top Cost Driver]     [Seasonality]           [Benchmark]
Hotels                Peak Season              Above portfolio avg
```

**Optimization Opportunities** (if any found):
```
💡 Cost Optimization Opportunities

🏨 Accommodation (High Priority)
Issue: Hotel costs are 1.6x higher than flights
Recommendation: Consider vacation rentals, boutique hotels...
Potential Savings: $800-$1,200
```

### Step 4: Export PDF
1. Click "Export PDF" button
2. Open downloaded PDF
3. Scroll to page 2 (or further)

**You should see in PDF:**
- "BUSINESS INTELLIGENCE" section header
- Cost Efficiency rating
- Hotel/Flight Ratio: 1.57x
- Experience Investment: $3,450
- "Optimization Opportunities" section (if any)

---

## Troubleshooting: "Standard tier looks like Starter"

### Issue: Not seeing Business Intelligence section

**Check 1: Verify tier is saved**
```javascript
// Open browser console
localStorage.getItem('voyagriq-tier')
// Should return: "standard"
```

**Check 2: Verify Navigation badge**
- Should show **purple badge** with "Standard"
- If showing blue or gray, tier isn't saved correctly

**Check 3: Re-register**
1. Go to [/pricing](http://localhost:3000/pricing)
2. Click "Get Started" on **Standard** tier
3. Fill form and submit
4. Check localStorage again

**Check 4: Clear cache and reload**
```javascript
// Browser console
localStorage.clear()
location.reload()
```
Then re-register with Standard tier

### Issue: PDF doesn't show BI section

**Check 1: Verify you're on Standard/Premium tier**
- Navigation badge should be purple or amber

**Check 2: Check browser console for errors**
- Open DevTools → Console tab
- Look for errors when clicking "Export PDF"

**Check 3: Verify trip has enough data**
- BI insights require cost data
- Make sure flight, hotel, etc. costs are > 0

---

## Summary: Standard vs Starter/Free

### What Standard Adds:

1. **100 trips/month** (vs 25 for Starter, 5 for Free)
2. **Purple tier badge** in navigation
3. **Business Intelligence section** on trip detail pages
   - 6 insight cards with metrics
   - Blue gradient styling
4. **Optimization Opportunities section** on trip detail pages
   - Actionable recommendations
   - Potential savings calculations
5. **Enhanced PDF exports** with BI insights
   - Cost efficiency rating
   - Hotel/Flight ratio
   - Experience investment
   - Top 3 optimization opportunities

### Visual Proof You're on Standard:
- ✅ Purple "Standard" badge in top-right navigation
- ✅ Blue "📊 Business Intelligence" section on trip details
- ✅ "💡 Cost Optimization Opportunities" section below BI
- ✅ Account page shows "Standard" plan with 100 trip limit
- ✅ PDF exports include "BUSINESS INTELLIGENCE" section

If you see all 5 of these, you're definitely on Standard tier! 🎉
