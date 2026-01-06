import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check which environment variables are loaded
 * Access: https://your-vercel-url.vercel.app/api/check-env
 *
 * SECURITY: DELETE THIS FILE AFTER DEBUGGING!
 */

export async function GET() {
  const envVars = {
    // Show which vars are SET (but not their full values for security)
    supabase: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
    },
    stripe: {
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing',
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing',
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing',
    },
    stripe_prices_monthly: {
      STRIPE_PRICE_STARTER: process.env.STRIPE_PRICE_STARTER ? `✅ ${process.env.STRIPE_PRICE_STARTER}` : '❌ Missing',
      STRIPE_PRICE_STANDARD: process.env.STRIPE_PRICE_STANDARD ? `✅ ${process.env.STRIPE_PRICE_STANDARD}` : '❌ Missing',
      STRIPE_PRICE_PREMIUM: process.env.STRIPE_PRICE_PREMIUM ? `✅ ${process.env.STRIPE_PRICE_PREMIUM}` : '❌ Missing',
    },
    stripe_prices_annual: {
      STRIPE_PRICE_STARTER_ANNUAL: process.env.STRIPE_PRICE_STARTER_ANNUAL ? `✅ ${process.env.STRIPE_PRICE_STARTER_ANNUAL}` : '❌ Missing',
      STRIPE_PRICE_STANDARD_ANNUAL: process.env.STRIPE_PRICE_STANDARD_ANNUAL ? `✅ ${process.env.STRIPE_PRICE_STANDARD_ANNUAL}` : '❌ Missing',
      STRIPE_PRICE_PREMIUM_ANNUAL: process.env.STRIPE_PRICE_PREMIUM_ANNUAL ? `✅ ${process.env.STRIPE_PRICE_PREMIUM_ANNUAL}` : '❌ Missing',
    },
    app_config: {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '❌ Missing',
      NODE_ENV: process.env.NODE_ENV || '❌ Missing',
    },
    summary: {
      total_required_vars: 13,
      total_set: [
        !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        !!process.env.STRIPE_SECRET_KEY,
        !!process.env.STRIPE_PRICE_STARTER,
        !!process.env.STRIPE_PRICE_STANDARD,
        !!process.env.STRIPE_PRICE_PREMIUM,
        !!process.env.STRIPE_PRICE_STARTER_ANNUAL,
        !!process.env.STRIPE_PRICE_STANDARD_ANNUAL,
        !!process.env.STRIPE_PRICE_PREMIUM_ANNUAL,
        !!process.env.STRIPE_WEBHOOK_SECRET,
        !!process.env.NEXT_PUBLIC_APP_URL,
      ].filter(Boolean).length,
      status: [
        !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        !!process.env.STRIPE_SECRET_KEY,
        !!process.env.STRIPE_PRICE_STARTER,
        !!process.env.STRIPE_PRICE_STANDARD,
        !!process.env.STRIPE_PRICE_PREMIUM,
        !!process.env.STRIPE_PRICE_STARTER_ANNUAL,
        !!process.env.STRIPE_PRICE_STANDARD_ANNUAL,
        !!process.env.STRIPE_PRICE_PREMIUM_ANNUAL,
        !!process.env.STRIPE_WEBHOOK_SECRET,
        !!process.env.NEXT_PUBLIC_APP_URL,
      ].filter(Boolean).length === 13 ? '✅ All required vars set' : '⚠️ Some vars missing',
    },
  };

  return NextResponse.json(envVars, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
