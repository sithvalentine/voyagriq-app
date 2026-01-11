# Mobile Testing Guide - VoyagrIQ

**Date**: January 7, 2026
**Priority**: CRITICAL - Must test before production launch
**Estimated Time**: 8 hours

---

## Why Mobile Testing is Critical

The UX audit found **responsive classes exist but actual mobile behavior is UNTESTED**. This creates risk:

- ❌ Navigation dropdowns may not work on touch devices
- ❌ Forms may be difficult to use on small screens
- ❌ Tables may require horizontal scrolling
- ❌ Buttons may be too small to tap accurately
- ❌ App may be completely unusable on mobile

**Impact**: 40-60% of modern web traffic is mobile. A broken mobile experience = immediate user churn.

---

## Testing Devices Required

### Minimum Testing (Required)
1. **iPhone** (iOS 16+) - Safari browser
2. **Android Phone** (Android 12+) - Chrome browser
3. **iPad or Android Tablet** - For tablet view

### Recommended Additional Testing
4. iPhone SE (small screen: 375×667px)
5. Android large phone (6.5" screen)
6. Desktop browser mobile emulation (for quick tests)

---

## Part 1: Setup Testing Environment (30 min)

### Option A: Test on Physical Devices (Recommended)

#### 1. Get Local Network URL

```bash
# On your Mac, find your local IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Example output:
# inet 192.168.1.100 netmask 0xffffff00 broadcast 192.168.1.255
```

#### 2. Start Development Server

```bash
cd voyagriq-app
npm run dev
```

#### 3. Access from Mobile Device

On your phone (must be on same WiFi network):
- Open browser
- Navigate to: `http://192.168.1.100:3000` (use YOUR IP)
- Bookmark for easy access

**Troubleshooting**:
```bash
# If connection refused, allow Node in firewall:
# System Settings → Network → Firewall → Options
# Add Node.js to allowed apps
```

### Option B: Use Browser DevTools (Quick Tests Only)

1. Open Chrome DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Select device: iPhone 14 Pro, Pixel 7, iPad Air
4. Test at different resolutions

**⚠️ Warning**: DevTools emulation is NOT the same as real devices. Always test on physical devices before launch.

---

## Part 2: Critical Test Scenarios (6 hours)

### Test 1: Navigation Menu (1 hour)

#### Desktop Behavior (verify first)
- Hover over "Trips" → dropdown appears
- Hover over "Analytics" → dropdown appears
- Click items in dropdown → navigates correctly

#### Mobile Test Checklist

**Issue**: Hover doesn't work on touch screens

| Test | Expected Behavior | Pass/Fail | Notes |
|------|------------------|-----------|-------|
| Tap "Trips" link | Dropdown opens OR navigates to /trips | ⬜ | |
| If dropdown opens, tap outside | Dropdown closes | ⬜ | |
| Tap "Analytics" | Dropdown opens OR shows upgrade prompt | ⬜ | |
| Hamburger menu icon visible | On screens < 768px | ⬜ | |
| Hamburger menu opens | Full-screen or slide-out menu | ⬜ | |
| All nav links accessible | Can reach every page | ⬜ | |
| Currency dropdown works | Can change currency | ⬜ | |
| "Add Trip" button visible | Primary CTA accessible | ⬜ | |

**Common Issues**:
- Dropdown requires click, not hover
- Menu doesn't close after selection
- Items overlap or are cut off
- Buttons too small to tap (< 44×44px)

**Fix Required**: Implement mobile menu (see UX Improvements Guide #12)

---

### Test 2: Trip Entry Form (2 hours)

Navigate to `/data` (Add Trip page)

#### Form Usability Checklist

| Test | Expected Behavior | Pass/Fail | Notes |
|------|------------------|-----------|-------|
| All labels visible | Text not cut off | ⬜ | |
| Input fields large enough | Min height 44px | ⬜ | |
| Tap input → keyboard appears | Correct keyboard type | ⬜ | |
| Number inputs | Numeric keyboard | ⬜ | |
| Email input | Email keyboard (@, .com keys) | ⬜ | |
| Date picker works | Native mobile date picker | ⬜ | |
| Dropdown selects work | Country, currency, etc. | ⬜ | |
| Autocomplete suggestions | Visible and tappable | ⬜ | |
| Calculate buttons work | Real-time calculations | ⬜ | |
| Scroll through long form | No fixed elements blocking | ⬜ | |
| Submit button always visible | Sticky or accessible | ⬜ | |
| Error messages readable | Red text, clear message | ⬜ | |
| Form doesn't zoom on focus | Inputs min 16px font | ⬜ | |

**Common Issues**:
```
Issue: Page zooms when tapping input
Fix: Ensure input font-size ≥ 16px
<input className="text-base" /> // 16px minimum
```

```
Issue: Autocomplete dropdown off-screen
Fix: Adjust max-height and positioning
<div className="max-h-48 overflow-y-auto">
```

```
Issue: Number input too small
Fix: Increase touch target size
<input type="number" className="min-h-[44px] px-4" />
```

#### Specific Field Tests

**Date Inputs**:
- iOS: Should show wheel picker
- Android: Should show calendar picker
- Test: Select date → verify format (YYYY-MM-DD)

**Vendor Autocomplete**:
- Type "Delta" → suggestions appear
- Tap suggestion → fills field
- Clear field → suggestions disappear

**Commission Calculation**:
- Enter trip cost: $1000
- Enter commission: 10%
- Revenue should show: $100 (in green)
- Change to flat fee: $50
- Revenue should update to: $50

---

### Test 3: Trips Table (1 hour)

Navigate to `/trips`

#### Table Display Checklist

| Test | Expected Behavior | Pass/Fail | Notes |
|------|------------------|-----------|-------|
| Table renders | All data visible | ⬜ | |
| Horizontal scroll works | Can scroll to see all columns | ⬜ | |
| Scroll indicators visible | Shadow/fade showing more content | ⬜ | |
| Column headers readable | Text not truncated | ⬜ | |
| Sort buttons work | Tap header → sorts ascending/descending | ⬜ | |
| Row selection works | Can tap rows | ⬜ | |
| Action buttons tappable | Edit, delete, view buttons work | ⬜ | |
| Pagination controls work | Next/previous page | ⬜ | |
| Empty state shows | If no trips | ⬜ | |

**Issue**: Large tables are difficult on mobile

**Recommended**: Add card view for mobile

```tsx
{/* Desktop: Table */}
<div className="hidden md:block">
  <table>{/* ... */}</table>
</div>

{/* Mobile: Cards */}
<div className="md:hidden space-y-4">
  {trips.map(trip => (
    <div key={trip.id} className="bg-white border rounded-lg p-4">
      <h3 className="font-bold">{trip.Client_Name}</h3>
      <p className="text-sm text-gray-600">{trip.Destination_Country}</p>
      <div className="mt-2 flex justify-between">
        <span className="text-sm">{formatCurrency(trip.Total_Cost)}</span>
        <button className="text-blue-600">View</button>
      </div>
    </div>
  ))}
</div>
```

---

### Test 4: Filters & Search (30 min)

#### Filter Controls Checklist

| Test | Expected Behavior | Pass/Fail | Notes |
|------|------------------|-----------|-------|
| Filter dropdowns open | Agency, country, vendor filters | ⬜ | |
| Multi-select works | Can select multiple options | ⬜ | |
| Search input works | Can type and search | ⬜ | |
| Date range picker works | Select start/end dates | ⬜ | |
| "Clear filters" button works | Resets all filters | ⬜ | |
| Filters are stackable | Apply multiple filters | ⬜ | |
| Results update immediately | Real-time filtering | ⬜ | |

---

### Test 5: Export Functions (30 min)

#### Export Button Tests

| Test | Expected Behavior | Pass/Fail | Notes |
|------|------------------|-----------|-------|
| Export buttons visible | CSV, Excel, PDF | ⬜ | |
| Buttons large enough | Min 44×44px tap target | ⬜ | |
| Tap CSV → downloads file | Opens save dialog or downloads | ⬜ | |
| Tap Excel → downloads file | .xlsx file downloads | ⬜ | |
| Tap PDF → generates report | PDF opens or downloads | ⬜ | |
| Loading state shows | Button shows "Generating..." | ⬜ | |
| Success feedback | Toast or message confirms | ⬜ | |
| File opens on device | Can view in Files app or browser | ⬜ | |

**Mobile-Specific Issues**:
- Downloads may not be obvious (no desktop-style download bar)
- Files may open in-app or require "Open in..." menu
- Large PDFs may be slow to generate

---

### Test 6: Bulk Import Modal (30 min)

Navigate to `/trips` → Click "Import"

#### Modal Checklist

| Test | Expected Behavior | Pass/Fail | Notes |
|------|------------------|-----------|-------|
| Modal opens | Covers screen, readable | ⬜ | |
| Close button works | X button tappable | ⬜ | |
| Tap outside closes | Backdrop tap closes modal | ⬜ | |
| File picker works | Can select file from device | ⬜ | |
| Drag & drop disabled | Not available on mobile | ⬜ | |
| Upload button works | Processes file | ⬜ | |
| Progress bar visible | Shows upload progress | ⬜ | |
| Results screen readable | Success/error messages | ⬜ | |
| Error details scrollable | Can read full error list | ⬜ | |
| "Done" button works | Closes modal | ⬜ | |

**Common Mobile Issues**:
- Modal too large (overflows screen)
- Text too small to read
- Buttons at bottom require scrolling
- File picker doesn't open (permissions issue)

---

### Test 7: Authentication Flows (30 min)

#### Registration Form (Mobile)

| Test | Expected Behavior | Pass/Fail | Notes |
|------|------------------|-----------|-------|
| All fields visible | No horizontal scroll | ⬜ | |
| Password show/hide works | Eye icon toggles visibility | ⬜ | |
| Validation errors readable | Red text, adequate size | ⬜ | |
| Terms checkboxes tappable | Large enough tap target | ⬜ | |
| Submit button accessible | Always visible | ⬜ | |
| Keyboard doesn't block fields | Page scrolls with keyboard | ⬜ | |

#### Login Form

| Test | Expected Behavior | Pass/Fail | Notes |
|------|------------------|-----------|-------|
| Email autofill works | OS password manager suggests | ⬜ | |
| "Remember me" checkbox tappable | Large tap target | ⬜ | |
| "Forgot password" link works | Navigation works | ⬜ | |
| Error messages visible | Above/below form | ⬜ | |

---

### Test 8: Quick Add Trip (15 min)

On `/trips` page, test collapsible Quick Add form

| Test | Expected Behavior | Pass/Fail | Notes |
|------|------------------|-----------|-------|
| Form expands | Smooth animation | ⬜ | |
| Form is usable | All fields accessible | ⬜ | |
| Autocomplete works | Suggestions appear | ⬜ | |
| Cancel button works | Collapses form | ⬜ | |
| Submit works | Saves trip, shows success | ⬜ | |

---

### Test 9: Analytics Dashboard (30 min)

Navigate to `/analytics` (Standard+ tier required)

| Test | Expected Behavior | Pass/Fail | Notes |
|------|------------------|-----------|-------|
| Charts render | Visible and scaled correctly | ⬜ | |
| Charts are interactive | Can tap data points | ⬜ | |
| Legend readable | Text adequate size | ⬜ | |
| KPI cards stack | Vertical on mobile | ⬜ | |
| Tables scroll | Horizontal scroll works | ⬜ | |
| Filters work | Dropdown filters functional | ⬜ | |
| Page doesn't crash | All data loads | ⬜ | |

**Common Issues**:
- Charts too small
- Legend overlaps chart
- Touch interactions don't work
- Axis labels truncated

---

### Test 10: Account & Settings (15 min)

#### Account Page

| Test | Expected Behavior | Pass/Fail | Notes |
|------|------------------|-----------|-------|
| Profile info editable | Can update name, email | ⬜ | |
| Password change works | Form accessible | ⬜ | |
| Save button works | Updates profile | ⬜ | |

#### Subscription Page

| Test | Expected Behavior | Pass/Fail | Notes |
|------|------------------|-----------|-------|
| Current plan displayed | Tier badge visible | ⬜ | |
| Upgrade buttons work | Navigate to pricing | ⬜ | |
| Manage subscription link works | Opens Stripe portal | ⬜ | |
| Stripe portal is mobile-friendly | (External, verify UX) | ⬜ | |

---

## Part 3: Performance Testing (30 min)

### Load Time Tests

Use Chrome DevTools → Network tab → Throttle to "Slow 3G"

| Page | Target Load Time | Actual | Pass/Fail |
|------|------------------|--------|-----------|
| Landing page | < 3 seconds | | ⬜ |
| /trips | < 3 seconds | | ⬜ |
| /data (form) | < 2 seconds | | ⬜ |
| /analytics | < 4 seconds | | ⬜ |

### Lighthouse Mobile Audit

```bash
# Run Lighthouse in Chrome DevTools
1. Open DevTools → Lighthouse tab
2. Select "Mobile" device
3. Check all categories
4. Click "Analyze page load"
```

**Target Scores**:
- Performance: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 95
- SEO: ≥ 90

### Core Web Vitals (Mobile)

| Metric | Target | Actual | Pass/Fail |
|--------|--------|--------|-----------|
| **LCP** (Largest Contentful Paint) | < 2.5s | | ⬜ |
| **FID** (First Input Delay) | < 100ms | | ⬜ |
| **CLS** (Cumulative Layout Shift) | < 0.1 | | ⬜ |

---

## Part 4: Real-World Usage Scenarios (1 hour)

### Scenario 1: Business Owner on iPhone

**Context**: User is at a client meeting, needs to check trip details quickly

**Steps**:
1. Open VoyagrIQ on iPhone Safari
2. Sign in (use password manager)
3. Navigate to Trips page
4. Use search to find client "Smith Travel"
5. Tap trip to view details
6. View commission revenue
7. Export PDF report
8. Share report via email

**Pass Criteria**:
- ✅ Completed in < 2 minutes
- ✅ No errors or UI issues
- ✅ PDF is readable on mobile
- ✅ Share sheet works

### Scenario 2: Travel Agent Adding Trip on Android

**Context**: Just closed a deal, needs to log trip immediately

**Steps**:
1. Open VoyagrIQ on Android Chrome
2. Sign in
3. Navigate to "Add Trip"
4. Fill out form (15+ fields)
5. Use autocomplete for client name (returning customer)
6. Calculate commission
7. Submit form
8. Verify trip appears in list

**Pass Criteria**:
- ✅ Form is usable (no keyboard issues)
- ✅ Autocomplete works
- ✅ Commission calculates correctly
- ✅ Success message shows
- ✅ Completed in < 5 minutes

### Scenario 3: Agency Manager Reviewing Analytics on iPad

**Context**: Weekly review of agency performance

**Steps**:
1. Open VoyagrIQ on iPad Safari
2. Navigate to Analytics
3. View revenue charts
4. Filter by last 30 days
5. Sort agencies by revenue
6. Export Excel report
7. View report in Numbers app

**Pass Criteria**:
- ✅ Charts are readable and interactive
- ✅ Filters work smoothly
- ✅ Export completes successfully
- ✅ File opens correctly

---

## Part 5: Cross-Browser Testing (30 min)

### iOS Browsers

| Browser | Version | Test Result | Critical Issues |
|---------|---------|-------------|-----------------|
| Safari | iOS 16+ | ⬜ | |
| Chrome | iOS 16+ | ⬜ | |
| Firefox | iOS 16+ | ⬜ | |

**Note**: All iOS browsers use WebKit engine, so Safari test is most important

### Android Browsers

| Browser | Version | Test Result | Critical Issues |
|---------|---------|-------------|-----------------|
| Chrome | Latest | ⬜ | |
| Samsung Internet | Latest | ⬜ | |
| Firefox | Latest | ⬜ | |

---

## Common Mobile Issues & Quick Fixes

### Issue 1: Viewport Zooming on Input Focus

**Symptom**: Page zooms in when tapping input fields

**Cause**: Input font-size < 16px

**Fix**:
```tsx
// Ensure all inputs have min 16px font
<input className="text-base" /> // text-base = 16px
```

### Issue 2: Buttons Too Small to Tap

**Symptom**: Tapping buttons is difficult, requires precision

**Cause**: Buttons < 44×44px (Apple's minimum tap target)

**Fix**:
```tsx
<button className="min-h-[44px] px-4 py-2">
  Export
</button>
```

### Issue 3: Horizontal Scroll on Mobile

**Symptom**: Page is wider than screen, requires horizontal scroll

**Cause**: Fixed-width elements, long text, or large tables

**Fix**:
```tsx
// Check for:
- width: 1200px (use max-w-full instead)
- min-width on containers
- overflow-x-auto on tables
```

### Issue 4: Modal Covers Entire Screen

**Symptom**: Modal is too large, can't see close button

**Fix**:
```tsx
<div className="max-h-[90vh] overflow-y-auto">
  {/* modal content */}
</div>
```

### Issue 5: Form Fields Hidden by Keyboard

**Symptom**: Keyboard covers submit button or current field

**Fix**:
```tsx
// Ensure form fields are in scrollable container
<form className="overflow-y-auto pb-24">
  {/* fields */}
</form>
```

### Issue 6: Dropdowns Cut Off at Screen Edge

**Symptom**: Dropdown menu extends below fold or off-screen

**Fix**:
```tsx
// Use Radix UI or Headless UI for auto-positioning
<Select.Root>
  <Select.Viewport className="max-h-48" />
</Select.Root>
```

---

## Issue Tracking Template

Use this to document issues found during testing:

```markdown
## Issue #1: Navigation dropdown doesn't work on mobile

**Severity**: 🔴 Critical
**Device**: iPhone 14, iOS 17, Safari
**Page**: All pages with navigation

**Steps to Reproduce**:
1. Open VoyagrIQ on iPhone
2. Tap "Trips" in navigation
3. Observe: Nothing happens (expects dropdown)

**Expected Behavior**: Dropdown menu should appear with options

**Actual Behavior**: No response to tap, navigation doesn't work

**Screenshot**: [attach screenshot]

**Fix Required**: Implement mobile menu with tap-to-open dropdown

**Estimated Effort**: 3 hours

**Priority**: Fix before launch
```

---

## Final Checklist Before Launch

### Critical (Must Pass)

- [ ] Navigation works on iPhone and Android
- [ ] All forms are usable on mobile
- [ ] Export functions work on mobile
- [ ] Import modal works on mobile
- [ ] Authentication flows work on mobile
- [ ] No critical accessibility issues
- [ ] Lighthouse mobile score ≥ 80

### Important (Should Pass)

- [ ] Charts/analytics render correctly
- [ ] Tables are usable (scrollable or card view)
- [ ] All buttons meet 44×44px tap target
- [ ] Text is readable (min 14px, ideally 16px)
- [ ] No viewport zooming on input focus
- [ ] Performance: pages load < 3 seconds on 3G

### Nice to Have

- [ ] Lighthouse mobile score ≥ 90
- [ ] PWA manifest installed
- [ ] Offline mode works
- [ ] Add to Home Screen works
- [ ] Touch gestures (swipe to delete, etc.)

---

## Summary Report Template

After completing all tests, fill out this report:

```markdown
# Mobile Testing Report - VoyagrIQ

**Date**: [Date]
**Tester**: [Name]
**Time Spent**: [Hours]

## Devices Tested
- iPhone 14 Pro (iOS 17.2) - Safari
- Samsung Galaxy S23 (Android 14) - Chrome
- iPad Air (iOS 17.2) - Safari

## Test Results Summary

**Total Tests**: 150
**Passed**: 132 (88%)
**Failed**: 18 (12%)
**Critical Issues**: 3
**Medium Issues**: 10
**Minor Issues**: 5

## Critical Issues (Must Fix)

1. **Navigation dropdown doesn't work on mobile**
   - Severity: 🔴 Critical
   - Fix required before launch

2. **Trip entry form: keyboard covers submit button**
   - Severity: 🔴 Critical
   - Fix required before launch

3. **Export PDF hangs on iOS Safari**
   - Severity: 🔴 Critical
   - Fix required before launch

## Recommendation

**DO NOT LAUNCH** until critical issues are resolved.

Estimated fix time: 8-12 hours

Retest after fixes implemented.
```

---

## Resources

- **Chrome DevTools Device Mode**: https://developer.chrome.com/docs/devtools/device-mode/
- **iOS Safari Web Inspector**: https://webkit.org/web-inspector/
- **Android Chrome Remote Debugging**: https://developer.chrome.com/docs/devtools/remote-debugging/
- **Lighthouse CI**: https://github.com/GoogleChrome/lighthouse-ci
- **BrowserStack** (paid): https://www.browserstack.com/
- **LambdaTest** (paid): https://www.lambdatest.com/

---

**Next Steps**:
1. Schedule 8-hour mobile testing session
2. Test on physical devices
3. Document all issues
4. Prioritize fixes
5. Implement fixes
6. Retest
7. Sign off for production launch

**Status**: ⚠️ REQUIRED BEFORE PRODUCTION LAUNCH
