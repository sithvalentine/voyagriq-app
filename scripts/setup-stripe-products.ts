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
        billing_interval: 'monthly',
      },
    });

    const starterAnnualPrice = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 58800, // $588.00 in cents ($49 × 12)
      currency: 'usd',
      recurring: {
        interval: 'year',
        // NO trial for annual plans
      },
      metadata: {
        tier: 'starter',
        billing_interval: 'annual',
        bonus_months: '2', // Pay for 12, get 14
      },
    });

    console.log('✅ Starter tier created');
    console.log(`   Product ID: ${starterProduct.id}`);
    console.log(`   Monthly Price ID: ${starterPrice.id}`);
    console.log(`   Annual Price ID: ${starterAnnualPrice.id}\n`);

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
        billing_interval: 'monthly',
      },
    });

    const standardAnnualPrice = await stripe.prices.create({
      product: standardProduct.id,
      unit_amount: 118800, // $1,188.00 in cents ($99 × 12)
      currency: 'usd',
      recurring: {
        interval: 'year',
        // NO trial for annual plans
      },
      metadata: {
        tier: 'standard',
        billing_interval: 'annual',
        bonus_months: '2', // Pay for 12, get 14
      },
    });

    console.log('✅ Standard tier created');
    console.log(`   Product ID: ${standardProduct.id}`);
    console.log(`   Monthly Price ID: ${standardPrice.id}`);
    console.log(`   Annual Price ID: ${standardAnnualPrice.id}\n`);

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
        billing_interval: 'monthly',
      },
    });

    const premiumAnnualPrice = await stripe.prices.create({
      product: premiumProduct.id,
      unit_amount: 238800, // $2,388.00 in cents ($199 × 12)
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      metadata: {
        tier: 'premium',
        billing_interval: 'annual',
        bonus_months: '2', // Pay for 12, get 14
      },
    });

    console.log('✅ Premium tier created');
    console.log(`   Product ID: ${premiumProduct.id}`);
    console.log(`   Monthly Price ID: ${premiumPrice.id}`);
    console.log(`   Annual Price ID: ${premiumAnnualPrice.id}\n`);

    // Print summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 All products created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📝 Add these to your .env.local file:\n');
    console.log('# Monthly prices');
    console.log(`STRIPE_PRICE_STARTER=${starterPrice.id}`);
    console.log(`STRIPE_PRICE_STANDARD=${standardPrice.id}`);
    console.log(`STRIPE_PRICE_PREMIUM=${premiumPrice.id}`);
    console.log('\n# Annual prices (Pay 12 months, get 14)');
    console.log(`STRIPE_PRICE_STARTER_ANNUAL=${starterAnnualPrice.id}`);
    console.log(`STRIPE_PRICE_STANDARD_ANNUAL=${standardAnnualPrice.id}`);
    console.log(`STRIPE_PRICE_PREMIUM_ANNUAL=${premiumAnnualPrice.id}`);
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
