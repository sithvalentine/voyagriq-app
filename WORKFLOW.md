# VoyagrIQ Development Workflow

## Directory Structure (Updated Jan 5, 2026)

**Working Directory**: `/Users/james/claude/voyagriq-app`

This is now the ONLY active development directory. The previous `trip-cost-insights` directory has been archived as a backup.

## Development Commands

```bash
# Navigate to project
cd /Users/james/claude/voyagriq-app

# Install dependencies
npm install

# Start development server (localhost:3000)
npm run dev

# Build for production
npm run build

# Run production build locally
npm start
```

## Git Workflow

```bash
# Check status
git status

# Stage changes
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub (triggers Vercel deployment)
git push origin main
```

## Deployment

- **Repository**: https://github.com/sithvalentine/voyagriq-app
- **Hosting**: Vercel
- **Live Site**: https://voyagriq.com
- **Auto-Deploy**: Enabled on push to `main` branch

## Important Notes

1. **Always work in `/Users/james/claude/voyagriq-app`** - this is the only directory now
2. **Pre-push hook** validates builds before pushing (prevents broken deployments)
3. **Environment variables** are set in Vercel dashboard, not in `.env` files
4. **Backup exists** at `/Users/james/claude/Travel Reporting/trip-cost-insights-BACKUP-20260105`

## Environment Variables Needed in Vercel

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Stripe
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Stripe Price IDs (Monthly)
- `STRIPE_PRICE_STARTER` ✅
- `STRIPE_PRICE_STANDARD` ✅
- `STRIPE_PRICE_PREMIUM` ✅

### Stripe Price IDs (Annual) - TODO
- `STRIPE_PRICE_STARTER_ANNUAL` ⚠️ Not configured yet
- `STRIPE_PRICE_STANDARD_ANNUAL` ⚠️ Not configured yet
- `STRIPE_PRICE_PREMIUM_ANNUAL` ⚠️ Not configured yet

## Next Steps for Annual Pricing

1. Create annual price products in Stripe Dashboard:
   - Starter: $588/year (12 months × $49)
   - Standard: $1,188/year (12 months × $99)
   - Premium: $2,388/year (12 months × $199)

2. Add the annual price IDs to Vercel environment variables

3. Trigger a new Vercel deployment

## Troubleshooting

### Build fails locally
```bash
npm run build
# Fix any TypeScript errors shown
```

### Port 3000 in use
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Vercel deployment fails
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure local build passes: `npm run build`

## Previous Issue (Resolved)

**Problem**: Two directories (`trip-cost-insights` and `voyagriq-app`) both pointed to same GitHub repo, causing deployment confusion.

**Solution**: Consolidated to single directory (`voyagriq-app`), archived the duplicate as backup.
