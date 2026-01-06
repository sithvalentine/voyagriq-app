/**
 * Test Stripe Configuration
 * Verifies that Stripe is properly configured and can create checkout sessions
 * Run with: npx tsx scripts/test-stripe-config.ts
 */

import * as dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config({ path: '.env.local' });

const requiredEnvVars = [
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_PRICE_STARTER',
  'STRIPE_PRICE_STANDARD',
  'STRIPE_PRICE_PREMIUM',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_APP_URL',
];

async function testStripeConfig() {
  console.log('🔍 Testing Stripe Configuration\n');
  console.log('='.repeat(60));

  // Step 1: Check environment variables
  console.log('\n📋 Step 1: Checking Environment Variables\n');

  let missingVars: string[] = [];
  for (const varName of requiredEnvVars) {
    const value = process.env[varName];
    if (!value) {
      console.log(`   ❌ ${varName}: MISSING`);
      missingVars.push(varName);
    } else {
      const preview = value.substring(0, 20) + '...';
      console.log(`   ✅ ${varName}: ${preview}`);
    }
  }

  if (missingVars.length > 0) {
    console.log('\n❌ Missing environment variables:', missingVars.join(', '));
    console.log('   Please add these to your .env.local file and Vercel environment variables');
    return;
  }

  // Step 2: Test Stripe API connection
  console.log('\n🔌 Step 2: Testing Stripe API Connection\n');

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
  });

  try {
    // Test API by listing products
    const products = await stripe.products.list({ limit: 5 });
    console.log(`   ✅ Connected to Stripe API successfully`);
    console.log(`   📦 Found ${products.data.length} products in your Stripe account`);

    if (products.data.length === 0) {
      console.log('\n   ⚠️  WARNING: No products found in Stripe!');
      console.log('   You need to create products in Stripe Dashboard:');
      console.log('   https://dashboard.stripe.com/test/products');
    } else {
      console.log('\n   Products:');
      products.data.forEach((product) => {
        console.log(`   - ${product.name} (${product.id})`);
      });
    }
  } catch (error: any) {
    console.log(`   ❌ Failed to connect to Stripe API`);
    console.log(`   Error: ${error.message}`);
    return;
  }

  // Step 3: Verify price IDs exist
  console.log('\n💰 Step 3: Verifying Price IDs\n');

  const priceIds = {
    starter: process.env.STRIPE_PRICE_STARTER!,
    standard: process.env.STRIPE_PRICE_STANDARD!,
    premium: process.env.STRIPE_PRICE_PREMIUM!,
  };

  for (const [tier, priceId] of Object.entries(priceIds)) {
    try {
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : 'N/A';
      const currency = price.currency.toUpperCase();
      const interval = price.recurring?.interval || 'one-time';
      console.log(`   ✅ ${tier.padEnd(10)}: $${amount} ${currency}/${interval} (${priceId})`);
    } catch (error: any) {
      console.log(`   ❌ ${tier.padEnd(10)}: Invalid price ID (${priceId})`);
      console.log(`      Error: ${error.message}`);
    }
  }

  // Step 4: Test checkout session creation
  console.log('\n🛒 Step 4: Testing Checkout Session Creation\n');

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceIds.starter,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/register?cancelled=true`,
      metadata: {
        tier: 'starter',
        test: 'true',
      },
    });

    console.log(`   ✅ Successfully created test checkout session`);
    console.log(`   Session ID: ${session.id}`);
    console.log(`   Checkout URL: ${session.url}`);
    console.log('\n   ℹ️  This is a test session - it has not been saved');
  } catch (error: any) {
    console.log(`   ❌ Failed to create checkout session`);
    console.log(`   Error: ${error.message}`);
    return;
  }

  // Step 5: Test webhook signature verification
  console.log('\n🪝 Step 5: Testing Webhook Configuration\n');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  console.log(`   Webhook Secret: ${webhookSecret.substring(0, 15)}...`);

  // Create a test event payload
  const testPayload = JSON.stringify({
    id: 'evt_test_webhook',
    object: 'event',
    type: 'checkout.session.completed',
    data: { object: {} },
  });

  const testSignature = stripe.webhooks.generateTestHeaderString({
    payload: testPayload,
    secret: webhookSecret,
  });

  try {
    const event = stripe.webhooks.constructEvent(
      testPayload,
      testSignature,
      webhookSecret
    );
    console.log(`   ✅ Webhook signature verification working`);
    console.log(`   Test event type: ${event.type}`);
  } catch (error: any) {
    console.log(`   ❌ Webhook signature verification failed`);
    console.log(`   Error: ${error.message}`);
    console.log('\n   ⚠️  This means webhooks from Stripe will be rejected!');
    console.log('   Solution: Update STRIPE_WEBHOOK_SECRET in your environment variables');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ Stripe Configuration Test Complete\n');
  console.log('📝 Next Steps:');
  console.log('   1. If all checks passed, Stripe is configured correctly locally');
  console.log('   2. Copy ALL environment variables to Vercel:');
  console.log('      - Go to Vercel Dashboard → Settings → Environment Variables');
  console.log('      - Add each variable for the correct environment (Preview/Production)');
  console.log('   3. For webhooks to work in Vercel, configure webhook endpoint:');
  console.log('      - Go to https://dashboard.stripe.com/test/webhooks');
  console.log('      - Add endpoint: https://your-vercel-url.vercel.app/api/webhooks/stripe');
  console.log('      - Copy the signing secret and update STRIPE_WEBHOOK_SECRET in Vercel');
  console.log('   4. After updating Vercel env vars, trigger a new deployment');
}

testStripeConfig()
  .then(() => {
    console.log('\n👋 Test complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
