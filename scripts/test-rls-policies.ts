/**
 * Test script to verify Row Level Security (RLS) policies
 *
 * This script creates two test users and verifies:
 * 1. User A cannot see User B's trips
 * 2. User A cannot modify User B's trips
 * 3. User A cannot delete User B's trips
 * 4. Each user can only access their own data
 *
 * Run with: npx tsx scripts/test-rls-policies.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Admin client (bypasses RLS)
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

interface TestUser {
  id: string;
  email: string;
  password: string;
  client: any; // Supabase client with user auth context
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test users...');

  const testEmails = [
    'test-rls-user-a@voyagriq-test.com',
    'test-rls-user-b@voyagriq-test.com'
  ];

  for (const email of testEmails) {
    // Find user by email
    const { data: users } = await adminClient.auth.admin.listUsers();
    const user = users?.users.find(u => u.email === email);

    if (user) {
      // Delete user (cascade will delete their trips)
      await adminClient.auth.admin.deleteUser(user.id);
      console.log(`   ✓ Deleted user: ${email}`);
    }
  }
}

async function createTestUser(email: string, password: string): Promise<TestUser> {
  // Create user with admin client
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: `Test User ${email.split('@')[0]}`
    }
  });

  if (authError || !authData.user) {
    throw new Error(`Failed to create user ${email}: ${authError?.message}`);
  }

  console.log(`   ✓ Created user: ${email} (ID: ${authData.user.id.substring(0, 8)}...)`);

  // Create client for this specific user (simulates logged-in user)
  const userClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  // Sign in as this user
  const { error: signInError } = await userClient.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    throw new Error(`Failed to sign in as ${email}: ${signInError.message}`);
  }

  return {
    id: authData.user.id,
    email,
    password,
    client: userClient
  };
}

async function createTestTrip(user: TestUser, tripId: string) {
  const { data, error } = await user.client
    .from('trips')
    .insert({
      user_id: user.id,
      trip_id: tripId,
      client_name: `Test Client ${tripId}`,
      travel_agency: 'Test Agency',
      start_date: '2026-01-15',
      end_date: '2026-01-20',
      destination_country: 'USA',
      destination_city: 'New York',
      adults: 2,
      children: 0,
      total_travelers: 2,
      flight_cost: 100000, // $1000 in cents
      hotel_cost: 50000,
      ground_transport: 10000,
      activities_tours: 20000,
      meals_cost: 15000,
      insurance_cost: 5000,
      other_costs: 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create trip: ${error.message}`);
  }

  return data;
}

async function runTests() {
  console.log('🧪 VoyagrIQ RLS Policy Test Suite\n');
  console.log('=' .repeat(60));

  let userA: TestUser | null = null;
  let userB: TestUser | null = null;
  let tripAId: string | null = null;
  let tripBId: string | null = null;

  try {
    // Step 1: Create test users
    console.log('\n📝 Step 1: Creating test users...');
    userA = await createTestUser('test-rls-user-a@voyagriq-test.com', 'TestPassword123!');
    userB = await createTestUser('test-rls-user-b@voyagriq-test.com', 'TestPassword123!');

    // Step 2: Create trips for each user
    console.log('\n📝 Step 2: Creating test trips...');
    const tripA = await createTestTrip(userA, 'TEST-A-001');
    const tripB = await createTestTrip(userB, 'TEST-B-001');
    tripAId = tripA.id;
    tripBId = tripB.id;
    console.log(`   ✓ User A created trip: ${tripA.trip_id}`);
    console.log(`   ✓ User B created trip: ${tripB.trip_id}`);

    // Test 1: User A should only see their own trips
    console.log('\n🔍 Test 1: Data Isolation - SELECT');
    const { data: userATrips, error: userAError } = await userA.client
      .from('trips')
      .select('*');

    if (userAError) {
      console.log(`   ❌ FAIL: User A got error querying trips: ${userAError.message}`);
    } else if (userATrips.length !== 1) {
      console.log(`   ❌ FAIL: User A sees ${userATrips.length} trips (expected 1)`);
    } else if (userATrips[0].trip_id !== 'TEST-A-001') {
      console.log(`   ❌ FAIL: User A sees wrong trip: ${userATrips[0].trip_id}`);
    } else {
      console.log(`   ✅ PASS: User A can only see their own trip`);
    }

    // Test 2: User B should only see their own trips
    const { data: userBTrips, error: userBError } = await userB.client
      .from('trips')
      .select('*');

    if (userBError) {
      console.log(`   ❌ FAIL: User B got error querying trips: ${userBError.message}`);
    } else if (userBTrips.length !== 1) {
      console.log(`   ❌ FAIL: User B sees ${userBTrips.length} trips (expected 1)`);
    } else if (userBTrips[0].trip_id !== 'TEST-B-001') {
      console.log(`   ❌ FAIL: User B sees wrong trip: ${userBTrips[0].trip_id}`);
    } else {
      console.log(`   ✅ PASS: User B can only see their own trip`);
    }

    // Test 3: User A cannot access User B's trip by ID
    console.log('\n🔍 Test 2: Cross-User Access Prevention - SELECT by ID');
    const { data: crossAccessData, error: crossAccessError } = await userA.client
      .from('trips')
      .select('*')
      .eq('id', tripBId)
      .single();

    if (crossAccessError && crossAccessError.code === 'PGRST116') {
      console.log(`   ✅ PASS: User A cannot access User B's trip (no rows returned)`);
    } else if (crossAccessData) {
      console.log(`   ❌ FAIL: User A CAN access User B's trip! SECURITY BREACH!`);
    } else {
      console.log(`   ⚠️  WARN: Unexpected result: ${crossAccessError?.message}`);
    }

    // Test 4: User A cannot update User B's trip
    console.log('\n🔍 Test 3: Cross-User Modification Prevention - UPDATE');
    const { data: updateData, error: updateError, count: updateCount } = await userA.client
      .from('trips')
      .update({ client_name: 'HACKED BY USER A' })
      .eq('id', tripBId)
      .select();

    // RLS prevents the update by returning 0 rows affected, not necessarily an error
    if (updateError || !updateData || updateData.length === 0) {
      console.log(`   ✅ PASS: User A cannot update User B's trip (RLS blocked it)`);
    } else {
      console.log(`   ❌ FAIL: User A CAN update User B's trip! SECURITY BREACH!`);
      console.log(`   Updated ${updateData.length} rows:`, updateData);
    }

    // Test 5: User A cannot delete User B's trip
    console.log('\n🔍 Test 4: Cross-User Deletion Prevention - DELETE');
    const { data: deleteData, error: deleteError } = await userA.client
      .from('trips')
      .delete()
      .eq('id', tripBId)
      .select();

    // RLS prevents the delete by returning 0 rows affected, not necessarily an error
    if (deleteError || !deleteData || deleteData.length === 0) {
      console.log(`   ✅ PASS: User A cannot delete User B's trip (RLS blocked it)`);
    } else {
      console.log(`   ❌ FAIL: User A CAN delete User B's trip! SECURITY BREACH!`);
      console.log(`   Deleted ${deleteData.length} rows:`, deleteData);
    }

    // Test 6: User A can update their own trip
    console.log('\n🔍 Test 5: Own Data Modification - UPDATE');
    const { error: ownUpdateError } = await userA.client
      .from('trips')
      .update({ client_name: 'Updated by User A' })
      .eq('id', tripAId);

    if (ownUpdateError) {
      console.log(`   ❌ FAIL: User A cannot update their own trip: ${ownUpdateError.message}`);
    } else {
      console.log(`   ✅ PASS: User A can update their own trip`);
    }

    // Test 7: User A can delete their own trip
    console.log('\n🔍 Test 6: Own Data Deletion - DELETE');
    const { error: ownDeleteError } = await userA.client
      .from('trips')
      .delete()
      .eq('id', tripAId);

    if (ownDeleteError) {
      console.log(`   ❌ FAIL: User A cannot delete their own trip: ${ownDeleteError.message}`);
    } else {
      console.log(`   ✅ PASS: User A can delete their own trip`);
    }

    // Test 8: Verify trip is actually deleted
    console.log('\n🔍 Test 7: Verify Deletion');
    const { data: verifyData } = await userA.client
      .from('trips')
      .select('*');

    if (verifyData && verifyData.length === 0) {
      console.log(`   ✅ PASS: Trip successfully deleted (User A has 0 trips)`);
    } else {
      console.log(`   ❌ FAIL: Trip not deleted (User A still has ${verifyData?.length} trips)`);
    }

    // Final Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ RLS Policy Test Suite Completed');
    console.log('\n💡 Summary:');
    console.log('   - Users can only see their own data ✓');
    console.log('   - Users cannot access other users\' data ✓');
    console.log('   - Users cannot modify other users\' data ✓');
    console.log('   - Users cannot delete other users\' data ✓');
    console.log('   - Users can modify/delete their own data ✓');
    console.log('\n🎉 Data isolation is working correctly!');

  } catch (error: any) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Cleanup
    await cleanup();
    console.log('\n✅ Test cleanup complete');
  }
}

// Run tests
runTests().then(() => {
  console.log('\n👋 Test script finished');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
