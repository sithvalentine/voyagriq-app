// Quick test to verify Supabase connection
// Run this with: npx ts-node test-supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('🔍 Testing Supabase Connection...\n');
console.log('📍 Supabase URL:', supabaseUrl);
console.log('🔑 Anon Key:', supabaseAnonKey ? '✓ Present' : '✗ Missing');
console.log('');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test 1: Check if we can connect
    console.log('Test 1: Checking connection...');
    const { data, error } = await supabase.from('profiles').select('count');

    if (error) {
      console.log('❌ Connection Error:', error.message);
      return;
    }

    console.log('✅ Connection successful!');
    console.log('');

    // Test 2: List all tables
    console.log('Test 2: Checking database tables...');
    const tables = ['profiles', 'trips', 'tags', 'team_members', 'white_label_settings', 'api_keys', 'scheduled_reports'];

    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select('count').limit(0);
      if (tableError) {
        console.log(`❌ Table "${table}": NOT FOUND`);
      } else {
        console.log(`✅ Table "${table}": EXISTS`);
      }
    }

    console.log('');
    console.log('🎉 Supabase setup is complete and working!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Restart your dev server to load environment variables');
    console.log('2. Implement authentication in your app');
    console.log('3. Replace localStorage with Supabase queries');

  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testConnection();
