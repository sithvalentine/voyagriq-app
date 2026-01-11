/**
 * CRITICAL: Clean Test Accounts from Production Database
 *
 * This script removes all test accounts from the production Supabase database.
 * Use this to clean up production before launch.
 *
 * WARNING: This will permanently delete user accounts and their data!
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// PRODUCTION Supabase credentials
const PROD_URL = 'https://ossvcumgkwsjqrpngkhy.supabase.co';
const PROD_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zc3ZjdW1na3dzanFycG5na2h5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzEwOTg4MiwiZXhwIjoyMDgyNjg1ODgyfQ.k8mb7aZ3FG2VKgIg9fY1-AWw54qiek7Jdpu16M7X1X8';

const supabase = createClient(PROD_URL, PROD_SERVICE_KEY);

// Patterns that identify test accounts
const TEST_PATTERNS = [
  /^test\+/i,           // test+anything@...
  /^james\+test/i,      // james+test...@...
  /^james\+\w+@mintgoldwyn\.com$/i, // james+anything@mintgoldwyn.com
  /^test@test\.com$/i,  // test@test.com
  /^test@example\.com$/i, // test@example.com
  /@test\.com$/i,       // anything@test.com
  /\+test\d+@/i,        // anything+test1@...
];

// Emails to KEEP (real users - adjust this list!)
const PROTECTED_EMAILS = [
  'mintgoldwyn@gmail.com', // Admin account - KEEP
  // Add any real customer emails here that should NOT be deleted
];

function isTestAccount(email) {
  // Protect explicitly listed emails
  if (PROTECTED_EMAILS.includes(email)) {
    return false;
  }

  // Check if email matches any test pattern
  return TEST_PATTERNS.some(pattern => pattern.test(email));
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }))
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('⚠️  PRODUCTION DATABASE CLEANUP');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('🗄️  Database: PRODUCTION (ossvcumgkwsjqrpngkhy)');
  console.log('🔒 URL:', PROD_URL);
  console.log('');

  console.log('⚠️  WARNING: This will PERMANENTLY DELETE test accounts!');
  console.log('');

  // Fetch all users
  console.log('📊 Fetching all users from production...\n');
  const { data: users, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('❌ Error fetching users:', error.message);
    process.exit(1);
  }

  console.log(`Total users in production: ${users.users.length}\n`);

  // Identify test accounts
  const testAccounts = users.users.filter(u => isTestAccount(u.email));
  const realAccounts = users.users.filter(u => !isTestAccount(u.email));

  console.log('🧪 Test Accounts to DELETE:', testAccounts.length);
  if (testAccounts.length > 0) {
    console.log('─────────────────────────────────────────────────────────');
    testAccounts.forEach(u => {
      console.log(`  ❌ ${u.email} (created: ${u.created_at.substring(0, 10)})`);
    });
    console.log('');
  }

  console.log('✅ Real Accounts to KEEP:', realAccounts.length);
  if (realAccounts.length > 0) {
    console.log('─────────────────────────────────────────────────────────');
    realAccounts.forEach(u => {
      console.log(`  ✅ ${u.email} (created: ${u.created_at.substring(0, 10)})`);
    });
    console.log('');
  }

  if (testAccounts.length === 0) {
    console.log('✅ No test accounts found! Production database is clean.');
    process.exit(0);
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('⚠️  CONFIRMATION REQUIRED');
  console.log('═══════════════════════════════════════════════════════════\n');

  const answer1 = await askQuestion(`Are you SURE you want to delete ${testAccounts.length} test accounts? (yes/no): `);

  if (answer1.toLowerCase() !== 'yes') {
    console.log('\n❌ Cancelled. No accounts were deleted.');
    process.exit(0);
  }

  const answer2 = await askQuestion(`\nType "DELETE PRODUCTION TEST ACCOUNTS" to confirm: `);

  if (answer2 !== 'DELETE PRODUCTION TEST ACCOUNTS') {
    console.log('\n❌ Cancelled. No accounts were deleted.');
    process.exit(0);
  }

  console.log('\n🗑️  Deleting test accounts from PRODUCTION...\n');

  let deleted = 0;
  let failed = 0;

  for (const user of testAccounts) {
    try {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

      if (deleteError) {
        console.log(`  ❌ Failed to delete ${user.email}: ${deleteError.message}`);
        failed++;
      } else {
        console.log(`  ✅ Deleted ${user.email}`);
        deleted++;
      }
    } catch (e) {
      console.log(`  ❌ Error deleting ${user.email}: ${e.message}`);
      failed++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 CLEANUP RESULTS');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`✅ Successfully deleted: ${deleted} accounts`);
  console.log(`❌ Failed to delete: ${failed} accounts`);
  console.log(`✅ Remaining real accounts: ${realAccounts.length}`);
  console.log('');

  if (deleted > 0) {
    console.log('✅ Production database cleaned!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Verify at: https://app.supabase.com/project/ossvcumgkwsjqrpngkhy/auth/users');
    console.log('  2. All future test accounts should go to DEV database');
    console.log('  3. Production is now ready for real customers only');
  }

  console.log('');
}

main().catch(console.error);
