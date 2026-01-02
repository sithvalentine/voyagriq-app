# Microsoft Edge Browser Testing Checklist

**App:** VoyagrIQ Travel Analytics
**Date:** ___________
**Edge Version:** ___________
**OS:** ___________
**Tester:** ___________

---

## 🏠 Homepage Testing

- [ ] Hero section displays correctly
- [ ] "Start 14-Day Free Trial" button works
- [ ] "View Pricing" button scrolls to pricing section smoothly
- [ ] Pricing cards render properly (Starter, Standard, Premium)
- [ ] Tier pricing displays: $49, $99, $199
- [ ] Feature lists render with checkmarks
- [ ] All buttons are clickable and have proper hover states
- [ ] Footer links work
- [ ] Responsive design works (resize browser window)

**Issues found:**
```
[Write any issues here]
```

---

## 🔐 Authentication Testing

### Registration Flow
- [ ] Navigate to registration page from homepage
- [ ] Can select tier (Starter/Standard/Premium) from dropdown or URL param
- [ ] Email field accepts valid emails
- [ ] Password field shows/hides properly
- [ ] "Create Account" button submits form
- [ ] Form validation works (invalid email, weak password)
- [ ] After registration, redirects to Stripe checkout

**Issues found:**
```
[Write any issues here]
```

### Stripe Checkout (CRITICAL)
- [ ] Stripe checkout page loads properly
- [ ] 14-day trial message displays correctly
- [ ] Payment methods show (Card, Apple Pay, Google Pay, etc.)
  - **Note:** Apple Pay requires macOS, Google Pay may require Chrome/Android
  - [ ] Credit/Debit card form works
  - [ ] Apple Pay visible? (if on macOS)
  - [ ] Google Pay visible?
- [ ] Test mode card (4242 4242 4242 4242) processes successfully
- [ ] After payment, redirects back to app
- [ ] User is logged in after successful payment

**Issues found:**
```
[Write any issues here]
```

### Login Flow
- [ ] Can navigate to login page
- [ ] Email and password fields work
- [ ] "Sign In" button submits form
- [ ] Error messages display for invalid credentials
- [ ] Successful login redirects to trips dashboard
- [ ] "Forgot Password" link works (if implemented)

**Issues found:**
```
[Write any issues here]
```

---

## 📊 Dashboard Testing

### All Trips View
- [ ] Trips list renders with all data
- [ ] Filter dropdowns work (Date Range, Agency, Country, City)
- [ ] Search functionality works
- [ ] Sorting columns works (click headers)
- [ ] Trip cards display correctly with all details
- [ ] Currency displays properly ($ symbol, formatting)
- [ ] "View Details" button works
- [ ] Stats cards at top show correct numbers
- [ ] Charts render (pie charts, bar charts)

**Issues found:**
```
[Write any issues here]
```

### Trip Detail View
- [ ] Navigate to a single trip
- [ ] All trip information displays correctly
- [ ] Cost breakdown table shows all categories
- [ ] Pie chart renders properly
- [ ] Business Intelligence section visible (Standard/Premium only)
- [ ] KPI boxes render correctly
- [ ] Cost Optimization Opportunities display
- [ ] "Edit" button works
- [ ] "Delete" button works with confirmation

**Issues found:**
```
[Write any issues here]
```

---

## 📄 PDF Export Testing (CRITICAL)

### Starter Tier PDF
- [ ] Navigate to a trip detail page (as Starter tier user)
- [ ] Click "Export PDF" button
- [ ] PDF downloads successfully
- [ ] PDF opens in Edge's built-in PDF viewer
- [ ] Page 1 renders correctly (trip info, breakdown, chart)
- [ ] No Business Intelligence section (correct for Starter)
- [ ] Text is readable (no encoding issues)
- [ ] No overlapping text
- [ ] Footer shows "Starter Plan"
- [ ] PDF can be saved to disk
- [ ] PDF can be printed from Edge

**Issues found:**
```
[Write any issues here]
```

### Standard Tier PDF
- [ ] Switch to Standard tier (dev mode or actual subscription)
- [ ] Navigate to a trip detail page
- [ ] Click "Export PDF" button
- [ ] PDF downloads successfully
- [ ] Page 1: Trip info, breakdown, chart ✓
- [ ] Page 2: Business Intelligence section ✓
  - [ ] Executive Summary box renders
  - [ ] 3 KPI boxes render correctly
  - [ ] No text overlapping in KPI boxes
- [ ] Page 3: Cost Optimization Opportunities
  - [ ] Section header "Cost Optimization Opportunities" visible
  - [ ] Top 3 opportunities display
  - [ ] Priority badges (High/Medium/Low) visible
  - [ ] **CRITICAL:** Priority badge does NOT overlap category text
  - [ ] Check "Travel Insurance" + "High" badge specifically
  - [ ] Recommendation text wraps properly
  - [ ] "Potential Savings" displays in green
  - [ ] No text cutoff or overflow
- [ ] Footer shows "Standard Plan"
- [ ] All pages have page numbers
- [ ] PDF total: 2-3 pages

**Issues found:**
```
[Write any issues here]
```

### Premium Tier PDF
- [ ] Switch to Premium tier
- [ ] Export PDF from trip detail page
- [ ] Same checks as Standard tier above
- [ ] Footer shows "Premium Plan"
- [ ] Additional BI content if applicable

**Issues found:**
```
[Write any issues here]
```

---

## 📤 CSV/Excel Export Testing

### CSV Export
- [ ] Click "Export CSV" button from trips list or detail
- [ ] CSV file downloads
- [ ] Open CSV in Excel or text editor
- [ ] All columns present
- [ ] Data formats correctly (dates, currency, numbers)
- [ ] No encoding issues (special characters, commas)

**Issues found:**
```
[Write any issues here]
```

### Excel Export
- [ ] Click "Export Excel" button
- [ ] .xlsx file downloads
- [ ] Open in Microsoft Excel or similar
- [ ] All sheets/tabs present
- [ ] Data formats correctly
- [ ] Formulas work (if any)
- [ ] Currency symbols display correctly

**Issues found:**
```
[Write any issues here]
```

---

## ⚙️ Settings & Account Testing

### Account Page
- [ ] Navigate to /account
- [ ] User name displays
- [ ] Email displays
- [ ] Current tier badge shows (Starter/Standard/Premium)
- [ ] Trial status displays correctly (if in trial)
- [ ] Days left in trial accurate
- [ ] Subscription details correct
- [ ] "Upgrade" button works (if on Starter/Standard)
- [ ] Dev mode toggle works (if visible)

**Issues found:**
```
[Write any issues here]
```

### Currency Settings
- [ ] Navigate to currency settings
- [ ] Currency dropdown shows all options (USD, EUR, GBP, etc.)
- [ ] Change currency
- [ ] All prices update across the app
- [ ] Currency symbols display correctly ($ £ € ¥)
- [ ] PDF exports use selected currency

**Issues found:**
```
[Write any issues here]
```

---

## 🎨 UI/UX Testing

### Visual Consistency
- [ ] All fonts render correctly (no fallback fonts)
- [ ] Colors match design (blues, purples, greens)
- [ ] Buttons have proper hover states
- [ ] Input fields have focus states
- [ ] Modals/popups center correctly
- [ ] Loading spinners display when needed
- [ ] Error messages styled properly
- [ ] Success messages styled properly

**Issues found:**
```
[Write any issues here]
```

### Charts & Visualizations
- [ ] Pie charts render correctly (Recharts library)
- [ ] Bar charts render correctly
- [ ] Chart colors are distinct
- [ ] Legends display properly
- [ ] Tooltips show on hover
- [ ] Charts resize with window

**Issues found:**
```
[Write any issues here]
```

### Responsive Design
- [ ] Resize window to 1920x1080 (full desktop)
- [ ] Resize to 1366x768 (small laptop)
- [ ] Resize to 1024x768 (tablet landscape)
- [ ] Test mobile view (toggle device emulation in DevTools)
- [ ] Navigation menu works at all sizes
- [ ] Tables scroll or stack properly on mobile
- [ ] Buttons remain accessible

**Issues found:**
```
[Write any issues here]
```

---

## 🔄 State Management & Data Persistence

### Local Storage
- [ ] Trip data persists after page refresh
- [ ] User preferences save (currency, filters)
- [ ] Dev mode setting persists
- [ ] Logout clears sensitive data

**Issues found:**
```
[Write any issues here]
```

### Supabase Integration
- [ ] User profile loads correctly
- [ ] Trip data syncs with database
- [ ] Real-time updates work (if implemented)
- [ ] Offline behavior graceful (if applicable)

**Issues found:**
```
[Write any issues here]
```

---

## ⚡ Performance Testing

### Page Load Times
- [ ] Homepage loads < 3 seconds
- [ ] Dashboard loads < 3 seconds
- [ ] Trip detail loads < 2 seconds
- [ ] PDF generation < 5 seconds

**Issues found:**
```
[Write any issues here]
```

### Browser DevTools Console
- [ ] Open DevTools (F12)
- [ ] Check Console tab for errors (red messages)
- [ ] Check Network tab for failed requests
- [ ] Check for 404 errors or CORS issues

**Issues found:**
```
[Write any issues here]
```

---

## 🔒 Security & Privacy

### HTTPS/SSL
- [ ] Site loads over HTTPS (lock icon in address bar)
- [ ] No mixed content warnings
- [ ] External resources load over HTTPS

**Issues found:**
```
[Write any issues here]
```

### Data Privacy
- [ ] Stripe API keys not exposed in client code
- [ ] Supabase keys appropriate (anon key only)
- [ ] No sensitive data in URLs
- [ ] No credentials in console logs

**Issues found:**
```
[Write any issues here]
```

---

## 🐛 Edge-Specific Known Issues

### Common Edge Quirks to Check
- [ ] flexbox rendering (check layouts)
- [ ] CSS Grid compatibility
- [ ] SVG rendering (icons, charts)
- [ ] Web fonts loading
- [ ] localStorage access
- [ ] Form autofill behavior
- [ ] PDF blob handling
- [ ] File download prompts
- [ ] Print preview functionality

**Issues found:**
```
[Write any issues here]
```

---

## ✅ Final Checklist

- [ ] All critical features work (auth, trips, exports)
- [ ] No JavaScript errors in console
- [ ] No visual glitches or layout issues
- [ ] PDF exports work correctly with no overlapping text
- [ ] Stripe integration works
- [ ] Performance is acceptable
- [ ] App is usable for target users (travel advisors)

**Overall Assessment:**
```
Pass / Fail / Needs Work

Summary of major issues:
[List critical issues that must be fixed]

Summary of minor issues:
[List nice-to-have fixes]
```

---

## 📸 Screenshots

Attach screenshots of any issues found:
- [ ] Homepage issue screenshots
- [ ] PDF export issues (especially page 3 optimization section)
- [ ] Layout problems
- [ ] Console errors

---

## 🔧 Testing Environment Details

**Browser:** Microsoft Edge
**Version:** ___________
**Operating System:** ___________
**Screen Resolution:** ___________
**Date Tested:** ___________
**Tested By:** ___________

---

## 📝 Notes & Additional Observations

```
[Add any additional notes, observations, or context here]
```
