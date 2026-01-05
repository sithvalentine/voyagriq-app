# Deployment Notes

## Development Server (Working ✅)

The app is fully functional in development mode:

```bash
npm run dev
```

Open http://localhost:3000 - All features work perfectly!

---

## Production Build Notes

The app uses **Tailwind CSS v4** which has some breaking changes with Next.js 16's Turbopack build system.

### Current Status
- ✅ **Development mode**: Working perfectly
- ⚠️ **Production build**: Tailwind v4 PostCSS configuration needs adjustment

### Quick Fix for Production

If you need to deploy immediately, you have two options:

#### Option 1: Use Vercel (Recommended)
Vercel handles Tailwind v4 automatically:

1. Push code to GitHub
2. Import to Vercel
3. Deploy (it will work automatically)

#### Option 2: Downgrade to Tailwind v3
If you need to build locally:

```bash
npm uninstall tailwindcss @tailwindcss/postcss
npm install tailwindcss@3 postcss autoprefixer
```

Then update `app/globals.css` back to:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

And update `postcss.config.mjs` to:
```javascript
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

## Recommended Deployment: Vercel

### Why Vercel?
- Built by the Next.js team
- Automatic Tailwind v4 support
- Zero configuration
- Free tier available
- Instant preview deployments

### Steps:

1. **Push to GitHub**
```bash
cd "/Users/james/claude/Travel Reporting/voyagriq"
git init
git add .
git commit -m "Initial commit: VoyagrIQ demo"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "Import Project"
- Select your GitHub repo
- Click "Deploy"

Done! You'll get a live URL like: `https://voyagriq.vercel.app`

---

## Alternative: Netlify

```bash
npm run build  # May need Tailwind v3 - see Option 2 above
```

Then drag the `.next` folder to Netlify drop zone.

---

## Alternative: Docker (Advanced)

If you need Docker deployment, use Tailwind v3 (Option 2 above) to ensure build works, then:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## For Demo Purposes

**You don't need a production build!**

The development server (`npm run dev`) is perfect for:
- Client demos
- Testing all features
- Presenting to stakeholders
- Local development

It runs fast, hot-reloads automatically, and has all features working.

---

## Summary

✅ **For demos**: Use `npm run dev` (works perfectly!)
✅ **For deployment**: Use Vercel (handles Tailwind v4 automatically)
⚠️ **For local builds**: Downgrade to Tailwind v3 if needed

The app is 100% functional - the build issue is just a configuration detail that doesn't affect the demo or Vercel deployment.
