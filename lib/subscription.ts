// Subscription Tiers and Feature Limits

export type SubscriptionTier = 'starter' | 'standard' | 'premium' | 'enterprise';

export interface TierFeatures {
  name: string;
  price: number | 'custom';
  priceLabel: string;
  tripLimit: number | 'unlimited';
  dataRetention: string; // e.g., '6 months', '2 years', '5 years', 'unlimited'
  userLimit: number | 'unlimited';
  hasTrial: boolean;
  trialDays?: number;
  features: string[];
  restrictions: string[];
  contactForPricing?: boolean;
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierFeatures> = {
  starter: {
    name: 'Starter',
    price: 49,
    priceLabel: '$49/mo',
    tripLimit: 'unlimited',
    dataRetention: '6 months',
    userLimit: 1,
    hasTrial: true,
    trialDays: 14,
    features: [
      '14-day free trial',
      '6 months data retention',
      'Single user account',
      'Core analytics dashboards',
      'Standard reports',
      'Export to CSV, Excel & PDF',
      'Cost breakdown analysis',
      'Cost per traveler metrics',
      'Commission tracking',
      'Email support',
    ],
    restrictions: [
      'Data retained for 6 months only',
      'Single user only',
      'No bulk import',
      'No custom tags',
      'No scheduled reports',
      'No API access',
      'No advanced analytics',
    ],
  },
  standard: {
    name: 'Standard',
    price: 99,
    priceLabel: '$99/mo',
    tripLimit: 'unlimited',
    dataRetention: '2 years',
    userLimit: 10,
    hasTrial: true,
    trialDays: 14,
    features: [
      'Everything in Starter',
      '14-day free trial',
      '2 years data retention',
      'Up to 10 team members',
      'Team collaboration & role permissions',
      'Bulk CSV/Excel import',
      'Advanced filters & search',
      'Export to CSV, Excel & PDF',
      'Enhanced PDF reports',
      'Scheduled reports (weekly/monthly)',
      'Custom client tags & organization',
      'Vendor tracking',
      'Agency performance comparison',
      'Advanced analytics & insights',
      'Priority email support (24hr response)',
    ],
    restrictions: [
      'Data retained for 2 years',
      'Up to 10 team members',
      'No API access',
      'No white-label branding',
      'No custom fields',
    ],
  },
  premium: {
    name: 'Premium',
    price: 199,
    priceLabel: '$199/mo',
    tripLimit: 'unlimited',
    dataRetention: '5 years',
    userLimit: 20,
    hasTrial: false,
    features: [
      'Everything in Standard',
      '5 years data retention',
      'Up to 20 team members',
      'White-label PDF reports with your branding',
      'Custom logo, colors & company info',
      'API access for automation & integrations',
      'Advanced export options',
      'Custom client tags & fields',
      'Multi-client portfolio management',
      'Client-specific pricing overrides',
      'Vendor pricing rules & automation',
      'Priority support (4-hour response)',
      'Dedicated account manager',
      'Quarterly business reviews',
    ],
    restrictions: [
      'Data retained for 5 years',
      'Up to 20 team members',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 'custom',
    priceLabel: 'Contact Us',
    tripLimit: 'unlimited',
    dataRetention: 'unlimited',
    userLimit: 'unlimited',
    hasTrial: false,
    contactForPricing: true,
    features: [
      'Everything in Premium',
      'Unlimited data retention',
      'Unlimited team members',
      'Custom tier configuration',
      'White-label platform branding',
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
      if (tier.userLimit === 'unlimited') return { allowed: true };
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
      if (currentTier !== 'premium' && currentTier !== 'enterprise') {
        return {
          allowed: false,
          reason: 'API access is only available in Premium and Enterprise plans.',
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
  if (currentTier === 'premium') return 'enterprise';
  return null; // Already at highest tier
}

// Calculate savings when upgrading
export function calculateUpgradeSavings(
  currentTier: SubscriptionTier,
  targetTier: SubscriptionTier
): number | null {
  const currentPrice = SUBSCRIPTION_TIERS[currentTier].price;
  const targetPrice = SUBSCRIPTION_TIERS[targetTier].price;

  // Can't calculate if either price is custom
  if (currentPrice === 'custom' || targetPrice === 'custom') {
    return null;
  }

  return targetPrice - currentPrice;
}
