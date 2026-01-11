/**
 * PRODUCTION CLEANUP - Auto Mode
 *
 * This version runs WITHOUT confirmation prompts.
 * Use ONLY if you're certain you want to delete test accounts.
 */

const { createClient } = require('@supabase/supabase-js');

// PRODUCTION Supabase credentials
const PROD_URL = 'https://ossvcumgkwsjqrpngkhy.supabase.co';
const PROD_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zc3ZjdW1na3dzanFycG5na2h5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzEwOTg4MiwiZXhwIjoyMDgyNjg1ODgyfQ.k8mb7aZ3FG2VKgIg9fY1-AWw54qiek7Jdpu16M7X1X8';

const supabase = createClient(PROD_URL, PROD_SERVICE_KEY);

// Test account patterns
const TEST_PATTERNS = [
  /^test\+/i,
  /^james\+test/i,
  /^james\+\w+@mintgoldwyn\.com$/i,
  /^test@test\.com$/i,
  /^test@example\.com$/i,
  /@test\.com$/i,
  /\+test\d+@/i,
];

// Protected email - this will NOT be deleted
const PROTECTED_EMAILS = [
  'mintgoldwyn@gmail.com', // Admin account
];

function isTestAccount(email) {
  if (PROTECTED_EMAILS.includes(email)) {
    return false;
  }
  return TEST_PATTERNS.some(pattern => pattern.test(email));
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🗑️  PRODUCTION CLEANUP - AUTO MODE');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('🗄️  Database: PRODUCTION (ossvcumgkwsjqrpngkhy)');
  console.log('🔒 Protected: mintgoldwyn@gmail.com');
  console.log('');

  // Fetch all users
  console.log('📊 Fetching users...\n');
  const { data: users, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  const testAccounts = users.users.filter(u => isTestAccount(u.email));
  const realAccounts = users.users.filter(u => !isTestAccount(u.email));

  console.log(`Total: ${users.users.length} users`);
  console.log(`Test accounts to delete: ${testAccounts.length}`);
  console.log(`Real accounts to keep: ${realAccounts.length}`);
  console.log('');

  if (realAccounts.length > 0) {
    console.log('✅ Keeping:');
    realAccounts.forEach(u => console.log(`   ${u.email}`));
    console.log('');
  }

  if (testAccounts.length === 0) {
    console.log('✅ No test accounts found! Database is clean.');
    process.exit(0);
  }

  console.log('🗑️  Deleting test accounts...\n');

  let deleted = 0;
  let failed = 0;

  for (const user of testAccounts) {
    try {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

      if (deleteError) {
        console.log(`  ❌ Failed: ${user.email}`);
        failed++;
      } else {
        console.log(`  ✅ Deleted: ${user.email}`);
        deleted++;
      }
    } catch (e) {
      console.log(`  ❌ Error: ${user.email}`);
      failed++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 RESULTS');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`✅ Deleted: ${deleted} accounts`);
  console.log(`❌ Failed: ${failed} accounts`);
  console.log(`✅ Kept: ${realAccounts.length} accounts (including mintgoldwyn@gmail.com)`);
  console.log('');

  if (deleted > 0) {
    console.log('✅ Production database cleaned!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Verify: https://app.supabase.com/project/ossvcumgkwsjqrpngkhy/auth/users');
    console.log('  2. Test login with mintgoldwyn@gmail.com on voyagriq.com');
    console.log('  3. All future testing → localhost with dev database');
    console.log('');
  }
}

main().catch(console.error);
