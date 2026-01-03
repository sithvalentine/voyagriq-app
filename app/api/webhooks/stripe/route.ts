import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// IMPORTANT: Disable body parsing so we can verify the raw body
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  // In development, if signature verification fails, parse the event directly
  // In production, always verify the signature
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (signature && webhookSecret) {
    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('[stripe-webhook] Event received (verified):', event.type);
    } catch (err: any) {
      console.error('[stripe-webhook] Signature verification failed:', err.message);

      if (isDevelopment) {
        // In development, parse the event anyway
        console.log('[stripe-webhook] Development mode: parsing event without verification');
        event = JSON.parse(body);
      } else {
        // In production, reject unverified webhooks
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
      }
    }
  } else if (isDevelopment) {
    // Development mode without signature
    console.log('[stripe-webhook] Development mode: parsing event without signature');
    event = JSON.parse(body);
  } else {
    console.error('[stripe-webhook] No signature found in production');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[stripe-webhook] Checkout session completed:', session.id);
        console.log('[stripe-webhook] Session metadata:', JSON.stringify(session.metadata));

        const tier = session.metadata?.tier;
        const customerId = session.customer as string;
        const isNewRegistration = session.metadata?.isNewRegistration === 'true';

        console.log('[stripe-webhook] Extracted tier:', tier);
        console.log('[stripe-webhook] Is new registration:', isNewRegistration);

        // NEW REGISTRATION FLOW: Create Supabase account after successful payment
        if (isNewRegistration) {
          console.log('[stripe-webhook] NEW REGISTRATION detected - Creating account after payment');

          const registrationEmail = session.metadata?.registrationEmail;
          const registrationPassword = session.metadata?.registrationPassword;
          const registrationFullName = session.metadata?.registrationFullName;

          if (!registrationEmail || !registrationPassword || !registrationFullName) {
            console.error('[stripe-webhook] Missing registration data in metadata');
            return NextResponse.json({ error: 'Missing registration data' }, { status: 400 });
          }

          console.log('[stripe-webhook] Creating Supabase account for:', registrationEmail);

          // Create the Supabase auth user
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: registrationEmail,
            password: registrationPassword,
            email_confirm: true, // Auto-confirm email since they paid
            user_metadata: {
              full_name: registrationFullName,
            }
          });

          if (authError || !authData.user) {
            console.error('[stripe-webhook] Error creating Supabase user:', authError);
            return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
          }

          console.log('[stripe-webhook] Supabase user created:', authData.user.id);

          // Update the newly created profile with Stripe data
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              full_name: registrationFullName,
              stripe_customer_id: customerId,
              subscription_tier: tier || 'starter',
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', authData.user.id);

          if (updateError) {
            console.error('[stripe-webhook] Error updating new user profile:', updateError);
            // Don't return error - user is created, just log it
          }

          console.log('[stripe-webhook] Successfully created and configured new user:', authData.user.id);
        }
        // EXISTING USER FLOW: Update existing user's profile
        else {
          const userId = session.metadata?.userId;

          if (!userId) {
            console.error('[stripe-webhook] No userId in session metadata');
            return NextResponse.json({ error: 'No userId in metadata' }, { status: 400 });
          }

          console.log('[stripe-webhook] EXISTING USER - Updating profile for:', userId);

          // Update user profile with Stripe customer ID and tier
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              stripe_customer_id: customerId,
              subscription_tier: tier || 'starter',
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (updateError) {
            console.error('[stripe-webhook] Error updating profile:', updateError);
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
          }

          console.log('[stripe-webhook] Successfully updated profile for user:', userId);
        }

        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('[stripe-webhook] Subscription event:', event.type, subscription.id);
        console.log('[stripe-webhook] Subscription metadata:', JSON.stringify(subscription.metadata));

        const customerId = subscription.customer as string;
        const status = subscription.status;
        const tier = subscription.metadata?.tier;

        console.log('[stripe-webhook] Subscription tier from metadata:', tier);
        console.log('[stripe-webhook] Subscription status:', status);

        // Find user by Stripe customer ID
        const { data: profile, error: findError } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (findError || !profile) {
          console.error('[stripe-webhook] Could not find user with customer ID:', customerId);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update subscription status
        const updateData: any = {
          subscription_status: status,
          updated_at: new Date().toISOString(),
        };

        if (tier) {
          updateData.subscription_tier = tier;
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', profile.id);

        if (updateError) {
          console.error('[stripe-webhook] Error updating subscription:', updateError);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        console.log('[stripe-webhook] Successfully updated subscription for user:', profile.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('[stripe-webhook] Subscription deleted:', subscription.id);

        const customerId = subscription.customer as string;

        // Find user by Stripe customer ID
        const { data: profile, error: findError } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (findError || !profile) {
          console.error('[stripe-webhook] Could not find user with customer ID:', customerId);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update subscription status to canceled
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error('[stripe-webhook] Error updating canceled subscription:', updateError);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        console.log('[stripe-webhook] Successfully canceled subscription for user:', profile.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('[stripe-webhook] Payment failed for invoice:', invoice.id);

        const customerId = invoice.customer as string;

        // Find user by Stripe customer ID
        const { data: profile, error: findError } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (findError || !profile) {
          console.error('[stripe-webhook] Could not find user with customer ID:', customerId);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update subscription status to past_due
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error('[stripe-webhook] Error updating payment failed status:', updateError);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        console.log('[stripe-webhook] Updated payment failed status for user:', profile.id);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('[stripe-webhook] Payment succeeded for invoice:', invoice.id);

        const customerId = invoice.customer as string;

        // Find user by Stripe customer ID
        const { data: profile, error: findError } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (findError || !profile) {
          console.error('[stripe-webhook] Could not find user with customer ID:', customerId);
          // Don't return error - invoice might be for a new customer
          break;
        }

        // Update subscription status to active
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error('[stripe-webhook] Error updating payment succeeded status:', updateError);
        } else {
          console.log('[stripe-webhook] Updated payment succeeded status for user:', profile.id);
        }
        break;
      }

      default:
        console.log('[stripe-webhook] Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[stripe-webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: `Webhook processing failed: ${error.message}` },
      { status: 500 }
    );
  }
}
