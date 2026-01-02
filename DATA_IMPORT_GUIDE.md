# Data Import Guide

## ✅ System Updated - No Sample Data Included

The application has been updated to **require you to import your own data**. Sample data has been removed, and the app now starts with an empty state.

---

## 🚀 How to Import Your Data

### Step 1: Access the Data Management Page

1. Start the app: `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000)
3. You'll see a welcome screen
4. Click **"Import Your Data →"** or go to the **Data** tab in navigation

---

### Step 2: Download the CSV Template

1. On the Data Management page, click **"Download CSV Template"**
2. This gives you a pre-formatted CSV with all required columns
3. The template includes one example row to show the format

---

### Step 3: Fill In Your Data

Open the template in Excel, Google Sheets, or any spreadsheet program and fill in your trip data.

#### Required Columns

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `Trip_ID` | Text | Unique identifier | T001 |
| `Client_Name` | Text | Client or group name | Smith Family |
| `Travel_Agency` | Text | Your agency name | Wanderlust Travel |
| `Start_Date` | Date | Trip start date (YYYY-MM-DD) | 2025-01-15 |
| `End_Date` | Date | Trip end date (YYYY-MM-DD) | 2025-01-22 |
| `Destination_Country` | Text | Country name | Italy |
| `Destination_City` | Text | City name | Rome |
| `Adults` | Number | Number of adults | 3 |
| `Children` | Number | Number of children | 1 |
| `Total_Travelers` | Number | Adults + Children | 4 |
| `Flight_Cost` | Number | Total flight cost | 7000 |
| `Hotel_Cost` | Number | Total hotel cost | 5400 |
| `Ground_Transport` | Number | Total ground transport cost | 1200 |
| `Activities_Tours` | Number | Total activities cost | 3400 |
| `Meals_Cost` | Number | Total meals cost | 900 |
| `Insurance_Cost` | Number | Total insurance cost | 400 |
| `Other_Costs` | Number | Any other costs | 200 |
| `Notes` | Text (optional) | Trip notes | 8-day cultural trip |

#### Important Notes

- **Dates** must be in `YYYY-MM-DD` format (e.g., 2025-01-15)
- **Numbers** should be plain numbers without currency symbols or commas
- **Trip_Total_Cost** and **Cost_Per_Traveler** are calculated automatically - you don't need to include them
- **All cost columns** should be numbers (use 0 if a category doesn't apply)

---

### Step 4: Import Your Data

1. Save your spreadsheet as **CSV** format
2. On the Data Management page, either:
   - **Drag and drop** the CSV file into the upload zone, OR
   - Click **"Choose File"** and select your CSV
3. You'll see a success message with the number of trips imported
4. The Data Preview section will show your first 5 trips

---

### Step 5: View Your Analytics

Once data is imported:

1. Go to **Trips** page - see all your trips with filters and KPIs
2. Click **View Details** on any trip - see the full cost breakdown report
3. Go to **Agencies** page - compare agency performance
4. Go to **What-If** page - run cost scenarios

---

## 📊 How the Data is Stored

- Your data is stored in your browser's **localStorage**
- It's completely **private and local** to your computer
- Data persists between sessions (won't be lost when you close the browser)
- If you clear browser data, your imports will be erased

---

## 🔄 Managing Your Data

### Export Your Data

1. Go to Data Management page
2. Click **"Export Data"**
3. Downloads a CSV file with all your current data
4. Use this for backup or to edit data externally

### Clear All Data

1. Go to Data Management page
2. Click **"Clear All Data"**
3. Confirm the warning
4. All trips will be removed (cannot be undone)

### Update Data

To update existing data:

1. Export your current data
2. Edit the CSV file
3. Clear all data in the app
4. Re-import the updated CSV

---

## 🎯 Example Workflow

### For a Travel Agency Owner

1. **Export from your booking system** - Get a report of all trips with costs
2. **Format the data** - Match column names to the template
3. **Import to app** - Upload and see instant analytics
4. **Generate reports** - Share trip details with clients
5. **Update monthly** - Export, add new trips, re-import

### For a Demo or Sales Presentation

1. **Download template**
2. **Add 5-10 example trips** with realistic data
3. **Import** to the app
4. **Walk through features** - Trips, Agency Performance, What-If
5. **Export the demo data** - Reuse for future demos

---

## ❓ Troubleshooting

### "Missing required columns" error

- Ensure your CSV has **all required column names** spelled exactly as shown
- Check for extra spaces in column headers
- Make sure you're using the downloaded template as a starting point

### "CSV file is empty" error

- Make sure your CSV has at least one data row (plus the header row)
- Check that the file saved correctly as CSV format

### Numbers showing as text

- Remove currency symbols ($, €) and commas from cost fields
- Ensure numbers are actual number values, not text

### Dates not recognized

- Use `YYYY-MM-DD` format (e.g., 2025-01-15)
- Don't use slashes or other date formats

### Import successful but metrics seem wrong

- Double-check that `Total_Travelers` = `Adults + Children`
- Verify all cost fields are numbers (not text or empty)
- Make sure dates are in correct order (End_Date after Start_Date)

---

## 💡 Pro Tips

1. **Start small** - Import 2-3 trips first to test, then add the rest
2. **Use consistent naming** - Keep agency names, countries, and cities spelled consistently
3. **Include notes** - The Notes column helps you remember trip details
4. **Regular backups** - Export your data monthly as a backup
5. **Clean data** - Remove any test trips before generating client reports

---

## 📝 CSV Template Example

```csv
Trip_ID,Client_Name,Travel_Agency,Start_Date,End_Date,Destination_Country,Destination_City,Adults,Children,Total_Travelers,Flight_Cost,Hotel_Cost,Ground_Transport,Activities_Tours,Meals_Cost,Insurance_Cost,Other_Costs,Notes
T001,Smith Family,Wanderlust Travel,2025-01-15,2025-01-22,Italy,Rome,3,1,4,7000,5400,1200,3400,900,400,200,8-day cultural trip
T002,Johnson Group,Dream Escapes,2025-02-10,2025-02-17,France,Paris,2,0,2,4500,4800,600,1800,1200,300,100,Romantic getaway
T003,Martinez Party,Global Getaways,2025-03-05,2025-03-15,Japan,Tokyo,2,0,2,6800,5200,1400,2800,1500,450,250,Spring exploration
```

---

## 🔐 Privacy & Security

- All data stays in your browser (not sent to any server)
- No account creation required
- No data collection or analytics
- Your trip data is completely private

---

## 🚀 Ready to Start?

1. Go to [http://localhost:3000/data](http://localhost:3000/data)
2. Download the template
3. Add your data
4. Import and start analyzing!

For additional help, check the README.md or the application's built-in instructions on the Data Management page.
