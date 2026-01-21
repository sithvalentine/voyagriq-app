# Automated Maintenance System

## Overview

VoyagrIQ has an automated weekly maintenance system that runs every Sunday at 3:00 AM Pacific Time (10:00 AM UTC). The maintenance runs in the background with **zero downtime** - users won't notice anything.

## What Gets Maintained

### 1. Database Optimization (5-10 minutes)
- Analyzes all tables to update query statistics
- Improves query performance automatically
- No downtime required

### 2. Data Cleanup (2-5 minutes)
- Marks expired trial accounts (14+ days after trial ended)
- Archives old trips based on subscription tier:
  - **Starter**: 6 months retention
  - **Standard**: 2 years retention
  - **Premium**: 5 years retention
  - **Enterprise**: Unlimited retention
- Removes orphaned records (data from deleted users)

### 3. Health Checks (1-2 minutes)
- Verifies database connectivity
- Checks Stripe integration
- Tests critical API endpoints
- Generates system statistics

### 4. Reporting (< 1 minute)
- Sends maintenance report to console logs
- Includes timing, success/failure status, and statistics
- Future: Email notifications to admin

## Setup Instructions

### 1. Add Database Migration

Run the maintenance database migration to add required columns and functions:

```bash
# Apply the migration to Supabase
psql $DATABASE_URL -f supabase/migrations/add_maintenance_functions.sql
```

Or use Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `supabase/migrations/add_maintenance_functions.sql`
3. Run the SQL

### 2. Set Environment Variables

Add to your `.env.local` and Vercel environment variables:

```bash
# Generate a secure random secret (use this command)
openssl rand -base64 32

# Add to .env.local and Vercel
CRON_SECRET=<your-generated-secret-here>
```

**In Vercel Dashboard:**
1. Go to your project → Settings → Environment Variables
2. Add `CRON_SECRET` with the same value
3. Make sure it's set for Production environment

### 3. Configure Vercel Cron

The cron job is already configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/maintenance",
      "schedule": "0 10 * * 0"
    }
  ]
}
```

**Schedule Explanation:**
- `0 10 * * 0` = Every Sunday at 10:00 AM UTC (3:00 AM Pacific)
- Cron format: `minute hour day month weekday`

**Note:** Vercel Cron is available on:
- ✅ Pro Plan ($20/month) - **Recommended**
- ✅ Enterprise Plan
- ❌ Hobby Plan (free) - Not available

If you're on the Hobby plan, you can:
1. Upgrade to Pro ($20/month) to enable cron
2. Use GitHub Actions (free alternative - see below)

### 4. Deploy to Vercel

```bash
git add .
git commit -m "Add automated maintenance system"
git push origin main
```

Vercel will automatically:
1. Deploy the new API endpoint
2. Configure the cron job
3. Start running maintenance weekly

### 5. Verify Setup

After deployment, check Vercel Dashboard:
1. Go to your project → Settings → Crons
2. You should see the maintenance cron listed
3. Click to view execution logs

## Manual Testing

You can test the maintenance endpoint manually:

```bash
# Replace with your CRON_SECRET
curl -X GET https://voyagriq.com/api/maintenance \
  -H "Authorization: Bearer your-cron-secret-here"
```

Expected response:
```json
{
  "success": true,
  "timestamp": "2026-01-21T10:00:00.000Z",
  "totalDuration": 15432,
  "results": [
    {
      "task": "Database Analysis",
      "status": "success",
      "duration": 2341,
      "details": "Table statistics updated"
    },
    ...
  ]
}
```

## Monitoring

### View Logs in Vercel

1. Go to Vercel Dashboard → Your Project → Logs
2. Filter by `/api/maintenance`
3. View execution results and timing

### Check Cron Execution History

1. Go to Vercel Dashboard → Settings → Crons
2. Click on the maintenance cron
3. View execution history and success rate

## Customization

### Change Schedule

Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/maintenance",
      "schedule": "0 10 * * 0"  // Change this
    }
  ]
}
```

**Common schedules:**
- `0 10 * * 0` - Every Sunday at 10 AM UTC (current)
- `0 6 * * *` - Every day at 6 AM UTC
- `0 2 * * 1` - Every Monday at 2 AM UTC
- `0 0 1 * *` - First day of every month at midnight

### Add Email Notifications

Currently, logs are sent to console. To add email notifications:

1. Install Resend (or your preferred email service)
2. Update `sendMaintenanceReport()` function in `app/api/maintenance/route.ts`
3. Add email template for maintenance reports

Example:
```typescript
import { Resend } from 'resend';

async function sendMaintenanceReport(results: MaintenanceResult[], duration: number) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'maintenance@voyagriq.com',
    to: 'james@voyagriq.com',
    subject: `VoyagrIQ Maintenance Report - ${new Date().toLocaleDateString()}`,
    html: generateReportHTML(results, duration),
  });
}
```

## Troubleshooting

### Cron Not Running

**Issue:** Cron job doesn't execute
**Solutions:**
1. Verify you're on Vercel Pro plan or higher
2. Check `CRON_SECRET` is set in Vercel environment variables
3. Verify `vercel.json` is in project root
4. Check Vercel Crons dashboard for errors

### Unauthorized Error

**Issue:** 401 Unauthorized when cron runs
**Solution:** Vercel automatically sends the `Authorization` header. If you see this error, check that:
1. `CRON_SECRET` matches between `.env.local` and Vercel
2. Environment variable is set for Production environment

### Database Errors

**Issue:** "analyze_tables() does not exist"
**Solution:** Run the database migration:
```bash
psql $DATABASE_URL -f supabase/migrations/add_maintenance_functions.sql
```

### Performance Issues

**Issue:** Maintenance takes too long (> 30 seconds)
**Solutions:**
1. Check database size - large databases take longer
2. Consider running maintenance more frequently (daily vs weekly)
3. Split tasks into multiple cron jobs
4. Increase Vercel function timeout (Pro plan: 60s, Enterprise: 900s)

## Alternative: GitHub Actions (Free)

If you can't use Vercel Cron (Hobby plan), use GitHub Actions instead:

Create `.github/workflows/maintenance.yml`:

```yaml
name: Weekly Maintenance

on:
  schedule:
    - cron: '0 10 * * 0'  # Every Sunday at 10 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  maintenance:
    runs-on: ubuntu-latest
    steps:
      - name: Run Maintenance
        run: |
          curl -X GET https://voyagriq.com/api/maintenance \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

Then add `CRON_SECRET` to GitHub repository secrets.

## Cost Analysis

### Vercel Cron (Recommended)
- **Cost**: Included in Pro plan ($20/month)
- **Execution time**: ~30 seconds/week
- **Function invocations**: 4 per month
- **Additional cost**: $0 (within free tier limits)

### GitHub Actions (Free Alternative)
- **Cost**: $0 (2,000 minutes/month free)
- **Execution time**: ~1 minute/week = ~4 minutes/month
- **Additional cost**: $0

## Security

- Maintenance endpoint is protected by `CRON_SECRET`
- Only Vercel cron or requests with valid secret can execute
- Uses Supabase service role for elevated permissions
- All operations are logged for audit trail
- No user data is deleted (only archived/flagged)

## Future Enhancements

Potential additions:
- Email notifications for maintenance reports
- Slack/Discord webhooks for alerts
- Database backup automation
- Performance metrics tracking
- Automatic scaling recommendations
- Cost optimization reports

---

**Status**: ✅ Ready for Deployment

**Next Steps**:
1. Apply database migration
2. Set `CRON_SECRET` in Vercel
3. Deploy to production
4. Verify cron execution in Vercel dashboard
