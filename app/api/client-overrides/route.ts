import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/client-overrides - List all client pricing overrides for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const clientType = searchParams.get('type');
    const isActive = searchParams.get('active');
    const clientName = searchParams.get('client');

    // Build query
    let query = supabase
      .from('client_pricing_overrides')
      .select('*')
      .eq('user_id', user.id);

    if (clientType) {
      query = query.eq('client_type', clientType);
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    if (clientName) {
      query = query.ilike('client_name', `%${clientName}%`);
    }

    query = query.order('client_name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching client overrides:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ overrides: data });
  } catch (error: any) {
    console.error('GET /api/client-overrides error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST /api/client-overrides - Create a new client pricing override
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.client_name || !body.override_type || body.override_value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: client_name, override_type, override_value' },
        { status: 400 }
      );
    }

    // Validate enum values
    const validClientTypes = ['individual', 'corporate', 'group'];
    const validOverrideTypes = ['commission_rate', 'markup', 'discount', 'flat_fee'];

    if (body.client_type && !validClientTypes.includes(body.client_type)) {
      return NextResponse.json({ error: 'Invalid client_type' }, { status: 400 });
    }

    if (!validOverrideTypes.includes(body.override_type)) {
      return NextResponse.json({ error: 'Invalid override_type' }, { status: 400 });
    }

    // Create the override
    const overrideData = {
      user_id: user.id,
      client_name: body.client_name.trim(),
      client_id: body.client_id || null,
      client_type: body.client_type || null,
      override_type: body.override_type,
      override_value: parseFloat(body.override_value),
      description: body.description || null,
      is_active: body.is_active !== undefined ? body.is_active : true,
      effective_from: body.effective_from || null,
      effective_until: body.effective_until || null,
    };

    const { data, error } = await supabase
      .from('client_pricing_overrides')
      .insert([overrideData])
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'An override for this client already exists' },
          { status: 409 }
        );
      }
      console.error('Error creating client override:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ override: data }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/client-overrides error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
