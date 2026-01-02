// Subscription Tiers and Feature Limits

export type SubscriptionTier = 'starter' | 'standard' | 'premium';

export interface TierFeatures {
  name: string;
  price: number;
  priceLabel: string;
  tripLimit: number | 'unlimited';
  userLimit: number;
  hasTrial: boolean;
  trialDays?: number;
  features: string[];
  restrictions: string[];
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierFeatures> = {
  starter: {
    name: 'Starter',
    price: 49,
    priceLabel: '$49/mo',
    tripLimit: 25,
    userLimit: 1,
    hasTrial: true,
    trialDays: 14,
    features: [
      '14-day free trial',
      'Up to 25 trips per month',
      'Single user account',
      'Core analytics dashboards',
      'Standard reports',
      'Export to CSV, Excel & PDF',
      'PDF reports with trip analytics',
      'Cost breakdown analysis',
      'Cost per traveler metrics',
      'Commission tracking',
      'Email support',
    ],
    restrictions: [
      'Limited to 25 trips',
      'Single user only',
      'No custom tags',
      'No scheduled reports',
      'No API access',
      'No advanced BI insights',
    ],
  },
  standard: {
    name: 'Standard',
    price: 99,
    priceLabel: '$99/mo',
    tripLimit: 50,
    userLimit: 10,
    hasTrial: true,
    trialDays: 14,
    features: [
      'Everything in Starter',
      '14-day free trial',
      'Up to 50 trips per month',
      'Up to 10 team members',
      'Team collaboration & role permissions',
      'Advanced filters & search',
      'Scheduled reports (weekly/monthly)',
      'Custom client tags & organization',
      'Agency performance comparison',
      'Priority email support (24hr response)',
    ],
    restrictions: [
      'Limited to 50 trips',
      'Up to 10 users',
      'No API access',
      'No white-label branding',
    ],
  },
  premium: {
    name: 'Premium',
    price: 199,
    priceLabel: '$199/mo',
    tripLimit: 100,
    userLimit: 20,
    hasTrial: false,
    features: [
      'Everything in Standard',
      'Up to 100 trips per month',
      'Up to 20 team members',
      'White-label PDF reports with your branding',
      'Custom logo, colors & company info',
      'API access for automation & integrations',
      'Advanced export options',
      'Custom client tags & fields',
      'Multi-client portfolio management',
      'Priority support (4-hour response)',
      'Dedicated account manager',
      'Custom feature development available',
      'Quarterly business reviews',
    ],
    restrictions: [
      'Limited to 100 trips',
      'Up to 20 team members',
    ],
  },
};

// Helper function to check if user can perform action
export function canPerformAction(
  currentTier: SubscriptionTier,
  action: 'add_trip' | 'add_user' | 'export_data' | 'schedule_reports' | 'use_api',
  currentCount?: number
): { allowed: boolean; reason?: string } {
  const tier = SUBSCRIPTION_TIERS[currentTier];

  switch (action) {
    case 'add_trip':
      if (tier.tripLimit === 'unlimited') return { allowed: true };
      if (currentCount !== undefined && currentCount >= tier.tripLimit) {
        return {
          allowed: false,
          reason: `You've reached your limit of ${tier.tripLimit} trips. Upgrade to add more.`,
        };
      }
      return { allowed: true };

    case 'add_user':
      if (currentCount !== undefined && currentCount >= tier.userLimit) {
        return {
          allowed: false,
          reason: `You've reached your limit of ${tier.userLimit} user(s). Upgrade to add more.`,
        };
      }
      return { allowed: true };

    case 'schedule_reports':
      if (currentTier === 'starter') {
        return {
          allowed: false,
          reason: 'Scheduled reports are available in Standard and Premium plans.',
        };
      }
      return { allowed: true };

    case 'use_api':
      if (currentTier !== 'premium') {
        return {
          allowed: false,
          reason: 'API access is only available in the Premium plan.',
        };
      }
      return { allowed: true };

    case 'export_data':
      return { allowed: true }; // All tiers can export

    default:
      return { allowed: true };
  }
}

// Get tier by name
export function getTierByName(tierName: string): SubscriptionTier {
  const normalized = tierName.toLowerCase();
  if (normalized === 'starter') return 'starter';
  if (normalized === 'standard') return 'standard';
  if (normalized === 'premium') return 'premium';
  return 'starter'; // Default to starter tier
}

// Get next tier for upgrades
export function getNextTier(currentTier: SubscriptionTier): SubscriptionTier | null {
  if (currentTier === 'starter') return 'standard';
  if (currentTier === 'standard') return 'premium';
  return null; // Already at highest tier
}

// Calculate savings when upgrading
export function calculateUpgradeSavings(
  currentTier: SubscriptionTier,
  targetTier: SubscriptionTier
): number {
  const currentPrice = SUBSCRIPTION_TIERS[currentTier].price;
  const targetPrice = SUBSCRIPTION_TIERS[targetTier].price;
  return targetPrice - currentPrice;
}
