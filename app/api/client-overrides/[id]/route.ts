import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/client-overrides/[id] - Get a specific client pricing override
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
      .from('client_pricing_overrides')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Client override not found' }, { status: 404 });
      }
      console.error('Error fetching client override:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ override: data });
  } catch (error: any) {
    console.error('GET /api/client-overrides/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/client-overrides/[id] - Update a client pricing override
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
    if (body.client_type) {
      const validClientTypes = ['individual', 'corporate', 'group'];
      if (!validClientTypes.includes(body.client_type)) {
        return NextResponse.json({ error: 'Invalid client_type' }, { status: 400 });
      }
    }

    if (body.override_type) {
      const validOverrideTypes = ['commission_rate', 'markup', 'discount', 'flat_fee'];
      if (!validOverrideTypes.includes(body.override_type)) {
        return NextResponse.json({ error: 'Invalid override_type' }, { status: 400 });
      }
    }

    // Build update object
    const updateData: any = {};

    if (body.client_name !== undefined) updateData.client_name = body.client_name.trim();
    if (body.client_id !== undefined) updateData.client_id = body.client_id || null;
    if (body.client_type !== undefined) updateData.client_type = body.client_type || null;
    if (body.override_type !== undefined) updateData.override_type = body.override_type;
    if (body.override_value !== undefined) updateData.override_value = parseFloat(body.override_value);
    if (body.description !== undefined) updateData.description = body.description || null;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.effective_from !== undefined) updateData.effective_from = body.effective_from || null;
    if (body.effective_until !== undefined) updateData.effective_until = body.effective_until || null;

    const { data, error } = await supabase
      .from('client_pricing_overrides')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Client override not found' }, { status: 404 });
      }
      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'An override for this client already exists' },
          { status: 409 }
        );
      }
      console.error('Error updating client override:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ override: data });
  } catch (error: any) {
    console.error('PATCH /api/client-overrides/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/client-overrides/[id] - Delete a client pricing override
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
      .from('client_pricing_overrides')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting client override:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/client-overrides/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
