import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { alertWebhookFailure, alertPaymentFailure } from '@/lib/alerts';
import { trackPaymentSuccess, trackPaymentFailure, trackSubscriptionCancelled } from '@/lib/analytics';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// IMPORTANT: Disable body parsing so we can verify the raw body
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Rate limiting: Prevent webhook flooding attacks
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(clientIP, RATE_LIMITS.PUBLIC_PER_IP.limit, RATE_LIMITS.PUBLIC_PER_IP.windowMs);

  if (!rateLimit.allowed) {
    console.warn(`[stripe-webhook] Rate limit exceeded for IP: ${clientIP}`);
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: rateLimit.headers
      }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  // SECURITY: ALWAYS verify webhook signature in production
  // Missing signature or invalid signature = reject the webhook
  if (!signature) {
    console.error('[stripe-webhook] Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  if (!webhookSecret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  try {
    // Verify webhook signature - this prevents spoofed webhooks
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('[stripe-webhook] Event received (verified):', event.type);
  } catch (err: any) {
    console.error('[stripe-webhook] ⚠️ Signature verification FAILED:', err.message);
    console.error('[stripe-webhook] This could be a spoofed webhook attempt!');
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // IDEMPOTENCY: Check if we've already processed this webhook event
    // Stripe can send the same event multiple times, so we need to deduplicate
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('event_id', event.id)
      .single();

    if (existingEvent) {
      console.log('[stripe-webhook] Event already processed:', event.id);
      return NextResponse.json({ received: true, status: 'already_processed' });
    }

    // Record this event to prevent duplicate processing
    const { error: insertError } = await supabase
      .from('webhook_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
        processed_at: new Date().toISOString(),
        event_data: event.data.object,
      });

    if (insertError) {
      console.error('[stripe-webhook] Error recording event:', insertError);
      // Continue processing even if we can't record (avoid blocking legitimate events)
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[stripe-webhook] Checkout session completed:', session.id);
        console.log('[stripe-webhook] Session metadata:', JSON.stringify(session.metadata));

        const tier = session.metadata?.tier;
        const customerId = session.customer as string;
        const userId = session.metadata?.userId;

        console.log('[stripe-webhook] Extracted tier:', tier);
        console.log('[stripe-webhook] User ID:', userId);

        // SECURITY FIX: User account is now created BEFORE payment (not after)
        // Webhook just updates the profile with Stripe customer ID
        if (!userId) {
          console.error('[stripe-webhook] No userId in session metadata');
          return NextResponse.json({ error: 'No userId in metadata' }, { status: 400 });
        }

        console.log('[stripe-webhook] Payment successful - Updating profile for user:', userId);

        // Update user profile with Stripe customer ID and activate subscription
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
          await alertWebhookFailure(event.type, userId, updateError as Error);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        console.log('[stripe-webhook] Successfully activated subscription for user:', userId);

        // Track payment success
        const billingCycle = session.metadata?.billing_cycle || 'monthly';
        await trackPaymentSuccess(
          userId,
          tier || 'starter',
          session.amount_total || 0,
          session.currency || 'usd',
          billingCycle
        );

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

        // Track subscription cancellation
        const { data: profileData } = await supabase
          .from('profiles')
          .select('created_at, subscription_tier')
          .eq('id', profile.id)
          .single();

        if (profileData) {
          const daysActive = Math.floor(
            (Date.now() - new Date(profileData.created_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          await trackSubscriptionCancelled(
            profile.id,
            profileData.subscription_tier || 'starter',
            daysActive
          );
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
          await alertWebhookFailure(event.type, profile.id, updateError as Error);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        // Alert on payment failure
        const failureReason = (invoice as any).last_payment_error?.message || 'Unknown reason';
        await alertPaymentFailure(profile.id, invoice.amount_due, failureReason);

        // Track payment failure
        await trackPaymentFailure(profile.id, failureReason, invoice.amount_due);

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
