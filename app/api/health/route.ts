import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

/**
 * GET /api/health
 * Health check endpoint for monitoring service availability
 *
 * Returns 200 if all services are healthy, 503 if any are down
 *
 * Checks:
 * - Database connectivity (Supabase)
 * - Stripe API availability
 *
 * Usage:
 * - UptimeRobot: Monitor this endpoint every 5 minutes
 * - Load balancers: Use for health checks
 * - Deployment verification: Check after deploy
 */
export async function GET() {
  const startTime = Date.now();

  const health = {
    status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: {
        status: 'unknown' as 'ok' | 'error',
        responseTime: 0,
        error: null as string | null,
      },
      stripe: {
        status: 'unknown' as 'ok' | 'error',
        responseTime: 0,
        error: null as string | null,
      },
    },
    responseTime: 0,
  };

  // Check 1: Database connectivity
  try {
    const dbStart = Date.now();
    const supabase = getServiceRoleClient();

    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    health.checks.database.responseTime = Date.now() - dbStart;

    if (error) {
      health.checks.database.status = 'error';
      health.checks.database.error = error.message;
    } else {
      health.checks.database.status = 'ok';
    }
  } catch (error: any) {
    health.checks.database.status = 'error';
    health.checks.database.error = error.message || 'Database connection failed';
  }

  // Check 2: Stripe API availability
  try {
    const stripeStart = Date.now();

    // Only check if Stripe key is configured
    if (process.env.STRIPE_SECRET_KEY) {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-12-15.clover',
      });

      // Simple API call to verify connectivity
      await stripe.products.list({ limit: 1 });

      health.checks.stripe.responseTime = Date.now() - stripeStart;
      health.checks.stripe.status = 'ok';
    } else {
      health.checks.stripe.status = 'ok';
      health.checks.stripe.error = 'Stripe not configured (optional)';
    }
  } catch (error: any) {
    health.checks.stripe.status = 'error';
    health.checks.stripe.error = error.message || 'Stripe API connection failed';
  }

  // Determine overall health status
  const hasError =
    health.checks.database.status === 'error' ||
    health.checks.stripe.status === 'error';

  if (hasError) {
    health.status = 'unhealthy';
  } else {
    health.status = 'healthy';
  }

  health.responseTime = Date.now() - startTime;

  // Return appropriate HTTP status
  const httpStatus = health.status === 'healthy' ? 200 : 503;

  return NextResponse.json(health, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'application/json',
    },
  });
}
