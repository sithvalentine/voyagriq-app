/**
 * Check which Stripe mode we're actually using
 * Run with: npx tsx scripts/check-stripe-mode.ts
 */

import * as dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config({ path: '.env.local' });

async function checkStripeMode() {
  console.log('🔍 Checking Stripe Mode\n');
  console.log('='.repeat(60));

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const secretKey = process.env.STRIPE_SECRET_KEY;

  console.log('\n📋 Environment Variables:\n');
  console.log(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${publishableKey?.substring(0, 15)}...`);
  console.log(`STRIPE_SECRET_KEY: ${secretKey?.substring(0, 15)}...`);

  // Check key prefixes
  const publishableMode = publishableKey?.startsWith('pk_test_') ? 'TEST' :
                         publishableKey?.startsWith('pk_live_') ? 'LIVE' : 'UNKNOWN';
  const secretMode = secretKey?.startsWith('sk_test_') ? 'TEST' :
                    secretKey?.startsWith('sk_live_') ? 'LIVE' : 'UNKNOWN';

  console.log(`\nPublishable key mode: ${publishableMode}`);
  console.log(`Secret key mode: ${secretMode}`);

  if (publishableMode !== secretMode) {
    console.log('\n❌ ERROR: Key mode mismatch!');
    console.log('   Publishable and secret keys must both be test or both be live.');
    return;
  }

  console.log(`\n✅ Both keys are in ${publishableMode} mode`);

  // Try to create a test checkout session
  if (!secretKey) {
    console.log('\n❌ No secret key found');
    return;
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2025-12-15.clover',
  });

  try {
    console.log('\n🧪 Testing Checkout Session Creation...\n');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Test Product',
            },
            unit_amount: 1000, // $10.00
          },
          quantity: 1,
        },
      ],
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
    });

    console.log(`Session ID: ${session.id}`);
    console.log(`Session URL: ${session.url}`);

    // Check the session ID prefix
    if (session.id.startsWith('cs_test_')) {
      console.log('\n✅ SUCCESS: Created TEST mode session (cs_test_...)');
      console.log('   Test cards like 4242 4242 4242 4242 will work!');
    } else if (session.id.startsWith('cs_live_')) {
      console.log('\n⚠️  WARNING: Created LIVE mode session (cs_live_...)');
      console.log('   This means real payments! Test cards will NOT work!');
      console.log('   Even though your keys say "test", they might be live keys.');
    } else {
      console.log(`\n❓ Unknown session type: ${session.id}`);
    }

  } catch (error: any) {
    console.log('\n❌ Error creating checkout session:');
    console.log(error.message);
  }

  console.log('\n' + '='.repeat(60));
}

checkStripeMode()
  .then(() => {
    console.log('\n✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
