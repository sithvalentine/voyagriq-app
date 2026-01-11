/**
 * Verify james@mintgoldwyn.com Account Status in Production
 *
 * Checks if the account has Stripe access and is past the paywall
 */

const { createClient } = require('@supabase/supabase-js');

const PROD_URL = 'https://ossvcumgkwsjqrpngkhy.supabase.co';
const PROD_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zc3ZjdW1na3dzanFycG5na2h5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzEwOTg4MiwiZXhwIjoyMDgyNjg1ODgyfQ.k8mb7aZ3FG2VKgIg9fY1-AWw54qiek7Jdpu16M7X1X8';

const supabase = createClient(PROD_URL, PROD_SERVICE_KEY);

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔍 Verifying Production Account Status');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📧 Checking: james@mintgoldwyn.com');
  console.log('🗄️  Database: PRODUCTION (ossvcumgkwsjqrpngkhy)\n');

  // Get all users
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

  if (usersError) {
    console.error('❌ Error fetching users:', usersError.message);
    process.exit(1);
  }

  // Find the user
  const user = users.users.find(u => u.email === 'james@mintgoldwyn.com');

  if (!user) {
    console.log('❌ Account NOT FOUND in production database');
    console.log('');
    console.log('This means:');
    console.log('  - Account was deleted or never existed');
    console.log('  - Cannot log in to voyagriq.com with this email');
    console.log('  - Available to create in dev database');
    console.log('');
    process.exit(0);
  }

  console.log('✅ Account EXISTS in production database\n');
  console.log('Account Details:');
  console.log('─────────────────────────────────────────────────────────');
  console.log('Email:', user.email);
  console.log('User ID:', user.id);
  console.log('Created:', new Date(user.created_at).toLocaleString());
  console.log('Last Sign In:', user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never');
  console.log('');

  // Get profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.log('⚠️  Profile not found or error:', profileError.message);
    console.log('');
    console.log('This means:');
    console.log('  - Account exists but profile not created yet');
    console.log('  - May need to log in once to create profile');
    console.log('');
    process.exit(0);
  }

  console.log('Profile Data:');
  console.log('─────────────────────────────────────────────────────────');
  console.log('Display Name:', profile.display_name || '(not set)');
  console.log('Subscription Tier:', profile.subscription_tier || 'none');
  console.log('Subscription Status:', profile.subscription_status || 'none');
  console.log('Stripe Customer ID:', profile.stripe_customer_id || '(not set)');
  console.log('Stripe Subscription ID:', profile.stripe_subscription_id || '(not set)');
  console.log('Trial Ends:', profile.trial_ends_at ? new Date(profile.trial_ends_at).toLocaleString() : '(no trial)');
  console.log('');

  // Analyze Stripe status
  console.log('═══════════════════════════════════════════════════════════');
  console.log('💳 Stripe Paywall Status');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (profile.stripe_customer_id) {
    console.log('✅ HAS STRIPE CUSTOMER ID');
    console.log(`   Customer: ${profile.stripe_customer_id}`);
    console.log('');
    console.log('This means:');
    console.log('  ✅ Account is past the Stripe paywall');
    console.log('  ✅ Can access full application features');
    console.log('  ✅ Has completed checkout at least once');
    console.log('');

    if (profile.stripe_subscription_id) {
      console.log('✅ HAS ACTIVE SUBSCRIPTION');
      console.log(`   Subscription: ${profile.stripe_subscription_id}`);
      console.log(`   Status: ${profile.subscription_status}`);
      console.log(`   Tier: ${profile.subscription_tier}`);
    } else {
      console.log('⚠️  No active subscription ID');
      console.log('   (May have been cancelled or in trial)');
    }
  } else {
    console.log('❌ NO STRIPE CUSTOMER ID');
    console.log('');
    console.log('This means:');
    console.log('  ❌ Account has NOT completed Stripe checkout');
    console.log('  ❌ Will be blocked by paywall on voyagriq.com');
    console.log('  ℹ️  Likely created before Stripe integration');
    console.log('');
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 Summary');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('Account:', user.email);
  console.log('Location:', 'Production database only');
  console.log('Stripe Status:', profile.stripe_customer_id ? '✅ Past paywall' : '❌ Blocked by paywall');
  console.log('Can Login:', 'Yes, at voyagriq.com');
  console.log('Can Test Production:', profile.stripe_customer_id ? 'Yes' : 'No (paywall blocked)');
  console.log('');

  if (!profile.stripe_customer_id) {
    console.log('💡 To get past paywall on this account:');
    console.log('  1. Log in to https://voyagriq.com');
    console.log('  2. Complete Stripe checkout (use test card in live mode)');
    console.log('  3. Or manually add stripe_customer_id to profile');
    console.log('');
  }
}

main().catch(console.error);
