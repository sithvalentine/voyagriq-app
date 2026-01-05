# Quick Test Guide - Standard Tier Features

## 🚀 Dev Server Running
**URL:** http://localhost:3000

---

## Test Flow 1: Register as Standard User

1. **Go to Pricing Page**
   - Visit: http://localhost:3000/pricing
   - Find "Standard" tier card (purple, $199/mo)
   - Click "Get Started"

2. **Complete Registration**
   - Fill in name, email, company
   - Submit form
   - Should redirect to [/data](http://localhost:3000/data)

3. **Verify Standard Access**
   - Check navigation bar → Purple "Standard" badge (top right)
   - Navigation links should show:
     - Home
     - My Trips
     - **Analytics** (with PRO badge) ← NEW
     - **Reports** (with PRO badge) ← NEW
     - Pricing

---

## Test Flow 2: Advanced Search & Filters

1. **Navigate to All Trips**
   - Click "My Trips" in navigation
   - Or visit: http://localhost:3000/trips

2. **Look for Advanced Features**
   - Should see "Filters" heading with purple "Advanced" badge
   - **Search bar** above the filters with placeholder "Search by Trip ID, Client Name, or Destination..."
   - **Date range fields**: "Start Date (From)" and "Start Date (To)"
   - Basic agency and country checkboxes below

3. **Test Search**
   - Type any client name → trips filter instantly
   - Type trip ID → filters by ID
   - Type destination city/country → filters by location
   - Clear search → all trips return

4. **Test Date Range**
   - Set "Start Date (From)" → filters trips starting after that date
   - Set "Start Date (To)" → filters trips starting before that date
   - Use both → filters to date range
   - Clear dates → all trips return

5. **Test Combined Filters**
   - Search + agency checkbox + date range → all work together
   - Click "Clear All" → resets everything

---

## Test Flow 3: Agency Analytics

1. **Navigate to Analytics**
   - Click "Analytics" link in navigation
   - Or visit: http://localhost:3000/analytics

2. **View Summary Cards**
   - Top of page shows 4 cards:
     - Total Agencies
     - Total Trips
     - Total Revenue
     - Avg Trip Value

3. **View Charts**
   - **Chart 1**: Revenue by Agency (blue bar chart)
   - **Chart 2**: Revenue Distribution (colorful pie chart with %)
   - **Chart 3**: Trip Volume by Agency (purple bar chart)
   - **Chart 4**: Avg Trip Value by Agency (green bar chart)

4. **View Detailed Table**
   - Scroll to bottom
   - Table shows all agencies with columns:
     - Agency Name
     - Trips
     - Total Revenue
     - Avg Trip Value
     - Total Travelers
     - Avg Cost/Traveler
     - Commission
   - Sorted by revenue (highest first)

---

## Test Flow 4: Scheduled Reports

1. **Navigate to Reports**
   - Click "Reports" link in navigation
   - Or visit: http://localhost:3000/reports

2. **Schedule a New Report**
   - Click "+ Schedule New Report" button
   - Modal appears with form:
     - **Report Name**: "Weekly Performance Report"
     - **Report Type**: Select "Agency Performance Comparison"
     - **Frequency**: Select "Weekly"
     - **Recipients**: "manager@example.com, team@example.com"
   - Click "Schedule Report"

3. **Verify Report Created**
   - Report appears in list
   - Shows green "Active" badge
   - Shows blue "Weekly" badge
   - Shows recipients list
   - Shows next run date (7 days from today)

4. **Test Report Controls**
   - **Pause**: Click "Pause" button → badge changes to gray "Paused"
   - **Resume**: Click "Resume" button → badge changes back to green "Active"
   - **Delete**: Click "Delete" button → confirmation popup → report removed

5. **Test Persistence**
   - Refresh page (F5)
   - Reports should still be there (saved to localStorage)

---

## Test Flow 5: Country Dropdown

1. **Navigate to Add Trip**
   - Click "+ Add Trip" button (top right, blue)
   - Or visit: http://localhost:3000/data

2. **Find Destination Country Field**
   - Scroll down to trip details section
   - Find "Destination Country *" field

3. **Test Dropdown**
   - Should be a dropdown (not text input)
   - Click dropdown → shows "Select a country..."
   - Scroll through list → 195+ countries alphabetically
   - Select any country (e.g., "France")
   - Value is set correctly

4. **Submit Trip**
   - Fill in all required fields
   - Submit form
   - View trip detail → country shows correctly

---

## Test Flow 6: Free/Starter Restrictions

1. **Change to Free Tier**
   - Go to: http://localhost:3000/pricing
   - Click "Get Started" on Free tier
   - Register with different email

2. **Verify Limited Access**
   - Navigation bar shows gray "Free" badge
   - No "Analytics" or "Reports" links visible

3. **Try Direct URLs**
   - Visit: http://localhost:3000/analytics
     - Should show upgrade screen (can't access)
   - Visit: http://localhost:3000/reports
     - Should show upgrade screen (can't access)

4. **Check Filters Page**
   - Visit: http://localhost:3000/trips
   - Should see upgrade CTA instead of search/date fields
   - Purple gradient box saying "Unlock Advanced Search & Filters"
   - Basic filters (agency, country) still work

5. **Verify Country Dropdown**
   - Visit: http://localhost:3000/data
   - Country dropdown should still work (all tiers have access)

---

## Visual Indicators to Look For

### Standard Tier:
- ✅ Purple "Standard" badge in navigation
- ✅ "Analytics" link with tiny purple "PRO" badge
- ✅ "Reports" link with tiny purple "PRO" badge
- ✅ Purple "Advanced" badge next to "Filters"
- ✅ Search bar with search icon
- ✅ Date range fields
- ✅ Full access to analytics page
- ✅ Full access to reports page

### Free Tier:
- ✅ Gray "Free" badge in navigation
- ❌ No "Analytics" or "Reports" links
- ⚠️ Purple upgrade CTA box on filters page
- ❌ No search bar
- ❌ No date range fields
- ❌ Analytics page shows upgrade screen
- ❌ Reports page shows upgrade screen

---

## Common Issues & Solutions

### Issue: "Analytics" link not showing
- **Cause:** Not on Standard or Premium tier
- **Fix:** Re-register with Standard tier from /pricing

### Issue: Search bar not visible
- **Cause:** Not on Standard or Premium tier
- **Fix:** Verify tier badge is purple "Standard" or amber "Premium"

### Issue: Charts show no data
- **Cause:** No trips in database
- **Fix:** Add trips from /data page first

### Issue: Scheduled reports disappeared
- **Cause:** localStorage cleared or different browser
- **Fix:** Normal behavior, re-create reports

### Issue: Dev server not running
- **Cause:** Port conflict or crash
- **Fix:** Run `npm run dev` in terminal

---

## Quick Commands

```bash
# Start dev server
npm run dev

# Kill processes on ports 3000/3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Clear localStorage (browser console)
localStorage.clear()

# Check current tier (browser console)
localStorage.getItem('voyagriq-tier')

# Set tier manually (browser console)
localStorage.setItem('voyagriq-tier', 'standard')
location.reload()
```

---

## Success Checklist

After completing all tests, you should have verified:

- [x] Standard tier registration works
- [x] Purple badge shows in navigation
- [x] Analytics and Reports links visible (with PRO badges)
- [x] Advanced search filters work (search box + date range)
- [x] Agency analytics page loads with charts and table
- [x] Scheduled reports can be created, paused, and deleted
- [x] Country dropdown works on trip entry form (all tiers)
- [x] Free tier shows upgrade screens (not full access)
- [x] Basic filters work on all tiers
- [x] All pages load without errors

---

## Done! 🎉

All Standard tier features are fully implemented and working correctly.
