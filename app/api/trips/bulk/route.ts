import { createClient } from '@supabase/supabase-js';
import { parseImportFile, ParsedTrip } from '@/lib/importParser';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/subscription';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_ROWS_PER_IMPORT = 200; // Maximum rows allowed per import (prevents abuse)

export async function POST(request: NextRequest) {
  try {
    // Get Authorization header (from client-side Supabase)
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[Bulk Import] Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Rate limiting: Limit bulk imports per user to prevent abuse
    const rateLimit = checkRateLimit(user.id, RATE_LIMITS.BULK_PER_USER.limit, RATE_LIMITS.BULK_PER_USER.windowMs);

    if (!rateLimit.allowed) {
      console.warn(`[Bulk Import] Rate limit exceeded for user: ${user.id}`);
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: rateLimit.headers
        }
      );
    }

    // Get user profile to check subscription tier
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const userTier = (profile.subscription_tier || 'starter') as SubscriptionTier;
    const tierInfo = SUBSCRIPTION_TIERS[userTier];

    // Check existing trip count
    const { count: existingTripCount, error: countError } = await supabase
      .from('trips')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      return NextResponse.json(
        { error: 'Failed to check existing trips' },
        { status: 500 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB` },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a CSV or Excel file.' },
        { status: 400 }
      );
    }

    // Parse the file
    const parseResult = await parseImportFile(file, file.type);

    if (!parseResult.success && parseResult.errors.some(e => e.row === 0)) {
      // File-level error (couldn't parse at all)
      return NextResponse.json(
        {
          error: 'Failed to parse file',
          details: parseResult.errors
        },
        { status: 400 }
      );
    }

    // Check maximum row limit to prevent abuse
    if (parseResult.totalRows > MAX_ROWS_PER_IMPORT) {
      return NextResponse.json(
        {
          error: `File contains too many rows. Maximum ${MAX_ROWS_PER_IMPORT} rows allowed per import.`,
          totalRows: parseResult.totalRows,
          limit: MAX_ROWS_PER_IMPORT
        },
        { status: 400 }
      );
    }

    // Check if import would exceed subscription limit
    const totalTripsAfterImport = (existingTripCount || 0) + parseResult.validRows;
    const tripLimit = tierInfo.tripLimit === 'unlimited' ? Infinity : tierInfo.tripLimit;

    if (totalTripsAfterImport > tripLimit) {
      const nextTier = userTier === 'starter' ? 'standard' : userTier === 'standard' ? 'premium' : null;
      const upgradeMessage = nextTier
        ? `Upgrade to ${SUBSCRIPTION_TIERS[nextTier].name} for ${SUBSCRIPTION_TIERS[nextTier].tripLimit} trips.`
        : 'You are already on the highest tier.';

      return NextResponse.json(
        {
          error: `Import would exceed your ${tierInfo.name} plan limit of ${tripLimit} trips. ${upgradeMessage}`,
          currentCount: existingTripCount,
          importCount: parseResult.validRows,
          limit: tripLimit
        },
        { status: 403 }
      );
    }

    // Check for duplicate Trip_IDs in database
    const tripIds = parseResult.trips.map(t => t.trip_id);
    const { data: existingTrips, error: duplicateCheckError } = await supabase
      .from('trips')
      .select('trip_id')
      .eq('user_id', user.id)
      .in('trip_id', tripIds);

    if (duplicateCheckError) {
      return NextResponse.json(
        { error: 'Failed to check for duplicate Trip_IDs' },
        { status: 500 }
      );
    }

    const existingTripIds = new Set(existingTrips?.map(t => t.trip_id) || []);
    const duplicateErrors = parseResult.trips
      .filter(trip => existingTripIds.has(trip.trip_id))
      .map(trip => ({
        row: 0, // We don't have the original row number here
        field: 'Trip_ID',
        message: `Trip_ID "${trip.trip_id}" already exists in your database`,
        value: trip.trip_id
      }));

    // Filter out duplicates
    const tripsToInsert = parseResult.trips.filter(trip => !existingTripIds.has(trip.trip_id));

    // Prepare trips for database insertion
    const dbTrips = tripsToInsert.map(trip => ({
      user_id: user.id,
      trip_id: trip.trip_id,
      client_name: trip.client_name,
      travel_agency: trip.travel_agency || null,
      start_date: trip.start_date,
      end_date: trip.end_date,
      destination_country: trip.destination_country,
      destination_city: trip.destination_city || null,
      adults: trip.adults,
      children: trip.children,
      total_travelers: trip.total_travelers,
      flight_cost: trip.flight_cost,
      hotel_cost: trip.hotel_cost,
      ground_transport: trip.ground_transport,
      activities_tours: trip.activities_tours,
      meals_cost: trip.meals_cost,
      insurance_cost: trip.insurance_cost,
      other_costs: trip.other_costs,
      currency: trip.currency || 'USD',
      commission_rate: trip.commission_rate || null,
      commission_amount: trip.commission_amount || null,
      client_id: trip.client_id || null,
      client_type: trip.client_type || null,
    }));

    // Bulk insert trips to database (Supabase supports batch inserts)
    let insertedCount = 0;
    const insertErrors: any[] = [];

    if (dbTrips.length > 0) {
      // Insert in batches of 1000 (Supabase limit)
      const batchSize = 1000;
      for (let i = 0; i < dbTrips.length; i += batchSize) {
        const batch = dbTrips.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('trips')
          .insert(batch);

        if (insertError) {
          insertErrors.push({
            batch: Math.floor(i / batchSize) + 1,
            message: insertError.message
          });
        } else {
          insertedCount += batch.length;
        }
      }
    }

    // Compile results
    const allErrors = [...parseResult.errors, ...duplicateErrors];

    return NextResponse.json({
      success: insertedCount > 0,
      totalRows: parseResult.totalRows,
      validRows: parseResult.validRows,
      insertedCount,
      skippedCount: duplicateErrors.length,
      failedCount: parseResult.errors.length,
      errors: allErrors,
      insertErrors: insertErrors.length > 0 ? insertErrors : undefined,
      message:
        insertedCount > 0
          ? `Successfully imported ${insertedCount} trip${insertedCount === 1 ? '' : 's'}.`
          : 'No trips were imported.'
    });

  } catch (error: any) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
