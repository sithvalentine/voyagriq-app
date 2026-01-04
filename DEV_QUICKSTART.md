# 🔧 Development Environment Quick Start

## Start Development Server

```bash
cd "Travel Reporting/trip-cost-insights"
npm run dev
```

The app will be available at: **http://localhost:3000**

## Visual Indicators

When running in development:
- **Orange banner at top** - Shows "DEVELOPMENT ENVIRONMENT" with quick links
- Dev Mode Quick Login button on login page
- All localhost traffic is clearly marked

## Quick Development Login

1. Go to http://localhost:3000/login
2. Click "🔧 Dev Mode Quick Login" button
3. You'll be logged in with dev mode enabled (bypasses Stripe)

**OR** use credentials:
- Email: test@example.com
- Password: password123

## Enable Dev Mode Features

Once logged in:
1. Go to `/account` page
2. Click "Enable Dev Mode" at the top
3. This enables:
   - **Tier Switching** - Test Starter/Standard/Premium features
   - **Sample Data** - Load 20 realistic trips instantly
   - **Payment Bypass** - No Stripe required

## Key Dev Mode URLs

- **Login**: http://localhost:3000/login
- **Account Settings**: http://localhost:3000/account (toggle dev mode here)
- **Trips**: http://localhost:3000/trips
- **Analytics**: http://localhost:3000/analytics
- **Enable Dev Mode Directly**: http://localhost:3000/enable-dev-mode

## Production vs Development

### Development (localhost:3000)
- ✅ Orange dev banner visible
- ✅ Dev mode quick login available
- ✅ Can bypass Stripe payments
- ✅ Tier switching enabled
- ✅ Sample data loading

### Production (voyagriq.com)
- ❌ No dev banner
- ❌ No dev mode features
- ✅ Stripe payment required
- ✅ Real subscription tiers only
- ✅ No tier switching

## Environment Variables

Make sure you have `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
STRIPE_SECRET_KEY=your_stripe_key
# ... other vars
```

## Common Dev Tasks

### Test Bulk Import
1. Enable dev mode
2. Go to `/trips`
3. Click "Import Trips"
4. Upload `public/sample-trips-bulk-import.csv`

### Test Different Tiers
1. Enable dev mode
2. Go to `/account`
3. Click tier buttons to switch: Starter → Standard → Premium

### Load Sample Data
1. Enable dev mode
2. Go to `/account`
3. Click "Load Sample Data"
4. 20 trips with commissions will be added

## Troubleshooting

**Can't see dev banner?**
- Make sure you're on localhost:3000 (not 127.0.0.1)
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

**Dev mode not working?**
- Check cookies are enabled
- Check localStorage for 'voyagriq-dev-mode' = 'true'
- Go to `/enable-dev-mode` to force enable

**Stuck at payment screen?**
- Use dev mode quick login from `/login`
- Or go to `/enable-dev-mode` first, then log in
