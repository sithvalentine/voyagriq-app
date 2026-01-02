import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// This script creates the VoyagrIQ subscription products in Stripe
// Run with: npx tsx scripts/setup-stripe-products.ts

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in .env.local');
  console.error('Please make sure your .env.local file contains STRIPE_SECRET_KEY');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
});

async function setupProducts() {
  console.log('🚀 Setting up VoyagrIQ products in Stripe...\n');

  try {
    // Create Starter Product
    console.log('Creating Starter tier...');
    const starterProduct = await stripe.products.create({
      name: 'VoyagrIQ Starter',
      description: '25 trips per month, perfect for solo travel advisors',
      metadata: {
        tier: 'starter',
        trip_limit: '25',
        team_members: '1',
      },
    });

    const starterPrice = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 4900, // $49.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
        trial_period_days: 14,
      },
      metadata: {
        tier: 'starter',
      },
    });

    console.log('✅ Starter tier created');
    console.log(`   Product ID: ${starterProduct.id}`);
    console.log(`   Price ID: ${starterPrice.id}\n`);

    // Create Standard Product
    console.log('Creating Standard tier...');
    const standardProduct = await stripe.products.create({
      name: 'VoyagrIQ Standard',
      description: '100 trips per month, ideal for growing teams',
      metadata: {
        tier: 'standard',
        trip_limit: '100',
        team_members: '10',
      },
    });

    const standardPrice = await stripe.prices.create({
      product: standardProduct.id,
      unit_amount: 9900, // $99.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
        trial_period_days: 14,
      },
      metadata: {
        tier: 'standard',
      },
    });

    console.log('✅ Standard tier created');
    console.log(`   Product ID: ${standardProduct.id}`);
    console.log(`   Price ID: ${standardPrice.id}\n`);

    // Create Premium Product
    console.log('Creating Premium tier...');
    const premiumProduct = await stripe.products.create({
      name: 'VoyagrIQ Premium',
      description: '100 trips per month, white-label reports, API access',
      metadata: {
        tier: 'premium',
        trip_limit: '100',
        team_members: '20',
      },
    });

    const premiumPrice = await stripe.prices.create({
      product: premiumProduct.id,
      unit_amount: 19900, // $199.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier: 'premium',
      },
    });

    console.log('✅ Premium tier created');
    console.log(`   Product ID: ${premiumProduct.id}`);
    console.log(`   Price ID: ${premiumPrice.id}\n`);

    // Print summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 All products created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📝 Add these to your .env.local file:\n');
    console.log(`STRIPE_PRICE_STARTER=${starterPrice.id}`);
    console.log(`STRIPE_PRICE_STANDARD=${standardPrice.id}`);
    console.log(`STRIPE_PRICE_PREMIUM=${premiumPrice.id}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error: any) {
    console.error('❌ Error creating products:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('\n⚠️  Make sure your STRIPE_SECRET_KEY is set correctly in .env.local');
    }
    process.exit(1);
  }
}

setupProducts();
