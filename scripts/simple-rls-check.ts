/**
 * Simple RLS check - creates a manual SQL query through admin API
 * Run with: npx tsx scripts/simple-rls-check.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function checkRLS() {
  console.log('🔍 Checking RLS Status on Tables\n');
  console.log('='.repeat(60));

  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  // Query to check RLS status
  const query = `
    SELECT
      t.tablename,
      t.rowsecurity as rls_enabled,
      (SELECT COUNT(*)
       FROM pg_policies p
       WHERE p.schemaname = 'public'
       AND p.tablename = t.tablename) as policy_count
    FROM pg_tables t
    WHERE t.schemaname = 'public'
    AND t.tablename IN ('profiles', 'trips', 'tags', 'team_members', 'white_label_settings', 'api_keys', 'scheduled_reports')
    ORDER BY t.tablename;
  `;

  try {
    const { data, error } = await adminClient.rpc('exec_sql', { sql: query });

    if (error) {
      console.log('❌ Could not check RLS via RPC (function may not exist)');
      console.log('   Error:', error.message);
      console.log('\n📋 Manual Check Required:');
      console.log('   1. Go to: https://supabase.com/dashboard');
      console.log('   2. Select your project');
      console.log('   3. Go to SQL Editor');
      console.log('   4. Run this query:\n');
      console.log(query);
      return;
    }

    console.log('\n📊 RLS Status:\n');
    if (data && Array.isArray(data)) {
      data.forEach((row: any) => {
        const status = row.rls_enabled ? '✅ Enabled' : '❌ Disabled';
        console.log(`   ${row.tablename.padEnd(25)} ${status.padEnd(15)} (${row.policy_count} policies)`);
      });
    }

  } catch (err: any) {
    console.log('❌ Error running query:', err.message);
    console.log('\n📋 Please manually check RLS status:');
    console.log('   1. Go to: https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Go to SQL Editor');
    console.log('   4. Run this query:\n');
    console.log(query);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ If all tables show "Enabled" with 2+ policies, RLS is working!');
  console.log('❌ If any show "Disabled" or 0 policies, run the migration files.');
}

checkRLS().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
