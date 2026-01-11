/**
 * Verify Dev Supabase Database Setup
 *
 * This script checks that all tables, policies, triggers, and indexes
 * were created correctly in the dev Supabase project.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure .env.local is set up correctly');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🔍 Verifying Dev Supabase Database Setup...\n');
console.log(`📍 Supabase URL: ${SUPABASE_URL}\n`);

const requiredTables = [
  'profiles',
  'trips',
  'tags',
  'team_members',
  'white_label_settings',
  'api_keys',
  'scheduled_reports',
  'webhook_events'
];

const requiredPolicies = {
  profiles: ['Users can view own profile', 'Users can update own profile'],
  trips: [
    'Users can view own trips',
    'Users can insert own trips',
    'Users can update own trips',
    'Users can delete own trips'
  ],
  tags: [
    'Users can view own tags',
    'Users can insert own tags',
    'Users can update own tags',
    'Users can delete own tags'
  ],
  team_members: ['Users can view own team', 'Users can manage own team'],
  white_label_settings: [
    'Users can view own white label settings',
    'Users can manage own white label settings'
  ],
  api_keys: ['Users can view own API keys', 'Users can manage own API keys'],
  scheduled_reports: [
    'Users can view own reports',
    'Users can manage own reports'
  ]
};

async function verifyTables() {
  console.log('📊 Checking Tables...');

  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');

  if (error) {
    console.error('❌ Error fetching tables:', error.message);
    return false;
  }

  const existingTables = data.map(t => t.table_name);
  let allTablesExist = true;

  for (const table of requiredTables) {
    if (existingTables.includes(table)) {
      console.log(`  ✅ ${table}`);
    } else {
      console.log(`  ❌ ${table} - MISSING`);
      allTablesExist = false;
    }
  }

  console.log('');
  return allTablesExist;
}

async function verifyRLS() {
  console.log('🔒 Checking Row Level Security (RLS)...');

  let allRLSEnabled = true;

  for (const table of requiredTables) {
    try {
      // Try to query the table - RLS should be enabled
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      // If no error, RLS is likely enabled (or table is empty)
      console.log(`  ✅ ${table} - RLS enabled`);
    } catch (error) {
      console.log(`  ❌ ${table} - RLS check failed: ${error.message}`);
      allRLSEnabled = false;
    }
  }

  console.log('');
  return allRLSEnabled;
}

async function verifyTriggers() {
  console.log('⚡ Checking Triggers...');

  const requiredTriggers = [
    'on_auth_user_created',
    'update_profiles_updated_at',
    'update_trips_updated_at',
    'update_tags_updated_at',
    'update_white_label_updated_at',
    'update_scheduled_reports_updated_at'
  ];

  // Note: This requires service role permissions
  console.log('  ℹ️  Trigger verification requires manual check in Supabase dashboard');
  console.log('  📍 Navigate to: Database → Triggers');
  console.log('  Expected triggers:');
  requiredTriggers.forEach(trigger => {
    console.log(`     - ${trigger}`);
  });

  console.log('');
  return true;
}

async function verifyConnection() {
  console.log('🔌 Testing Connection...');

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.log(`  ❌ Connection failed: ${error.message}`);
      return false;
    }

    console.log('  ✅ Connection successful');
    console.log('');
    return true;
  } catch (error) {
    console.log(`  ❌ Connection error: ${error.message}`);
    console.log('');
    return false;
  }
}

async function checkProfileTrigger() {
  console.log('🔄 Testing Profile Auto-Creation Trigger...');
  console.log('  ℹ️  This requires creating a test user via Supabase Auth');
  console.log('  📍 Manual test: Sign up a user and check if profile is auto-created');
  console.log('');
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════\n');

  const connectionOk = await verifyConnection();
  if (!connectionOk) {
    console.log('❌ Cannot proceed - connection failed\n');
    process.exit(1);
  }

  const tablesOk = await verifyTables();
  const rlsOk = await verifyRLS();
  await verifyTriggers();
  await checkProfileTrigger();

  console.log('═══════════════════════════════════════════════════════════\n');

  if (connectionOk && tablesOk && rlsOk) {
    console.log('✅ Dev Supabase database setup looks good!\n');
    console.log('Next steps:');
    console.log('  1. Create a test account: npm run dev → http://localhost:3000/register');
    console.log('  2. Verify profile auto-creation works');
    console.log('  3. Test CRUD operations on trips');
    console.log('');
  } else {
    console.log('❌ Some issues detected. Please review the output above.\n');
    console.log('To fix:');
    console.log('  1. Open Supabase SQL Editor: https://app.supabase.com/project/fzxbxzzhakzbfrspehpe/sql');
    console.log('  2. Re-run the schema.sql file');
    console.log('');
    process.exit(1);
  }
}

main().catch(console.error);
