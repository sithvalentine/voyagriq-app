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
  starter: process.env.STRIPE_PRICE_STARTER || '', // $49/month
  standard: process.env.STRIPE_PRICE_STANDARD || '', // $99/month
  premium: process.env.STRIPE_PRICE_PREMIUM || '', // $199/month
};

// Log loaded price IDs on startup
console.log('[stripe] Loaded price IDs:', {
  starter: process.env.STRIPE_PRICE_STARTER,
  standard: process.env.STRIPE_PRICE_STANDARD,
  premium: process.env.STRIPE_PRICE_PREMIUM,
});

// Map tier names to Stripe price IDs
export function getStripePriceId(tier: 'starter' | 'standard' | 'premium'): string {
  const priceId = STRIPE_PRICES[tier];
  console.log(`[stripe] Getting price ID for tier '${tier}':`, priceId);
  return priceId;
}
