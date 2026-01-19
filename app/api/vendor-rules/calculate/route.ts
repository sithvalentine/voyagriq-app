import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// POST /api/vendor-rules/calculate - Calculate pricing adjustment for a vendor
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
    if (!body.vendor_name || !body.vendor_category || body.cost_amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: vendor_name, vendor_category, cost_amount' },
        { status: 400 }
      );
    }

    const vendorName = body.vendor_name.trim();
    const vendorCategory = body.vendor_category;
    const costAmount = parseFloat(body.cost_amount);

    // Use the database function to get pricing adjustment
    const { data, error } = await supabase.rpc('get_vendor_pricing_adjustment', {
      p_user_id: user.id,
      p_vendor_name: vendorName,
      p_vendor_category: vendorCategory,
      p_cost_amount: costAmount,
    });

    if (error) {
      console.error('Error calculating vendor pricing:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // The function returns a single row with adjusted_amount, adjustment_type, rule_id
    const result = data && data.length > 0 ? data[0] : null;

    if (!result || result.adjustment_type === 'none') {
      return NextResponse.json({
        adjusted_amount: costAmount,
        original_amount: costAmount,
        adjustment_amount: 0,
        adjustment_type: 'none',
        rule_id: null,
        rule_applied: false,
      });
    }

    return NextResponse.json({
      adjusted_amount: parseFloat(result.adjusted_amount),
      original_amount: costAmount,
      adjustment_amount: parseFloat(result.adjusted_amount) - costAmount,
      adjustment_type: result.adjustment_type,
      rule_id: result.rule_id,
      rule_applied: true,
    });
  } catch (error: any) {
    console.error('POST /api/vendor-rules/calculate error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
