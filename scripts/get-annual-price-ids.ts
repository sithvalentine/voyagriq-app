/**
 * Get annual price IDs from Stripe
 * Run with: npx tsx scripts/get-annual-price-ids.ts
 */

import * as dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config({ path: '.env.local' });

async function getAnnualPriceIds() {
  console.log('🔍 Fetching Annual Price IDs from Stripe\n');
  console.log('='.repeat(60));

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
  });

  try {
    // Get all products
    const products = await stripe.products.list({ limit: 10, active: true });

    console.log('\n📦 Found Products:\n');

    for (const product of products.data) {
      // Get prices for this product
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
      });

      console.log(`${product.name} (${product.id})`);

      for (const price of prices.data) {
        const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : 'N/A';
        const currency = price.currency.toUpperCase();
        const interval = price.recurring?.interval || 'one-time';
        const intervalCount = price.recurring?.interval_count || 1;

        console.log(`  - $${amount} ${currency} per ${intervalCount > 1 ? intervalCount + ' ' : ''}${interval}${intervalCount > 1 ? 's' : ''}`);
        console.log(`    Price ID: ${price.id}`);
      }
      console.log('');
    }

    // Find annual prices specifically
    console.log('='.repeat(60));
    console.log('\n📋 Annual Price IDs for .env:\n');

    const annualPrices: { [key: string]: string } = {};

    for (const product of products.data) {
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
      });

      for (const price of prices.data) {
        if (price.recurring?.interval === 'year') {
          const productName = product.name.toLowerCase();

          if (productName.includes('starter')) {
            annualPrices['STRIPE_PRICE_STARTER_ANNUAL'] = price.id;
          } else if (productName.includes('standard')) {
            annualPrices['STRIPE_PRICE_STANDARD_ANNUAL'] = price.id;
          } else if (productName.includes('premium')) {
            annualPrices['STRIPE_PRICE_PREMIUM_ANNUAL'] = price.id;
          }
        }
      }
    }

    // Print for easy copy-paste
    if (Object.keys(annualPrices).length > 0) {
      console.log('Copy these to your Vercel environment variables:\n');
      for (const [key, value] of Object.entries(annualPrices)) {
        console.log(`${key}=${value}`);
      }
    } else {
      console.log('⚠️  No annual prices found!');
      console.log('You need to create annual prices in Stripe Dashboard.');
      console.log('\nGo to: https://dashboard.stripe.com/test/products');
      console.log('For each product, click "Add another price" and create a yearly price.');
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }
}

getAnnualPriceIds()
  .then(() => {
    console.log('\n✅ Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
