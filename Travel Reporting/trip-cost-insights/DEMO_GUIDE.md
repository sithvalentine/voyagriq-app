# VoyagrIQ - Demo Presentation Guide

## Quick Start

1. Open Terminal and navigate to the project:
```bash
cd "/Users/james/claude/Travel Reporting/voyagriq"
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to: **http://localhost:3000**

---

## 10-Step Demo Walkthrough

### Step 1: Land on Trips Overview (2 minutes)

**URL**: http://localhost:3000

**What to show:**
- The three KPI cards at the top showing Total Revenue ($118,450), Average Trip Value ($14,806), and Avg Cost Per Traveler ($5,953)
- The clean trips table with all 8 sample trips

**What to say:**
> "Welcome to VoyagrIQ. Right away, you see your key numbers at the top—total revenue across all trips, average trip value, and average cost per traveler. Below, every trip is laid out in one table with client name, destination, dates, and the two metrics that matter most: total trip cost and cost per traveler."

**Actions:**
- Point to each KPI card
- Scroll through the trips table
- Hover over a few rows to show the hover effect

---

### Step 2: Apply Filters (1 minute)

**What to show:**
- Open the Filters section
- Check "Wanderlust Travel" under Travel Agency
- Watch KPIs update to show only Wanderlust trips

**What to say:**
> "Let's filter down to just Wanderlust Travel. Watch how the KPIs update instantly—now you're seeing only that agency's trips and their aggregate numbers. The table shows just their 3 trips."

**Actions:**
- Check "Wanderlust Travel"
- Show updated KPIs: Total Revenue drops to $54,700
- Click "Clear All" to reset

---

### Step 3: Open Trip Detail Page (1 minute)

**What to show:**
- Click "View Details" on T001 (Smith Family - Rome trip)
- Show the Trip Summary header with all trip information

**What to say:**
> "Now let's dive into one trip. Here's the Trip Summary at the top—client, dates, destination, travelers. This is the professional report you'd share with your client or use internally to understand trip economics."

**Actions:**
- Click "View Details" on any trip
- Point out Trip ID, Client Name, Travel Agency
- Highlight the trip details grid

---

### Step 4: Show Key Metrics (1 minute)

**What to show:**
- The three metric cards: Total Trip Cost, Cost Per Traveler, Cost Per Day

**What to say:**
> "Here are the three metrics that tell the whole story: total cost is $18,500, that's $4,625 per person, or about $2,313 per day for this 8-day trip. These are automatically calculated from the raw cost data."

**Actions:**
- Point to each metric card
- Explain the calculation shown in gray text below each number

---

### Step 5: Show Cost Breakdown & Charts (2 minutes)

**What to show:**
- Scroll to the Cost Breakdown section
- Show both the pie chart and bar chart
- Hover over chart segments
- Scroll to the category table

**What to say:**
> "This is where transparency happens. The donut chart breaks down where every dollar went—hover over a segment and you see flights are 38%, hotel is 29%. The bar chart shows the same data in dollar amounts. Below, the table gives you exact amounts and percentages. This is what clients really want to see."

**Actions:**
- Hover over 2-3 pie chart segments to show tooltips
- Point to the bar chart
- Scroll to the table and point out the TOTAL row

---

### Step 6: Generate AI Summary (1 minute)

**What to show:**
- Click "Generate AI Summary" button
- Show the plain-English explanation that appears

**What to say:**
> "Here's where AI comes in. Click this button, and you get a plain-English summary of the trip—total cost, biggest expenses, and a personalized insight about value. You can copy this directly into an email or include it in the PDF report."

**Actions:**
- Click "Generate AI Summary"
- Read the first sentence aloud
- Point out that it can be copied

---

### Step 7: Show Recommendations (1 minute)

**What to show:**
- Scroll to the Recommendations section
- Point out the three colored recommendation cards

**What to say:**
> "The app also suggests ways to optimize costs. Book flights 6-8 weeks earlier to save 15-25%. Bundle hotel and activities for $500-800 in savings. Travel in shoulder season for 20-30% off. Each suggestion is specific and actionable."

**Actions:**
- Read one recommendation aloud
- Emphasize the estimated savings

---

### Step 8: Draft Client Email (1 minute)

**What to show:**
- Click "Draft Email" button
- Show the pre-written email with subject line

**What to say:**
> "Need to send this report to your client? Click here and the AI writes a friendly, professional email summarizing the trip—total cost, highlights, an invitation to discuss. You can edit it or copy it as-is into Gmail or Outlook."

**Actions:**
- Click "Draft Email"
- Show the subject line and email body
- Click "Copy to Clipboard"

---

### Step 9: Navigate to Agency Performance (2 minutes)

**URL**: Click "Agencies" in the top navigation

**What to show:**
- The Agency Summary table
- The "Revenue by Agency" bar chart
- The "Trips Over Time" line chart

**What to say:**
> "Let's zoom out to the owner view. Here's every agency you work with—total revenue, trip count, average trip value. You can instantly see who's driving the most business and who has the highest per-trip margins. Wanderlust Travel leads with $54,700 in revenue across 3 trips."

**Actions:**
- Point to the top row in the table
- Show the horizontal bar chart
- Scroll to the line chart showing trips over time

---

### Step 10: Show AI Insights (2 minutes)

**What to show:**
- Click "Generate AI Insights" button
- Show the "Top 3 Most Profitable Trip Patterns"
- Read the Agency Health Check summary

**What to say:**
> "The AI runs a health check automatically. It identifies the top 3 most profitable trip patterns—Italy with 4 travelers and 7-9 days averages $20,000 per trip. And it tells you which agencies are growing, which have the best margins, and flags any concerns. These are the insights that drive strategic decisions."

**Actions:**
- Click "Generate AI Insights"
- Read the first profitable pattern
- Read one sentence from the health check

---

### Step 11 (Bonus): What-If Simulator (2 minutes)

**URL**: Click "What-If" in the top navigation

**What to show:**
- Select a trip from the dropdown
- Adjust the Flight Cost slider to -15%
- Show the updated metrics in real-time
- Click "Analyze Changes" to show AI explanation

**What to say:**
> "Finally, the What-If tool. Pick any trip, adjust the cost sliders—say, negotiate a 15% discount on flights—and watch the metrics update live. This is perfect for 'what if we did this instead?' conversations with clients. The side-by-side donut charts show the before and after, and the AI explains what the changes mean."

**Actions:**
- Select T001 from dropdown
- Drag Flight Cost slider to -15%
- Show "Total Savings" turning green
- Click "Analyze Changes" and read one sentence

---

## Closing Statement

**What to say:**
> "So in under 15 minutes, we've gone from a list of trips to a full cost analysis report, AI-generated summaries and recommendations, agency performance insights, and a what-if simulator. All of this is built directly from the data you're already tracking in your spreadsheet. No manual work, no guessing—just clear, client-ready insights that help you close more bookings and optimize profitability."

---

## Key Selling Points to Emphasize

1. **Instant Clarity**: "See all your trip economics in one place"
2. **Client-Ready Reports**: "Professional reports with one click—no Excel formatting"
3. **AI-Powered**: "AI writes summaries, drafts emails, and finds optimization opportunities"
4. **Agency Insights**: "Know which agencies and trip types drive revenue"
5. **What-If Scenarios**: "Test different pricing and show clients the impact"

---

## Technical Details (If Asked)

- **Built with**: Next.js, TypeScript, Tailwind CSS, Recharts
- **Data source**: Currently static JSON (demo data), easily connects to Google Sheets, Airtable, or any database
- **AI features**: Currently simulated, ready to integrate with OpenAI or Anthropic Claude API
- **Deployment**: Can be deployed to Vercel, Netlify, or any hosting platform in minutes
- **Customization**: All colors, branding, and copy can be customized

---

## Demo Data Overview

The app includes 8 sample trips:

| Trip ID | Client | Agency | Destination | Travelers | Total Cost |
|---------|--------|--------|-------------|-----------|------------|
| T001 | Smith Family | Wanderlust Travel | Rome, Italy | 4 | $18,500 |
| T002 | Johnson & Co. | Dream Escapes | Paris, France | 2 | $13,300 |
| T003 | Martinez Group | Global Getaways | Tokyo, Japan | 2 | $18,400 |
| T004 | Brown Family | Wanderlust Travel | Barcelona, Spain | 4 | $14,600 |
| T005 | Davis & Associates | Dream Escapes | Athens, Greece | 2 | $13,300 |
| T006 | Wilson Party | Wanderlust Travel | Venice, Italy | 4 | $21,600 |
| T007 | Thompson Family | Global Getaways | San Jose, Costa Rica | 3 | $13,600 |
| T008 | Lee & Partners | Dream Escapes | Lisbon, Portugal | 2 | $11,650 |

---

## Troubleshooting

**If the server isn't running:**
```bash
cd "/Users/james/claude/Travel Reporting/voyagriq"
npm run dev
```

**If you see errors:**
- Make sure Node.js 18+ is installed
- Run `npm install` to ensure all dependencies are installed
- Check that port 3000 is not already in use

**To stop the server:**
Press `Ctrl + C` in the Terminal window

---

## Next Steps After Demo

1. **Gather feedback** on which features resonate most
2. **Customize branding** (colors, logo, agency name)
3. **Add real data** by connecting to Google Sheets or database
4. **Integrate real AI** (OpenAI or Claude API)
5. **Deploy to production** (Vercel free tier recommended)

---

**Good luck with your demo!** 🚀
