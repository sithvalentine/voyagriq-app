import { NextRequest, NextResponse } from 'next/server';
import { stripe, getStripePriceId } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { SUBSCRIPTION_TIERS } from '@/lib/subscription';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { tier, userId } = await request.json();

    if (!tier || !userId) {
      return NextResponse.json(
        { error: 'Missing tier or userId' },
        { status: 400 }
      );
    }

    // Validate tier
    if (!['starter', 'standard', 'premium'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier' },
        { status: 400 }
      );
    }

    // Get user from Supabase with retry logic (profile might not exist immediately after signup)
    console.log('[create-checkout] Starting checkout for userId:', userId, 'tier:', tier);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let profile = null;
    let profileError = null;

    // Retry up to 10 times with 1 second delay between attempts
    for (let attempt = 0; attempt < 10; attempt++) {
      console.log(`[create-checkout] Attempt ${attempt + 1} to fetch profile for userId:`, userId);

      const result = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      profile = result.data;
      profileError = result.error;

      console.log(`[create-checkout] Attempt ${attempt + 1} result:`, {
        hasProfile: !!profile,
        hasError: !!profileError,
        errorCode: profileError?.code,
        errorMessage: profileError?.message,
        profileEmail: profile?.email
      });

      if (profile && !profileError) {
        console.log('[create-checkout] Profile found successfully:', profile.email);
        break; // Profile found, exit retry loop
      }

      // Wait 1 second before next attempt
      if (attempt < 9) {
        console.log(`[create-checkout] Profile not found, waiting 1s before retry ${attempt + 2}...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (profileError || !profile) {
      console.error('[create-checkout] Profile not found after all retries. Error:', profileError, 'UserId:', userId);
      return NextResponse.json(
        { error: 'User profile not found. Please try again in a moment.' },
        { status: 404 }
      );
    }

    // Get the price ID for this tier
    const priceId = getStripePriceId(tier as 'starter' | 'standard' | 'premium');

    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for tier: ${tier}` },
        { status: 500 }
      );
    }

    // Check if this tier has a trial (Starter & Standard = yes, Premium = no)
    const tierConfig = SUBSCRIPTION_TIERS[tier as 'starter' | 'standard' | 'premium'];
    const hasTrial = tierConfig.hasTrial;
    const trialDays = tierConfig.trialDays || 0;

    // Create Stripe checkout session configuration
    const sessionConfig: any = {
      customer_email: profile.email,
      client_reference_id: userId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/setup-subscription?tier=${tier}&cancelled=true`,
      metadata: {
        userId,
        tier,
      },
      subscription_data: {
        metadata: {
          userId,
          tier,
        },
      },
    };

    // Only add trial if this tier supports it
    if (hasTrial && trialDays > 0) {
      sessionConfig.subscription_data.trial_period_days = trialDays;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
