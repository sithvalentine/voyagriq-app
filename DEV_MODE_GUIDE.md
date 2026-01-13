# VoyagrIQ Developer Mode Guide

## Quick Start

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Access Dev Tools:**
   Navigate to http://localhost:3000/dev-tools

3. **Enable Login Bypass:**
   - Toggle "Development Mode" ON
   - Toggle "Login Bypass" ON
   - Page will automatically redirect to /trips

4. **You're in!** No login required, full access to all features.

## Features Available in Dev Tools

### 🔧 Development Mode
- Bypasses all subscription checks
- Enables full feature access regardless of tier
- Required for other dev features to work

### 🔓 Login Bypass
- Creates a mock user session automatically
- No need to sign in or create accounts
- Automatically redirects to /trips dashboard
- Mock user details:
  - Email: `dev@voyagriq.local`
  - Name: `Dev User`

### 🎯 Tier Selection
Test tier-specific features by switching between:
- **Starter**: Basic features, 6-month data retention
- **Standard**: Team features, 2-year retention, bulk import
- **Premium**: API access, white-label, 5-year retention
- **Enterprise**: Unlimited everything

### 🗑️ Clear All Data
- Resets all app data (trips, settings, preferences)
- Keeps Supabase auth intact (if needed)
- Useful for testing from scratch

## How It Works

### Login Bypass Mechanism
When you enable login bypass, the app:
1. Checks for `voyagriq-dev-mode` AND `voyagriq-bypass-login` flags in localStorage
2. Creates a mock user and session object
3. Bypasses Supabase authentication completely
4. Sets user state in AuthContext
5. Redirects to /trips automatically

### LocalStorage Flags
```javascript
// Enable dev mode
localStorage.setItem('voyagriq-dev-mode', 'true');

// Enable login bypass (requires dev mode)
localStorage.setItem('voyagriq-bypass-login', 'true');

// Set tier
localStorage.setItem('voyagriq-dev-tier', 'premium');
```

### Console Logging
Dev mode includes helpful console logs:
- `🔧 Dev Mode: Login bypassed - using mock user` - When bypass is active
- `✅ Dev Mode ENABLED` - When dev mode is turned on
- `✅ Login Bypass ENABLED` - When login bypass is activated
- `✅ Tier changed to: PREMIUM` - When tier is changed

## Security

### Localhost Only
- Dev tools page only accessible on localhost
- Shows "Access Denied" error on production
- All checks verify `hostname === 'localhost'` or `'127.0.0.1'`

### Production Safety
- Dev mode flags are ignored in production builds
- No security risk to deployed application
- Mock user sessions only created in dev environment

## Testing Workflows

### Test New Currency System
1. Enable dev mode + login bypass
2. Go to Settings → Currency
3. Select different currencies (EUR, JPY, GBP, etc.)
4. Export PDFs/CSV/Excel to verify conversion works
5. Check reports show correct currency symbols

### Test Tier-Specific Features
1. Enable dev mode + login bypass
2. Switch to "Starter" tier in dev tools
3. Verify restricted features are disabled
4. Switch to "Premium" tier
5. Verify all features are enabled

### Test Data Retention
1. Enable dev mode + login bypass
2. Add trips with various dates
3. Switch between tiers to see different retention periods
4. Verify archive warnings appear correctly

### Fresh Start Testing
1. Click "Clear All App Data" in dev tools
2. Confirm the reset
3. Page reloads with clean slate
4. Add test data and verify functionality

## Common Issues

### Can't access dev tools
- Make sure you're on localhost:3000, not 127.0.0.1:3000
- Check browser console for errors
- Try clearing browser cache

### Login bypass not working
1. Make sure Dev Mode is enabled FIRST
2. Then enable Login Bypass
3. Wait for automatic redirect (1 second delay)
4. If stuck, manually go to /trips

### Features still restricted
1. Check console for dev mode logs
2. Verify localStorage flags are set:
   ```javascript
   localStorage.getItem('voyagriq-dev-mode') // should be 'true'
   localStorage.getItem('voyagriq-bypass-login') // should be 'true'
   ```
3. Try refreshing the page
4. Clear all data and start fresh

### Tier changes not applying
1. Tier changes require page refresh
2. Dev tools auto-refreshes after 500ms
3. If not working, manually refresh browser
4. Check console for tier change confirmation

## Manual Setup (Advanced)

If you prefer not to use the dev tools page:

```javascript
// Run in browser console on localhost

// Enable everything
localStorage.setItem('voyagriq-dev-mode', 'true');
localStorage.setItem('voyagriq-bypass-login', 'true');
localStorage.setItem('voyagriq-dev-tier', 'premium');

// Reload page
window.location.reload();
```

## Disabling Dev Mode

### Via Dev Tools
1. Go to /dev-tools
2. Toggle "Development Mode" OFF
3. This automatically disables login bypass too
4. Page reloads to normal mode

### Manual
```javascript
// Run in browser console
localStorage.removeItem('voyagriq-dev-mode');
localStorage.removeItem('voyagriq-bypass-login');
localStorage.removeItem('voyagriq-dev-tier');
window.location.href = '/';
```

## Best Practices

1. **Always use dev mode for local testing** - Saves time, no account needed
2. **Test with different tiers** - Catch tier-specific bugs early
3. **Clear data between major tests** - Ensures clean test environment
4. **Check console logs** - Dev mode is verbose for debugging
5. **Disable before production testing** - Test real auth flow occasionally

## Quick Command Reference

```bash
# Start dev server
npm run dev

# Access dev tools
open http://localhost:3000/dev-tools

# Build for testing
npm run build

# Start production build locally
npm start
```

## Support

Issues with dev tools? Check:
1. You're on localhost (not 127.0.0.1 or production)
2. Browser console for errors
3. localStorage flags are set correctly
4. Try clearing all data and starting fresh

For production issues, dev mode should not be enabled!
