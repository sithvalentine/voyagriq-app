import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

// Stripe Price IDs - You'll need to create these in your Stripe Dashboard
// For now, we'll use environment variables
export const STRIPE_PRICES = {
  monthly: {
    starter: process.env.STRIPE_PRICE_STARTER || '', // $49/month
    standard: process.env.STRIPE_PRICE_STANDARD || '', // $99/month
    premium: process.env.STRIPE_PRICE_PREMIUM || '', // $199/month
  },
  annual: {
    starter: process.env.STRIPE_PRICE_STARTER_ANNUAL || '', // $588/year (pay 12, get 14)
    standard: process.env.STRIPE_PRICE_STANDARD_ANNUAL || '', // $1,188/year (pay 12, get 14)
    premium: process.env.STRIPE_PRICE_PREMIUM_ANNUAL || '', // $2,388/year (pay 12, get 14)
  },
};

// Log loaded price IDs on startup
console.log('[stripe] Loaded price IDs:', {
  monthly: {
    starter: process.env.STRIPE_PRICE_STARTER,
    standard: process.env.STRIPE_PRICE_STANDARD,
    premium: process.env.STRIPE_PRICE_PREMIUM,
  },
  annual: {
    starter: process.env.STRIPE_PRICE_STARTER_ANNUAL,
    standard: process.env.STRIPE_PRICE_STANDARD_ANNUAL,
    premium: process.env.STRIPE_PRICE_PREMIUM_ANNUAL,
  },
});

// Map tier names to Stripe price IDs
export function getStripePriceId(
  tier: 'starter' | 'standard' | 'premium',
  interval: 'monthly' | 'annual' = 'monthly'
): string {
  const priceId = STRIPE_PRICES[interval][tier];
  console.log(`[stripe] Getting price ID for tier '${tier}' with interval '${interval}':`, priceId);
  return priceId;
}
