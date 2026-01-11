/**
 * Clean ALL Trip Data from Production Database
 *
 * This removes all trips from all users in production.
 * Use this to ensure production starts completely clean.
 */

const { createClient } = require('@supabase/supabase-js');

const PROD_URL = 'https://ossvcumgkwsjqrpngkhy.supabase.co';
const PROD_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zc3ZjdW1na3dzanFycG5na2h5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzEwOTg4MiwiZXhwIjoyMDgyNjg1ODgyfQ.k8mb7aZ3FG2VKgIg9fY1-AWw54qiek7Jdpu16M7X1X8';

const supabase = createClient(PROD_URL, PROD_SERVICE_KEY);

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🗑️  Clean ALL Trip Data from Production');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('🗄️  Database: PRODUCTION (ossvcumgkwsjqrpngkhy)');
  console.log('⚠️  This will delete ALL test trip data');
  console.log('');

  // Get all users
  console.log('📊 Fetching users...\n');
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

  if (usersError) {
    console.error('❌ Error:', usersError.message);
    process.exit(1);
  }

  console.log(`Found ${users.users.length} users in production\n`);

  // Get all trips
  console.log('🎫 Fetching trips...\n');
  const { data: trips, error: tripsError } = await supabase
    .from('trips')
    .select('id, user_id, client_name, destination_country, destination_city, start_date, trip_total_cost');

  if (tripsError) {
    console.error('❌ Error fetching trips:', tripsError.message);
    process.exit(1);
  }

  if (!trips || trips.length === 0) {
    console.log('✅ No trips found! Production is already clean.');
    process.exit(0);
  }

  console.log(`Found ${trips.length} trips to delete\n`);

  // Group trips by user
  const tripsByUser = {};
  for (const trip of trips) {
    if (!tripsByUser[trip.user_id]) {
      tripsByUser[trip.user_id] = [];
    }
    tripsByUser[trip.user_id].push(trip);
  }

  // Show breakdown
  console.log('Trip Breakdown:');
  console.log('─────────────────────────────────────────────────────────');

  for (const [userId, userTrips] of Object.entries(tripsByUser)) {
    const user = users.users.find(u => u.id === userId);
    const email = user ? user.email : 'Unknown user';
    console.log(`${email}: ${userTrips.length} trips`);

    // Show first few trips as examples
    const sampleTrips = userTrips.slice(0, 3);
    for (const trip of sampleTrips) {
      const dest = trip.destination_city ? `${trip.destination_city}, ${trip.destination_country}` : trip.destination_country;
      const cost = trip.trip_total_cost ? `$${(trip.trip_total_cost / 100).toFixed(2)}` : '$0';
      console.log(`  - ${trip.client_name || 'Unknown'} to ${dest} (${trip.start_date}) - ${cost}`);
    }
    if (userTrips.length > 3) {
      console.log(`  ... and ${userTrips.length - 3} more`);
    }
  }
  console.log('');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('⚠️  WARNING: This will delete ALL trips from production!');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('Proceeding with deletion...\n');

  // Delete all trips
  const { error: deleteError } = await supabase
    .from('trips')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (neq with impossible ID)

  if (deleteError) {
    console.error('❌ Error deleting trips:', deleteError.message);
    process.exit(1);
  }

  console.log('✅ All trips deleted successfully!\n');

  // Verify
  const { data: remainingTrips, error: verifyError } = await supabase
    .from('trips')
    .select('id');

  if (verifyError) {
    console.error('⚠️  Error verifying:', verifyError.message);
  } else {
    console.log(`Verification: ${remainingTrips.length} trips remaining\n`);
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 CLEANUP COMPLETE');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('✅ Production database is now clean');
  console.log(`✅ Deleted ${trips.length} test trips`);
  console.log(`✅ User accounts remain intact (${users.users.length} users)`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Verify at https://voyagriq.com');
  console.log('  2. Log in with james@mintgoldwyn.com');
  console.log('  3. Should see empty trips list');
  console.log('  4. Ready for real customer data only');
  console.log('');
}

main().catch(console.error);
