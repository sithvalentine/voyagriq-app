import { NextRequest, NextResponse } from 'next/server';
import { stripe, getStripePriceId } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { SUBSCRIPTION_TIERS } from '@/lib/subscription';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { tier, userId, registrationData } = await request.json();

    if (!tier) {
      return NextResponse.json(
        { error: 'Missing tier' },
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

    let customerEmail: string;
    let clientReferenceId: string;
    let sessionMetadata: any = { tier };

    // NEW REGISTRATION FLOW: If registrationData is provided, this is a new registration
    // Account will be created after payment via webhook
    if (registrationData) {
      console.log('[create-checkout] NEW REGISTRATION - No account created yet');
      console.log('[create-checkout] Email:', registrationData.email, 'Tier:', tier);

      // Validate registration data
      if (!registrationData.email || !registrationData.password || !registrationData.fullName) {
        return NextResponse.json(
          { error: 'Missing required registration data' },
          { status: 400 }
        );
      }

      customerEmail = registrationData.email;
      clientReferenceId = `pending_${Date.now()}_${registrationData.email}`;

      // Store registration data in metadata for webhook to create account after payment
      sessionMetadata = {
        tier,
        isNewRegistration: 'true',
        registrationEmail: registrationData.email,
        registrationPassword: registrationData.password,
        registrationFullName: registrationData.fullName,
        registrationAgencyName: registrationData.agencyName || '',
      };
    }
    // EXISTING USER FLOW: userId provided, account already exists
    else if (userId) {
      console.log('[create-checkout] EXISTING USER - userId:', userId, 'tier:', tier);

      // Get user from Supabase with retry logic (profile might not exist immediately after signup)
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

        if (profile && !profileError) {
          console.log('[create-checkout] Profile found successfully:', profile.email);
          break;
        }

        if (attempt < 9) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (profileError || !profile) {
        console.error('[create-checkout] Profile not found after all retries. Error:', profileError);
        return NextResponse.json(
          { error: 'User profile not found. Please try again in a moment.' },
          { status: 404 }
        );
      }

      customerEmail = profile.email;
      clientReferenceId = userId;
      sessionMetadata.userId = userId;
    }
    // Neither provided - error
    else {
      return NextResponse.json(
        { error: 'Must provide either userId or registrationData' },
        { status: 400 }
      );
    }

    // Get the price ID for this tier
    console.log('[create-checkout] Getting price ID for tier:', tier);
    const priceId = getStripePriceId(tier as 'starter' | 'standard' | 'premium');
    console.log('[create-checkout] Retrieved price ID:', priceId);

    if (!priceId) {
      console.error('[create-checkout] No price ID found for tier:', tier);
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
    console.log('[create-checkout] Session metadata being sent to Stripe:', JSON.stringify(sessionMetadata));
    console.log('[create-checkout] Tier value:', tier);
    console.log('[create-checkout] Price ID:', priceId);

    const sessionConfig: any = {
      customer_email: customerEmail,
      client_reference_id: clientReferenceId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/register?tier=${tier}&cancelled=true`,
      metadata: sessionMetadata,
      subscription_data: {
        metadata: sessionMetadata,
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
