/**
 * Analytics Tracking for Business Metrics
 *
 * Uses Vercel Analytics to track:
 * - User registration
 * - Payment funnel (checkout started, completed, failed)
 * - Feature usage
 * - Conversions
 */

import { track } from '@vercel/analytics/server';

/**
 * Track user registration
 */
export async function trackUserRegistration(userId: string, email: string, tier: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[analytics] User registered:', { userId, email, tier });
    return;
  }

  await track('user_registered', {
    userId,
    email: sanitizeEmail(email),
    tier,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track checkout started
 */
export async function trackCheckoutStarted(userId: string, tier: string, billingCycle: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[analytics] Checkout started:', { userId, tier, billingCycle });
    return;
  }

  await track('checkout_started', {
    userId,
    tier,
    billingCycle,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track payment success
 */
export async function trackPaymentSuccess(
  userId: string,
  tier: string,
  amount: number,
  currency: string,
  billingCycle: string
) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[analytics] Payment success:', { userId, tier, amount, currency });
    return;
  }

  await track('payment_success', {
    userId,
    tier,
    amount: amount / 100, // Convert cents to dollars
    currency,
    billingCycle,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track payment failure
 */
export async function trackPaymentFailure(
  userId: string,
  reason: string,
  amount: number
) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[analytics] Payment failed:', { userId, reason, amount });
    return;
  }

  await track('payment_failed', {
    userId,
    reason,
    amount: amount / 100,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track subscription cancellation
 */
export async function trackSubscriptionCancelled(
  userId: string,
  tier: string,
  daysActive: number
) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[analytics] Subscription cancelled:', { userId, tier, daysActive });
    return;
  }

  await track('subscription_cancelled', {
    userId,
    tier,
    daysActive,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track first trip created (onboarding completion)
 */
export async function trackFirstTripCreated(userId: string, tier: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[analytics] First trip created:', { userId, tier });
    return;
  }

  await track('first_trip_created', {
    userId,
    tier,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track feature usage
 */
export async function trackFeatureUsage(
  feature: string,
  userId: string,
  tier: string,
  metadata?: Record<string, any>
) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[analytics] Feature used:', { feature, userId, tier, metadata });
    return;
  }

  await track('feature_used', {
    feature,
    userId,
    tier,
    ...metadata,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Sanitize email for analytics (hash or truncate)
 */
function sanitizeEmail(email: string): string {
  // Keep domain but hash local part
  const [local, domain] = email.split('@');
  const hashedLocal = local.substring(0, 3) + '***';
  return `${hashedLocal}@${domain}`;
}
