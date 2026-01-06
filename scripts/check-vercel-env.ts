/**
 * Check which environment variables are loaded
 * Deploy this and visit /api/check-env to see what's loaded in Vercel
 *
 * SECURITY: Delete this file after debugging!
 */

// This would go in: app/api/check-env/route.ts

export async function GET() {
  const envVars = {
    // Show which vars are SET (but not their values for security)
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,

    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,

    STRIPE_PRICE_STARTER: !!process.env.STRIPE_PRICE_STARTER,
    STRIPE_PRICE_STANDARD: !!process.env.STRIPE_PRICE_STANDARD,
    STRIPE_PRICE_PREMIUM: !!process.env.STRIPE_PRICE_PREMIUM,

    STRIPE_PRICE_STARTER_ANNUAL: !!process.env.STRIPE_PRICE_STARTER_ANNUAL,
    STRIPE_PRICE_STANDARD_ANNUAL: !!process.env.STRIPE_PRICE_STANDARD_ANNUAL,
    STRIPE_PRICE_PREMIUM_ANNUAL: !!process.env.STRIPE_PRICE_PREMIUM_ANNUAL,

    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,

    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL, // Safe to show this one

    // Summary
    total_set: Object.values({
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_PRICE_STARTER: !!process.env.STRIPE_PRICE_STARTER,
      STRIPE_PRICE_STANDARD: !!process.env.STRIPE_PRICE_STANDARD,
      STRIPE_PRICE_PREMIUM: !!process.env.STRIPE_PRICE_PREMIUM,
      STRIPE_PRICE_STARTER_ANNUAL: !!process.env.STRIPE_PRICE_STARTER_ANNUAL,
      STRIPE_PRICE_STANDARD_ANNUAL: !!process.env.STRIPE_PRICE_STANDARD_ANNUAL,
      STRIPE_PRICE_PREMIUM_ANNUAL: !!process.env.STRIPE_PRICE_PREMIUM_ANNUAL,
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
      NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
    }).filter(Boolean).length,
  };

  return Response.json(envVars);
}
