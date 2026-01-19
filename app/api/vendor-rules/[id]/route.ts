import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/vendor-rules/[id] - Get a specific vendor pricing rule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const { data, error } = await supabase
      .from('vendor_pricing_rules')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Vendor rule not found' }, { status: 404 });
      }
      console.error('Error fetching vendor rule:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rule: data });
  } catch (error: any) {
    console.error('GET /api/vendor-rules/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/vendor-rules/[id] - Update a vendor pricing rule
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Validate enum values if provided
    if (body.vendor_category) {
      const validCategories = ['flight', 'hotel', 'ground_transport', 'activities', 'cruise', 'insurance', 'other'];
      if (!validCategories.includes(body.vendor_category)) {
        return NextResponse.json({ error: 'Invalid vendor_category' }, { status: 400 });
      }
    }

    if (body.rule_type) {
      const validRuleTypes = ['markup', 'discount', 'flat_fee', 'negotiated_rate'];
      if (!validRuleTypes.includes(body.rule_type)) {
        return NextResponse.json({ error: 'Invalid rule_type' }, { status: 400 });
      }
    }

    // Build update object
    const updateData: any = {};

    if (body.vendor_name !== undefined) updateData.vendor_name = body.vendor_name.trim();
    if (body.vendor_category !== undefined) updateData.vendor_category = body.vendor_category;
    if (body.rule_type !== undefined) updateData.rule_type = body.rule_type;
    if (body.rule_value !== undefined) updateData.rule_value = parseFloat(body.rule_value);
    if (body.negotiated_description !== undefined) updateData.negotiated_description = body.negotiated_description || null;
    if (body.minimum_booking_amount !== undefined) {
      updateData.minimum_booking_amount = body.minimum_booking_amount ? parseFloat(body.minimum_booking_amount) : null;
    }
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.effective_from !== undefined) updateData.effective_from = body.effective_from || null;
    if (body.effective_until !== undefined) updateData.effective_until = body.effective_until || null;
    if (body.notes !== undefined) updateData.notes = body.notes || null;

    const { data, error } = await supabase
      .from('vendor_pricing_rules')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Vendor rule not found' }, { status: 404 });
      }
      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A rule for this vendor and category already exists' },
          { status: 409 }
        );
      }
      console.error('Error updating vendor rule:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rule: data });
  } catch (error: any) {
    console.error('PATCH /api/vendor-rules/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/vendor-rules/[id] - Delete a vendor pricing rule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const { error } = await supabase
      .from('vendor_pricing_rules')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting vendor rule:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/vendor-rules/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
