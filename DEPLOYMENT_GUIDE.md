# Deployment Guide - Mint Goldwyn Branding

## Deploying to Vercel with Custom Domain

### Step 1: Push to GitHub

1. **Create a new GitHub repository** (under Mint Goldwyn organization or account):
   ```bash
   # Initialize git if not already done
   cd voyagriq
   git init

   # Add all files
   git add .

   # Create first commit
   git commit -m "Initial commit: VoyagrIQ by Mint Goldwyn"

   # Add remote (replace with your Mint Goldwyn repo URL)
   git remote add origin https://github.com/mintgoldwyn/voyagriq.git

   # Push to GitHub
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to** [vercel.com](https://vercel.com)
2. **Sign in** with Mint Goldwyn GitHub account
3. **Click "Add New Project"**
4. **Import** the `voyagriq` repository
5. **Configure:**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next` (auto-detected)
6. **Click "Deploy"**

### Step 3: Custom Domain Setup

#### Option 1: Subdomain (e.g., `trips.mintgoldwyn.com`)

1. In Vercel project settings → **Domains**
2. Add domain: `trips.mintgoldwyn.com`
3. Vercel will provide DNS records
4. Go to your DNS provider (e.g., GoDaddy, Cloudflare, Namecheap)
5. Add CNAME record:
   ```
   Type:  CNAME
   Name:  trips
   Value: cname.vercel-dns.com
   ```
6. Wait for DNS propagation (5-30 minutes)

#### Option 2: Main Domain (e.g., `mintgoldwyn.com`)

1. In Vercel project settings → **Domains**
2. Add domain: `mintgoldwyn.com` and `www.mintgoldwyn.com`
3. Add DNS records at your provider:
   ```
   Type:  A
   Name:  @
   Value: 76.76.21.21

   Type:  CNAME
   Name:  www
   Value: cname.vercel-dns.com
   ```

### Step 4: Update Branding (Optional)

To replace "VoyagrIQ" with "Mint Goldwyn":

1. **Update page titles** in `app/layout.tsx`:
   ```typescript
   export const metadata: Metadata = {
     title: 'Mint Goldwyn Travel Analytics',
     description: 'Professional travel cost analytics and reporting',
   }
   ```

2. **Update navigation** in `components/Navigation.tsx` (if exists)

3. **Add logo**: Place `mintgoldwyn-logo.png` in `public/` folder

4. **Update footer** (add in `app/layout.tsx` if desired):
   ```tsx
   <footer className="text-center py-4 text-gray-600">
     © 2025 Mint Goldwyn. All rights reserved.
   </footer>
   ```

### Step 5: Environment Variables (if needed)

If you add features that require API keys:

1. In Vercel project → **Settings** → **Environment Variables**
2. Add variables like:
   - `OPENAI_API_KEY` (for real AI features)
   - `DATABASE_URL` (if connecting to database)
   - `NEXT_PUBLIC_SITE_URL` = `https://trips.mintgoldwyn.com`

### Step 6: Automatic Deployments

Once connected to GitHub:
- Every push to `main` branch → **Production** deployment
- Every pull request → **Preview** deployment with unique URL
- Vercel will send deployment status to GitHub

---

## Alternative: Deploy to Netlify

1. Sign in to [netlify.com](https://netlify.com) with Mint Goldwyn account
2. **New site from Git** → Select GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Add custom domain in **Domain settings**
5. Add DNS records as instructed

---

## Custom Domain Examples

After setup, your demo will be accessible at:
- `https://trips.mintgoldwyn.com` (recommended)
- `https://analytics.mintgoldwyn.com`
- `https://demo.mintgoldwyn.com`
- `https://mintgoldwyn.com`

Choose a subdomain that makes sense for your business!

---

## Testing the Deployment

After deployment:
1. Visit your custom URL
2. Add sample trip data from `QUICK_DEMO_SETUP.md`
3. Verify all pages load correctly
4. Test the business intelligence features
5. Share the URL with prospects!

---

## Cost

**Vercel Free Tier includes:**
- ✅ Unlimited deployments
- ✅ Custom domains
- ✅ SSL certificates (HTTPS)
- ✅ Global CDN
- ✅ Up to 100 GB bandwidth/month
- ✅ Perfect for demos and small businesses

**Netlify Free Tier is similar.**

Only upgrade if you exceed bandwidth or need advanced features.

---

## Support

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Next.js Docs: https://nextjs.org/docs

---

**Ready to impress prospects with your custom-branded analytics platform!** 🚀
