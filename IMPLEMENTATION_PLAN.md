# Comprehensive Implementation Plan
## Enhanced BI Reports & Premium Features

---

## Executive Summary

This plan addresses the 3 major remaining issues:
1. **Enhanced BI Reports** - Expand from 3 pages to 10-40 pages depending on tier
2. **Premium Tier Features** - Implement all promised premium capabilities
3. **Report Quality** - Make reports professional and substantial

**Total Estimated Time:** 20-25 hours
**Priority Order:** Reports → White-Label → API → Tags → Exports → Integrations

---

## Phase 1: Enhanced BI Reports (HIGH PRIORITY)
### Estimated Time: 8-10 hours

This is the foundation that affects all tiers and provides core value.

### 1.1 Starter Tier Reports (Target: 8-10 pages)
**File to Modify:** `app/reports/page.tsx` and create new `lib/reportGenerator.ts`

#### Page 1: Executive Summary
**Data Points:**
- Total trips in period
- Total revenue (commission)
- Total trip costs
- Average commission rate
- Average trip cost
- Month-over-month growth
- Top destination
- Top traveler
- Key performance indicators

**Visualizations:**
- Revenue trend line chart (last 6 months)
- Commission distribution pie chart
- Trip volume bar chart by month

**Implementation:**
```typescript
interface ExecutiveSummary {
  totalTrips: number;
  totalRevenue: number;
  totalCosts: number;
  avgCommissionRate: number;
  avgTripCost: number;
  momGrowth: number;
  topDestination: string;
  topTraveler: string;
  kpis: {
    tripConversionRate: number;
    avgBookingLeadTime: number;
    repeatTravelerRate: number;
  };
}
```

#### Pages 2-3: Destination Analysis
**Data Points:**
- Top 10 destinations by revenue
- Top 10 destinations by trip count
- Destination profitability (revenue vs cost)
- Geographic distribution
- Seasonal patterns by destination
- Growth trends by destination

**Visualizations:**
- Horizontal bar chart: Revenue by destination
- Scatter plot: Trip count vs average revenue
- Heat map: Destinations by month
- Map visualization (if possible)

**Implementation:**
```typescript
interface DestinationAnalysis {
  topByRevenue: Array<{
    country: string;
    revenue: number;
    tripCount: number;
    avgRevenue: number;
    growthRate: number;
  }>;
  topByCount: Array<{
    country: string;
    tripCount: number;
    totalRevenue: number;
  }>;
  profitability: Array<{
    country: string;
    margin: number;
    profitMarginPercent: number;
  }>;
  seasonality: Record<string, Array<{ month: string; count: number }>>;
}
```

#### Pages 4-5: Commission Breakdown
**Data Points:**
- Commission by destination
- Commission by agency
- Commission rate distribution
- Commission trends over time
- High-value vs low-value bookings
- Commission efficiency metrics

**Visualizations:**
- Stacked bar chart: Commission by month and agency
- Line chart: Commission rate trends
- Box plot: Commission distribution
- Waterfall chart: Commission sources

**Implementation:**
```typescript
interface CommissionBreakdown {
  byDestination: Array<{
    country: string;
    totalCommission: number;
    avgCommissionRate: number;
    tripCount: number;
  }>;
  byAgency: Array<{
    agency: string;
    totalCommission: number;
    avgRate: number;
    tripCount: number;
    percentOfTotal: number;
  }>;
  rateDistribution: {
    under5percent: number;
    between5and10: number;
    between10and15: number;
    over15percent: number;
  };
  trends: Array<{ month: string; avgRate: number; total: number }>;
}
```

#### Pages 6-7: Trip Cost Analysis
**Data Points:**
- Average trip cost by destination
- Trip cost distribution (ranges)
- Cost trends over time
- Cost vs commission correlation
- High-cost vs low-cost trip analysis
- Budget efficiency metrics

**Visualizations:**
- Histogram: Trip cost distribution
- Line chart: Average cost trends
- Scatter plot: Cost vs commission
- Box plot: Cost by destination

**Implementation:**
```typescript
interface TripCostAnalysis {
  avgByDestination: Array<{
    country: string;
    avgCost: number;
    minCost: number;
    maxCost: number;
    stdDeviation: number;
  }>;
  distribution: {
    under1000: number;
    between1000and3000: number;
    between3000and5000: number;
    between5000and10000: number;
    over10000: number;
  };
  trends: Array<{ month: string; avgCost: number; totalCost: number }>;
  costVsCommission: Array<{
    costRange: string;
    avgCommission: number;
    avgCommissionRate: number;
  }>;
}
```

#### Pages 8-9: Traveler Insights
**Data Points:**
- Top travelers by spend
- Top travelers by trip count
- Repeat vs new travelers
- Traveler lifetime value
- Traveler preferences (destinations, agencies)
- Traveler booking patterns

**Visualizations:**
- Horizontal bar chart: Top travelers
- Pie chart: New vs repeat travelers
- Timeline: Traveler activity
- Matrix: Traveler preferences

**Implementation:**
```typescript
interface TravelerInsights {
  topBySpend: Array<{
    traveler: string;
    totalSpent: number;
    tripCount: number;
    avgTripCost: number;
    lifetimeValue: number;
  }>;
  topByCount: Array<{
    traveler: string;
    tripCount: number;
    totalSpent: number;
  }>;
  repeatVsNew: {
    repeatTravelers: number;
    newTravelers: number;
    repeatRate: number;
  };
  preferences: Array<{
    traveler: string;
    favoriteDestination: string;
    favoriteAgency: string;
    avgBookingLeadTime: number;
  }>;
}
```

#### Page 10: Recommendations & Next Steps
**Content:**
- Key insights summary
- Top 3 opportunities
- Top 3 risks
- Recommended actions
- Growth strategies
- Optimization suggestions

**Implementation:**
```typescript
interface Recommendations {
  keyInsights: string[];
  opportunities: Array<{
    title: string;
    description: string;
    potentialImpact: 'High' | 'Medium' | 'Low';
    effort: 'High' | 'Medium' | 'Low';
  }>;
  risks: Array<{
    title: string;
    description: string;
    severity: 'High' | 'Medium' | 'Low';
    mitigation: string;
  }>;
  actions: string[];
}
```

---

### 1.2 Standard Tier Reports (Target: 17-23 pages)
**Includes all Starter pages PLUS:**

#### Pages 11-13: Advanced Analytics
**New Data Points:**
- Seasonal trends analysis
- Booking patterns (day of week, time of day)
- Lead time analysis (booking to travel date)
- Cancellation rates (if tracked)
- Booking velocity
- Peak season identification

**Visualizations:**
- Heat map: Bookings by day/month
- Line chart: Lead time trends
- Area chart: Seasonal patterns
- Funnel chart: Booking pipeline

**Implementation:**
```typescript
interface AdvancedAnalytics {
  seasonalTrends: Array<{
    season: 'Spring' | 'Summer' | 'Fall' | 'Winter';
    tripCount: number;
    avgRevenue: number;
    popularDestinations: string[];
  }>;
  bookingPatterns: {
    byDayOfWeek: Record<string, number>;
    byTimeOfDay: Record<string, number>;
    peakBookingDays: string[];
  };
  leadTimeAnalysis: {
    avgLeadTime: number;
    byDestination: Array<{ country: string; avgLeadTime: number }>;
    leadTimeDistribution: Record<string, number>;
  };
  velocityMetrics: {
    bookingsPerWeek: number;
    trendDirection: 'Up' | 'Down' | 'Stable';
    acceleration: number;
  };
}
```

#### Pages 14-16: Agency Performance Comparison
**New Data Points:**
- Agency-by-agency breakdown
- Performance rankings
- Commission comparison
- Market share analysis
- Agency specializations
- Partnership strength metrics

**Visualizations:**
- Comparison table with sparklines
- Radar chart: Agency capabilities
- Treemap: Market share
- Bubble chart: Performance matrix

**Implementation:**
```typescript
interface AgencyComparison {
  agencies: Array<{
    name: string;
    rank: number;
    tripCount: number;
    revenue: number;
    avgCommissionRate: number;
    marketShare: number;
    specializations: string[];
    performanceScore: number;
    strengths: string[];
    weaknesses: string[];
  }>;
  benchmarks: {
    avgCommissionRate: number;
    topPerformerRate: number;
    industryAverage: number;
  };
  recommendations: string[];
}
```

#### Pages 17-19: Predictive Insights
**New Data Points:**
- Revenue forecasting (next 3-6 months)
- Trend predictions
- Opportunity identification
- Risk analysis
- Growth projections
- Scenario modeling

**Visualizations:**
- Forecast line chart with confidence intervals
- Trend projection chart
- Opportunity matrix
- Risk heat map

**Implementation:**
```typescript
interface PredictiveInsights {
  forecast: Array<{
    month: string;
    predictedRevenue: number;
    confidenceLower: number;
    confidenceUpper: number;
    confidence: number;
  }>;
  trends: Array<{
    metric: string;
    direction: 'Up' | 'Down' | 'Stable';
    magnitude: number;
    prediction: string;
  }>;
  opportunities: Array<{
    type: 'Growth' | 'Optimization' | 'Expansion';
    title: string;
    description: string;
    potentialValue: number;
    timeframe: string;
  }>;
  risks: Array<{
    type: 'Revenue' | 'Market' | 'Operational';
    title: string;
    likelihood: number;
    impact: number;
    riskScore: number;
  }>;
}
```

#### Pages 20-21: Custom Metrics
**New Data Points:**
- Customer acquisition cost (if trackable)
- Customer lifetime value
- Booking efficiency metrics
- Revenue per employee (if tracked)
- Custom KPIs defined by user
- Business-specific insights

**Implementation:**
```typescript
interface CustomMetrics {
  standardMetrics: {
    cac: number;
    ltv: number;
    ltvCacRatio: number;
    bookingEfficiency: number;
  };
  customKPIs: Array<{
    name: string;
    value: number;
    target: number;
    percentOfTarget: number;
    trend: 'Up' | 'Down' | 'Stable';
  }>;
  businessInsights: string[];
}
```

---

### 1.3 Premium Tier Reports (Target: 30-40 pages)
**Includes all Standard pages PLUS:**

#### Pages 22-25: Executive Dashboard
**New Data Points:**
- C-suite level insights
- Strategic recommendations
- Competitive analysis (if data available)
- Market positioning
- Strategic priorities
- Board-ready metrics

**Visualizations:**
- Executive scorecard
- Strategic quadrant chart
- Competitive positioning map
- Priority matrix

**Implementation:**
```typescript
interface ExecutiveDashboard {
  strategicMetrics: {
    revenueGrowth: number;
    marketShare: number;
    profitMargin: number;
    customerSatisfaction: number;
    employeeEfficiency: number;
  };
  strategicRecommendations: Array<{
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    category: 'Growth' | 'Efficiency' | 'Risk' | 'Innovation';
    title: string;
    description: string;
    expectedImpact: string;
    timeframe: string;
    resources: string;
  }>;
  competitiveAnalysis: {
    position: 'Leader' | 'Challenger' | 'Follower';
    strengths: string[];
    opportunities: string[];
    threats: string[];
  };
}
```

#### Pages 26-30: Advanced Business Intelligence
**New Data Points:**
- Profitability analysis by segment
- Client lifetime value analysis
- Customer acquisition cost by channel
- ROI metrics by activity
- Margin analysis
- Break-even analysis

**Visualizations:**
- Profitability waterfall
- Cohort analysis charts
- ROI dashboard
- Margin trend analysis

**Implementation:**
```typescript
interface AdvancedBI {
  profitability: {
    byDestination: Array<{ country: string; profit: number; margin: number }>;
    byAgency: Array<{ agency: string; profit: number; margin: number }>;
    byTraveler: Array<{ traveler: string; ltv: number; profit: number }>;
  };
  cohortAnalysis: Array<{
    cohort: string;
    size: number;
    retention: number[];
    ltv: number;
    cac: number;
  }>;
  roiMetrics: Array<{
    activity: string;
    investment: number;
    return: number;
    roi: number;
    paybackPeriod: number;
  }>;
}
```

#### Pages 31-33: Automated Insights (AI-Generated)
**New Data Points:**
- Anomaly detection
- Pattern recognition
- Opportunity alerts
- Risk warnings
- Unusual activity identification
- Trend breaks

**Implementation:**
```typescript
interface AutomatedInsights {
  anomalies: Array<{
    type: 'Revenue' | 'Cost' | 'Volume' | 'Rate';
    description: string;
    severity: 'High' | 'Medium' | 'Low';
    detectedDate: string;
    expectedValue: number;
    actualValue: number;
    deviation: number;
  }>;
  patterns: Array<{
    pattern: string;
    description: string;
    confidence: number;
    actionable: boolean;
    recommendation: string;
  }>;
  alerts: Array<{
    priority: 'Critical' | 'Warning' | 'Info';
    title: string;
    message: string;
    action: string;
  }>;
}
```

#### Pages 34-38: White-Label & Custom
**Features:**
- Custom logo
- Custom colors
- Custom header/footer
- Custom company name
- Remove VoyagrIQ branding
- Custom report sections (user-defined)

**Implementation:**
```typescript
interface WhiteLabelConfig {
  logo: string; // URL or base64
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headerText: string;
  footerText: string;
  customSections: Array<{
    title: string;
    content: string;
    position: number;
  }>;
  branding: {
    showTripCostInsights: boolean;
    customTagline: string;
  };
}
```

---

### 1.4 Report Generation Infrastructure

#### Create `lib/reportGenerator.ts`
```typescript
export class ReportGenerator {
  private trips: Trip[];
  private tier: SubscriptionTier;
  private whiteLabelConfig?: WhiteLabelConfig;

  constructor(trips: Trip[], tier: SubscriptionTier, config?: WhiteLabelConfig) {
    this.trips = trips;
    this.tier = tier;
    this.whiteLabelConfig = config;
  }

  // Data analysis methods
  generateExecutiveSummary(): ExecutiveSummary { }
  generateDestinationAnalysis(): DestinationAnalysis { }
  generateCommissionBreakdown(): CommissionBreakdown { }
  generateTripCostAnalysis(): TripCostAnalysis { }
  generateTravelerInsights(): TravelerInsights { }
  generateRecommendations(): Recommendations { }

  // Standard tier methods
  generateAdvancedAnalytics(): AdvancedAnalytics { }
  generateAgencyComparison(): AgencyComparison { }
  generatePredictiveInsights(): PredictiveInsights { }
  generateCustomMetrics(): CustomMetrics { }

  // Premium tier methods
  generateExecutiveDashboard(): ExecutiveDashboard { }
  generateAdvancedBI(): AdvancedBI { }
  generateAutomatedInsights(): AutomatedInsights { }

  // Report compilation
  async generatePDF(): Promise<Blob> {
    const sections = this.getReportSections();
    return await this.compilePDF(sections);
  }

  async generateExcel(): Promise<Blob> {
    const sections = this.getReportSections();
    return await this.compileExcel(sections);
  }

  private getReportSections(): ReportSection[] {
    const sections: ReportSection[] = [];

    // Always include starter sections
    sections.push({ type: 'executive', data: this.generateExecutiveSummary() });
    sections.push({ type: 'destination', data: this.generateDestinationAnalysis() });
    sections.push({ type: 'commission', data: this.generateCommissionBreakdown() });
    sections.push({ type: 'cost', data: this.generateTripCostAnalysis() });
    sections.push({ type: 'traveler', data: this.generateTravelerInsights() });
    sections.push({ type: 'recommendations', data: this.generateRecommendations() });

    // Standard tier additions
    if (this.tier === 'standard' || this.tier === 'premium') {
      sections.push({ type: 'advanced', data: this.generateAdvancedAnalytics() });
      sections.push({ type: 'agency', data: this.generateAgencyComparison() });
      sections.push({ type: 'predictive', data: this.generatePredictiveInsights() });
      sections.push({ type: 'custom', data: this.generateCustomMetrics() });
    }

    // Premium tier additions
    if (this.tier === 'premium') {
      sections.push({ type: 'executive-dash', data: this.generateExecutiveDashboard() });
      sections.push({ type: 'advanced-bi', data: this.generateAdvancedBI() });
      sections.push({ type: 'automated', data: this.generateAutomatedInsights() });
    }

    return sections;
  }
}
```

#### Create `lib/chartGenerator.ts`
```typescript
export class ChartGenerator {
  static generateLineChart(data: any[], options: ChartOptions): string {
    // Return base64 image or canvas data URL
  }

  static generateBarChart(data: any[], options: ChartOptions): string { }
  static generatePieChart(data: any[], options: ChartOptions): string { }
  static generateScatterPlot(data: any[], options: ChartOptions): string { }
  static generateHeatMap(data: any[], options: ChartOptions): string { }
  static generateRadarChart(data: any[], options: ChartOptions): string { }
  static generateWaterfallChart(data: any[], options: ChartOptions): string { }
}
```

---

## Phase 2: White-Label Reports (MEDIUM PRIORITY)
### Estimated Time: 3-4 hours

### 2.1 White-Label Settings Page
**Create:** `app/settings/white-label/page.tsx`

**Features:**
- Logo upload (drag & drop)
- Company name input
- Color picker for brand colors
- Header/footer text editors
- Preview panel
- Save/reset functionality

**Implementation:**
```typescript
interface WhiteLabelSettings {
  logo: File | null;
  logoPreview: string;
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headerText: string;
  footerText: string;
  showBranding: boolean;
}

// Storage key
const WHITE_LABEL_KEY = 'voyagriq-white-label';

// Component features
- FileUploader for logo
- ColorPicker components
- RichTextEditor for header/footer
- Live preview panel
- Save to localStorage
- Export/import configuration
```

### 2.2 PDF Generation with White-Label
**Modify:** `app/reports/page.tsx`

**Changes:**
- Load white-label config from localStorage
- Apply custom logo to PDF header
- Use custom colors throughout PDF
- Replace default branding
- Apply custom header/footer
- Option to completely remove VoyagrIQ branding

**Implementation:**
```typescript
const generateWhiteLabelPDF = async (config: WhiteLabelConfig) => {
  const pdf = new jsPDF();

  // Apply white-label settings
  if (config.logo) {
    pdf.addImage(config.logo, 'PNG', 10, 10, 30, 30);
  }

  // Set colors
  pdf.setTextColor(config.primaryColor);
  pdf.setDrawColor(config.accentColor);

  // Custom header
  pdf.text(config.headerText, 105, 15, { align: 'center' });

  // ... generate report content ...

  // Custom footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.text(config.footerText, 105, 285, { align: 'center' });
    if (!config.showBranding) {
      // Don't show "Generated by VoyagrIQ"
    }
  }

  return pdf;
};
```

---

## Phase 3: API Access for Automation (MEDIUM PRIORITY)
### Estimated Time: 4-5 hours

### 3.1 API Endpoint Creation
**Create:** `app/api/` directory with routes

#### Endpoints to Implement:

**GET /api/trips**
```typescript
// List all trips with pagination and filtering
// Query params: page, limit, destination, agency, dateFrom, dateTo
// Response: { trips: Trip[], total: number, page: number, pages: number }
```

**POST /api/trips**
```typescript
// Create new trip
// Body: Trip data
// Response: { trip: Trip, id: string }
```

**GET /api/trips/:id**
```typescript
// Get single trip details
// Response: { trip: Trip }
```

**PUT /api/trips/:id**
```typescript
// Update trip
// Body: Partial<Trip>
// Response: { trip: Trip }
```

**DELETE /api/trips/:id**
```typescript
// Delete trip
// Response: { success: boolean }
```

**GET /api/analytics**
```typescript
// Get analytics data
// Query params: from, to, groupBy
// Response: { analytics: AnalyticsData }
```

**POST /api/webhooks**
```typescript
// Register webhook
// Body: { url: string, events: string[] }
// Response: { webhook: Webhook, id: string }
```

### 3.2 API Authentication
**Create:** `lib/apiAuth.ts`

```typescript
interface APIKey {
  id: string;
  key: string;
  name: string;
  created: Date;
  lastUsed: Date | null;
  permissions: string[];
}

export class APIAuthManager {
  static generateKey(): string {
    // Generate secure API key
    return `tci_${crypto.randomUUID()}`;
  }

  static validateKey(key: string): boolean {
    // Check if key exists and is valid
  }

  static checkPermission(key: string, permission: string): boolean {
    // Verify key has required permission
  }

  static rateLimit(key: string): boolean {
    // Check if key has exceeded rate limit
    // Premium: 1000 requests/hour
    // Standard: 100 requests/hour
    // Starter: No API access
  }
}
```

### 3.3 API Management UI
**Create:** `app/api-keys/page.tsx`

**Features:**
- List all API keys
- Create new API key
- Revoke API key
- View usage statistics
- Set permissions
- Copy key to clipboard
- API documentation link

---

## Phase 4: Client Tags & Custom Fields (MEDIUM PRIORITY)
### Estimated Time: 3-4 hours

### 4.1 Update Trip Data Model
**Modify:** `lib/types.ts`

```typescript
export interface Trip {
  // ... existing fields ...
  client?: string;           // NEW - Client name
  clientId?: string;         // NEW - Client identifier
  tags?: string[];           // NEW - Custom tags
  customFields?: Record<string, any>; // NEW - User-defined fields
  notes?: string;            // NEW - Trip notes
  category?: string;         // NEW - Trip category
}
```

### 4.2 Update Trip Entry Form
**Modify:** `components/TripEntryForm.tsx`

**Add Fields:**
- Client selector (dropdown with autocomplete)
- Tags input (multi-select with create new)
- Custom fields (dynamic based on user configuration)
- Notes textarea
- Category selector

**Implementation:**
```typescript
// Client autocomplete
<Autocomplete
  options={clients}
  value={client}
  onChange={handleClientChange}
  freeSolo
  renderInput={(params) => (
    <TextField {...params} label="Client" />
  )}
/>

// Tags multi-select
<Autocomplete
  multiple
  options={availableTags}
  value={tags}
  onChange={handleTagsChange}
  freeSolo
  renderInput={(params) => (
    <TextField {...params} label="Tags" />
  )}
/>

// Custom fields (dynamic)
{customFieldDefinitions.map(field => (
  <CustomFieldInput
    key={field.id}
    field={field}
    value={customFields[field.id]}
    onChange={handleCustomFieldChange}
  />
))}
```

### 4.3 Tag Management Page
**Create:** `app/settings/tags/page.tsx`

**Features:**
- List all tags with usage count
- Create new tag
- Edit tag (rename, change color)
- Delete tag
- Bulk operations
- Tag categories

### 4.4 Client Management Page
**Create:** `app/clients/page.tsx`

**Features:**
- List all clients
- Client profile page
- Client trip history
- Client revenue summary
- Client analytics
- Client notes

### 4.5 Custom Fields Configuration
**Create:** `app/settings/custom-fields/page.tsx`

**Features:**
- Define custom field types (text, number, date, dropdown, checkbox)
- Set field names
- Set default values
- Set validation rules
- Reorder fields
- Enable/disable fields

---

## Phase 5: Advanced Export Options (LOW PRIORITY)
### Estimated Time: 2-3 hours

### 5.1 Additional Export Formats

#### Google Sheets Export
**Create:** `lib/exports/googleSheets.ts`

```typescript
export async function exportToGoogleSheets(trips: Trip[], options: ExportOptions) {
  // Use Google Sheets API
  // Create new sheet or append to existing
  // Format data with formulas and formatting
  // Share sheet with user
}
```

#### JSON Export
**Create:** `lib/exports/json.ts`

```typescript
export function exportToJSON(trips: Trip[], options: ExportOptions): string {
  return JSON.stringify({
    exportDate: new Date(),
    tripCount: trips.length,
    trips: trips,
    analytics: generateAnalytics(trips)
  }, null, 2);
}
```

#### XML Export
**Create:** `lib/exports/xml.ts`

```typescript
export function exportToXML(trips: Trip[], options: ExportOptions): string {
  // Convert trips to XML format
  // Include schema definition
  // Add metadata
}
```

### 5.2 Export Templates
**Create:** `app/settings/export-templates/page.tsx`

**Features:**
- Create custom export templates
- Define which fields to include
- Set field order
- Apply filters
- Save templates
- Share templates with team

### 5.3 Scheduled Exports
**Create:** `app/settings/scheduled-exports/page.tsx`

**Features:**
- Schedule recurring exports (daily, weekly, monthly)
- Choose export format
- Select recipients (email)
- Apply filters
- Choose template
- View export history
- Pause/resume schedules

**Implementation:**
```typescript
interface ScheduledExport {
  id: string;
  name: string;
  schedule: 'daily' | 'weekly' | 'monthly';
  format: 'csv' | 'xlsx' | 'pdf' | 'json' | 'xml';
  recipients: string[];
  filters: ExportFilters;
  templateId?: string;
  active: boolean;
  nextRun: Date;
  lastRun: Date | null;
}
```

---

## Phase 6: Custom Integrations (LOW PRIORITY)
### Estimated Time: 6-8 hours

### 6.1 Integrations Dashboard
**Create:** `app/integrations/page.tsx`

**Features:**
- Available integrations marketplace
- Connected integrations status
- Integration logs
- Sync settings
- Disconnect option
- Test connection

### 6.2 QuickBooks Integration
**Create:** `lib/integrations/quickbooks.ts`

**Features:**
- OAuth authentication
- Sync trips as invoices
- Sync commissions as income
- Sync clients as customers
- Map categories to QB accounts
- Two-way sync option

### 6.3 Xero Integration
**Create:** `lib/integrations/xero.ts`

**Features:**
- OAuth authentication
- Similar to QuickBooks
- Invoice creation
- Payment tracking
- Bank reconciliation

### 6.4 Salesforce Integration
**Create:** `lib/integrations/salesforce.ts`

**Features:**
- OAuth authentication
- Sync clients as contacts/accounts
- Sync trips as opportunities
- Track commission as revenue
- Activity logging

### 6.5 Zapier Integration
**Create:** Zapier app definition

**Triggers:**
- New trip created
- Trip updated
- Trip deleted
- Revenue milestone reached

**Actions:**
- Create trip
- Update trip
- Get trip details
- Get analytics

### 6.6 Webhook System
**Create:** `lib/webhooks.ts`

```typescript
interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
}

export class WebhookManager {
  static async trigger(event: string, data: any) {
    const webhooks = await this.getWebhooksForEvent(event);

    for (const webhook of webhooks) {
      await this.sendWebhook(webhook, event, data);
    }
  }

  static async sendWebhook(webhook: Webhook, event: string, data: any) {
    const signature = this.generateSignature(webhook.secret, data);

    await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TCI-Signature': signature,
        'X-TCI-Event': event
      },
      body: JSON.stringify(data)
    });
  }
}
```

---

## Phase 7: Account Manager Features (LOW PRIORITY)
### Estimated Time: 1-2 hours

### 7.1 Account Manager Component
**Create:** `components/AccountManager.tsx`

**Features:**
- Display assigned account manager photo
- Contact information (email, phone)
- Schedule meeting button
- Send message button
- View conversation history

**Implementation:**
```typescript
interface AccountManager {
  id: string;
  name: string;
  photo: string;
  email: string;
  phone: string;
  title: string;
  bio: string;
  availability: string;
  timezone: string;
}

// For Premium users only
const AccountManagerCard = ({ manager }: { manager: AccountManager }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <img src={manager.photo} alt={manager.name} className="w-24 h-24 rounded-full mx-auto" />
    <h3 className="text-xl font-bold mt-4">{manager.name}</h3>
    <p className="text-gray-600">{manager.title}</p>

    <div className="mt-4 space-y-2">
      <a href={`mailto:${manager.email}`} className="btn-secondary">
        Email {manager.name}
      </a>
      <a href={`tel:${manager.phone}`} className="btn-secondary">
        Call {manager.phone}
      </a>
      <button className="btn-primary">Schedule Meeting</button>
    </div>
  </div>
);
```

### 7.2 Support Ticket System
**Create:** `app/support/page.tsx`

**Features:**
- Create support ticket
- View ticket history
- Priority selection (Premium gets higher priority)
- Attach files
- Track ticket status
- In-app messaging

---

## Implementation Timeline

### Week 1: Foundation (30-35 hours total)
- **Days 1-3:** Enhanced BI Reports - Starter Tier (10 hours)
- **Days 4-5:** Enhanced BI Reports - Standard Tier additions (8 hours)

### Week 2: Premium Core (30-35 hours total)
- **Days 1-2:** Enhanced BI Reports - Premium Tier additions (8 hours)
- **Day 3:** White-Label Reports (4 hours)
- **Days 4-5:** API Access (5 hours)

### Week 3: Features (25-30 hours total)
- **Days 1-2:** Client Tags & Custom Fields (4 hours)
- **Day 3:** Advanced Export Options (3 hours)
- **Days 4-5:** Begin Integrations (8 hours)

### Week 4: Polish & Launch
- **Days 1-2:** Complete Integrations (4 hours)
- **Day 3:** Account Manager Features (2 hours)
- **Days 4-5:** Testing, bug fixes, documentation (8 hours)

---

## Testing Strategy

### Unit Tests
- Test each analytics calculation function
- Test data aggregation functions
- Test export format generation
- Test API endpoints
- Test authentication/authorization

### Integration Tests
- Test full report generation
- Test white-label application
- Test API workflows
- Test webhook delivery
- Test third-party integrations

### User Acceptance Tests
- Generate reports with real data
- Verify calculations manually
- Test white-label customization
- Test API with Postman
- Test scheduled exports
- Test integration syncs

---

## Success Metrics

### Report Quality
- ✅ Starter tier: 8-10 pages
- ✅ Standard tier: 17-23 pages
- ✅ Premium tier: 30-40 pages
- ✅ Professional formatting
- ✅ Accurate calculations
- ✅ Actionable insights

### Premium Features
- ✅ API endpoints functional
- ✅ White-label working
- ✅ Client tags implemented
- ✅ Advanced exports available
- ✅ At least 2 integrations working

### User Experience
- ✅ Reports generate in < 10 seconds
- ✅ UI is intuitive
- ✅ No errors in console
- ✅ Mobile responsive
- ✅ Accessible (WCAG 2.1 AA)

---

## Priority Quick Reference

**Do First (Week 1):**
1. ✅ Enhanced BI Reports (all tiers)

**Do Second (Week 2):**
2. ✅ White-Label Reports
3. ✅ API Access

**Do Third (Week 3):**
4. ✅ Client Tags & Custom Fields
5. ✅ Advanced Export Options

**Do Last (Week 4):**
6. ✅ Custom Integrations
7. ✅ Account Manager Features

---

## Questions to Address Before Starting

1. **Data Requirements:** Do we have enough sample trip data to test all analytics?
2. **Design Requirements:** Do you have specific chart styles or color schemes?
3. **Third-Party Services:** Which integrations are highest priority?
4. **AI Insights:** Should we use an AI service (OpenAI, etc.) or rule-based insights?
5. **Backend:** Should we implement a real backend or continue with localStorage?
6. **Payment:** Should we integrate Stripe before launching Premium features?

---

## Resources Needed

### Development Tools
- jsPDF (enhanced version)
- Chart.js or Recharts for visualizations
- XLSX library for Excel generation
- OAuth libraries for integrations
- Email service (SendGrid, AWS SES) for scheduled exports

### Optional Services
- OpenAI API for AI-generated insights
- Google Sheets API
- QuickBooks API
- Xero API
- Salesforce API
- Stripe for payments

---

## Next Step

**Recommendation:** Start with **Phase 1.1 - Starter Tier Enhanced Reports**

This will:
1. Provide immediate value to all users
2. Create foundation for Standard/Premium reports
3. Establish report generation infrastructure
4. Allow testing with real data
5. Get user feedback early

**Shall I proceed with implementing Starter tier enhanced reports?**
