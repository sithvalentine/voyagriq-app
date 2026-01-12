# Tier Updates - Unlimited Trips & Enterprise Tier

**Date**: 2026-01-12
**Status**: ✅ Complete - Ready for Deployment

## Summary

Major overhaul of subscription tiers to provide better value and clearer differentiation. All tiers now offer unlimited trip tracking, with differentiation based on data retention, team size, and feature access.

## Key Changes

### 1. **Unlimited Trips for All Tiers** 🎉
- **Previous**: Starter (25), Standard (50), Premium (100)
- **New**: ALL tiers have UNLIMITED trips
- **Why**: Removes artificial barriers, provides more value, and differentiates on features instead of arbitrary limits

### 2. **Data Retention Periods** (New Differentiator)
- **Starter**: 6 months retention
- **Standard**: 2 years retention
- **Premium**: 5 years retention
- **Enterprise**: Unlimited retention

### 3. **Team Member Limits** (Adjusted)
- **Starter**: 1 user (solo)
- **Standard**: 10 team members (was unchanged)
- **Premium**: 20 team members (was unchanged)
- **Enterprise**: Unlimited team members

### 4. **New Enterprise Tier** 💼
- **Price**: Contact Us (custom pricing)
- **Target**: Large agencies with specific needs
- **Features**:
  - Everything in Premium
  - Unlimited trips, data retention, team members
  - Custom tier configuration per agency
  - White-label platform branding (not just reports)
  - Custom feature development
  - Dedicated infrastructure
  - Advanced security & compliance
  - SLA guarantees
  - 24/7 priority support
  - Dedicated success manager
  - On-site training available

### 5. **Marketing Updates**
- Pricing page: Added 4th column for Enterprise
- Comparison table: Updated to show unlimited trips, data retention
- FAQ: Updated to explain unlimited trips, data retention, and Enterprise
- Register page: Updated price displays to handle custom pricing
- All marketing copy emphasizes value scaling, not trip limits

## Updated Tier Structure

```typescript
export type SubscriptionTier = 'starter' | 'standard' | 'premium' | 'enterprise';

starter: {
  price: 49,
  tripLimit: 'unlimited',  // Changed from 25
  dataRetention: '6 months',
  userLimit: 1,
  hasTrial: true,
  trialDays: 14,
  features: [
    '14-day free trial',
    'Unlimited trips',  // HIGHLIGHTED
    '6 months data retention',
    'Single user account',
    'Core analytics dashboards',
    'Standard reports',
    'Export to CSV',
    'Basic PDF reports',
    'Commission tracking',
    'Email support',
  ],
  restrictions: [
    'Data retained for 6 months only',
    'Single user only',
    'CSV export only',
    'No bulk import',
    'No custom tags',
    'No scheduled reports',
    'No API access',
  ],
}

standard: {
  price: 99,
  tripLimit: 'unlimited',  // Changed from 50
  dataRetention: '2 years',
  userLimit: 10,
  hasTrial: true,
  trialDays: 14,
  features: [
    'Everything in Starter',
    '14-day free trial',
    'Unlimited trips',  // HIGHLIGHTED
    '2 years data retention',
    'Up to 10 team members',
    'Team collaboration & role permissions',
    'Bulk CSV/Excel import',
    'Advanced filters & search',
    'Export to CSV, Excel & PDF',
    'Enhanced PDF reports',
    'Scheduled reports',
    'Custom client tags & organization',
    'Vendor tracking',
    'Agency performance comparison',
    'Priority email support (24hr response)',
  ],
  restrictions: [
    'Data retained for 2 years',
    'Up to 10 team members',
    'No API access',
    'No white-label branding',
    'No custom fields',
  ],
}

premium: {
  price: 199,
  tripLimit: 'unlimited',  // Changed from 100
  dataRetention: '5 years',
  userLimit: 20,
  hasTrial: false,
  features: [
    'Everything in Standard',
    'Unlimited trips',  // HIGHLIGHTED
    '5 years data retention',
    'Up to 20 team members',
    'White-label PDF reports',
    'Custom logo, colors & company info',
    'API access for automation',
    'Advanced export options',
    'Custom client tags & fields',
    'Multi-client portfolio management',
    'Advanced analytics & insights',
    'Priority support (4-hour response)',
    'Dedicated account manager',
    'Quarterly business reviews',
  ],
  restrictions: [
    'Data retained for 5 years',
    'Up to 20 team members',
  ],
}

enterprise: {
  name: 'Enterprise',
  price: 'custom',  // NEW
  priceLabel: 'Contact Us',
  tripLimit: 'unlimited',
  dataRetention: 'unlimited',  // NEW
  userLimit: 'unlimited',  // NEW
  hasTrial: false,
  contactForPricing: true,
  features: [
    'Everything in Premium',
    'Unlimited trips',
    'Unlimited data retention',  // NEW
    'Unlimited team members',  // NEW
    'Custom tier configuration',  // NEW - agencies can be customized
    'White-label platform branding',  // NEW - full platform, not just reports
    'Custom feature development',
    'Dedicated infrastructure',
    'Advanced security & compliance',
    'Custom integrations',
    'SLA guarantees',
    '24/7 priority support',
    'Dedicated success manager',
    'On-site training available',
    'Custom reporting & analytics',
  ],
  restrictions: [],
}
```

## Files Modified

### Core Configuration
- **lib/subscription.ts** - Added `enterprise` tier, `dataRetention` field, updated pricing structure
- **contexts/TierContext.tsx** - Added enterprise to tier validation
- **lib/reportGenerator.ts** - Added enterprise to SubscriptionTier type
- **lib/pdfGenerator.ts** - Added enterprise tier label

### UI/Marketing
- **app/pricing/page.tsx** - Complete overhaul:
  - Changed from 3-column to 4-column grid
  - Updated all cards to show "Unlimited trips"
  - Added data retention display
  - Added Enterprise tier card with "Contact Sales" button
  - Updated comparison table to 4 columns
  - Updated FAQs to explain unlimited trips and data retention
- **app/register/page.tsx** - Updated price display to handle custom pricing

## Value Proposition Changes

### Previous Messaging
- "Up to X trips per month" (creates fear of hitting limits)
- Upgrades were about "tracking more trips"
- Felt restrictive and artificial

### New Messaging
- "Unlimited trips" (removes barriers)
- Upgrades are about:
  - Longer data retention
  - More team members
  - Better features (bulk import, API, white-label)
  - Advanced support
- Feels generous and value-focused

## Customization Capability

**Enterprise Tier** enables full customization per agency:
- Custom pricing based on needs
- Custom feature development
- Custom tier configuration (can adjust limits/features per client)
- White-label platform branding (entire UI, not just reports)
- Dedicated infrastructure for large agencies
- SLA guarantees

Contact: sales@voyagriq.com for Enterprise inquiries

## Marketing Impact

### Pricing Page
- ✅ Shows "Unlimited trips" prominently on all cards
- ✅ Displays data retention period under trip limit
- ✅ 4-column comparison table including Enterprise
- ✅ Updated FAQs to address new structure
- ✅ Enterprise card with "Contact Sales" CTA

### Comparison Table Highlights
- **Trip limit**: All green "Unlimited"
- **Data retention**: 6 months → 2 years → 5 years → Unlimited
- **Team members**: 1 → 10 → 20 → Unlimited
- **Export options**: CSV → CSV/Excel/PDF → CSV/Excel/PDF → All + Custom
- **Custom features**: Only Enterprise has this

### Updated FAQs
1. "Are trips really unlimited?" - Yes, with explanation
2. "What's the difference in data retention?" - Explains 6mo/2yr/5yr/unlimited
3. "How does Enterprise work?" - Contact sales for custom solution

## Deployment Checklist

- [x] Update core tier types and configuration
- [x] Add Enterprise tier definition
- [x] Update all marketing pages (pricing, register)
- [x] Update comparison tables
- [x] Update FAQs
- [x] Handle custom pricing display (`price: 'custom'`)
- [x] Add data retention field to all tiers
- [x] Update report generators with enterprise tier
- [x] TypeScript compilation passes
- [x] Build succeeds
- [ ] Deploy to production
- [ ] Update Stripe products (Enterprise not in Stripe, contact-only)
- [ ] Test tier functionality
- [ ] Monitor analytics for upgrade patterns

## Database Migration

**Note**: No database migration required! The `subscription_tier` column already accepts text, and `enterprise` will work automatically.

If you want to be explicit, you can add a check constraint:

```sql
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_subscription_tier_check
  CHECK (subscription_tier IN ('starter', 'standard', 'premium', 'enterprise'));
```

## Next Steps

1. **Deploy this update to production**
2. **Set up sales@voyagriq.com email** for Enterprise inquiries
3. **Monitor conversion rates** - expect improved upgrades with unlimited trips
4. **Track which tier differences drive upgrades**:
   - Data retention vs Team size vs Features
5. **Prepare Enterprise sales process**:
   - Custom pricing calculator
   - Contract templates
   - Onboarding process

## Expected Outcomes

### Improved Conversion
- ✅ Starter tier more attractive (unlimited trips vs 25)
- ✅ No fear of hitting limits
- ✅ Clear value scaling

### Clearer Upgrade Path
- Retention → Team size → Features → Custom
- Natural progression as agencies grow
- Less churn from hitting artificial limits

### Enterprise Revenue
- High-value agencies can get custom solutions
- Platform can be white-labeled for OEM deals
- Recurring revenue from large clients

---

**Status**: ✅ Ready to deploy
**Build**: ✅ Passing
**TypeScript**: ✅ No errors

🚀 **Deploy to unlock unlimited trip tracking for all users!**
