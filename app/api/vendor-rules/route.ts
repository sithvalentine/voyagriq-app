import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/vendor-rules - List all vendor pricing rules for the authenticated user
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
    const vendorCategory = searchParams.get('category');
    const isActive = searchParams.get('active');
    const vendorName = searchParams.get('vendor');

    // Build query
    let query = supabase
      .from('vendor_pricing_rules')
      .select('*')
      .eq('user_id', user.id);

    if (vendorCategory) {
      query = query.eq('vendor_category', vendorCategory);
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    if (vendorName) {
      query = query.ilike('vendor_name', `%${vendorName}%`);
    }

    query = query.order('vendor_name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vendor rules:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rules: data });
  } catch (error: any) {
    console.error('GET /api/vendor-rules error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST /api/vendor-rules - Create a new vendor pricing rule
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
    if (!body.vendor_name || !body.vendor_category || !body.rule_type || body.rule_value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: vendor_name, vendor_category, rule_type, rule_value' },
        { status: 400 }
      );
    }

    // Validate enum values
    const validCategories = ['flight', 'hotel', 'ground_transport', 'activities', 'cruise', 'insurance', 'other'];
    const validRuleTypes = ['markup', 'discount', 'flat_fee', 'negotiated_rate'];

    if (!validCategories.includes(body.vendor_category)) {
      return NextResponse.json({ error: 'Invalid vendor_category' }, { status: 400 });
    }

    if (!validRuleTypes.includes(body.rule_type)) {
      return NextResponse.json({ error: 'Invalid rule_type' }, { status: 400 });
    }

    // Create the rule
    const ruleData = {
      user_id: user.id,
      vendor_name: body.vendor_name.trim(),
      vendor_category: body.vendor_category,
      rule_type: body.rule_type,
      rule_value: parseFloat(body.rule_value),
      negotiated_description: body.negotiated_description || null,
      minimum_booking_amount: body.minimum_booking_amount ? parseFloat(body.minimum_booking_amount) : null,
      is_active: body.is_active !== undefined ? body.is_active : true,
      effective_from: body.effective_from || null,
      effective_until: body.effective_until || null,
      notes: body.notes || null,
    };

    const { data, error } = await supabase
      .from('vendor_pricing_rules')
      .insert([ruleData])
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A rule for this vendor and category already exists' },
          { status: 409 }
        );
      }
      console.error('Error creating vendor rule:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rule: data }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/vendor-rules error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
