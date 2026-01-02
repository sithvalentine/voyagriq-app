# CI/CD Setup - Continuous Integration & Continuous Deployment

## Overview

This document describes the automated CI/CD pipeline for VoyagrIQ, ensuring code quality and seamless deployments.

---

## Environment Architecture

```
┌─────────────┐
│ Development │  → Local development (localhost:3000)
└──────┬──────┘
       │ git push feature/*
       ↓
┌─────────────┐
│   Develop   │  → Integration branch
└──────┬──────┘
       │ merge to staging
       ↓
┌─────────────┐
│   Staging   │  → staging.tripcostinsights.com
└──────┬──────┘
       │ merge to main (after approval)
       ↓
┌─────────────┐
│ Production  │  → app.tripcostinsights.com
└─────────────┘
```

---

## GitHub Actions Workflow

### 1. Pull Request Checks

Create `.github/workflows/pr-checks.yml`:

```yaml
name: PR Checks

on:
  pull_request:
    branches: [develop, staging, main]

jobs:
  quality-checks:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: TypeScript check
        run: npm run type-check

      - name: Lint check
        run: npm run lint

      - name: Run tests
        run: npm run test

      - name: Build check
        run: npm run build

      - name: Security audit
        run: npm audit --audit-level=high
```

### 2. Deploy to Staging

Create `.github/workflows/deploy-staging.yml`:

```yaml
name: Deploy to Staging

on:
  push:
    branches: [staging]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Build application
        run: npm run build
        env:
          NODE_ENV: staging

      - name: Deploy to Vercel Staging
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--env=staging'
          working-directory: ./

      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Staging deployment completed'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 3. Deploy to Production

Create `.github/workflows/deploy-production.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-production:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production

      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ github.run_number }}
          release_name: Release v${{ github.run_number }}
          body: |
            Production deployment completed
            Commit: ${{ github.sha }}
          draft: false
          prerelease: false

      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment completed'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Required GitHub Secrets

Add these in GitHub repository settings → Secrets and variables → Actions:

```
VERCEL_TOKEN              # Vercel API token
VERCEL_ORG_ID             # Vercel organization ID
VERCEL_PROJECT_ID         # Vercel project ID
SLACK_WEBHOOK             # Slack notification webhook (optional)
DATABASE_URL_STAGING      # Staging database connection
DATABASE_URL_PRODUCTION   # Production database connection
STRIPE_SECRET_KEY         # Stripe API key
OPENAI_API_KEY            # OpenAI API key
SENDGRID_API_KEY          # SendGrid API key
SENTRY_DSN                # Sentry error tracking
```

---

## Branch Protection Rules

### Protect `main` branch

In GitHub Settings → Branches → Branch protection rules:

```yaml
Branch name pattern: main

Required status checks:
  ✓ Require status checks to pass before merging
  ✓ Require branches to be up to date before merging
  - quality-checks
  - build

Required pull request reviews:
  ✓ Require pull request reviews before merging
  ✓ Require approvals: 1
  ✓ Dismiss stale pull request approvals

Other rules:
  ✓ Require linear history
  ✓ Include administrators
```

### Protect `staging` branch

```yaml
Branch name pattern: staging

Required status checks:
  ✓ Require status checks to pass before merging
  - quality-checks
  - build

Required pull request reviews:
  ✓ Require pull request reviews before merging
  ✓ Require approvals: 1
```

---

## Deployment Workflow

### Feature Development → Staging → Production

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Develop and commit
git add .
git commit -m "feat: add new feature"

# 3. Push and create PR to develop
git push origin feature/new-feature
# Create PR on GitHub to `develop` branch
# GitHub Actions runs PR checks

# 4. After PR approval, merge to develop
# Then merge develop to staging
git checkout staging
git merge develop
git push origin staging
# GitHub Actions auto-deploys to staging

# 5. Test on staging environment
# Visit: https://staging.tripcostinsights.com
# Run integration tests

# 6. Create PR from staging to main
# After approval, merge to main
git checkout main
git merge staging
git push origin main
# GitHub Actions auto-deploys to production
# Visit: https://app.tripcostinsights.com
```

---

## Automated Testing Strategy

### Test Pyramid

```
       E2E Tests (few)
         /\
        /  \
       /    \
      /      \
     / Integration \
    /    Tests      \
   /  (moderate)     \
  /                   \
 /   Unit Tests (many) \
/__________________________\
```

### Test Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=__tests__/unit",
    "test:integration": "jest --testPathPattern=__tests__/integration",
    "test:e2e": "playwright test",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## Environment-Specific Configurations

### Development
```bash
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SHOW_DEV_TOOLS=true
NEXT_PUBLIC_MOCK_API_CALLS=true
```

### Staging
```bash
NODE_ENV=staging
NEXT_PUBLIC_API_URL=https://staging-api.tripcostinsights.com
NEXT_PUBLIC_SHOW_DEV_TOOLS=true
NEXT_PUBLIC_MOCK_API_CALLS=false
DATABASE_URL=${{ secrets.DATABASE_URL_STAGING }}
```

### Production
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.tripcostinsights.com
NEXT_PUBLIC_SHOW_DEV_TOOLS=false
NEXT_PUBLIC_MOCK_API_CALLS=false
DATABASE_URL=${{ secrets.DATABASE_URL_PRODUCTION }}
STRIPE_SECRET_KEY=${{ secrets.STRIPE_SECRET_KEY }}
OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}
```

---

## Monitoring & Rollback

### Automatic Rollback on Failure

Add to `.github/workflows/deploy-production.yml`:

```yaml
- name: Health check
  run: |
    sleep 30
    response=$(curl -s -o /dev/null -w "%{http_code}" https://app.tripcostinsights.com/api/health)
    if [ $response != "200" ]; then
      echo "Health check failed, rolling back..."
      vercel rollback
      exit 1
    fi
```

### Manual Rollback

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]

# Or via GitHub
git revert HEAD
git push origin main
```

---

## Performance Monitoring

### Add Lighthouse CI

Create `.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://staging.tripcostinsights.com
          uploadArtifacts: true
```

---

## Database Migrations

### Safe Migration Strategy

```yaml
# Add to deploy workflow before deployment

- name: Run database migrations
  run: |
    npm run migrate:up
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL_PRODUCTION }}

- name: Create database backup
  run: |
    npm run db:backup
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL_PRODUCTION }}
```

---

## Security Scanning

### Add Snyk Security Scan

```yaml
name: Security Scan

on:
  push:
    branches: [main, staging, develop]
  schedule:
    - cron: '0 0 * * 0'  # Weekly scan

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

---

## Notification System

### Slack Notifications

Add to all workflow files:

```yaml
- name: Notify on success
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: custom
    custom_payload: |
      {
        text: '✅ Deployment Successful',
        attachments: [{
          color: 'good',
          text: `Branch: ${process.env.GITHUB_REF}\nCommit: ${process.env.GITHUB_SHA}`
        }]
      }
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}

- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: custom
    custom_payload: |
      {
        text: '❌ Deployment Failed',
        attachments: [{
          color: 'danger',
          text: `Branch: ${process.env.GITHUB_REF}\nCommit: ${process.env.GITHUB_SHA}`
        }]
      }
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Quick Setup Checklist

- [ ] Create GitHub repository
- [ ] Set up Vercel account and link repository
- [ ] Add GitHub secrets (VERCEL_TOKEN, etc.)
- [ ] Create `.github/workflows` directory
- [ ] Add workflow files (pr-checks, deploy-staging, deploy-production)
- [ ] Configure branch protection rules
- [ ] Set up monitoring (Sentry, Vercel Analytics)
- [ ] Configure notification webhooks (Slack, email)
- [ ] Test deployment pipeline with sample PR
- [ ] Document rollback procedures
- [ ] Train team on workflow

---

## Troubleshooting

### Build Fails in CI
```bash
# Run locally to debug
npm run build

# Check CI logs
# GitHub Actions → Failed workflow → View logs
```

### Deployment Fails
```bash
# Check Vercel logs
vercel logs [deployment-url]

# Verify environment variables
vercel env ls
```

### Tests Fail in CI but Pass Locally
- Check Node.js version matches
- Verify environment variables are set
- Check for timezone/locale differences
- Review test database setup

---

## Best Practices

1. **Never commit directly to main**
2. **Always create feature branches**
3. **Write tests for new features**
4. **Test on staging before production**
5. **Review PRs before merging**
6. **Monitor deployments**
7. **Document changes in PR descriptions**
8. **Use semantic commit messages**
9. **Keep dependencies updated**
10. **Rotate secrets regularly**

---

**Setup Complete!** Your CI/CD pipeline is now ready for continuous delivery.
