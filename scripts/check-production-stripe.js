/**
 * Check Production Stripe Configuration
 *
 * This script helps verify what Stripe keys are configured in production
 * by checking the key format and detecting if they're test or live keys.
 */

// Check Stripe key format from environment variables
function checkStripeKeyType(key, keyName) {
  if (!key) {
    console.log(`❌ ${keyName}: NOT SET`);
    return null;
  }

  const isTestKey = key.startsWith('pk_test_') || key.startsWith('sk_test_');
  const isLiveKey = key.startsWith('pk_live_') || key.startsWith('sk_live_');

  if (isTestKey) {
    console.log(`⚠️  ${keyName}: TEST MODE`);
    console.log(`   Key: ${key.substring(0, 20)}...`);
    return 'test';
  } else if (isLiveKey) {
    console.log(`✅ ${keyName}: LIVE MODE`);
    console.log(`   Key: ${key.substring(0, 20)}...`);
    return 'live';
  } else {
    console.log(`❌ ${keyName}: INVALID FORMAT`);
    console.log(`   Key: ${key.substring(0, 20)}...`);
    return 'invalid';
  }
}

function checkPriceId(priceId, priceName) {
  if (!priceId) {
    console.log(`❌ ${priceName}: NOT SET`);
    return null;
  }

  console.log(`✅ ${priceName}: ${priceId}`);
  return priceId;
}

console.log('═══════════════════════════════════════════════════════════');
console.log('🔍 Checking Stripe Configuration');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📊 Current Environment:', process.env.NODE_ENV || 'not set');
console.log('🌐 App URL:', process.env.NEXT_PUBLIC_APP_URL || 'not set');
console.log('');

console.log('🔑 Stripe API Keys:');
console.log('─────────────────────────────────────────────────────────\n');

const publishableType = checkStripeKeyType(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  'Publishable Key'
);
console.log('');

const secretType = checkStripeKeyType(
  process.env.STRIPE_SECRET_KEY,
  'Secret Key'
);
console.log('');

if (publishableType && secretType && publishableType !== secretType) {
  console.log('⚠️  WARNING: Publishable and Secret keys are in different modes!');
  console.log('   This will cause payment failures.');
  console.log('');
}

console.log('💰 Stripe Price IDs:');
console.log('─────────────────────────────────────────────────────────\n');

console.log('Monthly Prices:');
checkPriceId(process.env.STRIPE_PRICE_STARTER, '  Starter');
checkPriceId(process.env.STRIPE_PRICE_STANDARD, '  Standard');
checkPriceId(process.env.STRIPE_PRICE_PREMIUM, '  Premium');
console.log('');

console.log('Annual Prices:');
checkPriceId(process.env.STRIPE_PRICE_STARTER_ANNUAL, '  Starter');
checkPriceId(process.env.STRIPE_PRICE_STANDARD_ANNUAL, '  Standard');
checkPriceId(process.env.STRIPE_PRICE_PREMIUM_ANNUAL, '  Premium');
console.log('');

console.log('🔗 Webhook Configuration:');
console.log('─────────────────────────────────────────────────────────\n');

if (process.env.STRIPE_WEBHOOK_SECRET) {
  console.log('✅ Webhook Secret: SET');
  console.log(`   Secret: ${process.env.STRIPE_WEBHOOK_SECRET.substring(0, 15)}...`);
} else {
  console.log('❌ Webhook Secret: NOT SET');
}
console.log('');

console.log('═══════════════════════════════════════════════════════════');
console.log('📋 Summary:');
console.log('═══════════════════════════════════════════════════════════\n');

if (publishableType === 'test' && secretType === 'test') {
  console.log('⚠️  Stripe is in TEST MODE');
  console.log('   - Users can test checkout flow');
  console.log('   - NO real payments will be processed');
  console.log('   - Use test cards: 4242 4242 4242 4242');
  console.log('');
  console.log('To enable LIVE payments:');
  console.log('   1. Get live keys from Stripe Dashboard (live mode)');
  console.log('   2. Create live products and prices');
  console.log('   3. Update Vercel environment variables');
  console.log('   4. Set up production webhook');
} else if (publishableType === 'live' && secretType === 'live') {
  console.log('✅ Stripe is in LIVE MODE');
  console.log('   - Real payments ARE being processed');
  console.log('   - Real credit cards will be charged');
  console.log('   - Webhook must be configured');
} else {
  console.log('❌ Stripe configuration has ERRORS');
  console.log('   - Check that keys are set correctly');
  console.log('   - Ensure publishable and secret keys match (both test or both live)');
}

console.log('');
console.log('═══════════════════════════════════════════════════════════\n');
