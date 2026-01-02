import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    // Create a supabase client with service role to exchange code for session
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(new URL('/login?error=verification_failed', requestUrl.origin));
    }

    if (user) {
      // Check if user has a Stripe customer ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id, subscription_tier')
        .eq('id', user.id)
        .single();

      // If no Stripe customer ID, they must complete payment before accessing the app
      if (profile && !profile.stripe_customer_id) {
        const tier = profile.subscription_tier || 'starter';
        return NextResponse.redirect(new URL(`/setup-subscription?tier=${tier}`, requestUrl.origin));
      }

      // If they have stripe_customer_id, they've paid - allow access to trips
      return NextResponse.redirect(new URL('/trips', requestUrl.origin));
    }
  }

  // Fallback: redirect to login if something went wrong
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
