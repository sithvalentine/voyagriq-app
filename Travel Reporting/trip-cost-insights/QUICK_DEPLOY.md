# Quick Deploy to Vercel (5 Minutes)

## Get Your Demo Online NOW

### Step 1: Create Vercel Account
1. Go to [vercel.com/signup](https://vercel.com/signup)
2. Sign up with GitHub account (recommended)

### Step 2: Push to GitHub

```bash
cd "/Users/james/claude/Travel Reporting/voyagriq"

# Initialize git
git init

# Add all files
git add .

# Create commit
git commit -m "Initial commit: Travel Analytics Platform"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/voyagriq.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel (2 minutes)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your `voyagriq` repo
4. Click "Deploy" (Vercel auto-detects Next.js settings)
5. Wait 60 seconds...
6. **DONE!** You'll get a URL like:
   - `https://voyagriq.vercel.app`
   - `https://voyagriq-username.vercel.app`

### Step 4: Test Your Live Demo

Your app is now live at the Vercel URL! Share it with prospects immediately.

---

## Custom Domain Setup (Later)

Once you have the Vercel deployment working:

### If You Own `mintgoldwyn.com`:

1. In Vercel project → **Settings** → **Domains**
2. Add domain: `trips.mintgoldwyn.com`
3. Vercel gives you DNS instructions
4. Go to your domain registrar (GoDaddy, Namecheap, etc.)
5. Add CNAME record:
   ```
   Name:  trips
   Value: cname.vercel-dns.com
   ```
6. Wait 5-30 minutes for DNS propagation
7. Your custom domain will work!

### Don't Own `mintgoldwyn.com` Yet?

**Option 1**: Buy the domain first
- GoDaddy: ~$12/year
- Namecheap: ~$9/year
- Cloudflare: ~$10/year

**Option 2**: Use the free Vercel URL for now
- Your URL: `https://voyagriq-yourusername.vercel.app`
- Works perfectly for demos
- Add custom domain later when ready

---

## Alternative: Test Locally Right Now

Don't want to deploy yet? Keep testing locally:

```bash
cd "/Users/james/claude/Travel Reporting/voyagriq"
npm run dev
```

Then visit: **http://localhost:3000**

This works offline and is perfect for:
- Testing features
- Adding demo data
- Taking screenshots
- Recording demo videos

---

## What URL Should I Share?

**For testing now**: `http://localhost:3000`

**For sharing with others**:
1. Deploy to Vercel → Get free URL: `voyagriq.vercel.app`
2. Later add custom domain: `trips.mintgoldwyn.com`

---

## Next Steps

1. ✅ Test locally at `localhost:3000`
2. Add sample trips using the demo data
3. Take screenshots/record video
4. Deploy to Vercel when ready to share
5. Buy domain and add custom URL (optional)

---

**Need help?** The app is working perfectly on `localhost:3000` right now. You can demo it from there, or deploy to Vercel for a shareable link!
