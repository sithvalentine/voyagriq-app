# VoyagrIQ Development Guide

## Repository Structure

**This is the ONLY repository for VoyagrIQ production.**

- **Production Branch**: `main` → deploys to voyagriq.com
- **Development**: Use feature branches, NOT separate directories

## Development Workflow

### 1. Never Edit Outside This Directory
❌ DO NOT work in `/Users/james/claude/Travel Reporting/`
✅ ONLY work in `/Users/james/claude/voyagriq-app/`

### 2. Use Feature Branches
```bash
# Start new feature
git checkout -b feature/my-feature

# Make changes, commit regularly
git add .
git commit -m "Description"

# Test locally
npm run dev

# When ready, merge to main
git checkout main
git merge feature/my-feature
git push origin main
```

### 3. Test Before Deploying
```bash
# Always run build locally first
npm run build

# If build fails, fix errors before pushing
# Pre-push hook will block pushes that fail TypeScript
```

## Architecture Notes

### Database: Supabase
- All trip data stored in Supabase `trips` table
- User authentication via Supabase Auth
- NO localStorage for production data

### Type Safety
- All Trip interfaces defined in `/data/trips.ts`
- Keep interface in sync with database schema
- Avoid using `@ts-nocheck` (only use temporarily during emergencies)

## Deployment

- **Automatic**: Push to `main` triggers Vercel deployment
- **Preview**: Push to any other branch creates preview URL
- **Rollback**: Use Vercel dashboard to revert to previous deployment

## Common Mistakes to Avoid

1. ❌ Working in two directories simultaneously
2. ❌ Syncing code between directories with rsync
3. ❌ Pushing without running `npm run build` locally
4. ❌ Using incomplete TypeScript interfaces
5. ❌ Mixing localStorage and Supabase code

## Emergency Recovery

If deployment fails:
1. Check Vercel logs: https://vercel.com/james-burns-projects-286e4ef4/voyagriq-app
2. Rollback in Vercel dashboard to last working deployment
3. Fix issues locally with `npm run build`
4. Only push when build succeeds locally
