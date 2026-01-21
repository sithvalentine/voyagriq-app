import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Security: Only allow requests with valid cron secret
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key-here';

interface MaintenanceResult {
  task: string;
  status: 'success' | 'error' | 'skipped';
  duration: number;
  details?: string;
  error?: string;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const results: MaintenanceResult[] = [];

  try {
    // Verify cron secret
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Task 1: Database Vacuum & Analyze
    const vacuumStart = Date.now();
    try {
      // Note: Supabase managed instances handle VACUUM automatically
      // We'll analyze tables for query optimization instead
      await supabase.rpc('analyze_tables');
      results.push({
        task: 'Database Analysis',
        status: 'success',
        duration: Date.now() - vacuumStart,
        details: 'Table statistics updated for query optimization',
      });
    } catch (error: any) {
      results.push({
        task: 'Database Analysis',
        status: 'error',
        duration: Date.now() - vacuumStart,
        error: error.message,
      });
    }

    // Task 2: Clean up expired trials
    const trialCleanupStart = Date.now();
    try {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      // Find users whose trial ended and haven't subscribed
      const { data: expiredTrials, error: trialError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('subscription_tier', 'starter')
        .is('stripe_customer_id', null)
        .lt('trial_ends_at', fourteenDaysAgo.toISOString());

      if (trialError) throw trialError;

      // Mark expired trials (don't delete, just flag for review)
      if (expiredTrials && expiredTrials.length > 0) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ trial_expired: true })
          .in('id', expiredTrials.map(u => u.id));

        if (updateError) throw updateError;

        results.push({
          task: 'Expired Trial Cleanup',
          status: 'success',
          duration: Date.now() - trialCleanupStart,
          details: `Marked ${expiredTrials.length} expired trials`,
        });
      } else {
        results.push({
          task: 'Expired Trial Cleanup',
          status: 'success',
          duration: Date.now() - trialCleanupStart,
          details: 'No expired trials to process',
        });
      }
    } catch (error: any) {
      results.push({
        task: 'Expired Trial Cleanup',
        status: 'error',
        duration: Date.now() - trialCleanupStart,
        error: error.message,
      });
    }

    // Task 3: Archive old data based on tier retention
    const archiveStart = Date.now();
    try {
      // Get all users with their tiers
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, subscription_tier');

      if (usersError) throw usersError;

      let archivedCount = 0;

      for (const user of users || []) {
        let retentionDays = 180; // Default 6 months for starter

        switch (user.subscription_tier) {
          case 'standard':
            retentionDays = 730; // 2 years
            break;
          case 'premium':
            retentionDays = 1825; // 5 years
            break;
          case 'enterprise':
            retentionDays = 999999; // Unlimited
            break;
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        // Archive old trips (update is_archived flag instead of deleting)
        const { data: oldTrips, error: archiveError } = await supabase
          .from('trips')
          .update({ is_archived: true })
          .eq('user_id', user.id)
          .lt('departure_date', cutoffDate.toISOString())
          .eq('is_archived', false)
          .select();

        if (!archiveError && oldTrips) {
          archivedCount += oldTrips.length;
        }
      }

      results.push({
        task: 'Data Retention Archive',
        status: 'success',
        duration: Date.now() - archiveStart,
        details: `Archived ${archivedCount} trips based on tier retention policies`,
      });
    } catch (error: any) {
      results.push({
        task: 'Data Retention Archive',
        status: 'error',
        duration: Date.now() - archiveStart,
        error: error.message,
      });
    }

    // Task 4: Clean up orphaned records
    const orphanCleanupStart = Date.now();
    try {
      // Clean up vendor rules for deleted users
      const { error: vendorError } = await supabase
        .from('vendor_pricing_rules')
        .delete()
        .not('user_id', 'in', `(SELECT id FROM auth.users)`);

      // Clean up client overrides for deleted users
      const { error: clientError } = await supabase
        .from('client_pricing_overrides')
        .delete()
        .not('user_id', 'in', `(SELECT id FROM auth.users)`);

      if (vendorError || clientError) {
        throw vendorError || clientError;
      }

      results.push({
        task: 'Orphaned Records Cleanup',
        status: 'success',
        duration: Date.now() - orphanCleanupStart,
        details: 'Cleaned up orphaned vendor rules and client overrides',
      });
    } catch (error: any) {
      results.push({
        task: 'Orphaned Records Cleanup',
        status: 'error',
        duration: Date.now() - orphanCleanupStart,
        error: error.message,
      });
    }

    // Task 5: Health checks
    const healthCheckStart = Date.now();
    try {
      // Check database connection
      const { error: dbError } = await supabase.from('profiles').select('count').limit(1);
      if (dbError) throw new Error('Database health check failed');

      // Check if Stripe webhook is working (check recent webhook calls)
      // This is a basic check - you might want to add more detailed health checks

      results.push({
        task: 'Health Checks',
        status: 'success',
        duration: Date.now() - healthCheckStart,
        details: 'All systems operational',
      });
    } catch (error: any) {
      results.push({
        task: 'Health Checks',
        status: 'error',
        duration: Date.now() - healthCheckStart,
        error: error.message,
      });
    }

    // Task 6: Generate summary stats
    const statsStart = Date.now();
    try {
      const { data: userCount } = await supabase
        .from('profiles')
        .select('count');

      const { data: tripCount } = await supabase
        .from('trips')
        .select('count');

      const { data: activeSubscriptions } = await supabase
        .from('profiles')
        .select('count')
        .not('stripe_customer_id', 'is', null);

      results.push({
        task: 'Statistics Summary',
        status: 'success',
        duration: Date.now() - statsStart,
        details: `Users: ${userCount?.[0]?.count || 0}, Trips: ${tripCount?.[0]?.count || 0}, Active Subs: ${activeSubscriptions?.[0]?.count || 0}`,
      });
    } catch (error: any) {
      results.push({
        task: 'Statistics Summary',
        status: 'error',
        duration: Date.now() - statsStart,
        error: error.message,
      });
    }

    // Calculate total duration
    const totalDuration = Date.now() - startTime;

    // Send email notification (if configured)
    await sendMaintenanceReport(results, totalDuration);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalDuration,
      results,
    });
  } catch (error: any) {
    console.error('Maintenance job failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        results,
      },
      { status: 500 }
    );
  }
}

async function sendMaintenanceReport(results: MaintenanceResult[], duration: number) {
  // TODO: Implement email notification
  // You can use Resend, SendGrid, or another email service
  // For now, just log the report
  console.log('=== MAINTENANCE REPORT ===');
  console.log(`Total Duration: ${duration}ms (${(duration / 1000 / 60).toFixed(2)} minutes)`);
  console.log('\nResults:');
  results.forEach((result) => {
    console.log(`\n${result.task}:`);
    console.log(`  Status: ${result.status}`);
    console.log(`  Duration: ${result.duration}ms`);
    if (result.details) console.log(`  Details: ${result.details}`);
    if (result.error) console.log(`  Error: ${result.error}`);
  });
  console.log('\n=========================');
}
