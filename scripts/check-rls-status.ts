/**
 * Quick script to check RLS status on all tables
 * Run with: npx tsx scripts/check-rls-status.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSStatus() {
  console.log('🔍 Checking RLS Status\n');
  console.log('='.repeat(60));

  // Check if RLS is enabled on trips table
  const { data: tables, error: tablesError } = await adminClient
    .from('pg_tables')
    .select('tablename, rowsecurity')
    .eq('schemaname', 'public')
    .eq('tablename', 'trips');

  if (tablesError) {
    console.error('❌ Error checking tables:', tablesError);
    return;
  }

  console.log('\n📊 Table: trips');
  if (tables && tables.length > 0) {
    const table = tables[0];
    console.log(`   RLS Enabled: ${table.rowsecurity ? '✅ YES' : '❌ NO'}`);
  } else {
    console.log('   ❌ Table not found');
  }

  // Check policies on trips table
  let policies: any = null;
  let policiesError: any = null;

  try {
    const result = await adminClient.rpc('get_policies', {
      p_schemaname: 'public',
      p_tablename: 'trips'
    });
    policies = result.data;
    policiesError = result.error;
  } catch (err) {
    // If RPC doesn't exist, try direct query
    try {
      const result = await adminClient
        .from('pg_policies')
        .select('*')
        .eq('schemaname', 'public')
        .eq('tablename', 'trips');
      policies = result.data;
      policiesError = result.error;
    } catch (fallbackErr) {
      policiesError = fallbackErr;
    }
  }

  if (!policiesError && policies) {
    console.log(`\n📋 Policies on trips table: ${policies.length} found`);
    policies.forEach((policy: any) => {
      console.log(`   - ${policy.policyname} (${policy.cmd})`);
    });
  } else {
    console.log('\n⚠️  Could not fetch policies (this might be normal)');
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 To manually check in Supabase SQL Editor, run:');
  console.log(`
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'trips';

SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'trips';
  `);
}

checkRLSStatus().then(() => {
  console.log('\n✅ Check complete');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
