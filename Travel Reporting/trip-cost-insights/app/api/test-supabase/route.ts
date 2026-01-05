// API Route to test Supabase connection
// Visit: http://localhost:3000/api/test-supabase

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const results: any = {
      status: 'testing',
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Present' : '✗ Missing',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Present' : '✗ Missing',
      },
      tables: {},
      connectionTest: null,
    };

    // Test connection by querying profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(0);

    if (error) {
      results.status = 'error';
      results.connectionTest = {
        success: false,
        error: error.message,
      };
      return NextResponse.json(results, { status: 500 });
    }

    results.connectionTest = {
      success: true,
      message: 'Successfully connected to Supabase!',
    };

    // Test all tables
    const tables = [
      'profiles',
      'trips',
      'tags',
      'team_members',
      'white_label_settings',
      'api_keys',
      'scheduled_reports',
    ];

    for (const table of tables) {
      const { error: tableError } = await supabase
        .from(table)
        .select('count')
        .limit(0);

      results.tables[table] = tableError ? '❌ Not Found' : '✅ Exists';
    }

    results.status = 'success';

    return NextResponse.json(results, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: err.message,
      },
      { status: 500 }
    );
  }
}
