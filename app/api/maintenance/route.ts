import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import { sendEmail } from '@/lib/email';

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

    // Task 5: Comprehensive Health Checks
    const healthCheckStart = Date.now();
    const healthResults: string[] = [];
    let healthCheckFailed = false;

    try {
      // 1. Supabase Database Health Check
      try {
        const { data, error: dbError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);

        if (dbError) throw new Error(`Database query failed: ${dbError.message}`);
        healthResults.push('✓ Supabase database connection');
      } catch (dbErr: any) {
        healthResults.push(`✗ Supabase database: ${dbErr.message}`);
        healthCheckFailed = true;
      }

      // 2. Supabase Auth Health Check
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 1,
        });

        if (authError) throw new Error(`Auth service error: ${authError.message}`);
        healthResults.push('✓ Supabase authentication service');
      } catch (authErr: any) {
        healthResults.push(`✗ Supabase auth: ${authErr.message}`);
        healthCheckFailed = true;
      }

      // 3. Stripe API Health Check
      try {
        // Test Stripe connection by retrieving account info
        const account = await stripe.accounts.retrieve();
        if (!account || !account.id) throw new Error('Invalid account response');
        healthResults.push(`✓ Stripe API (Account: ${account.business_profile?.name || account.id})`);
      } catch (stripeErr: any) {
        healthResults.push(`✗ Stripe API: ${stripeErr.message}`);
        healthCheckFailed = true;
      }

      // 4. Stripe Price IDs Check
      try {
        const priceIds = [
          process.env.STRIPE_PRICE_STARTER,
          process.env.STRIPE_PRICE_STANDARD,
          process.env.STRIPE_PRICE_PREMIUM,
          process.env.STRIPE_PRICE_STARTER_ANNUAL,
          process.env.STRIPE_PRICE_STANDARD_ANNUAL,
          process.env.STRIPE_PRICE_PREMIUM_ANNUAL,
        ];

        const missingPrices = priceIds.filter(id => !id);
        if (missingPrices.length > 0) {
          throw new Error(`${missingPrices.length} price IDs not configured`);
        }

        // Verify at least one price ID actually exists in Stripe
        const testPrice = await stripe.prices.retrieve(process.env.STRIPE_PRICE_STARTER!);
        if (!testPrice) throw new Error('Price ID verification failed');

        healthResults.push('✓ Stripe price IDs configured');
      } catch (priceErr: any) {
        healthResults.push(`✗ Stripe prices: ${priceErr.message}`);
        healthCheckFailed = true;
      }

      // 5. Email Service (Resend) Health Check
      try {
        if (!process.env.RESEND_API_KEY) {
          throw new Error('RESEND_API_KEY not configured');
        }
        // Note: We don't send a test email to avoid spam
        // Just verify the API key is set
        healthResults.push('✓ Email service (Resend API key configured)');
      } catch (emailErr: any) {
        healthResults.push(`✗ Email service: ${emailErr.message}`);
        healthCheckFailed = true;
      }

      // 6. Environment Variables Check
      try {
        const requiredEnvVars = [
          'NEXT_PUBLIC_SUPABASE_URL',
          'NEXT_PUBLIC_SUPABASE_ANON_KEY',
          'SUPABASE_SERVICE_ROLE_KEY',
          'STRIPE_SECRET_KEY',
          'STRIPE_WEBHOOK_SECRET',
          'CRON_SECRET',
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
          throw new Error(`Missing: ${missingVars.join(', ')}`);
        }

        healthResults.push('✓ Environment variables complete');
      } catch (envErr: any) {
        healthResults.push(`✗ Environment vars: ${envErr.message}`);
        healthCheckFailed = true;
      }

      // 7. Webhook Events Log Check (verify recent activity)
      try {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const { data: recentWebhooks, error: webhookError } = await supabase
          .from('webhook_events')
          .select('count')
          .gte('created_at', oneDayAgo.toISOString());

        if (webhookError) throw webhookError;

        const webhookCount = recentWebhooks?.[0]?.count || 0;
        healthResults.push(`✓ Webhook logging active (${webhookCount} events last 24h)`);
      } catch (webhookErr: any) {
        // This is a warning, not a critical error
        healthResults.push(`⚠ Webhook logging: ${webhookErr.message}`);
      }

      results.push({
        task: 'Comprehensive Health Checks',
        status: healthCheckFailed ? 'error' : 'success',
        duration: Date.now() - healthCheckStart,
        details: healthResults.join('\n'),
      });
    } catch (error: any) {
      results.push({
        task: 'Comprehensive Health Checks',
        status: 'error',
        duration: Date.now() - healthCheckStart,
        error: error.message,
        details: healthResults.join('\n'),
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
  // Log to console always
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

  // Check if any tasks failed
  const failedTasks = results.filter(r => r.status === 'error');
  const hasFailures = failedTasks.length > 0;

  // Get notification email from environment or use default
  const notificationEmail = process.env.MAINTENANCE_ALERT_EMAIL || 'james@voyagriq.com';

  // Only send email if there are failures or if it's configured to always send
  const alwaysSendReport = process.env.MAINTENANCE_ALWAYS_EMAIL === 'true';

  if (!hasFailures && !alwaysSendReport) {
    console.log('✓ All tasks successful. No alert email sent.');
    return;
  }

  try {
    // Build HTML email
    const statusEmoji = hasFailures ? '🚨' : '✅';
    const statusText = hasFailures ? 'FAILED' : 'SUCCESS';
    const statusColor = hasFailures ? '#dc2626' : '#16a34a';

    let tasksHtml = '';
    results.forEach((result) => {
      const statusIcon = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⚠️';
      const rowColor = result.status === 'error' ? '#fef2f2' : '#ffffff';

      tasksHtml += `
        <tr style="background-color: ${rowColor};">
          <td style="padding: 12px; border: 1px solid #e5e7eb;">
            ${statusIcon} ${result.task}
          </td>
          <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center;">
            <span style="color: ${result.status === 'error' ? '#dc2626' : '#16a34a'}; font-weight: bold;">
              ${result.status.toUpperCase()}
            </span>
          </td>
          <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center;">
            ${result.duration}ms
          </td>
        </tr>
        ${result.details ? `
        <tr style="background-color: ${rowColor};">
          <td colspan="3" style="padding: 8px 12px; border: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            ${result.details.split('\n').join('<br>')}
          </td>
        </tr>
        ` : ''}
        ${result.error ? `
        <tr style="background-color: #fef2f2;">
          <td colspan="3" style="padding: 8px 12px; border: 1px solid #e5e7eb; font-size: 12px; color: #dc2626;">
            <strong>Error:</strong> ${result.error}
          </td>
        </tr>
        ` : ''}
      `;
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">${statusEmoji} VoyagrIQ Maintenance Report</h1>
      <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">
        ${new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
      </p>
    </div>

    <!-- Status Badge -->
    <div style="background-color: white; padding: 20px; text-align: center; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
      <div style="display: inline-block; background-color: ${statusColor}; color: white; padding: 8px 24px; border-radius: 20px; font-weight: bold; font-size: 16px;">
        ${statusText}
      </div>
      <p style="margin: 12px 0 0; color: #6b7280; font-size: 14px;">
        Total Duration: ${(duration / 1000 / 60).toFixed(2)} minutes
      </p>
    </div>

    <!-- Tasks Table -->
    <div style="background-color: white; padding: 20px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
      <h2 style="margin: 0 0 16px; font-size: 18px; color: #111827;">Task Results</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left; font-weight: 600; color: #374151;">Task</th>
            <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: center; font-weight: 600; color: #374151;">Status</th>
            <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: center; font-weight: 600; color: #374151;">Duration</th>
          </tr>
        </thead>
        <tbody>
          ${tasksHtml}
        </tbody>
      </table>
    </div>

    ${hasFailures ? `
    <!-- Warning -->
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-top: 20px;">
      <p style="margin: 0; color: #991b1b; font-size: 14px;">
        <strong>⚠️ Action Required:</strong> One or more maintenance tasks failed. Please review the errors above and take corrective action.
      </p>
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="text-align: center; padding: 20px 0; color: #6b7280; font-size: 12px;">
      <p style="margin: 0;">This is an automated maintenance report from VoyagrIQ</p>
      <p style="margin: 8px 0 0;">Running every Sunday at 10:00 AM UTC</p>
    </div>

  </div>
</body>
</html>
    `;

    const subject = hasFailures
      ? `🚨 VoyagrIQ Maintenance Alert: ${failedTasks.length} Task(s) Failed`
      : '✅ VoyagrIQ Weekly Maintenance Report';

    await sendEmail({
      to: notificationEmail,
      subject,
      html,
      from: 'VoyagrIQ Maintenance <noreply@voyagriq.com>',
    });

    console.log(`✓ Maintenance report sent to ${notificationEmail}`);
  } catch (emailError: any) {
    console.error('Failed to send maintenance report email:', emailError);
  }
}
