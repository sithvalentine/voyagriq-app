# VoyagrIQ

A professional web-based analytics dashboard for travel agencies to analyze trip costs, generate client-ready reports, and optimize profitability.

## Product Overview

**VoyagrIQ** transforms raw booking data into clear trip economics and client-ready cost reports. Built for travel agencies and independent advisors, it solves the problem of opaque trip profitability and manual report generation.

### 📚 Important Documentation

- **[Analytics Features](ANALYTICS_FEATURES.md)** - What analysis is REAL (calculations, charts, metrics)
- **[Data Import Guide](DATA_IMPORT_GUIDE.md)** - How to import your trip data via CSV
- **[Manual Entry Guide](MANUAL_ENTRY_GUIDE.md)** - How to enter trips manually (perfect for demos)
- **[AI Features Explained](AI_FEATURES_README.md)** - Understanding what's real vs. simulated AI

### Key Features

✅ **Trips Overview Dashboard**
- View all trips with filtering by agency, destination, and date range
- Real-time KPIs: Total Revenue, Average Trip Value, Cost Per Traveler
- Sortable trip table with detailed metrics

✅ **Trip Detail Reports**
- Complete trip cost breakdown with interactive charts (pie & bar)
- Key metrics: Total Cost, Cost Per Traveler, Cost Per Day
- AI-generated trip summaries and client email drafts
- Professional recommendations for cost optimization

✅ **Agency Performance Dashboard**
- Compare revenue and trip volume across agencies
- Identify top-performing agencies and destinations
- Track trips over time with trend analysis
- AI-powered insights on profitable trip patterns

✅ **What-If Savings Simulator**
- Interactive cost adjustments with live recalculation
- Side-by-side comparison of original vs. adjusted costs
- AI analysis of cost changes and trade-offs
- Test different traveler counts and scenarios

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Data**: Static JSON (demo data based on spreadsheet structure)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Navigate to the project directory:
```bash
cd voyagriq
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Demo Walkthrough Script

Use this script when presenting to travel agency clients:

### Step 1: Trips Overview (Home Page)
- Show the three KPI cards at the top
- Demonstrate the filter functionality (agency and country)
- Point out how KPIs update in real-time
- Click through the trips table

### Step 2: Apply Filters
- Select "Wanderlust Travel" to filter by agency
- Show how the table and KPIs update
- Clear filters to reset

### Step 3: Open Trip Detail
- Click "View Details" on any trip (e.g., T001 - Smith Family)
- Walk through the Trip Summary section
- Highlight the three Key Metrics cards

### Step 4: Cost Breakdown Charts
- Show the pie chart and bar chart
- Hover over chart segments to show tooltips
- Review the detailed category table below

### Step 5: AI Summary
- Click "Generate AI Summary"
- Read the plain-English explanation
- Mention this can be copied into client communications

### Step 6: Recommendations
- Review the three optimization recommendations
- Point out estimated savings ranges (15-25%, $500-800, 20-30%)

### Step 7: Draft Client Email
- Click "Draft Email"
- Show the professionally formatted email
- Click "Copy to Clipboard" and mention easy integration with Gmail/Outlook

### Step 8: Agency Performance
- Navigate to "Agencies" in the top nav
- Show the Agency Summary table
- Point out revenue comparison and top destinations

### Step 9: Agency Charts
- Show the "Revenue by Agency" bar chart
- Show "Trips Over Time" trend analysis
- Mention how this helps identify growth patterns

### Step 10: AI Insights
- Click "Generate AI Insights"
- Review "Top 3 Most Profitable Trip Patterns"
- Read the Agency Health Check summary

### Step 11: What-If Simulator
- Navigate to "What-If" in the nav
- Select a trip from the dropdown
- Adjust the Flight Cost slider to -15%
- Show how metrics update in real-time
- Point out the side-by-side donut charts
- Click "Analyze Changes" to show AI explanation

## Data Structure

The app is built directly from your spreadsheet structure:

### Inputs_Trips
Each trip row contains:
- Trip_ID, Client_Name, Travel_Agency
- Start_Date, End_Date
- Destination_Country, Destination_City
- Adults, Children, Total_Travelers
- Cost fields: Flight_Cost, Hotel_Cost, Ground_Transport, Activities_Tours, Meals_Cost, Insurance_Cost, Other_Costs
- Calculated: Trip_Total_Cost, Cost_Per_Traveler

### Calculations
- **Trip_Total_Cost**: Sum of all cost categories
- **Cost_Per_Traveler**: Trip_Total_Cost / Total_Travelers
- **Cost_Per_Day**: Trip_Total_Cost / (End_Date - Start_Date + 1)
- **Category Breakdown**: Each cost field as % of total
- **Agency Revenue**: Sum of Trip_Total_Cost grouped by Travel_Agency

## Customization

### Adding Your Own Data

Replace the sample data in `data/trips.ts` with your actual trip data:

```typescript
export const trips: Trip[] = [
  {
    Trip_ID: "T001",
    Client_Name: "Your Client",
    Travel_Agency: "Your Agency",
    // ... rest of fields
  },
  // ... more trips
];
```

### Connecting to Live Data

To connect to a real database or Google Sheets:

1. Create API routes in `app/api/trips/route.ts`
2. Fetch data from your source (Airtable, Google Sheets API, PostgreSQL, etc.)
3. Update the trip pages to fetch from API instead of static import

### Adding Real AI Features

To integrate actual AI (OpenAI, Anthropic Claude):

1. Install the SDK: `npm install openai` or `npm install @anthropic-ai/sdk`
2. Create API route: `app/api/ai-summary/route.ts`
3. Call the AI API with trip data
4. Update the front-end to fetch from your API

## Demo Data

The app includes 8 sample trips across 3 agencies:
- **Wanderlust Travel**: 3 trips, Italy/Spain focus
- **Dream Escapes**: 3 trips, France/Greece/Portugal
- **Global Getaways**: 2 trips, Japan/Costa Rica

All client names are anonymized (e.g., "Smith Family", "Johnson & Co.").

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy (auto-detected as Next.js)
4. Get shareable demo link

### Other Platforms

- **Netlify**: Connect GitHub repo, deploy
- **AWS Amplify**: Use Next.js SSR hosting
- **Docker**: Use the included Dockerfile (if added)

## Support

For questions or issues with this demo:
- Check the code comments for implementation details
- Review the original design document
- Modify `data/trips.ts` to add more sample trips

## License

This is a demo application. Customize and use as needed for your business.

---

**Built with Claude Code** 🤖
# Deployment trigger: 1767650933
